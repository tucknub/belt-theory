import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const out = path.resolve(process.argv[2] || path.join(root, 'dist'));
const origin = 'https://belt-theory.tucknub.workers.dev';
const archive = JSON.parse(await readFile(path.join(root, 'data', 'archive-assets.json'), 'utf8'));
const archiveMap = new Map(archive.assets.map((a) => [a.id, a]));
let rohMap = new Map();
try {
  const roh = JSON.parse(await readFile(path.join(out, 'assets', 'archive', 'roh-manifest.json'), 'utf8'));
  rohMap = new Map(roh.assets.map((a) => [a.id, a]));
} catch {}

const esc = (s) => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function archiveSrc(id){const a=archiveMap.get(id); if(!a) return null; return `assets/archive/${a.slug}-${a.defaultWidth}.${a.extension}`;}
function archiveAlt(id){return archiveMap.get(id)?.alt || '';}
function rohSrc(id){const a=rohMap.get(id); if(!a) return null; const v=a.variants?.find((x)=>x.requestedWidth===a.defaultWidth)||a.variants?.at(-1); return v?`assets/archive/${v.filename}`:null;}
function rohAlt(id){return rohMap.get(id)?.alt || '';}

const shell = await readFile(path.join(out, 'index.html'), 'utf8');
const rawHeader = shell.match(/<header class="ff-header">[\s\S]*?<\/header>/i)?.[0];
const footer = shell.match(/<footer class="ff-footer">[\s\S]*?<\/footer>/i)?.[0];
if(!rawHeader || !footer) throw new Error('Fan-first shell missing.');
function header(){return `<a class="ff-skip" href="#content">Skip to content</a>${rawHeader.replaceAll(' aria-current="page"','').replace('href="scorecards.html"','href="scorecards.html" aria-current="page"')}`;}
function head(p){return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#050505"><meta name="color-scheme" content="dark"><meta name="description" content="${esc(p.description)}"><meta name="robots" content="index, follow, max-image-preview:large"><title>${esc(p.name)} championship breakdown — Belt Theory</title><link rel="icon" href="assets/mark.svg"><link rel="canonical" href="${origin}/${p.file.replace(/\.html$/,'')}"><meta property="og:type" content="article"><meta property="og:site_name" content="Belt Theory"><meta property="og:title" content="${esc(p.name)} championship breakdown — Belt Theory"><meta property="og:description" content="${esc(p.description)}"><meta property="og:url" content="${origin}/${p.file.replace(/\.html$/,'')}"><meta property="og:image" content="${origin}/${p.hero}"><meta name="twitter:card" content="summary_large_image"><link rel="stylesheet" href="assets/fan-first.css"></head>`;}
function mediaCredit(id, roh=false){const a=roh?rohMap.get(id):archiveMap.get(id); if(!a) return ''; return `<a class="ff-photo-credit" href="${esc(a.sourcePage)}" rel="noreferrer" target="_blank">${esc(a.shortCredit)}</a>`;}

const promos = [
  {
    file:'scorecard-wwe.html', name:'WWE', tone:'#d6d6d6', hero:archiveSrc('BT-WWE-001'), heroAlt:archiveAlt('BT-WWE-001'), creditId:'BT-WWE-001',
    description:'A plain-English Belt Theory breakdown of WWE under Triple H versus late Vince: what improved, what stayed concentrated and what the title history says.',
    verdict:'More orderly. More concentrated.',
    deck:'Triple H reduced championship churn and improved several secondary and tag-title roles. The tradeoff is a very concentrated men’s world-title picture—and we still do not know whether greater order creates a higher long-term star-making ceiling.',
    heroStat:'55.8', heroLabel:'Triple H share of the equal-window era score', heroNote:'Triple H beat late Vince 55.8–44.2 in the locked seven-year comparison.',
    remember:[
      ['The belts became calmer.','Fewer rapid resets and clearer reign plans raised WWE’s floor.'],
      ['Lower titles mattered.','All eight matched-period first-time men’s world champions held WWE tag or secondary gold first.'],
      ['The top became concentrated.','The primary men’s world-title top-three share reached 93.6%.']
    ],
    best:['The United States title became a stronger secondary lane.','Both men’s tag lineages became calmer.','Women’s first-time world champions retained strong durability.','Short-reign churn fell to 18.9%.'],
    hurt:['Primary men’s world-title variety became extremely concentrated.','Women’s tag-title stability regressed.','A more orderly system has not yet proved a higher star-creation ceiling.'],
    surpriseNumber:'100%', surpriseTitle:'Every matched first-time men’s world champion had already held internal WWE gold.', surpriseText:'That is the cleanest evidence that the modern WWE system gives new top champions a visible route upward instead of dropping them into the main event from nowhere.',
    metrics:[['111','core title wins in the Triple H window'],['18.9%','short-reign rate'],['93.6%','primary world top-three share'],['8 / 8','matched first-time men’s world champions with prior internal gold']],
    bottom:'Triple H made WWE’s championship system easier to follow and better at producing visible internal pathways. The open question is whether that cleaner machine will eventually produce a higher ceiling—not just a higher floor.',
    compare:'report-wwe-vs-aew.html', compareLabel:'See WWE vs. AEW', support:archiveSrc('BT-GENERAL-001'), supportAlt:archiveAlt('BT-GENERAL-001'), supportCredit:'BT-GENERAL-001'
  },
  {
    file:'scorecard-aew.html', name:'AEW', tone:'#d9b441', hero:archiveSrc('BT-AEW-001'), heroAlt:archiveAlt('BT-AEW-001'), creditId:'BT-AEW-001',
    description:'A plain-English Belt Theory breakdown of AEW: a protected world title, strong team identity and a crowded middle that does not always create upward movement.',
    verdict:'Sharp crown. Crowded middle.',
    deck:'AEW built a legitimate flagship world championship and a distinct team identity. The problem is underneath: more belts have not always produced clearer roles or reliable movement toward the top.',
    heroStat:'68.2', heroLabel:'AEW internal championship-system audit', heroNote:'Useful for diagnosing AEW itself—not a universal score against every promotion.',
    remember:[
      ['The world title works.','AEW protects its flagship championship better than most of the system beneath it.'],
      ['The middle is crowded.','Several secondary championships overlap instead of feeling like obvious steps.'],
      ['Opportunity does not always become elevation.','Only half of men’s world champions used prior AEW gold before reaching the top.']
    ],
    best:['Flagship world title stayed credible through longer, more concentrated reigns.','Men’s company-first champions showed strong durability.','Tag and trios created a broad team ecosystem.','The promotion’s title identity feels distinct rather than inherited.'],
    hurt:['Only half of men’s world champions used prior AEW gold.','Women’s first-time world-champion durability was 33.3%.','Multiple secondary belts overlap in function.','More title opportunities have not consistently created upward movement.'],
    surpriseNumber:'5 / 10', surpriseTitle:'Only half of AEW’s men’s world champions had already held AEW gold.', surpriseText:'The tag championship was the strongest feeder. That means AEW’s most successful upward pathway came from teams—not from the growing collection of singles belts below the world title.',
    metrics:[['151','operational records'],['11','tracked lineages'],['97','normalized wrestlers and participants'],['82.1','flagship world-title stability score']],
    bottom:'AEW has already built a convincing crown jewel. Its next challenge is editorial: make the belts underneath that world title feel different, useful and capable of moving wrestlers somewhere.',
    compare:'report-wwe-vs-aew.html', compareLabel:'See AEW vs. WWE', support:archiveSrc('BT-AEW-003'), supportAlt:archiveAlt('BT-AEW-003'), supportCredit:'BT-AEW-003'
  },
  {
    file:'scorecard-tna.html', name:'TNA / Impact', tone:'#e34249', hero:archiveSrc('BT-TNA-001'), heroAlt:archiveAlt('BT-TNA-001'), creditId:'BT-TNA-001',
    description:'A plain-English Belt Theory breakdown of TNA and Impact: real star-building pathways, distinctive divisions and a history repeatedly weakened by resets and fragmentation.',
    verdict:'Strong ideas. Too many resets.',
    deck:'TNA built real pathways through the X Division, tag titles and Knockouts system. The frustrating part is that the company repeatedly interrupted its own advantages with rebrands, disappearing titles and changing structures.',
    heroStat:'73.2', heroLabel:'TNA internal championship-system audit', heroNote:'A strong internal diagnosis—not a universal ranking against every promotion.',
    remember:[
      ['TNA really did build stars.','TNA-created men earned 51.6% of classified men’s world-title equity.'],
      ['The lower belts mattered.','Twenty-one of 46 men’s world champions had held another TNA title first.'],
      ['The system kept resetting itself.','Renames, gaps and management changes stopped good ideas from compounding.']
    ],
    best:['X Division created a durable star-making route.','Men’s tag gold produced fifteen world-title paths.','Knockouts World Championship functioned as a legitimate anchor.','TNA-created men narrowly earned the majority of classified world-title equity.'],
    hurt:['Imported major-world champions still held 48.4% of classified days.','Knockouts tag architecture disappeared for 2,676 days.','Secondary-title lineages were repeatedly renamed or reset.','Management identity changed six times.'],
    surpriseNumber:'51.6%', surpriseTitle:'TNA-created men narrowly beat imported major-world champions.', surpriseText:'That directly challenges the lazy version of TNA history that says the company mostly lived off stars made somewhere else. The truth is much closer to 50–50—and TNA barely wins.',
    metrics:[['13','tracked lineages or title concepts'],['79','men’s and women’s world champions'],['28','internal-path graduates'],['21 / 46','men’s world champions with prior internal title experience']],
    bottom:'TNA’s problem was never that it had no championship ideas. It had several good ones. The problem was keeping them stable long enough for fans to trust what each belt meant.',
    compare:'report-tna-vs-aew.html', compareLabel:'See TNA vs. AEW', support:archiveSrc('BT-TNA-003'), supportAlt:archiveAlt('BT-TNA-003'), supportCredit:'BT-TNA-003', story:'report-did-tna-create-stars.html', storyLabel:'Read the TNA star-creation study'
  },
  {
    file:'scorecard-wcw.html', name:'WCW', tone:'#5aa3d8', hero:archiveSrc('BT-WCW-003'), heroAlt:archiveAlt('BT-WCW-003'), creditId:'BT-WCW-003',
    description:'A plain-English Belt Theory breakdown of WCW: a surprisingly effective developmental ladder undermined by veteran dependence and chaotic world-title governance.',
    verdict:'Great ladder. Bad finish.',
    deck:'WCW was much better at identifying future world champions than its reputation suggests. The U.S., Television and tag championships created a real ladder. The system often failed after those wrestlers reached the top.',
    heroStat:'90%', heroLabel:'standard career-first world champions with earlier WCW-platform gold', heroNote:'Nine of ten had already held WCW-platform gold before becoming world champion.',
    remember:[
      ['WCW found future stars.','Nine of ten standard career-first world champions had earlier WCW-platform gold.'],
      ['The lower titles had jobs.','U.S., Television and tag gold created recognizable steps toward bigger roles.'],
      ['The world-title picture broke the system.','Veteran dependence, vacancies and late-era churn weakened conversion at the very top.']
    ],
    best:['Clear U.S. and Television pathways.','Large and varied tag ecosystem.','Lower titles identified credible future world champions.','Weight-class and role structure created breadth.'],
    hurt:['World-title governance became chaotic.','Established major-world veterans held 64.8% of world-title days.','Late-era vacancies and rapid changes weakened prestige.','Strong ladder outcomes were not consistently protected after wrestlers reached the top.'],
    surpriseNumber:'9 / 10', surpriseTitle:'WCW’s ladder worked far better than the usual “they never built anyone” narrative.', surpriseText:'The evidence says WCW often identified and prepared future world champions. The failure was less about finding talent and more about what happened when that talent reached the main-event system.',
    metrics:[['400','operational records'],['12','tracked lineages'],['64.8%','world-title days held by established major-world veterans'],['94','recognized tag participants']],
    bottom:'WCW’s championship history is a warning that development and payoff are different things. The company could build the ladder—and still fail to protect the people who climbed it.',
    compare:'report-wwe-wcw-ecw.html', compareLabel:'See WWE vs. WCW vs. ECW'
  },
  {
    file:'scorecard-ecw.html', name:'Original ECW', tone:'#9d55c7', hero:archiveSrc('BT-ECW-003'), heroAlt:archiveAlt('BT-ECW-003'), creditId:'BT-ECW-003',
    description:'A plain-English Belt Theory breakdown of original ECW: a small title system with clear jobs, strong internal movement and very little dependence on imported world champions.',
    verdict:'Small system. Clear jobs.',
    deck:'ECW did not need a giant championship menu. Its World, Television and Tag titles had different purposes, and the tag championship quietly became the strongest direct feeder to the top.',
    heroStat:'61.5%', heroLabel:'mature World Champions with prior ECW core gold', heroNote:'Eight of thirteen mature World Champions had already held ECW core gold.',
    remember:[
      ['Small was a strength.','Three core titles were easier to understand and protect.'],
      ['Tag gold mattered most.','Six mature World Champions held tag gold before reaching the top.'],
      ['Imported dependence was tiny.','Established major-world veterans accounted for only 4.9% of world-title share.']
    ],
    best:['Focused three-title architecture.','Strong world-title stability for company scale.','Tag championship created meaningful upward movement.','Very low dependence on imported major-world champions.'],
    hurt:['Limited divisional breadth.','The Television title was less direct a feeder than its reputation suggests.','A small roster constrained how repeatable the pathways could become.','Post-promotion durability remained weak.'],
    surpriseNumber:'6', surpriseTitle:'The tag title—not the Television title—was ECW’s strongest direct feeder.', surpriseText:'That matters because the Television title is usually remembered as the obvious proving ground. The career paths say the tag division created more direct World-title movement.',
    metrics:[['135','operational records'],['13','standard mature world-era champions'],['6','tag-before-world paths'],['4.9%','imported-veteran world-title share']],
    bottom:'ECW shows the value of restraint. A smaller number of championships can produce a clearer system when every belt has a recognizable job and the company actually uses those jobs consistently.',
    compare:'report-wwe-wcw-ecw.html', compareLabel:'See WWE vs. WCW vs. ECW'
  },
  {
    file:'scorecard-roh.html', name:'Ring of Honor', tone:'#d44752', hero:rohSrc('BT-ROH-001'), heroAlt:rohAlt('BT-ROH-001'), creditId:'BT-ROH-001', roh:true,
    description:'A plain-English Belt Theory breakdown of Ring of Honor: a stable World title, distinct championship roles and a tag division that quietly created future main-eventers.',
    verdict:'Stable crown. Hidden tag ladder.',
    deck:'ROH’s World title is unusually stable, and the championship roles are clearer than the “indie prestige” stereotype suggests. Its strongest upward path was hiding in the tag division.',
    heroStat:'71.8', heroLabel:'ROH internal seven-dimension audit', heroNote:'Diagnostic only. It is not a universal ranking against AEW 68.2 or TNA 73.2.',
    remember:[
      ['The World title was protected.','Across 42 World reigns, the median was 178.5 days with 99.1% utilization.'],
      ['The tag titles created main-eventers.','Fourteen of 33 unique World champions held World Tag gold first.'],
      ['Continuity still broke.','Pure disappeared for 4,919 days, and cross-brand authority complicates the modern system.']
    ],
    best:['World title had a 178.5-day median and zero lineal reigns under 30 days.','World, TV, Tag and Six-Man lineages each exceeded 98% utilization.','Fourteen Tag-before-World paths and five Six-Man-before-World paths.','Pure and TV kept distinct technical and breakthrough jobs.'],
    hurt:['Only seven unique World champions held TV or Pure before their first World reign.','No completed women’s lower-title-to-Women’s-World path by the cutoff.','Pure disappeared for 4,919 days between 2006 and 2020.','Interim branches and title changes on AEW/CMLL programming complicate standalone governance.'],
    surpriseNumber:'14 / 33', surpriseTitle:'The tag championship was ROH’s clearest documented path to the World title.', surpriseText:'ROH is usually discussed through World-title prestige and technical singles wrestling. The career paths say team gold was one of the most important pieces of its star-development story.',
    metrics:[['201','lineal champion reigns audited'],['9','identified lineages · 8 active'],['57.6%','World champions with prior ROH internal gold'],['42.4%','World champions who held Tag gold first']],
    bottom:'ROH’s championship system is stronger than a prestige-only story. It had a stable crown, distinct roles and a real team ladder. The weak point is continuity—especially across resets, women’s mobility and the modern cross-brand era.',
    support:rohSrc('BT-ROH-002'), supportAlt:rohAlt('BT-ROH-002'), supportCredit:'BT-ROH-002', supportRoh:true
  }
];

function render(p){
 const remember=p.remember.map(([h,b],i)=>`<article><span>0${i+1}</span><div><h3>${esc(h)}</h3><p>${esc(b)}</p></div></article>`).join('');
 const best=p.best.map(x=>`<li>${esc(x)}</li>`).join('');
 const hurt=p.hurt.map(x=>`<li>${esc(x)}</li>`).join('');
 const metrics=p.metrics.map(([n,l])=>`<article><strong>${esc(n)}</strong><span>${esc(l)}</span></article>`).join('');
 const support=p.support?`<section class="ff-score-photo-break"><div class="ff-shell ff-score-photo-grid"><figure><img src="${p.support}" alt="${esc(p.supportAlt||'')}" loading="lazy" decoding="async"><figcaption>${mediaCredit(p.supportCredit,p.supportRoh)}</figcaption></figure><div><p class="ff-section-label">Why this matters</p><h2>${esc(p.surpriseTitle)}</h2><p>${esc(p.surpriseText)}</p></div></div></section>`:`<section class="ff-score-surprise"><div class="ff-shell"><p class="ff-section-label">Biggest surprise</p><div class="ff-score-surprise-grid"><strong>${esc(p.surpriseNumber)}</strong><div><h2>${esc(p.surpriseTitle)}</h2><p>${esc(p.surpriseText)}</p></div></div></div></section>`;
 const extraLinks=[p.story?`<a class="ff-text-link" href="${p.story}">${esc(p.storyLabel)}</a>`:'',p.compare?`<a class="ff-text-link" href="${p.compare}">${esc(p.compareLabel)}</a>`:''].filter(Boolean).join('');
 return `${head(p)}<body>${header()}<main id="content"><article class="ff-score" style="--promotion:${p.tone}">
 <header class="ff-score-hero"><div class="ff-score-hero-media"><img src="${p.hero}" alt="" aria-hidden="true" fetchpriority="high" decoding="async"></div><div class="ff-score-hero-fade"></div><div class="ff-shell ff-score-hero-grid"><div><a class="ff-back" href="scorecards.html">← All promotions</a><p class="ff-section-label">Promotion breakdown</p><h1>${esc(p.name)}</h1><p class="ff-score-verdict">${esc(p.verdict)}</p><p class="ff-score-deck">${esc(p.deck)}</p></div><aside class="ff-score-highlight"><small>${esc(p.heroLabel)}</small><strong>${esc(p.heroStat)}</strong><p>${esc(p.heroNote)}</p></aside></div>${mediaCredit(p.creditId,p.roh)}</header>
 <section class="ff-score-section ff-shell ff-score-remember"><div><p class="ff-section-label">If you remember only three things</p><h2>Here is the whole argument.</h2></div><div>${remember}</div></section>
 <section class="ff-score-section ff-score-sides"><div class="ff-shell ff-score-sides-grid"><article><p class="ff-section-label">What worked</p><h2>Where ${esc(p.name)} got it right.</h2><ul>${best}</ul></article><article><p class="ff-section-label">What hurt</p><h2>Where the system broke down.</h2><ul>${hurt}</ul></article></div></section>
 ${support}
 <section class="ff-score-section ff-shell"><div class="ff-section-intro"><div><p class="ff-section-label">The numbers underneath it</p><h2>Four facts worth knowing.</h2></div><p>These are supporting evidence—not homework. The full datasets and definitions stay in the research section.</p></div><div class="ff-score-metrics">${metrics}</div></section>
 <section class="ff-score-section ff-score-bottom"><div class="ff-shell ff-score-bottom-grid"><div><p class="ff-section-label">Bottom line</p><h2>${esc(p.verdict)}</h2><p>${esc(p.bottom)}</p></div><div><a class="ff-button ff-button-primary" href="research.html">Check the research →</a>${extraLinks}<a class="ff-text-link" href="methodology.html">How Belt Theory works</a></div></div></section>
 </article></main>${footer}</body></html>`;
}

for(const p of promos){
 if(!p.hero) throw new Error(`Missing hero for ${p.name}`);
 await writeFile(path.join(out,p.file),render(p));
}
console.log('Built six fan-first promotion scorecards: WWE, AEW, TNA, WCW, ECW and ROH.');
