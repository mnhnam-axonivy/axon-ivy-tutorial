/**
 * Walkthrough 2.4 — the chapters. Each starts from the process as the guide ships it; the
 * notes are in text.js (tour.<key>.title / .text). See runtime/ui/tour.js for the director `d`.
 */
const START = 'f0';
const GREET = 'f3';
const END = 'f1';
const PARAMS = { name: 'Anna' };
const field = key => 'field:' + GREET + '.' + key;
const ROW = 'map:out.greeting';

/** 1 — one row of the mapping gives one attribute a new value. */
async function oneValue(d) {
  await d.open(GREET, 'output');
  await d.note('row', { target: field(ROW) });
  await d.note('expression', { target: field(ROW + '@in.name') });
  await d.close();
  await d.run({
    params: PARAMS,
    on: {
      ['mapped:' + GREET]: async () => {
        await d.panel('data');
        await d.note('greetingSet', { target: 'data:greeting' });
      }
    }
  });
  await d.panel(null);
}

/** 2 — ivy.log.info writes a line to the Runtime Log. */
async function log(d) {
  await d.open(GREET, 'output');
  await d.note('logCode', { target: field('code@ivy.log.info') });
  await d.close();
  await d.run({
    params: PARAMS,
    fast: true,
    on: {
      ['after:' + GREET]: async () => {
        await d.panel('log');
        await d.note('logLine', { target: 'log:last' });
        await d.note('logParts', { target: 'log:last' });
      }
    }
  });
  await d.panel(null);
}

/** 3 — the data before, during and after the run. */
async function eachStep(d) {
  await d.run({
    params: PARAMS,
    on: {
      ['after:' + START]: async () => {
        await d.panel('data');
        await d.note('stepStart', { target: 'data:greeting' });
      },
      ['enter:' + GREET]: () => d.note('stepEnter', { target: 'el:' + GREET }),
      ['mapped:' + GREET]: () => d.note('stepMapped', { target: 'data:greeting' }),
      ['after:' + END]: () => d.note('stepEnd', { target: 'data:name' })
    }
  });
  await d.panel(null);
  await d.note('stepButton');
}

/** 4.1 — text joined without a space. */
async function noSpace(d) {
  await d.open(GREET, 'output');
  d.focus(field(ROW));
  await d.wait(300);
  await d.edit(GREET + '.' + ROW, '"Hello" + in.name');
  await d.note('noSpaceEdit', { target: field(ROW) });
  await d.close();
  await d.run({
    params: PARAMS,
    fast: true,
    on: {
      ['after:' + GREET]: async () => {
        await d.panel('log');
        await d.note('noSpaceLog', { target: 'log:last' });
      }
    }
  });
  await d.panel(null);
  await d.note('noSpaceFix');
}

/** 4.2 — the attribute inside the quotes is text, not the attribute. */
async function quotedAttribute(d) {
  await d.open(GREET, 'output');
  d.focus(field(ROW));
  await d.wait(300);
  await d.edit(GREET + '.' + ROW, '"Hello in.name"');
  await d.note('quotedEdit', { target: field(ROW) });
  await d.close();
  await d.run({
    params: PARAMS,
    fast: true,
    on: {
      ['after:' + GREET]: async () => {
        await d.panel('log');
        await d.note('quotedLog', { target: 'log:last' });
      }
    }
  });
  await d.panel(null);
  await d.note('quotedFix');
}

export const tour = {
  chapters: [
    { id: 'oneValue', play: oneValue },
    { id: 'log', play: log },
    { id: 'eachStep', play: eachStep },
    { id: 'mistakes', label: 'mistake', parts: [{ id: 'noSpace', play: noSpace }, { id: 'quotedAttribute', play: quotedAttribute }] }
  ]
};
