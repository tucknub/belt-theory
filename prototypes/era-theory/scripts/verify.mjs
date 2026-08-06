import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const files = await readdir(dist);
for (const required of ['index.html', 'home.css', 'home.js', 'styles.css', 'app.js']) {
  if (!files.includes(required)) throw new Error(`Missing ${required}`);
}
await stat(resolve(dist, 'reports', 'colts', 'index.html'));
const home = await readFile(resolve(dist, 'index.html'), 'utf8');
const report = await readFile(resolve(dist, 'reports', 'colts', 'index.html'), 'utf8');
const js = await readFile(resolve(dist, 'app.js'), 'utf8');
for (const marker of ['Every era leaves evidence.', 'Report library', 'Evidence first. Atmosphere second.']) {
  if (!home.includes(marker)) throw new Error(`Missing homepage marker: ${marker}`);
}
for (const marker of ['Final weighted verdict', 'The Ballard contradiction', 'Sensitivity lab']) {
  if (!report.includes(marker)) throw new Error(`Missing Colts report marker: ${marker}`);
}
for (const marker of ['scenarioWeights', 'renderRadar', 'renderScorecards']) {
  if (!js.includes(marker)) throw new Error(`Missing JS marker: ${marker}`);
}
console.log('Verification passed: umbrella homepage, Colts report route, assets, sections, and interactions are present.');
