// Original MIT. Exercise the exact Android claim script against preserved task-local fixtures.
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, symlinkSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
mkdirSync('.setup', { recursive: true });
const fixture = mkdtempSync('.setup/claim-test-');
const script = resolve('spike/m2/runtime/claim-rootfs.sh').replaceAll('\\', '/');
let cases = 0;
try {
  for (const kind of ['directory', 'file', 'guard', 'symlink', 'dangling-symlink']) {
    const base = `${fixture}/${kind}`;
    mkdirSync(base);
    const protectedPath = `${base}/rootfs`;
    if (kind === 'file') writeFileSync(protectedPath, 'KEEP');
    else if (kind.includes('symlink')) {
      const target = resolve(fixture, `target-${kind}`);
      if (kind === 'symlink') { mkdirSync(target); writeFileSync(`${target}/sentinel`, 'KEEP'); }
      symlinkSync(target, protectedPath, 'junction');
    } else {
      mkdirSync(protectedPath);
      writeFileSync(`${protectedPath}/sentinel`, 'KEEP');
      if (kind === 'guard') writeFileSync(`${protectedPath}/.olea-m2-provisioned`, 'KEEP');
    }
    const result = spawnSync('bash', [script, base], { encoding: 'utf8', timeout: 3000 });
    assert.notEqual(result.status, 0, `${kind} must refuse`);
    assert.equal(existsSync(`${base}/tmp`), false, `${kind} must not reach staging mutation`);
    if (kind === 'file') assert.equal(readFileSync(protectedPath, 'utf8'), 'KEEP');
    else if (kind !== 'dangling-symlink') assert.equal(readFileSync(`${protectedPath}/sentinel`, 'utf8'), 'KEEP');
    cases++;
  }
  const fresh = `${fixture}/fresh`;
  assert.equal(spawnSync('bash', [script, fresh], { timeout: 3000 }).status, 0);
  assert(existsSync(`${fresh}/rootfs`) && existsSync(`${fresh}/tmp`) && existsSync(`${fresh}/m2`));
  cases++;
  console.log(JSON.stringify({ cases, status: 'pass', scope: 'host exact shell guard; Android existing-state rerun not performed' }));
} finally { rmSync(fixture, { recursive: true, force: true }); }
