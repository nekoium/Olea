// Original Olea feasibility tooling, MIT. Acceptance comes from repository brief, not probe exit alone.
export const statuses = ['pass', 'fail', 'blocked', 'untested'];
export function catalog() {
  const cases = [];
  function add(id, expected, prerequisites = [], scope = 'android-emulator') {
    cases.push({ id, expected, scope, prerequisites, status: 'untested', observations: [], evidence: [], attempts: [] });
  }
  for (const [id, expected] of [
    ['baseline', 'Observe API36 x86_64 emulator, acceleration and current core/RAM allocation without destructive reset.'],
    ['packaging', 'Execute packaged native runtime under recorded target SDK and explain restrictions/workarounds.'],
    ['provenance', 'Record exact versions, hashes, sources and licenses for runtime and agent artifacts.'],
    ['shell', 'Run real Unix shell work and independently verify expected files/exit codes.'],
    ['node', 'Execute unmodified supported upstream Linux Node; record exact version and ABI.'],
    ['git', 'Create task repository, commit and independently verify Git object/file outcome.'],
    ['dns-tls', 'Resolve and verify TLS to required upstream/provider endpoints; separate outages.'],
    ['dependency', 'Install and use a representative dependency through ordinary package manager.'],
    ['children', 'Run child and descendant processes; verify exit and independently observe cleanup.'],
  ]) {
    const prerequisites = { baseline: [], packaging: ['runtime.baseline'], provenance: [], shell: ['runtime.packaging'], node: ['runtime.shell'], git: ['runtime.shell'], 'dns-tls': ['runtime.shell'], dependency: ['runtime.node', 'runtime.dns-tls'], children: ['runtime.node'] };
    add(`runtime.${id}`, expected, prerequisites[id], id === 'provenance' ? 'artifacts' : 'android-emulator');
  }
  for (const version of ['0.74.0', '1.0.0', '1.5.2']) {
    const base = `pi.${version}`;
    add(`${base}.install`, `Install stock Pi ${version} through supported upstream channel on fixed Node/base; no private patch.`, ['runtime.node', 'runtime.dns-tls']);
    for (const [name, expected] of [
      ['rpc', 'Exchange documented structured RPC replies/events with persistent stock subprocess.'],
      ['unix-files', 'Model uses file tools; runner independently verifies generated content.'],
      ['unix-shell', 'Model runs real shell work; runner independently verifies outcome.'],
      ['dependency', 'Model installs/uses representative dependency; independent execution confirms result.'],
      ['children', 'Model starts child work; independent process/file evidence confirms result.'],
      ['resume', 'Stop/restart saved session and verify resumed context and workspace independently.'],
      ['cancel', 'Cancel active work; verify protocol terminal state and no surviving descendants.'],
    ]) add(`${base}.${name}`, `${expected} Release ${version}.`, [`${base}.install`]);
  }
  add('pi.upgrade', 'Use ordinary upstream upgrade from earlier release to 1.5.2 on same base; verify stock files, sessions and tools.', ['pi.0.74.0.install', 'pi.1.5.2.install']);
  add('provider.compatibility', 'Verify authorized provider API format using protected local configuration, bounded test requests and redacted evidence.', ['runtime.dns-tls']);
  const categories = [
    ['accessibility-launch', 'Click target launcher entry through Accessibility and independently verify target foreground; intent alone fails.'],
    ['intent-url', 'Open supplied HTTPS URL and independently verify browser reached destination; dispatch alone fails.'],
    ['structured-api', 'Read valid permission-controlled Android API fixture result with independent assertion.'],
    ['files-media', 'Create/read exact content through user-granted Android folder access.'],
    ['notification', 'Read independently posted notification from separate fixture app via listener.'],
    ['capture', 'Capture harmless fixture after MediaProjection consent and independently verify image.'],
    ['app-integration', 'Invoke documented exported fixture interface and independently verify fixture state.'],
  ];
  for (const [category, expected] of categories) {
    add(`phone.direct.${category}`, expected, ['runtime.packaging']);
    add(`phone.agent.${category}`, `Stock Pi discovers supplied tool and chooses it: ${expected}`, [`phone.direct.${category}`, 'pi.1.5.2.rpc', 'provider.compatibility']);
  }
  add('phone.discovery', 'Pi receives actual registered descriptions and enumerates phone tools; captured events establish exposure.', ['pi.1.5.2.rpc']);
  add('phone.combined', 'Model performs one combined Unix/phone workflow; independent assertions establish both outcomes.', ['phone.agent.accessibility-launch', 'pi.1.5.2.unix-shell']);
  for (const name of ['permission-denied', 'revocation', 'stop']) add(`phone.${name}`, `Verify native permission-controlled bridge rejects/halts ${name} case without unauthorized action.`, ['runtime.packaging']);
  add('phone.hidden-oracle', 'Expected fixture state remains outside agent tool visibility and agent workspace; runner assertions are independent.');
  for (const agent of ['codex', 'claude']) {
    for (const name of ['install', 'startup', 'integration', 'authenticated-workflow']) add(`${agent}.${name}`, `Stock ${agent} ${name} on Android Linux; supported interface, no private port.`, name === 'install' ? ['runtime.node', 'runtime.dns-tls'] : [`${agent}.install`]);
  }
  for (const name of ['setup-time', 'install-size', 'cold-start', 'idle-cpu', 'streaming', 'one-session', 'two-sessions', 'direct-vs-managed', 'output-bounds', 'cleanup', 'constrained']) add(`cost.${name}`, `Measure ${name} with fixed workload, scope, units, versions and allocation; include Kotlin/PRoot/backend/agents and total cost.`, ['runtime.packaging', 'pi.1.5.2.rpc']);
  for (const name of ['app-switch', 'screen-lock', 'child-failure', 'app-death', 'reboot', 'update-preservation']) add(`lifecycle.${name}`, `Exercise ${name}; independently distinguish live execution, saved transcript/workspace and restored process; never repeat uncertain phone action.`, ['runtime.packaging']);
  for (const name of ['abi', 'unix', 'phone', 'thermals-battery']) {
    add(`physical.${name}`, `Verify ${name} on connected physical Android14 phone after recording ABI; emulator evidence is insufficient.`, [], 'physical-phone');
    cases.at(-1).status = 'blocked';
    cases.at(-1).observations.push('Physical Android14 phone not connected and ABI not established in this run.');
  }
  return cases;
}
