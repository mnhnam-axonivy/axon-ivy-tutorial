/**
 * Walkthrough 3.6 — the chapters. Each starts from the process as the guide ships it; the
 * notes are in text.js. See runtime/ui/tour.js for the director `d`.
 */
const PAID = { invoice: 'INV-17', paidAfter: '2' };
const NEVER = { invoice: 'INV-18', paidAfter: '0' };
const field = (id, key) => 'field:' + id + '.' + key;

/** 1 — a loop: the last exit of "Paid?" goes back to "Send a reminder". */
async function loop(d) {
  await d.note('loopShape', { target: 'el:f4' });
  await d.open('f4', 'condition');
  await d.note('paidRow', { target: field('f4', 'condition:f41') });
  await d.note('collectionRow', { target: field('f4', 'condition:f42') });
  await d.note('againRow', { target: field('f4', 'condition:f43') });
  await d.close();
}

/** 2 — paid after the second reminder: two rounds, then out of the loop. */
async function rounds(d) {
  let reminders = 0;
  await d.run({
    params: PAID,
    on: {
      'enter:f3': async () => { if (++reminders === 2) await d.note('again', { target: 'el:f3' }); },
      'enter:f5': () => d.note('paidNow', { target: 'el:f5' }),
      'after:f9': async () => {
        await d.panel('log');
        await d.note('roundsLog', { target: 'log:last' });
      }
    }
  });
  await d.panel(null);
}

/** 3 — never paid: the other way out; both ways meet at the Alternative before "Archive". */
async function together(d) {
  await d.run({
    params: NEVER,
    fast: true,
    on: {
      'enter:f6': () => d.note('collection', { target: 'el:f6' }),
      'enter:f7': () => d.note('merge', { target: 'el:f7' }),
      'enter:f8': () => d.note('archive', { target: 'el:f8' })
    }
  });
}

/** 4.1 — a loop that never ends: nothing changes what the condition reads. */
async function endless(d) {
  await d.open('f3', 'output');
  d.focus(field('f3', 'code@in.reminders = in.reminders + 1;'));
  await d.wait(300);
  await d.edit('f3.code', code => code.replace('in.reminders = in.reminders + 1;\n', ''));
  await d.note('counterGone', { target: field('f3', 'code') });
  await d.close();
  await d.run({ params: PAID, fast: true, stepLimit: 40 });
  await d.note('endlessRan', { target: 'el:f3' });
  await d.note('endlessFix');
}

/** 4.2 — a Join where an Alternative belongs: it waits for a path that never comes. */
async function joinMerge(d) {
  const el = d.app.model.elements.find(e => e.id === 'f7');
  d.app.changeElement(el, e => { e.type = 'Join'; e.kind = 'join'; e.typeLabel = 'element.Join'; }, 'type');
  await d.note('joinPlaced', { target: 'el:f7', extra: 400 });
  await d.run({ params: PAID, fast: true });
  await d.note('joinRan', { target: 'el:f7' });
  await d.note('joinFix');
}

export const tour = {
  chapters: [
    { id: 'loop', play: loop },
    { id: 'rounds', play: rounds },
    { id: 'together', play: together },
    { id: 'mistakes', label: 'mistake', parts: [{ id: 'endless', play: endless }, { id: 'joinMerge', play: joinMerge }] }
  ]
};
