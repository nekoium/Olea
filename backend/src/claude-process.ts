// SPDX-License-Identifier: MIT
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { JsonLines, MAX_RECORD_BYTES, MAX_QUEUED_BYTES, type RecordData } from './pi-process.js';
import { processIdentity, procIO, signalOwnedProcess, snapshotOwnedTree, type ProcessIdentity } from './process-tree.js';

export class ClaudeProcess extends EventEmitter {
  readonly child: ChildProcessWithoutNullStreams;
  readonly startedAt = performance.now();
  private identity?: ProcessIdentity;
  private failed = false;
  private stopping?: Promise<{ rootExited: boolean; descendantsVerified: boolean }>;
  private rootExited = false;
  constructor(options: { command: string; args: string[]; cwd: string; env: NodeJS.ProcessEnv }) {
    super();
    this.child = spawn(options.command, options.args, { cwd: options.cwd, env: options.env, stdio: ['pipe', 'pipe', 'pipe'], detached: process.platform !== 'win32', windowsHide: true });
    const lines = new JsonLines(record => this.receive(record));
    this.child.stdout.on('data', chunk => { try { lines.push(chunk); } catch { this.fail('claude_invalid_or_oversize_frame'); void this.stop(); } });
    this.child.stderr.on('data', chunk => this.emit('stderr', chunk.length));
    this.child.stdin.on('error', () => this.fail('claude_delivery_unknown'));
    this.child.on('error', () => this.fail('claude_spawn_failed'));
    this.child.on('exit', (code, signal) => { this.rootExited = true; this.fail('claude_delivery_unknown'); this.emit('exit', { code, signal }); });
  }
  async initialize() {
    if (!this.child.pid) throw new Error('claude_spawn_failed');
    if (process.platform === 'linux') this.identity = await processIdentity(this.child.pid);
    this.emit('record', { type: 'olea_process', pid: this.child.pid, identity: this.identity ?? null });
  }
  private receive(record: RecordData) {
    if (!record || typeof record !== 'object' || Array.isArray(record)) throw new Error('claude_invalid_frame');
    this.emit('record', record);
  }
  write(record: RecordData) {
    if (this.failed || this.rootExited || this.stopping) throw new Error('claude_stopped');
    const encoded = JSON.stringify(record) + '\n';
    if (Buffer.byteLength(encoded) > MAX_RECORD_BYTES || this.child.stdin.writableLength + Buffer.byteLength(encoded) > MAX_QUEUED_BYTES) throw new Error('claude_input_limit');
    this.child.stdin.write(encoded);
  }
  private fail(code: string) { if (this.failed) return; this.failed = true; if (code !== 'claude_stopped') this.emit('fault', code); }
  stop() { return this.stopping ??= this.stopInner(); }
  private async stopInner() {
    let owned: ProcessIdentity[] = [];
    let snapshotComplete = false;
    try {
      if (process.platform === 'linux' && this.child.pid) { owned = await snapshotOwnedTree(this.child.pid); snapshotComplete = true; }
    } catch {
      this.emit('fault', 'cleanup_tree_unverifiable');
      // The original identity still permits stopping the root after an incomplete snapshot.
      try { if (this.identity && this.identity.uid === await procIO.owner('self')) owned = [this.identity]; } catch {}
    }
    this.fail('claude_stopped'); this.child.stdin.end();
    for (const signal of ['SIGTERM', 'SIGKILL'] as const) {
      if (process.platform === 'linux') {
        for (const identity of [...owned].reverse()) {
          try { await signalOwnedProcess(identity, signal); } catch { this.emit('fault', 'cleanup_signal_unverifiable'); }
        }
      } else if (!this.rootExited) {
        try { this.child.kill(signal); } catch {}
      }
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    this.child.stdin.destroy(); this.child.stdout.destroy(); this.child.stderr.destroy();
    this.child.unref();
    let descendantsVerified = snapshotComplete && owned.length > 0;
    for (const identity of owned) {
      try { const current = await processIdentity(identity.pid); if (current.uid === identity.uid && current.start === identity.start) descendantsVerified = false; }
      catch (error: any) { if (!['ENOENT', 'ESRCH'].includes(error.code)) descendantsVerified = false; }
    }
    return { rootExited: this.rootExited, descendantsVerified };
  }
}
