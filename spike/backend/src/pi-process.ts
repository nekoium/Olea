// SPDX-License-Identifier: MIT
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { StringDecoder } from 'node:string_decoder';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';

export type RecordData = Record<string, any>;
export const MAX_RECORD_BYTES = 256 * 1024;
export const MAX_QUEUED_BYTES = 1024 * 1024;

// Split only LF: U+2028/U+2029 are valid inside a JSON string.
export class JsonLines {
  private decoder = new StringDecoder('utf8');
  private buffered = '';
  constructor(private receive: (record: RecordData) => void, private limit = MAX_RECORD_BYTES) {}
  push(chunk: Buffer) {
    this.buffered += this.decoder.write(chunk);
    let newline: number;
    while ((newline = this.buffered.indexOf('\n')) !== -1) {
      const line = this.buffered.slice(0, newline).replace(/\r$/, '');
      this.buffered = this.buffered.slice(newline + 1);
      if (Buffer.byteLength(line) > this.limit) throw new Error('record_limit');
      if (line) this.receive(JSON.parse(line));
    }
    if (Buffer.byteLength(this.buffered) > this.limit) throw new Error('record_limit');
  }
}

export class PiProcess extends EventEmitter {
  readonly child: ChildProcessWithoutNullStreams;
  private pending = new Map<string, { resolve: (value: RecordData) => void; reject: (e: Error) => void; timer: NodeJS.Timeout }>();
  private closing = false;
  stderrBytes = 0;
  readonly startedAt = performance.now();

  constructor(options: { entry: string; cwd: string; args?: string[]; env?: NodeJS.ProcessEnv }) {
    super();
    this.child = spawn(process.execPath, [options.entry, ...(options.args ?? [])], {
      cwd: options.cwd, env: options.env ?? process.env,
      stdio: ['pipe', 'pipe', 'pipe'], detached: process.platform !== 'win32', windowsHide: true,
    });
    const lines = new JsonLines(record => {
      if (record.type === 'response' && this.pending.has(record.id)) {
        const pending = this.pending.get(record.id)!;
        clearTimeout(pending.timer);
        this.pending.delete(record.id);
        record.success ? pending.resolve(record) : pending.reject(new Error('pi_command_failed'));
      }
      this.emit('record', record);
    });
    this.child.stdout.on('data', chunk => {
      try { lines.push(chunk); } catch { this.emit('fault', 'invalid_or_oversize_rpc'); void this.stop(); }
    });
    // Diagnostics can contain provider payloads; count and discard, never forward raw text.
    this.child.stderr.on('data', chunk => { this.stderrBytes += chunk.length; });
    this.child.on('error', () => { this.failPending('pi_start_failed'); this.emit('fault', 'pi_start_failed'); });
    this.child.on('exit', (code, signal) => {
      this.failPending('pi_exited');
      this.emit('exit', { code, signal, stderrBytes: this.stderrBytes });
    });
  }

  private failPending(message: string) {
    for (const item of this.pending.values()) { clearTimeout(item.timer); item.reject(new Error(message)); }
    this.pending.clear();
  }

  request(command: RecordData, timeoutMs = 30_000): Promise<RecordData> {
    if (this.closing || this.child.exitCode !== null || this.child.signalCode !== null) return Promise.reject(new Error('pi_stopped'));
    if (this.pending.size >= 32) return Promise.reject(new Error('pending_limit'));
    const id = randomUUID();
    const encoded = JSON.stringify({ ...command, id }) + '\n';
    if (Buffer.byteLength(encoded) > MAX_RECORD_BYTES || this.child.stdin.writableLength + Buffer.byteLength(encoded) > MAX_QUEUED_BYTES)
      return Promise.reject(new Error('input_limit'));
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error('rpc_timeout')); }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      this.child.stdin.write(encoded, error => {
        if (error) { clearTimeout(timer); this.pending.delete(id); reject(new Error('pi_write_failed')); }
      });
    });
  }

  async stop() {
    if (this.closing) return;
    // Pi shell tools create separate process groups. Capture those descendants
    // before shutdown can reparent them, then clean them even if Pi is wedged.
    const descendants: number[] = [];
    if (process.platform === 'linux' && this.child.pid) {
      const discover = async (pid: number) => {
        if (descendants.length >= 256) { this.emit('fault', 'descendant_limit'); return; }
        try {
          const children = (await readFile(`/proc/${pid}/task/${pid}/children`, 'utf8')).trim().split(/\s+/).filter(Boolean).map(Number);
          for (const child of children) {
            if (!descendants.includes(child)) { descendants.push(child); await discover(child); }
          }
        } catch { /* Process may have exited during the snapshot. */ }
      };
      await discover(this.child.pid);
    }
    this.closing = true;
    this.failPending('pi_stopped');
    this.child.stdin.end();
    // Kill the whole Unix process group even if the parent already exited.
    const kill = (signal: NodeJS.Signals) => {
      try {
        if (process.platform !== 'win32' && this.child.pid) {
          for (const pid of [...descendants].reverse()) {
            try { process.kill(-pid, signal); } catch { try { process.kill(pid, signal); } catch {} }
          }
          process.kill(-this.child.pid, signal);
        } else this.child.kill(signal);
      } catch (error: any) { if (error.code !== 'ESRCH') this.emit('fault', 'process_group_cleanup_failed'); }
    };
    await new Promise(resolve => setTimeout(resolve, 200));
    kill('SIGTERM');
    await new Promise(resolve => setTimeout(resolve, 300));
    kill('SIGKILL');
  }
}
