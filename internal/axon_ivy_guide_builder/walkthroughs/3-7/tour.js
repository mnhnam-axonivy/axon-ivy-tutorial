/**
 * Walkthrough 3.7 — the chapters. Each starts from the process as the guide ships it; the
 * notes are in text.js. See runtime/ui/tour.js for the director `d`.
 */
const SPLIT = 'f2';
const JOIN = 'f5';
const PARAMS = { name: 'Anna Meier' };
const field = (id, key) => 'field:' + id + '.' + key;

/** 1 — a Split starts all its exits; each path gets its own copy of the data. */
async function split(d) {
  await d.note('splitShape', { target: 'el:' + SPLIT });
  await d.open(SPLIT, 'output');
  await d.note('outs', { target: field(SPLIT, 'mapping') });
  await d.note('outIn', { target: field(SPLIT, 'map:out2') });
  await d.close();
}

/** 2 — two tokens take turns; the first to reach the Join waits for the other. */
async function turns(d) {
  let arrived = 0;
  await d.run({
    params: PARAMS,
    on: {
      'enter:f4': () => d.note('secondFirst', { target: 'el:f4' }),
      ['enter:' + JOIN]: async () => { await d.note(++arrived === 1 ? 'joinWaits' : 'joinGoes', { target: 'el:' + JOIN }); },
      'after:f7': async () => {
        await d.panel('log');
        await d.note('turnsLog', { target: 'log:last', extra: 600 });
      }
    }
  });
  await d.panel(null);
}

/** 3 — the Join's Output: in1 and in2, one per incoming path; out ← in1 and the references of in2. */
async function join(d) {
  await d.open(JOIN, 'output');
  await d.note('ins', { target: field(JOIN, 'mapping') });
  await d.note('joinOut', { target: field(JOIN, 'map:out') });
  await d.note('joinRef', { target: field(JOIN, 'map:out.references') });
  await d.close();
  await d.run({
    params: PARAMS,
    fast: true,
    on: {
      'after:f6': async () => {
        await d.panel('data');
        await d.note('decided', { target: 'data:decision' });
      }
    }
  });
  await d.panel(null);
}

/** 4.1 — out2 without a row: the second path starts with empty data. */
async function secondEmpty(d) {
  await d.open(SPLIT, 'output');
  d.focus(field(SPLIT, 'map:out2'));
  await d.wait(300);
  await d.edit(SPLIT + '.map:out2', '');
  await d.note('out2Gone', { target: field(SPLIT, 'map:out2') });
  await d.close();
  await d.run({
    params: PARAMS,
    fast: true,
    on: {
      'after:f4': async () => {
        await d.panel('log');
        await d.note('noName', { target: 'log:last' });
      }
    }
  });
  await d.panel(null);
  await d.note('out2Fix');
}

/** 4.2 — the Join without the row for in2: what the second path found is lost. */
async function joinLoses(d) {
  await d.open(JOIN, 'output');
  d.focus(field(JOIN, 'map:out.references'));
  await d.wait(300);
  await d.edit(JOIN + '.map:out.references', '');
  await d.note('refGone', { target: field(JOIN, 'map:out.references') });
  await d.close();
  await d.run({
    params: PARAMS,
    fast: true,
    on: {
      'after:f6': async () => {
        await d.panel('data');
        await d.note('rejected', { target: 'data:decision' });
      }
    }
  });
  await d.panel(null);
  await d.note('refFix');
}

/** 4.3 — in in a Join: there are only in1, in2, … */
async function inJoin(d) {
  d.app.state.sections[JOIN + ':code'] = true;
  await d.open(JOIN, 'output');
  d.focus(field(JOIN, 'code'));
  await d.wait(300);
  await d.edit(JOIN + '.code', 'ivy.log.info(in.name);');
  await d.note('inMarked', { target: field(JOIN, 'code'), extra: 1000 });
  await d.close();
  await d.note('inFix');
}

export const tour = {
  chapters: [
    { id: 'split', play: split },
    { id: 'turns', play: turns },
    { id: 'join', play: join },
    { id: 'mistakes', label: 'mistake', parts: [{ id: 'secondEmpty', play: secondEmpty }, { id: 'joinLoses', play: joinLoses }, { id: 'inJoin', play: inJoin }] }
  ]
};
