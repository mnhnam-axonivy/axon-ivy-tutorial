/**
 * The texts: English and Japanese have the same keys and the same placeholders; every chapter
 * and every note a walkthrough plays has its texts; no walkthrough key replaces a key of the
 * runtime by accident; the Designer labels the inscription uses exist in both languages.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { STRINGS, designerLabel } from '../runtime/i18n.js';
import { strings as guideStrings, parts } from '../guide/catalog.js';

const placeholders = text => [...String(text).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');

function sameKeys(table, where) {
  const en = Object.keys(table.en).sort();
  const ja = Object.keys(table.ja).sort();
  assert.deepEqual(ja.filter(k => !en.includes(k)), [], where + ': only in Japanese');
  assert.deepEqual(en.filter(k => !ja.includes(k)), [], where + ': only in English');
  en.forEach(key => assert.equal(placeholders(table.ja[key]), placeholders(table.en[key]), where + ' ' + key + ': placeholders differ'));
  [...en].forEach(key => ['en', 'ja'].forEach(lang => assert.ok(String(table[lang][key]).trim(), where + ' ' + lang + ' ' + key + ': empty')));
}

const root = new URL('../walkthroughs/', import.meta.url);
const walkthroughs = await Promise.all(readdirSync(root).filter(d => existsSync(new URL(d + '/index.js', root))).map(async dir => ({
  dir,
  strings: (await import(new URL(dir + '/text.js', root))).strings,
  tour: (await import(new URL(dir + '/tour.js', root))).tour,
  source: readFileSync(new URL(dir + '/tour.js', root), 'utf8')
})));

test('the runtime and the guide have the same keys in English and Japanese', () => {
  sameKeys(STRINGS, 'runtime');
  sameKeys(guideStrings, 'guide');
});

test('every walkthrough: same keys in both languages, texts for every chapter and note', () => {
  assert.ok(walkthroughs.length >= 1);
  walkthroughs.forEach(w => {
    sameKeys(w.strings, w.dir);
    const keys = Object.keys(w.strings.en);
    ['tour.intro.title', 'tour.intro.text', 'tour.intro.duration'].forEach(k => assert.ok(keys.includes(k), w.dir + ': ' + k));
    w.tour.chapters.forEach(c => {
      assert.ok(keys.includes('tour.chapter.' + c.id), w.dir + ': no title for chapter ' + c.id);
      (c.parts || []).forEach(p => assert.ok(keys.includes('tour.' + p.id + '.title'), w.dir + ': no title for part ' + p.id));
      if (c.label) {
        assert.ok(keys.includes('tour.screen.' + c.label), w.dir + ': tour.screen.' + c.label);
        assert.ok(keys.includes('tour.count.' + c.label), w.dir + ': tour.count.' + c.label);
      }
    });
    // every d.note('key', …) of the tour has a title and a text
    for (const m of w.source.matchAll(/d\.note\('(\w+)'/g)) {
      assert.ok(keys.includes('tour.' + m[1] + '.title') && keys.includes('tour.' + m[1] + '.text'), w.dir + ': note ' + m[1] + ' has no texts');
    }
  });
});

test('no walkthrough key replaces a key of the runtime', () => {
  walkthroughs.forEach(w => Object.keys(w.strings.en).forEach(key => {
    assert.ok(!(key in STRINGS.en), w.dir + ': ' + key + ' would replace the runtime text of the same key');
  }));
});

test('the guide lists every built walkthrough, and only planned ones', () => {
  const listed = new Set(parts.flatMap(p => p.pages.flatMap(page => page.walkthroughs)));
  assert.equal(listed.size, 50, 'the plan has 50 walkthroughs');
  walkthroughs.forEach(w => assert.ok(listed.has(w.dir.replace('-', '.')), w.dir + ' is not in the catalog'));
  listed.forEach(id => assert.ok(guideStrings.en['w.' + id + '.title'] && guideStrings.en['w.' + id + '.shows'], id + ': no title'));
});

test('the Designer labels the inscription view uses exist in English and Japanese', () => {
  const source = readFileSync(new URL('../runtime/ui/inscription.js', import.meta.url), 'utf8') + readFileSync(new URL('../runtime/app.js', import.meta.url), 'utf8');
  const keys = new Set([...source.matchAll(/(?:this\.l|this\.label|shown)\('([\w.]+)'/g)].map(m => m[1]).filter(k => k.includes('.')));
  ['part.general.title', 'part.start.title', 'part.output.title', 'part.request.title', 'common.label.mapping', 'label.code'].forEach(k => keys.add(k));
  keys.forEach(key => {
    assert.ok(designerLabel('en', key), 'no English Designer label ' + key);
    assert.ok(designerLabel('ja', key), 'no Japanese Designer label ' + key);
  });
});
