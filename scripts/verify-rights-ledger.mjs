import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const manifest = JSON.parse(await readFile(path.join(root, 'data', 'archive-assets.json'), 'utf8'));
const focalPoints = JSON.parse(await readFile(path.join(root, 'data', 'archive-focal-points.json'), 'utf8'));
const csv = `${await readFile(path.join(root, 'IMAGE_RIGHTS_LEDGER.csv'), 'utf8')}\n${(await readFile(path.join(root, 'ROH_IMAGE_RIGHTS_LEDGER.csv'), 'utf8')).split(/\r?\n/).slice(1).join('\n')}`;

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') { field += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(field); field = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(field); field = '';
      if (row.some((value) => value !== '')) rows.push(row);
      row = [];
    } else field += char;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [headers, ...values] = rows;
  return values.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ''])));
}

const rows = parseCsv(csv);
const ledger = new Map(rows.map((row) => [row.asset_id, row]));
const failures = [];
const seenIds = new Set();
const seenSlugs = new Set();

for (const asset of manifest.assets) {
  if (seenIds.has(asset.id)) failures.push(`Duplicate manifest asset id: ${asset.id}`);
  if (seenSlugs.has(asset.slug)) failures.push(`Duplicate manifest asset slug: ${asset.slug}`);
  seenIds.add(asset.id); seenSlugs.add(asset.slug);
  const record = ledger.get(asset.id);
  if (!record) { failures.push(`${asset.id} is missing from the image rights ledgers`); continue; }
  if (record.status !== 'Approved') failures.push(`${asset.id} is not unconditionally approved: ${record.status}`);
  if (record.source_page !== asset.sourcePage) failures.push(`${asset.id} source-page mismatch`);
  if (record.license !== asset.license) failures.push(`${asset.id} license mismatch: ledger=${record.license}, manifest=${asset.license}`);
  if (record.commercial_reuse !== 'Yes') failures.push(`${asset.id} is not recorded for commercial reuse`);
  if (record.share_alike === 'Yes' && !asset.changes.toLowerCase().includes('derivatives remain')) failures.push(`${asset.id} is share-alike but its transformation disclosure does not preserve the derivative license`);
  const focal = focalPoints[asset.id];
  if (!focal?.desktop || !focal?.mobile) failures.push(`${asset.id} is missing desktop or mobile focal points`);
}
for (const row of rows) {
  if (['Candidate', 'Restricted context', 'Rejected for original ECW'].includes(row.status) && seenIds.has(row.asset_id)) failures.push(`${row.asset_id} has prohibited ledger status ${row.status} but appears in the build manifest`);
}
if (manifest.assets.length !== 10) failures.push(`Expected 10 approved publication archival assets; found ${manifest.assets.length}`);
for (const required of ['BT-ECW-003','BT-ROH-001','BT-ROH-002']) if (!seenIds.has(required)) failures.push(`Required period-correct asset ${required} is missing`);
if (seenIds.has('BT-ECW-001') || seenIds.has('BT-ECW-002')) failures.push('WWE-era ECW imagery is present in the build manifest');

if (failures.length) {
  console.error('Rights-ledger verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Rights ledger verified: ${manifest.assets.length} approved assets, complete licenses, source records and protected focal points.`);
