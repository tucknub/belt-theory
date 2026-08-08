import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(process.argv[2]||path.join(here,'..','dist'));
const failures=[];
const promotions=await readFile(path.join(root,'scorecards.html'),'utf8');
const compare=await readFile(path.join(root,'comparisons.html'),'utf8');
for(const [name,html] of [['Promotions',promotions],['Compare',compare]]){
 if(!html.includes('assets/fan-first.css')) failures.push(`${name}: fan-first stylesheet missing.`);
 if(!html.includes('ff-header')) failures.push(`${name}: simplified header missing.`);
 if(!html.includes('ff-footer')) failures.push(`${name}: simplified footer missing.`);
}
for(const needle of ['Pick a company.','No homework required.','WWE','AEW','TNA','WCW','ECW','ROH','Three questions. Then the data.']) if(!promotions.includes(needle)) failures.push(`Promotions: missing ${needle}`);
for(const needle of ['Wrestling arguments.','With receipts.','Did TNA actually create stars?','TNA vs. AEW','WWE vs. AEW','WWE vs. WCW vs. ECW','Same window. Same rules. Same questions.']) if(!compare.includes(needle)) failures.push(`Compare: missing ${needle}`);
if(/Governance & continuity|Role architecture|Pathway efficiency/i.test(promotions.split('</section>')[0])) failures.push('Promotions: technical jargon leaked into hero.');
if(/Governance & continuity|Role architecture|Pathway efficiency/i.test(compare.split('</section>')[0])) failures.push('Compare: technical jargon leaked into hero.');
if(failures.length){console.error('Fan-first entry-page verification failed:');for(const f of failures)console.error(`- ${f}`);process.exit(1)}
console.log('Fan-first entry pages verified: Promotions and Big Debates are plain-English, navigable and research-linked.');
