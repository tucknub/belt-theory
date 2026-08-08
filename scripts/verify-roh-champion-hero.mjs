import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(process.argv[2] || path.join(here, '..', 'dist'));
const failures = [];
const checks = {
  'scorecard-roh.html': ['ff-score-roh-champion-hero','jay-briscoe-roh-world-champion-2013-672.jpg','roh-code-of-honor-2011-1280.jpg','ROH WORLD CHAMPION · 2013'],
  'index.html': ['scorecard-roh.html','jay-briscoe-roh-world-champion-2013-672.jpg'],
  'scorecards.html': ['scorecard-roh.html','jay-briscoe-roh-world-champion-2013-672.jpg']
};
for (const [file, needles] of Object.entries(checks)) {
  const html = await readFile(path.join(out, file), 'utf8');
  for (const needle of needles) if (!html.includes(needle)) failures.push(`${file}: missing ${needle}.`);
  if (/<(?:img|source)\b[^>]*(?:src|srcset)="https?:\/\//i.test(html)) failures.push(`${file}: remote image hotlink detected.`);
}
const scorecard = await readFile(path.join(out, 'scorecard-roh.html'), 'utf8');
const hero = scorecard.match(/<header class="ff-score-hero">[\s\S]*?<\/header>/)?.[0] || '';
if (!hero.includes('Jay Briscoe')) failures.push('ROH scorecard: champion credit missing from hero.');
if (!hero.includes('71.8')) failures.push('ROH scorecard: canonical internal diagnostic missing from hero.');
if (!scorecard.includes('42.4%')) failures.push('ROH scorecard: canonical tag-before-world finding missing.');
if (failures.length) {
  console.error('ROH champion hero verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('ROH champion hero verified: Jay Briscoe leads the promotion visually, authentic event context remains, and canonical findings are preserved.');
