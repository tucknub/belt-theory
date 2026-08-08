import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(process.argv[2]||path.join(here,'..','dist'));
const failures=[];
const specs={
 'systems-index.html':['Six promotions.','Six different machines.','This is a map, not a fake universal ranking.','TNA 73.2','AEW 68.2','ROH 71.8','Use the direct comparisons.'],
 'update-policy.html':['If the history changes,','the answer can change.','New title reigns','Corrections','Method changes','A published matched comparison keeps its window.'],
 'image-credits.html':['Real wrestling history.','Visible sources.','The visual rule','AI may help with abstract design elements.'],
 '404.html':['Vacated title','This page dropped the belt.','Back to Belt Theory']
};
for(const [file,needles] of Object.entries(specs)){
 const html=await readFile(path.join(root,file),'utf8');
 for(const n of needles) if(!html.includes(n)) failures.push(`${file}: missing ${n}`);
 if(!html.includes('assets/fan-first.css')) failures.push(`${file}: fan-first stylesheet missing.`);
 if(!html.includes('ff-header')||!html.includes('ff-footer')) failures.push(`${file}: fan-first shell missing.`);
}
const credits=await readFile(path.join(root,'image-credits.html'),'utf8');
const creditCount=(credits.match(/class="ff-credit-row"/g)||[]).length;
if(creditCount!==10) failures.push(`image-credits.html: expected 10 archival credit rows, found ${creditCount}.`);
const systems=await readFile(path.join(root,'systems-index.html'),'utf8');
const systemCount=(systems.match(/class="ff-system-row"/g)||[]).length;
if(systemCount!==6) failures.push(`systems-index.html: expected 6 promotion rows, found ${systemCount}.`);
if(failures.length){console.error('Fan-first utility verification failed:');failures.forEach(f=>console.error(`- ${f}`));process.exit(1)}
console.log('Fan-first utility pages verified: Systems Index, Update Policy, Image Credits and 404 use the same plain-English publication shell.');
