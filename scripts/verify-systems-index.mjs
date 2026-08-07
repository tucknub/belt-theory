import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outputRoot = path.resolve(process.argv[2] || path.join(root, 'dist'));
const failures = [];
const file = path.join(outputRoot, 'systems-index.html');
let html;
try { html = await readFile(file, 'utf8'); } catch { failures.push('systems-index.html is missing.'); html = ''; }
const required = [
  'Championship Systems Index · v1.0','No fake master ranking.','WWE','AEW','TNA / Impact','WCW','Original ECW','ROH','71.8',
  'AEW 50.2 — WWE 49.8','TNA 51.9 — AEW 48.1','WWE 38.0 — ECW 32.7 — WCW 29.2',
  'Do not rank 73.2 against 68.2','Do not compare WWE’s 55.8 directly with WCW’s 90%','Universal Index gate'
];
for (const text of required) if (!html.includes(text)) failures.push(`systems-index.html missing required content: ${text}`);
if (!html.includes('Six promotion systems.')) failures.push('Systems Index is not in six-promotion state.');
if (!html.includes('<strong>6</strong><span>promotion systems</span>')) failures.push('Systems Index six-promotion stat is missing.');
if (!html.includes('Open ROH scorecard →')) failures.push('Systems Index is missing the ROH scorecard link.');
if ((html.match(/<h1\b/gi) || []).length !== 1) failures.push('systems-index.html must have exactly one h1.');
if (/<img\b[^>]*\bsrc="https?:\/\//i.test(html)) failures.push('systems-index.html must not hotlink browser imagery.');
const mobileNav = html.match(/<nav aria-label="Mobile navigation" class="mobilenav">[\s\S]*?<\/nav>/i)?.[0] || '';
if (!mobileNav.includes('href="systems-index.html"')) failures.push('Systems Index mobile navigation is missing its Systems index link.');
if (!/aria-current="page" class="active" href="systems-index\.html">Systems index<\/a>/.test(mobileNav)) failures.push('Systems Index mobile navigation is missing current-page semantics.');
const home = await readFile(path.join(outputRoot, 'index.html'), 'utf8');
if (!home.includes('href="systems-index.html">Open Systems Index</a>')) failures.push('Homepage primary CTA does not point to Systems Index.');
const css = await readFile(path.join(outputRoot, 'assets', 'site.css'), 'utf8');
if (!css.includes('/* Championship Systems Index */')) failures.push('Systems Index styles are missing.');
const pages = (await readdir(outputRoot)).filter((name) => name.endsWith('.html'));
if (pages.length !== 20) failures.push(`Expected 20 production HTML pages after ROH publication; found ${pages.length}.`);
if (failures.length) { console.error('Systems Index verification failed:'); failures.forEach((f)=>console.error(`- ${f}`)); process.exit(1); }
console.log('Championship Systems Index verified: six promotion systems, evidence labels preserved, mobile navigation complete and no false universal ranking.');
