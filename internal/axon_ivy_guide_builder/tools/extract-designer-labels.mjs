/**
 * Copies the inscription labels of the real Designer into runtime/designer-labels.json, so the
 * simulated inscription view uses the Designer's own words, in English and Japanese.
 *
 * Source: the process editor of the installed "Axon Ivy Designer for VS Code" extension
 * (axonivy.vscode-designer-14). Its bundle carries the label tables of every language it ships;
 * this script finds the English and the Japanese one and keeps the parts the guide needs.
 *
 *   node tools/extract-designer-labels.mjs [path to the extension]
 *
 * Run it again after the Designer is updated, and commit the JSON.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const KEEP = ['part', 'label', 'common', 'priority', 'responsible', 'title', 'toolbar'];

function findExtension() {
  if (process.argv[2]) return process.argv[2];
  const dir = join(homedir(), '.vscode', 'extensions');
  const found = existsSync(dir) ? readdirSync(dir).filter(n => n.startsWith('axonivy.vscode-designer-14')).sort().pop() : null;
  if (!found) throw new Error('The extension axonivy.vscode-designer-14 is not installed; pass its folder as argument.');
  return join(dir, found);
}

/** The object literal that starts at `start` (template literals may contain braces). */
function objectAt(source, start) {
  const open = source.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    const c = source[i];
    if (c === '`') { i = source.indexOf('`', i + 1); continue; }
    if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return source.slice(open, i + 1);
  }
  throw new Error('Unbalanced object');
}

const extension = findExtension();
const assets = join(extension, 'dist', 'webviews', 'process-editor', 'assets');
const bundle = readdirSync(assets).find(n => /^index-.*\.js$/.test(n));
const source = readFileSync(join(assets, bundle), 'utf8');

// every label table starts with "<name>={a11y:" and holds part.output.disablePermission
const tables = [];
for (const m of source.matchAll(/[\w$]+=\{a11y:/g)) {
  // eslint-disable-next-line no-new-func
  const table = Function('return ' + objectAt(source, m.index))();
  if (table.part && table.part.output) tables.push(table);
}
const en = tables.find(t => t.part.output.title === 'Output');
const ja = tables.find(t => /[\u3040-\u30ff\u4e00-\u9fff]/.test(t.part.output.title)); // kana or kanji
if (!en || !ja) throw new Error('Did not find the English and the Japanese label table in ' + bundle);

const pick = table => Object.fromEntries(KEEP.map(key => [key, table[key]]));
const version = JSON.parse(readFileSync(join(extension, 'package.json'), 'utf8')).version;
const out = { source: 'axonivy.vscode-designer-14 ' + version + ' (process editor)', en: pick(en), ja: pick(ja) };
writeFileSync(join(root, 'runtime', 'designer-labels.json'), JSON.stringify(out, null, 1) + '\n');
console.log('runtime/designer-labels.json written from Designer ' + version);
