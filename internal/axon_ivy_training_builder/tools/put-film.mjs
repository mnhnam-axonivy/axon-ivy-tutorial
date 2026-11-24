/**
 * Puts film sections into a films file of a tree: a section that defines films.<id> replaces the
 * one the file has for that id, or is added at the end. A section starts with its
 * "// ==================== title ====================" line.
 *
 *   node tools/put-film.mjs trees/workflow/films/task1.js new-sections.js
 *
 * A helper for writing a tree in pieces; the films files stay the source.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const [target, source] = process.argv.slice(2);
const split = text => text.replace(/\r\n/g, '\n').split(/\n(?=\/\/ =====)/);
const idOf = section => (/\nfilms\.(\w+) = /.exec(section) || [])[1];

const [head, ...old] = split(readFileSync(target, 'utf8'));
const sections = old.map(s => s.trimEnd());
for (const section of split('\n' + readFileSync(source, 'utf8')).map(s => s.trimEnd()).filter(idOf)) {
  const at = sections.findIndex(s => idOf(s) === idOf(section));
  if (at >= 0) sections[at] = section;
  else sections.push(section);
  console.log((at >= 0 ? 'replaced ' : 'added ') + idOf(section));
}
writeFileSync(target, [head.trimEnd(), ...sections].join('\n\n') + '\n');
