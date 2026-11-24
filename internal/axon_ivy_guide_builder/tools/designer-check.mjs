/**
 * Asks the Designer for VS Code what it reports for every element of some processes: the
 * messages of its Problems view, read from its inscription server (the methods `validate`
 * and `data` the inscription view uses, over ws://…/ivy-inscription-lsp).
 *
 *   node tools/designer-check.mjs process/tutorial/part3/TwoPaths.p.json [more files] [--defaults]
 *
 * Paths are relative to the tutorial project. Needs the Designer running with this workspace;
 * a file the Designer has not deployed yet reports nothing. With --defaults it also prints
 * each element's default configuration (what a new element of that type gets).
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const project = resolve(root, '../../tutorial');
const args = process.argv.slice(2);
const files = args.filter(a => !a.startsWith('--'));
const defaults = args.includes('--defaults');
const socket = 'ws://localhost:8080/~Developer-axon-ivy-tutorial/ivy-inscription-lsp';
const context = { app: 'Developer-axon-ivy-tutorial', project: 'tutorial' };

const ws = new WebSocket(socket);
let id = 0;
const pending = new Map();
const send = (method, params) => new Promise(done => { const n = ++id; pending.set(n, done); ws.send(JSON.stringify({ jsonrpc: '2.0', id: n, method, params })); });
ws.onmessage = e => { const m = JSON.parse(typeof e.data === 'string' ? e.data : Buffer.from(e.data).toString()); if (pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } };
ws.onerror = () => { console.error('The Designer\'s inscription server is not reachable at ' + socket); process.exit(1); };

/** Every element of a process file, with the boxes' insides and the boundary events. */
function elementsOf(list, into = []) {
  (list || []).forEach(e => { into.push(e); elementsOf(e.boundaries, into); elementsOf(e.elements, into); });
  return into;
}

ws.onopen = async () => {
  await send('initialize');
  let problems = 0;
  for (const file of files) {
    const json = JSON.parse(readFileSync(join(project, file), 'utf8'));
    console.log('\n' + file);
    for (const el of elementsOf(json.elements)) {
      const pid = json.id + '-' + el.id;
      const found = await send('validate', { ...context, pid });
      const messages = (found || []).filter(m => m.severity !== 'INFO');
      if (defaults) {
        const data = await send('data', { ...context, pid });
        console.log('  ' + el.id + ' ' + (data && data.type && data.type.label) + ' defaults ' + JSON.stringify(data && data.defaults));
      }
      messages.forEach(m => { problems++; console.log('  ' + el.id + ' ' + m.severity + ' [' + m.path + '] ' + String(m.message).split('\n')[0]); });
    }
  }
  console.log('\n' + problems + ' problems');
  ws.close();
};
