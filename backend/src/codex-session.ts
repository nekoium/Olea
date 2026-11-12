// SPDX-License-Identifier: MIT
import { mkdir, readFile, realpath, rename, writeFile } from 'node:fs/promises';
import { join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { CodexProcess } from './codex-process.js';
import type { RecordData } from './pi-process.js';

export type CodexAccessMode = 'workspace-write' | 'full-access';
export type ResponsesProvider = { baseUrl: string; apiKey: string; model: string };
export function validateProvider(value: unknown): ResponsesProvider {
  const config = value as ResponsesProvider | null;
  if (!config || typeof config.baseUrl !== 'string' || typeof config.apiKey !== 'string' || !config.apiKey.trim() || /[\r\n]/.test(config.apiKey) || typeof config.model !== 'string' || !config.model.trim() || config.model.length > 256 || /[\u0000-\u001f\u007f]/.test(config.model)) throw new Error('invalid_provider_config');
  let url: URL;
  try { url = new URL(config.baseUrl); } catch { throw new Error('invalid_provider_config'); }
  if (url.protocol !== 'https:' || !url.hostname || url.username || url.password || url.search || url.hash) throw new Error('invalid_provider_config');
  return { baseUrl: url.href.replace(/\/$/, ''), apiKey: config.apiKey, model: config.model };
}
export function codexPolicy(accessMode: CodexAccessMode = 'full-access') {
  if (!['workspace-write', 'full-access'].includes(accessMode)) throw new Error('codex_invalid_access_mode');
  return accessMode === 'full-access' ? { sandbox: 'danger-full-access', approvalPolicy: 'never' } : { sandbox: 'workspace-write', approvalPolicy: 'on-request' };
}
export function codexConfig(provider?: Pick<ResponsesProvider, 'baseUrl' | 'model'>, bridge?: string, accessMode: CodexAccessMode = 'full-access') {
  const policy = codexPolicy(accessMode);
  let text = `approval_policy = ${JSON.stringify(policy.approvalPolicy)}\nsandbox_mode = ${JSON.stringify(policy.sandbox)}\n`;
  if (provider) text += `model = ${JSON.stringify(provider.model)}\nmodel_provider = "olea"\n[model_providers.olea]\nname = "Olea Responses"\nbase_url = ${JSON.stringify(provider.baseUrl)}\nenv_key = "OLEA_CODEX_PROVIDER_KEY"\nwire_api = "responses"\nrequires_openai_auth = false\nrequest_max_retries = 0\nstream_max_retries = 0\n`;
  text += '[shell_environment_policy]\ninherit = "core"\nexclude = ["OLEA_*", "*API_KEY*", "*TOKEN*", "*SECRET*"]\n';
  if (accessMode === 'workspace-write') text += '[sandbox_workspace_write]\nnetwork_access = true\n';
  if (process.platform === 'win32') text += '[windows]\nsandbox = "unelevated"\n';
  if (!bridge) return text;
  const helper = fileURLToPath(new URL('./phone-mcp.js', import.meta.url));
  return text + `[mcp_servers.olea_phone]\ncommand = ${JSON.stringify(process.execPath)}\nargs = [${JSON.stringify(helper)}]\nenv = { OLEA_CODEX_PROVIDER_KEY = "", OLEA_PROVIDER_CONFIG = "", OLEA_BRIDGE_CONFIG = ${JSON.stringify(bridge)} }\nenv_vars = []\nstartup_timeout_sec = 10\ntool_timeout_sec = 15\n`;
}
export class CodexSession {
  readonly process: CodexProcess;
  threadId?: string;
  private turnId?: string;
  private inFlight = false;
  private execId?: string;
  private completed = new Set<string>();
  private constructor(readonly workspace: string, readonly accessMode: CodexAccessMode, options: { command: string; args?: string[]; env: NodeJS.ProcessEnv }, private event: (record: RecordData) => void) {
    this.process = new CodexProcess({ ...options, cwd: workspace });
    this.process.on('record', record => {
      if (record.params?.threadId === this.threadId) {
        if (record.method === 'turn/started' && this.inFlight && typeof record.params.turn?.id === 'string') this.turnId = record.params.turn.id;
        if (record.method === 'turn/completed' && typeof record.params.turn?.id === 'string') {
          this.completed.add(record.params.turn.id);
          if (this.completed.size > 32) this.completed.delete(this.completed.values().next().value!);
          if (this.turnId === record.params.turn.id) { this.inFlight = false; this.turnId = undefined; }
        }
      }
      this.event({ type: 'event', agent: 'codex', record });
    });
    this.process.on('fault', code => this.event({ type: 'fault', agent: 'codex', code }));
    this.process.on('exit', detail => this.event({ type: 'exit', agent: 'codex', ...detail }));
  }
  static async start(options: { directory: string; workspace: string; entry: string; resume: boolean; providerPath?: string; model?: string; bridgePath?: string; accessMode?: CodexAccessMode }, event: (record: RecordData) => void) {
    const accessMode = options.accessMode ?? 'full-access';
    codexPolicy(accessMode);
    await mkdir(options.directory, { recursive: true, mode: 0o700 });
    const directory = await realpath(options.directory), cwd = await realpath(options.workspace);
    await mkdir(join(directory, 'home'), { recursive: true, mode: 0o700 });
    const home = await realpath(join(directory, 'home'));
    if (home === cwd || home.startsWith(cwd + sep)) throw new Error('codex_home_inside_workspace');
    let expected: string | undefined;
    if (options.resume) {
      const saved = JSON.parse(await readFile(join(directory, 'thread.json'), 'utf8'));
      if (saved.cwd !== cwd || saved.home !== home || (saved.accessMode ?? 'workspace-write') !== accessMode || typeof saved.threadId !== 'string' || !saved.threadId) throw new Error('codex_resume_identity_mismatch');
      expected = saved.threadId;
    }
    const env: NodeJS.ProcessEnv = {};
    for (const name of ['PATH', 'Path', 'HOME', 'USERPROFILE', 'SystemRoot', 'WINDIR', 'COMSPEC', 'PATHEXT', 'TEMP', 'TMP', 'TMPDIR', 'LANG', 'SHELL', 'USER', 'LOGNAME']) if (process.env[name]) env[name] = process.env[name];
    env.CODEX_HOME = home;
    let provider: ResponsesProvider | undefined;
    if (options.providerPath) {
      try { provider = validateProvider(JSON.parse(await readFile(options.providerPath, 'utf8'))); }
      catch { throw new Error('invalid_provider_config'); }
      env.OLEA_CODEX_PROVIDER_KEY = provider.apiKey;
    }
    const model = options.model ?? provider?.model;
    if (model !== undefined && (typeof model !== 'string' || !model.trim() || model.length > 256 || /[\u0000-\u001f\u007f]/.test(model))) throw new Error('codex_invalid_model');
    await writeFile(join(home, 'config.toml'), codexConfig(provider ? { ...provider, model: model! } : undefined, options.bridgePath, accessMode), { mode: 0o600 });
    const isJs = /\.[cm]?js$/.test(options.entry);
    const instance = new CodexSession(cwd, accessMode, { command: isJs ? process.execPath : options.entry, args: isJs ? [options.entry] : [], env }, event);
    try {
      const initialized = await instance.process.initialize();
      const params: RecordData = { cwd, ...codexPolicy(accessMode) };
      if (model) params.model = model;
      if (provider) params.modelProvider = 'olea';
      if (expected) params.threadId = expected;
      const reply = await instance.process.request(options.resume ? 'thread/resume' : 'thread/start', params);
      const id = reply.thread?.id;
      if (typeof id !== 'string' || !id || (expected && id !== expected)) throw new Error('codex_thread_identity_mismatch');
      instance.threadId = id;
      const temporary = join(directory, `thread-${randomUUID()}.tmp`);
      await writeFile(temporary, JSON.stringify({ threadId: id, cwd, home, accessMode }), { mode: 0o600 });
      await rename(temporary, join(directory, 'thread.json'));
      return { instance, data: { agent: 'codex', accessMode, filesystemIsolation: false, pid: instance.process.child.pid, initialized, threadId: id, cwd, workspace: cwd, home, startupMs: performance.now() - instance.process.startedAt } };
    } catch (error) { await instance.stop(); throw error; }
  }
  async command(method: string, params: RecordData = {}) {
    if (!params || typeof params !== 'object' || Array.isArray(params)) throw new Error('codex_invalid_input');
    if (method === 'turn/interrupt') return this.interrupt();
    if (method === 'thread/read') {
      try { return await this.process.request(method, { threadId: this.threadId, includeTurns: true }); }
      catch (error: any) {
        if (error.rpcMessage !== 'list_turns is not supported yet') throw error;
        const metadata = await this.process.request(method, { threadId: this.threadId, includeTurns: false });
        return { ...metadata, historyUnavailable: 'stock_thread_turns_unavailable' };
      }
    }
    if (method === 'mcpServerStatus/list') return this.process.request(method, { threadId: this.threadId });
    if (method === 'command/exec/terminate') {
      if (!this.execId) throw new Error('codex_exec_not_active');
      const result = await this.process.request(method, { processId: this.execId });
      this.execId = undefined;
      return result;
    }
    if (method === 'command/exec') {
      if (this.accessMode !== 'full-access') throw new Error('codex_exec_requires_full_access');
      if (this.inFlight || this.execId) throw new Error('codex_turn_active');
      const { command, timeoutMs = 120_000 } = params;
      if (!Array.isArray(command) || !command.length || command.length > 128 || command.some(value => typeof value !== 'string' || value.length > 8192 || value.includes('\0')) || !command[0] || !Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 300_000) throw new Error('codex_invalid_exec');
      this.execId = randomUUID();
      try {
        const result = await this.process.request(method, { command, cwd: this.workspace, processId: this.execId, timeoutMs, outputBytesCap: 65536, sandboxPolicy: { type: 'dangerFullAccess' } }, timeoutMs + 5000);
        this.execId = undefined;
        return result;
      } catch (error) {
        // Keep the process ID available to explicit terminate after uncertain delivery.
        if (error instanceof Error && error.message.startsWith('codex_rpc_error_')) this.execId = undefined;
        throw error;
      }
    }
    if (method !== 'turn/start') throw new Error('codex_unsupported_command');
    if (this.inFlight || this.execId) throw new Error('codex_turn_active');
    if (typeof params.text !== 'string' || !params.text.trim() || params.text.length > 65536) throw new Error('codex_invalid_input');
    this.inFlight = true;
    // No experimental turn deadline/tool-count cutoff. Delivery uncertainty never permits replay.
    let result: RecordData;
    try { result = await this.process.request(method, { threadId: this.threadId, input: [{ type: 'text', text: params.text, text_elements: [] }] }); }
    catch (error) {
      if (!this.turnId && error instanceof Error && error.message.startsWith('codex_rpc_error_')) this.inFlight = false;
      throw error;
    }
    const turnId = result.turn?.id;
    if (typeof turnId !== 'string') throw new Error('codex_invalid_turn');
    if (!this.completed.has(turnId)) this.turnId = turnId;
    else { this.inFlight = false; this.turnId = undefined; }
    return result;
  }
  private interrupt() {
    if (!this.turnId) return Promise.reject(new Error('codex_turn_delivery_unknown'));
    return this.process.request('turn/interrupt', { threadId: this.threadId, turnId: this.turnId });
  }
  approve(id: string | number, decision: string) { this.process.approve(id, decision); }
  stop() { return this.process.stop(); }
}
