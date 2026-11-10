// Original MIT. Authorized source only; protected stdin provisioning, no secret argv/env/output.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const source = 'C:/Users/Aria/Projects/Development/Olea/.setup/android-test-provider.local.json';
const bytes = readFileSync(source);
let config;
try { config = JSON.parse(bytes); } catch { throw Error('invalid_authorized_config'); }
if (config.baseUrl !== 'https://api.chiyi.cc/v1' || typeof config.apiKey !== 'string' || !config.apiKey.length) throw Error('invalid_authorized_config');
const adb = process.env.OLEA_ADB || 'C:/Users/Aria/AppData/Local/Android/Sdk/platform-tools/adb.exe';
const serial = process.env.OLEA_SERIAL || 'emulator-5554';
try { execFileSync(adb, ['-s',serial,'shell','run-as','dev.olea.m2.runtime','sh','-c',"'set -euC; umask 077; cat > files/rootfs/run/olea-provider.json'"], { input:bytes, timeout:15000, maxBuffer:65536, stdio:['pipe','pipe','pipe'], env:{...process.env,MSYS_NO_PATHCONV:'1'} }); } catch { throw Error('protected_config_provision_failed'); }
console.log('Authorized configuration provisioned into protected app-private mode600 file; values withheld.');
