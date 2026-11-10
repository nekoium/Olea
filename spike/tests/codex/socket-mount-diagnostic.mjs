// SPDX-License-Identifier: MIT
// Read-only own mount identity plus optional stock bundled-bwrap child preflight.
// Runtime owner only on Android; no credentials, phone operations, or provider requests.
import { open, realpath, readlink, readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

function deviceNumber(dev) {
  const d = BigInt(dev);
  return `${((d >> 8n) & 0xfffn) | ((d >> 32n) & 0xfffff000n)}:${(d & 0xffn) | ((d >> 12n) & 0xffffff00n)}`;
}
function mountPath(text) { return text.replace(/\\(040|011|012|134)/g, (_, octal) => String.fromCharCode(parseInt(octal, 8))); }
function contains(parent, path) { return parent === '/' || path === parent || path.startsWith(parent.replace(/\/$/, '') + '/'); }
if (process.argv[2] === '--self-test') {
  assert.equal(deviceNumber(0x104), '1:4');
  assert.equal(mountPath('/a\\040b'), '/a b');
  assert.equal(contains('/tmp', '/tmp2'), false);
  assert.equal(contains('/tmp', '/tmp/codex-daemon-0'), true);
  console.log('socket-mount diagnostic self-test passed');
} else {
  const [output, bwrap] = process.argv.slice(2);
  if (!output) throw new Error('usage: socket-mount-diagnostic.mjs output.json [stock-bundled-bwrap-path]');
  const report = { noModelRequests: true, noPhoneActions: true, diagnosticOnly: true, platform: process.platform, pid: process.pid, guestEffectiveUid: process.geteuid?.(), sourcePolicy: 'stock0.167.0 fixed canonical /tmp/codex-daemon-geteuid', status: 'observed' };
  const bounded = async path => {
    const file = await open(path, 'r');
    try { const buffer = Buffer.alloc(1024 * 1024 + 1); const { bytesRead } = await file.read(buffer); if (bytesRead > 1024 * 1024) throw new Error('diagnostic_input_limit'); return buffer.subarray(0, bytesRead).toString('utf8'); }
    finally { await file.close(); }
  };
  try {
    const tmp = await realpath('/tmp'); report.canonicalTmp = tmp;
    report.expectedSocketDirectory = `${tmp.replace(/\/$/, '')}/codex-daemon-${report.guestEffectiveUid}`;
    const fd = await open('/tmp', 'r');
    try {
      const stat = await fd.stat({ bigint: true }); report.tmpDevice = deviceNumber(stat.dev); report.tmpInode = stat.ino.toString();
      try { report.fdLink = await readlink(`/proc/self/fd/${fd.fd}`); } catch (error) { report.fdLinkError = error.code; }
      try {
        const text = await bounded(`/proc/self/fdinfo/${fd.fd}`);
        report.fdinfo = text.split('\n').filter(line => /^(mnt_id|ino|flags):/.test(line));
        report.mountId = /^mnt_id:\s*(\d+)$/m.exec(text)?.[1] ?? null;
      } catch (error) { report.fdinfoError = error.code ?? error.message; }
      const text = await bounded('/proc/self/mountinfo');
      const mounts = text.trim().split('\n').filter(Boolean).map(line => {
        const fields = line.split(' '), separator = fields.indexOf('-');
        return { id: fields[0], parent: fields[1], device: fields[2], root: mountPath(fields[3] ?? ''), destination: mountPath(fields[4] ?? ''), filesystem: fields[separator + 1] };
      });
      report.mountCount = mounts.length;
      report.descriptorMount = mounts.find(mount => mount.id === report.mountId) ?? null;
      report.pathContainingMounts = mounts.filter(mount => contains(mount.destination, tmp)).slice(0, 16);
      report.deviceMounts = mounts.filter(mount => mount.device === report.tmpDevice).slice(0, 16);
      report.observations = {
        descriptorMountFound: report.mountId === null ? null : Boolean(report.descriptorMount),
        descriptorDeviceMatches: report.descriptorMount ? report.descriptorMount.device === report.tmpDevice : null,
        descriptorDestinationContainsCanonicalTmp: report.descriptorMount ? contains(report.descriptorMount.destination, tmp) : null,
      };
    } finally { await fd.close(); }
    const status = await bounded('/proc/self/status');
    report.processStatus = status.split('\n').filter(line => /^(Uid|NoNewPrivs|Seccomp|Seccomp_filters):/.test(line));
    if (bwrap) {
      const bytes = await readFile(bwrap); report.bwrapSha256 = createHash('sha256').update(bytes).digest('hex');
      const args = ['--unshare-user', '--unshare-pid', '--ro-bind', '/', '/', '--proc', '/proc', '--dev', '/dev', '--', '/bin/true'];
      const result = spawnSync(bwrap, args, { cwd: '/', env: { PATH: process.env.PATH ?? '/usr/bin:/bin', LANG: 'C' }, encoding: 'utf8', timeout: 15000, maxBuffer: 65536 });
      report.bwrap = { args, status: result.status, signal: result.signal, errorCode: result.error?.code, stdout: (result.stdout ?? '').slice(0, 32768), stderr: (result.stderr ?? '').slice(0, 32768) };
    }
  } catch (error) { report.status = 'diagnostic_failed'; report.errorCode = error.code ?? error.message; }
  await writeFile(output, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ output, status: report.status }));
}
