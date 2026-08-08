import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(process.argv[2]||path.join(here,'..','dist'));
const failures=[];
const method=await readFile(path.join(root,'methodology.html'),'utf8');
const research=await readFile(path.join(root,'research.html'),'utf8');
const about=await readFile(path.join(root,'about.html'),'utf8');
for(const n of ['We start with a wrestling argument.','No statistics degree required.','Compare like with like.','Change the priorities and test it again.','What our nerdier terms actually mean.','We do not publish a comparison the data cannot support.']) if(!method.includes(n)) failures.push(`methodology: missing ${n}`);
for(const n of ['Want to check us?','Here are the receipts.','Source workbooks','Research hub','TNA vs. AEW','ROH final archive','Four findings worth auditing.']) if(!research.includes(n)) failures.push(`research: missing ${n}`);
for(const n of ['Wrestling arguments.','Championship evidence.','A wrestling publication with a research engine underneath it.','Six promotion systems. Three direct comparisons.']) if(!about.includes(n)) failures.push(`about: missing ${n}`);
for(const [name,html] of [['methodology',method],['research',research],['about',about]]){if(!html.includes('assets/fan-first.css')) failures.push(`${name}: fan-first stylesheet missing.`); if(!html.includes('ff-header')||!html.includes('ff-footer')) failures.push(`${name}: fan-first shell missing.`);}
if(failures.length){console.error('Fan-first support verification failed:');failures.forEach(f=>console.error(`- ${f}`));process.exit(1)}
console.log('Fan-first support pages verified: methodology, research and about now explain Belt Theory in plain English while keeping public source access.');
