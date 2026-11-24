/**
 * Walkthrough 3.9 — the chapters. Each starts from the process as the guide ships it; the
 * notes are in text.js. See runtime/ui/tour.js for the director `d`.
 */
const PARAMS = { item: 'chairs', quantity: '6' };

/** 1 — a box with a process inside: jump in, and back out. */
async function box(d) {
  await d.note('embedded', { target: 'el:S1' });
  await d.level('S1');
  await d.note('inside', { target: 'el:S1-f1' });
  await d.note('ends', { target: 'el:S1-g1' });
  await d.level(null);
}

/** 2 — the token goes in and out; inside it works on the same data. */
async function run(d) {
  await d.run({
    params: PARAMS,
    on: {
      'descend:S1': () => d.note('goesIn', { target: 'el:S1' }),
      'enter:S1-f1': async () => {
        await d.panel('data');
        await d.note('sameData', { target: 'data:item' });
      },
      'ascend:S1': () => d.note('comesOut', { target: 'el:S1' }),
      'after:f1': async () => {
        await d.panel('data');
        await d.note('done', { target: 'data:total' });
      }
    }
  });
  await d.panel(null);
}

/** 3 — BPMN activities: the same box, with a meaning attached. */
async function bpmn(d) {
  await d.note('bpmnScript', { target: 'el:S2' });
  await d.note('bpmnManual', { target: 'el:S3' });
  await d.open('S3', 'general');
  await d.note('generalOnly', { target: 'field:S3.tabs' });
  await d.close();
  await d.note('eight');
}

/** 4.1 — an empty BPMN activity keeps the token. */
async function emptyBox(d) {
  // the steps inside "Pack the parcel" removed: what is left is the box from the palette
  d.app.model.elements.filter(e => e.parent === 'S3').forEach(e => { e.parent = '#removed'; });
  d.app.refresh('all');
  await d.level('S3');
  await d.note('emptyInside');
  await d.level(null);
  await d.run({ params: PARAMS, fast: true });
  await d.note('emptyRan', { target: 'el:S3' });
  await d.note('emptyFix');
}

export const tour = {
  chapters: [
    { id: 'box', play: box },
    { id: 'run', play: run },
    { id: 'bpmn', play: bpmn },
    { id: 'mistakes', label: 'mistake', parts: [{ id: 'emptyBox', play: emptyBox }] }
  ]
};
