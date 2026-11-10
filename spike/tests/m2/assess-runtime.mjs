// SPDX-License-Identifier: MIT
// Evidence assessment only. No Android, provider or provisioning operations.
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { writeFile } from 'node:fs/promises';
import { readGitArtifact, sha256, report } from './evidence.mjs';
import { readReceipts, appendReceipts } from './receipt-store.mjs';
export async function assessRuntime(commit = 'b1b8a74') {
  if (!/^[a-f0-9]{7,40}$/.test(commit)) throw Error('invalid_source_commit');
  const base = 'spike/m2/runtime/';
  const artifact = name => { const path = `git:${commit}:${base}${name}`; return { path, sha256: sha256(readGitArtifact(path)) }; };
  const load = name => JSON.parse(readGitArtifact(`git:${commit}:${base}${name}`).toString('utf8'));
  const core = load('evidence/core-a01.json'), native = load('evidence/core-a01-native.json'), manifest = load('artifact-manifest.json');
  if (native.targetSdk !== 36 || native.hostRealUid !== 10216 || native.exitCode !== 0 || core.identity.arch !== 'x64' || core.cases.some(c => c.status !== 'pass')) throw Error('runtime_source_changed_reassess');
  const source = [artifact('core.mjs'), artifact('core-a01.sh'), artifact('linux.sh'), artifact('artifact-manifest.json'), artifact('evidence/core-a01.json'), artifact('evidence/core-a01-native.json'), artifact('evidence/fixed-apk-hash.txt')];
  const startedAt = new Date(core.startedAt).toISOString(), endedAt = new Date(core.endedAt).toISOString();
  const receipts = [];
  const execution = { package: native.package, targetSdk: native.targetSdk, compileSdk: 36, minSdk: 26, androidApi: native.androidApi, measuredNodeArch: core.identity.arch, advertisedAbis: native.abis, actualDomain: core.identity.domain, realUid: native.hostRealUid, hostPid: native.hostPid, nodePid: core.identity.pid, nodePpid: core.identity.ppid, nodeProcExe: core.identity.procExe, loaderEnvAbsent: core.identity.loaderEnvAbsent, apkSha256: 'dbd494c8f9c533b20a5ed0a067dbb2496a34c2494911a9fc9cb4fb19f6435887' };
  const limits = ['Actual target36 service domain, not development run-as.', 'Emulator x64 only; advertised arm64-v8a is not physical ARM64 execution.', 'Core deterministic work is not stock-agent/provider/shared-backend acceptance.', 'Single staged rootfs with manual recovery is not repeated corrected fresh install/update/recovery proof.', 'Native childPid null; source-controlled inner /proc identities corroborate actual children.', 'Residual linkerconfig warning retained; old glibc preload warnings belong earlier APK/launcher attempts.', 'Root exit and bounded pipe drain do not establish all descendant exit.'];
  const add = (caseId, summary, assertions, extra = {}) => receipts.push({ attemptId: `runtime-core-a01-${caseId.replaceAll('.', '-')}`, caseId, context: 'android-app', mode: 'direct', status: 'pass', startedAt, endedAt, summary, artifacts: source,
    assertions: assertions.map(name => ({ name, independent: true, passed: true })), execution, provenance: { sourceCommit: commit, nativePayloadSha256: manifest.packagedNativeSha256, components: manifest.components, licenseLimits: manifest.provenanceLimits, transform: manifest.transform },
    provider: { topLevelPrompts: 0, modelRequests: 0 }, limits, currentState: { observedAt: endedAt, hostPidDuringCase: native.hostPid, phonePermissionsAndStop: 'not queried by this deterministic case', laterProcessState: 'unknown from this snapshot' }, ...extra });
  const a01 = load('evidence/candidate-a01.json'), a02 = load('evidence/candidate-a02.json');
  for (const [attempt, status, summary] of [
    [a01, 'fail', 'First service candidate returned wrapper exit0 but guest shell and Node markers were127: linux.sh missing during provisioning race. Do not trust wrapper exit0.'],
    [a02, 'pass', 'After staging launcher, actual target36 app service executed read-only APK PRoot/loaders and writable guest shell/upstream Node24.20.0 x64; inner shell/Node exit0. Candidate source also checks child exit/stdout42 but no separate child identity retained in this attempt.']
  ]) receipts.push({ attemptId: `runtime-${attempt.attempt}-modern`, caseId: 'runtime.modern', context: 'android-app', mode: 'direct', status, startedAt: new Date(attempt.startedAtMs).toISOString(), endedAt: new Date(attempt.endedAtMs).toISOString(), summary,
    artifacts: [artifact(`evidence/${attempt.attempt}.json`), artifact('candidate-a01.sh'), artifact('evidence/first-source-hashes.txt')], assertions: status === 'pass' ? [{ name: 'native_domain_and_inner_exit_markers', independent: true, passed: true }] : [],
    execution: { hostPid: attempt.hostPid, realUid: attempt.hostRealUid, domain: attempt.hostDomain.replaceAll('\0', ''), targetSdk: attempt.targetSdk, androidApi: attempt.androidApi, childPid: null, apkSha256: '375870be5efcf79a1cd16fb60e95e0a91b68904634164b1c308bdbcb3f99b0ab' },
    provider: { topLevelPrompts: 0 }, retryOf: status === 'pass' ? 'runtime-candidate-a01-modern' : null,
    limits: ['Initial APK hash is distinct from later eacb/dbd APKs; no retroactive binary credit.', 'Ignored glibc LD_PRELOAD warnings retained; later environment cleanup cannot erase them.', 'No generic cleanup or full fresh-install/update acceptance.'] });
  add('runtime.modern', 'Actual target36 Kotlin service/UID10216/untrusted_app supervised writable guest Node and deterministic core with packaged read-only PRoot/loader payload hashes corroborated in native stdout.', ['actual_native_service_domain', 'native_payload_hashes_match', 'guest_node_exit_zero']);
  add('unix.shell', 'Actual /bin/sh test independently asserted printf42 and emitted SHELL_ASSERT_OK.', ['shell_expression_exit_stdout']);
  add('unix.node', 'Stock upstream Node24.20.0 Linux x64 /opt/node/bin/node executed under real Android UID10216/untrusted_app, clean guest loader environment.', ['node_version_arch_real_uid_exe']);
  const nested = core.cases.find(c => c.name === 'nested-node').detail;
  add('unix.child', `Core Node${core.identity.pid}->child${nested.pid}, recorded PPID/stat/startticks and child exit0; source-controlled spawnSync and result assertions executed.`, ['actual_child_parentage_status'], { execution: { ...execution, child: nested } });
  add('unix.nested-child', `Child${nested.pid}->nested${nested.nested.pid} realUID10216, parentage/stat/startticks, nested value42 and status0 asserted. This is direct deterministic work, not model child causality.`, ['actual_nested_parentage_uid_exit_value'], { execution: { ...execution, child: nested } });
  const git = core.cases.find(c => c.name === 'git-fresh-object').detail;
  add('unix.git-object', `Fresh Git2.43.0 commit${git.commit}; independent git-show exact randomized value check SHA256${git.valueSha256}.`, ['fresh_git_commit_object_exact_value']);
  add('unix.dns-tls', 'DNS registry lookup resolved; default certificate-validated TLS metadata HTTP200, socket authorized=true, expected version7.0.0 asserted.', ['dns_lookup', 'tls_authorized_http200_metadata']);
  add('unix.dependency', 'Ordinary upstream npm install is-number@7.0.0 with retries0 succeeded; independent require accepts42 and rejects olea.', ['installed_dependency_fresh_behavior']);
  const boot = load('evidence/boot-attempts.json');
  const assessedAt = new Date().toISOString();
  const blocked = (caseId, summary) => receipts.push({ attemptId: `runtime-boot-a02-${caseId.replaceAll('.', '-')}`, caseId, context: caseId.startsWith('physical.') ? 'physical-phone' : 'android-app', mode: 'direct', status: 'blocked', startedAt: assessedAt, endedAt: assessedAt, summary,
    artifacts: [artifact('evidence/boot-attempts.json'), artifact('evidence/baseline-query-a02.txt'), artifact('evidence/emulator-identity-a02.txt')], assertions: [], execution: { timestampBasis: 'Assessment time; original boot attempt UTC and emulator identities retained in artifact.', avd: boot.avd, serial: boot.serial, allocation: boot.attempts[1].allocation },
    limits: ['No baseline reinstall, reset, deletion or snapshot restoration performed.', 'Missing original M1 app/cache cause unproved; historical M1 evidence unchanged.', 'No physical ABI inference from emulator.'] });
  blocked('historical.state-preservation', 'Current intended emulator has no dev.olea.spike package; historical host artifact/cache path missing. M1 original-state preservation cannot be reverified; cause unproved, no deletion/reset by new worker. Independent M2 fresh state remains separate.');
  for (const name of ['abi', 'unix', 'agents', 'phone', 'battery', 'thermals']) blocked(`physical.${name}`, 'No connected physical device; physical Android14 ABI and dependent device measurements blocked.');
  const prepare = load('evidence/prepare-a01.json');
  receipts.push({ attemptId: 'runtime-prepare-a01-fresh', caseId: 'runtime.fresh', context: 'android-app', mode: 'direct', status: 'fail', startedAt: new Date(prepare.startedAtMs).toISOString(), endedAt: new Date(prepare.endedAtMs).toISOString(), summary: 'Fresh staged setup first preparation exited2 after tar sys Cannot utime Permission denied. Initial provisioning guard source also failed closedness review; no observed overwrite/preservation loss asserted.',
    artifacts: [artifact('evidence/provision-a01.txt'), artifact('evidence/prepare-a01.json'), artifact('prepare-a01.sh')], assertions: [], failureClass: 'runtime', limits: ['A corrected source guard/host refusal test is not a repeated fresh Android provisioning pass.', 'Existing M2 rootfs was preserved and not rerun as fresh.'] });
  receipts.push({ attemptId: 'runtime-prepare-a02-fresh', caseId: 'runtime.fresh', context: 'android-app', mode: 'direct', status: 'fail', startedAt: assessedAt, endedAt: assessedAt, summary: 'Second preparation reached240s during dpkg CA configuration; uncaught native InterruptedIOException killed host4134 before terminal JSON. Native receipt absent, not clean timeout/exit proof. Later bounded recovery yielded passing core but no repeat corrected fresh procedure.',
    artifacts: [artifact('evidence/prepare-a02.json'), artifact('evidence/prepare-a02-native-crash.txt'), artifact('evidence/core-a01.json')], assertions: [], failureClass: 'runtime', retryOf: 'runtime-prepare-a01-fresh', limits: ['Assessment timestamp only; source retains crash UTC2026-11-10T17:16:12.716Z.', 'Source-only guard defect does not prove any actual data loss.', 'New drain fix and core result do not erase original crash.'] });
  const harness = load('evidence/harness-assertions.json');
  for (const [name, summary] of [
    ['timeout', '5s native timeout caught with same host6197 surviving; rootExitObserved true. Root-only signaling and separate fixture observation do not establish general descendant cleanup.'],
    ['output-bytes', 'Actual multibyte flood stdout90000/stderr80107 bytes retained65536 bytes per stream, outputTruncated true; no live drainers. This is native byte capture, not backend protocol-frame/queue acceptance.'],
    ['inherited-pipes', 'Root exited while fixture descendant held pipes; native reported inheritedPipesAfterJoin true, settled4141ms, no live drainers. Descendant exit not established.']
  ]) {
    const fixtureName = { timeout: 'timeout-check-a01', 'output-bytes': 'utf8-drain-a01', 'inherited-pipes': 'inherited-pipe-a01' }[name];
    const fixture = load(`evidence/${fixtureName}.json`);
    receipts.push({ attemptId: `runtime-harness-a01-${name}`, caseId: `native.${name}`, context: 'android-app', mode: 'direct', status: 'pass', startedAt: new Date(fixture.startedAtMs).toISOString(), endedAt: new Date(fixture.endedAtMs).toISOString(),
    summary, artifacts: [artifact('evidence/harness-assertions.json'), artifact('assess-harness.mjs'), artifact('evidence/timeout-check-a01.json'), artifact('evidence/utf8-drain-a01.json'), artifact('evidence/inherited-pipe-a01.json')], assertions: [{ name: 'retained_narrow_native_harness_assertion', independent: true, passed: harness.status === 'pass' }],
    execution, limits: ['Native harness fixtures only; shared backend buffering remains untested.', 'Raw drain InterruptedIOException recorded but caught; original old-APK crash remains separate.', 'No model/provider calls; no generic descendant exit claim.'] });
  }
  const destination = resolve('spike/m2/evidence/evidence');
  const path = resolve(destination, 'receipts.json');
  const existing = await readReceipts(path);
  const stable = receipts.map(r => existing.find(old => old.attemptId === r.attemptId) ?? r);
  const all = await appendReceipts(path, stable, resolve('.'));
  await writeFile(resolve(destination, 'runtime-core-assessment.json'), JSON.stringify(stable, null, 2) + '\n');
  await report(path, resolve('spike/m2/reports'), resolve('.'), 'interim');
  return { sourceCommit: commit, assessedAttempts: stable.length, retainedReceipts: all.length, providerTopLevelPrompts: 0 };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) console.log(JSON.stringify(await assessRuntime(process.argv[2])));
