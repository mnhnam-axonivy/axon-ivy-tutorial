/**
 * Walkthrough 3.11 — the chapters. Each starts from the process as the guide ships it; the
 * notes are in text.js. See runtime/ui/tour.js for the director `d`.
 */
const READ = 'f2';
const START = 'f7';
const EMPTY = { lines: '0' };
const field = (id, key) => 'field:' + id + '.' + key;

/** 1 — an Error Start: a handler for the whole level, with its code and its Output. */
async function handler(d) {
  await d.note('errorStart', { target: 'el:' + START });
  await d.open(START, 'error');
  await d.note('startCode', { target: field(START, 'errorCode') });
  await d.open(START, 'output');
  await d.note('startOutput', { target: field(START, 'map:out.problem') });
  await d.close();
}

/** 2 — a script throws a BpmError; the Error Start of the process takes it. */
async function throwScript(d) {
  await d.open(READ, 'output');
  await d.note('bpmCode', { target: field(READ, 'code@BpmError.create') });
  await d.note('importLine', { target: field(READ, 'code@import') });
  await d.close();
  await d.run({
    params: EMPTY,
    on: {
      ['enter:' + START]: () => d.note('caughtStart', { target: 'el:' + START }),
      'after:f9': async () => {
        await d.panel('log');
        await d.note('reported', { target: 'log:last' });
      }
    }
  });
  await d.panel(null);
}

/** 3 — where a handler is searched; an Error End is not caught on its own level. */
async function search(d) {
  await d.note('order');
  await d.note('cancelStart', { target: 'el:f21' });
  await d.run({ start: 'f20', params: {}, fast: true });
  await d.panel('log');
  await d.note('cancelFails', { target: 'log:last', extra: 800 });
  await d.panel(null);
  await d.note('cancelWhy');
}

/** 4.1 — BpmError without its import. */
async function noImport(d) {
  await d.open(READ, 'output');
  d.focus(field(READ, 'code@import'));
  await d.wait(300);
  await d.edit(READ + '.code', code => code.replace('import ch.ivyteam.ivy.bpm.error.BpmError;\n\n', ''));
  await d.note('importGone', { target: field(READ, 'code'), extra: 1000 });
  await d.close();
  await d.run({ params: EMPTY, fast: true });
  await d.panel('log');
  await d.note('importRan', { target: 'log:last', extra: 800 });
  await d.panel(null);
  await d.note('importFix');
}

/** 4.2 — an Error Code with one letter too many: it matches nothing. */
async function wrongCode(d) {
  await d.open(START, 'error');
  d.focus(field(START, 'errorCode'));
  await d.wait(300);
  await d.edit(START + '.errorCode', 'imports');
  await d.note('codeEdit', { target: field(START, 'errorCode') });
  await d.close();
  await d.run({ params: EMPTY, fast: true });
  await d.panel('log');
  await d.note('codeRan', { target: 'log:last', extra: 800 });
  await d.panel(null);
  await d.note('codeFix');
}

export const tour = {
  chapters: [
    { id: 'handler', play: handler },
    { id: 'throwScript', play: throwScript },
    { id: 'search', play: search },
    { id: 'mistakes', label: 'mistake', parts: [{ id: 'noImport', play: noImport }, { id: 'wrongCode', play: wrongCode }] }
  ]
};
