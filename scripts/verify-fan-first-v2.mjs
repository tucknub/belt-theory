import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(process.argv[2] || path.join(here, '..', 'dist'));
const failures = [];

for (const required of ['index.html','report-did-tna-create-stars.html','assets/fan-first.css']) {
  try { await access(path.join(root, required)); } catch { failures.push(`Missing fan-first output: ${required}`); }
}

const home = await readFile(path.join(root, 'index.html'), 'utf8');
const story = await readFile(path.join(root, 'report-did-tna-create-stars.html'), 'utf8');
const css = await readFile(path.join(root, 'assets', 'fan-first.css'), 'utf8');

const homeChecks = [
  ['fan-first headline', 'Did TNA actually'],
  ['plain-English answer', 'Yes. Barely.'],
  ['TNA split', '51.6%'],
  ['TNA comparison', '48.4%'],
  ['fan-first explanation', "We use championship history to test wrestling's biggest arguments."],
  ['stories entry point', 'The big debates'],
  ['promotion entry point', 'Pick a promotion'],
  ['sixth promotion', '>ROH<'],
  ['research transparency', 'Want the receipts?'],
  ['simple primary nav', '>Promotions<'],
  ['simple compare nav', '>Compare<'],
  ['simple methodology label', '>How it works<'],
  ['real TNA hero', 'assets/archive/raven-tna-impact-2010-1280.jpg'],
  ['canonical URL', '<link rel="canonical" href="https://belt-theory.tucknub.workers.dev/">']
];
for (const [label, needle] of homeChecks) if (!home.includes(needle)) failures.push(`Homepage missing ${label}.`);

const storyChecks = [
  ['question-first headline', 'Did TNA actually'],
  ['answer-first verdict', 'Yes. Barely.'],
  ['30-second summary', 'You can understand the result in 30 seconds.'],
  ['definition translation', 'what do we mean by “created”?'],
  ['21 of 46 finding', '21 / 46'],
  ['15 tag paths', '>15<'],
  ['11 X Division paths', '>11<'],
  ['19 of 28 durability', '19 / 28'],
  ['plain-English conclusion', 'argument is too simple'],
  ['research receipt', 'Here are the receipts.'],
  ['canonical URL', '<link rel="canonical" href="https://belt-theory.tucknub.workers.dev/report-did-tna-create-stars">']
];
for (const [label, needle] of storyChecks) if (!story.includes(needle)) failures.push(`TNA story missing ${label}.`);

for (const [name, html] of [['homepage', home], ['TNA story', story]]) {
  if (!html.includes('assets/fan-first.css')) failures.push(`${name}: fan-first stylesheet missing.`);
  if (!html.includes('ff-header')) failures.push(`${name}: simplified header missing.`);
  if (!html.includes('ff-footer')) failures.push(`${name}: simplified footer missing.`);
  if (!html.includes('<main id="content">')) failures.push(`${name}: main landmark missing.`);
  if (/Governance & continuity|Role architecture|Pathway efficiency/i.test(html.split('</section>')[0])) failures.push(`${name}: technical framework jargon leaked into first section.`);
}

const legacyTechnicalPages = ['scorecards.html','comparisons.html','research.html','methodology.html','about.html','scorecard-wwe.html','scorecard-aew.html','scorecard-tna.html','scorecard-wcw.html','scorecard-ecw.html','scorecard-roh.html'];
for (const page of legacyTechnicalPages) {
  const html = await readFile(path.join(root, page), 'utf8');
  if (!html.includes('assets/fan-first.css')) failures.push(`${page}: fan-first navigation layer missing.`);
  if (!html.includes('ff-header')) failures.push(`${page}: simplified global navigation missing.`);
}

if (!css.includes('.ff-story-grid') || !css.includes('.ff-promotion-grid') || !css.includes('.ff-article-hero')) failures.push('fan-first.css: core editorial components missing.');
if (!css.includes('@media (max-width:820px)')) failures.push('fan-first.css: mobile breakpoint missing.');
if (!css.includes('prefers-reduced-motion')) failures.push('fan-first.css: reduced-motion support missing.');

if (failures.length) {
  console.error('Fan-first v2 verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('Fan-first v2 verified: question-first homepage, flagship TNA story, simplified navigation, responsive editorial system and preserved research links.');
