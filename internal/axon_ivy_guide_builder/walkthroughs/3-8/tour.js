/**
 * Walkthrough 3.8 — the chapters. Each starts from the process as the guide ships it; the
 * notes are in text.js. See runtime/ui/tour.js for the director `d`.
 */
const CALL = 'f2';
const SUB = 'tutorial/part3/ShippingCost';
const PARAMS = { item: 'Lamp', weight: '4', country: 'DE' };
const field = (id, key) => 'field:' + id + '.' + key;

/** 1 — the callable sub process: its start has parameters, its Result tab what it returns. */
async function sub(d) {
  await d.tab('process:' + SUB);
  await d.note('subProcess', { target: 'el:f0' });
  await d.open('f0', 'start');
  await d.note('subParams', { target: field('f0', 'params') });
  await d.note('subMapping', { target: field('f0', 'mapping') });
  await d.open('f0', 'result');
  await d.note('resultParams', { target: field('f0', 'resultParams') });
  await d.note('resultMap', { target: field('f0', 'map:result.cost') });
  await d.close();
  await d.tab('process');
}

/** 2 — the Call Sub: which start it calls, what it passes, what it takes back. */
async function call(d) {
  await d.open(CALL, 'process');
  await d.note('processStart', { target: field(CALL, 'processStart') });
  await d.note('paramMap', { target: field(CALL, 'map:param.weight') });
  await d.open(CALL, 'output');
  await d.note('outIn', { target: field(CALL, 'map:out') });
  await d.note('resultRow', { target: field(CALL, 'map:out.shipping') });
  await d.close();
}

/** 3 — a run: into the sub process, with data of its own, and back with the result. */
async function jump(d) {
  await d.run({
    params: PARAMS,
    on: {
      ['descend:' + CALL]: () => d.note('jumps', { target: 'el:' + CALL }),
      [`enter:${SUB}/f3`]: async () => {
        await d.panel('data');
        await d.note('ownData', { target: 'data:weight', extra: 600 });
      },
      [`enter:${SUB}/f1`]: () => d.note('subEnd', { target: 'el:f1' }),
      ['ascend:' + CALL]: () => d.note('back', { target: 'el:' + CALL }),
      'after:f3': async () => {
        await d.panel('data');
        await d.note('shipping', { target: 'data:shipping' });
      }
    }
  });
  await d.panel(null);
}

/** 4.1 — a parameter that is not passed arrives as 0. */
async function paramMissing(d) {
  await d.open(CALL, 'process');
  d.focus(field(CALL, 'map:param.weight'));
  await d.wait(300);
  await d.edit(CALL + '.map:param.weight', '');
  await d.note('paramGone', { target: field(CALL, 'map:param.weight') });
  await d.close();
  await d.run({
    params: { ...PARAMS, weight: '15' },
    fast: true,
    on: {
      'after:f3': async () => {
        await d.panel('data');
        await d.note('paramRan', { target: 'data:shipping' });
      }
    }
  });
  await d.panel(null);
  await d.note('paramFix');
}

/** 4.2 — a result that the Result tab does not set comes back as 0. */
async function resultMissing(d) {
  await d.tab('process:' + SUB);
  await d.open('f0', 'result');
  d.focus(field('f0', 'map:result.cost'));
  await d.wait(300);
  await d.edit('f0.map:result.cost', '');
  await d.note('resultGone', { target: field('f0', 'map:result.cost') });
  await d.close();
  await d.tab('process');
  await d.run({
    params: PARAMS,
    fast: true,
    on: {
      'after:f3': async () => {
        await d.panel('data');
        await d.note('resultRan', { target: 'data:shipping' });
      }
    }
  });
  await d.panel(null);
  await d.note('resultFix');
}

/** 4.3 — the Output without out ← in: the caller's own data is gone after the call. */
async function outRowGone(d) {
  await d.open(CALL, 'output');
  d.focus(field(CALL, 'map:out'));
  await d.wait(300);
  await d.edit(CALL + '.map:out', '');
  await d.note('outGone', { target: field(CALL, 'map:out') });
  await d.close();
  await d.run({
    params: PARAMS,
    fast: true,
    on: {
      'after:f3': async () => {
        await d.panel('data');
        await d.note('outRan', { target: 'data:item' });
      }
    }
  });
  await d.panel(null);
  await d.note('outFix');
}

export const tour = {
  chapters: [
    { id: 'sub', play: sub },
    { id: 'call', play: call },
    { id: 'jump', play: jump },
    { id: 'mistakes', label: 'mistake', parts: [{ id: 'paramMissing', play: paramMissing }, { id: 'resultMissing', play: resultMissing }, { id: 'outRowGone', play: outRowGone }] }
  ]
};
