/**
 * Walkthrough 3.3 — the chapters. Each starts from the process as the guide ships it; the
 * notes are in text.js. See runtime/ui/tour.js for the director `d`.
 */
const SCRIPT = 'f3';
const LARGE = { customer: 'Muster AG', total: '1500' };
const SMALL = { customer: 'Muster AG', total: '400' };
const field = key => 'field:' + SCRIPT + '.' + key;

/** 1 — the order, seen in the data: after the mapping, and after the code. */
async function order(d) {
  await d.open(SCRIPT, 'output');
  await d.note('mapFirst', { target: field('mapping') });
  await d.note('codeAfter', { target: field('code') });
  await d.close();
  await d.run({
    params: LARGE,
    on: {
      ['mapped:' + SCRIPT]: async () => {
        await d.panel('data');
        await d.note('afterMapping', { target: 'data:discount' });
      },
      ['after:' + SCRIPT]: () => d.note('afterCode', { target: 'data:discount' })
    }
  });
  await d.panel(null);
}

/** 2 — when the code does nothing, the mapping's values stay. */
async function lastWord(d) {
  await d.run({
    params: SMALL,
    fast: true,
    on: {
      ['after:' + SCRIPT]: async () => {
        await d.panel('data');
        await d.note('smallOrder', { target: 'data:level' });
      }
    }
  });
  await d.panel(null);
}

/** 3 — the option under the code. */
async function sudo(d) {
  await d.open(SCRIPT, 'output');
  await d.note('sudo', { target: field('sudo') });
  await d.note('sudoWarning', { target: field('sudo') });
  await d.close();
}

/** 4.1 — a mapping that needs a value the code sets. */
async function tooEarly(d) {
  await d.open(SCRIPT, 'output');
  d.focus(field('map:out.message'));
  await d.wait(300);
  await d.edit(SCRIPT + '.map:out.message', '"Customer level: " + in.level');
  await d.note('tooEarlyEdit', { target: field('map:out.message') });
  await d.close();
  await d.run({
    params: LARGE,
    fast: true,
    on: {
      ['after:' + SCRIPT]: async () => {
        await d.panel('data');
        await d.note('tooEarlyResult', { target: 'data:message' });
      }
    }
  });
  await d.panel(null);
  await d.open(SCRIPT, 'output');
  await d.edit(SCRIPT + '.map:out.message', '');
  d.focus(field('code'));
  await d.edit(SCRIPT + '.code', code => code + '\nout.message = "Customer level: " + out.level;');
  await d.note('tooEarlyFix', { target: field('code@out.message') });
  await d.close();
  await d.run({
    params: LARGE,
    fast: true,
    on: {
      ['after:' + SCRIPT]: async () => {
        await d.panel('data');
        await d.note('tooEarlyFixed', { target: 'data:message' });
      }
    }
  });
  await d.panel(null);
}

/** 4.2 — a String attribute is never null. */
async function nullCheck(d) {
  await d.open(SCRIPT, 'output');
  d.focus(field('code'));
  await d.edit(SCRIPT + '.code', code => 'if (in.customer == null) {\n  out.message = "Who is the customer?";\n}\n' + code);
  await d.note('nullEdit', { target: field('code@in.customer == null') });
  await d.close();
  await d.run({
    params: { customer: '', total: '400' },
    fast: true,
    on: {
      ['after:' + SCRIPT]: async () => {
        await d.panel('data');
        await d.note('nullResult', { target: 'data:message' });
      }
    }
  });
  await d.panel(null);
  await d.open(SCRIPT, 'output');
  await d.edit(SCRIPT + '.code', code => code.replace('in.customer == null', 'in.customer.isEmpty()'));
  await d.note('nullFix', { target: field('code@isEmpty') });
  await d.close();
  await d.run({
    params: { customer: '', total: '400' },
    fast: true,
    on: {
      ['after:' + SCRIPT]: async () => {
        await d.panel('data');
        await d.note('nullFixed', { target: 'data:message' });
      }
    }
  });
  await d.panel(null);
}

export const tour = {
  chapters: [
    { id: 'order', play: order },
    { id: 'lastWord', play: lastWord },
    { id: 'sudo', play: sudo },
    { id: 'mistakes', label: 'mistake', parts: [{ id: 'tooEarly', play: tooEarly }, { id: 'nullCheck', play: nullCheck }] }
  ]
};
