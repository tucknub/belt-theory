import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const outputRoot=path.resolve(process.argv[2]||path.join(here,'..','dist'));
const failures=[];
const checks=[
  {page:'report-wwe-vs-aew.html',assets:['BT-WWE-001','BT-AEW-001','BT-GENERAL-001','BT-AEW-003'],values:['AEW 50.2 — WWE 49.8','Effective tie','WWE 101-day median; 27.8% short reigns','AEW 109-day median; 15.8% short reigns','75% first-time world durability','33.3% first-time world durability','AEW wins or effectively ties five of six models']},
  {page:'report-wwe-wcw-ecw.html',assets:['BT-GENERAL-001','BT-WCW-003','BT-ECW-003'],values:['WWE 38.0 — ECW 32.7 — WCW 29.2','WWE through balance','WWE wins every tested model; ECW closes the gap under prestige-first weighting.','WWE did not dominate every category. It won because it had the fewest structural weaknesses.']}
];
for(const check of checks){
  const html=await readFile(path.join(outputRoot,check.page),'utf8');
  for(const text of check.values) if(!html.includes(text)) failures.push(`${check.page} missing canonical value or finding: ${text}`);
  for(const asset of check.assets) if(!html.includes(`data-asset-id="${asset}"`)) failures.push(`${check.page} missing archival asset ${asset}`);
  if(!html.includes('image-credits.html')) failures.push(`${check.page} does not link image credits`);
  if(/src(set)?="https?:\/\//i.test(html)) failures.push(`${check.page} contains a remote image src or srcset`);
}
const threeWay=await readFile(path.join(outputRoot,'report-wwe-wcw-ecw.html'),'utf8');
if(/BT-ECW-001|BT-ECW-002|ECW_Championship\.jpg|Paulheyman\.jpg/i.test(threeWay)) failures.push('Three-way comparison contains prohibited WWE-era ECW imagery');
if(failures.length){console.error('Comparison-report verification failed:');failures.forEach(f=>console.error(`- ${f}`));process.exit(1)}
console.log('WWE vs. AEW and WWE vs. WCW vs. ECW verified: canonical results preserved and authentic source records remain independent.');
