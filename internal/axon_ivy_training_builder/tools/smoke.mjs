/**
 * The browser check: the real training page, served by the preview server, in headless Chrome
 * or Edge. For each language it
 *   - opens the page and checks the map: every skill there, only the first one ready,
 *   - goes through every skill as a reader would: plays its film to the end (fast), turns its
 *     three myth cards over (and checks they fit the card without scrolling), answers the check (the wrong options first, then the right one) and checks that the
 *     skill is learned and the next ones unlock,
 *   - plays every puzzle with the mouse: Finish on the empty process (everything is wrong),
 *     drags the elements in, tries a wrong connector, connects them, Finish with the fields
 *     untouched (exactly the fields are wrong, each with its reason), sets the fields, Finish,
 *     watches the solved process run, and checks the puzzle is marked solved on the map,
 *   - checks the tree is complete, then looks at the page as a phone would and plays one puzzle
 *     there by touch,
 * and fails on console errors, page errors, failed requests or requests that leave the machine.
 * Screenshots land in .preview/ (the map, every film half-way and at its end, the puzzles, a phone).
 *
 *   npm run smoke                  both languages
 *   node tools/smoke.mjs --lang=ja one language
 *   node tools/smoke.mjs task      only the films of these skills, without the checks
 *   node tools/smoke.mjs --puzzles only the puzzles (all, or those of the skills named)
 *   CHROME_PATH=…                  when no browser is found
 */
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { start } from '../preview/server.mjs';
import tasks from '../trees/workflow/index.js';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const shots = join(root, '.preview');
const args = process.argv.slice(2);
const langArg = (args.find(a => a.startsWith('--lang=')) || '').slice(7);
const langs = langArg ? [langArg] : ['en', 'ja'];
const only = args.filter(a => !a.startsWith('--'));
const puzzlesOnly = args.includes('--puzzles');
const PACE = 10; // films play this many times faster

function browserPath() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  ].filter(Boolean);
  const found = candidates.find(existsSync);
  if (!found) throw new Error('No Chrome or Edge found. Set CHROME_PATH.');
  return found;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

/** Runs fn(shadowRoot, ...args) in the page. */
const inTree = (page, fn, ...rest) => page.evaluate((src, rest) => {
  const sr = document.getElementById('ivy-training').shadowRoot;
  // eslint-disable-next-line no-new-func
  return new Function('sr', '...rest', 'return (' + src + ')(sr, ...rest)')(sr, ...rest);
}, fn.toString(), rest);

const click = (page, selector) => inTree(page, (sr, sel) => {
  const el = sr.querySelector(sel);
  if (!el) throw new Error('not found: ' + sel);
  el.click();
  return true;
}, selector);

async function waitFor(page, fn, what, timeout = 15000, ...rest) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    if (await inTree(page, fn, ...rest)) return;
    await sleep(80);
  }
  throw new Error('timed out waiting for ' + what);
}

async function playFilm(page, lang, id) {
  await waitFor(page, sr => !!sr.querySelector('.tf-show'), 'the film of ' + id);
  const duration = await inTree(page, sr => sr.querySelector('.tf-show').filmDuration);
  await sleep((duration * 1000 * 0.55) / PACE);
  await (await shadowElement(page, '.st-card')).screenshot({ path: join(shots, `${lang}-${id}-film.png`) });
  await waitFor(page, sr => sr.querySelector('.tf-show').dataset.state === 'ended', 'the end of the film of ' + id, (duration * 1000) / PACE + 8000);
  await (await shadowElement(page, '.tf-screen')).screenshot({ path: join(shots, `${lang}-${id}-end.png`) });
  const sub = await inTree(page, sr => sr.querySelector('.tf-sub').textContent);
  if (!sub.trim()) throw new Error(id + ': no subtitle at the end of the film');
  return duration;
}

async function shadowElement(page, selector) {
  const handle = await page.evaluateHandle(sel => document.getElementById('ivy-training').shadowRoot.querySelector(sel), selector);
  return handle.asElement();
}

// ---- the puzzles -------------------------------------------------------------------------------
/** Runs fn(api, ...args) with the open puzzle's api (src/puzzle/game.js). */
const inPuzzle = (page, fn, ...rest) => page.evaluate((src, rest) => {
  const overlay = document.getElementById('ivy-training').shadowRoot.querySelector('.pz');
  // eslint-disable-next-line no-new-func
  return new Function('pz', 'overlay', '...rest', 'return (' + src + ')(pz, overlay, ...rest)')(overlay.puzzle, overlay, ...rest);
}, fn.toString(), rest);
const puzzleMode = page => inTree(page, sr => (sr.querySelector('.pz') ? sr.querySelector('.pz').dataset.mode : 'closed'));

/** The mouse, or on a phone a finger: press at a, move to b, let go. */
function pointer(page, touch) {
  const drag = async (a, b) => {
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 + 5 };
    if (touch) {
      await page.touchscreen.touchStart(a.x, a.y);
      await page.touchscreen.touchMove(mid.x, mid.y);
      await page.touchscreen.touchMove(b.x, b.y);
      await page.touchscreen.touchMove(b.x, b.y);
      await page.touchscreen.touchEnd();
    } else {
      await page.mouse.move(a.x, a.y);
      await page.mouse.down();
      await page.mouse.move(mid.x, mid.y, { steps: 3 });
      await page.mouse.move(b.x, b.y, { steps: 3 });
      await page.mouse.up();
    }
    await sleep(30);
  };
  const tap = async a => {
    if (touch) await page.touchscreen.tap(a.x, a.y);
    else await page.mouse.click(a.x, a.y);
    await sleep(30);
  };
  return { drag, tap };
}

/**
 * Plays one puzzle as a player would. `thorough` also tries what a player may do on the way:
 * a wrong connector, connecting by two clicks, deleting a connector, taking an element out.
 */
async function playPuzzle(page, lang, id, { touch = false, thorough = false, tag = '' } = {}) {
  const puzzle = tasks.puzzles[id];
  const words = tasks.texts[lang].puzzles[id];
  const fail = [];
  const expect = (ok, what) => { if (!ok) fail.push(`${lang} puzzle ${id}${tag}: ${what}`); };
  const { drag, tap } = pointer(page, touch);
  const find = async (type, props) => {
    const at = await inPuzzle(page, (pz, o, type, props) => pz.find(type, props), type, props);
    if (!at) throw new Error(`nothing to press: ${type} ${JSON.stringify(props)}`);
    return at;
  };
  const state = () => inPuzzle(page, pz => pz.state());
  const codes = async () => (await inPuzzle(page, pz => pz.errors())).map(e => [e.el, e.code, e.field || e.to || ''].join(':').replace(/:$/, '')).sort();
  const press = async name => tap(await find('btn', { name }));
  const shot = name => page.screenshot({ path: join(shots, `${lang}-puzzle-${id}${tag}-${name}.png`) });
  const connect = async (a, b) => {
    await drag(await find('port', { id: a }), await find('el', { id: b }));
  };

  // its tab on the card, then the game
  await click(page, `.st-node[data-id="${id}"]`);
  await waitFor(page, (sr, id) => sr.querySelector('.st-card').dataset.node === id, 'the card of ' + id, 5000, id);
  await click(page, '.st-tab[data-tab="puzzle"]');
  await waitFor(page, sr => sr.querySelector('.st-card').dataset.tab === 'puzzle', 'the puzzle tab of ' + id);
  const brief = await inTree(page, sr => sr.querySelector('.st-card .st-def').textContent);
  expect(brief === words.brief.replace(/\*\*/g, ''), 'the brief on the card is ' + brief);
  await click(page, '.st-foot .st-btn.primary');
  await waitFor(page, sr => !!(sr.querySelector('.pz') && sr.querySelector('.pz').puzzle), 'the puzzle ' + id);
  await sleep(250);
  expect((await puzzleMode(page)) === 'edit', 'it starts in ' + (await puzzleMode(page)));
  await shot('1-empty');

  // Finish on the empty process: every element is still missing
  await press('finish');
  expect((await puzzleMode(page)) === 'review', 'Finish on the empty process leaves it in ' + (await puzzleMode(page)));
  expect((await codes()).join() === puzzle.elements.map(e => e.id + ':notPlaced').sort().join(), 'the empty process is wrong like this: ' + (await codes()));

  // drag every element onto the board, where the answer has room for it
  const at = await inPuzzle(page, pz => pz.arrange());
  for (const el of await inPuzzle(page, pz => pz.order())) {
    await drag(await find('pal', { id: el }), await inPuzzle(page, (pz, o, p) => pz.boardPoint(p.x, p.y), at[el]));
  }
  expect(Object.keys((await state()).placed).length === puzzle.elements.length, 'placed ' + Object.keys((await state()).placed).length + ' of ' + puzzle.elements.length);
  expect((await puzzleMode(page)) === 'edit', 'with everything placed it is back in ' + (await puzzleMode(page)));

  if (thorough) {
    const [first, second, third] = puzzle.elements.map(e => e.id);
    // a wrong connector: the first element straight to the third
    await connect(first, third);
    await press('finish');
    const wrong = await inPuzzle(page, pz => pz.errors());
    const said = wrong.find(e => e.el === first && e.code === 'wrongNext');
    expect(said && said.to === third && said.text.includes(words.names[third]) && said.text.includes(words.next[first]), 'the wrong connector is explained as: ' + (said && said.text));
    await shot('2-wrong-connector');
    // the right one replaces it
    await connect(first, second);
    expect((await state()).links.map(l => l.from + '>' + l.to).join() === first + '>' + second, 'a second connector did not replace the first: ' + JSON.stringify((await state()).links));
    // connecting with two clicks: the arrow, then the element
    await tap(await find('port', { id: second }));
    await tap(await find('el', { id: third }));
    expect((await state()).links.some(l => l.from === second && l.to === third), 'two clicks did not connect');
    // select that connector and delete it
    await tap(await inPuzzle(page, (pz, o, a, b) => pz.linkPoint(a, b), second, third));
    const sel = await inPuzzle(page, pz => pz.selected());
    expect(sel && sel.type === 'link', 'a click on a connector selects ' + JSON.stringify(sel));
    await page.keyboard.press('Delete');
    expect(!(await state()).links.some(l => l.from === second && l.to === third), 'Delete did not remove the connector');
    // take an element out (onto the palette) and bring it back
    const last = puzzle.elements[puzzle.elements.length - 1].id;
    const palette = (await inPuzzle(page, pz => pz.layout())).palette;
    await drag(await find('el', { id: last }), { x: palette.x + palette.w / 2, y: palette.y + palette.h - 30 });
    expect(!(await state()).placed[last], 'dragging onto the palette did not take the element out');
    await drag(await find('pal', { id: last }), await inPuzzle(page, (pz, o, p) => pz.boardPoint(p.x, p.y), at[last]));
    expect(!!(await state()).placed[last], 'the element did not come back');
    // start over, and build it again
    await press('reset');
    expect(Object.keys((await state()).placed).length === 0, 'Start over left elements on the board');
    for (const el of await inPuzzle(page, pz => pz.order())) await drag(await find('pal', { id: el }), await inPuzzle(page, (pz, o, p) => pz.boardPoint(p.x, p.y), at[el]));
  }

  // connect them as the answer does, and Finish with the fields untouched
  for (const [from, to] of puzzle.flow) await connect(from, to);
  expect((await state()).links.length === puzzle.flow.length, 'connected ' + (await state()).links.length + ' of ' + puzzle.flow.length);
  await shot('3-built');
  await press('finish');
  const fields = puzzle.elements.flatMap(e => (e.fields || []).map(f => e.id + ':field:' + f.id)).sort();
  expect((await codes()).join() === fields.join(), 'with the fields untouched this is wrong: ' + (await codes()));
  for (const e of await inPuzzle(page, pz => pz.errors())) {
    const reasons = words.why[e.el + '.' + e.field] || {};
    expect(e.text === (reasons[e.value] || reasons['*']), `the reason for ${e.el}.${e.field} = ${e.value} is "${e.text}"`);
  }
  await sleep(450);
  await shot('4-wrong');
  const live = await inTree(page, sr => sr.querySelector('.pz-live').textContent);
  expect(live.trim().length > 10, 'nothing is read out after a wrong Finish');

  // set every field: first a wrong option where there is another one, then the answer
  for (const e of puzzle.elements) {
    for (const f of e.fields || []) {
      await tap(await find('el', { id: e.id }));
      const chip = option => find('chip', { el: e.id, field: f.id, option });
      const other = f.options.find(o => o !== f.answer && o !== (f.default || f.options[0]));
      if (other) {
        await tap(await chip(other));
        expect((await state()).values[e.id + '.' + f.id] === other, `${e.id}.${f.id} did not take ${other}`);
      }
      await tap(await chip(f.answer));
      if (touch) await tap(await find('btn', { name: 'deselect' })); // the palette's place is free again
    }
  }
  expect((await puzzleMode(page)) === 'edit', 'with every field set it is in ' + (await puzzleMode(page)));
  await shot('5-set');

  // Finish: the solved process runs
  await press('finish');
  expect((await puzzleMode(page)) === 'run', 'the right answer leads to ' + (await puzzleMode(page)));
  const run = await inPuzzle(page, pz => pz.run());
  const flag = await inTree(page, (sr, id) => sr.querySelector(`.st-node[data-id="${id}"]`).dataset.puzzle, id);
  expect(flag === 'solved', 'the map marks the puzzle as ' + flag);
  const heard = new Set();
  let shotAt = 0.45;
  for (const end = Date.now() + (run.duration * 1000) / PACE + 15000; Date.now() < end && (await puzzleMode(page)) === 'run';) {
    heard.add(await inPuzzle(page, pz => pz.said()));
    const now = await inPuzzle(page, pz => pz.run());
    if (now.time >= run.duration * shotAt) {
      await shot('6-run');
      shotAt = 9;
    }
    await sleep(40);
  }
  expect((await puzzleMode(page)) === 'solved', 'the run ends in ' + (await puzzleMode(page)));
  expect(heard.size >= Math.min(3, puzzle.elements.length - 1), 'only ' + heard.size + ' captions were read out');
  await sleep(200);
  await shot('7-solved');
  // again, and past it
  await press('again');
  expect((await puzzleMode(page)) === 'run', '"watch again" leads to ' + (await puzzleMode(page)));
  await sleep(300);
  await press('skip');
  await sleep(300);
  expect((await puzzleMode(page)) === 'solved', '"skip" leads to ' + (await puzzleMode(page)));
  await press('done');
  await sleep(150);
  expect((await puzzleMode(page)) === 'closed', 'after "done" the puzzle is ' + (await puzzleMode(page)));
  const done = await inTree(page, sr => sr.querySelector('.st-tab[data-tab="puzzle"]').dataset.done);
  expect(done === 'true', 'the tab of a solved puzzle is not marked done (' + done + ')');
  return { fail, duration: run.duration };
}

/** playPuzzle, and when it gets stuck: say where, keep a picture, and close the puzzle so the check can go on. */
async function tryPuzzle(page, lang, id, o = {}) {
  try {
    return await playPuzzle(page, lang, id, o);
  } catch (e) {
    await page.screenshot({ path: join(shots, `${lang}-puzzle-${id}${o.tag || ''}-stuck.png`) });
    for (let i = 0; i < 4 && (await puzzleMode(page)) !== 'closed'; i++) await page.keyboard.press('Escape');
    return { fail: [`${lang} puzzle ${id}${o.tag || ''}: ${e.message}`], duration: 0 };
  }
}

async function main() {
  mkdirSync(shots, { recursive: true });
  const server = await start(0);
  // the puzzles need WebGL: without a graphics card, Chrome draws it in software
  const browser = await puppeteer.launch({ executablePath: browserPath(), headless: true, args: ['--no-sandbox', '--window-size=1440,900', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const failures = [];
  const report = [];
  try {
    for (const lang of langs) {
      const page = await browser.newPage();
      await page.setViewport({ width: 1366, height: 860 });
      const problems = [];
      page.on('console', msg => { if (msg.type() === 'error' || msg.type() === 'warning') problems.push('console ' + msg.type() + ': ' + msg.text()); });
      page.on('pageerror', e => problems.push('page error: ' + e.message));
      page.on('requestfailed', r => problems.push('request failed: ' + r.url()));
      page.on('request', r => { if (!r.url().startsWith(server.url) && !r.url().startsWith('data:')) problems.push('request leaves the machine: ' + r.url()); });
      await page.evaluateOnNewDocument(pace => { window.ivyTrainingOptions = { filmPace: pace }; try { localStorage.clear(); } catch (e) { /* ignore */ } }, PACE);
      await page.goto(server.url + '?lang=' + lang, { waitUntil: 'load' });
      await waitFor(page, sr => sr.querySelectorAll('.st-node').length > 0, 'the map');
      await sleep(300);
      await page.screenshot({ path: join(shots, `${lang}-map.png`), fullPage: true });

      const states = await inTree(page, sr => [...sr.querySelectorAll('.st-node')].map(b => b.dataset.id + ':' + b.dataset.state));
      const expected = tasks.nodes.map(n => n.id + ':' + (n.requires.length ? 'locked' : 'open'));
      if (states.join() !== expected.join()) failures.push(`${lang}: the map starts as ${states.join()}`);
      const pageLang = await inTree(page, sr => sr.querySelector('main').getAttribute('lang'));
      if (pageLang !== lang) failures.push(`${lang}: the page started in ${pageLang}`);

      const nodes = only.length ? tasks.nodes.filter(n => only.includes(n.id)) : tasks.nodes;
      const whole = !only.length && !puzzlesOnly; // every skill, then every puzzle
      if (!whole) await click(page, '.st-tools .st-chip'); // unlock all, to go straight to them
      for (const n of puzzlesOnly ? [] : nodes) {
        const t0 = Date.now();
        await click(page, `.st-node[data-id="${n.id}"]`);
        await waitFor(page, (sr, id) => sr.querySelector('.st-card').dataset.node === id && sr.querySelector('.st-card').dataset.tab === 'watch', 'the card of ' + n.id, 5000, n.id);
        const duration = await playFilm(page, lang, n.id);
        if (!only.length) {
          await click(page, '.st-foot .st-btn.primary'); // next: the myths
          await waitFor(page, sr => sr.querySelector('.st-card').dataset.tab === 'myths', 'the myths of ' + n.id);
          // three cards: each shows what people think, and what is true after a tap
          const sides = sr => [...sr.querySelectorAll('.st-flip')].map(c => c.getAttribute('aria-pressed') + ':' + c.querySelector('.front').getAttribute('aria-hidden') + ':' + c.querySelector('.back').getAttribute('aria-hidden')).join();
          const before = await inTree(page, sides);
          if (before !== 'false:null:true,false:null:true,false:null:true') failures.push(`${lang} ${n.id}: the myth cards start as ${before}`);
          await inTree(page, sr => sr.querySelectorAll('.st-flip').forEach(c => c.click()));
          const after = await inTree(page, sides);
          if (after !== 'true:true:false,true:true:false,true:true:false') failures.push(`${lang} ${n.id}: turned over, the myth cards are ${after}`);
          const over = await inTree(page, sr => { const b = sr.querySelector('.st-body'); return b.scrollHeight - b.clientHeight; });
          if (over > 1) failures.push(`${lang} ${n.id}: the myths are ${over}px too tall for the card`);
          // one turned back, to see both sides in the picture
          await inTree(page, sr => sr.querySelector('.st-flip').click());
          await sleep(520);
          await (await shadowElement(page, '.st-card')).screenshot({ path: join(shots, `${lang}-${n.id}-myths.png`) });
          await click(page, '.st-foot .st-btn.primary'); // next: the check
          await waitFor(page, sr => sr.querySelector('.st-card').dataset.tab === 'check', 'the check of ' + n.id);
          const count = await inTree(page, sr => sr.querySelectorAll('.st-opt').length);
          for (let i = 0; i < count; i++) {
            if (i === n.answer) continue;
            await inTree(page, (sr, i) => sr.querySelectorAll('.st-opt')[i].click(), i);
            const wrong = await inTree(page, sr => !!sr.querySelector('.st-wrong'));
            if (!wrong) failures.push(`${lang} ${n.id}: option ${i} was not marked wrong`);
          }
          await inTree(page, (sr, i) => sr.querySelectorAll('.st-opt')[i].click(), n.answer);
          await waitFor(page, (sr, id) => sr.querySelector(`.st-node[data-id="${id}"]`).dataset.state === 'done', n.id + ' learned', 5000, n.id);
          await page.screenshot({ path: join(shots, `${lang}-${n.id}-check.png`) });
        }
        report.push(`${lang} ${n.id.padEnd(12)} film ${duration.toFixed(1).padStart(5)} s  checked in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
      }
      // the puzzles, with the mouse: the first one with everything a player may try on the way
      const withPuzzle = whole || puzzlesOnly ? Object.keys(tasks.puzzles).filter(id => !only.length || only.includes(id)) : [];
      for (const [i, id] of withPuzzle.entries()) {
        const t0 = Date.now();
        const played = await tryPuzzle(page, lang, id, { thorough: i === 0 });
        failures.push(...played.fail);
        report.push(`${lang} ${id.padEnd(12)} puzzle, run ${played.duration.toFixed(1).padStart(5)} s  played in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
      }
      if (withPuzzle.length) {
        const solved = await inTree(page, sr => sr.querySelector('.st-pzcount').textContent);
        if (!solved.endsWith(withPuzzle.length + '/' + Object.keys(tasks.puzzles).length)) failures.push(`${lang}: puzzles solved shows ${solved}`);
      }
      if (whole) {
        const progress = await inTree(page, sr => sr.querySelector('.st-count').textContent);
        if (!progress.startsWith(tasks.nodes.length + '/')) failures.push(`${lang}: progress at the end is ${progress}`);
        const complete = await inTree(page, sr => sr.host.querySelector ? sr.querySelector('.st').classList.contains('complete') : false);
        if (!complete) failures.push(`${lang}: the tree is not marked complete`);
      }

      // both themes follow the reader's system: look at the other one too
      for (const scheme of ['light', 'dark']) {
        await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: scheme }]);
        await sleep(300);
        await page.screenshot({ path: join(shots, `${lang}-${scheme}.png`) });
      }

      // a phone: the map is the page, the card slides up over it
      await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
      await sleep(400);
      await click(page, '.st-close');
      await sleep(400);
      await page.screenshot({ path: join(shots, `${lang}-phone-map.png`) });
      await click(page, `.st-node[data-id="${nodes[0].id}"]`);
      await sleep(1500);
      await page.screenshot({ path: join(shots, `${lang}-phone-card.png`) });
      // a puzzle on the phone, by touch: the one with the most on its board
      if (withPuzzle.length) {
        await click(page, '.st-close');
        await sleep(300);
        // the switch to a phone loaded the page again, and with it nothing is learned: open everything
        if ((await inTree(page, sr => sr.querySelector('.st-tools .st-chip').getAttribute('aria-pressed'))) !== 'true') await click(page, '.st-tools .st-chip');
        const big = withPuzzle.reduce((a, b) => (tasks.puzzles[b].elements.length > tasks.puzzles[a].elements.length ? b : a));
        const played = await tryPuzzle(page, lang, big, { touch: true, tag: '-phone' });
        failures.push(...played.fail);
        report.push(`${lang} ${big.padEnd(12)} puzzle on a phone, by touch`);
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (overflow > 1) failures.push(`${lang}: the phone page scrolls sideways by ${overflow}px`);

      problems.forEach(p => failures.push(`${lang}: ${p}`));
      await page.close();
    }
  } finally {
    await browser.close();
    await server.close();
  }
  report.forEach(line => console.log(line));
  if (failures.length) {
    console.error('\nFAILED:\n  ' + failures.join('\n  '));
    process.exit(1);
  }
  console.log(`\nAll good: ${langs.join(', ')}. Screenshots in ${shots}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
