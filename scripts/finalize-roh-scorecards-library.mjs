import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outputRoot = path.resolve(process.argv[2] || path.join(root, 'dist'));
const file = path.join(outputRoot, 'scorecards.html');
let html = await readFile(file, 'utf8');

html = html
  .replace(/Belt Theory scorecards for WWE, AEW, TNA, WCW and original ECW\./g, 'Belt Theory scorecards for WWE, AEW, TNA, WCW, original ECW and ROH.')
  .replace(/Five systems\.\s*<span>Measured on their own terms\.<\/span>/g, 'Six systems.<span>Measured on their own terms.</span>')
  .replace(/Five systems\. Measured on their own terms\./g, 'Six systems. Measured on their own terms.')
  .replace(/<strong>5<\/strong>\s*<h2>WWE · AEW · TNA · WCW · ECW<\/h2>/g, '<strong>6</strong><h2>WWE · AEW · TNA · WCW · ECW · ROH</h2>');

if (!html.includes('href="scorecard-roh.html"')) {
  const card = '<a class="promotion-card" href="scorecard-roh.html" style="--tone:#d44752"><div class="promotion-art"><span>ROH</span></div><div class="promotion-copy"><small>locked seven-dimension internal audit</small><strong>71.8</strong><h3>Strong architecture. Proven team ladder.</h3><p>ROH’s World title is highly stable and its team championships form the strongest documented internal path to the top. Pure continuity and cross-brand governance remain structural costs.</p><em>Open scorecard →</em></div></a>';
  const marker = '</div></section></main>';
  const index = html.lastIndexOf(marker);
  if (index < 0) throw new Error('Could not locate scorecard-library grid closing marker.');
  html = `${html.slice(0, index)}${card}${html.slice(index)}`;
}

if (!/Six systems\.\s*<span>Measured on their own terms\.<\/span>|Six systems\. Measured on their own terms\./.test(html)) {
  throw new Error('Scorecards library headline did not transition to six systems.');
}
if (!html.includes('href="scorecard-roh.html"')) throw new Error('ROH scorecard card is still missing from library.');
if (!html.includes('WWE · AEW · TNA · WCW · ECW · ROH')) throw new Error('Scorecards library promotion roster did not transition to six systems.');

await writeFile(file, html);
console.log('Finalized Scorecards library for six promotion systems including ROH.');
