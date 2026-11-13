// SPDX-License-Identifier: MIT
import { access, lstat, mkdir, readFile, realpath, rename, stat, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { PiProcess, type RecordData } from './pi-process.js';
import { ClaudeSession } from './claude-session.js';
import { CodexSession, type CodexAccessMode } from './codex-session.js';
import { TerminalSession } from './terminal-session.js';

export class Backend {
  private terminals = new Map<string, TerminalSession>();
  private sessions = new Map<string, PiProcess>();
  private claudeSessions = new Map<string, ClaudeSession>();
  private codexSessions = new Map<string, CodexSession>();
  private starting = new Map<string, { cancelled: boolean; settled: Promise<void>; settle: () => void }>();
  private closed = false;
  private extension = fileURLToPath(new URL('../extensions/phone.ts', import.meta.url));
  constructor(private options: { entry: string; workspace: string; workspaceRoot?: string; stateDir: string; env?: NodeJS.ProcessEnv; codexEntry?: string; codexProviderPath?: string; codexAuthPath?: string; codexModel?: string; codexAccessMode?: CodexAccessMode; claudeEntry?: string; claudeProviderPath?: string; claudeAuthPath?: string; bridgePath?: string }, private event: (record: RecordData) => void) {}

  private async workspace(session: string, agent: 'pi' | 'codex' | 'claude', requested?: string) {
    if (requested !== undefined && (typeof requested !== 'string' || !isAbsolute(requested))) throw new Error('invalid_workspace');
    const workspace = await realpath(requested ?? this.options.workspace).catch(() => { throw new Error('workspace_not_found'); });
    // An existing configured default remains usable; explicit selections must be within the root.
    if (requested !== undefined) {
      const root = await realpath(this.options.workspaceRoot ?? this.options.workspace);
      const path = relative(root, workspace);
      if (path === '..' || path.startsWith('..\\') || path.startsWith('../') || isAbsolute(path)) throw new Error('workspace_outside_root');
    }
    if (!(await stat(workspace)).isDirectory()) throw new Error('invalid_workspace');
    const directory = resolve(this.options.stateDir, session);
    let identity: RecordData | undefined;
    try { identity = JSON.parse(await readFile(join(directory, 'identity.json'), 'utf8')); }
    catch (error: any) { if (error.code !== 'ENOENT') throw new Error('invalid_session_identity'); }
    if (identity && (identity.workspace !== workspace || identity.agent !== agent)) throw new Error('session_identity_mismatch');
    return workspace;
  }
  private async saveIdentity(session: string, agent: 'pi' | 'codex' | 'claude', workspace: string) {
    const directory = resolve(this.options.stateDir, session);
    await mkdir(directory, { recursive: true, mode: 0o700 });
    const temporary = join(directory, `identity-${randomUUID()}.tmp`);
    await writeFile(temporary, JSON.stringify({ agent, workspace }), { mode: 0o600 });
    await rename(temporary, join(directory, 'identity.json'));
  }

  private get sessionCount() { return this.sessions.size + this.codexSessions.size + this.claudeSessions.size + [...this.starting.keys()].filter(key => !key.startsWith('terminal:')).length; }
  private reserveStart(session: string) {
    let settle!: () => void;
    const settled = new Promise<void>(resolve => { settle = resolve; });
    const pending = { cancelled: false, settled, settle };
    this.starting.set(session, pending);
    return pending;
  }
  private checkStart(pending: { cancelled: boolean }) {
    if (this.closed) throw new Error('backend_closed');
    if (pending.cancelled) throw new Error('start_cancelled');
  }

  async startClaude(session: string, resume = false, requestedWorkspace?: string) {
    if (typeof session !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(session)) throw new Error('invalid_session');
    if (this.closed) throw new Error('backend_closed');
    if (this.sessions.has(session) || this.codexSessions.has(session) || this.claudeSessions.has(session) || this.starting.has(session)) throw new Error('already_running');
    if (this.sessionCount >= 2) throw new Error('session_limit');
    if (!this.options.claudeEntry) throw new Error('claude_not_configured');
    const pending = this.reserveStart(session);
    let instance: ClaudeSession | undefined;
    try {
      const workspace = await this.workspace(session, 'claude', requestedWorkspace);
      this.checkStart(pending);
      // Bind the immutable agent before a child can create canonical conversation data.
      await this.saveIdentity(session, 'claude', workspace);
      this.checkStart(pending);
      const result = await ClaudeSession.start({ directory: resolve(this.options.stateDir, 'claude', session), workspace, entry: this.options.claudeEntry, resume, providerPath: this.options.claudeProviderPath, authPath: this.options.claudeAuthPath, bridgePath: this.options.bridgePath }, record => this.event({ ...record, session }));
      instance = result.instance;
      this.checkStart(pending);
      const owned = instance;
      owned.process.on('exit', () => { if (this.claudeSessions.get(session) === owned) this.claudeSessions.delete(session); void owned.stop(); });
      this.checkStart(pending);
      if (owned.process.child.exitCode !== null || owned.process.child.signalCode !== null) throw new Error('claude_exited_during_start');
      this.claudeSessions.set(session, owned);
      return result.data;
    } catch (error) { await instance?.stop(); throw error; }
    finally { this.starting.delete(session); pending.settle(); }
  }
  async claudeCommand(session: string, command: RecordData) {
    const instance = this.claudeSessions.get(session);
    if (!instance) throw new Error('session_not_running');
    return instance.command(command);
  }

  async startCodex(session: string, resume = false, requestedWorkspace?: string) {
    if (typeof session !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(session)) throw new Error('invalid_session');
    if (this.closed) throw new Error('backend_closed');
    if (this.sessions.has(session) || this.codexSessions.has(session) || this.claudeSessions.has(session) || this.starting.has(session)) throw new Error('already_running');
    if (this.sessionCount >= 2) throw new Error('session_limit');
    if (!this.options.codexEntry) throw new Error('codex_not_configured');
    const pending = this.reserveStart(session);
    let instance: CodexSession | undefined;
    try {
      const workspace = await this.workspace(session, 'codex', requestedWorkspace);
      this.checkStart(pending);
      if (!resume && await access(join(this.options.stateDir, 'codex', session, 'thread.json')).then(() => true, (error: NodeJS.ErrnoException) => { if (error.code === 'ENOENT') return false; throw error; })) throw new Error('codex_resume_required');
      this.checkStart(pending);
      await this.saveIdentity(session, 'codex', workspace);
      const result = await CodexSession.start({ directory: resolve(this.options.stateDir, 'codex', session), workspace, entry: this.options.codexEntry, resume, providerPath: this.options.codexProviderPath, authPath: this.options.codexAuthPath, model: this.options.codexModel, accessMode: this.options.codexAccessMode, bridgePath: this.options.bridgePath }, record => this.event({ ...record, session }));
      instance = result.instance;
      this.checkStart(pending);
      if (instance.process.child.exitCode !== null || instance.process.child.signalCode !== null) throw new Error('codex_exited_during_start');
      const owned = instance;
      owned.process.on('exit', () => { if (this.codexSessions.get(session) === owned) this.codexSessions.delete(session); void owned.stop(); });
      this.checkStart(pending);
      if (owned.process.child.exitCode !== null || owned.process.child.signalCode !== null) throw new Error('codex_exited_during_start');
      this.codexSessions.set(session, owned);
      return result.data;
    } catch (error) { await instance?.stop(); throw error; }
    finally { this.starting.delete(session); pending.settle(); }
  }
  async codexCommand(session: string, command: RecordData) {
    const instance = this.codexSessions.get(session);
    if (!instance) throw new Error('session_not_running');
    return instance.command(command.method, command.params);
  }
  codexApproval(session: string, id: string | number, decision: string) {
    const instance = this.codexSessions.get(session);
    if (!instance) throw new Error('session_not_running');
    instance.approve(id, decision);
  }

  async start(session: string, resume = false, requestedWorkspace?: string) {
    if (typeof session !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(session)) throw new Error('invalid_session');
    if (this.closed) throw new Error('backend_closed');
    if (this.sessions.has(session) || this.codexSessions.has(session) || this.claudeSessions.has(session) || this.starting.has(session)) throw new Error('already_running');
    if (this.sessionCount >= 2) throw new Error('session_limit');
    const pending = this.reserveStart(session);
    let pi: PiProcess | undefined;
    try {
    const workspace = await this.workspace(session, 'pi', requestedWorkspace);
    this.checkStart(pending);
    const directory = resolve(this.options.stateDir, session);
    if (!resume && await access(join(directory, 'resume.json')).then(() => true, (error: NodeJS.ErrnoException) => { if (error.code === 'ENOENT') return false; throw error; })) throw new Error('pi_resume_required');
    await mkdir(directory, { recursive: true, mode: 0o700 });
    const args = ['--mode', 'rpc', '--session-dir', directory];
    const env = { ...(this.options.env ?? process.env) };
    if (this.options.bridgePath) env.OLEA_BRIDGE_CONFIG = this.options.bridgePath;
    if (env.OLEA_PI_PROVIDER) args.push('--provider', env.OLEA_PI_PROVIDER);
    if (env.OLEA_MODEL) args.push('--model', env.OLEA_MODEL);
    if (this.options.bridgePath) args.push('--extension', this.extension);
    if (resume) {
      const saved = JSON.parse(await readFile(join(directory, 'resume.json'), 'utf8'));
      // Legacy checkpoints used the single configured default workspace.
      const savedWorkspace = saved.workspace ?? await realpath(this.options.workspace);
      if (savedWorkspace !== workspace) throw new Error('session_identity_mismatch');
      if (typeof saved.sessionFile !== 'string' || !saved.sessionFile || saved.sessionFile.split(/[\\/]/).includes('..')) throw new Error('invalid_resume_path');
      const path = resolve(saved.sessionFile);
      if (!path.startsWith(directory + sep)) throw new Error('invalid_resume_path');
      const canonicalDirectory = await realpath(directory);
      const candidate = resolve(canonicalDirectory, relative(directory, path));
      // Only the reserved leaf may be absent; reject symlinked or missing ancestors.
      let parent = canonicalDirectory;
      for (const part of relative(canonicalDirectory, dirname(candidate)).split(sep).filter(Boolean)) {
        parent = join(parent, part);
        const info = await lstat(parent).catch(() => { throw new Error('invalid_resume_path'); });
        if (info.isSymbolicLink() || !info.isDirectory()) throw new Error('invalid_resume_path');
      }
      const leaf = await lstat(candidate).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== 'ENOENT') throw new Error('invalid_resume_path');
        return undefined;
      });
      if (leaf) {
        const canonicalFile = await realpath(candidate).catch(() => { throw new Error('invalid_resume_path'); });
        if (!canonicalFile.startsWith(canonicalDirectory + sep) || !(await stat(canonicalFile)).isFile()) throw new Error('invalid_resume_path');
      }
      args.push('--session', candidate);
    }
    this.checkStart(pending);
    await this.saveIdentity(session, 'pi', workspace);
    this.checkStart(pending);
    pi = new PiProcess({ entry: this.options.entry, cwd: workspace, args, env });
    const owned = pi;
    pi.on('record', record => this.event({ type: 'event', agent: 'pi', session, record }));
    pi.on('fault', code => this.event({ type: 'fault', agent: 'pi', session, code }));
    pi.on('exit', detail => { if (this.sessions.get(session) === owned) this.sessions.delete(session); this.event({ type: 'exit', agent: 'pi', session, ...detail }); void owned.stop(); });
      const state = await pi.request({ type: 'get_state' }, 60_000);
      await pi.request({ type: 'set_auto_retry', enabled: false });
      // Session files may be allocated lazily. Refresh this checkpoint after each prompt.
      await this.saveState(directory, state.data, workspace);
      this.checkStart(pending);
      if (pi.child.exitCode !== null || pi.child.signalCode !== null) throw new Error('pi_exited_during_start');
      this.sessions.set(session, pi);
      return { agent: 'pi', workspace, pid: pi.child.pid, startupMs: performance.now() - pi.startedAt, state: state.data };
    } catch (error) { await pi?.stop(); throw error; }
    finally { this.starting.delete(session); pending.settle(); }
  }

  private async saveState(directory: string, state: RecordData, workspace: string) {
    if (!state?.sessionFile) return;
    const temporary = join(directory, `resume-${randomUUID()}.tmp`);
    await writeFile(temporary, JSON.stringify({ sessionFile: state.sessionFile, workspace }), { mode: 0o600 });
    await rename(temporary, join(directory, 'resume.json'));
  }

  async command(session: string, command: RecordData) {
    const pi = this.sessions.get(session);
    if (!pi) throw new Error('session_not_running');
    const allowed = ['prompt', 'abort', 'get_state', 'get_messages', 'get_session_stats', 'bash', 'abort_bash'];
    if (!allowed.includes(command.type)) throw new Error('unsupported_command');
    if (command.type === 'prompt' && (typeof command.message !== 'string' || !command.message.trim() || command.message.length > 65536)) throw new Error('invalid_message');
    const result = await pi.request(command, command.type === 'bash' ? 120_000 : 30_000);
    if (command.type === 'prompt' || command.type === 'get_state' || command.type === 'bash') {
      const state = command.type === 'get_state' ? result : await pi.request({ type: 'get_state' });
      await this.saveState(resolve(this.options.stateDir, session), state.data, pi.workspace);
    }
    return result;
  }

  async startTerminal(session: string, requestedWorkspace: string, name = 'Terminal') {
    if (typeof session !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(session)) throw new Error('invalid_session');
    if (typeof name !== 'string' || !name.trim() || name.length > 160 || /[\u0000-\u001f\u007f]/.test(name)) throw new Error('terminal_invalid_name');
    if (this.closed) throw new Error('backend_closed');
    const key = `terminal:${session}`;
    if (this.terminals.has(session) || this.starting.has(key)) throw new Error('already_running');
    if (this.terminals.size + [...this.starting.keys()].filter(id => id.startsWith('terminal:')).length >= 4) throw new Error('terminal_limit');
    const pending = this.reserveStart(key);
    let terminal: TerminalSession | undefined;
    try {
      const workspace = await this.workspace(`terminal-${session}`, 'pi', requestedWorkspace);
      this.checkStart(pending);
      terminal = await TerminalSession.start(workspace, name, record => this.event({ ...record, session }));
      this.checkStart(pending);
      this.terminals.set(session, terminal);
      return terminal.status();
    } catch (error) { await terminal?.stop(); throw error; }
    finally { this.starting.delete(key); pending.settle(); }
  }
  terminalCommand(session: string, command: RecordData) {
    const terminal = this.terminals.get(session);
    if (!terminal) throw new Error('terminal_not_running');
    if (!command || typeof command !== 'object') throw new Error('terminal_invalid_input');
    terminal.write(command);
  }
  terminalStatus() { return [...this.terminals].map(([session, terminal]) => ({ session, ...terminal.status() })); }
  async closeTerminal(session: string) {
    const pending = this.starting.get(`terminal:${session}`);
    if (pending) { pending.cancelled = true; await pending.settled; }
    const terminal = this.terminals.get(session);
    await terminal?.stop();
    if (this.terminals.get(session) === terminal) this.terminals.delete(session);
  }

  async stop(session: string) {
    const pending = this.starting.get(session);
    if (pending) {
      pending.cancelled = true;
      await pending.settled;
      return;
    }
    const claude = this.claudeSessions.get(session);
    if (claude) { const result = await claude.stop(); if (this.claudeSessions.get(session) === claude) this.claudeSessions.delete(session); return result; }
    const codex = this.codexSessions.get(session);
    if (codex) { const result = await codex.stop(); if (this.codexSessions.get(session) === codex) this.codexSessions.delete(session); return result; }
    const pi = this.sessions.get(session);
    if (!pi) return;
    await pi.stop();
    if (this.sessions.get(session) === pi) this.sessions.delete(session);
  }
  status() { return [...[...this.sessions].map(([session, pi]) => ({ session, agent: 'pi', workspace: pi.workspace, pid: pi.child.pid, stderrBytes: pi.stderrBytes })), ...[...this.codexSessions].map(([session, codex]) => ({ session, agent: 'codex', workspace: codex.workspace, accessMode: codex.accessMode, filesystemIsolation: false, pid: codex.process.child.pid, threadId: codex.threadId, stderrBytes: codex.process.stderrBytes })), ...[...this.claudeSessions].map(([session, claude]) => ({ session, agent: 'claude', workspace: claude.workspace, home: claude.home, sessionId: claude.sessionId, pid: claude.process.child.pid, stderrBytes: claude.stderrBytes, filesystemIsolation: false }))]; }
  async close() { this.closed = true; await Promise.all([...this.starting.keys(), ...this.sessions.keys(), ...this.codexSessions.keys(), ...this.claudeSessions.keys()].map(session => this.stop(session))); await Promise.all([...this.terminals.keys()].map(session => this.closeTerminal(session))); }
}
