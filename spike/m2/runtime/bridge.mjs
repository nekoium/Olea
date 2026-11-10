// Original MIT. Development transport only; tokens never appear in argv or output.
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
const adb = process.env.OLEA_ADB || 'C:/Users/Aria/AppData/Local/Android/Sdk/platform-tools/adb.exe';
const serial = process.env.OLEA_SERIAL || 'emulator-5554';
export function device(args) {
  return execFileSync(adb, ['-s', serial, ...args], { encoding: 'utf8', timeout: 15000, maxBuffer: 1024 * 1024, env: { ...process.env, MSYS_NO_PATHCONV: '1' } });
}
export async function bridge(operation, args = {}) {
  const config = JSON.parse(device(['exec-out', 'run-as', 'dev.olea.m2.runtime', 'cat', 'files/bridge-config.json']));
  const response = await fetch('http://127.0.0.1:8768/phone', {
    method: 'POST', headers: { Authorization: `Bearer ${config.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: `m2-${Date.now()}`, operation, args }), signal: AbortSignal.timeout(7000),
  });
  return { status: response.status, body: await response.json() };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(await bridge(process.argv[2] || 'capabilities', JSON.parse(process.argv[3] || '{}')), null, 2));
}
