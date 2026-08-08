import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const out=path.resolve(process.argv[2]||path.join(root,'dist'));
const assets=JSON.parse(await readFile(path.join(root,'data','roh-archive-assets.json'),'utf8')).assets;
const failures=[];
async function text(name){ return readFile(path.join(out,name),'utf8'); }
const roh=await text('scorecard-roh.html');
const home=await text('index.html');
const systems=await text('systems-index.html');
const scorecards=await text('scorecards.html');
const research=await text('research.html');
const credits=await text('image-credits.html');
const css=await text('assets/site.css');

for(const required of ['71.8','201','57.6%','42.4%','Strong architecture. Proven team ladder. Interrupted continuity.','BT-ROH-001','BT-ROH-002','18ZtPbJR7nWkvHXZki-wHOzfobG4K83PnxSyfA6atv5k']) if(!roh.includes(required)) failures.push(`ROH scorecard missing ${required}.`);
if(!/not a universal cross-promotion ranking|not evidence that ROH/i.test(roh)) failures.push('ROH scorecard universal-ranking warning missing.');
if(/src(set)?="https?:\/\//i.test(roh)) failures.push('ROH scorecard contains remote browser image src/srcset.');
if(!css.includes('/* ROH real-photo framing — preserve full historical subjects */')) failures.push('ROH full-subject photo-framing rules are missing.');
if(!css.includes('.archive-roh-scorecard-photo .archive-production-image')||!css.includes('object-fit: contain !important')) failures.push('ROH Code of Honor hero is not protected from destructive cover cropping.');
if(!roh.includes('class="archive-production-image archive-roh-contain" data-asset-id="BT-ROH-002"')) failures.push('Jay Briscoe championship portrait is not protected by contain framing.');

for(const asset of assets){
  if(!credits.includes(`id="${asset.id}"`)) failures.push(`Credits missing ${asset.id}.`);
  if(!credits.includes(asset.sourcePage)) failures.push(`Credits missing source for ${asset.id}.`);
  if(!credits.includes(asset.licenseUrl)) failures.push(`Credits missing license for ${asset.id}.`);
  for(const width of asset.widths){
    try{ await access(path.join(out,'assets','archive',`${asset.slug}-${width}.${asset.extension}`)); }
    catch{ failures.push(`Missing ROH derivative ${asset.slug}-${width}.${asset.extension}.`); }
  }
}
if(!home.includes('href="scorecard-roh.html"')||!home.includes('data-asset-id="BT-ROH-001"')) failures.push('Homepage ROH publication card missing.');
if(!home.includes('Six promotions. One repeatable model.')||!home.includes('<strong>6</strong><span>promotion systems</span>')) failures.push('Homepage six-promotion state missing.');
const sixSystemHeading=/Six systems\.\s*(?:<span>)?Measured on their own terms\.(?:<\/span>)?/i.test(scorecards);
const sixSystemRoster=scorecards.includes('WWE · AEW · TNA · WCW · ECW · ROH');
const rohLibraryCard=scorecards.includes('href="scorecard-roh.html"')&&scorecards.includes('<strong>71.8</strong>');
if(!sixSystemHeading||!sixSystemRoster||!rohLibraryCard) failures.push('Scorecard library ROH/six-system state missing.');
if(!systems.includes('Six promotion systems.')||!systems.includes('Open ROH scorecard')||!systems.includes('71.8')) failures.push('Systems Index ROH/six-system state missing.');
if(!systems.includes('no fake master ranking')&&!systems.includes('No fake master ranking')) failures.push('Systems Index anti-false-ranking rule missing.');
if(!research.includes('18ZtPbJR7nWkvHXZki-wHOzfobG4K83PnxSyfA6atv5k')||!research.includes('ROH Final')) failures.push('Research library missing canonical ROH workbook.');
const pages=(await readdir(out)).filter(n=>n.endsWith('.html'));
if(pages.length!==20) failures.push(`Expected 20 production HTML pages after ROH; found ${pages.length}.`);
const tags=roh.match(/<img\b[^>]*>/gi)||[];
for(const tag of tags){ const decorative=/aria-hidden="true"/i.test(tag); const alt=tag.match(/\balt="([^"]*)"/i)?.[1]?.trim(); if(!decorative&&!alt) failures.push(`ROH image missing alt text: ${tag.slice(0,100)}`); }
if(failures.length){ console.error('ROH publication verification failed:'); failures.forEach(f=>console.error(`- ${f}`)); process.exit(1); }
console.log('ROH publication verified: 20 production pages, two authentic ROH photographs, protected full-subject framing, six-system library state, canonical workbook and no false universal ranking.');
