import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const out = path.resolve(process.argv[2] || path.join(root, 'dist'));
const origin = 'https://belt-theory.tucknub.workers.dev';

const archive = JSON.parse(await readFile(path.join(root, 'data', 'archive-assets.json'), 'utf8'));
const archiveMap = new Map(archive.assets.map((asset) => [asset.id, asset]));
let rohBuilt = null;
try {
  rohBuilt = JSON.parse(await readFile(path.join(out, 'assets', 'archive', 'roh-manifest.json'), 'utf8'));
} catch {
  // ROH is optional during isolated script development; the full build always provides it.
}
const rohMap = new Map((rohBuilt?.assets || []).map((asset) => [asset.id, asset]));

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function archiveSrc(id) {
  const asset = archiveMap.get(id);
  if (!asset) throw new Error(`Unknown archive asset ${id}`);
  return `assets/archive/${asset.slug}-${asset.defaultWidth}.${asset.extension}`;
}

function archiveAlt(id) {
  return archiveMap.get(id)?.alt || '';
}

function rohSrc(id) {
  const asset = rohMap.get(id);
  if (!asset) return null;
  const variant = asset.variants?.find((v) => v.requestedWidth === asset.defaultWidth) || asset.variants?.at(-1);
  return variant ? `assets/archive/${variant.filename}` : null;
}

function head({ title, description, canonical, socialImage = archiveSrc('BT-AEW-001') }) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#050505"><meta name="color-scheme" content="dark"><meta name="description" content="${escapeHtml(description)}"><meta name="robots" content="index, follow, max-image-preview:large"><title>${escapeHtml(title)}</title><link rel="icon" href="assets/mark.svg"><link rel="manifest" href="manifest.webmanifest"><link rel="canonical" href="${canonical}"><meta property="og:type" content="website"><meta property="og:site_name" content="Belt Theory"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${origin}/${socialImage}"><meta name="twitter:card" content="summary_large_image"><link rel="stylesheet" href="assets/fan-first.css"></head>`;
}

function header(current = '') {
  const items = [
    ['home', 'index.html', 'Home'],
    ['stories', 'index.html#stories', 'Stories'],
    ['promotions', 'scorecards.html', 'Promotions'],
    ['compare', 'comparisons.html', 'Compare'],
    ['how', 'methodology.html', 'How it works']
  ];
  const links = items.map(([key, href, label]) => `<a href="${href}"${key === current ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  return `<a class="ff-skip" href="#content">Skip to content</a><header class="ff-header"><div class="ff-shell ff-navrow"><a class="ff-brand" href="index.html" aria-label="Belt Theory home"><span>BELT</span><b>THEORY</b><small>Championship history, measured.</small></a><nav class="ff-nav" aria-label="Primary">${links}</nav><a class="ff-data-cta" href="research.html">See the data</a><details class="ff-mobile-menu"><summary>Menu</summary><nav aria-label="Mobile">${links}<a href="research.html">See the data</a></nav></details></div></header>`;
}

function footer() {
  return `<footer class="ff-footer"><div class="ff-shell ff-footer-grid"><div><a class="ff-brand ff-brand-footer" href="index.html"><span>BELT</span><b>THEORY</b></a><p>Wrestling arguments, tested against championship history.</p></div><nav aria-label="Research and policy"><a href="methodology.html">How we calculate it</a><a href="research.html">Sources & data</a><a href="image-credits.html">Image credits</a><a href="update-policy.html">Update policy</a><a href="about.html">About</a></nav><p class="ff-disclaimer">Independent research. Not affiliated with WWE, AEW, TNA, WCW, ECW, ROH or any other promotion.</p></div></footer>`;
}

function photoCredit(id) {
  const asset = archiveMap.get(id);
  if (!asset) return '';
  return `<a class="ff-photo-credit" href="${escapeHtml(asset.sourcePage)}" rel="noreferrer" target="_blank">${escapeHtml(asset.shortCredit)}</a>`;
}

const tnaHero = archiveSrc('BT-TNA-001');
const tnaSupport = archiveSrc('BT-TNA-003');
const aewWide = archiveSrc('BT-AEW-001');
const aewPeople = archiveSrc('BT-AEW-003');
const wweWide = archiveSrc('BT-WWE-001');
const wweAlt = archiveSrc('BT-GENERAL-001');
const wcw = archiveSrc('BT-WCW-003');
const ecw = archiveSrc('BT-ECW-003');
const roh = rohSrc('BT-ROH-001');

const promotionCards = [
  { name: 'WWE', href: 'scorecard-wwe.html', tone: '#d7d7d7', image: wweWide, alt: archiveAlt('BT-WWE-001'), line: 'The deepest all-around system we have studied.', note: 'HHH beat late Vince 55.8–44.2 in the equal-window test.' },
  { name: 'AEW', href: 'scorecard-aew.html', tone: '#d9b441', image: aewWide, alt: archiveAlt('BT-AEW-001'), line: 'Excellent at the top. Messier underneath.', note: 'Its world-title picture is one of the strongest in the project.' },
  { name: 'TNA', href: 'scorecard-tna.html', tone: '#e34249', image: tnaHero, alt: archiveAlt('BT-TNA-001'), line: 'A strong system that kept getting in its own way.', note: 'Multiple paths created stars; resets and fragmentation cost it.' },
  { name: 'WCW', href: 'scorecard-wcw.html', tone: '#5aa3d8', image: wcw, alt: archiveAlt('BT-WCW-003'), line: 'Better at developing stars than its reputation says.', note: 'Nine of ten standard career-first world champions held earlier WCW-platform gold.' },
  { name: 'ECW', href: 'scorecard-ecw.html', tone: '#8e48b6', image: ecw, alt: archiveAlt('BT-ECW-003'), line: 'Small system. Clear paths. Surprisingly effective.', note: 'Eight of thirteen mature World champions held earlier ECW core gold.' },
  { name: 'ROH', href: 'scorecard-roh.html', tone: '#d44752', image: roh, alt: 'Ring of Honor event photography.', line: 'Stable at the top, with a hidden ladder in the tag division.', note: 'Fourteen World champions held ROH Tag gold before their first World reign.' }
].map((card) => `<a class="ff-promotion" href="${card.href}" style="--promotion:${card.tone}">${card.image ? `<span class="ff-promotion-media"><img src="${card.image}" alt="${escapeHtml(card.alt)}" loading="lazy" decoding="async"></span>` : '<span class="ff-promotion-media ff-promotion-media-empty" aria-hidden="true"></span>'}<span class="ff-promotion-copy"><strong>${card.name}</strong><b>${card.line}</b><small>${card.note}</small><em>Open ${card.name} →</em></span></a>`).join('');

const home = `${head({
  title: 'Belt Theory — wrestling arguments, tested with championship history',
  description: 'Belt Theory uses championship history to answer wrestling arguments with data: who built stars, which titles mattered and which promotions built the strongest systems.',
  canonical: `${origin}/`,
  socialImage: tnaHero
})}<body>${header('home')}<main id="content">
<section class="ff-hero">
  <div class="ff-hero-photo" aria-hidden="true"><img src="${tnaHero}" alt="" fetchpriority="high" decoding="async"></div>
  <div class="ff-hero-vignette" aria-hidden="true"></div>
  <div class="ff-shell ff-hero-grid">
    <div class="ff-hero-copy">
      <p class="ff-section-label">The big question</p>
      <h1>Did TNA actually<br>create stars?</h1>
      <p class="ff-answer">Yes. Barely.</p>
      <div class="ff-split-stat" aria-label="51.6 percent TNA-created, 48.4 percent established elsewhere">
        <div><strong>51.6%</strong><span>created in TNA</span></div><i aria-hidden="true"></i><div><strong>48.4%</strong><span>established elsewhere</span></div>
      </div>
      <p class="ff-hero-deck">We tracked the men who reached TNA's world championship and asked a simple question: did TNA build them, or did somebody else?</p>
      <a class="ff-button ff-button-primary" href="report-did-tna-create-stars.html">Read the story <span>→</span></a>
    </div>
    <aside class="ff-what-is-this">
      <strong>Belt Theory</strong>
      <p>We use championship history to test wrestling's biggest arguments.</p>
      <ul><li>Real title histories</li><li>Plain-English answers</li><li>Sources you can check</li><li>The math stays underneath</li></ul>
    </aside>
  </div>
  ${photoCredit('BT-TNA-001')}
</section>

<section class="ff-section ff-shell" id="stories">
  <div class="ff-section-intro"><div><p class="ff-section-label">The big debates</p><h2>Start with an argument.</h2></div><p>You do not need to understand our scoring system first. Pick a wrestling question and we will give you the answer, then show you the evidence.</p></div>
  <div class="ff-story-grid">
    <a class="ff-story ff-story-large" href="report-wwe-vs-aew.html"><span class="ff-story-media ff-media-pair"><img src="${wweWide}" alt="${escapeHtml(archiveAlt('BT-WWE-001'))}" loading="lazy"><img src="${aewWide}" alt="${escapeHtml(archiveAlt('BT-AEW-001'))}" loading="lazy"></span><span class="ff-story-copy"><small>WWE vs. AEW</small><h3>Who built the better championship system?</h3><p><strong>AEW 50.2 — WWE 49.8.</strong> Essentially a draw, for very different reasons.</p><em>See why →</em></span></a>
    <a class="ff-story" href="report-tna-vs-aew.html"><span class="ff-story-media ff-media-pair"><img src="${tnaSupport}" alt="${escapeHtml(archiveAlt('BT-TNA-003'))}" loading="lazy"><img src="${aewPeople}" alt="${escapeHtml(archiveAlt('BT-AEW-003'))}" loading="lazy"></span><span class="ff-story-copy"><small>TNA vs. AEW</small><h3>Who built the deeper total system?</h3><p><strong>TNA 51.9 — AEW 48.1.</strong> TNA wins the system; AEW wins the crown.</p><em>Read the comparison →</em></span></a>
    <a class="ff-story" href="report-wwe-wcw-ecw.html"><span class="ff-story-media ff-media-triplet"><img src="${wweAlt}" alt="${escapeHtml(archiveAlt('BT-GENERAL-001'))}" loading="lazy"><img src="${wcw}" alt="${escapeHtml(archiveAlt('BT-WCW-003'))}" loading="lazy"><img src="${ecw}" alt="${escapeHtml(archiveAlt('BT-ECW-003'))}" loading="lazy"></span><span class="ff-story-copy"><small>WWE vs. WCW vs. ECW</small><h3>Which system actually worked best?</h3><p><strong>WWE 38.0 · ECW 32.7 · WCW 29.2.</strong> ECW gets much closer than its size suggests.</p><em>See the result →</em></span></a>
  </div>
</section>

<section class="ff-section ff-promotion-band" id="promotions"><div class="ff-shell"><div class="ff-section-intro"><div><p class="ff-section-label">Pick a promotion</p><h2>Start with the company you care about.</h2></div><p>Each promotion page gives you the verdict first: what worked, what did not, what surprised us and where the numbers came from.</p></div><div class="ff-promotion-grid">${promotionCards}</div></div></section>

<section class="ff-section ff-shell ff-findings" id="findings">
  <div class="ff-section-intro"><div><p class="ff-section-label">What we have learned</p><h2>The numbers only matter if they tell a story.</h2></div><p>These are not universal rankings. They are the strongest fan-facing findings from each completed system.</p></div>
  <div class="ff-finding-list">
    <article><span>01</span><div><strong>TNA</strong><h3>More homegrown than its reputation says.</h3><p>51.6% of its classified men's world-title equity came from TNA-created stars versus 48.4% from established major-world champions.</p></div></article>
    <article><span>02</span><div><strong>AEW</strong><h3>The world title is the cleanest part of the machine.</h3><p>AEW's flagship world-title stability scored 82.1, while the system underneath it was much more uneven.</p></div></article>
    <article><span>03</span><div><strong>WWE</strong><h3>Triple H beat late Vince in the equal-window test.</h3><p>The locked comparison finished 55.8–44.2, with stronger internal pathways doing much of the work.</p></div></article>
    <article><span>04</span><div><strong>ROH</strong><h3>The tag titles were a real main-event pathway.</h3><p>Fourteen of 33 unique ROH World champions held the World Tag title before their first World reign.</p></div></article>
  </div>
  <div class="ff-method-card"><div><p class="ff-section-label">Want the receipts?</p><h2>Every answer has a research trail.</h2><p>The public story stays simple. The methodology, source workbooks, definitions and edge cases are still there whenever you want to inspect them.</p></div><div><a class="ff-button" href="methodology.html">How we calculate it →</a><a class="ff-text-link" href="research.html">Open the source data</a></div></div>
</section>
</main>${footer()}</body></html>`;

const tnaArticle = `${head({
  title: 'Did TNA actually create stars? — Belt Theory',
  description: 'Belt Theory tested whether TNA built its own world-title stars or mostly relied on wrestlers established elsewhere. The answer: TNA created slightly more than it imported.',
  canonical: `${origin}/report-did-tna-create-stars`,
  socialImage: tnaSupport
})}<body>${header('stories')}<main id="content">
<article class="ff-article">
  <header class="ff-article-hero">
    <div class="ff-article-photo" aria-hidden="true"><img src="${tnaSupport}" alt="" fetchpriority="high" decoding="async"></div><div class="ff-article-vignette" aria-hidden="true"></div>
    <div class="ff-shell ff-article-hero-inner"><div><a class="ff-back" href="index.html#stories">← All stories</a><p class="ff-section-label">TNA star-creation study</p><h1>Did TNA actually<br>create stars?</h1><p class="ff-answer">Yes. Barely.</p><p class="ff-article-deck">The easy version of TNA history says the company lived off stars made by WWE, WCW and ECW. The championship record tells a more complicated story.</p></div><div class="ff-article-verdict"><small>The answer</small><strong>51.6%</strong><span>created in TNA</span><i></i><b>48.4%</b><span>established elsewhere</span></div></div>${photoCredit('BT-TNA-003')}
  </header>

  <section class="ff-article-section ff-shell ff-short-version"><div><p class="ff-section-label">The short version</p><h2>You can understand the result in 30 seconds.</h2></div><ol><li><strong>TNA did build stars.</strong><p>Its world-title history was not dominated by outsiders to the degree its reputation suggests.</p></li><li><strong>Its internal titles mattered.</strong><p>Twenty-one of 46 men's world champions had already held another TNA championship before reaching the top.</p></li><li><strong>The system was inconsistent.</strong><p>TNA created useful pathways, then repeatedly damaged them with resets, disappearances and changing title roles.</p></li></ol></section>

  <section class="ff-article-section ff-definition-band"><div class="ff-shell ff-definition-grid"><div><p class="ff-section-label">First: what do we mean by “created”?</p><h2>We are not claiming TNA invented a wrestler.</h2></div><div><p>For this study, the question is whether a champion's major-world-title identity was established through TNA's system or had already been established elsewhere before TNA.</p><p>That distinction lets us test the actual fan argument without pretending a wrestler had no career before arriving.</p><a class="ff-text-link" href="methodology.html">See the full classification rules →</a></div></div></section>

  <section class="ff-article-section ff-shell"><div class="ff-section-intro"><div><p class="ff-section-label">What we found</p><h2>TNA's system had more upward movement than the stereotype suggests.</h2></div><p>The most useful question is not just who became world champion. It is whether the rest of the title system helped them get there.</p></div><div class="ff-proof-grid"><article><strong>21 / 46</strong><h3>Men's world champions had prior TNA title experience.</h3><p>Nearly half of the world-title pool arrived at the top after already holding another championship inside the company.</p></article><article><strong>15</strong><h3>World-title paths came through tag gold.</h3><p>The tag division was not just a side attraction; it repeatedly put future world champions into meaningful title situations.</p></article><article><strong>11</strong><h3>World-title paths came through the X Division.</h3><p>The X Division became TNA's most famous “future star” idea, and the data shows a real—though imperfect—route upward.</p></article><article><strong>19 / 28</strong><h3>Internal-path graduates proved durable.</h3><p>Most wrestlers who climbed through TNA's championship system did more than touch the top and disappear.</p></article></div></section>

  <section class="ff-article-section ff-photo-break"><div class="ff-shell ff-photo-break-grid"><figure><img src="${tnaHero}" alt="${escapeHtml(archiveAlt('BT-TNA-001'))}" loading="lazy" decoding="async"><figcaption>${photoCredit('BT-TNA-001')}</figcaption></figure><div><p class="ff-section-label">The catch</p><h2>TNA built pathways, but it did not protect them consistently.</h2><p>The same company that created useful ladders also interrupted them. Championships disappeared, divisions changed purpose and different eras repeatedly reset what the belts were supposed to mean.</p><p>That is why TNA can be good at star creation and still feel chaotic when fans remember the history.</p></div></div></section>

  <section class="ff-article-section ff-shell"><div class="ff-section-intro"><div><p class="ff-section-label">So what is the real answer?</p><h2>The “TNA only hired other companies' stars” argument is too simple.</h2></div></div><div class="ff-conclusion"><p>TNA absolutely benefited from established names. That is part of its history. But its championship system also produced a meaningful amount of internal upward movement—and, by our classification, slightly more TNA-created men's world-title equity than imported major-world equity.</p><blockquote>“TNA built the deeper total system” is not the same as saying TNA always booked it well.</blockquote><p>The interesting part is the contradiction: <strong>TNA was better at building stars than its reputation suggests, while being worse at maintaining a coherent system than its best results deserved.</strong></p></div></section>

  <section class="ff-article-section ff-receipts"><div class="ff-shell ff-receipts-inner"><div><p class="ff-section-label">Want to check us?</p><h2>Here are the receipts.</h2><p>The underlying research stays public: definitions, workbooks, title histories and methodology are available for anyone who wants to audit the conclusion.</p></div><div><a class="ff-button ff-button-primary" href="research.html">Open the research →</a><a class="ff-text-link" href="methodology.html">Read the methodology</a><a class="ff-text-link" href="scorecard-tna.html">See TNA's full promotion breakdown</a></div></div></section>
</article></main>${footer()}</body></html>`;

await writeFile(path.join(out, 'index.html'), home);
await writeFile(path.join(out, 'report-did-tna-create-stars.html'), tnaArticle);

const pages = (await readdir(out)).filter((name) => name.endsWith('.html'));
const newHeader = header('');
const newFooter = footer();
for (const page of pages) {
  if (page === 'index.html' || page === 'report-did-tna-create-stars.html') continue;
  const file = path.join(out, page);
  let html = await readFile(file, 'utf8');
  if (!html.includes('assets/fan-first.css')) html = html.replace('</head>', '<link rel="stylesheet" href="assets/fan-first.css"></head>');
  html = html.replace(/<header class="topbar">[\s\S]*?<\/header>/i, newHeader.replace(/^<a class="ff-skip"[\s\S]*?<\/a>/, ''));
  html = html.replace(/<footer class="footer">[\s\S]*?<\/footer>/i, newFooter);
  await writeFile(file, html);
}

console.log('Built Belt Theory fan-first v2 homepage, flagship TNA story and simplified global navigation.');
