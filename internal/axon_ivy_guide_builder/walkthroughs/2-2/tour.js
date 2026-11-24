/**
 * Walkthrough 2.2 — the chapters. Each starts from the process as the guide ships it; the
 * notes are in text.js (tour.<key>.title / .text). See runtime/ui/tour.js for the director `d`.
 */
const START = 'f0';
const CHECK = 'f3';
const LOG = 'f5';
const PARAMS = { employeeId: '00731', days: '5' };
const field = (id, key) => 'field:' + id + '.' + key;

/** 1 — attributes, their types and comments. */
async function dataClass(d) {
  await d.tab('dataclass');
  await d.note('attributes', { target: 'dataclass' });
  await d.note('types', { target: 'dataclass:days' });
  await d.note('comment', { target: 'dataclass:employeeId' });
  await d.tab('process');
}

/** 2 — the process names its data class on the Process Data tab. */
async function processData(d) {
  await d.open('process', 'processData');
  await d.note('oneClass', { target: field('process', 'dataClass') });
  await d.note('shared', { target: field('process', 'dataClass') });
  await d.close();
}

/** 3 — every element gets the data as in, and passes it on. */
async function asIn(d) {
  await d.run({
    params: PARAMS,
    on: {
      ['after:' + START]: async () => {
        await d.panel('data');
        await d.note('afterStart', { target: 'data:days' });
      },
      ['mapped:' + CHECK]: () => d.note('approvedSet', { target: 'data:approved' }),
      ['enter:' + LOG]: () => d.note('sameData', { target: 'data:employeeId' })
    }
  });
  await d.panel(null);
  await d.open(LOG, 'output');
  await d.note('inCode', { target: field(LOG, 'code@in.approved') });
  await d.close();
}

/** 4 — the values a new case starts with. */
async function startValues(d) {
  await d.tab('dataclass');
  await d.note('defaults', { target: 'dataclass' });
  await d.note('neverNull', { target: 'dataclass:employeeId' });
  await d.tab('process');
}

/** 5.1 — a personnel number as a Number loses its leading zeros. */
async function leadingZeros(d) {
  const { app } = d;
  await d.tab('dataclass');
  app.model.dataClass.fields.find(f => f.name === 'employeeId').type = 'Number';
  const start = app.model.elements.find(e => e.id === START);
  app.changeElement(start, e => { e.config.input.params.find(p => p.name === 'employeeId').type = 'Number'; }, 'params');
  app.dataClassView.render();
  await d.note('retyped', { target: 'dataclass:employeeId' });
  await d.run({
    params: PARAMS,
    fast: true,
    on: {
      ['after:' + START]: async () => {
        await d.panel('data');
        await d.note('zerosLost', { target: 'data:employeeId' });
      }
    }
  });
  await d.panel(null);
  await d.note('zerosFix');
}

/** 5.2 — a local variable is gone when the code has run. */
async function localVariable(d) {
  await d.open(CHECK, 'output');
  d.focus(field(CHECK, 'map:out.approved'));
  await d.wait(300);
  await d.edit(CHECK + '.map:out.approved', '');
  await d.edit(CHECK + '.code', 'Boolean approved = in.days <= 10;');
  await d.note('localSet', { target: field(CHECK, 'code') });
  await d.close();
  await d.run({
    params: PARAMS,
    fast: true,
    on: {
      ['after:' + LOG]: async () => {
        await d.panel('log');
        await d.note('localLost', { target: 'log:last' });
      }
    }
  });
  await d.panel(null);
  await d.note('localFix');
}

export const tour = {
  chapters: [
    { id: 'dataClass', play: dataClass },
    { id: 'processData', play: processData },
    { id: 'asIn', play: asIn },
    { id: 'startValues', play: startValues },
    { id: 'mistakes', label: 'mistake', parts: [{ id: 'leadingZeros', play: leadingZeros }, { id: 'localVariable', play: localVariable }] }
  ]
};
