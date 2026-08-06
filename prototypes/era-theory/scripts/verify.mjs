import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const files = await readdir(dist);
for (const required of ['index.html', 'styles.css', 'app.js']) {
  if (!files.includes(required)) throw new Error(`Missing ${required}`);
}
const html = await readFile(resolve(dist, 'index.html'), 'utf8');
const js = await readFile(resolve(dist, 'app.js'), 'utf8');
for (const marker of ['Final weighted verdict', 'The Ballard contradiction', 'Sensitivity lab']) {
  if (!html.includes(marker)) throw new Error(`Missing page marker: ${marker}`);
}
for (const marker of ['scenarioWeights', 'renderRadar', 'renderScorecards']) {
  if (!js.includes(marker)) throw new Error(`Missing JS marker: ${marker}`);
}
console.log('Verification passed: required files, sections, and interactions are present.');
