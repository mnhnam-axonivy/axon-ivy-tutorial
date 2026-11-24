/**
 * The Workflow tree hangs together: its map, its texts in both languages, and its films' use of
 * the texts.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import workflow from '../trees/workflow/index.js';
import { LEVELS, branches, root, skills, bosses } from '../trees/workflow/nodes.js';
import { buildTree } from '../src/layout.js';
import { UI } from '../src/texts.js';

const { nodes, texts, films } = workflow;
const ids = nodes.map(n => n.id);
const planned = [root.id, ...skills.map(s => s.id), ...bosses.map(b => b.id)]; // every level, built or not
const LANGS = ['en', 'ja'];
const placeholders = s => (String(s).match(/\{\d+\}/g) || []).sort().join();
const keysDeep = (o, p = '') => Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v) ? keysDeep(v, p + k + '.') : [p + k])).sort();
const byId = id => nodes.find(n => n.id === id);
const TOP = 5; // how many levels the plan has

test('the plan: unique skills, every branch has skills on every level, a boss per level', () => {
  assert.equal(new Set(planned).size, planned.length);
  for (const b of branches) for (let level = 1; level <= TOP; level++) assert.ok(skills.some(s => s.branch === b.id && s.level === level), `${b.id} level ${level}`);
  assert.deepEqual(bosses.map(b => b.level), Array.from({ length: TOP }, (_, i) => i + 1));
  assert.ok(skills.every(s => s.level >= 1 && s.level <= TOP && branches.some(b => b.id === s.branch)), 'every skill is on a level of a branch');
  assert.ok(LEVELS >= 1 && LEVELS <= TOP);
});

test('the map: one root, everything it needs drawn above it, no two skills on one spot', () => {
  assert.deepEqual(nodes.filter(n => !n.requires.length).map(n => n.id), [root.id]);
  const spots = new Set();
  nodes.forEach((n, i) => {
    assert.ok(workflow.colors[n.branch], n.id + ': a colour for ' + n.branch);
    const spot = n.span ? 'row ' + n.row : n.col + ',' + n.row;
    assert.ok(!spots.has(spot) && !(n.span ? nodes.some(m => m !== n && m.row === n.row) : spots.has('row ' + n.row)), n.id + ': not alone at ' + spot);
    spots.add(spot);
    for (const r of n.requires) {
      const j = ids.indexOf(r);
      assert.ok(j >= 0 && j < i, `${n.id} requires ${r}, which must come earlier`);
      assert.ok(byId(r).row < n.row, `${n.id} requires ${r}, which must be on a row above`);
    }
  });
  assert.ok(workflow.headings.every(h => !nodes.some(n => n.row === h.row)), 'a level heading has its row to itself');
  // every skill can be reached from the root
  const reach = new Set([root.id]);
  nodes.forEach(n => { if (n.requires.every(r => reach.has(r))) reach.add(n.id); });
  assert.equal(reach.size, ids.length);
});

test('levels are gates: a boss needs every branch, the next level needs the boss', () => {
  const all = buildTree({ id: 'all', branches, levels: TOP, root, skills, bosses });
  for (const boss of all.nodes.filter(n => n.branch === 'boss')) {
    assert.deepEqual(new Set(boss.requires.map(r => all.nodes.find(n => n.id === r).branch)), new Set(branches.map(b => b.id)), boss.id);
  }
  for (const b of branches) {
    const first = level => all.nodes.find(n => n.branch === b.id && n.level === level);
    assert.deepEqual(first(1).requires, [root.id]);
    for (let level = 2; level <= TOP; level++) assert.deepEqual(first(level).requires, ['boss' + (level - 1)], `${b.id} level ${level}`);
  }
  assert.equal(all.nodes.length, planned.length);
});

test('both languages have the same keys and placeholders, for the page and for the tree', () => {
  assert.deepEqual(Object.keys(UI.en).sort(), Object.keys(UI.ja).sort());
  for (const key of Object.keys(UI.en)) assert.equal(placeholders(UI.ja[key]), placeholders(UI.en[key]), 'ui.' + key);
  assert.deepEqual(keysDeep(texts.ja), keysDeep(texts.en));
  for (const path of keysDeep(texts.en)) {
    const get = o => path.split('.').reduce((v, k) => v && v[k], o);
    assert.equal(placeholders(get(texts.ja)), placeholders(get(texts.en)), path);
  }
  for (const id of ids) assert.ok(texts.en.nodes[id], 'texts for ' + id);
  for (const id of Object.keys(texts.en.nodes)) assert.ok(planned.includes(id), 'texts for a skill that is not planned: ' + id);
  for (const b of branches) assert.ok(texts.en.ui['branch_' + b.id], 'a name for the branch ' + b.id);
  for (let level = 1; level <= TOP; level++) assert.ok(texts.en.ui['level' + level], 'a name for level ' + level);
});

test('every skill: a hook, a definition, a film title, three myths and a check whose answer exists', () => {
  for (const lang of LANGS) {
    for (const n of nodes) {
      const t = texts[lang].nodes[n.id];
      for (const key of ['name', 'hook', 'def', 'q', 'why']) assert.ok(String(t[key] || '').trim(), `${lang} ${n.id}.${key}`);
      // three cards, each a thing people think and what is true; no card twice
      assert.ok(Array.isArray(t.myths) && t.myths.length === 3, `${lang} ${n.id}: three myths, not ${(t.myths || []).length}`);
      for (const [i, m] of t.myths.entries()) {
        assert.deepEqual(Object.keys(m).sort(), ['fact', 'myth'], `${lang} ${n.id}: myth ${i + 1} is { myth, fact }`);
        assert.ok(m.myth.trim() && m.fact.trim(), `${lang} ${n.id}: myth ${i + 1} has both sides`);
      }
      assert.equal(new Set(t.myths.map(m => m.myth)).size, 3, `${lang} ${n.id}: the myths differ`);
      assert.equal(new Set(t.myths.map(m => m.fact)).size, 3, `${lang} ${n.id}: the truths differ`);
      assert.ok(t.show && t.show.title, `${lang} ${n.id}.show.title`);
      assert.ok(Array.isArray(t.options) && t.options.length === 3, `${lang} ${n.id}: three options`);
      assert.equal(new Set(t.options).size, 3, `${lang} ${n.id}: options differ`);
      assert.ok(n.answer >= 0 && n.answer < t.options.length, `${lang} ${n.id}: answer in range`);
    }
  }
  // the right answer is not always in the same place
  assert.equal(new Set(nodes.map(n => n.answer)).size, 3);
});

test('links in texts lead to skills that are on the map', () => {
  for (const lang of LANGS) {
    for (const n of nodes) {
      const t = texts[lang].nodes[n.id];
      const all = [t.def, ...t.myths.flatMap(m => [m.myth, m.fact]), t.q, t.why, ...t.options].join(' ');
      for (const m of all.matchAll(/\[\[([\w-]+)(?:\|[^\]]+)?\]\]/g)) assert.ok(ids.includes(m[1]), `${lang} ${n.id}: link to ${m[1]}, which is not on the map`);
      assert.ok(!/\[\[|\]\]/.test(all.replace(/\[\[[\w-]+(?:\|[^\]]+)?\]\]/g, '')), `${lang} ${n.id}: a broken link`);
    }
  }
});

test('every skill has a film, and each film uses only texts that exist, and all of its subtitles', () => {
  const dir = new URL('../trees/workflow/films/', import.meta.url);
  const source = readdirSync(dir).filter(f => f.endsWith('.js')).map(f => readFileSync(new URL(f, dir), 'utf8')).join('\n');
  const parts = source.split(/\nfilms\.(\w+) = /).slice(1);
  const bodies = {};
  for (let i = 0; i < parts.length; i += 2) {
    assert.ok(!bodies[parts[i]], 'two films for ' + parts[i]);
    bodies[parts[i]] = parts[i + 1].split(/\n\/\/ =====/)[0];
  }
  for (const n of nodes) {
    assert.equal(typeof films[n.id], 'function', n.id + ': no film');
    const body = bodies[n.id];
    assert.ok(body, n.id + ': film source not found');
    const said = [...body.matchAll(/k\.say\('(\w+)'/g)].map(m => m[1]);
    const own = [...body.matchAll(/k\.t\('(\w+)'/g)].map(m => m[1]);
    const shared = [...body.matchAll(/k\.f\('(\w+)'/g)].map(m => m[1]);
    for (const lang of LANGS) {
      const t = texts[lang].nodes[n.id];
      for (const key of said) assert.ok(t.show[key], `${lang} ${n.id}: subtitle ${key}`);
      for (const key of own) assert.ok((t.labels && t.labels[key] != null) || texts[lang].film[key] != null, `${lang} ${n.id}: label ${key}`);
      for (const key of shared) assert.ok(texts[lang].film[key] != null, `${lang} ${n.id}: shared label ${key}`);
      const unused = Object.keys(t.show).filter(key => key !== 'title' && !said.includes(key));
      assert.deepEqual(unused, [], `${lang} ${n.id}: subtitles no film says`);
      const unusedLabels = Object.keys(t.labels || {}).filter(key => !own.includes(key));
      assert.deepEqual(unusedLabels, [], `${lang} ${n.id}: labels no film uses`);
    }
  }
});
