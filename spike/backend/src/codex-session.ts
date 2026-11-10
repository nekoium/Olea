// SPDX-License-Identifier: MIT
import { mkdir, readFile, realpath, rename, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { CodexProcess } from './codex-process.js';
import type { RecordData } from './pi-process.js';

export function codexConfig(model: string, bridge?: string) {
  if (!['gpt-6.1-terra', 'gpt-6.1-sol'].includes(model)) throw new Error('codex_invalid_model');
  const text = `model = ${JSON.stringify(model)}\nmodel_provider = "olea"\napproval_policy = "on-request"\nsandbox_mode = "workspace-write"\n[model_providers.olea]\nname = "Olea authorized Responses"\nbase_url = "https://api.chiyi.cc/v1"\nenv_key = "OLEA_CODEX_PROVIDER_KEY"\nwire_api = "responses"\nrequires_openai_auth = false\nrequest_max_retries = 0\nstream_max_retries = 0\nstream_idle_timeout_ms = 45000\n[shell_environment_policy]\ninherit = "core"\nexclude = ["OLEA_*", "*API_KEY*", "*TOKEN*", "*SECRET*"]\n[sandbox_workspace_write]\nnetwork_access = true\n`;
  const windows = process.platform === 'win32' ? '[windows]\nsandbox = "unelevated"\n' : '';
  if (!bridge) return text + windows;
  const helper = fileURLToPath(new URL('./phone-mcp.js', import.meta.url));
  return text + windows + `[mcp_servers.olea_phone]\ncommand = ${JSON.stringify(process.execPath)}\nargs = [${JSON.stringify(helper)}, ${JSON.stringify(bridge)}]\nenv = { OLEA_CODEX_PROVIDER_KEY = "" }\nenv_vars = []\nstartup_timeout_sec = 10\ntool_timeout_sec = 10\n`;
}
export class CodexSession {
  readonly process: CodexProcess;
  threadId?: string;
  private turnId?: string;
  private timer?: NodeJS.Timeout;
  private toolCounts = new Map<string, number>();
  private inFlight = false;
  private completed = new Set<string>();
  private constructor(private directory: string, private cwd: string, private home: string, options: { command: string; args?: string[]; env: NodeJS.ProcessEnv }, private event: (record: RecordData) => void) {
    this.process = new CodexProcess({ ...options, cwd });
    this.process.on('record', record => {
      if (record.method === 'turn/completed' && record.params?.threadId === this.threadId) {
        this.completed.add(record.params.turn.id);
        if (this.completed.size > 32) this.completed.delete(this.completed.values().next().value!);
        if (this.turnId === record.params.turn.id) { clearTimeout(this.timer); this.inFlight = false; this.turnId = undefined; }
      }
      if (record.method === 'item/started' && this.inFlight && record.params?.threadId === this.threadId && typeof record.params?.turnId === 'string' && ['commandExecution', 'mcpToolCall'].includes(record.params?.item?.type)) {
        const id = record.params.turnId;
        if (!this.toolCounts.has(id) && this.toolCounts.size >= 32) { void this.stop(); return; }
        const count = (this.toolCounts.get(id) ?? 0) + 1; this.toolCounts.set(id, count);
        if (id === this.turnId && count > 12) this.enforceToolLimit();
      }
      this.event({ type: 'event', agent: 'codex', record });
    });
    this.process.on('fault', code => { clearTimeout(this.timer); this.event({ type: 'fault', agent: 'codex', code }); });
    this.process.on('exit', detail => { clearTimeout(this.timer); this.event({ type: 'exit', agent: 'codex', ...detail }); });
  }
  static async start(options: { directory: string; workspace: string; entry: string; resume: boolean; providerPath?: string; model?: string; bridgePath?: string }, event: (record: RecordData) => void) {
    await mkdir(options.directory, { recursive: true, mode: 0o700 });
    const directory = await realpath(options.directory), cwd = await realpath(options.workspace);
    await mkdir(join(directory, 'home'), { recursive: true, mode: 0o700 });
    const home = await realpath(join(directory, 'home'));
    if (home === cwd || home.startsWith(cwd + (process.platform === 'win32' ? '\\' : '/'))) throw new Error('codex_home_inside_workspace');
    const env: NodeJS.ProcessEnv = {};
    for (const name of ['PATH', 'Path', 'HOME', 'USERPROFILE', 'SystemRoot', 'WINDIR', 'COMSPEC', 'PATHEXT', 'TEMP', 'TMP', 'TMPDIR', 'LANG', 'SHELL', 'USER', 'LOGNAME']) if (process.env[name]) env[name] = process.env[name];
    env.CODEX_HOME = home;
    if (options.providerPath) {
      const config = JSON.parse(await readFile(options.providerPath, 'utf8'));
      if (config.baseUrl !== 'https://api.chiyi.cc/v1' || typeof config.apiKey !== 'string' || !config.apiKey) throw new Error('invalid_provider_config');
      env.OLEA_CODEX_PROVIDER_KEY = config.apiKey;
    }
    await writeFile(join(home, 'config.toml'), codexConfig(options.model ?? 'gpt-6.1-terra', options.bridgePath), { mode: 0o600 });
    const isJs = /\.[cm]?js$/.test(options.entry);
    const instance = new CodexSession(directory, cwd, home, { command: isJs ? process.execPath : options.entry, args: isJs ? [options.entry] : [], env }, event);
    try {
      const initialized = await instance.process.initialize();
      const params: RecordData = { cwd, approvalPolicy: 'on-request', sandbox: 'workspace-write', model: options.model ?? 'gpt-6.1-terra', modelProvider: 'olea' };
      let expected: string | undefined;
      if (options.resume) {
        const saved = JSON.parse(await readFile(join(directory, 'thread.json'), 'utf8'));
        if (saved.cwd !== cwd || saved.home !== home || typeof saved.threadId !== 'string') throw new Error('codex_resume_identity_mismatch');
        expected = saved.threadId; params.threadId = expected;
      }
      const reply = await instance.process.request(options.resume ? 'thread/resume' : 'thread/start', params);
      const id = reply.thread?.id;
      if (typeof id !== 'string' || !id || (expected && id !== expected)) throw new Error('codex_thread_identity_mismatch');
      instance.threadId = id;
      const temporary = join(directory, `thread-${randomUUID()}.tmp`);
      await writeFile(temporary, JSON.stringify({ threadId: id, cwd, home }), { mode: 0o600 });
      await rename(temporary, join(directory, 'thread.json'));
      return { instance, data: { agent: 'codex', pid: instance.process.child.pid, initialized, threadId: id, cwd, home, startupMs: performance.now() - instance.process.startedAt } };
    } catch (error) { await instance.stop(); throw error; }
  }
  async command(method: string, params: RecordData = {}) {
    if (method === 'turn/interrupt') return this.interrupt();
    if (method === 'thread/read') return this.process.request(method, { threadId: this.threadId, includeTurns: true });
    if (method === 'mcpServerStatus/list') return this.process.request(method, { threadId: this.threadId });
    if (method !== 'turn/start') throw new Error('codex_unsupported_command');
    if (this.inFlight) throw new Error('codex_turn_active');
    if (typeof params.text !== 'string' || params.text.length > 32000) throw new Error('codex_invalid_input');
    this.inFlight = true; this.toolCounts.clear();
    // A timed-out turn stays uncertain; caller must explicitly reconcile, never replay.
    this.timer = setTimeout(() => { void this.interrupt().catch(() => {}); this.event({ type: 'fault', agent: 'codex', code: 'codex_turn_deadline_delivery_unknown' }); }, 120_000);
    try {
      const result = await this.process.request(method, { threadId: this.threadId, input: [{ type: 'text', text: params.text, text_elements: [] }] });
      const turnId = result.turn?.id;
      if (typeof turnId !== 'string') throw new Error('codex_invalid_turn');
      if (!this.completed.has(turnId)) {
        this.turnId = turnId;
        if ((this.toolCounts.get(turnId) ?? 0) > 12) this.enforceToolLimit();
      }
      else { clearTimeout(this.timer); this.inFlight = false; }
      return result;
    } catch (error) { void this.interrupt().catch(() => {}); throw error; }
  }
  private enforceToolLimit() {
    void this.interrupt().catch(() => {});
    this.event({ type: 'fault', agent: 'codex', code: 'codex_tool_round_limit' });
  }
  private interrupt() {
    if (!this.turnId) return Promise.reject(new Error('codex_turn_delivery_unknown'));
    return this.process.request('turn/interrupt', { threadId: this.threadId, turnId: this.turnId });
  }
  approve(id: string | number, decision: string) { this.process.approve(id, decision); }
  stop() { clearTimeout(this.timer); return this.process.stop(); }
}
