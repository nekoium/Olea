// SPDX-License-Identifier: MIT
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PiProcess, type RecordData } from './pi-process.js';

export class Backend {
  private sessions = new Map<string, PiProcess>();
  private starting = new Set<string>();
  private closed = false;
  private extension = fileURLToPath(new URL('../extensions/phone.ts', import.meta.url));
  constructor(private options: { entry: string; workspace: string; stateDir: string; env?: NodeJS.ProcessEnv }, private event: (record: RecordData) => void) {}

  async start(session: string, resume = false) {
    if (typeof session !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(session)) throw new Error('invalid_session');
    if (this.closed) throw new Error('backend_closed');
    if (this.sessions.has(session) || this.starting.has(session)) throw new Error('already_running');
    if (this.sessions.size + this.starting.size >= 2) throw new Error('session_limit');
    this.starting.add(session);
    try {
    const directory = resolve(this.options.stateDir, session);
    await mkdir(directory, { recursive: true, mode: 0o700 });
    const args = ['--mode', 'rpc', '--session-dir', directory, '--extension', this.extension,
      '--provider', 'olea-test', '--model', (this.options.env ?? process.env).OLEA_MODEL ?? 'gpt-6.1-terra'];
    if (resume) {
      const saved = JSON.parse(await readFile(join(directory, 'resume.json'), 'utf8'));
      const path = resolve(saved.sessionFile);
      if (!path.startsWith(directory + (process.platform === 'win32' ? '\\' : '/'))) throw new Error('invalid_resume_path');
      args.push('--session', path);
    }
    if (this.closed) throw new Error('backend_closed');
    const pi = new PiProcess({ entry: this.options.entry, cwd: this.options.workspace, args, env: this.options.env });
    this.starting.delete(session);
    this.sessions.set(session, pi);
    pi.on('record', record => this.event({ type: 'event', session, record }));
    pi.on('fault', code => this.event({ type: 'fault', session, code }));
    pi.on('exit', detail => { if (this.sessions.get(session) === pi) this.sessions.delete(session); this.event({ type: 'exit', session, ...detail }); void pi.stop(); });
    try {
      const state = await pi.request({ type: 'get_state' }, 60_000);
      await pi.request({ type: 'set_auto_retry', enabled: false });
      // Session files may be allocated lazily. Refresh this checkpoint after each prompt.
      await this.saveState(directory, state.data);
      return { pid: pi.child.pid, startupMs: performance.now() - pi.startedAt, state: state.data };
    } catch (error) { await pi.stop(); this.sessions.delete(session); throw error; }
    } finally { this.starting.delete(session); }
  }

  private async saveState(directory: string, state: RecordData) {
    if (!state?.sessionFile) return;
    await writeFile(join(directory, 'resume.json.tmp'), JSON.stringify({ sessionFile: state.sessionFile }), { mode: 0o600 });
    await rename(join(directory, 'resume.json.tmp'), join(directory, 'resume.json'));
  }

  async command(session: string, command: RecordData) {
    const pi = this.sessions.get(session);
    if (!pi) throw new Error('session_not_running');
    const allowed = ['prompt', 'abort', 'get_state', 'get_messages', 'get_session_stats', 'bash', 'abort_bash'];
    if (!allowed.includes(command.type)) throw new Error('unsupported_command');
    const result = await pi.request(command, command.type === 'bash' ? 120_000 : 30_000);
    if (command.type === 'prompt' || command.type === 'get_state') {
      const state = command.type === 'get_state' ? result : await pi.request({ type: 'get_state' });
      await this.saveState(resolve(this.options.stateDir, session), state.data);
    }
    return result;
  }

  async stop(session: string) {
    const pi = this.sessions.get(session);
    if (!pi) return;
    await pi.stop();
    this.sessions.delete(session);
  }
  status() { return [...this.sessions].map(([session, pi]) => ({ session, pid: pi.child.pid, stderrBytes: pi.stderrBytes })); }
  async close() { this.closed = true; await Promise.all([...this.sessions.keys()].map(session => this.stop(session))); }
}
