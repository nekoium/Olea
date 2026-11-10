// Original source MIT. Copy ONLY explicitly authorized provider config through stdin, never argv/logs.
import { readFile } from 'node:fs/promises';
import { adb } from './bridge-client.mjs';
const source = 'C:/Users/Aria/Projects/Development/Olea/.setup/android-test-provider.local.json';
const data = await readFile(source);
const parsed = JSON.parse(data.toString());
if (!parsed || typeof parsed !== 'object') throw Error('Invalid protected configuration');
adb(['shell', 'run-as', 'dev.olea.spike', 'sh', '-c', "'umask 077; cat > files/rootfs/run/olea-provider.json'"], { input: data, stdio: ['pipe', 'pipe', 'pipe'] });
console.log('Protected provider configuration provisioned without value disclosure.');
