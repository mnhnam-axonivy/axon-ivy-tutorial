/**
 * Alternative, Split and Join, Call Sub, Embedded Subprocess and errors of the simulation
 * against the engine 14.0.1.
 *
 * Every case below was run on 2026-11-16 as a probe process on the Designer's engine (the same
 * elements, connectors and data); the comment of each test says what the engine's Runtime Log
 * showed. The Designer's messages were read from its inscription server. See PROGRESS.md,
 * "Part 3, checked on the engine".
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadProcess } from '../runtime/model/process.js';
import { ProcessRunner, errorCodeMatches } from '../runtime/model/runner.js';
import { validateCondition, validateScript } from '../runtime/model/ivyscript.js';

const DATA = {
  simpleName: 'ProbeData', namespace: 'tutorial.probe',
  fields: [{ name: 'n', type: 'Number' }, { name: 'text' }, { name: 'a' }, { name: 'b' }, { name: 'flag', type: 'Boolean' }, { name: 'price', type: 'Number' }]
};

let next = 100;
const el = (id, type, extra = {}) => ({ id, type, ...extra, visual: { at: { x: 0, y: 0 } } });
const go = (...targets) => targets.map(t => (typeof t === 'string' ? { id: 'f' + (next++), to: t } : t));
const start = (to, map = { 'out.n': 'param.n' }) => el('f0', 'RequestStart', { name: 'run', config: { signature: 'run', input: { params: [{ name: 'n', type: 'Number' }], map } }, connect: go(to) });
const script = (id, code, to) => el(id, 'Script', { name: id, config: { output: { code } }, ...(to ? { connect: go(to) } : {}) });
const end = (id = 'f1') => el(id, 'TaskEnd');
const log = expr => 'ivy.log.info(' + expr + ');';

function model(elements, { kind, ref = 'probe/Probe', file = 'Probe.p.json' } = {}) {
  return loadProcess({ id: 'PROBE' + ref.replace(/\W/g, ''), kind, config: { data: 'tutorial.probe.ProbeData' }, elements }, DATA, { project: 'tutorial', file, path: 'tutorial/process/' + ref + '.p.json' });
}

async function run(elements, n = 1, subs = []) {
  const main = model(elements);
  const runner = new ProcessRunner({ model: main, models: [main, ...subs], now: () => new Date(2026, 10, 16) });
  const result = await runner.run({ params: { n: String(n) } });
  return { ...result, lines: result.logs.filter(l => l.category === 'USER').map(l => l.message) };
}

// ── Alternative ──────────────────────────────────────────────────────────────

const alt = (conditions, extra = '', map) => [
  start('f2', map),
  el('f2', 'Alternative', { name: 'alt', config: { conditions }, connect: [{ id: 'f21', to: 'f3' }, { id: 'f22', to: 'f4' }] }),
  script('f3', extra + log('"took A"'), 'f1'),
  script('f4', extra + log('"took B"'), 'f1'),
  end()
];

test('Alternative: an exit that is not listed is taken when the listed ones are false (took B)', async () => {
  assert.deepEqual((await run(alt({ f21: 'in.n > 5' }))).lines, ['took B']);
});

test('Alternative: an empty condition holds (took B; listed first, took A)', async () => {
  assert.deepEqual((await run(alt({ f21: 'in.n > 5', f22: '' }))).lines, ['took B']);
  assert.deepEqual((await run(alt({ f21: '', f22: 'in.n > 0' }))).lines, ['took A']);
});

test('Alternative: the order of the conditions decides, not the order of the connectors (took B)', async () => {
  assert.deepEqual((await run(alt({ f22: 'true', f21: 'true' }))).lines, ['took B']);
  assert.deepEqual((await run(alt({ f22: 'in.n > 0' }))).lines, ['took B']);
  assert.deepEqual((await run(alt({ f22: 'in.n > 5' }))).lines, ['took A']);
  assert.deepEqual((await run(alt({ f21: 'in.n > 0', f22: 'in.n > 5' }), 10)).lines, ['took A']);
});

test('Alternative: no condition true: the request fails with IllegalStateException', async () => {
  const result = await run(alt({ f21: 'in.n > 5', f22: 'in.n > 10' }));
  assert.equal(result.status, 'failed');
  const line = result.logs.find(l => l.category === 'REQUEST');
  assert.match(line.message, /^Problem while processing request/);
  assert.equal(line.detail, 'Caused by: java.lang.IllegalStateException: In the alternative all conditions evaluate to false');
});

test('Alternative: a condition that fails fails the request (/ by zero)', async () => {
  const result = await run(alt({ f21: '1 / in.n > 0', f22: '' }), 0);
  assert.equal(result.status, 'failed');
  assert.match(result.logs.find(l => l.category === 'REQUEST').detail, /ArithmeticException: \/ by zero/);
});

test('Alternative: out cannot be used; text is not true; = assigns and is true', async () => {
  const withOut = await run(alt({ f21: 'out.n > 5', f22: '' }), 10);
  assert.equal(withOut.status, 'failed');
  assert.match(withOut.logs.find(l => l.category === 'REQUEST').detail, /Variable 'out' cannot be resolved/);
  assert.deepEqual((await run(alt({ f21: 'in.text', f22: '' }))).lines, ['took B']);
  assert.deepEqual((await run(alt({ f21: 'in.text', f22: '' }, '', { 'out.n': 'param.n', 'out.text': '"abc"' }))).lines, ['took B']);
  assert.deepEqual((await run(alt({ f21: 'in.flag = true', f22: '' }, log('"flag " + in.flag')))).lines, ['flag true', 'took A']);
});

test('Alternative, Designer: Condition #1 messages', () => {
  const ctx = { fields: DATA.fields.map(f => ({ type: 'String', ...f })), dataClassName: 'tutorial.probe.ProbeData', vars: {}, noOut: true };
  assert.equal(validateCondition('in.text', ctx).message, 'Cannot cast object of type String to type Boolean');
  assert.equal(validateCondition('out.n > 5', ctx).message, "Variable 'out' cannot be resolved");
  assert.equal(validateCondition('in.flag = true', ctx), null);
  assert.equal(validateCondition('in.n > 5', ctx), null);
});

test('Alternative: a loop back runs until its condition is false; two paths meet at an Alternative', async () => {
  const loop = await run([
    start('f3'),
    script('f3', 'in.n = in.n + 1;\n' + log('"round " + in.n'), 'f2'),
    el('f2', 'Alternative', { config: { conditions: { f21: 'in.n < 3' } }, connect: [{ id: 'f21', to: 'f3' }, { id: 'f22', to: 'f1' }] }),
    end()
  ], 0);
  assert.deepEqual(loop.lines, ['round 1', 'round 2', 'round 3']);
  const merge = await run([
    start('f2'),
    el('f2', 'Alternative', { config: { conditions: { f21: 'in.n > 5' } }, connect: [{ id: 'f21', to: 'f3' }, { id: 'f22', to: 'f4' }] }),
    script('f3', 'in.a = "A";', 'f5'),
    script('f4', 'in.a = "B";', 'f5'),
    el('f5', 'Alternative', { connect: go('f6') }),
    script('f6', log('"after merge " + in.a'), 'f1'),
    end()
  ]);
  assert.deepEqual(merge.lines, ['after merge B']);
});

test('a loop that does not end: the simulation stops it (the engine ran 10 000 rounds)', async () => {
  const result = await run([
    start('f3'),
    script('f3', 'in.n = in.n + 1;', 'f2'),
    el('f2', 'Alternative', { config: { conditions: { f21: 'in.n > 0' } }, connect: [{ id: 'f21', to: 'f3' }, { id: 'f22', to: 'f1' }] }),
    end()
  ]);
  assert.equal(result.status, 'stopped');
  assert.equal(result.stopReason, 'loop');
});

// ── Split and Join ───────────────────────────────────────────────────────────

const report = tag => log('"' + tag + ' a=" + in.a + " b=" + in.b + " n=" + in.n');
const splitJoin = (split, join, paths = ['in.a = in.a + "1";\n', 'in.b = in.b + "2";\n'], after = report('joined')) => [
  start('f2'),
  el('f2', 'Split', { ...(split ? { config: split } : {}), connect: paths.map((p, i) => ({ id: 'f2' + (i + 1), to: 'p' + (i + 1), outVar: 'out' + (i + 1) })) }),
  ...paths.map((code, i) => el('p' + (i + 1), 'Script', { name: 'p' + (i + 1), config: { output: { code: code + report('path' + (i + 1)) } }, connect: [{ id: 'f3' + (i + 1), to: 'f5', var: 'in' + (i + 1) }] })),
  el('f5', 'Join', { ...(join ? { config: join } : {}), connect: go('f6') }),
  script('f6', after, 'f1'),
  end()
];

test('Split, no mapping: only out1 gets the data; the second path runs first; the Join keeps in1', async () => {
  const result = await run(splitJoin(null, null, ['in.a = "1";\n', 'in.b = "2";\n']), 7);
  assert.deepEqual(result.lines, ['path2 a= b=2 n=0', 'path1 a=1 b= n=7', 'joined a=1 b= n=7']);
});

test('Split: the paths take turns, one element each (b1 a1 b2 a2); three paths: 2, 3, 1', async () => {
  const two = await run([
    start('f2'),
    el('f2', 'Split', { connect: [{ id: 'f21', to: 'f3', outVar: 'out1' }, { id: 'f22', to: 'f5', outVar: 'out2' }] }),
    script('f3', log('"a1"'), 'f4'),
    el('f4', 'Script', { config: { output: { code: log('"a2"') } }, connect: [{ id: 'f41', to: 'f7', var: 'in1' }] }),
    script('f5', log('"b1"'), 'f6'),
    el('f6', 'Script', { config: { output: { code: log('"b2"') } }, connect: [{ id: 'f42', to: 'f7', var: 'in2' }] }),
    el('f7', 'Join', { connect: go('f8') }),
    script('f8', log('"joined"'), 'f1'),
    end()
  ]);
  assert.deepEqual(two.lines, ['b1', 'a1', 'b2', 'a2', 'joined']);
  const three = await run(splitJoin(null, null, ['', '', ''], log('"joined n=" + in.n')), 7);
  assert.deepEqual(three.lines.map(l => l.split(' ')[0]), ['path2', 'path3', 'path1', 'joined']);
});

test('Split and Join with mappings: out1.a, out2.b; out ← in1 and out.b ← in2.b', async () => {
  const result = await run(splitJoin({ output: { map: { 'out1.a': '"x"', 'out2.b': '"y"' } } }, { output: { map: { out: 'in1', 'out.b': 'in2.b' } } }));
  assert.deepEqual(result.lines, ['path2 a= b=y2 n=0', 'path1 a=x1 b= n=0', 'joined a=x1 b=y2 n=0']);
  const both = await run(splitJoin({ output: { map: { out1: 'in', out2: 'in' } } }, { output: { map: { out: 'in1', 'out.b': 'in2.b' } } }), 5);
  assert.equal(both.lines[2], 'joined a=1 b=2 n=5');
});

test('Join: code with in1 and in2; a mapping without out ← in1 starts empty; in cannot be used', async () => {
  const code = await run(splitJoin(null, { output: { code: 'out.a = in1.a + "+" + in2.a;\nout.b = in1.b + "+" + in2.b;' } }));
  assert.equal(code.lines[2], 'joined a=1+ b=+2 n=1');
  const onlyB = await run(splitJoin(null, { output: { map: { 'out.b': 'in2.b' } } }));
  assert.equal(onlyB.lines[2], 'joined a= b=2 n=0');
  const withIn = await run(splitJoin(null, { output: { code: log('"join in.a=" + in.a') } }));
  assert.equal(withIn.status, 'failed');
  assert.match(withIn.logs.find(l => l.category === 'REQUEST').detail, /Variable 'in' cannot be resolved/);
});

test('Join reached by one path only: the token waits; nothing after it runs, no error', async () => {
  const result = await run([
    start('f2'),
    el('f2', 'Alternative', { config: { conditions: { f21: 'in.n > 5', f22: '' } }, connect: [{ id: 'f21', to: 'f3' }, { id: 'f22', to: 'f4' }] }),
    el('f3', 'Script', { config: { output: { code: log('"A"') } }, connect: [{ id: 'f31', to: 'f5', var: 'in1' }] }),
    el('f4', 'Script', { config: { output: { code: log('"B"') } }, connect: [{ id: 'f32', to: 'f5', var: 'in2' }] }),
    el('f5', 'Join', { connect: go('f6') }),
    script('f6', log('"after the join"'), 'f1'),
    end()
  ]);
  assert.deepEqual(result.lines, ['B']);
  assert.equal(result.status, 'stopped');
  assert.equal(result.stopReason, 'join');
  assert.equal(result.logs.filter(l => l.level === 'error').length, 0);
});

// ── Call Sub ─────────────────────────────────────────────────────────────────

const sub = () => model([
  el('f0', 'CallSubStart', { name: 'calc(Number)', config: { signature: 'calc', input: { params: [{ name: 'weight', type: 'Number' }], map: { 'out.n': 'param.weight' } }, result: { params: [{ name: 'price', type: 'Number' }], map: { 'result.price': 'in.n * 2' } } }, connect: go('f3') }),
  script('f3', log('"sub n=" + in.n + " a=[" + in.a + "]"') + '\nin.n = in.n + 1;', 'f1'),
  el('f1', 'CallSubEnd')
], { kind: 'CALLABLE_SUB', ref: 'probe/Probe__sub', file: 'Probe__sub.p.json' });
const noResult = () => model([
  el('f0', 'CallSubStart', { name: 'calc(Number)', config: { signature: 'calc', input: { params: [{ name: 'weight', type: 'Number' }], map: { 'out.n': 'param.weight' } }, result: { params: [{ name: 'price', type: 'Number' }] } }, connect: go('f1') }),
  el('f1', 'CallSubEnd')
], { kind: 'CALLABLE_SUB', ref: 'probe/Probe__noresult', file: 'Probe__noresult.p.json' });
const call = (processCall, callMap, outputMap) => [
  start('f2', { 'out.n': 'param.n', 'out.a': '"outer"' }),
  el('f2', 'SubProcessCall', { name: 'call', config: { processCall, call: { map: callMap }, output: { map: outputMap } }, connect: go('f3') }),
  script('f3', log('"after n=" + in.n + " a=" + in.a + " price=" + in.price'), 'f1'),
  end()
];

test('Call Sub: the sub process has data of its own; the result is mapped at its end; without out ← in the caller data is lost', async () => {
  const basic = await run(call('probe/Probe__sub:calc(Number)', { 'param.weight': 'in.n' }, { 'out.price': 'result.price' }), 5, [sub()]);
  assert.deepEqual(basic.lines, ['sub n=5 a=[]', 'after n=0 a= price=12']);
  const kept = await run(call('probe/Probe__sub:calc(Number)', { 'param.weight': 'in.n' }, { out: 'in', 'out.price': 'result.price' }), 5, [sub()]);
  assert.deepEqual(kept.lines, ['sub n=5 a=[]', 'after n=5 a=outer price=12']);
});

test('Call Sub: a parameter not mapped arrives as 0; a result not mapped returns 0', async () => {
  const noParam = await run(call('probe/Probe__sub:calc(Number)', {}, { 'out.price': 'result.price' }), 5, [sub()]);
  assert.deepEqual(noParam.lines, ['sub n=0 a=[]', 'after n=0 a= price=2']);
  const unmapped = await run(call('probe/Probe__noresult:calc(Number)', { 'param.weight': 'in.n' }, { 'out.price': 'result.price' }), 5, [noResult()]);
  assert.deepEqual(unmapped.lines, ['after n=0 a= price=0']);
});

// ── Embedded Subprocess, BPMN activities ─────────────────────────────────────

const box = (type, inner = true) => [
  el('f0', 'RequestStart', { name: 'run', config: { signature: 'run', input: { params: [{ name: 'n', type: 'Number' }], map: { 'out.n': 'param.n' } } }, connect: [{ id: 'f50', to: 'S1' }] }),
  el('S1', type, {
    name: 'folded',
    elements: inner ? [
      el('S1-g0', 'EmbeddedStart', { parentConnector: 'f50', connect: [{ id: 'S1-f0', to: 'S1-f1' }] }),
      el('S1-f1', 'Script', { config: { output: { code: 'in.a = "inside";\n' + log('"inside n=" + in.n') } }, connect: [{ id: 'S1-f2', to: 'S1-g1' }] }),
      el('S1-g1', 'EmbeddedEnd', { parentConnector: 'f51' })
    ] : [],
    connect: [{ id: 'f51', to: 'f3' }]
  }),
  script('f3', log('"after a=" + in.a'), 'f1'),
  end()
];

test('Embedded Subprocess and BPMN activity: the elements inside run with the same data', async () => {
  assert.deepEqual((await run(box('EmbeddedProcess'))).lines, ['inside n=1', 'after a=inside']);
  assert.deepEqual((await run(box('ScriptBpmnElement'))).lines, ['inside n=1', 'after a=inside']);
});

test('an empty Embedded Subprocess or BPMN activity keeps the token: nothing after it runs, no error', async () => {
  for (const type of ['EmbeddedProcess', 'UserBpmnElement']) {
    const result = await run(box(type, false));
    assert.deepEqual(result.lines, []);
    assert.equal(result.status, 'stopped');
    assert.equal(result.stopReason, 'empty');
  }
});

// ── errors ───────────────────────────────────────────────────────────────────

test('error codes: empty catches all; parts, prefixes and * as the Error Handling page says', () => {
  assert.ok(errorCodeMatches('', 'booking:failed'));
  assert.ok(errorCodeMatches('booking:failed', 'booking:failed'));
  assert.ok(errorCodeMatches('booking', 'booking:failed'));
  assert.ok(errorCodeMatches('*:failed', 'booking:failed'));
  assert.ok(errorCodeMatches('custom:error:*', 'custom:error'));
  assert.ok(!errorCodeMatches('payment', 'booking:failed'));
  assert.ok(!errorCodeMatches('booking:failed:late', 'booking:failed'));
});

const boundary = (id, code, to, errorCode) => el(id, 'ErrorBoundaryEvent', { config: { ...(errorCode !== undefined ? { errorCode } : {}), ...(code ? { output: { code } } : {}) }, connect: go(to) });

test('Error Boundary Event on a Script Step that fails: ivy:error:script; the data keeps what ran before', async () => {
  const result = await run([
    start('f2'),
    { ...script('f2', log('"before"') + '\nin.a = "changed";\nNumber x = 1 / 0;', 'f1'), boundaries: [boundary('f9', log('"caught code=" + error.getErrorCode() + " a=" + in.a'), 'f3')] },
    script('f3', log('"after the boundary a=" + in.a'), 'f1'),
    end()
  ]);
  assert.equal(result.status, 'completed');
  assert.deepEqual(result.lines, ['before', 'caught code=ivy:error:script a=changed', 'after the boundary a=changed']);
});

const errSub = () => model([
  el('f0', 'CallSubStart', { name: 'book()', config: { signature: 'book' }, connect: go('f2') }),
  el('f2', 'ErrorEnd', { name: 'booking:failed', config: { throws: { error: 'booking:failed' }, code: log('"error end code runs"') } })
], { kind: 'CALLABLE_SUB', ref: 'probe/Probe__errsub', file: 'Probe__errsub.p.json' });
const callFailing = (errorCode, extra = []) => [
  start('f2'),
  { ...el('f2', 'SubProcessCall', { name: 'call', config: { processCall: 'probe/Probe__errsub:book()' }, connect: go('f4') }), boundaries: [boundary('f9', log('"caught by the boundary: " + error.getErrorCode()'), 'f3', errorCode)] },
  script('f3', log('"error path"'), 'f1'),
  script('f4', log('"normal path"'), 'f1'),
  end(),
  ...extra
];

test('Error End in a callable sub process: caught by the boundary on the Call Sub with the code, a prefix or *', async () => {
  for (const code of ['booking:failed', 'booking', '*:failed']) {
    const result = await run(callFailing(code), 1, [errSub()]);
    assert.deepEqual(result.lines, ['error end code runs', 'caught by the boundary: booking:failed', 'error path']);
  }
});

test('Error End not caught: the request fails with BpmError booking:failed; an Error Start of the caller catches it', async () => {
  const failed = await run(callFailing('payment'), 1, [errSub()]);
  assert.equal(failed.status, 'failed');
  assert.equal(failed.logs.find(l => l.category === 'REQUEST').detail, 'booking:failed — Caused by: BpmError booking:failed');
  const caught = await run(callFailing('payment', [
    el('f7', 'ErrorStartEvent', { name: 'booking', config: { errorCode: 'booking', output: { code: log('"caught by the error start: " + error.getErrorCode()') } }, connect: go('f8') }),
    end('f8')
  ]), 1, [errSub()]);
  assert.deepEqual(caught.lines, ['error end code runs', 'caught by the error start: booking:failed']);
});

const errorStart = (errorCode, code) => [
  el('f7', 'ErrorStartEvent', { name: errorCode || 'all', config: { ...(errorCode ? { errorCode } : {}), output: { code } }, connect: go('f8') }),
  end('f8')
];

test('Error End and Error Start on the same level: not caught', async () => {
  const result = await run([start('f2'), el('f2', 'ErrorEnd', { config: { throws: { error: 'booking:failed' } } }), ...errorStart('booking:failed', log('"caught on the same level"'))]);
  assert.equal(result.status, 'failed');
  assert.deepEqual(result.lines, []);
  assert.equal(result.logs.find(l => l.category === 'REQUEST').detail, 'booking:failed — Caused by: BpmError booking:failed');
});

test('Error Start catches a failing script of its level, with the data at the failure; a boundary goes first', async () => {
  const result = await run([start('f2'), script('f2', 'in.a = "changed";\nNumber x = 1 / 0;', 'f1'), end(), ...errorStart('', log('"error start: " + error.getErrorCode() + " n=" + in.n + " a=" + in.a'))], 4);
  assert.deepEqual(result.lines, ['error start: ivy:error:script n=4 a=changed']);
  const both = await run([
    start('f2'),
    { ...script('f2', 'Number x = 1 / 0;', 'f1'), boundaries: [boundary('f9', log('"boundary"'), 'f3')] },
    script('f3', log('"error path"'), 'f1'),
    end(),
    ...errorStart('', log('"error start"'))
  ]);
  assert.deepEqual(both.lines, ['boundary', 'error path']);
  const wrong = await run([start('f2'), script('f2', 'Number x = 1 / 0;', 'f1'), end(), ...errorStart('booking', log('"error start"'))]);
  assert.equal(wrong.status, 'failed');
  assert.match(wrong.logs.find(l => l.category === 'REQUEST').detail, /ArithmeticException: \/ by zero/);
});

test('BpmError.create(…).throwError() needs the import; then an Error Start catches it; uncaught: BpmError stock:empty', async () => {
  const noImport = await run([start('f2'), script('f2', 'BpmError.create("stock:empty").throwError();', 'f1'), end()]);
  assert.match(noImport.logs.find(l => l.category === 'REQUEST').detail, /Variable 'BpmError' cannot be resolved/);
  const IMPORT = 'import ch.ivyteam.ivy.bpm.error.BpmError;\n';
  const caught = await run([start('f2'), script('f2', IMPORT + 'BpmError.create("stock:empty").throwError();', 'f1'), end(), ...errorStart('stock:empty', log('"caught " + error.getErrorCode()'))]);
  assert.deepEqual(caught.lines, ['caught stock:empty']);
  const uncaught = await run([start('f2'), script('f2', IMPORT + 'BpmError.create("stock:empty").throwError();', 'f1'), end()]);
  assert.equal(uncaught.logs.find(l => l.category === 'REQUEST').detail, 'stock:empty — Caused by: BpmError stock:empty');
});

test('BpmError, Designer: without the import Variable \'BpmError\' cannot be resolved', () => {
  const ctx = { fields: [], vars: {} };
  assert.equal(validateScript('BpmError.create("stock:empty").throwError();', ctx).message, "Variable 'BpmError' cannot be resolved");
  assert.equal(validateScript('import ch.ivyteam.ivy.bpm.error.BpmError;\nBpmError.create("stock:empty").throwError();', ctx), null);
});

test('Error End inside an Embedded Subprocess: caught by the boundary on the box', async () => {
  const result = await run([
    el('f0', 'RequestStart', { name: 'run', config: { signature: 'run', input: { params: [{ name: 'n', type: 'Number' }], map: { 'out.n': 'param.n' } } }, connect: [{ id: 'f50', to: 'S1' }] }),
    {
      ...el('S1', 'EmbeddedProcess', {
        name: 'folded',
        elements: [
          el('S1-g0', 'EmbeddedStart', { parentConnector: 'f50', connect: [{ id: 'S1-f0', to: 'S1-f1' }] }),
          el('S1-f1', 'ErrorEnd', { config: { throws: { error: 'inner:fail' } } }),
          el('S1-g1', 'EmbeddedEnd', { parentConnector: 'f51' })
        ],
        connect: [{ id: 'f51', to: 'f4' }]
      }),
      boundaries: [boundary('f9', log('"embedded error caught: " + error.getErrorCode()'), 'f3', 'inner')]
    },
    script('f3', log('"error path"'), 'f1'),
    script('f4', log('"normal path"'), 'f1'),
    end()
  ]);
  assert.deepEqual(result.lines, ['embedded error caught: inner:fail', 'error path']);
});
