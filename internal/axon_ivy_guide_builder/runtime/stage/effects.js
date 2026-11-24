/**
 * Animation of a process run, independent of the renderer.
 *
 * Effects owns a list of drawable `items` (token, rings, chips) and a tiny tween engine that
 * moves them. The stage draws whatever is in `items` each frame and calls `step(dt)`; the
 * choreography methods return promises so the app can await each beat.
 *
 * Item shapes (x/y in process pixels):
 *   { kind: 'token', x, y, r, o }
 *   { kind: 'ring',  x, y, w, h, radius, o, tone }
 *   { kind: 'card',  x, y, s, o, data }      data → draw.js paintCard
 *
 * Copied from internal/interactive_app_builder of the Smart Workflow tutorial without the
 * agent's round trip to the model.
 */
import { pathLength, pointAt } from './layout.js';

const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = t => 1 - Math.pow(1 - t, 3);
const linear = t => t;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const VIEW_KEYS = ['x', 'y', 'zoom'];

/** Rough text width for sizing chips without a canvas (CJK glyphs count double). */
function textUnits(text) {
  let n = 0;
  for (const ch of String(text)) n += ch.charCodeAt(0) > 0x2e80 ? 1.9 : 1;
  return n;
}

export class Effects {
  /**
   * @param {Object} host
   * @param {() => void} host.invalidate            request a redraw
   * @param {() => Object} host.getView             { x, y, zoom }
   * @param {(view: Object) => void} host.setView
   * @param {() => {w:number,h:number}} host.size   viewport in CSS pixels
   */
  constructor(host) {
    this.host = host;
    this.items = [];
    this.tweens = new Set();
    this.speed = 1;
    this.reducedMotion = false;
    this.paused = false; // the walkthrough's Pause freezes every animation
  }

  // ── tween engine ───────────────────────────────────────────────────────────

  tween(duration, update, ease = easeInOut, group = 'fx') {
    const ms = this.reducedMotion ? 0 : duration / this.speed;
    if (ms <= 0) {
      update(1);
      this.host.invalidate();
      return Promise.resolve();
    }
    return new Promise(resolve => {
      this.tweens.add({ ms, elapsed: 0, update, ease, resolve, group });
      this.host.invalidate();
    });
  }

  /** Waits without animating anything (still scaled by speed, skipped for reduced motion). */
  wait(duration) { return this.tween(duration, () => {}, linear); }

  /** Advances all tweens. Returns true while any is still running. */
  step(dt) {
    if (this.paused) return false;
    this.tweens.forEach(tw => {
      tw.elapsed += dt;
      const t = clamp(tw.elapsed / tw.ms, 0, 1);
      tw.update(tw.ease(t));
      if (t >= 1) {
        this.tweens.delete(tw);
        tw.resolve();
      }
    });
    return this.tweens.size > 0;
  }

  /** Ends every animation at once and removes all effect items (reset / dispose). */
  cancelAll() {
    const pending = [...this.tweens];
    this.tweens.clear();
    this.items.length = 0;
    pending.forEach(tw => tw.resolve());
    this.host.invalidate();
  }

  #add(item) { this.items.push(item); return item; }
  #remove(item) {
    const i = this.items.indexOf(item);
    if (i >= 0) this.items.splice(i, 1);
  }

  // ── view ───────────────────────────────────────────────────────────────────

  /** Animates the camera. A later call (or the user dragging) replaces a running one. */
  moveView(target, duration = 500) {
    this.#stopViewTweens();
    const from = this.host.getView();
    const keys = VIEW_KEYS.filter(k => target[k] !== undefined && target[k] !== from[k]);
    if (!keys.length) return Promise.resolve();
    return this.tween(duration, t => {
      const next = {};
      keys.forEach(k => { next[k] = lerp(from[k], target[k], t); });
      this.host.setView(next);
    }, easeInOut, 'view');
  }

  #stopViewTweens() {
    [...this.tweens].filter(tw => tw.group === 'view').forEach(tw => {
      this.tweens.delete(tw);
      tw.resolve();
    });
  }

  /** The user panned or zoomed: stop steering the camera. */
  userMovedView() {
    this.#stopViewTweens();
  }

  // ── token ──────────────────────────────────────────────────────────────────

  /** Moves the token along a polyline of process coordinates. */
  async travel(points, { duration = 460 } = {}) {
    const length = pathLength(points);
    const at = t => pointAt(points, t);
    const token = this.#add({ kind: 'token', x: points[0].x, y: points[0].y, r: 13, o: 1 });
    const trail = [1, 2, 3, 4].map(i => this.#add({ kind: 'token', x: points[0].x, y: points[0].y, r: 13 - i * 2, o: 0.5 - i * 0.1, lag: i * 0.045 }));
    await this.tween(Math.max(260, duration * clamp(length / 90, 0.6, 1.8)), t => {
      Object.assign(token, at(t));
      trail.forEach(tr => Object.assign(tr, at(t - tr.lag)));
      const fade = t > 0.9 ? (1 - t) / 0.1 : 1;
      token.o = fade;
      trail.forEach((tr, i) => { tr.o = (0.5 - (i + 1) * 0.1) * fade; });
    });
    this.#remove(token);
    trail.forEach(tr => this.#remove(tr));
  }

  /** Ripple around an element (arrival of the token). */
  pulse(el, tone = 'assistant') {
    const round = el.shape === 'event';
    const ring = this.#add({ kind: 'ring', x: el.x, y: el.y, w: el.w, h: el.h, radius: round ? el.w / 2 : 5, o: 0, tone });
    return this.tween(520, t => {
      const grow = 4 + t * 16;
      ring.w = el.w + grow;
      ring.h = el.h + grow;
      ring.radius = round ? ring.w / 2 : 5 + grow / 2;
      ring.o = (1 - t) * 0.9;
    }, easeOut).then(() => this.#remove(ring));
  }

  /** A short-lived chip over an element, e.g. "bookRoom.ivp". Resolves once readable. */
  chip(el, text, tone = 'assistant') {
    const width = clamp(textUnits(text) * 6 + 22, 64, 280);
    const y0 = el.y - el.h / 2 - 20;
    const item = this.#add({ kind: 'card', x: el.x, y: y0, s: 1, o: 0, data: { w: width, h: 22, tone, title: text } });
    let shown;
    const visible = new Promise(resolve => { shown = resolve; });
    this.tween(2200, t => {
      item.y = y0 - easeOut(Math.min(1, t * 2)) * 10;
      item.o = clamp(Math.min(t / 0.12, (1 - t) / 0.25), 0, 1);
      if (t >= 0.42) shown();
    }, linear).then(() => { shown(); this.#remove(item); });
    return visible;
  }
}
