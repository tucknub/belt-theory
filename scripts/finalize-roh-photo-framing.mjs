import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outputRoot = path.resolve(process.argv[2] || path.join(root, 'dist'));
const cssPath = path.join(outputRoot, 'assets', 'site.css');
let css = await readFile(cssPath, 'utf8');

const rules = `
/* ROH real-photo framing — preserve full historical subjects */
.archive-roh-scorecard-photo {
  min-height: 0 !important;
  grid-template-rows: auto auto !important;
  align-self: center !important;
}
.archive-roh-scorecard-photo .archive-production-image {
  width: 100% !important;
  height: auto !important;
  aspect-ratio: 1280 / 848;
  object-fit: contain !important;
  background: #050606;
}
.archive-roh-scorecard-evidence .archive-production-image {
  object-fit: contain !important;
  background: #050606;
}
@media (max-width: 980px) {
  .archive-roh-scorecard-photo { min-height: 0 !important; }
}
`;

if (!css.includes('/* ROH real-photo framing — preserve full historical subjects */')) {
  css = `${css.trimEnd()}\n${rules}`;
}
await writeFile(cssPath, css);
console.log('Protected both ROH historical photographs from destructive cover cropping.');
