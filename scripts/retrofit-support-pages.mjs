import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const outputRoot=path.resolve(process.argv[2]||path.join(root,'dist'));
const pages=['scorecards.html','comparisons.html','research.html','methodology.html','about.html','update-policy.html'];

for(const page of pages){
  const file=path.join(outputRoot,page);
  let html=await readFile(file,'utf8');
  html=html.replace('<a href="update-policy.html">Update policy</a>','<a href="update-policy.html">Update policy</a><a href="image-credits.html">Image credits</a>');
  html=html.replace('<link href="manifest.webmanifest" rel="manifest"/>','<link href="manifest.webmanifest" rel="manifest"/><meta content="Authentic photography for real people and real events; code-native abstraction for non-historical support surfaces." name="archive-image-policy"/>');
  html=html.replace('<section class="hero generic"','<section class="hero generic archive-support-hero"');
  html=html.replace('<section class="hero"','<section class="hero archive-support-hero"');
  await writeFile(file,html);
}

const cssPath=path.join(outputRoot,'assets','site.css');
let css=await readFile(cssPath,'utf8');
css+=`
/* Support pages use code-native abstraction only; no synthetic historical scene. */
.archive-support-hero{background-image:radial-gradient(circle at 82% 18%,rgba(232,173,40,.14),transparent 28%),linear-gradient(118deg,#030505 0,#0b0e0f 52%,#17130a 100%)!important}.archive-support-hero:before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(135deg,transparent 0 28px,rgba(255,255,255,.018) 28px 29px);pointer-events:none}.archive-support-hero .hero-inner{position:relative;z-index:2}
`;
await writeFile(cssPath,css);
console.log(`Retrofitted ${pages.length} support pages with abstract-only archive policy surfaces.`);
