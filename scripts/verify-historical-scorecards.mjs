import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const outputRoot=path.resolve(process.argv[2]||path.join(here,'..','dist'));
const checks=[
  {page:'scorecard-wcw.html',asset:'BT-WCW-003',values:['90%','400','12','64.8%','94','Nine of ten standard career-first world champions held earlier WCW-platform gold.'],source:'The scorecard is grounded in the project’s complete reign archives'},
  {page:'scorecard-ecw.html',asset:'BT-ECW-003',values:['61.5%','135','13','6','4.9%','Eight of thirteen mature World Champions held earlier ECW core gold; six held tag gold first.'],source:'The scorecard is grounded in the project’s complete reign archives'}
];
const failures=[];
for(const check of checks){
  const html=await readFile(path.join(outputRoot,check.page),'utf8');
  for(const text of check.values) if(!html.includes(text)) failures.push(`${check.page} missing canonical value or finding: ${text}`);
  if(!html.includes(`data-asset-id="${check.asset}"`)) failures.push(`${check.page} missing approved archival asset ${check.asset}`);
  if(!html.includes('image-credits.html')) failures.push(`${check.page} does not link production image credits`);
  if(/src(set)?="https?:\/\//i.test(html)) failures.push(`${check.page} contains a remote image src or srcset`);
  if(!html.includes(check.source)) failures.push(`${check.page} canonical source section changed`);
}
const ecw=await readFile(path.join(outputRoot,'scorecard-ecw.html'),'utf8');
if(/BT-ECW-001|BT-ECW-002|ECW_Championship\.jpg|Paulheyman\.jpg/i.test(ecw)) failures.push('Original ECW scorecard contains prohibited WWE-era ECW imagery');
if(failures.length){console.error('Historical scorecard verification failed:');failures.forEach(x=>console.error(`- ${x}`));process.exit(1)}
console.log('WCW and original ECW scorecards verified: canonical findings preserved, self-hosted rights-approved photography only.');
