// Original Olea feasibility tooling, MIT. No provider credentials are read here.
import { spawn } from 'node:child_process';
import { performance } from 'node:perf_hooks';

export function redact(text) {
  return String(text).replace(/(?<![A-Za-z0-9])(?:sk-ant-|sk-)[A-Za-z0-9_-]{16,}/g, '[REDACTED]')
    .replace(/(Bearer\s+)[A-Za-z0-9_.-]{24,}/gi, '$1[REDACTED]')
    .replace(/((?:api[_-]?key|authorization|access[_-]?token)\s*[=:]\s*)[^\s,}"']+/gi, '$1[REDACTED]');
}

// Call only with task-owned commands and public arguments; never pass secrets in argv.
export function run(command, args = [], { timeoutMs = 15000, maxBytes = 32768, cwd, env = process.env, input = '' } = {}) {
  return new Promise(resolve => {
    const started = performance.now();
    let stdout = '', stderr = '', bytes = 0, timedOut = false, overflow = false, spawnError;
    const child = spawn(command, args, { cwd, env, windowsHide: true, detached: process.platform !== 'win32', stdio: ['pipe', 'pipe', 'pipe'] });
    let finished = false, settlementTimer, pipeClosureTimeout = false, treeKillExitCode = null;
    const kill = () => {
      if (finished) return;
      if (process.platform === 'win32') {
        const killer = spawn('taskkill.exe', ['/pid', String(child.pid), '/t', '/f'], { windowsHide: true, stdio: 'ignore' });
        killer.on('error', () => child.kill());
        killer.on('close', code => { treeKillExitCode = code; if (code !== 0) child.kill(); });
        killer.unref();
      } else {
        try { process.kill(-child.pid, 'SIGKILL'); } catch { child.kill('SIGKILL'); }
      }
      if (!settlementTimer) settlementTimer = setTimeout(() => {
        pipeClosureTimeout = true;
        child.stdout.destroy();
        child.stderr.destroy();
        child.stdin.destroy();
        child.unref();
        finish(child.exitCode, child.signalCode);
      }, 2000);
    };
    const timer = setTimeout(() => { timedOut = true; kill(); }, timeoutMs);
    const finish = (code, signal) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      clearTimeout(settlementTimer);
      resolve({ command, args, exitCode: code, signal, timedOut, overflow, spawnError, pipeClosureTimeout, treeKillExitCode,
        elapsedMs: Math.round(performance.now() - started), stdout: redact(stdout), stderr: redact(stderr) });
    };
    for (const [name, stream] of [['stdout', child.stdout], ['stderr', child.stderr]]) {
      stream.on('data', chunk => {
        const available = Math.max(0, maxBytes - bytes);
        const text = chunk.subarray(0, available).toString();
        if (name === 'stdout') stdout += text; else stderr += text;
        bytes += chunk.length;
        if (bytes > maxBytes && !overflow) { overflow = true; kill(); }
      });
    }
    child.on('error', error => { spawnError = error.code ?? error.message; finish(null, null); });
    child.on('close', finish);
    child.stdin.on('error', () => {});
    child.stdin.end(input);
  });
}
