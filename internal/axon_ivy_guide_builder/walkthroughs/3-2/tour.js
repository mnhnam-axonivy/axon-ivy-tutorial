/**
 * Walkthrough 3.2 — the chapters. Each starts from the process as the guide ships it; the
 * notes are in text.js. See runtime/ui/tour.js for the director `d`.
 */
const SCRIPT = 'f3';
const LIGHT = { weight: '4', country: 'ch', express: 'false' };
const HEAVY = { weight: '12', country: 'de', express: 'true' };
const field = key => 'field:' + SCRIPT + '.' + key;
const line = text => field('code@' + text);

/** 1 — where code goes, and a variable that lives only while it runs. */
async function variables(d) {
  await d.open(SCRIPT, 'output');
  await d.note('codeBlock', { target: field('code') });
  await d.note('local', { target: line('Number price = 8;') });
  await d.note('assign', { target: line('out.cost = price;') });
  await d.close();
}

/** 2 — if: the same code, two parcels, two prices. */
async function conditions(d) {
  await d.open(SCRIPT, 'output');
  await d.note('ifWeight', { target: line('if (in.weight > 10)') });
  await d.note('ifExpress', { target: line('if (in.express)') });
  await d.close();
  await d.run({
    params: LIGHT,
    fast: true,
    on: {
      ['after:' + SCRIPT]: async () => {
        await d.panel('data');
        await d.note('costLight', { target: 'data:cost' });
      }
    }
  });
  await d.run({
    params: HEAVY,
    fast: true,
    on: {
      ['after:' + SCRIPT]: async () => {
        await d.panel('data');
        await d.note('costHeavy', { target: 'data:cost' });
      }
    }
  });
  await d.panel(null);
}

/** 3 — a String is a Java object: its methods are there. */
async function java(d) {
  await d.open(SCRIPT, 'output');
  await d.note('javaCall', { target: line('toUpperCase') });
  await d.close();
  await d.run({
    params: LIGHT,
    fast: true,
    on: {
      ['after:' + SCRIPT]: async () => {
        await d.panel('data');
        await d.note('countryUpper', { target: 'data:country' });
      }
    }
  });
  await d.panel(null);
}

/** 4 — ivy.log and the Runtime Log. */
async function log(d) {
  await d.open(SCRIPT, 'output');
  await d.note('logCall', { target: line('ivy.log.info') });
  await d.close();
  await d.run({
    params: LIGHT,
    fast: true,
    on: {
      ['after:' + SCRIPT]: async () => {
        await d.panel('log');
        await d.note('logLine', { target: 'log:last' });
      }
    }
  });
  await d.panel(null);
}

/**
 * 5 — Java habits. Each part types one into the shipped code: the Designer marks it, the notes
 * say why and give the IvyScript way. The fourth part runs, because `return` fails only when it
 * is reached, after the lines before it have run.
 */
const HEAVY_PARCEL = { weight: '35', country: 'ch', express: 'false' };

/** Types a change into the code and shows the Designer's mark. */
async function javaHabit(d, focus, change, marked) {
  await d.open(SCRIPT, 'output');
  d.focus(line(focus));
  await d.wait(300);
  await d.edit(SCRIPT + '.code', change);
  await d.note(marked, { target: field('code'), extra: 1200 });
}

/** 5.1 — switch */
async function switchCase(d) {
  await javaHabit(d, 'out.cost = price;', code => code.replace('out.cost = price;', 'switch (in.country) {\n  case "de": price = price + 4;\n}\nout.cost = price;'), 'switchMarked');
  await d.note('switchFix', { target: field('code') });
  await d.close();
}

/** 5.2 — a typed ArrayList */
async function typedList(d) {
  await javaHabit(d, 'ivy.log.info', code => code.replace('// writing to the Runtime Log', 'List<String> labels = new ArrayList<String>();\nlabels.add("fragile");\n\n// writing to the Runtime Log'), 'listMarked');
  await d.note('listFix', { target: field('code') });
  await d.close();
}

/** 5.3 — a lambda */
async function lambda(d) {
  await javaHabit(d, 'ivy.log.info', code => code.replace('// writing to the Runtime Log', 'List<String> labels = ["fragile", "upright"];\nlabels.forEach(l -> ivy.log.info("Label: " + l));\n\n// writing to the Runtime Log'), 'lambdaMarked');
  await d.note('lambdaFix', { target: field('code') });
  await d.close();
}

/** 5.4 — return, to stop early: it fails when it is reached, after what comes before it has run */
async function earlyReturn(d) {
  await javaHabit(d, 'Number price = 8;', code => code.replace('Number price = 8;', 'Number price = 8;\nif (in.weight > 30) {\n  ivy.log.warn("Too heavy to ship");\n  return;\n}'), 'returnMarked');
  await d.close();
  await d.run({ params: HEAVY_PARCEL, fast: true });
  await d.panel('log');
  await d.note('returnRan', { target: 'log:last', extra: 800 });
  await d.panel(null);
  await d.note('returnFix');
}

/** 5.5 — a Number before + and text: Number has no + that takes a String. */
async function numberFirst(d) {
  await javaHabit(d, 'ivy.log.info', code => code.replace('ivy.log.info("Shipping to " + out.country + " calculated");', 'ivy.log.info(out.cost + " CHF to " + out.country);'), 'plusMarked');
  await d.close();
  await d.note('plusFix');
}

export const tour = {
  chapters: [
    { id: 'variables', play: variables },
    { id: 'conditions', play: conditions },
    { id: 'java', play: java },
    { id: 'log', play: log },
    {
      id: 'mistakes',
      label: 'mistake',
      parts: [
        { id: 'switchCase', play: switchCase },
        { id: 'typedList', play: typedList },
        { id: 'lambda', play: lambda },
        { id: 'earlyReturn', play: earlyReturn },
        { id: 'numberFirst', play: numberFirst }
      ]
    }
  ]
};
