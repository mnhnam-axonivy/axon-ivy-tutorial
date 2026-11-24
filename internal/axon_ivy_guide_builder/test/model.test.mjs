/**
 * The simulated behaviour of the elements of the pilot: Start with parameters, Script Step
 * (mapping, then code), Process End. Runs the real process files of the guide project.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadProcess, signatureText, startLink, elementById, restore } from '../runtime/model/process.js';
import { ProcessRunner, paramValue, queryString } from '../runtime/model/runner.js';
import { evalExpression, runScript, validateScript, validateMapping, defaultValue } from '../runtime/model/ivyscript.js';

const project = new URL('../../../tutorial/', import.meta.url);
const json = path => JSON.parse(readFileSync(new URL(path, project), 'utf8'));

function load(processPath, dataClassPath) {
  return loadProcess(json(processPath), json(dataClassPath), { project: 'tutorial' });
}

async function run(model, params, mutate) {
  if (mutate) mutate(model);
  const runner = new ProcessRunner({ model, now: () => new Date(2026, 10, 16, 9, 0, 0) });
  return runner.run({ params });
}

const startWithParameters = () => load('process/tutorial/part2/StartWithParameters.p.json', 'dataclass/tutorial/part2/StartWithParametersData.d.json');

test('2.3: the signature is the name with the parameter types in their order', () => {
  const model = startWithParameters();
  const start = elementById(model, 'f0');
  assert.equal(signatureText(start), 'bookRoom(String,Number)');
  assert.equal(startLink(start), 'bookRoom.ivp');
});

test('2.3: the parameters arrive as param and the mapping copies them into the process data', async () => {
  const result = await run(startWithParameters(), { room: 'Matterhorn', people: '4' });
  assert.equal(result.status, 'completed');
  assert.deepEqual(result.visited, ['f0', 'f3', 'f1']);
  assert.equal(result.request.link, 'bookRoom.ivp?room=Matterhorn&people=4');
  assert.deepEqual(result.request.param, { room: 'Matterhorn', people: 4 });
  assert.deepEqual(result.data, { room: 'Matterhorn', people: 4 });
  assert.equal(result.logs.length, 1);
  assert.equal(result.logs[0].level, 'info');
  assert.equal(result.logs[0].message, 'Room Matterhorn is booked');
});

test('2.3: a parameter that is not mapped keeps the default of its attribute', async () => {
  const result = await run(startWithParameters(), { room: 'Matterhorn', people: '4' }, model => {
    delete elementById(model, 'f0').config.input.map['out.people'];
  });
  assert.equal(result.request.param.people, 4);
  assert.equal(result.data.people, 0);
  assert.equal(result.status, 'completed');
});

test('request values: text in the link is turned into the parameter type and URL-encoded', () => {
  assert.equal(paramValue('Number', '12.5'), 12.5);
  assert.equal(paramValue('Number', 'abc'), null);
  assert.equal(paramValue('Boolean', 'true'), true);
  assert.equal(paramValue('String', 'Piz Bernina'), 'Piz Bernina');
  assert.equal(queryString([{ name: 'room' }, { name: 'people' }], { room: 'Piz Bernina', people: 4 }), 'room=Piz%20Bernina&people=4');
});

test('defaults of a new case: String "", Number 0, Boolean false, others null', () => {
  assert.equal(defaultValue('String'), '');
  assert.equal(defaultValue('Number'), 0);
  assert.equal(defaultValue('Boolean'), false);
  assert.equal(defaultValue('java.lang.Integer'), null);
});

const scriptMapping = () => load('process/tutorial/part3/ScriptMapping.p.json', 'dataclass/tutorial/part3/ScriptMappingData.d.json');

test('3.1: the mapping assigns expressions on in; attributes without a row stay as they came in', async () => {
  const result = await run(scriptMapping(), { customer: 'Muster AG', quantity: '3', unitPrice: '12.5' });
  assert.equal(result.status, 'completed');
  assert.equal(result.data.total, 37.5);
  assert.equal(result.data.status, 'calculated');
  assert.equal(result.data.customer, 'Muster AG');
  assert.deepEqual(result.mapped.find(m => m.elementId === 'f3').rows.map(r => r.target), ['out.total', 'out.status']);
});

test('3.1: text without quotes is read as a variable and stops the process at the Script Step', async () => {
  const result = await run(scriptMapping(), { customer: 'Muster AG', quantity: '3', unitPrice: '12.5' }, model => {
    elementById(model, 'f3').config.output.map['out.status'] = 'calculated';
  });
  assert.equal(result.status, 'failed');
  assert.equal(result.failedAt, 'f3');
  assert.equal(result.error.message, "Output 'out.status': Variable 'calculated' cannot be resolved");
  // the Runtime Log line as the engine writes it (probe of 2026-11-16)
  const line = result.logs[result.logs.length - 1];
  assert.equal(line.category, 'REQUEST');
  assert.equal(line.message, "Problem while processing request '…/19F4A2C1B0D3E531/order.ivp?customer=Muster%20AG&quantity=3&unitPrice=12.5'");
  assert.equal(line.detail, "ivy:error:script — Caused by: IvyScriptVariableNotFoundException: Variable 'calculated' cannot be resolved");
});

const scriptCode = () => load('process/tutorial/part3/ScriptCode.p.json', 'dataclass/tutorial/part3/ScriptCodeData.d.json');

test('3.2: local variables, conditions, a String method and the log', async () => {
  const light = await run(scriptCode(), { weight: '4', country: 'ch', express: 'false' });
  assert.equal(light.status, 'completed');
  assert.equal(light.data.cost, 8);
  assert.equal(light.data.country, 'CH');
  assert.equal(light.logs[0].message, 'Shipping to CH calculated');
  const heavy = await run(scriptCode(), { weight: '12', country: 'de', express: 'true' });
  assert.equal(heavy.data.cost, 30);
});

const mappingThenCode = () => load('process/tutorial/part3/MappingThenCode.p.json', 'dataclass/tutorial/part3/MappingThenCodeData.d.json');

test('3.3: the mapping runs first, then the code, so the code has the last word', async () => {
  const small = await run(mappingThenCode(), { customer: 'Muster AG', total: '400' });
  assert.deepEqual([small.data.discount, small.data.level], [5, 'standard']);
  const large = await run(mappingThenCode(), { customer: 'Muster AG', total: '1500' });
  assert.deepEqual([large.data.discount, large.data.level], [10, 'gold']);
});

test('3.3: a mapping cannot see a value the code sets', async () => {
  const result = await run(mappingThenCode(), { customer: 'Muster AG', total: '1500' }, model => {
    elementById(model, 'f3').config.output.map['out.message'] = '"Customer level: " + in.level';
  });
  assert.equal(result.data.level, 'gold');
  assert.equal(result.data.message, 'Customer level: standard');
});

test('3.3: a String attribute is never null, so == null is false', () => {
  const ctx = { data: { customer: '' }, fields: [{ name: 'customer', type: 'String' }] };
  assert.equal(evalExpression('in.customer == null', ctx), false);
  assert.equal(evalExpression('in.customer.isEmpty()', ctx), true);
});

test('IvyScript: Math and a local variable; unknown attributes are reported', () => {
  const data = { cost: 0 };
  const ctx = { data, fields: [{ name: 'cost', type: 'Number' }], dataClassName: 'tutorial.X' };
  runScript('Number a = 3;\nout.cost = Math.max(a, 7);', ctx);
  assert.equal(data.cost, 7);
  assert.equal(validateScript('out.price = 1;', ctx).message, 'Field price not found for class tutorial.X');
});

/*
 * The messages the Designer 14.0.1 shows in its Problems view, read from a probe process
 * (see PROGRESS.md, log of 2026-11-16). The simulation uses the same wording.
 */
test('Designer wording: unresolved variable, unknown field, wrong type', async () => {
  const fields = [{ name: 'status', type: 'String' }, { name: 'total', type: 'Number' }];
  const ctx = { data: { status: '', total: 0 }, fields, dataClassName: 'tutorial.part3.ScriptMappingData' };
  assert.equal(validateScript('out.status = calculated;', ctx).message, "Variable 'calculated' cannot be resolved");
  assert.equal(validateScript('out.total = in.price;', ctx).message, 'Field price not found for class tutorial.part3.ScriptMappingData');
  assert.throws(() => runScript('out.total = "12";', ctx), { message: 'Cannot cast object of type String to type Number' });
  assert.throws(() => runScript('out.status = 5;', ctx), { message: 'Cannot cast object of type Integer to type String' });
});

test('Designer wording while editing: a mapping row whose type does not fit', () => {
  const fields = [{ name: 'status', type: 'String' }, { name: 'total', type: 'Number' }, { name: 'quantity', type: 'Number' }];
  const ctx = { fields, dataClassName: 'tutorial.part3.ScriptMappingData' };
  assert.equal(validateMapping('out.total', '"37.5"', ctx).message, 'Cannot cast object of type String to type Number');
  assert.equal(validateMapping('out.status', '5', ctx).message, 'Cannot cast object of type Integer to type String');
  assert.equal(validateMapping('out.total', 'in.quantity * 2.5', ctx), null);
  assert.equal(validateMapping('out.status', '"n: " + in.quantity', ctx), null);
  assert.equal(validateMapping('out.status', 'in.status.toUpperCase()', ctx), null);
});

test('Designer rule: a Start has param and out, but no in', async () => {
  const model = startWithParameters();
  const start = elementById(model, 'f0');
  start.config.input.map['out.room'] = 'in.room';
  const result = await run(model, { room: 'Matterhorn', people: '4' });
  assert.equal(result.status, 'failed');
  assert.equal(result.error.message, "Start 'out.room': Variable 'in' cannot be resolved");
  const typo = startWithParameters();
  elementById(typo, 'f0').config.input.map['out.room'] = 'param.rooms';
  const failed = await run(typo, { room: 'Matterhorn' });
  assert.equal(failed.error.message, "Start 'out.room': Field rooms not found for class <java.lang.String room,java.lang.Number people>");
});

// ── part 2 ───────────────────────────────────────────────────────────────────

const part2 = name => load('process/tutorial/part2/' + name + '.p.json', 'dataclass/tutorial/part2/' + name + 'Data.d.json');

test('Designer rule: a Number before + and text has no method + for it; text first joins', () => {
  const fields = [{ name: 'cost', type: 'Number' }, { name: 'country', type: 'String' }];
  const ctx = { fields, dataClassName: 'tutorial.part3.ScriptCodeData' };
  assert.equal(validateScript('Number price = 8;\nout.cost = price + " CHF";', ctx).message, 'Method +(String) for class Number of classloader null not found');
  assert.equal(validateScript('ivy.log.info(in.cost + " CHF");', ctx).message, 'Method +(String) for class Number of classloader null not found');
  assert.equal(validateScript('Number price = 8;\nivy.log.info("Cost " + price + " CHF");', ctx), null);
  assert.equal(validateScript('out.cost = in.cost + 1;', ctx), null);
});

test('2.1: the process itself: its name is the file name, viewing is allowed for a business process', () => {
  const model = loadProcess(json('process/tutorial/part2/ProcessElements.p.json'), json('dataclass/tutorial/part2/ProcessElementsData.d.json'), { file: 'ProcessElements.p.json' });
  assert.equal(model.name, 'ProcessElements');
  assert.equal(model.kind, 'NORMAL');
  assert.equal(model.viewAllowed, true);
  assert.equal(model.dataClassName, 'tutorial.part2.ProcessElementsData');
  const dialogLogic = loadProcess({ id: 'X', kind: 'HTML_DIALOG', config: { data: 'a.B' }, elements: [] }, { simpleName: 'B', namespace: 'a', fields: [] });
  assert.equal(dialogLogic.viewAllowed, false);
});

test('2.1: free shipping from 100', async () => {
  assert.equal((await run(part2('ProcessElements'), { amount: '80' })).data.total, 89);
  assert.equal((await run(part2('ProcessElements'), { amount: '120' })).data.total, 120);
});

test('2.2: a personnel number typed as Number loses its leading zeros; reset brings the String back', async () => {
  assert.equal((await run(part2('DataClasses'), { employeeId: '00731', days: '5' })).data.employeeId, '00731');
  const model = part2('DataClasses');
  model.dataClass.fields.find(f => f.name === 'employeeId').type = 'Number';
  elementById(model, 'f0').config.input.params.find(p => p.name === 'employeeId').type = 'Number';
  const result = await run(model, { employeeId: '00731', days: '5' });
  assert.equal(result.data.employeeId, 731);
  restore(model, model.original);
  assert.equal(model.dataClass.fields.find(f => f.name === 'employeeId').type, 'String');
});

test('2.2: a local variable does not reach the next element', async () => {
  const result = await run(part2('DataClasses'), { employeeId: '00731', days: '5' }, model => {
    const check = elementById(model, 'f3');
    check.config.output = { code: 'Boolean approved = in.days <= 10;' };
  });
  assert.equal(result.data.approved, false);
  assert.equal(result.logs[0].message, 'Holidays of 00731 approved: false');
});

test('2.4: the greeting, and the two mistakes only the log shows', async () => {
  assert.equal((await run(part2('FirstScript'), { name: 'Anna' })).logs[0].message, 'Hello Anna');
  const noSpace = await run(part2('FirstScript'), { name: 'Anna' }, m => { elementById(m, 'f3').config.output.map['out.greeting'] = '"Hello" + in.name'; });
  assert.equal(noSpace.logs[0].message, 'HelloAnna');
  const quoted = await run(part2('FirstScript'), { name: 'Anna' }, m => { elementById(m, 'f3').config.output.map['out.greeting'] = '"Hello in.name"'; });
  assert.equal(quoted.logs[0].message, 'Hello in.name');
});

test('2.5: the Process End Page ends the run with its page', async () => {
  const result = await run(part2('StartList'), { day: '2026-12-01' });
  assert.equal(result.status, 'completed');
  assert.deepEqual(result.visited, ['f0', 'f3', 'f1']);
  assert.equal(result.logs[0].message, 'Space P12 reserved for 2026-12-01');
});

// ── the engine, where the documentation is silent (probes of 2026-11-16) ─────

test('engine 14.0.1: with the row out ← in, out is in: the rows run in order and see each other', async () => {
  const map = rows => run(part2('FirstScript'), { name: 'Anna' }, m => { m.dataClass.fields.push({ name: 'other', type: 'String' }); elementById(m, 'f3').config.output = { map: rows }; });
  const fromIn = await map({ out: 'in', 'out.greeting': '"m"', 'out.other': 'in.greeting' });
  assert.equal(fromIn.data.other, 'm');
  assert.equal(fromIn.data.name, 'Anna');
});

test('engine 14.0.1: without the row out ← in, out starts empty and in keeps the old values', async () => {
  const result = await run(part2('FirstScript'), { name: 'Anna' }, m => {
    m.dataClass.fields.push({ name: 'other', type: 'String' });
    elementById(m, 'f3').config.output = { map: { 'out.greeting': '"m"', 'out.other': 'in.greeting' }, code: 'ivy.log.info("in=" + in.name + " out=" + out.name);' };
  });
  assert.equal(result.data.name, '');
  assert.equal(result.data.other, '');
  assert.equal(result.logs[0].message, 'in=Anna out=');
});

test('engine 14.0.1: in the code (no mapping), in and out are the same data', async () => {
  const result = await run(part2('FirstScript'), { name: 'Anna' }, m => { elementById(m, 'f3').config.output = { code: 'out.greeting = "o"; ivy.log.info("in=" + in.greeting);' }; });
  assert.equal(result.logs[0].message, 'in=o');
});

test('engine 14.0.1: a parameter that is not a number is logged and arrives as nothing', async () => {
  const result = await run(load('process/tutorial/part2/StartWithParameters.p.json', 'dataclass/tutorial/part2/StartWithParametersData.d.json'), { room: 'Matterhorn', people: 'abc' });
  assert.equal(result.status, 'completed');
  assert.equal(result.logs[0].message, "ParameterMapToObjectFiller: Could not convert string 'abc' to a Number.");
  assert.equal(result.logs[0].category, 'PROCESS');
  assert.equal(result.data.people, 0);
});
