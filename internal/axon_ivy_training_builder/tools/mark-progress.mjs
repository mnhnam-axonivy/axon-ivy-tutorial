/**
 * Marks skills of the Workflow tree as done in PROGRESS.md (texts, film, in the tree).
 *
 *   node tools/mark-progress.mjs workflow task tasklist …
 *   node tools/mark-progress.mjs --level 2          every skill of that level (and its boss)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { root, skills, bosses } from '../trees/workflow/nodes.js';

const file = new URL('../../../PROGRESS.md', import.meta.url);
const args = process.argv.slice(2);
const at = args.indexOf('--level');
const level = at >= 0 ? Number(args[at + 1]) : 0;
const ids = level
  ? [...(level === 1 ? [root.id] : []), ...skills.filter(s => s.level === level).map(s => s.id), ...bosses.filter(b => b.level === level).map(b => b.id)]
  : args;

const lines = readFileSync(file, 'utf8').split('\n');
let marked = 0;
for (const id of ids) {
  const i = lines.findIndex(l => l.startsWith('|') && l.includes('(`' + id + '`)'));
  if (i < 0) throw new Error('no row for ' + id);
  const cells = lines[i].split('|');
  // | Branch | Level | Skill | Source | T | F | ✔ |  →  cells[5], cells[6], cells[7]
  const film = cells[6].trim();
  cells[5] = ' [x] ';
  cells[6] = film === '[ ]' || film === '[x]' ? ' [x] ' : film.startsWith('[x]') ? ' ' + film + ' ' : ' [x] (' + film + ') ';
  cells[7] = ' [x] ';
  lines[i] = cells.join('|');
  marked++;
}
writeFileSync(file, lines.join('\n'));
console.log('marked ' + marked + ' skills in PROGRESS.md');
