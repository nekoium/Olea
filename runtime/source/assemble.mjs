#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Assemble a release source companion without running upstream build scripts.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { execFile, execFileSync } from 'node:child_process';
import { promisify } from 'node:util';
import { gunzipSync } from 'node:zlib';
const exec = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
process.chdir(root);
const version = process.argv[2] ?? fs.readFileSync('android/app/build.gradle.kts', 'utf8').match(/versionName = "([^"]+)"/)?.[1];
if (!/^\d+\.\d+\.\d+$/.test(version ?? '')) throw Error('Expected a release version such as 0.1.1');
const work = `.setup/release-${version.replaceAll('.', '')}/redistribution`;
const archiveName = `olea-${version}-runtime-source`;
const stage = `${work}/${archiveName}`;
const lock = JSON.parse(fs.readFileSync('runtime/source/source-lock.json'));
const inputs = JSON.parse(fs.readFileSync('runtime/upstream-inputs.json'));
const digest = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const selected = new Set();
if (crypto.createHash('sha256').update(JSON.stringify(inputs)).digest('hex') !== lock.upstreamInputsCanonicalSha256) throw Error('Runtime input manifest changed; derive a matching source lock before packaging');
function checked(file, hash, size) {
  return fs.existsSync(file) && (size === undefined || fs.statSync(file).size === size) && digest(file) === hash;
}
function safePath(relative) {
  if (!relative || relative.includes('\\') || relative.split('/').some(p => !p || p === '..' || p === '.') || path.isAbsolute(relative)) throw Error(`Unsafe path: ${relative}`);
  return relative;
}
function put(relative, data) {
  selected.add(safePath(relative));
  const destination = `${stage}/${relative}`;
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, data);
}
async function download(entry) {
  selected.add(safePath(entry.path));
  if (!/^[a-f0-9]{64}$/.test(entry.sha256) || !entry.url.startsWith('https://')) throw Error('Invalid source lock');
  const file = `${stage}/${entry.path}`;
  if (checked(file, entry.sha256, entry.size)) return;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const cached = `.setup/release-010/redistribution/olea-0.1.0-runtime-source/${entry.path}`;
  if (file !== cached && checked(cached, entry.sha256, entry.size)) {
    fs.copyFileSync(cached, file);
    return;
  }
  await exec('curl', ['-fsSL', '--retry', '2', '--connect-timeout', '20', '--max-time', '240', entry.url, '-o', `${file}.part`]);
  if (!checked(`${file}.part`, entry.sha256, entry.size)) throw Error(`Source hash/size mismatch: ${entry.path}`);
  fs.renameSync(`${file}.part`, file);
}
// Copy regular documentation files without extracting devices, ownership or links.
// Original link targets are recorded so Debian shared-copyright aliases remain visible.
function ubuntuNotices(archive, abi) {
  const bytes = gunzipSync(fs.readFileSync(archive));
  const links = {};
  let longName;
  for (let offset = 0; offset + 512 <= bytes.length;) {
    const header = bytes.subarray(offset, offset + 512);
    if (header.every(b => b === 0)) break;
    const text = (start, end) => header.subarray(start, end).toString().replace(/\0.*$/s, '');
    const size = Number.parseInt(text(124, 136).trim() || '0', 8);
    if (!Number.isSafeInteger(size) || size < 0 || offset + 512 + size > bytes.length) throw Error('Invalid Ubuntu tar member');
    const type = text(156, 157);
    const payload = bytes.subarray(offset + 512, offset + 512 + size);
    let name = longName ?? [text(345, 500), text(0, 100)].filter(Boolean).join('/');
    longName = undefined;
    if (type === 'L') longName = payload.toString().replace(/\0.*$/s, '');
    else {
      name = name.replace(/^\.\//, '');
      if (name.startsWith('usr/share/doc/') || name.startsWith('usr/share/common-licenses/')) {
        if (type === '0' || type === '') put(`notices/ubuntu-${abi}/${name}`, payload);
        else if (type === '2' || type === '1') links[name] = text(157, 257);
      }
    }
    offset += 512 + Math.ceil(size / 512) * 512;
  }
  put(`notices/ubuntu-${abi}/symlinks.json`, JSON.stringify(links, null, 2) + '\n');
}
fs.mkdirSync(stage, { recursive: true });
// Refuse stale extra files in the download directories; they must not leak into a release.
const allowed = new Set(lock.files.map(e => e.path));
for (const category of ['ubuntu', 'node', 'termux', 'indexes']) {
  const base = `${stage}/${category}`;
  if (!fs.existsSync(base)) continue;
  for (const item of fs.readdirSync(base, { recursive: true, withFileTypes: true })) {
    if (!item.isFile()) continue;
    const relative = path.relative(stage, path.join(item.parentPath, item.name)).replaceAll('\\', '/');
    if (!allowed.has(relative) && !relative.endsWith('.part')) throw Error(`Unexpected staged source file: ${relative}`);
  }
}
let completed = 0;
const queue = [...lock.files];
await Promise.all(Array.from({ length: 4 }, async () => {
  while (queue.length) {
    const entry = queue.shift();
    await download(entry);
    if (++completed % 20 === 0 || completed === lock.files.length) console.log(`Verified sources ${completed}/${lock.files.length}`);
  }
}));
for (const abi of ['x86_64', 'arm64-v8a']) {
  for (const c of inputs.components.filter(c => c.abi === abi)) {
    const filename = { 'Ubuntu Base': 'ubuntu.tar.gz', Node: 'node.tar.xz', 'Termux PRoot': 'proot.deb', libtalloc: 'libtalloc.deb', 'libandroid-shmem': 'libandroid-shmem.deb' }[c.name];
    const file = [`.setup/core/${abi}/downloads/${filename}`, ...(abi === 'x86_64' ? [`.setup/core/downloads/${filename}`] : [])].find(f => checked(f, c.sha256));
    if (!file) throw Error(`Missing verified binary input for notices: ${abi}/${filename}; run runtime/build.sh first`);
    if (c.name === 'Ubuntu Base') {
      ubuntuNotices(file, abi);
      put(`inventories/${abi}-dpkg-status.txt`, execFileSync('tar', ['-xOzf', file, 'var/lib/dpkg/status'], { maxBuffer: 8 * 1024 * 1024 }));
    } else if (c.name === 'Node') {
      const arch = abi === 'x86_64' ? 'x64' : 'arm64';
      const license = execFileSync('tar', ['-xOJf', file, `node-v24.20.0-linux-${arch}/LICENSE`], { maxBuffer: 8 * 1024 * 1024 });
      put(`notices/node-${abi}-LICENSE`, license);
    } else {
      const pkg = filename.replace('.deb', '');
      const temp = `${work}/native-${abi}-${pkg}`;
      execFileSync(process.execPath, ['runtime/extract-deb.mjs', file, c.sha256, temp]);
      let license = execFileSync('tar', ['-xOJf', `${temp}/data.tar.xz`, `./data/data/com.termux/files/usr/share/doc/${pkg}/copyright`], { maxBuffer: 8 * 1024 * 1024 });
      if (!license.length) {
        if (!['proot', 'libtalloc'].includes(pkg)) throw Error(`Empty native notice: ${pkg}`);
        put(`notices/${pkg}-${abi}-copyright-link.txt`, execFileSync('tar', ['-tvJf', `${temp}/data.tar.xz`, `./data/data/com.termux/files/usr/share/doc/${pkg}/copyright`]));
        license = fs.readFileSync(`runtime/licenses/${pkg === 'proot' ? 'GPL-2' : 'GPL-3'}.txt`);
      }
      put(`notices/${pkg}-${abi}-copyright`, license);
    }
  }
}
for (const file of ['runtime/source/source-lock.json', 'runtime/source/ubuntu-packages.json', 'runtime/source/assemble.mjs', 'runtime/source/README.md', 'runtime/source/RELINKING.md', 'runtime/upstream-inputs.json', 'runtime/build.sh', 'runtime/extract-deb.mjs', 'runtime/verify-elf.mjs', 'runtime/linux.sh', 'runtime/prepare.sh', 'runtime/agent-maintenance.sh', 'runtime/THIRD_PARTY.md', 'LICENSE']) {
  put(`olea/${file}`, fs.readFileSync(file));
}
for (const file of fs.readdirSync('runtime/licenses')) put(`notices/native/${file}`, fs.readFileSync(`runtime/licenses/${file}`));
put('README.md', fs.readFileSync('runtime/source/README.md'));
put('RELINKING.md', fs.readFileSync('runtime/source/RELINKING.md'));
// Include only explicitly selected trees, never the surrounding workspace or local config.
const files = [...selected].sort();
put('SHA256SUMS', files.map(f => `${digest(`${stage}/${f}`)}  ${f}\n`).join(''));
const archive = `${work}/${archiveName}.tar.gz`;
const archiveList = `${work}/archive-files.txt`;
fs.writeFileSync(archiveList, [...selected].sort().map(f => `${archiveName}/${f}\0`).join(''));
execFileSync('tar', ['--sort=name', '--mtime=2026-11-13T00:00:00Z', '--owner=0', '--group=0', '--numeric-owner', '-czf', archive, '-C', work, '--no-recursion', '--null', '-T', archiveList], { stdio: 'inherit' });
const notices = ['runtime/THIRD_PARTY.md', ...fs.readdirSync('runtime/licenses').sort().map(f => `runtime/licenses/${f}`)].map(f => `\n===== ${f} =====\n\n${fs.readFileSync(f, 'utf8')}\n`).join('');
const noticesFile = `${work}/olea-${version}-runtime-NOTICES.txt`;
fs.writeFileSync(noticesFile, notices);
const result = { artifact: archive, sha256: digest(archive), bytes: fs.statSync(archive).size, notices: { artifact: noticesFile, sha256: digest(noticesFile), bytes: fs.statSync(noticesFile).size }, sourceFiles: lock.files.length, ubuntuSourceVersions: 65, abis: ['x86_64', 'arm64-v8a'] };
fs.writeFileSync(`${work}/artifact.json`, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
