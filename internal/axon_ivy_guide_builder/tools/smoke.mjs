/**
 * The browser check: the real guide page, served by the preview server, in headless Chrome or
 * Edge. For each language it
 *   - opens the guide and checks the overview and every page that has walkthroughs,
 *   - plays every registered walkthrough from its first to its last chapter (fast, no voice),
 *   - then uses the simulation as a reader would: Run, and check the run completes,
 * and fails on console errors, page errors, failed requests or requests that leave the machine.
 * Screenshots land in .preview/.
 *
 *   npm run smoke                      all walkthroughs, both languages
 *   node tools/smoke.mjs 2.3 --lang=en one walkthrough, one language
 *   CHROME_PATH=…                      when no browser is found
 */
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { start } from '../preview/server.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const shots = join(root, '.preview');
const args = process.argv.slice(2);
// --notes: a screenshot of every note, for reviewing where each one sits (plays slower)
const NOTES = args.includes('--notes');
const PACE = NOTES ? 3 : 14; // the walkthrough plays this many times faster
const TIMEOUT = 240000;

const only = args.filter(a => !a.startsWith('--'));
const langArg = (args.find(a => a.startsWith('--lang=')) || '').slice(7);
const langs = langArg ? [langArg] : ['en', 'ja'];

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

async function main() {
  mkdirSync(shots, { recursive: true });
  const server = await start(0);
  const browser = await puppeteer.launch({ executablePath: browserPath(), headless: true, args: ['--no-sandbox', '--window-size=1440,900'] });
  const failures = [];
  const report = [];
  try {
    for (const lang of langs) {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900 });
      const problems = [];
      page.on('console', msg => { if (msg.type() === 'error' || msg.type() === 'warning') problems.push('console ' + msg.type() + ': ' + msg.text()); });
      page.on('pageerror', e => problems.push('page error: ' + e.message));
      page.on('requestfailed', r => problems.push('request failed: ' + r.url()));
      page.on('request', r => { if (!r.url().startsWith(server.url) && !r.url().startsWith('data:')) problems.push('request leaves the machine: ' + r.url()); });
      await page.evaluateOnNewDocument(pace => { window.ivyGuideOptions = { tourPace: pace, speech: null }; try { localStorage.clear(); } catch (e) { /* ignore */ } }, PACE);
      await page.goto(server.url + '?lang=' + lang, { waitUntil: 'load' });

      // the overview: eight parts
      const overview = await page.evaluate(() => {
        const shadow = document.getElementById('ivy-guide').shadowRoot;
        return { cards: shadow.querySelectorAll('.card').length, ids: window.ivyGuide.ids(), lang: shadow.querySelector('.guide').lang };
      });
      if (overview.cards !== 8) failures.push(lang + ': the overview shows ' + overview.cards + ' parts instead of 8');
      if (overview.lang !== lang) failures.push(lang + ': the guide opened in ' + overview.lang);
      await page.screenshot({ path: join(shots, 'guide-' + lang + '.png') });

      const ids = overview.ids.filter(id => !only.length || only.includes(id));
      for (const id of ids) {
        const started = Date.now();
        // the page of the walkthrough, with its element document
        const pageInfo = await page.evaluate(id => {
          location.hash = '#/walkthrough/' + id;
          return new Promise(resolve => setTimeout(() => {
            const shadow = document.getElementById('ivy-guide').shadowRoot;
            resolve({ doc: Boolean(shadow.querySelector('.doc h2, .doc h1')), player: Boolean(shadow.querySelector('.player')), title: (shadow.querySelector('.player-title') || {}).textContent });
          }, 400));
        }, id);
        if (!pageInfo.player) { failures.push(lang + ' ' + id + ': the walkthrough did not open'); continue; }
        await page.screenshot({ path: join(shots, 'w' + id + '-' + lang + '-start.png') });
        if (NOTES) {
          let last = null;
          let n = 0;
          const until = Date.now() + TIMEOUT;
          while (Date.now() < until) {
            const state = await page.evaluate(() => {
              const handle = window.ivyGuide.instances()[0];
              if (!handle) return { done: true };
              const tour = handle.app.tour;
              return { done: tour.state === 'done', key: tour.current ? tour.current.key : null };
            });
            if (state.done) break;
            if (state.key && state.key !== last) {
              last = state.key;
              await new Promise(r => setTimeout(r, 120)); // the note has moved into place
              await page.screenshot({ path: join(shots, 'w' + id + '-' + lang + '-' + String(++n).padStart(2, '0') + '-' + state.key + '.png') });
            }
            await new Promise(r => setTimeout(r, 50));
          }
        }
        // play to the end: the tour leaves "playing" and shows its end card
        const outcome = await page.waitForFunction(() => {
          const handle = window.ivyGuide.instances()[0];
          if (!handle) return 'gone';
          const tour = handle.app.tour;
          return tour.state === 'done' ? 'done' : false;
        }, { timeout: TIMEOUT, polling: 250 }).then(r => r.jsonValue()).catch(e => 'timeout: ' + e.message);
        if (outcome !== 'done') { failures.push(lang + ' ' + id + ': the walkthrough did not finish (' + outcome + ')'); continue; }
        const playMs = Date.now() - started;
        await page.screenshot({ path: join(shots, 'w' + id + '-' + lang + '-end.png') });

        // the reader runs the process: the request form, then Run
        const run = await page.evaluate(async () => {
          const app = window.ivyGuide.instances()[0].app;
          app.tour.skip && (await app.tour.skip());
          const result = await app.run();
          return { status: result.status, visited: result.visited.length, logs: result.logs.map(l => l.message) };
        });
        if (run.status !== 'completed') failures.push(lang + ' ' + id + ': Run ended with ' + run.status);
        await page.screenshot({ path: join(shots, 'w' + id + '-' + lang + '-explore.png') });

        // close it again
        await page.keyboard.press('Escape');
        await page.waitForFunction(() => window.ivyGuide.instances().length === 0, { timeout: 5000 }).catch(() => failures.push(lang + ' ' + id + ': Escape did not close the walkthrough'));
        if (!pageInfo.doc) report.push(lang + ' ' + id + ': (its page shows no element document)');
        report.push(lang + ' ' + id + ': played in ' + (playMs / 1000).toFixed(1) + ' s at pace ' + PACE + ' (about ' + Math.round(playMs * PACE / 60000 * 10) / 10 + ' min at normal speed, without the voice); Run: ' + run.status + ', ' + run.visited + ' elements');
      }
      if (problems.length) failures.push(...problems.map(p => lang + ': ' + p));
      await page.close();
    }
  } finally {
    await browser.close();
    await server.close();
  }
  report.forEach(line => console.log(line));
  if (failures.length) {
    console.error('\nFAILED:');
    failures.forEach(f => console.error('  ' + f));
    process.exit(1);
  }
  console.log('\nAll walkthroughs played to the end in ' + langs.join(' and ') + '. Screenshots: .preview/');
}

await main();
