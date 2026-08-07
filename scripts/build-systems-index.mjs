import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outputRoot = path.resolve(process.argv[2] || path.join(root, 'dist'));
const shellHtml = await readFile(path.join(outputRoot, 'scorecards.html'), 'utf8');

const headerMatch = shellHtml.match(/<header class="topbar">[\s\S]*?<\/header>/i);
const footerMatch = shellHtml.match(/<footer class="footer">[\s\S]*?<\/footer>/i);
if (!headerMatch || !footerMatch) throw new Error('Could not extract Belt Theory shell from scorecards.html');

let header = headerMatch[0]
  .replace(/<a(?: aria-current="page")? class="active" href="scorecards\.html">Scorecards<\/a>/, '<a class="" href="scorecards.html">Scorecards</a>');
let footer = footerMatch[0];
if (!footer.includes('href="systems-index.html">Systems index</a>')) {
  footer = footer.replace('<a href="methodology.html">Methodology</a>', '<a href="methodology.html">Methodology</a><a href="systems-index.html">Systems index</a>');
}

const systems = [
  {
    tone: '#ef5550', name: 'WWE', metric: '55.8', label: 'Triple H share in the equal-window WWE–AEW scorecard',
    strength: 'More orderly secondary and tag roles; stronger women’s development in the matched AEW comparison.',
    risk: 'Primary-world concentration remains high, and a cleaner floor does not automatically prove a higher peak ceiling.',
    href: 'scorecard-wwe.html'
  },
  {
    tone: '#4bd1d6', name: 'AEW', metric: '68.2', label: 'complete internal championship-system score',
    strength: 'A credible flagship men’s world title and a strong team identity.',
    risk: 'Expansion below the top has created role congestion, with weaker upward conversion for women.',
    href: 'scorecard-aew.html'
  },
  {
    tone: '#57d9fa', name: 'TNA / Impact', metric: '73.2', label: 'complete internal championship-system score',
    strength: 'Real internal star creation, useful secondary roles and a strong women’s championship system.',
    risk: 'Rebrands, gaps and repeated specialty-title resets interrupted the value the system created.',
    href: 'scorecard-tna.html'
  },
  {
    tone: '#f28a3a', name: 'WCW', metric: '90%', label: 'standard career-first world champions with earlier WCW-platform gold',
    strength: 'The clearest documented developmental ladder in the historical archive.',
    risk: 'Top-level governance and veteran dependence weakened conversion after wrestlers reached the main event.',
    href: 'scorecard-wcw.html'
  },
  {
    tone: '#d83d36', name: 'Original ECW', metric: '61.5%', label: 'mature World Champions with prior ECW core gold',
    strength: 'A small architecture with unusually clear jobs; the tag title became a meaningful direct feeder.',
    risk: 'The system’s scale limits how much breadth it can be credited with compared with larger promotions.',
    href: 'scorecard-ecw.html'
  }
];

const cards = systems.map((s) => `<article class="system-fingerprint" style="--tone:${s.tone}"><div class="system-number"><small>${s.label}</small><strong>${s.metric}</strong></div><div><span class="kicker">System fingerprint</span><h3>${s.name}</h3><dl><div><dt>Documented strength</dt><dd>${s.strength}</dd></div><div><dt>Structural risk</dt><dd>${s.risk}</dd></div></dl><a class="text-link" href="${s.href}">Open ${s.name} scorecard →</a></div></article>`).join('');

const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><meta content="width=device-width,initial-scale=1" name="viewport"/><meta content="#050606" name="theme-color"/><meta content="Belt Theory's Championship Systems Index maps what WWE, AEW, TNA, WCW and original ECW actually proved without pretending unlike metrics form a universal ranking." name="description"/><title>Championship Systems Index — Belt Theory</title><link href="assets/mark.svg" rel="icon"/><link href="assets/site.css" rel="stylesheet"/><meta content="dark" name="color-scheme"/><meta content="index, follow, max-image-preview:large" name="robots"/><meta content="website" property="og:type"/><meta content="Belt Theory" property="og:site_name"/><meta content="Championship Systems Index — Belt Theory" property="og:title"/><meta content="Five promotion systems mapped by what the evidence actually measures—not by a fake universal ranking." property="og:description"/><meta content="summary_large_image" name="twitter:card"/><meta content="Championship Systems Index — Belt Theory" name="twitter:title"/><meta content="Five promotion systems mapped by what the evidence actually measures—not by a fake universal ranking." name="twitter:description"/><link href="manifest.webmanifest" rel="manifest"/></head><body><a class="skip" href="#content">Skip to content</a>${header}<main id="content">
<section class="hero generic systems-index-hero" style="--tone:var(--gold)"><div class="hero-inner shell"><div><span class="kicker">Championship Systems Index · v1.0</span><h1>Five promotion systems.<span>No fake master ranking.</span></h1><p>Belt Theory now contains internal scores, matched-window shares and pathway rates. Those numbers answer different questions. The Systems Index keeps them separate, then maps what each promotion actually proved.</p><div class="actions"><a class="button gold" href="#fingerprints">Map the five systems</a><a class="button" href="methodology.html">Read the method</a></div></div><aside class="hero-panel"><small>Index status</small><strong>Evidence map</strong><h2>Comparable where the model is shared. Explicitly separate where it is not.</h2><p>Version 1.0 is the publication layer that connects the completed research without inventing a five-promotion score that the data does not support.</p></aside></div></section>
<div class="statrail shell systems-index-stats"><article><strong>5</strong><span>promotion systems</span></article><article><strong>3</strong><span>matched studies</span></article><article><strong>0</strong><span>fake universal rankings</span></article><article><strong>1</strong><span>repeatable framework</span></article></div>
<section class="section shell" id="fingerprints"><div class="section-head"><div><span class="kicker">System fingerprints</span><h2>Different numbers.<br/>Different questions.</h2></div><p>The headline figure on each card is labeled by what it actually measures. It is evidence about that promotion—not permission to rank unlike metrics against one another.</p></div><div class="systems-index-grid">${cards}</div></section>
<section class="section band"><div class="shell"><div class="section-head"><div><span class="kicker">Comparable evidence</span><h2>When the model matches,<br/>we compare directly.</h2></div><p>These studies use matched periods or explicitly normalized historical roles. This is where Belt Theory can make direct score claims.</p></div><div class="report-grid"><a class="report-card" href="report-wwe-vs-aew.html" style="--c1:#ef555099;--c2:#4bd1d699"><div><small>August 31, 2019–August 5, 2026</small><h3>WWE vs. AEW</h3><strong>AEW 50.2 — WWE 49.8</strong><p>Effective tie. AEW wins flagship men’s world prestige and team ecosystem; WWE wins secondary depth, women’s development and governance narrowly.</p></div></a><a class="report-card" href="report-tna-vs-aew.html" style="--c1:#57d9fa99;--c2:#4bd1d699"><div><small>August 31, 2019–August 5, 2026</small><h3>TNA vs. AEW</h3><strong>TNA 51.9 — AEW 48.1</strong><p>TNA’s narrow win survives all six sensitivity models. AEW still owns the stronger flagship men’s world-title result.</p></div></a><a class="report-card" href="report-wwe-wcw-ecw.html" style="--c1:#e8ad2899;--c2:#d83d3699"><div><small>Matched competitive period, 1994–2001</small><h3>WWE vs. WCW vs. ECW</h3><strong>WWE 38.0 — ECW 32.7 — WCW 29.2</strong><p>WWE wins through balance, not domination of every category. ECW and WCW each expose different strengths the total score can hide.</p></div></a></div></div></section>
<section class="section shell"><div class="section-head"><div><span class="kicker">Interpretation rule</span><h2>What you must not do<br/>with this index.</h2></div><p>A good analytical system is defined as much by the comparisons it refuses to fake as by the ones it publishes.</p></div><div class="two-col"><article class="panel"><h3>Do not rank 73.2 against 68.2 and call TNA “better than AEW.”</h3><p>The TNA and AEW internal scores come from promotion-specific internal audits. Belt Theory treats them as diagnostic scores, not a universal leaderboard.</p></article><article class="panel"><h3>Do not compare WWE’s 55.8 directly with WCW’s 90%.</h3><p>55.8 is WWE’s share of an equal-window era comparison. 90% is a WCW career-pathway rate. They measure different things.</p></article></div><blockquote class="quote">The index is a map of evidence first. A universal ranking only becomes legitimate after every promotion is re-scored through one shared model.</blockquote></section>
<section class="section band"><div class="shell"><div class="section-head"><div><span class="kicker">Universal Index gate</span><h2>What v2.0 would require.</h2></div><p>Before Belt Theory publishes a true cross-promotion ranking, every promotion must pass the same standardization pass.</p></div><div class="roadmap-board fade-up"><article><b>01</b><strong>One common role map</strong><p>World, secondary, team, women’s and specialty seats must be normalized by function rather than belt name.</p></article><article><b>02</b><strong>One scoring model</strong><p>Prestige, development, pathways, durability, concentration, architecture and governance need one weight system.</p></article><article><b>03</b><strong>One comparison frame</strong><p>Time windows, active-seat exposure, source rules and sensitivity tests must be identical before a universal score is published.</p></article></div></div></section>
<section class="section shell"><div class="panel systems-index-next"><span class="kicker">Where the project goes next</span><h2>The next promotion enters the index—not another isolated spreadsheet.</h2><p>The Systems Index gives Belt Theory a permanent publication structure. Future research can now expand the evidence map without changing what the existing numbers mean.</p><div class="actions"><a class="button gold" href="scorecards.html">Browse scorecards</a><a class="button" href="comparisons.html">Browse comparisons</a></div></div></section>
</main>${footer}<script src="assets/site.js"></script></body></html>`;

await writeFile(path.join(outputRoot, 'systems-index.html'), html);

for (const page of ['index.html', 'scorecards.html', 'comparisons.html', 'research.html', 'methodology.html', 'about.html', 'update-policy.html', 'image-credits.html']) {
  const file = path.join(outputRoot, page);
  let content;
  try { content = await readFile(file, 'utf8'); } catch { continue; }
  if (page === 'index.html') {
    content = content.replace('<a class="button gold" href="scorecards.html">Explore scorecards</a>', '<a class="button gold" href="systems-index.html">Open Systems Index</a>');
  }
  if (!content.includes('href="systems-index.html">Systems index</a>')) {
    content = content.replace('<a href="methodology.html">Methodology</a>', '<a href="methodology.html">Methodology</a><a href="systems-index.html">Systems index</a>');
  }
  await writeFile(file, content);
}

let css = await readFile(path.join(outputRoot, 'assets', 'site.css'), 'utf8');
if (!css.includes('/* Championship Systems Index */')) {
  css += `\n/* Championship Systems Index */\n.systems-index-hero{overflow:hidden}.systems-index-hero:after{content:"INDEX / 01";position:absolute;right:3vw;bottom:-.18em;font-size:clamp(5rem,15vw,14rem);font-weight:900;letter-spacing:-.08em;color:rgba(232,173,40,.055);pointer-events:none}.systems-index-grid{display:grid;gap:18px}.system-fingerprint{display:grid;grid-template-columns:minmax(190px,.34fr) 1fr;border:1px solid var(--line);background:linear-gradient(120deg,color-mix(in srgb,var(--tone) 9%,#090b0b),#070808 45%);position:relative;overflow:hidden}.system-fingerprint:before{content:"";position:absolute;inset:0 auto 0 0;width:4px;background:var(--tone)}.system-fingerprint>div{padding:28px}.system-number{border-right:1px solid var(--line);display:flex;flex-direction:column;justify-content:space-between;gap:24px}.system-number small{color:var(--muted);line-height:1.45}.system-number strong{font-size:clamp(3.4rem,7vw,6.7rem);line-height:.85;letter-spacing:-.07em;color:var(--tone)}.system-fingerprint h3{font-size:clamp(1.8rem,3vw,3rem);margin:.35rem 0 1rem}.system-fingerprint dl{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:0 0 22px}.system-fingerprint dl>div{border-top:1px solid var(--line);padding-top:14px}.system-fingerprint dt{text-transform:uppercase;letter-spacing:.12em;font-size:.69rem;color:var(--tone);font-weight:800;margin-bottom:8px}.system-fingerprint dd{margin:0;color:var(--muted);line-height:1.55}.text-link{font-weight:800;color:var(--text)}.systems-index-next{padding:clamp(28px,5vw,58px)}@media(max-width:760px){.system-fingerprint{grid-template-columns:1fr}.system-number{border-right:0;border-bottom:1px solid var(--line)}.system-fingerprint dl{grid-template-columns:1fr}.systems-index-hero:after{font-size:6rem}}\n`;
  await writeFile(path.join(outputRoot, 'assets', 'site.css'), css);
}

console.log('Built Championship Systems Index v1.0 and linked it from the publication shell.');
