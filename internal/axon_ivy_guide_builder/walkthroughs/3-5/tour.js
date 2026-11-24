/**
 * Walkthrough 3.5 — the chapters. Each starts from the process as the guide ships it; the
 * notes are in text.js. See runtime/ui/tour.js for the director `d`.
 */
const ALT = 'f2';
const field = key => 'field:' + ALT + '.' + key;

/** 1 — three rows, tried from the top; the last one is empty. */
async function order(d) {
  await d.open(ALT, 'condition');
  await d.note('rows', { target: field('conditions') });
  await d.note('first', { target: field('condition:f21') });
  await d.note('second', { target: field('condition:f22') });
  await d.note('last', { target: field('condition:f23') });
  await d.close();
}

/** 2 — 35 kg: two conditions are true; the first one decides. */
async function heavy(d) {
  await d.run({
    params: { weight: '35' },
    on: {
      ['enter:' + ALT]: () => d.note('tried', { target: 'el:' + ALT }),
      'enter:f3': () => d.note('freight', { target: 'el:f3' })
    }
  });
}

/** 3 — 1 kg: no condition is true but the empty one. */
async function light(d) {
  await d.run({
    params: { weight: '1' },
    fast: true,
    on: {
      'enter:f5': () => d.note('letter', { target: 'el:f5' }),
      'after:f6': async () => {
        await d.panel('data');
        await d.note('carrier', { target: 'data:carrier' });
      }
    }
  });
  await d.panel(null);
}

/** 4.1 — the wider condition first: it takes what the narrower one should have. */
async function wrongOrder(d) {
  await d.open(ALT, 'condition');
  const el = d.app.selected();
  // the Parcel row dragged above the Freight row, as the Designer's table lets one move rows
  d.app.changeElement(el, e => { e.config.conditions = { f22: e.config.conditions.f22, f21: e.config.conditions.f21, f23: e.config.conditions.f23 }; }, 'conditions');
  d.app.inscription.render();
  await d.note('moved', { target: field('conditions'), extra: 600 });
  await d.close();
  await d.run({ params: { weight: '35' }, fast: true, on: { 'enter:f4': () => d.note('movedRan', { target: 'el:f4' }) } });
  await d.note('movedFix');
}

/** 4.2 — the last row gets a condition: a weight that fits none fails the request. */
async function noneTrue(d) {
  await d.open(ALT, 'condition');
  d.focus(field('condition:f23'));
  await d.wait(300);
  await d.edit(ALT + '.condition:f23', 'in.weight > 0');
  await d.note('lastEdit', { target: field('condition:f23') });
  await d.close();
  await d.run({ params: { weight: '' }, fast: true });
  await d.panel('log');
  await d.note('noneRan', { target: 'log:last', extra: 1000 });
  await d.panel(null);
  await d.note('noneFix');
}

/** 4.3 — out in a condition: an Alternative has only in. */
async function outCondition(d) {
  await d.open(ALT, 'condition');
  d.focus(field('condition:f21'));
  await d.wait(300);
  await d.edit(ALT + '.condition:f21', c => c.replace('in.', 'out.'));
  await d.note('outMarked', { target: field('conditions'), extra: 1000 });
  await d.close();
  await d.note('outFix');
}

export const tour = {
  chapters: [
    { id: 'order', play: order },
    { id: 'heavy', play: heavy },
    { id: 'light', play: light },
    { id: 'mistakes', label: 'mistake', parts: [{ id: 'wrongOrder', play: wrongOrder }, { id: 'noneTrue', play: noneTrue }, { id: 'outCondition', play: outCondition }] }
  ]
};
