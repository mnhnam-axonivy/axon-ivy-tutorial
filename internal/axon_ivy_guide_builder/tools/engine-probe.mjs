/**
 * Runs IvyScript, or whole small processes, on the Designer's own engine and prints what they
 * did: one probe process per entry, started with an HTTP request, the lines each request wrote
 * read from the engine's Runtime Log (the JSON-RPC websocket the Designer's "Axon Ivy Runtime
 * Log" channel reads).
 *
 *   node tools/engine-probe.mjs probes.json [--data tutorial.part3.ScriptCodeData] [--keep] [--wait 45]
 *
 * probes.json: { "<key>": <probe>, … }, where a probe is either
 *   - the IvyScript code of a Script Step (a string): the probe is Start → Script Step → End;
 *     a key with "?" sends request parameters: "p63?n=abc" (the start declares them as String);
 *   - a whole process: { "elements": [...], "kind"?: "CALLABLE_SUB", "data"?: "<data class>" }.
 *     Its start must be a Request Start with the signature "run"; a key with "?" sends those
 *     parameters. A key that starts with "_" is written but not started (a sub process that the
 *     others call as "probe/Probe__<name>:<signature>").
 *
 * Needs the Designer for VS Code running with this workspace (the engine on localhost:8080,
 * the project deployed). The probes are written to tutorial/process/probe/ and removed at the
 * end unless --keep is given. What the Designer itself reports for each probe is in its
 * Problems view: read it while the probes exist (--keep). Used to check the behaviour the
 * simulation copies; the results are recorded in PROGRESS.md ("Verified on the engine").
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const project = resolve(root, '../../tutorial');
const args = process.argv.slice(2);
const option = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const valued = new Set(['--data', '--url', '--log', '--wait']);
const file = args.find((a, i) => !a.startsWith('--') && !valued.has(args[i - 1]));
const data = option('--data') || 'tutorial.part3.ScriptCodeData';
const base = option('--url') || 'http://localhost:8080/~Developer-axon-ivy-tutorial/Developer-axon-ivy-tutorial/1/pro/tutorial/';
const socket = option('--log') || 'ws://localhost:8080/~Developer-axon-ivy-tutorial/ivy-runtime-log-lsp';
if (!file) {
  console.error('usage: node tools/engine-probe.mjs probes.json [--data <data class>] [--keep] [--wait <seconds>]');
  process.exit(1);
}
const probes = JSON.parse(readFileSync(file, 'utf8'));
const dir = join(project, 'process', 'probe');
mkdirSync(dir, { recursive: true });
const write = (path, obj) => writeFileSync(path, JSON.stringify(obj, null, 2).replace(/^( *)"([^"]+)": /gm, '$1"$2" : ') + '\n');
const element = (id, type, name, x, extra = {}) => ({ id, type, name, ...extra, visual: { at: { x, y: 64 } } });
const SCHEMA = 'https://json-schema.axonivy.com/14.0/project/process.json';

const runs = [];
Object.entries(probes).forEach(([key, probe], n) => {
  const [name, query = ''] = key.split('?');
  const pid = '19F4A2C1B0D3EF' + n.toString(16).toUpperCase().padStart(2, '0');
  const path = join(dir, 'Probe_' + name.replace(/\W/g, '_') + '.p.json');
  if (probe && typeof probe === 'object') {
    write(path, { $schema: SCHEMA, id: pid, ...(probe.kind ? { kind: probe.kind } : {}), config: { data: probe.data || data }, elements: probe.elements });
    if (!name.startsWith('_')) runs.push({ key, pid, query });
    return;
  }
  const params = query ? query.split('&').map(pair => ({ name: pair.split('=')[0], type: 'String' })) : [];
  write(path, {
    $schema: SCHEMA, id: pid, config: { data },
    elements: [
      element('f0', 'RequestStart', name, 96, { config: { signature: 'run', ...(params.length ? { input: { params } } : {}) }, connect: [{ id: 'f2', to: 'f3' }] }),
      element('f3', 'Script', name, 256, { config: { output: { code: probe } }, connect: [{ id: 'f4', to: 'f1' }] }),
      element('f1', 'TaskEnd', 'end', 416)
    ]
  });
  runs.push({ key, pid, query });
});

const sleep = ms => new Promise(r => setTimeout(r, ms));
console.log(runs.length + ' probes written to ' + dir + '; waiting for the Designer to deploy them …');
await sleep(Number(option('--wait') || 45) * 1000);

/** The Runtime Log of the engine, as the Designer reads it. */
let calls = 0;
const readLog = () => new Promise((resolveLog, reject) => {
  const ws = new WebSocket(socket);
  const id = ++calls;
  ws.onerror = e => reject(new Error('Runtime Log not reachable: ' + (e.message || socket)));
  ws.onmessage = e => {
    const msg = JSON.parse(typeof e.data === 'string' ? e.data : Buffer.from(e.data).toString());
    if (msg.id === id) { ws.close(); resolveLog(msg.result || []); }
  };
  ws.onopen = () => ws.send(JSON.stringify({ jsonrpc: '2.0', id, method: 'data' }));
});
// one request after the other; a request's lines are those the log has gained after it
let known = (await readLog()).length;
for (const run of runs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(base + run.pid + '/run.ivp' + (run.query ? '?' + run.query : ''), { redirect: 'manual', signal: controller.signal });
    run.status = res.status;
  } catch (e) {
    run.status = 'no answer within 20 s';
  }
  clearTimeout(timer);
  await sleep(300);
  const log = await readLog();
  run.entries = log.slice(log.length >= known ? known : 0);
  known = log.length;
}

for (const run of runs) {
  const failed = typeof run.status !== 'number' || run.status >= 400;
  console.log('\n' + run.key + (failed ? '  → the request failed (' + (typeof run.status === 'number' ? 'HTTP ' + run.status : run.status) + ')' : ''));
  run.entries.forEach(e => {
    const cause = String(e.throwableInformationMsg || '').split('\n').filter(l => /^\s*Caused by:/.test(l)).pop();
    const where = String(e.processElement || '').replace(/^19F4A2C1B0D3EF/, '#');
    console.log('  [' + e.level + '] [' + e.category + '] ' + (where ? '(' + where + ') ' : '') + e.message + (cause ? '\n      ' + cause.trim() : ''));
  });
}

if (!args.includes('--keep')) {
  rmSync(dir, { recursive: true, force: true });
  console.log('\nprobes removed');
}
