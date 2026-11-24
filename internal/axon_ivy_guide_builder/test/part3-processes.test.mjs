/**
 * The processes of walkthroughs 3.6 to 3.11, as the guide ships them, against the engine.
 *
 * Each run below was made on 2026-11-16 on the Designer's engine 14.0.1 with the same request;
 * `engine` is what its Runtime Log showed (USER lines, and the REQUEST line of a failed
 * request). The simulation has to write the same lines. 3.4 and 3.5 write no log lines; their
 * conditions are pinned in engine-part3.test.mjs.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadProcess } from '../runtime/model/process.js';
import { ProcessRunner } from '../runtime/model/runner.js';

const project = new URL('../../../tutorial/', import.meta.url);
const json = path => JSON.parse(readFileSync(new URL(path, project), 'utf8'));
const model = (name, data) => loadProcess(json('process/tutorial/part3/' + name + '.p.json'), json('dataclass/tutorial/part3/' + data + '.d.json'), {
  project: 'tutorial', file: name + '.p.json', path: 'tutorial/process/tutorial/part3/' + name + '.p.json'
});

async function lines(name, data, subs, params, start = null) {
  const main = model(name, data);
  const result = await new ProcessRunner({ model: main, models: [main, ...subs.map(([n, d]) => model(n, d))] }).run({ params, start });
  return {
    status: result.status,
    lines: result.logs.filter(e => e.category === 'USER').map(e => '[' + e.level.toUpperCase() + '] ' + e.message),
    request: result.logs.filter(e => e.category === 'REQUEST').map(e => e.detail)
  };
}

const cases = [
  ['3.6 paid after the second reminder', 'MergeAndLoop', 'MergeAndLoopData', [], { invoice: 'INV-17', paidAfter: '2' },
    ['[INFO] Reminder 1 for invoice INV-17', '[INFO] Reminder 2 for invoice INV-17', '[INFO] Invoice INV-17 archived: paid']],
  ['3.6 never paid', 'MergeAndLoop', 'MergeAndLoopData', [], { invoice: 'INV-18', paidAfter: '0' },
    ['[INFO] Reminder 1 for invoice INV-18', '[INFO] Reminder 2 for invoice INV-18', '[INFO] Reminder 3 for invoice INV-18', '[INFO] Invoice INV-18 archived: collection']],
  ['3.7 the second path first, one decision after both', 'ParallelChecks', 'ParallelChecksData', [], { name: 'Anna Meier' },
    ['[INFO] References of Anna Meier: good', '[INFO] Credit of Anna Meier: ok', '[INFO] Anna Meier: accepted']],
  ['3.8 abroad', 'OrderWithShipping', 'OrderWithShippingData', [['ShippingCost', 'ShippingCostData']], { item: 'Lamp', weight: '4', country: 'DE' },
    ['[INFO] Lamp: shipping 20 CHF']],
  ['3.8 heavy, at home', 'OrderWithShipping', 'OrderWithShippingData', [['ShippingCost', 'ShippingCostData']], { item: 'Desk', weight: '15', country: 'CH' },
    ['[INFO] Desk: shipping 15 CHF']],
  ['3.9 the boxes run their insides', 'FoldedSteps', 'FoldedStepsData', [], { item: 'chairs', quantity: '6' },
    ['[INFO] Stock for 6 chairs: true', '[INFO] Reserved 6 chairs']],
  ['3.10 booked', 'BookRoom', 'BookRoomData', [['ReserveRoom', 'ReserveRoomData']], { room: 'Matterhorn', people: '4' },
    ['[INFO] Room Matterhorn booked: R-Matterhorn-4']],
  ['3.10 too many people: caught on the Call Sub', 'BookRoom', 'BookRoomData', [['ReserveRoom', 'ReserveRoomData']], { room: 'Matterhorn', people: '12' },
    ['[WARN] No room for 12 people: booking:full']],
  ['3.11 an empty file: caught by the Error Start', 'ImportOrders', 'ImportOrdersData', [], { lines: '0' },
    ['[WARN] Import stopped: import:empty']],
  ['3.11 a file with lines', 'ImportOrders', 'ImportOrdersData', [], { lines: '120' },
    ['[INFO] Read 120 lines', '[INFO] Imported 120 orders']]
];

for (const [title, name, data, subs, params, engine] of cases) {
  test('engine 14.0.1, ' + title, async () => {
    const result = await lines(name, data, subs, params);
    assert.equal(result.status, 'completed');
    assert.deepEqual(result.lines, engine);
  });
}

test('engine 14.0.1, 3.11 an Error End on the level of the Error Start: HTTP 500, BpmError import:cancelled', async () => {
  const result = await lines('ImportOrders', 'ImportOrdersData', [], {}, 'f20');
  assert.equal(result.status, 'failed');
  assert.deepEqual(result.lines, []);
  assert.deepEqual(result.request, ['import:cancelled — Caused by: BpmError import:cancelled']);
});
