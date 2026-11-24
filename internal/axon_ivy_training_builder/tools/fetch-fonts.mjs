/**
 * Fetches the page's font into vendor/fonts/, once; the build embeds it in the page (build.mjs),
 * so the page still needs no network. The page uses Roboto everywhere, in both themes.
 *
 * Only the Latin subset of the weights the page uses: Japanese is drawn by the system's fonts.
 * Each family comes with its licence (SIL Open Font License 1.1), which the build puts at the top
 * of the page script.
 *
 *   node tools/fetch-fonts.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const out = join(root, 'vendor/fonts');
// a browser that gets WOFF2 from Google Fonts
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const FAMILIES = [
  { family: 'Roboto', query: 'Roboto:wght@400;500;700', slug: 'roboto', licence: 'ofl/roboto/OFL.txt' }
];

async function get(url, as = 'text') {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(url + ': ' + res.status);
  return as === 'bytes' ? Buffer.from(await res.arrayBuffer()) : res.text();
}

mkdirSync(out, { recursive: true });
const faces = [];
for (const f of FAMILIES) {
  const css = await get('https://fonts.googleapis.com/css2?family=' + f.query + '&display=swap');
  // Google lists a block per subset, each after a comment naming it: keep the Latin ones
  const blocks = [...css.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g)].filter(m => m[1] === 'latin');
  if (!blocks.length) throw new Error(f.family + ': no Latin subset in ' + css.slice(0, 200));
  const files = new Map(); // a variable font serves several weights from one file
  for (const [, , body] of blocks) {
    const prop = name => (body.match(new RegExp(name + ':\\s*([^;]+);')) || [])[1]?.trim();
    const url = (prop('src').match(/url\(([^)]+)\)/) || [])[1];
    const weight = prop('font-weight');
    if (!files.has(url)) {
      const file = f.slug + (files.size ? '-' + (files.size + 1) : '') + '.woff2';
      writeFileSync(join(out, file), await get(url, 'bytes'));
      files.set(url, file);
    }
    faces.push({ family: f.family, style: prop('font-style') || 'normal', weight, file: files.get(url), unicodeRange: prop('unicode-range') });
  }
  writeFileSync(join(out, f.slug + '.OFL.txt'), await get('https://raw.githubusercontent.com/google/fonts/main/' + f.licence));
}
writeFileSync(join(out, 'fonts.json'), JSON.stringify(faces, null, 2) + '\n');
console.log(faces.map(x => `${x.family} ${x.weight} ${x.style}  ${x.file}`).join('\n'));
