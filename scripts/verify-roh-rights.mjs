import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const manifest = JSON.parse(await readFile(path.join(root, 'data', 'roh-archive-assets.json'), 'utf8'));
const focal = JSON.parse(await readFile(path.join(root, 'data', 'roh-archive-focal-points.json'), 'utf8'));
const csv = await readFile(path.join(root, 'ROH_IMAGE_RIGHTS_LEDGER.csv'), 'utf8');
const failures = [];

function parseCsv(text) {
  const rows=[]; let row=[]; let field=''; let quoted=false;
  for (let i=0;i<text.length;i+=1) {
    const ch=text[i], next=text[i+1];
    if (ch==='"' && quoted && next==='"') { field+='"'; i+=1; }
    else if (ch==='"') quoted=!quoted;
    else if (ch===',' && !quoted) { row.push(field); field=''; }
    else if ((ch==='\n'||ch==='\r') && !quoted) { if(ch==='\r'&&next==='\n') i+=1; row.push(field); field=''; if(row.some(Boolean)) rows.push(row); row=[]; }
    else field+=ch;
  }
  if(field||row.length){row.push(field);rows.push(row);}
  const [headers,...values]=rows;
  return values.map(cells=>Object.fromEntries(headers.map((h,i)=>[h,cells[i]??''])));
}
const ledger = new Map(parseCsv(csv).map(row=>[row.asset_id,row]));
if (manifest.assets.length !== 2) failures.push(`Expected 2 ROH archival assets; found ${manifest.assets.length}.`);
for (const asset of manifest.assets) {
  const row=ledger.get(asset.id);
  if(!row) { failures.push(`${asset.id} missing from ROH rights ledger.`); continue; }
  if(row.status!=='Approved') failures.push(`${asset.id} is not approved.`);
  if(row.source_page!==asset.sourcePage) failures.push(`${asset.id} source mismatch.`);
  if(row.license!==asset.license) failures.push(`${asset.id} license mismatch.`);
  if(row.commercial_reuse!=='Yes') failures.push(`${asset.id} is not cleared for commercial reuse.`);
  if(row.share_alike==='Yes' && !asset.changes.toLowerCase().includes('derivatives remain')) failures.push(`${asset.id} share-alike disclosure is incomplete.`);
  if(!focal[asset.id]?.desktop || !focal[asset.id]?.mobile) failures.push(`${asset.id} focal points missing.`);
  if(!asset.caption || !asset.alt || !asset.creator || !asset.originalUrl || !asset.licenseUrl) failures.push(`${asset.id} context record incomplete.`);
}
if (!ledger.has('BT-ROH-001') || !ledger.has('BT-ROH-002')) failures.push('Required ROH asset IDs are missing.');
if (failures.length) { console.error('ROH rights verification failed:'); failures.forEach(f=>console.error(`- ${f}`)); process.exit(1); }
console.log('ROH rights verified: 2 authentic ROH event photographs, complete attribution, licenses and protected crops.');
