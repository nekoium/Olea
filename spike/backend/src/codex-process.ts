// SPDX-License-Identifier: MIT
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { JsonLines, MAX_RECORD_BYTES, MAX_QUEUED_BYTES, type RecordData } from './pi-process.js';
import { processIdentity, procIO, snapshotOwnedTree, signalOwnedProcess, type ProcessIdentity } from './process-tree.js';

// Original implementation against stock 0.167.0 generated app-server schemas.
export class CodexProcess extends EventEmitter {
  readonly child: ChildProcessWithoutNullStreams;
  readonly startedAt = performance.now();
  identity?: ProcessIdentity;
  stderrBytes = 0;
  private sequence = 0;
  private pending = new Map<number, { resolve: (v: RecordData) => void; reject: (e: Error) => void; timer: NodeJS.Timeout }>();
  private approvals = new Map<string | number, string>();
  private failed = false;
  private stopping?: Promise<{ rootExited: boolean; descendantsVerified: boolean }>;
  private rootExited = false;
  constructor(options: { command: string; args?: string[]; cwd: string; env: NodeJS.ProcessEnv }) {
    super();
    this.child = spawn(options.command, [...(options.args ?? []), 'app-server'], {
      cwd: options.cwd, env: options.env, stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true,
      detached: process.platform !== 'win32',
    });
    const lines = new JsonLines(record => this.receive(record));
    this.child.stdout.on('data', chunk => { try { lines.push(chunk); } catch { this.fail('codex_invalid_or_oversize_frame'); void this.stop(); } });
    this.child.stderr.on('data', chunk => { this.stderrBytes += chunk.length; });
    this.child.stdin.on('error', () => this.fail('codex_delivery_unknown'));
    this.child.on('error', () => this.fail('codex_spawn_failed'));
    this.child.on('exit', (code, signal) => { this.rootExited = true; this.fail('codex_delivery_unknown'); this.emit('exit', { code, signal, rootExited: true, stderrBytes: this.stderrBytes }); });
  }
  async initialize() {
    if (!this.child.pid) throw new Error('codex_spawn_failed');
    // Record identity before sending any protocol input; Windows has no /proc proof.
    if (process.platform === 'linux') this.identity = await processIdentity(this.child.pid);
    this.emit('record', { method: 'olea/process', params: { pid: this.child.pid, identity: this.identity ?? null } });
    const result = await this.request('initialize', { clientInfo: { name: 'olea_spike', title: 'Olea', version: '0.0.0' }, capabilities: null });
    this.write({ method: 'initialized' });
    return result;
  }
  private receive(record: RecordData) {
    if (!record || typeof record !== 'object' || Array.isArray(record)) throw new Error('invalid_frame');
    if (record.id !== undefined && !record.method) {
      const pending = this.pending.get(record.id);
      if (pending) {
        clearTimeout(pending.timer); this.pending.delete(record.id);
        record.error ? pending.reject(new Error(`codex_rpc_error_${Number.isInteger(record.error.code) ? record.error.code : 'unknown'}`)) : pending.resolve(record.result);
      }
    } else if (record.id !== undefined && record.method) {
      if (this.approvals.size >= 32) throw new Error('approval_limit');
      if (['item/commandExecution/requestApproval', 'item/fileChange/requestApproval'].includes(record.method)) this.approvals.set(record.id, record.method);
      else this.write({ id: record.id, error: { code: -32601, message: 'unsupported_client_request' } });
    }
    // Unknown notifications remain visible. No raw stderr/provider body is retained.
    this.emit('record', record);
  }
  private write(record: RecordData) {
    if (this.failed || this.rootExited || this.stopping) throw new Error('codex_stopped');
    const encoded = JSON.stringify(record) + '\n';
    if (Buffer.byteLength(encoded) > MAX_RECORD_BYTES || this.child.stdin.writableLength + Buffer.byteLength(encoded) > MAX_QUEUED_BYTES) throw new Error('codex_input_limit');
    this.child.stdin.write(encoded);
  }
  request(method: string, params: RecordData, timeoutMs = 30_000): Promise<RecordData> {
    if (this.pending.size >= 32) return Promise.reject(new Error('codex_pending_limit'));
    const id = ++this.sequence;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error('codex_delivery_unknown')); }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      try { this.write({ id, method, params }); }
      catch (error) { clearTimeout(timer); this.pending.delete(id); reject(error); }
    });
  }
  approve(id: string | number, decision: string) {
    if (!this.approvals.has(id)) throw new Error('codex_approval_missing');
    // No session-wide grants or policy amendments in this bounded harness.
    if (!['accept', 'decline', 'cancel'].includes(decision)) throw new Error('codex_invalid_decision');
    this.write({ id, result: { decision } }); this.approvals.delete(id);
  }
  private fail(code: string) {
    if (this.failed) return;
    this.failed = true;
    for (const value of this.pending.values()) { clearTimeout(value.timer); value.reject(new Error(code)); }
    this.pending.clear(); this.approvals.clear(); if (code !== 'codex_stopped') this.emit('fault', code);
  }
  stop() { return this.stopping ??= this.stopInner(); }
  private async stopInner() {
    let owned: ProcessIdentity[] = [];
    let snapshotComplete = false;
    if (process.platform === 'linux' && this.child.pid) {
      try { owned = await snapshotOwnedTree(this.child.pid); snapshotComplete = true; }
      catch { this.emit('fault', 'cleanup_tree_unverifiable');
        try { const root = await processIdentity(this.child.pid); if (root.uid === await procIO.owner('self')) owned = [root]; } catch {}
      }
    }
    this.fail(this.pending.size ? 'codex_delivery_unknown' : 'codex_stopped'); this.child.stdin.end();
    for (const signal of ['SIGTERM', 'SIGKILL'] as const) {
      if (process.platform === 'linux') {
        for (const identity of [...owned].reverse()) { try { await signalOwnedProcess(identity, signal); } catch { this.emit('fault', 'cleanup_signal_unverifiable'); } }
      } else if (!this.rootExited) { try { this.child.kill(signal); } catch {} }
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    // Descendants can inherit pipes after root exit. Bound draining without claiming tree exit.
    this.child.stdin.destroy(); this.child.stdout.destroy(); this.child.stderr.destroy();
    this.child.unref();
    let descendantsVerified = snapshotComplete && owned.length > 0;
    for (const identity of owned) {
      try {
        const current = await processIdentity(identity.pid);
        if (current.uid === identity.uid && current.start === identity.start) descendantsVerified = false;
      } catch (error: any) { if (!['ENOENT', 'ESRCH'].includes(error.code)) descendantsVerified = false; }
    }
    return { rootExited: this.rootExited, descendantsVerified };
  }
}
