/**
 * The film's stage: SVG elements wrapped as actors the timeline can move.
 *
 * An actor is a group (or a text) with x, y, s (scale), r (rotation, degrees) and o (opacity,
 * 0 hides it), plus any property bound to the element with bind(key, fn), such as a text's
 * `text` or a shape's `fill`. apply() writes only what changed since the last frame.
 */
export const NS = 'http://www.w3.org/2000/svg';

export const FONT = {
  sans: '"Segoe UI", system-ui, -apple-system, "Hiragino Sans", "Yu Gothic UI", Meiryo, sans-serif',
  serif: 'Georgia, "Times New Roman", "Hiragino Mincho ProN", "Yu Mincho", serif',
  mono: 'Consolas, "SFMono-Regular", Menlo, "Liberation Mono", monospace'
};

/** An SVG element with its attributes (null and false are left out), appended to `parent`. */
export function svg(tag, attrs = {}, parent = null) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null && v !== false) el.setAttribute(k, String(v));
  if (parent) (parent.el || parent).appendChild(el);
  return el;
}

const r2 = n => Math.round(n * 100) / 100;

export class Actor {
  constructor(el, props = {}) {
    this.el = el;
    this.x = 0;
    this.y = 0;
    this.s = 1;
    this.r = 0;
    this.o = 1;
    this.binds = [];
    this.last = {};
    Object.assign(this, props);
    this.apply();
  }

  /** Draws property `key` with fn(value, el) whenever it changes. */
  bind(key, fn) {
    this.binds.push([key, fn]);
    fn(this[key], this.el);
    this.last[key] = this[key];
    return this;
  }

  apply() {
    let t = 'translate(' + r2(this.x) + ' ' + r2(this.y) + ')';
    if (this.r) t += ' rotate(' + r2(this.r) + ')';
    if (this.s !== 1) t += ' scale(' + Math.max(0.0001, Math.round(this.s * 1000) / 1000) + ')';
    if (t !== this.last.t) {
      this.el.setAttribute('transform', t);
      this.last.t = t;
    }
    const o = Math.max(0, Math.min(1, Math.round(this.o * 1000) / 1000));
    if (o !== this.last.o) {
      this.el.setAttribute('opacity', String(o));
      this.el.style.display = o < 0.005 ? 'none' : '';
      this.last.o = o;
    }
    for (const [key, fn] of this.binds) {
      const v = this[key];
      if (v !== this.last[key]) {
        fn(v, this.el);
        this.last[key] = v;
      }
    }
  }
}

/**
 * Text width in the stage's units. Measured by the browser when it can, otherwise estimated
 * (wide characters such as kana and kanji count as a whole em).
 */
export function makeMeasure(root) {
  const probe = svg('text', { x: -9999, y: -9999, 'font-family': FONT.sans }, svg('g', { opacity: 0, 'aria-hidden': 'true' }, root));
  const cache = new Map();
  return (str, size = 16, weight = 600, font = FONT.sans) => {
    const key = str + '|' + size + '|' + weight + '|' + font;
    if (cache.has(key)) return cache.get(key);
    let w = 0;
    try {
      probe.setAttribute('font-size', size);
      probe.setAttribute('font-weight', weight);
      probe.setAttribute('font-family', font);
      probe.textContent = str;
      w = probe.getComputedTextLength();
    } catch (e) {
      w = 0;
    }
    if (!w) w = [...String(str)].reduce((sum, c) => sum + (c.charCodeAt(0) > 0x2e80 ? 1 : 0.56), 0) * size;
    cache.set(key, w);
    return w;
  };
}
