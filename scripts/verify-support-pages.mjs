import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const outputRoot=path.resolve(process.argv[2]||path.join(here,'..','dist'));
const pages=['scorecards.html','comparisons.html','research.html','methodology.html','about.html','update-policy.html'];
const failures=[];
for(const page of pages){
  const html=await readFile(path.join(outputRoot,page),'utf8');
  if(!html.includes('archive-support-hero')) failures.push(`${page} missing abstract support hero`);
  if(!html.includes('archive-image-policy')) failures.push(`${page} missing archive policy metadata`);
  if(!html.includes('image-credits.html')) failures.push(`${page} missing image-credits link`);
  if(/src(set)?="https?:\/\//i.test(html)) failures.push(`${page} contains a remote browser image`);
  if(/data-asset-id="BT-/i.test(html)) failures.push(`${page} unexpectedly presents historical photography without page-specific review`);
}
if(failures.length){console.error('Support-page verification failed:');failures.forEach(f=>console.error(`- ${f}`));process.exit(1)}
console.log('Support pages verified: abstract-only visual treatment, credits links and no remote or synthetic historical imagery.');
