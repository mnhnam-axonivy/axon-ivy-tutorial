/**
 * Walkthrough 2.3 — the chapters. Each starts from the process as the guide ships it; the
 * notes are in text.js (tour.<key>.title / .text). See runtime/ui/tour.js for the director `d`.
 */
const START = 'f0';
const LOG = 'f3';
const END = 'f1';
const PARAMS = { room: 'Matterhorn', people: '4' };
const field = key => 'field:' + START + '.' + key;

/** 1 — name and parameters: what a caller has to know. */
async function signature(d) {
  await d.open(START, 'start');
  await d.note('signatureName', { target: field('signature') });
  await d.note('params', { target: field('params') });
  await d.note('signatureText', { target: field('signatureText') });
  await d.close();
}

/** 2 — the values travel in the start link and arrive as param. */
async function request(d) {
  await d.open(START, 'request');
  await d.note('link', { target: field('link') });
  await d.close();
  await d.run({
    params: PARAMS,
    on: {
      ['mapped:' + START]: async () => {
        await d.note('requestSent', { target: 'request' });
        await d.panel('data');
        await d.note('paramArrived', { target: 'param:room' });
      }
    }
  });
  await d.panel(null);
}

/** 3 — the mapping copies each parameter into the process data. */
async function mapping(d) {
  await d.open(START, 'start');
  await d.note('mapping', { target: field('mapping') });
  await d.note('mappingRow', { target: field('map:out.room') });
  await d.close();
  await d.run({
    params: PARAMS,
    on: {
      ['after:' + START]: async () => {
        await d.panel('data');
        await d.note('dataFilled', { target: 'data:room' });
      },
      ['after:' + LOG]: async () => {
        await d.panel('log');
        await d.note('logLine', { target: 'log:last' });
      }
    }
  });
  await d.panel(null);
}

/** 5.1 — the parameter arrives, but nothing copies it into the process data. */
async function notMapped(d) {
  await d.open(START, 'start');
  d.focus(field('map:out.people'));
  await d.wait(400);
  await d.edit(START + '.map:out.people', '');
  await d.note('unmapEdit', { target: field('map:out.people'), wait: 1800 });
  await d.close();
  await d.run({
    params: PARAMS,
    fast: true,
    on: {
      ['after:' + START]: async () => {
        await d.panel('data');
        await d.note('unmapArrived', { target: 'param:people' });
        await d.note('unmapLost', { target: 'data:people' });
      }
    }
  });
  await d.panel(null);
  await d.note('unmapFix');
}

/** 4 — the Process End. */
async function processEnd(d) {
  await d.run({
    params: PARAMS,
    fast: true,
    on: {
      ['after:' + END]: () => d.note('endReached', { target: 'el:' + END })
    }
  });
  await d.open(END, 'general');
  await d.note('endTabs', { target: 'field:' + END + '.name' });
  await d.close();
}

/** 5.2 — in is the data that comes into an element; nothing comes into a Start. */
async function inStart(d) {
  await d.open(START, 'start');
  d.focus(field('map:out.room'));
  await d.wait(300);
  await d.edit(START + '.map:out.room', 'in.room');
  await d.note('inMarked', { target: field('mapping'), extra: 1200 });
  await d.close();
  await d.run({ params: PARAMS, fast: true });
  await d.panel('log');
  await d.note('inStopped', { target: 'log:last' });
  await d.panel(null);
  await d.note('inFix');
}

export const tour = {
  chapters: [
    { id: 'signature', play: signature },
    { id: 'request', play: request },
    { id: 'mapping', play: mapping },
    { id: 'end', play: processEnd },
    { id: 'mistakes', label: 'mistake', parts: [{ id: 'notMapped', play: notMapped }, { id: 'inStart', play: inStart }] }
  ]
};
