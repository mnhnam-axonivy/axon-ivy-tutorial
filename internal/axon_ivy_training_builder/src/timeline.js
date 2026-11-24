/**
 * A seekable timeline for the films. Every change is a tween on one property of one actor:
 * from the value the property has when the tween starts, to `to`, over `dur` seconds from
 * `at`. Because each value is worked out from the tweens alone, the film can be shown at any
 * moment, forwards or backwards (the scrubber), and always looks the same at the same time.
 *
 *   tl.to(actor, { x: 200, o: 1 }, at, dur, ease)   tween numbers; text and colours change at the end
 *   tl.set(actor, { text: 'Done' }, at)             change at once
 *   tl.seek(t)                                      put every actor where it is at t seconds
 *
 * An actor is any object with the animated properties and an apply() that draws them
 * (src/stage.js). The value a property has before its first tween is the one the actor had
 * when that tween was added.
 */
export const EASE = {
  linear: t => t,
  in: t => t * t * t,
  out: t => 1 - Math.pow(1 - t, 3),
  inOut: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  back: t => {
    const c = 1.9;
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
  },
  // up and back down again: for a pulse, the value is `to` in the middle of the tween
  bump: t => Math.sin(Math.PI * t)
};

export class Timeline {
  constructor() {
    this.tracks = new Map(); // actor -> Map(key -> { initial, tweens })
    this.duration = 0;
    this.ready = false;
  }

  to(actor, props, at, dur = 0.5, ease = 'out') {
    if (!actor) return this;
    for (const [key, to] of Object.entries(props)) this.#add(actor, key, { at, dur: Math.max(0, dur), to, ease: EASE[ease] ? ease : 'out' });
    this.duration = Math.max(this.duration, at + Math.max(0, dur));
    return this;
  }

  set(actor, props, at) {
    return this.to(actor, props, at, 0, 'linear');
  }

  /** Makes sure the film lasts at least until `t`. */
  hold(t) {
    this.duration = Math.max(this.duration, t);
    return this;
  }

  #add(actor, key, tween) {
    let byKey = this.tracks.get(actor);
    if (!byKey) this.tracks.set(actor, (byKey = new Map()));
    let track = byKey.get(key);
    if (!track) byKey.set(key, (track = { initial: actor[key], tweens: [] }));
    tween.order = track.tweens.length;
    track.tweens.push(tween);
    this.ready = false;
  }

  /** Orders each property's tweens by their start and works out where each one starts from. */
  prepare() {
    for (const byKey of this.tracks.values()) {
      for (const track of byKey.values()) {
        track.tweens.sort((a, b) => a.at - b.at || a.order - b.order);
        let value = track.initial;
        for (const tween of track.tweens) {
          tween.from = value;
          if (tween.ease !== 'bump') value = tween.to; // a bump comes back to where it started
        }
      }
    }
    this.ready = true;
  }

  /** The value of one track at time t. */
  static valueAt(track, t) {
    let value = track.initial;
    for (const tween of track.tweens) {
      if (t < tween.at) break;
      const end = tween.at + tween.dur;
      if (tween.dur > 0 && t < end) {
        const p = (t - tween.at) / tween.dur;
        return mix(tween.from, tween.to, EASE[tween.ease](p), tween.ease === 'bump');
      }
      if (tween.ease !== 'bump') value = tween.to;
    }
    return value;
  }

  seek(t) {
    if (!this.ready) this.prepare();
    for (const [actor, byKey] of this.tracks) {
      for (const [key, track] of byKey) actor[key] = Timeline.valueAt(track, t);
    }
    for (const actor of this.tracks.keys()) actor.apply && actor.apply();
  }
}

/**
 * Between two values: numbers in between, anything else (text, a colour) switches at the end.
 * A bump goes from `a` towards `b` and back: p is 0 at both ends and 1 in the middle.
 */
export function mix(a, b, p, bump = false) {
  if (typeof a === 'number' && typeof b === 'number') return a + (b - a) * p;
  if (bump) return p > 0.5 ? b : a;
  return p >= 1 ? b : a;
}
