import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(process.argv[2]||path.join(here,'..','dist'));
const failures=[];
const specs={
 'report-wwe-vs-aew.html':['Basically a draw.','AEW 50.2 — WWE 49.8','The 30-second version','AEW wins the top.','WWE wins more underneath it.','AEW wins or effectively ties five of six'],
 'report-tna-vs-aew.html':['TNA wins the system.','TNA 51.9 — AEW 48.1','The 30-second version','AEW wins the world title.','TNA wins more of the system underneath.','All six sensitivity models go to TNA'],
 'report-wwe-wcw-ecw.html':['WWE wins through balance.','WWE 38.0 — ECW 32.7 — WCW 29.2','The 30-second version','ECW gets surprisingly close.','WCW’s ladder is better than its finish.','WWE wins every version of the comparison we tested.']
};
for(const [file,needles] of Object.entries(specs)){
 const html=await readFile(path.join(root,file),'utf8');
 for(const n of needles) if(!html.includes(n)) failures.push(`${file}: missing ${n}`);
 for(const n of ['Round by round','Does the winner change if we value different things?','Bottom line','Check the research']) if(!html.includes(n)) failures.push(`${file}: missing fan-first section ${n}`);
 if(!html.includes('ff-matchup-hero')) failures.push(`${file}: fan-first matchup hero missing.`);
 if(!html.includes('assets/fan-first.css')) failures.push(`${file}: fan-first stylesheet missing.`);
 const first=html.split('</header>')[0];
 if(/Sensitivity testing|Dimension scorecard|Role architecture/i.test(first)) failures.push(`${file}: technical framing leaked above the fold.`);
}
if(failures.length){console.error('Fan-first comparison verification failed:');failures.forEach(f=>console.error(`- ${f}`));process.exit(1)}
console.log('Fan-first comparisons verified: three debate stories lead with answers, preserve canonical results and explain sensitivity in plain English.');
