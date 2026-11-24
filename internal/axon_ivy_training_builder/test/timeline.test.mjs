/**
 * The films' timeline: any moment can be shown, forwards or backwards, and looks the same.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Timeline, EASE, mix } from '../src/timeline.js';

const actor = props => ({ x: 0, o: 0, text: 'Open', applied: 0, ...props, apply() { this.applied++; } });

test('a number goes from where it is to where it is sent, and stays there', () => {
  const a = actor();
  const tl = new Timeline();
  tl.to(a, { x: 100 }, 1, 2, 'linear');
  tl.seek(0);
  assert.equal(a.x, 0);
  tl.seek(2);
  assert.equal(a.x, 50);
  tl.seek(5);
  assert.equal(a.x, 100);
  assert.equal(tl.duration, 3);
});

test('tweens chain in time order, however they were added', () => {
  const a = actor();
  const tl = new Timeline();
  tl.to(a, { x: 300 }, 4, 1, 'linear');
  tl.to(a, { x: 100 }, 1, 1, 'linear');
  tl.seek(4.5);
  assert.equal(a.x, 200); // from 100 (the end of the earlier one) towards 300
  tl.seek(1.5);
  assert.equal(a.x, 50);
});

test('seeking back shows the same picture as playing forwards', () => {
  const a = actor();
  const tl = new Timeline();
  tl.to(a, { x: 80, o: 1 }, 0.5, 1, 'out');
  tl.set(a, { text: 'Done' }, 2);
  const at = t => { tl.seek(t); return JSON.stringify([a.x, a.o, a.text]); };
  const forwards = [0, 0.7, 1.2, 2, 3].map(at);
  const backwards = [3, 2, 1.2, 0.7, 0].map(at).reverse();
  assert.deepEqual(backwards, forwards);
  assert.equal(at(1.99), JSON.stringify([80, 1, 'Open']));
  assert.equal(at(2), JSON.stringify([80, 1, 'Done']));
});

test('a set at the same moment as a tween comes first (a pop: small, then grows)', () => {
  const a = actor({ s: 1 });
  const tl = new Timeline();
  tl.set(a, { s: 0.5 }, 1);
  tl.to(a, { s: 1 }, 1, 1, 'linear');
  tl.seek(1);
  assert.equal(a.s, 0.5);
  tl.seek(1.5);
  assert.equal(a.s, 0.75);
});

test('a bump goes to its peak and back to where it was', () => {
  const a = actor({ s: 1 });
  const tl = new Timeline();
  tl.to(a, { s: 1.2 }, 0, 1, 'bump');
  tl.to(a, { s: 2 }, 2, 1, 'linear');
  tl.seek(0.5);
  assert.ok(Math.abs(a.s - 1.2) < 1e-9);
  tl.seek(1.5);
  assert.equal(a.s, 1);
  tl.seek(2.5);
  assert.equal(a.s, 1.5); // the next tween starts from 1, not from the peak
});

test('easing and mixing', () => {
  for (const [name, ease] of Object.entries(EASE)) {
    if (name === 'bump') continue;
    assert.equal(Math.round(ease(0) * 1000) / 1000, 0, name);
    assert.equal(Math.round(ease(1) * 1000) / 1000, 1, name);
  }
  assert.equal(mix(0, 10, 0.3), 3);
  assert.equal(mix('a', 'b', 0.99), 'a');
  assert.equal(mix('a', 'b', 1), 'b');
});

test('every actor is drawn once per seek', () => {
  const a = actor();
  const b = actor();
  const tl = new Timeline();
  tl.to(a, { x: 1 }, 0, 1);
  tl.to(b, { x: 1 }, 0, 1);
  tl.to(a, { o: 1 }, 0, 1);
  tl.seek(0.5);
  assert.equal(a.applied, 1);
  assert.equal(b.applied, 1);
});
