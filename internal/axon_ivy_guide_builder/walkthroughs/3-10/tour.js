/**
 * Walkthrough 3.10 — the chapters. Each starts from the process as the guide ships it; the
 * notes are in text.js. See runtime/ui/tour.js for the director `d`.
 */
const BOUNDARY = 'f9';
const SUB = 'tutorial/part3/ReserveRoom';
const SMALL = { room: 'Matterhorn', people: '4' };
const LARGE = { room: 'Matterhorn', people: '12' };
const field = (id, key) => 'field:' + id + '.' + key;

/** 1 — the sub process throws: an Error End with its code. */
async function thrown(d) {
  await d.tab('process:' + SUB);
  await d.note('roomCheck', { target: 'el:f2' });
  await d.note('errorEnd', { target: 'el:f4' });
  await d.open('f4', 'error');
  await d.note('throwCode', { target: field('f4', 'errorThrow') });
  await d.close();
  await d.tab('process');
}

/** 2 — the caller catches: an Error Boundary Event on the Call Sub, with `error` in its Output. */
async function caught(d) {
  await d.note('boundary', { target: 'el:' + BOUNDARY });
  await d.open(BOUNDARY, 'error');
  await d.note('catchCode', { target: field(BOUNDARY, 'errorCode') });
  await d.open(BOUNDARY, 'output');
  await d.note('errorVar', { target: field(BOUNDARY, 'map:out.message') });
  await d.close();
}

/** 3 — 4 people: booked; 12 people: the error goes up to the caller, and the boundary takes it. */
async function runs(d) {
  await d.run({
    params: SMALL,
    fast: true,
    on: {
      'after:f1': async () => {
        await d.panel('data');
        await d.note('booked', { target: 'data:message' });
      }
    }
  });
  await d.panel(null);
  await d.run({
    params: LARGE,
    on: {
      [`enter:${SUB}/f4`]: () => d.note('throws', { target: 'el:f4' }),
      ['enter:' + BOUNDARY]: () => d.note('caughtHere', { target: 'el:' + BOUNDARY }),
      'after:f5': async () => {
        await d.panel('data');
        await d.note('offer', { target: 'data:message' });
      }
    }
  });
  await d.panel(null);
}

/** 4.1 — a code that does not match: nobody catches the error, the request fails. */
async function noMatch(d) {
  await d.open(BOUNDARY, 'error');
  d.focus(field(BOUNDARY, 'errorCode'));
  await d.wait(300);
  await d.edit(BOUNDARY + '.errorCode', 'payment');
  await d.note('paymentEdit', { target: field(BOUNDARY, 'errorCode') });
  await d.close();
  await d.run({ params: LARGE, fast: true });
  await d.panel('log');
  await d.note('uncaught', { target: 'log:last', extra: 800 });
  await d.panel(null);
  await d.note('noMatchFix');
}

/** 4.2 — an empty code catches every error, also a bug. */
async function catchAll(d) {
  await d.open(BOUNDARY, 'error');
  d.focus(field(BOUNDARY, 'errorCode'));
  await d.wait(300);
  await d.edit(BOUNDARY + '.errorCode', '');
  await d.note('emptyEdit', { target: field(BOUNDARY, 'errorCode') });
  await d.close();
  await d.tab('process:' + SUB);
  await d.open('f3', 'output');
  d.focus(field('f3', 'code'));
  await d.wait(300);
  await d.edit('f3.code', code => code.replace('in.room + "-"', 'in.room.substring(0, 12) + "-"'));
  await d.note('bugEdit', { target: field('f3', 'code') });
  await d.close();
  await d.tab('process');
  await d.run({
    params: SMALL,
    fast: true,
    on: {
      'after:f5': async () => {
        await d.panel('data');
        await d.note('bugCaught', { target: 'data:message', extra: 800 });
      }
    }
  });
  await d.panel(null);
  await d.note('catchAllFix');
}

export const tour = {
  chapters: [
    { id: 'thrown', play: thrown },
    { id: 'caught', play: caught },
    { id: 'runs', play: runs },
    { id: 'mistakes', label: 'mistake', parts: [{ id: 'noMatch', play: noMatch }, { id: 'catchAll', play: catchAll }] }
  ]
};
