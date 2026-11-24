/**
 * Creates the index.js of a new walkthrough from its process file:
 *
 *   node tools/new-walkthrough.mjs <n.m> <part folder>/<Process> [title] [--pages]
 *   node tools/new-walkthrough.mjs 2.1 part2/ProcessElements "A process and its elements"
 *
 * The process is tutorial/process/tutorial/<part folder>/<Process>.p.json, its data class the
 * one named in its config. The default request parameters are taken from the start's
 * parameters (empty values); edit them in index.js afterwards. tour.js and text.js are written
 * by hand (see README, "Adding a walkthrough"). An existing index.js is never overwritten.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repo = resolve(root, '../..');
const [id, processName, title = ''] = process.argv.slice(2).filter(a => !a.startsWith('--'));
if (!id || !processName) {
  console.error('usage: node tools/new-walkthrough.mjs <n.m> <part folder>/<Process> [title]');
  process.exit(1);
}
const processPath = 'tutorial/process/tutorial/' + processName + '.p.json';
const json = JSON.parse(readFileSync(join(repo, processPath), 'utf8'));
const data = json.config.data; // tutorial.part2.ProcessElementsData
const dataPath = 'tutorial/dataclass/' + data.replace(/\./g, '/') + '.d.json';
if (!existsSync(join(repo, dataPath))) throw new Error('no data class file ' + dataPath);
const start = (json.elements || []).find(e => e.type === 'RequestStart');
const params = {};
((start && start.config && start.config.input && start.config.input.params) || []).forEach(p => { params[p.name] = ''; });
const dir = join(root, 'walkthroughs', id.replace('.', '-'));
const file = join(dir, 'index.js');
if (existsSync(file)) {
  console.error(file + ' exists already');
  process.exit(1);
}
mkdirSync(dir, { recursive: true });
writeFileSync(file, `/**
 * Walkthrough ${id} — ${title}
 * Plays ${processPath}.
 */
import process from '../../../../${processPath}';
import dataClass from '../../../../${dataPath}';
import { tour } from './tour.js';
import { strings } from './text.js';

export default {
  id: '${id}',
  file: '${processName.split('/').pop()}.p.json',
  path: '${processPath}',
  dataClassPath: '${dataPath}',
  process,
  dataClass,
  // what Run sends when the reader runs the process: the values of the start link
  params: ${JSON.stringify(params).replace(/"([a-zA-Z_]\w*)":/g, '$1: ').replace(/,/g, ', ').replace(/^\{/, '{ ').replace(/\}$/, ' }')},
  tour,
  strings
};
`);
console.log('wrote ' + file);
