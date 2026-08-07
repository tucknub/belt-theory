import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outputRoot = path.resolve(process.argv[2] || path.join(root, 'dist'));
const builtManifest = JSON.parse(await readFile(path.join(outputRoot, 'assets', 'archive', 'manifest.json'), 'utf8'));
const dimensions = new Map();

for (const asset of builtManifest.assets) {
  const variant = asset.variants.find((item) => item.requestedWidth === asset.defaultWidth) || asset.variants.at(-1);
  dimensions.set(asset.id, { width: variant.width, height: variant.height });
}

const rootPages = (await readdir(outputRoot)).filter((name) => name.endsWith('.html'));
const additionalPages = ['prototype/authentic-home.html', 'prototype/image-credits.html'];

for (const relative of [...rootPages, ...additionalPages]) {
  const pagePath = path.join(outputRoot, relative);
  let html = await readFile(pagePath, 'utf8');

  html = html
    .replaceAll('<nav class="desktopnav">', '<nav aria-label="Primary navigation" class="desktopnav">')
    .replaceAll('<nav class="mobilenav">', '<nav aria-label="Mobile navigation" class="mobilenav">')
    .replaceAll('<nav><a href="methodology.html">', '<nav aria-label="Footer navigation"><a href="methodology.html">')
    .replaceAll('<a class="active"', '<a aria-current="page" class="active"')
    .replaceAll('Sting and Darby Allin appearing together at AEW All In 2023 inside Wembley Stadium.', 'Sting stands in the ring while Darby Allin lies on a coffin during AEW All In 2023 at Wembley Stadium.')
    .replaceAll('Sting and Darby Allin at AEW All In — August 27, 2023.', 'Sting stands nearby as Darby Allin lies on a coffin at AEW All In — August 27, 2023.');

  html = html.replace(/<button\b[^>]*\bclass="[^"]*\bmenubutton\b[^"]*"[^>]*>/gi, (tag) => {
    if (/\btype="button"/i.test(tag)) return tag;
    return tag.replace(/^<button\b/i, '<button type="button"');
  });

  if (relative === '404.html' && !/<meta\b[^>]*name="description"/i.test(html)) {
    html = html.replace('</title>', '</title><meta name="description" content="Belt Theory page not found.">');
  }

  html = html.replace(/<img\b[^>]*data-asset-id="([^"]+)"[^>]*>/gi, (tag, id) => {
    const size = dimensions.get(id);
    if (!size) return tag;
    let updated = tag;
    if (!/\bwidth="\d+"/i.test(updated)) updated = updated.replace(/>$/, ` width="${size.width}">`);
    if (!/\bheight="\d+"/i.test(updated)) updated = updated.replace(/>$/, ` height="${size.height}">`);
    return updated;
  });

  await writeFile(pagePath, html);
}

const focusRules = `
/* Release accessibility — visible keyboard focus in every color scheme */
:where(a, button, [role="button"], [tabindex]):focus-visible {
  outline: 3px solid #f4c65b;
  outline-offset: 3px;
}
@media (forced-colors: active) {
  :where(a, button, [role="button"], [tabindex]):focus-visible { outline-color: Highlight; }
}
`;

for (const relative of ['assets/site.css', 'prototype/authentic-home.css']) {
  const cssPath = path.join(outputRoot, relative);
  const css = await readFile(cssPath, 'utf8');
  if (!css.includes('Release accessibility — visible keyboard focus')) {
    await writeFile(cssPath, `${css.trimEnd()}\n${focusRules}`);
  }
}

console.log(`Finalized accessibility semantics and intrinsic image dimensions across ${rootPages.length} production pages.`);
