/**
 * Walkthrough 3.1 — the chapters. Each starts from the process as the guide ships it; the
 * notes are in text.js. See runtime/ui/tour.js for the director `d`.
 */
const SCRIPT = 'f3';
const PARAMS = { customer: 'Muster AG', quantity: '3', unitPrice: '12.5' };
const field = key => 'field:' + SCRIPT + '.' + key;

/** 1 — what the table is: every attribute of out, with an expression or without. */
async function table(d) {
  await d.open(SCRIPT, 'output');
  await d.note('table', { target: field('mapping') });
  await d.note('root', { target: field('map:out') });
  await d.note('rowTotal', { target: field('map:out.total') });
  await d.note('rowStatus', { target: field('map:out.status') });
  await d.close();
}

/** 2 — the expressions read in, the results go to out. */
async function expressions(d) {
  await d.run({
    params: PARAMS,
    on: {
      ['enter:' + SCRIPT]: async () => {
        await d.panel('data');
        await d.note('before', { target: 'data:total' });
      },
      ['mapped:' + SCRIPT]: () => d.note('after', { target: 'data:total' })
    }
  });
  await d.panel(null);
}

/** 3 — an attribute without an expression keeps its value; one with an expression changes. */
async function unchanged(d) {
  await d.run({
    params: PARAMS,
    fast: true,
    on: {
      ['after:' + SCRIPT]: async () => {
        await d.panel('data');
        await d.note('kept', { target: 'data:customer' });
      }
    }
  });
  await d.panel(null);
  await d.open(SCRIPT, 'output');
  d.focus(field('map:out.customer'));
  await d.wait(300);
  await d.edit(SCRIPT + '.map:out.customer', 'in.customer.toUpperCase()');
  await d.note('customerEdit', { target: field('map:out.customer'), wait: 1800 });
  await d.close();
  await d.run({
    params: PARAMS,
    fast: true,
    on: {
      ['after:' + SCRIPT]: async () => {
        await d.panel('data');
        await d.note('customerChanged', { target: 'data:customer' });
      }
    }
  });
  await d.panel(null);
}

/** 4.1 — text without quotes is read as the name of a variable. */
async function quotes(d) {
  await d.open(SCRIPT, 'output');
  d.focus(field('map:out.status'));
  await d.wait(300);
  await d.edit(SCRIPT + '.map:out.status', 'calculated');
  await d.note('quotesError', { target: field('mapping'), extra: 1200 });
  await d.close();
  await d.run({ params: PARAMS, fast: true });
  await d.panel('log');
  await d.note('quotesStopped', { target: 'log:last' });
  await d.panel(null);
  await d.note('quotesFix');
}

/** 4.2 — a number in quotes is text, and text does not fit a Number. */
async function numberAsText(d) {
  await d.open(SCRIPT, 'output');
  d.focus(field('map:out.total'));
  await d.wait(300);
  await d.edit(SCRIPT + '.map:out.total', '"37.5"');
  await d.note('castError', { target: field('mapping'), extra: 1200 });
  await d.note('castFix', { target: field('map:out.total') });
  await d.close();
}

export const tour = {
  chapters: [
    { id: 'table', play: table },
    { id: 'expressions', play: expressions },
    { id: 'unchanged', play: unchanged },
    { id: 'mistakes', label: 'mistake', parts: [{ id: 'quotes', play: quotes }, { id: 'numberAsText', play: numberAsText }] }
  ]
};
