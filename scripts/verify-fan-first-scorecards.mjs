import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(process.argv[2]||path.join(here,'..','dist'));
const failures=[];
const specs={
 'scorecard-wwe.html':['More orderly. More concentrated.','55.8','93.6%','8 / 8'],
 'scorecard-aew.html':['Sharp crown. Crowded middle.','68.2','5 / 10','82.1'],
 'scorecard-tna.html':['Strong ideas. Too many resets.','73.2','51.6%','21 / 46'],
 'scorecard-wcw.html':['Great ladder. Bad finish.','90%','9 / 10','64.8%'],
 'scorecard-ecw.html':['Small system. Clear jobs.','61.5%','>6<','4.9%'],
 'scorecard-roh.html':['Stable crown. Hidden tag ladder.','71.8','14 / 33','42.4%']
};
for(const [file,needles] of Object.entries(specs)){
 const html=await readFile(path.join(root,file),'utf8');
 for(const n of needles) if(!html.includes(n)) failures.push(`${file}: missing ${n}`);
 for(const n of ['If you remember only three things','What worked','What hurt','Bottom line','Check the research']) if(!html.includes(n)) failures.push(`${file}: missing fan-first section ${n}`);
 if(!html.includes('ff-score-hero')) failures.push(`${file}: fan-first scorecard hero missing.`);
 if(!html.includes('assets/fan-first.css')) failures.push(`${file}: fan-first stylesheet missing.`);
 const first=html.split('</header>')[0];
 if(/Governance & continuity|Role architecture|Pathway efficiency/i.test(first)) failures.push(`${file}: technical jargon leaked above the fold.`);
}
const roh=await readFile(path.join(root,'scorecard-roh.html'),'utf8');
if(!roh.includes('It is not a universal ranking')) failures.push('ROH: universal-ranking caveat missing.');
const aew=await readFile(path.join(root,'scorecard-aew.html'),'utf8');
if(!aew.includes('not a universal score')) failures.push('AEW: internal-score caveat missing.');
const tna=await readFile(path.join(root,'scorecard-tna.html'),'utf8');
if(!tna.includes('not a universal ranking')) failures.push('TNA: internal-score caveat missing.');
if(failures.length){console.error('Fan-first scorecard verification failed:');failures.forEach(f=>console.error(`- ${f}`));process.exit(1)}
console.log('Fan-first scorecards verified: six promotions lead with plain-English verdicts while preserving canonical findings and score caveats.');
