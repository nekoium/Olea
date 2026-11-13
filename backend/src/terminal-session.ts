// SPDX-License-Identifier: MIT
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { JsonLines, MAX_QUEUED_BYTES, type RecordData } from './pi-process.js';
import { snapshotOwnedTree, signalOwnedProcess, type ProcessIdentity } from './process-tree.js';

export class TerminalSession {
  readonly child: ChildProcessWithoutNullStreams;
  private stopping?: Promise<void>;
  private ready = false;
  private ended = false;
  private output = '';
  private constructor(readonly workspace: string, readonly name: string, event: (record: RecordData) => void, command: string, bridge: string) {
    // Stock CLI login can run here, but provider/bridge secrets are not inherited.
    const env: NodeJS.ProcessEnv = {};
    for (const key of ['PATH', 'HOME', 'USER', 'LANG', 'TMPDIR', 'SystemRoot', 'WINDIR']) if (process.env[key]) env[key] = process.env[key];
    env.TERM = 'xterm-256color';
    this.child = spawn(command, [bridge], { cwd: workspace, env, stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
    const parser = new JsonLines(record => {
      if (record.type === 'ready') this.ready = true;
      if (record.type === 'output' && typeof record.text === 'string') {
        this.output = (this.output + record.text).slice(-262144);
        event({ type: 'terminal', record: { type: 'output', text: record.text } });
      } else if (['ready', 'exit', 'fault'].includes(record.type)) {
        if (record.type !== 'ready') { this.ready = false; this.ended = true; }
        event({ type: 'terminal', record });
      }
    });
    this.child.stdout.on('data', data => { try { parser.push(data); } catch { event({ type: 'terminal', record: { type: 'fault', code: 'terminal_protocol_failed' } }); void this.stop(); } });
    this.child.stderr.resume();
    this.child.stdin.on('error', () => { this.ready = false; });
    this.child.on('error', () => { this.ended = true; event({ type: 'terminal', record: { type: 'fault', code: 'terminal_python_unavailable' } }); });
    this.child.on('exit', code => { this.ready = false; this.ended = true; event({ type: 'terminal', record: { type: 'exit', code } }); });
  }
  static async start(workspace: string, name: string, event: (record: RecordData) => void, command = 'python3', bridge = fileURLToPath(new URL('../extensions/terminal.py', import.meta.url))) {
    const instance = new TerminalSession(workspace, name, event, command, bridge);
    try {
      await new Promise<void>((resolve, reject) => {
        const deadline = setTimeout(() => { clearInterval(poll); reject(new Error('terminal_start_timeout')); }, 15000);
        const poll = setInterval(() => {
          if (instance.ready || instance.ended) { clearTimeout(deadline); clearInterval(poll); instance.ready ? resolve() : reject(new Error('terminal_start_failed')); }
        }, 10);
      });
      return instance;
    } catch (error) { await instance.stop(); throw error; }
  }
  status() { return { workspace: this.workspace, name: this.name, ready: this.ready, output: this.output, pid: this.child.pid }; }
  write(record: RecordData) {
    if (!this.ready || this.stopping) throw new Error('terminal_not_running');
    if (record.type === 'input') {
      if (typeof record.text !== 'string' || record.text.length > 32768) throw new Error('terminal_invalid_input');
    } else if (record.type === 'resize') {
      if (![record.columns, record.rows].every(value => Number.isInteger(value) && value >= 1 && value <= 500)) throw new Error('terminal_invalid_size');
    } else throw new Error('terminal_unsupported_command');
    const text = JSON.stringify(record) + '\n';
    if (this.child.stdin.writableLength + Buffer.byteLength(text) > MAX_QUEUED_BYTES) throw new Error('terminal_input_limit');
    this.child.stdin.write(text);
  }
  stop() { return this.stopping ??= this.stopInner(); }
  private async stopInner() {
    this.ready = false;
    let owned: ProcessIdentity[] = [];
    if (process.platform === 'linux' && this.child.pid && !this.ended) {
      try { owned = await snapshotOwnedTree(this.child.pid); } catch { /* Android supervisor retains independent ownership. */ }
    }
    this.child.stdin.end();
    await new Promise(resolve => setTimeout(resolve, 200));
    for (const signal of ['SIGTERM', 'SIGKILL'] as const) {
      for (const identity of [...owned].reverse()) await signalOwnedProcess(identity, signal).catch(() => {});
      if (this.child.exitCode === null && this.child.signalCode === null) this.child.kill(signal);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
}
