// Original source MIT. Development observer: token captured privately, never printed.
import { execFileSync } from 'node:child_process';
export const adbPath = process.env.OLEA_ADB ?? 'C:/Users/Aria/AppData/Local/Android/Sdk/platform-tools/adb.exe';
export const serial = process.env.OLEA_SERIAL ?? 'emulator-5554';
export function adb(args, options = {}) { return execFileSync(adbPath, ['-s', serial, ...args], { encoding: 'utf8', timeout: 20000, maxBuffer: 1024 * 1024, ...options }); }
let configuration;
export async function bridge(route, body) {
  configuration ??= JSON.parse(adb(['exec-out', 'run-as', 'dev.olea.spike', 'cat', 'files/bridge-config.json']));
  const response = await fetch(configuration.url + route, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { Authorization: `Bearer ${configuration.token}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(10000),
  });
  const data = await response.json();
  return { status: response.status, ...data };
}
if (process.argv[1]?.endsWith('bridge-client.mjs')) {
  const operation = process.argv[2] ?? 'capabilities';
  const args = JSON.parse(process.argv[3] ?? '{}');
  console.log(JSON.stringify(await bridge('/phone', { id: 'direct-test', operation, args }), null, 2));
}
