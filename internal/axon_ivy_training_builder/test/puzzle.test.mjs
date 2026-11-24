/**
 * The puzzles: the game's rules (src/puzzle/model.js) and the Workflow tree's puzzles
 * (trees/workflow/puzzles.js with their texts) hang together.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import * as M from '../src/puzzle/model.js';
import workflow from '../trees/workflow/index.js';
import { puzzles as planned } from '../trees/workflow/puzzles.js';
import { UI } from '../src/texts.js';

const LANGS = ['en', 'ja'];
const { puzzles, texts, nodes, cast } = workflow;

// a small process to try the rules on: a start, two steps side by side between two gateways, an end
const P = {
  file: 'Test.p.json',
  elements: [
    { id: 'start', kind: 'start' },
    { id: 'split', kind: 'gateway' },
    { id: 'a', kind: 'user', fields: [{ id: 'responsible', options: ['everybody', 'manager'], answer: 'manager' }] },
    { id: 'b', kind: 'dialog' },
    { id: 'join', kind: 'gateway' },
    { id: 'end', kind: 'end' }
  ],
  flow: [['start', 'split'], ['split', 'a'], ['split', 'b'], ['a', 'join'], ['b', 'join'], ['join', 'end']]
};
const outs2 = (puzzle, id) => M.nextOf(puzzle, id);
const codes = (puzzle, state) => M.check(puzzle, state).errors.map(e => [e.el, e.code, e.field || e.to || ''].join(':').replace(/:$/, '')).sort();

test('a new game: nothing placed, every field as the Designer has it', () => {
  const s = M.newState(P);
  assert.deepEqual(s.placed, {});
  assert.deepEqual(s.links, []);
  assert.deepEqual(s.values, { 'a.responsible': 'everybody' });
  assert.equal(M.defaultOf({ options: ['low', 'normal'], default: 'normal' }), 'normal');
  assert.deepEqual(codes(P, s), P.elements.map(e => e.id + ':notPlaced').sort());
});

test('placing: on the grid, inside the board, and off again with its connectors', () => {
  const s = M.newState(P);
  const board = { w: 400, h: 300 };
  assert.deepEqual(M.place(P, s, 'a', 101, 99, board), { x: 104, y: 96 });
  assert.deepEqual(M.place(P, s, 'a', -50, 9999, board), { x: 6 + 56, y: 300 - 6 - 30 });
  assert.equal(M.place(P, s, 'a', 9999, 100, board).x, 400 - 26 - 56, 'room for the arrow on its right');
  const at = M.place(P, s, 'end', 9999, 9999, board);
  assert.ok(at.x + 15 <= board.w && at.y + 15 + 18 <= board.h, 'an event keeps room for its name');
  M.place(P, s, 'start', 40, 40, board);
  M.place(P, s, 'split', 120, 40, board);
  assert.ok(M.link(P, s, 'start', 'split'));
  assert.ok(M.link(P, s, 'split', 'a'));
  M.unplace(s, 'split');
  assert.deepEqual(s.links, []);
  assert.ok(!s.placed.split);
});

test('connecting: not to itself, not out of an end, not into a start; one way out except for a gateway', () => {
  const s = M.solved(P);
  s.links = [];
  assert.equal(M.linkProblem(P, s, 'a', 'a'), 'self');
  assert.equal(M.linkProblem(P, s, 'end', 'a'), 'fromEnd');
  assert.equal(M.linkProblem(P, s, 'a', 'start'), 'toStart');
  assert.equal(M.linkProblem(P, s, 'a', 'nowhere'), 'missing');
  assert.equal(M.linkProblem(P, s, 'a', 'b'), null);
  assert.ok(M.link(P, s, 'a', 'b'));
  assert.equal(M.linkProblem(P, s, 'a', 'b'), 'same');
  assert.ok(!M.link(P, s, 'a', 'b'));
  // another way out of an activity replaces the first
  assert.ok(M.link(P, s, 'a', 'join'));
  assert.deepEqual(s.links, [{ from: 'a', to: 'join' }]);
  // a gateway keeps all of its paths
  M.link(P, s, 'split', 'a');
  M.link(P, s, 'split', 'b');
  assert.equal(M.outsOf(s, 'split').length, 2);
  // back the other way: the first connector gives way
  M.link(P, s, 'join', 'a');
  assert.ok(!s.links.some(l => l.from === 'a' && l.to === 'join'));
  assert.ok(M.unlink(s, 'join', 'a'));
  assert.ok(!M.unlink(s, 'join', 'a'));
});

test('the check: the answer is right, and each kind of mistake is named where it is', () => {
  assert.deepEqual(M.check(P, M.solved(P)), { ok: true, errors: [] });
  const wrong = change => {
    const s = M.solved(P);
    change(s);
    return codes(P, s);
  };
  assert.deepEqual(wrong(s => { s.values['a.responsible'] = 'everybody'; }), ['a:field:responsible']);
  assert.deepEqual(wrong(s => M.unplace(s, 'b')), ['b:notPlaced', 'split:missingPath']);
  assert.deepEqual(wrong(s => M.unlink(s, 'join', 'end')), ['end:noPrev', 'join:noNext']);
  assert.deepEqual(wrong(s => M.unlink(s, 'split', 'b')), ['b:noPrev', 'split:missingPath']);
  // the two steps one after the other instead of side by side
  assert.deepEqual(wrong(s => { M.unlink(s, 'split', 'b'); M.link(P, s, 'a', 'b'); }), ['a:wrongNext:b', 'split:missingPath']);
  const s = M.solved(P);
  s.values['a.responsible'] = 'everybody';
  assert.deepEqual(M.check(P, s).errors, [{ el: 'a', code: 'field', field: 'responsible', value: 'everybody' }]);
});

test('an Alternative tries its rows in the order its exits were drawn: the empty one has to come last', () => {
  const A = {
    elements: [
      { id: 'start', kind: 'start' },
      { id: 'which', kind: 'alternative', fields: [{ id: 'toYes', label: 'condTo', to: 'yes', options: ['empty', 'approved'], answer: 'approved' }] },
      { id: 'yes', kind: 'script' }, { id: 'endYes', kind: 'end' }, { id: 'no', kind: 'email' }, { id: 'endNo', kind: 'end' }
    ],
    flow: [['start', 'which'], ['which', 'yes'], ['yes', 'endYes'], ['which', 'no'], ['no', 'endNo']]
  };
  const s = M.solved(A);
  assert.deepEqual(M.check(A, s), { ok: true, errors: [] });
  assert.equal(M.nthOut(s, 'which', 1), 'yes');
  // drawn again, the exit to `yes` comes last: the empty row of `no` is on top and always true
  M.unlink(s, 'which', 'yes');
  M.link(A, s, 'which', 'yes');
  assert.deepEqual([M.nthOut(s, 'which', 1), M.nthOut(s, 'which', 2), M.nthOut(s, 'which', 3)], ['no', 'yes', undefined]);
  assert.deepEqual(codes(A, s), ['which:rowOrder:no']);
  // and drawing `no` again puts its row last
  M.unlink(s, 'which', 'no');
  M.link(A, s, 'which', 'no');
  assert.deepEqual(M.check(A, s), { ok: true, errors: [] });
  // with only one exit there is no order yet: the missing path is what is wrong
  M.unlink(s, 'which', 'yes');
  assert.deepEqual(codes(A, s), ['which:missingPath', 'yes:noPrev']);
  // every Alternative of the tree's puzzles, its exits drawn the other way round
  for (const [id, p] of Object.entries(puzzles)) {
    for (const e of p.elements.filter(x => x.kind === 'alternative')) {
      const t = M.solved(p);
      t.links = [...t.links.filter(l => l.from !== e.id), ...M.outsOf(t, e.id).reverse()];
      assert.ok(codes(p, t).some(c => c.startsWith(e.id + ':rowOrder:')), `${id}: ${e.id} drawn the other way round`);
    }
  }
});

test('connectors: straight when in line, round the corner otherwise, and measured', () => {
  const s = M.newState(P);
  s.placed = { start: { x: 40, y: 100 }, split: { x: 120, y: 100 }, a: { x: 260, y: 40 }, b: { x: 260, y: 160 }, join: { x: 400, y: 100 }, end: { x: 400, y: 240 } };
  assert.deepEqual(M.route(P, s, 'start', 'split'), [{ x: 55, y: 100 }, { x: 104, y: 100 }]);
  // out of a gateway's top corner, into the side of the step
  assert.deepEqual(M.route(P, s, 'split', 'a'), [{ x: 120, y: 84 }, { x: 120, y: 40 }, { x: 204, y: 40 }]);
  // into a gateway's corner
  assert.deepEqual(M.route(P, s, 'b', 'join'), [{ x: 316, y: 160 }, { x: 400, y: 160 }, { x: 400, y: 116 }]);
  // straight down
  assert.deepEqual(M.route(P, s, 'join', 'end'), [{ x: 400, y: 116 }, { x: 400, y: 225 }]);
  // back to the start of the next line: out of the bottom, into the top
  s.placed.end = { x: 40, y: 240 };
  const back = M.route(P, s, 'b', 'end');
  assert.deepEqual([back[0], back[back.length - 1]], [{ x: 260, y: 190 }, { x: 40, y: 225 }]);
  const pts = [{ x: 0, y: 0 }, { x: 30, y: 0 }, { x: 30, y: 40 }];
  assert.equal(M.lengthOf(pts), 70);
  assert.deepEqual(M.along(pts, 50), { x: 30, y: 20 });
  assert.deepEqual(M.along(pts, 999), { x: 30, y: 40 });
  assert.equal(M.distanceTo(pts, 15, 6), 6);
  assert.equal(M.distanceTo(pts, 40, 50), Math.hypot(10, 10));
});

test('the run: one element at a time, tokens wait where paths run side by side, a join waits for all', () => {
  const plan = M.schedule(P, e => (e.kind === 'gateway' ? 1 : 2), () => 0.5, 1);
  const v = Object.fromEntries(plan.visits.map(x => [x.el, x]));
  assert.deepEqual(plan.visits.map(x => x.el), P.elements.map(e => e.id));
  assert.deepEqual([v.start.begin, v.start.end], [1, 3]);
  // both tokens leave the gateway together; the story is on `a` first, `b` waits its turn
  assert.equal(v.a.arrive, v.b.arrive);
  assert.equal(v.b.begin, v.a.end);
  assert.ok(v.b.arrive < v.b.begin);
  // the join begins when the last path has arrived
  assert.equal(v.join.arrive, v.a.end + 0.5);
  assert.equal(v.join.begin, v.b.end + 0.5);
  for (let i = 1; i < plan.visits.length; i++) assert.ok(plan.visits[i].begin >= plan.visits[i - 1].end, 'one at a time');
  assert.equal(plan.moves.length, P.flow.length);
  assert.equal(plan.duration, v.end.end);
});

test('the run with an Alternative: only the exit that is taken, and what no token reaches is not visited', () => {
  const A = {
    elements: [{ id: 'start', kind: 'start' }, { id: 'which', kind: 'alternative' }, { id: 'yes', kind: 'script' }, { id: 'endYes', kind: 'end' }, { id: 'no', kind: 'email' }, { id: 'endNo', kind: 'end' }],
    flow: [['start', 'which'], ['which', 'yes'], ['yes', 'endYes'], ['which', 'no'], ['no', 'endNo']]
  };
  const way = takes => M.schedule(A, () => 1, () => 0.5, 0, takes).visits.map(v => v.el);
  assert.deepEqual(way({ which: 'yes' }), ['start', 'which', 'yes', 'endYes']);
  assert.deepEqual(way({ which: 'no' }), ['start', 'which', 'no', 'endNo']);
  assert.deepEqual(M.storiesOf(A), [{ texts: 'run', takes: {} }]);
  assert.ok(M.manyOut('alternative') && M.manyOut('split') && M.manyOut('gateway') && !M.manyOut('join') && !M.manyOut('user'));
  // a second way out of an Alternative is kept, as on a gateway
  const s = M.solved(A);
  s.links = [];
  M.link(A, s, 'which', 'yes');
  M.link(A, s, 'which', 'no');
  assert.equal(M.outsOf(s, 'which').length, 2);
});

test('a puzzle for every boss that is built, and nothing else', () => {
  const bosses = nodes.filter(n => n.branch === 'boss').map(n => n.id);
  assert.deepEqual(Object.keys(puzzles).sort(), bosses.sort());
  for (const id of Object.keys(planned)) assert.ok(/^boss\d$/.test(id), id);
});

test('every puzzle: one start, a story that only goes forward, fields that ask for a decision', () => {
  for (const [id, p] of Object.entries(puzzles)) {
    const ids = p.elements.map(e => e.id);
    assert.equal(new Set(ids).size, ids.length, id + ': unique elements');
    assert.equal(p.elements.filter(e => e.kind === 'start').length, 1, id + ': one start');
    assert.equal(p.elements[0].kind, 'start', id + ': the start comes first');
    assert.ok(p.elements.some(e => e.kind === 'end'), id + ': an end');
    assert.ok(/\.p\.json$/.test(p.file), id + ': a process file');
    for (const e of p.elements) {
      assert.ok(M.SHAPE[e.kind], `${id} ${e.id}: kind ${e.kind}`);
      const outs = M.nextOf(p, e.id);
      const ins = M.prevOf(p, e.id);
      if (e.kind === 'end') assert.equal(outs.length, 0, `${id} ${e.id}: nothing after an end`);
      else assert.ok(outs.length >= 1, `${id} ${e.id}: something comes after it`);
      if (e.kind === 'start') assert.equal(ins.length, 0, `${id} ${e.id}: nothing before the start`);
      else assert.ok(ins.length >= 1, `${id} ${e.id}: something leads to it`);
      if (!M.manyOut(e.kind)) assert.ok(outs.length <= 1, `${id} ${e.id}: only a gateway that splits has several ways out`);
      else if (e.kind !== 'gateway') assert.ok(outs.length >= 2, `${id} ${e.id}: more than one way out`);
      if (e.kind === 'join') assert.ok(ins.length >= 2, `${id} ${e.id}: a Join has several paths in`);
      if (e.by && e.by !== 'system') assert.ok(cast[e.by], `${id} ${e.id}: ${e.by} is one of the cast`);
      for (const f of e.fields || []) {
        assert.ok(f.options.includes(f.answer), `${id} ${e.id}.${f.id}: the answer is an option`);
        assert.ok(f.options.includes(M.defaultOf(f)), `${id} ${e.id}.${f.id}: the default is an option`);
        assert.notEqual(M.defaultOf(f), f.answer, `${id} ${e.id}.${f.id}: the default is not the answer`);
        assert.equal(new Set(f.options).size, f.options.length, `${id} ${e.id}.${f.id}: options differ`);
        if (f.to) assert.ok(outs.includes(f.to), `${id} ${e.id}.${f.id}: a path to ${f.to}`);
        if (f.nth) assert.ok(!f.to && M.manyOut(e.kind) && f.nth >= 1 && f.nth <= outs.length, `${id} ${e.id}.${f.id}: its connector ${f.nth} exists`);
      }
    }
    for (const [from, to] of p.flow) {
      assert.ok(ids.includes(from) && ids.includes(to), `${id}: ${from} → ${to}`);
      assert.ok(ids.indexOf(from) < ids.indexOf(to), `${id}: ${from} → ${to} goes forward in the story`);
    }
    assert.equal(new Set(p.flow.map(f => f.join('>'))).size, p.flow.length, id + ': no connector twice');
    // the cases the run shows: an Alternative takes one exit in each, and together they go everywhere
    const stories = M.storiesOf(p);
    const seen = new Set();
    for (const story of stories) {
      for (const e of p.elements.filter(x => x.kind === 'alternative')) assert.ok(outs2(p, e.id).includes(story.takes[e.id]), `${id}: the story ${story.texts} takes an exit of ${e.id}`);
      for (const [from, to] of Object.entries(story.takes)) assert.ok(M.elementOf(p, from).kind === 'alternative' && outs2(p, from).includes(to), `${id}: ${from} takes ${to}`);
      for (const who of Object.values(story.by || {})) assert.ok(cast[who], `${id}: ${who} is one of the cast`);
      M.schedule(p, () => 1, () => 1, 0, story.takes).visits.forEach(v => seen.add(v.el));
    }
    assert.deepEqual(ids.filter(x => !seen.has(x)), [], id + ': every element runs in some story');
    assert.equal(new Set(stories.map(s => s.texts)).size, stories.length, id + ': each story has its own captions');
  }
});

test('every puzzle: untouched it is wrong, solved it is right, and the answer fits on a board', () => {
  for (const [id, p] of Object.entries(puzzles)) {
    const fields = p.elements.flatMap(e => (e.fields || []).map(f => e.id + '.' + f.id));
    assert.ok(fields.length >= 1, id + ': something to set');
    assert.equal(M.check(p, M.newState(p)).errors.length, p.elements.length);
    for (const board of [{ w: 780, h: 480 }, { w: 640, h: 420 }, { w: 510, h: 500 }]) {
      const s = M.solved(p, board);
      assert.deepEqual(M.check(p, s), { ok: true, errors: [] }, id);
      // placed, connected, the fields left alone: exactly the fields are wrong
      const untouched = { ...s, values: M.newState(p).values };
      assert.deepEqual(M.check(p, untouched).errors.map(e => e.el + '.' + e.field).sort(), [...fields].sort(), id);
      const list = Object.entries(s.placed);
      for (const [a, pa] of list) {
        const [w, h] = M.sizeOf(M.elementOf(p, a).kind);
        assert.ok(pa.x - w / 2 >= 0 && pa.x + w / 2 <= board.w && pa.y - h / 2 >= 0 && pa.y + h / 2 <= board.h, `${id} ${a}: on a board of ${board.w} × ${board.h}`);
        for (const [b, pb] of list) {
          if (a >= b) continue;
          const [w2, h2] = M.sizeOf(M.elementOf(p, b).kind);
          assert.ok(Math.abs(pa.x - pb.x) >= (w + w2) / 2 || Math.abs(pa.y - pb.y) >= (h + h2) / 2, `${id}: ${a} and ${b} overlap on a board of ${board.w} × ${board.h}`);
        }
      }
    }
  }
});

test('every puzzle has its words, in both languages: names, reasons, captions', () => {
  for (const lang of LANGS) {
    const vocab = texts[lang].puzzle;
    for (const [id, p] of Object.entries(puzzles)) {
      const t = texts[lang].puzzles[id];
      assert.ok(t, `${lang} ${id}: texts`);
      for (const key of ['title', 'brief', 'solved']) assert.ok(String(t[key] || '').trim(), `${lang} ${id}.${key}`);
      assert.deepEqual(Object.keys(t.names).sort(), p.elements.map(e => e.id).sort(), `${lang} ${id}: a name per element`);
      const shown = p.elements.map(e => t.names[e.id] || vocab.kinds[e.kind]);
      assert.equal(new Set(shown).size, shown.length, `${lang} ${id}: the elements can be told apart`);
      for (const e of p.elements) {
        assert.ok(vocab.kinds[e.kind] && vocab.about[e.kind], `${lang}: kind ${e.kind}`);
        if (e.kind !== 'end') assert.ok(t.names[e.id], `${lang} ${id}: ${e.id} has a name`);
        if (e.kind !== 'end') assert.ok(t.next[e.id], `${lang} ${id}: why what follows ${e.id} follows it`);
        if (e.role) assert.ok(vocab.options[e.role], `${lang}: role ${e.role}`);
        for (const f of e.fields || []) {
          assert.ok(vocab.fields[f.label || f.id], `${lang}: field ${f.label || f.id}`);
          const reasons = t.why[e.id + '.' + f.id] || {};
          for (const option of f.options) {
            assert.ok(vocab.options[option], `${lang}: option ${option}`);
            if (option !== f.answer) assert.ok(reasons[option] || reasons['*'], `${lang} ${id} ${e.id}.${f.id}: why ${option} is wrong`);
          }
          assert.ok(!reasons[f.answer], `${lang} ${id} ${e.id}.${f.id}: no reason against the answer`);
        }
      }
      // nothing written for what the puzzle does not have
      const ids = p.elements.map(e => e.id);
      const fields = p.elements.flatMap(e => (e.fields || []).map(f => e.id + '.' + f.id));
      assert.deepEqual(Object.keys(t.why).filter(k => !fields.includes(k)), [], `${lang} ${id}: reasons for fields that are not there`);
      assert.deepEqual(Object.keys(t.next).filter(k => !ids.includes(k)), [], `${lang} ${id}.next: words for elements that are not there`);
      // a caption for every element a story visits, and for no other
      for (const story of M.storiesOf(p)) {
        const visited = M.schedule(p, () => 1, () => 1, 0, story.takes).visits.map(v => v.el);
        assert.deepEqual(Object.keys(t[story.texts] || {}).sort(), [...visited].sort(), `${lang} ${id}.${story.texts}: a caption for each element this case visits`);
      }
      assert.deepEqual(Object.keys(t).filter(k => /^run/.test(k)).sort(), M.storiesOf(p).map(s => s.texts).sort(), `${lang} ${id}: captions only for its stories`);
      assert.ok(!t.next.end, `${lang} ${id}: nothing follows the end`);
    }
    // every shared name is used by some puzzle
    const all = Object.values(puzzles);
    const usedOptions = new Set(all.flatMap(p => p.elements.flatMap(e => [e.role, ...(e.fields || []).flatMap(f => f.options)])).filter(Boolean).concat('system'));
    assert.deepEqual(Object.keys(vocab.options).filter(k => !usedOptions.has(k)), [], `${lang}: options no puzzle uses`);
    const usedFields = new Set(all.flatMap(p => p.elements.flatMap(e => (e.fields || []).map(f => f.label || f.id))));
    assert.deepEqual(Object.keys(vocab.fields).filter(k => !usedFields.has(k)), [], `${lang}: fields no puzzle uses`);
    assert.deepEqual(Object.keys(vocab.kinds).sort(), Object.keys(M.SHAPE).sort(), `${lang}: a name for every kind`);
    assert.deepEqual(Object.keys(vocab.about).sort(), Object.keys(M.SHAPE).sort(), `${lang}: what every kind does`);
  }
});

test('the game says only what the page has words for, and the page has no words nobody says', () => {
  const read = dir => readdirSync(new URL(dir, import.meta.url)).filter(f => f.endsWith('.js')).map(f => readFileSync(new URL(dir + f, import.meta.url), 'utf8')).join('\n');
  const source = read('../src/puzzle/') + readFileSync(new URL('../src/skilltree.js', import.meta.url), 'utf8');
  const used = new Set([...source.matchAll(/'(pz[A-Z]\w+)'/g)].map(m => m[1]));
  const have = Object.keys(UI.en).filter(k => k.startsWith('pz'));
  assert.deepEqual([...used].filter(k => !have.includes(k)), [], 'used but not written');
  assert.deepEqual(have.filter(k => !used.has(k)), [], 'written but not used');
  assert.ok(UI.en.tab_puzzle && UI.ja.tab_puzzle);
});
