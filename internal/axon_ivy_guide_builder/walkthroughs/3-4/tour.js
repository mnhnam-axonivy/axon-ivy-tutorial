/**
 * Walkthrough 3.4 — the chapters. Each starts from the process as the guide ships it; the
 * notes are in text.js. See runtime/ui/tour.js for the director `d`.
 */
const ALT = 'f2';
const SMALL = { employee: 'Anna', amount: '120', urgent: 'false' };
const LARGE = { employee: 'Anna', amount: '800', urgent: 'false' };
const field = key => 'field:' + ALT + '.' + key;

/** 1 — the Condition tab: one row per exit, a condition each; the empty one always holds. */
async function conditions(d) {
  await d.note('alternative', { target: 'el:' + ALT });
  await d.open(ALT, 'condition');
  await d.note('conditionTab', { target: field('conditions') });
  await d.note('rowYes', { target: field('condition:f21') });
  await d.note('rowNo', { target: field('condition:f22') });
  await d.close();
}

/** 2 — a small expense: the first condition is false, the empty one takes it. */
async function small(d) {
  await d.run({
    params: SMALL,
    on: {
      ['enter:' + ALT]: () => d.note('reached', { target: 'el:' + ALT }),
      'enter:f4': () => d.note('smallPath', { target: 'el:f4' }),
      'after:f6': async () => {
        await d.panel('data');
        await d.note('paid', { target: 'data:status' });
      }
    }
  });
  await d.panel(null);
}

/** 3 — a large expense: the first condition is true and decides. */
async function large(d) {
  await d.run({
    params: LARGE,
    fast: true,
    on: {
      'enter:f3': () => d.note('largePath', { target: 'el:f3' }),
      'after:f5': async () => {
        await d.panel('data');
        await d.note('waiting', { target: 'data:status' });
      }
    }
  });
  await d.panel(null);
}

/** 4.1 — text as a condition: the Designer marks it, the engine never takes it. */
async function textCondition(d) {
  await d.open(ALT, 'condition');
  d.focus(field('condition:f21'));
  await d.wait(300);
  await d.edit(ALT + '.condition:f21', 'in.employee');
  await d.note('textMarked', { target: field('conditions'), extra: 1200 });
  await d.close();
  await d.run({
    params: LARGE,
    fast: true,
    on: { 'enter:f4': () => d.note('textRan', { target: 'el:f4' }) }
  });
  await d.note('textFix');
}

/** 4.2 — = instead of ==: it assigns, and is always true. */
async function assignment(d) {
  await d.open(ALT, 'condition');
  d.focus(field('condition:f21'));
  await d.wait(300);
  await d.edit(ALT + '.condition:f21', 'in.urgent = true');
  await d.note('assignEdit', { target: field('condition:f21') });
  await d.close();
  await d.run({
    params: SMALL,
    fast: true,
    on: {
      'after:f5': async () => {
        await d.panel('data');
        await d.note('assignRan', { target: 'data:urgent', extra: 800 });
      }
    }
  });
  await d.panel(null);
  await d.note('assignFix');
}

export const tour = {
  chapters: [
    { id: 'conditions', play: conditions },
    { id: 'small', play: small },
    { id: 'large', play: large },
    { id: 'mistakes', label: 'mistake', parts: [{ id: 'textCondition', play: textCondition }, { id: 'assignment', play: assignment }] }
  ]
};
