// Original Olea feasibility tooling, MIT. Offline report renderer; no dependencies.
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { catalog, statuses } from './catalog.mjs';

export function buildMatrix(assessment = {}) {
  const cases = catalog();
  const indexed = new Map(cases.map(item => [item.id, item]));
  for (const entry of assessment.assessments ?? []) {
    const item = indexed.get(entry.id);
    if (!item) throw new Error(`Unknown case ${entry.id}`);
    if (!statuses.includes(entry.status)) throw new Error(`Invalid status for ${entry.id}`);
    if (entry.scope !== item.scope) throw new Error(`Scope mismatch for ${entry.id}`);
    if (entry.status === 'pass' && (!entry.independentAssertion?.trim() || !entry.evidence?.length)) throw new Error(`Pass needs independent assertion and evidence: ${entry.id}`);
    if (entry.evidence !== undefined && (!Array.isArray(entry.evidence) || entry.evidence.some(source => typeof source !== 'string' || !source.trim()))) throw new Error(`Invalid evidence references for ${entry.id}`);
    if (entry.observations !== undefined && (!Array.isArray(entry.observations) || entry.observations.some(value => typeof value !== 'string'))) throw new Error(`Invalid observations for ${entry.id}`);
    item.attempts.push({ ...entry });
    item.status = entry.status;
    item.observations = entry.observations ?? [];
    item.evidence = entry.evidence ?? [];
    item.independentAssertion = entry.independentAssertion;
  }
  for (let changed = true; changed;) {
    changed = false;
    for (const item of cases) {
      if (item.status !== 'untested') continue;
      const blocked = item.prerequisites.filter(id => ['fail', 'blocked'].includes(indexed.get(id)?.status));
      if (blocked.length) {
        item.status = 'blocked';
        item.observations.push(`Not executed because prerequisite failed/blocked: ${blocked.join(', ')}.`);
        changed = true;
      }
    }
  }
  for (const item of cases) {
    if (item.status === 'pass') {
      const missing = item.prerequisites.filter(id => indexed.get(id)?.status !== 'pass');
      if (missing.length) throw new Error(`Passed ${item.id} has unpassed prerequisites: ${missing.join(', ')}`);
    }
  }
  return cases;
}
export const escapeHtml = text => String(text ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const markdown = text => String(text ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
function defaultAssessment() {
  return { title: 'Olea feasibility evidence', expectedMission: 'Kotlin Android host supervises Ubuntu/PRoot, one shared stock Node backend and persistent stock Pi RPC; independent Unix/phone workflows, ordinary upstream upgrades and measured lifecycle/resource behavior establish feasibility.', actualMission: 'Probe infrastructure prepared; integration evidence not supplied to this report build.', judgment: 'insufficient-evidence', rationale: 'No completed Android integrated workflow has been assessed.', versions: [], measuredCosts: [], failures: [], compatibility: [], blockers: ['Physical Android14 phone disconnected; ABI unestablished.', 'Codex/Claude agent-specific authentication not supplied.'], nextDecision: 'Run independent Android cases and supply concrete evidence; do not accept the candidate from host-only results.', evidenceSources: [], tooling: [] };
}
export function render(assessment = {}) {
  const data = { ...defaultAssessment(), ...assessment };
  if (!['accept', 'revise', 'reject', 'insufficient-evidence'].includes(data.judgment)) throw new Error('Invalid judgment');
  const cases = buildMatrix(data);
  const counts = Object.fromEntries(statuses.map(status => [status, cases.filter(item => item.status === status).length]));
  const matrix = { schemaVersion: 1, generatedAt: new Date().toISOString(), ...data, counts, cases };
  delete matrix.assessments;
  const paragraphs = [
    ['Expected mission', data.expectedMission], ['Actual completion', data.actualMission],
    ['Judgment', `${data.judgment}: ${data.rationale}`], ['Next decision', data.nextDecision],
  ];
  const groups = [ ['Exact versions and provenance', data.versions], ['Measured costs', data.measuredCosts],
    ['Failures, retries and workarounds', data.failures], ['Upstream update compatibility', data.compatibility],
    ['Blockers and limits', data.blockers], ['Runnable artifacts and commands', data.reproduction], ['Evidence sources', data.evidenceSources], ['Workspace tooling', data.tooling] ];
  let md = `# ${data.title}\n\nGenerated ${matrix.generatedAt}. Statuses describe assessed evidence, not promises.\n\n`;
  let body = `<h1>${escapeHtml(data.title)}</h1><p>Generated ${escapeHtml(matrix.generatedAt)}. Statuses describe assessed evidence, not promises.</p>`;
  for (const [heading, content] of paragraphs) {
    md += `## ${heading}\n\n${content}\n\n`;
    body += `<section><h2>${heading}</h2><p>${escapeHtml(content)}</p></section>`;
  }
  md += `## Case totals\n\n${statuses.map(status => `${status}: ${counts[status]}`).join('; ')}.\n\n`;
  body += `<section><h2>Case totals</h2><p>${statuses.map(status => `${status}: ${counts[status]}`).join('; ')}.</p></section>`;
  for (const [heading, entries] of groups) {
    const list = entries?.length ? entries : ['No evidence supplied; not measured or not established.'];
    md += `## ${heading}\n\n${list.map(entry => `- ${entry}`).join('\n')}\n\n`;
    body += `<section><h2>${heading}</h2><ul>${list.map(entry => `<li>${escapeHtml(entry)}</li>`).join('')}</ul></section>`;
  }
  md += '## Whole-brief case matrix\n\n| Case | Scope | Status | Expected | Actual / independent evidence |\n| --- | --- | --- | --- | --- |\n';
  body += '<section><h2>Whole-brief case matrix</h2><div class="scroll"><table><thead><tr><th>Case</th><th>Scope</th><th>Status</th><th>Expected</th><th>Actual / independent evidence</th></tr></thead><tbody>';
  for (const item of cases) {
    const history = item.attempts.length > 1 ? item.attempts.map((attempt, index) => `Attempt ${index + 1}: ${attempt.status}; ${(attempt.observations ?? []).join(' ')}`).join(' ') : '';
    const actual = [...item.observations, item.independentAssertion, history, ...item.evidence.map(source => `Evidence: ${source}`)].filter(Boolean).join(' ');
    md += `| ${[item.id, item.scope, item.status, item.expected, actual || 'No assessed execution evidence.'].map(markdown).join(' | ')} |\n`;
    body += `<tr><th scope="row">${escapeHtml(item.id)}</th><td>${escapeHtml(item.scope)}</td><td class="${item.status}">${item.status}</td><td>${escapeHtml(item.expected)}</td><td>${escapeHtml(actual || 'No assessed execution evidence.')}</td></tr>`;
  }
  body += '</tbody></table></div></section><p>Original report tooling: MIT. Third-party runtime and package licenses remain separate. Host-only observations never establish Android or physical ARM64 behavior.</p>';
  const html = `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><title>${escapeHtml(data.title)}</title><style>body{font:16px/1.55 system-ui,sans-serif;margin:2rem auto;max-width:1200px;padding:0 1rem;color:#202722;background:#fafbf8}h1{font-size:2rem}h2{font-size:1.3rem;margin-top:2rem}li{margin:.4rem 0;overflow-wrap:anywhere}.scroll{overflow:auto}table{border-collapse:collapse;width:100%;font-size:14px}th,td{border:1px solid #cbd2c8;padding:.6rem;text-align:left;vertical-align:top;min-width:8rem;overflow-wrap:anywhere}thead{background:#e9eee5}.pass{color:#17602f}.fail{color:#9a1c20}.blocked{color:#78520c}.untested{color:#555}tr:nth-child(even){background:#f0f3ed}@media print{body{max-width:none;margin:0}.scroll{overflow:visible}th,td{font-size:9px;min-width:0}}</style></head><body>${body}</body></html>\n`;
  return { matrix, md, html };
}
async function main() {
  const input = process.argv[2];
  const assessment = input && input !== '-' ? JSON.parse(await readFile(input, 'utf8')) : {};
  const destination = resolve(process.argv[3] ?? 'spike/reports');
  const { matrix, md, html } = render(assessment);
  await mkdir(destination, { recursive: true });
  await Promise.all([
    writeFile(resolve(destination, 'matrix.json'), JSON.stringify(matrix, null, 2) + '\n'),
    writeFile(resolve(destination, 'FEASIBILITY_REPORT.md'), md),
    writeFile(resolve(destination, 'FEASIBILITY_REPORT.html'), html),
  ]);
  console.log(JSON.stringify({ destination, judgment: matrix.judgment, counts: matrix.counts }));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
