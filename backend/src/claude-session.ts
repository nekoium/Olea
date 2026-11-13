// SPDX-License-Identifier: MIT
import { access, lstat, mkdir, readFile, readdir, realpath, rename, stat, writeFile } from 'node:fs/promises';
import { join, sep } from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { ClaudeProcess } from './claude-process.js';
import { validateProvider, type ResponsesProvider } from './codex-session.js';
import type { RecordData } from './pi-process.js';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const quote = (value: string) => process.platform === 'win32' ? `"${value.replace(/"/g, '""')}"` : `'${value.replace(/'/g, `'\\''`)}'`;
export function claudeSettings(providerPath?: string) {
  // The API key stays out of Claude's environment, generated settings and tool shells.
  return providerPath ? { apiKeyHelper: [process.execPath, fileURLToPath(new URL('./claude-auth.js', import.meta.url)), providerPath].map(quote).join(' ') } : {};
}
export function claudeMcp(bridgePath?: string) {
  return { mcpServers: bridgePath ? { olea_phone: { command: process.execPath, args: [fileURLToPath(new URL('./phone-mcp.js', import.meta.url))], env: { OLEA_BRIDGE_CONFIG: bridgePath } } } : {} };
}
export class ClaudeSession {
  readonly process: ClaudeProcess;
  stderrBytes = 0;
  private sequence = 0;
  private pending = new Map<string, { resolve: (value: RecordData) => void; reject: (error: Error) => void; timer: NodeJS.Timeout }>();
  private inFlight = false;
  private failed = false;
  private writing = false;
  private constructor(readonly workspace: string, readonly home: string, readonly sessionId: string, private directory: string, private submitted: boolean, options: { command: string; args: string[]; env: NodeJS.ProcessEnv }, private event: (record: RecordData) => void) {
    this.process = new ClaudeProcess({ ...options, cwd: workspace });
    this.process.on('stderr', bytes => { this.stderrBytes += bytes; });
    this.process.on('record', record => this.receive(record));
    this.process.on('fault', code => { this.failed = true; this.rejectPending(code); this.event({ type: 'fault', agent: 'claude', code }); });
    this.process.on('exit', detail => this.event({ type: 'exit', agent: 'claude', ...detail, stderrBytes: this.stderrBytes }));
  }
  private rejectPending(code: string) {
    for (const value of this.pending.values()) { clearTimeout(value.timer); value.reject(new Error(code)); }
    this.pending.clear();
  }
  private receive(record: RecordData) {
    if (record.type === 'olea_process') { this.event({ type: 'event', agent: 'claude', record }); return; }
    if (typeof record.session_id === 'string' && record.session_id && record.session_id !== this.sessionId) { this.failed = true; this.event({ type: 'fault', agent: 'claude', code: 'claude_session_identity_mismatch' }); void this.stop(); return; }
    if (record.type === 'control_response') {
      const response = record.response;
      const pending = this.pending.get(response?.request_id);
      if (pending) { clearTimeout(pending.timer); this.pending.delete(response.request_id); response.subtype === 'success' ? pending.resolve(response.response ?? {}) : pending.reject(new Error('claude_control_failed')); }
      return;
    }
    if (record.type === 'control_request') {
      // Explicit deny for unsupported interaction, never grant implicit tool authority here.
      try { this.process.write({ type: 'control_response', response: { subtype: 'error', request_id: record.request_id, error: 'unsupported_olea_client_request' } }); } catch {}
      this.event({ type: 'event', agent: 'claude', record: { type: 'olea_interaction_required', subtype: record.request?.subtype } });
      return;
    }
    if (record.type === 'result') this.inFlight = false;
    // Do not expose raw provider errors, auth status, or arbitrary protocol diagnostics.
    if (record.type === 'result') this.event({ type: 'event', agent: 'claude', record: { type: 'result', subtype: record.subtype, is_error: record.is_error, session_id: record.session_id } });
    else if (['assistant', 'user', 'stream_event'].includes(record.type) || (record.type === 'system' && record.subtype === 'init')) this.event({ type: 'event', agent: 'claude', record });
  }
  private control(subtype: string) {
    if (this.pending.size >= 32) return Promise.reject(new Error('claude_pending_limit'));
    const request_id = String(++this.sequence);
    return new Promise<RecordData>((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(request_id); this.failed = true; reject(new Error('claude_delivery_unknown')); }, 30_000);
      this.pending.set(request_id, { resolve, reject, timer });
      try { this.process.write({ type: 'control_request', request_id, request: { subtype } }); }
      catch (error) { clearTimeout(timer); this.pending.delete(request_id); reject(error); }
    });
  }
  private async checkpoint() {
    const temporary = join(this.directory, `session-${randomUUID()}.tmp`);
    await writeFile(temporary, JSON.stringify({ sessionId: this.sessionId, cwd: this.workspace, home: this.home, submitted: this.submitted }), { mode: 0o600 });
    await rename(temporary, join(this.directory, 'session.json'));
  }
  private static async transcript(home: string, sessionId: string) {
    const projects = join(home, '.claude', 'projects');
    const entries = await readdir(projects, { withFileTypes: true }).catch((error: NodeJS.ErrnoException) => { if (error.code === 'ENOENT') return []; throw error; });
    if (entries.length > 4096) throw new Error('claude_history_limit');
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.isSymbolicLink()) continue;
      const candidate = join(projects, entry.name, `${sessionId}.jsonl`);
      try {
        const info = await lstat(candidate);
        if (!info.isFile() || info.isSymbolicLink() || !(await realpath(candidate)).startsWith(home + sep)) throw new Error('claude_invalid_history_path');
        return candidate;
      } catch (error: any) { if (error.code !== 'ENOENT') throw error; }
    }
  }
  static async start(options: { directory: string; workspace: string; entry: string; resume: boolean; providerPath?: string; bridgePath?: string }, event: (record: RecordData) => void) {
    await mkdir(options.directory, { recursive: true, mode: 0o700 });
    const directory = await realpath(options.directory), workspace = await realpath(options.workspace);
    await mkdir(join(directory, 'home'), { recursive: true, mode: 0o700 });
    const home = await realpath(join(directory, 'home'));
    if (home === workspace || home.startsWith(workspace + sep) || !home.startsWith(directory + sep)) throw new Error('claude_invalid_home');
    await mkdir(join(home, '.claude'), { recursive: true, mode: 0o700 });
    if (await realpath(join(home, '.claude')) !== join(home, '.claude')) throw new Error('claude_invalid_home');
    let saved: RecordData | undefined;
    try { saved = JSON.parse(await readFile(join(directory, 'session.json'), 'utf8')); } catch (error: any) { if (error.code !== 'ENOENT') throw new Error('claude_invalid_checkpoint'); }
    if (options.resume && !saved) throw new Error('claude_resume_missing');
    if (!options.resume && saved) throw new Error('claude_resume_required');
    if (saved && (saved.cwd !== workspace || saved.home !== home || !uuid.test(saved.sessionId) || typeof saved.submitted !== 'boolean')) throw new Error('claude_resume_identity_mismatch');
    const sessionId = saved?.sessionId ?? randomUUID();
    const transcript = saved && await ClaudeSession.transcript(home, sessionId);
    if (saved?.submitted && !transcript) throw new Error('claude_resume_history_missing');
    const env: NodeJS.ProcessEnv = {};
    for (const name of ['PATH', 'Path', 'SystemRoot', 'WINDIR', 'COMSPEC', 'PATHEXT', 'TEMP', 'TMP', 'TMPDIR', 'LANG', 'SHELL', 'USER', 'LOGNAME']) if (process.env[name]) env[name] = process.env[name];
    env.HOME = home; env.USERPROFILE = home; env.CLAUDE_CONFIG_DIR = join(home, '.claude');
    env.DISABLE_AUTOUPDATER = '1'; env.CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC = '1'; env.API_MAX_RETRIES = '0';
    // PRoot's apparent uid 0 is not Android root; Olea already grants broad app authority.
    env.IS_SANDBOX = '1';
    let provider: ResponsesProvider | undefined;
    if (options.providerPath) { try { provider = validateProvider(JSON.parse(await readFile(options.providerPath, 'utf8'))); } catch { throw new Error('invalid_provider_config'); } env.ANTHROPIC_BASE_URL = provider.baseUrl; }
    const settingsPath = join(directory, 'settings.json'), mcpPath = join(directory, 'mcp.json');
    await writeFile(settingsPath, JSON.stringify(claudeSettings(options.providerPath)), { mode: 0o600 });
    await writeFile(mcpPath, JSON.stringify(claudeMcp(options.bridgePath)), { mode: 0o600 });
    await access(options.entry).catch(() => { throw new Error('claude_not_installed'); });
    const isJs = /\.[cm]?js$/.test(options.entry);
    const args = [...(isJs ? [options.entry] : []), '--print', '--input-format', 'stream-json', '--output-format', 'stream-json', '--verbose', '--include-partial-messages', '--permission-mode', 'bypassPermissions', '--setting-sources', '', '--settings', settingsPath, '--strict-mcp-config', '--mcp-config', mcpPath, transcript ? '--resume' : '--session-id', sessionId];
    if (provider) args.push('--model', provider.model);
    const instance = new ClaudeSession(workspace, home, sessionId, directory, saved?.submitted ?? false, { command: isJs ? process.execPath : options.entry, args, env }, event);
    try {
      await instance.process.initialize();
      const initialized = await instance.control('initialize');
      await instance.checkpoint();
      if (instance.failed || instance.process.child.exitCode !== null || instance.process.child.signalCode !== null) throw new Error('claude_exited_during_start');
      return { instance, data: { agent: 'claude', sessionId, workspace, home, pid: instance.process.child.pid, initialized, filesystemIsolation: false, startupMs: performance.now() - instance.process.startedAt } };
    } catch (error) { await instance.stop(); throw error; }
  }
  async command(command: RecordData) {
    if (!command || typeof command !== 'object') throw new Error('claude_invalid_input');
    if (command.type === 'get_messages') {
      const path = await ClaudeSession.transcript(this.home, this.sessionId);
      if (!path) return { messages: [] };
      if ((await stat(path)).size > 4 * 1024 * 1024) return { historyUnavailable: 'claude_history_limit' };
      let records: RecordData[];
      try { records = (await readFile(path, 'utf8')).split('\n').filter(Boolean).map(line => JSON.parse(line)); }
      catch { return { historyUnavailable: 'claude_history_unreadable' }; }
      // Follow the active leaf's parent chain; abandoned branches are not conversation history.
      const indexed = new Map(records.filter(record => typeof record.uuid === 'string').map(record => [record.uuid, record]));
      const leaf = records.findLast(record => ['user', 'assistant'].includes(record.type) && !record.isSidechain && typeof record.uuid === 'string');
      const chain: RecordData[] = [], visited = new Set<string>();
      let current = leaf;
      while (current && !visited.has(current.uuid)) {
        visited.add(current.uuid);
        if (['user', 'assistant'].includes(current.type) && !current.isSidechain && current.message) chain.push(current.message);
        current = indexed.get(current.parentUuid);
      }
      const messages = chain.reverse().slice(-300);
      if (Buffer.byteLength(JSON.stringify(messages)) > 192 * 1024) return { historyUnavailable: 'claude_history_limit' };
      return { messages };
    }
    if (this.failed) throw new Error('claude_delivery_unknown');
    if (command.type === 'abort') {
      if (this.writing) throw new Error('claude_delivery_unknown');
      return this.control('interrupt');
    }
    if (command.type !== 'prompt') throw new Error('claude_unsupported_command');
    if (this.inFlight || this.writing) throw new Error('claude_turn_active');
    if (typeof command.message !== 'string' || !command.message.trim() || command.message.length > 65536) throw new Error('claude_invalid_input');
    this.writing = true;
    try {
      // Reserve uncertainty durably before delivery. A failed write never licenses replay.
      this.submitted = true; await this.checkpoint();
      this.inFlight = true;
      this.process.write({ type: 'user', session_id: this.sessionId, message: { role: 'user', content: command.message }, parent_tool_use_id: null });
      return { accepted: true, delivery: 'submitted_not_completed' };
    } finally { this.writing = false; }
  }
  stop() { this.failed = true; this.rejectPending('claude_stopped'); return this.process.stop(); }
}
