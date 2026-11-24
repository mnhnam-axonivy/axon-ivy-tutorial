/**
 * The film's cast and props, drawn flat with a thick dark outline like a short explainer film:
 * people, the SYSTEM robot, task cards, task lists, a form, a case folder, a clock, a calendar,
 * a database, a log line. What belongs to the Designer is drawn as the tutorial's simulated
 * Designer draws it: a process in its editor with its token, and the inscription view.
 * And the moves the films use: pop, fade, move, pulse, shake, draw, type, and a token's run.
 *
 * makeCast(tl, P, measure) gives functions bound to one film's timeline. Every drawing returns
 * an actor (src/stage.js) whose parts the films reach as its properties (card.chip, list.slot(i),
 * proc.at(i), …). Everything starts hidden (o: 0) unless { o: 1 } is passed; a film shows it with
 * pop or fadeIn. The stage is 600 × 450, y down.
 */
import { Actor, FONT, svg } from './stage.js';

export const W = 600;
export const H = 450;

// The film's colours: the same in light and dark pages, on the film's navy backdrop.
export const P = {
  ink: '#15171d', paper: '#f3ead7', cream: '#fbf5e6', muted: '#8d93a6', soft: '#c9d6ec',
  navy: '#1b2643', bar: '#2a3557', night: '#10172b',
  sky: '#8fb9ea', blue: '#4b86c9', red: '#e2483d', gold: '#eac45a', goldDark: '#b88f2a',
  green: '#4f9a5c', greenLight: '#8fd19e', violet: '#a48dff', teal: '#3fb5a3', pink: '#f08bb4',
  skin: '#f0d3ac', skin2: '#c98f63', hair: '#2d2420', hair2: '#7a4a2a', hair3: '#c7923e',
  field: '#ffffff', fieldLine: '#c7ccd6', label: '#5b6474'
};

// The simulated Designer's colours, as in the tutorial (internal/axon_ivy_guide_builder/runtime/theme.js).
export const D = {
  canvas: '#1e1e1e', bar: '#252526', line: '#3c3c3c', dot: '#4a4a4a', fill: '#202020', stroke: '#ffffff',
  active: '#5dc36a', done: '#3e7145', tile: '#d0e0fd', icon: '#4c82f5', select: '#2d66fe', muted: '#a3a3a3', text: '#e7e7e7'
};

const el = parent => (parent && parent.el) || parent;

export function makeCast(tl, measure) {
  const C = {};

  // ---- building blocks ----------------------------------------------------------------
  /** A group actor, hidden unless props.o is given. */
  C.group = (parent, x = 0, y = 0, props = {}) => new Actor(svg('g', {}, el(parent)), { x, y, o: 0, ...props });

  C.text = (parent, x, y, str, o = {}) => {
    const t = svg('text', {
      'text-anchor': o.anchor || 'middle',
      'dominant-baseline': 'central',
      'font-family': o.font || FONT.sans,
      'font-size': o.size || 16,
      'font-weight': o.weight || 600,
      'letter-spacing': o.spacing ? o.spacing + 'em' : null,
      'font-style': o.italic ? 'italic' : null
    }, el(parent));
    const a = new Actor(t, { x, y, o: o.o ?? 1, text: String(str), fill: o.color || P.cream });
    a.bind('text', (v, e) => { e.textContent = v; });
    a.bind('fill', (v, e) => e.setAttribute('fill', v));
    return a;
  };

  const rect = (parent, x, y, w, h, o = {}) => svg('rect', { x, y, width: w, height: h, rx: o.r ?? 0, fill: o.fill || 'none', stroke: o.stroke || null, 'stroke-width': o.sw || null, 'stroke-dasharray': o.dash || null }, el(parent));
  const circle = (parent, cx, cy, r, o = {}) => svg('circle', { cx, cy, r, fill: o.fill || 'none', stroke: o.stroke || null, 'stroke-width': o.sw || null }, el(parent));
  const path = (parent, d, o = {}) => svg('path', { d, fill: o.fill || 'none', stroke: o.stroke || null, 'stroke-width': o.sw || null, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': o.dash || null }, el(parent));
  C.rect = rect;
  C.circle = circle;
  C.path = path;

  /** A pill with a text; its width follows the text. Props: text, fill. */
  C.pill = (parent, x, y, str, o = {}) => {
    const size = o.size || 12;
    const g = svg('g', {}, el(parent));
    const box = rect(g, 0, -size * 0.95, 10, size * 1.9, { r: size * 0.95, fill: o.fill || P.sky, stroke: o.stroke || P.ink, sw: o.sw ?? 2 });
    const t = svg('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': FONT.sans, 'font-size': size, 'font-weight': 700, fill: o.color || P.ink }, g);
    const a = new Actor(g, { x, y, o: o.o ?? 1, text: String(str), fill: o.fill || P.sky });
    const anchor = o.anchor || 'middle';
    a.bind('text', v => {
      t.textContent = v;
      const w = measure(v, size, 700) + size * 1.5;
      const left = anchor === 'end' ? -w : anchor === 'start' ? 0 : -w / 2;
      box.setAttribute('x', left);
      box.setAttribute('width', w);
      t.setAttribute('x', left + w / 2);
    });
    a.bind('fill', v => box.setAttribute('fill', v));
    return a;
  };

  /** A film's lower-third label: white capitals on a dark box, with a coloured stripe. */
  C.tag = (parent, x, y, str, o = {}) => {
    const size = o.size || 16;
    const label = String(str).toLocaleUpperCase(o.lang);
    const w = measure(label, size, 700) + label.length * size * 0.06 + size * 2 + (o.color ? 8 : 0);
    const a = C.group(parent, x, y, o.props);
    const left = o.anchor === 'start' ? 0 : o.anchor === 'end' ? -w : -w / 2;
    rect(a, left, -size, w, size * 2, { r: 4, fill: '#0e1220' }).setAttribute('fill-opacity', 0.93);
    if (o.color) rect(a, left, -size, 7, size * 2, { r: 3, fill: o.color });
    a.label = C.text(a, left + w / 2 + (o.color ? 4 : 0), 1, label, { size, weight: 700, spacing: 0.06, color: o.ink || P.cream });
    a.w = w;
    return a;
  };

  /** A line drawn from 0 to 1 by tweening d from 1 to 0 (call draw). */
  C.line = (parent, d, o = {}) => {
    const p = svg('path', { d, fill: 'none', stroke: o.color || P.cream, 'stroke-width': o.width || 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': '1 1' }, el(parent));
    const a = new Actor(p, { o: o.o ?? 1, d: o.drawn ? 0 : 1 });
    a.bind('d', (v, e) => e.setAttribute('stroke-dashoffset', String(Math.max(0, Math.min(1, v)))));
    return a;
  };

  /** An arrow head at (x, y), pointing towards angle (degrees, 0 = right). */
  const head = (parent, x, y, angle, color = P.cream, size = 9) => {
    const rad = angle * Math.PI / 180;
    const a1 = rad + Math.PI * 0.82;
    const a2 = rad - Math.PI * 0.82;
    return path(parent, `M${x} ${y} L${x + Math.cos(a1) * size} ${y + Math.sin(a1) * size} L${x + Math.cos(a2) * size} ${y + Math.sin(a2) * size} Z`, { fill: color });
  };
  C.head = head;

  // ---- people ---------------------------------------------------------------------------
  /**
   * A person from the waist up; (x, y) is the middle of the bottom edge. o: shirt, hair, skin,
   * long (long hair), name (a label under), s (scale).
   */
  C.person = (parent, x, y, o = {}) => {
    const a = C.group(parent, x, y, { s: o.s || 1 });
    const body = C.group(a, 0, 0, { o: 1 });
    a.body = body;
    if (o.long) path(body, 'M-23 -66 Q-28 -100 0 -101 Q28 -100 23 -66 L25 -44 Q14 -46 13 -62 L-13 -62 Q-14 -46 -25 -44 Z', { fill: o.hair || P.hair, stroke: P.ink, sw: 3 });
    path(body, 'M-36 0 V-24 Q-36 -48 -12 -50 H12 Q36 -48 36 -24 V0 Z', { fill: o.shirt || P.blue, stroke: P.ink, sw: 3 });
    path(body, 'M-8 -50 L0 -40 L8 -50', { stroke: P.ink, sw: 2.5 });
    circle(body, 0, -72, 21, { fill: o.skin || P.skin, stroke: P.ink, sw: 3 });
    if (!o.bald) path(body, o.long ? 'M-21 -72 Q-21 -96 0 -96 Q21 -96 21 -72 Q12 -84 -2 -82 Q-14 -81 -21 -72 Z' : 'M-21 -74 Q-22 -97 0 -97 Q22 -97 21 -74 Q14 -86 0 -85 Q-14 -86 -21 -74 Z', { fill: o.hair || P.hair, stroke: P.ink, sw: 3 });
    circle(body, -7, -70, 2.4, { fill: P.ink });
    circle(body, 7, -70, 2.4, { fill: P.ink });
    a.mouth = new Actor(path(body, 'M-6 -61 Q0 -56 6 -61', { stroke: P.ink, sw: 2.2 }), { o: 1 });
    if (o.name) a.name = C.text(a, 0, 18, o.name, { size: o.nameSize || 15, weight: 700, color: P.cream });
    return a;
  };

  /** SYSTEM: the engine as a small robot; same origin as a person. */
  C.robot = (parent, x, y, o = {}) => {
    const a = C.group(parent, x, y, { s: o.s || 1 });
    path(a, 'M-34 0 V-34 Q-34 -46 -22 -46 H22 Q34 -46 34 -34 V0 Z', { fill: P.sky, stroke: P.ink, sw: 3 });
    circle(a, 0, -24, 9, { fill: P.cream, stroke: P.ink, sw: 2.5 });
    a.gear = C.group(a, 0, -24, { o: 1 }); // turns round its own middle: tween its r
    path(a.gear, 'M0 -6 V6 M-6 0 H6', { stroke: P.ink, sw: 2.5 });
    path(a, 'M0 -52 V-104', { stroke: P.ink, sw: 3 });
    rect(a, -26, -94, 52, 42, { r: 10, fill: P.cream, stroke: P.ink, sw: 3 });
    a.eyes = C.group(a, 0, 0, { o: 1 });
    rect(a.eyes, -15, -80, 9, 9, { r: 2, fill: P.ink });
    rect(a.eyes, 6, -80, 9, 9, { r: 2, fill: P.ink });
    path(a, 'M-8 -62 H8', { stroke: P.ink, sw: 2.5 });
    path(a, 'M0 -94 V-104', { stroke: P.ink, sw: 3 });
    circle(a, 0, -108, 6, { fill: P.gold, stroke: P.ink, sw: 2.5 });
    if (o.name) a.name = C.text(a, 0, 18, o.name, { size: o.nameSize || 15, weight: 700, color: P.cream });
    return a;
  };

  // ---- work -------------------------------------------------------------------------------
  /**
   * A task as a row of a task list: a stripe, a box that gets a tick when done, its name, a
   * smaller line under it, and a chip on the right (its state or priority). o: w, title, sub,
   * chip, chipFill, stripe, ghost (dashed, for a task nobody can see yet).
   */
  C.card = (parent, x, y, o = {}) => {
    const w = o.w || 230;
    const h = o.sub ? 54 : 46;
    const a = C.group(parent, x, y);
    const face = rect(a, -w / 2, -h / 2, w, h, { r: 10, fill: P.cream, stroke: P.ink, sw: 3, dash: o.ghost ? '7 6' : null });
    a.face = face;
    a.stripe = new Actor(rect(a, -w / 2 + 7, -h / 2 + 8, 6, h - 16, { r: 3 }), { fill: o.stripe || P.gold });
    a.stripe.bind('fill', (v, e) => e.setAttribute('fill', v));
    rect(a, -w / 2 + 21, -9, 18, 18, { r: 4, fill: P.field, stroke: P.ink, sw: 2.2 });
    a.tick = new Actor(path(a, `M${-w / 2 + 25} 0 L${-w / 2 + 29} 5 L${-w / 2 + 36} -5`, { stroke: P.green, sw: 3.2 }), { o: 0 });
    const tx = -w / 2 + 48;
    a.title = C.text(a, tx, o.sub ? -9 : 0, o.title || '', { anchor: 'start', size: o.size || 16, weight: 700, color: P.ink });
    if (o.sub != null) a.sub = C.text(a, tx, 13, o.sub, { anchor: 'start', size: 13.5, weight: 600, color: P.label });
    // the state or priority sits on the card's top edge, like a sticker, so it never covers the name
    if (o.chip != null) a.chip = C.pill(a, w / 2 - 12, -h / 2, o.chip, { anchor: 'end', fill: o.chipFill || P.sky, size: 12.5 });
    a.w = w;
    return a;
  };

  /** A task list window; slot(i) is where its i-th row sits (on the stage). */
  C.list = (parent, x, y, o = {}) => {
    const w = o.w || 250;
    const h = o.h || 200;
    const a = C.group(parent, x, y);
    rect(a, -w / 2, -h / 2, w, h, { r: 12, fill: P.paper });
    rect(a, -w / 2, -h / 2, w, 36, { r: 12, fill: P.bar });
    rect(a, -w / 2, -h / 2 + 22, w, 14, { fill: P.bar });
    rect(a, -w / 2, -h / 2, w, h, { r: 12, stroke: P.ink, sw: 3 });
    a.title = C.text(a, -w / 2 + 14, -h / 2 + 18, o.title || '', { anchor: 'start', size: 15.5, weight: 700, color: P.cream });
    if (o.owner) a.owner = C.text(a, w / 2 - 14, -h / 2 + 18, o.owner, { anchor: 'end', size: 15.5, weight: 700, color: P.gold });
    if (o.empty) a.empty = C.text(a, 0, 18, o.empty, { size: 15, weight: 600, color: P.label, o: 1 });
    a.slot = i => ({ x, y: y - h / 2 + 36 + 18 + 23 + i * (o.gap || 60) });
    a.w = w;
    a.cardW = w - 22;
    return a;
  };

  // ---- a process, as the tutorial's simulated Designer shows it ---------------------------
  // Sizes, colours and icons are those of internal/axon_ivy_guide_builder (runtime/theme.js,
  // runtime/stage/draw.js, runtime/stage/layout.js), so a process in a film looks like the
  // process in a walkthrough: a dark dotted canvas under a file tab, dark elements with a thin
  // white outline, an activity's name inside it next to its icon, an event's name under it,
  // thin connectors with an open arrow head, a green glow for the token, and green outlines
  // with a counter for what has run.
  const SIZE = { activity: [112, 60], event: [30, 30], gateway: [32, 32] };
  const SHAPE = {
    start: 'event', end: 'event', switch: 'event', signalstart: 'event', gateway: 'gateway', alternative: 'gateway', split: 'gateway', join: 'gateway',
    script: 'activity', system: 'activity', user: 'activity', dialog: 'activity', trigger: 'activity', email: 'activity'
  };
  const LABEL = { size: 12, line: 15, font: 'Arial, "Helvetica Neue", Helvetica, "Hiragino Sans", "Yu Gothic UI", Meiryo, sans-serif' };
  let ids = 0;
  const defsOf = parent => {
    const root = el(parent).ownerSVGElement || el(parent);
    return root.querySelector('defs') || root.insertBefore(svg('defs'), root.firstChild);
  };
  const plain = (parent, x, y, str, o = {}) => {
    const t = svg('text', { x, y, 'text-anchor': o.anchor || 'start', 'dominant-baseline': 'central', 'font-family': o.font || LABEL.font, 'font-size': o.size || LABEL.size, 'font-weight': o.weight || 400, fill: o.color || D.stroke }, el(parent));
    t.textContent = str;
    return t;
  };
  // characters a line must not start with (Japanese)
  const NO_START = 'ー、。）」』・ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶ々';
  /** Wraps on spaces; a word wider than the line (or unspaced text) breaks per character. */
  const wrap = (str, max) => {
    const wide = s => measure(s, LABEL.size, 400, LABEL.font);
    const lines = [];
    let current = '';
    const push = () => { lines.push(current); current = ''; };
    String(str).split(' ').forEach(word => {
      const candidate = current ? current + ' ' + word : word;
      if (wide(candidate) <= max) { current = candidate; return; }
      if (current) push();
      if (wide(word) <= max) { current = word; return; }
      for (const ch of word) {
        if (current && wide(current + ch) > max) {
          // a line does not start with a long-vowel mark, a small kana or closing punctuation:
          // what stands before it comes down with it
          let carry = '';
          let next = ch;
          while (NO_START.includes(next) && current.length > 1) {
            next = current.slice(-1);
            carry = next + carry;
            current = current.slice(0, -1);
          }
          push();
          current = carry;
        }
        current += ch;
      }
    });
    push();
    return lines;
  };
  /** A person, as the mark of what people do (User Task, Task Switch). */
  const personGlyph = (g, cx, cy, k, color, sw) => {
    circle(g, cx, cy - 4.5 * k, 3.4 * k, { stroke: color, sw });
    path(g, `M${cx - 7 * k} ${cy + 7.5 * k} Q${cx - 7 * k} ${cy + 0.8 * k} ${cx} ${cy + 0.8 * k} Q${cx + 7 * k} ${cy + 0.8 * k} ${cx + 7 * k} ${cy + 7.5 * k}`, { stroke: color, sw });
  };
  /** An activity's icon on its light tile (30 × 30, top left at x, y). */
  const tileIcon = (g, kind, x, y) => {
    rect(g, x, y, 30, 30, { r: 4, fill: D.tile });
    const cx = x + 15;
    const cy = y + 15;
    const st = { stroke: D.icon, sw: 1.3 };
    if (kind === 'script' || kind === 'system') {
      path(g, `M${cx - 5.5} ${cy - 8} H${cx + 1.5} L${cx + 5.5} ${cy - 4} V${cy + 8} H${cx - 5.5} Z`, st);
      path(g, `M${cx + 1.5} ${cy - 8} V${cy - 4} H${cx + 5.5}`, st);
      plain(g, cx, cy + 2.5, '{ }', { anchor: 'middle', size: 7, weight: 700, color: D.icon });
    } else if (kind === 'user') personGlyph(g, cx, cy, 1, D.icon, 1.3);
    else if (kind === 'dialog') {
      rect(g, cx - 7.5, cy - 6, 15, 12, { r: 2, stroke: D.icon, sw: 1.3 });
      path(g, `M${cx - 7.5} ${cy - 2.2} H${cx + 7.5}`, st);
    } else if (kind === 'email') {
      rect(g, cx - 8, cy - 5.5, 16, 11, { r: 1.5, stroke: D.icon, sw: 1.3 });
      path(g, `M${cx - 8} ${cy - 5} L${cx} ${cy + 1} L${cx + 8} ${cy - 5}`, st);
    } else if (kind === 'trigger') {
      circle(g, cx + 4, cy, 3.6, st);
      path(g, `M${cx - 8} ${cy} H${cx - 1.5} M${cx - 4.5} ${cy - 3} L${cx - 1.5} ${cy} L${cx - 4.5} ${cy + 3}`, st);
    } else rect(g, cx - 7, cy - 6, 14, 12, { r: 2, stroke: D.icon, sw: 1.3 });
  };

  /**
   * A process in its editor: steps [{ kind, label, x?, y? }] left to right with connectors of
   * equal length (or where x, y put them, from the centre), joined by connectors (o.edges:
   * [[from, to, name?], …], by default each to the next; a name is written on the connector,
   * as on an Alternative's exits). Kinds: start, end, script, user (User Task), dialog (User
   * Dialog), email (E-Mail), trigger (Trigger Step), switch (Task Switch Event), gateway (Task
   * Switch Gateway), alternative, split, join, signalstart; `boundary: true` on an activity adds a Signal Boundary
   * Event at its lower right (`boundary: 'error'`: an Error Boundary Event), reached as node
   * n + 0.5 by route().
   *
   * o: w (the width the row may take, 500), scale (the largest scale, 1.3; the row shrinks to
   * fit), file (the name on the editor's tab), frame (false: no editor around it; or
   * { l, r, t, b } to make it larger on a side), edges.
   *
   * Returned: at(i) the middle of a step on the stage, nodes[i] its actor (state: idle,
   * active, done; count: how often it ran), route(i, j) the points of a connector, S the scale.
   * The moves enter, run, hold, arrive and finish (below) play a token through it.
   */
  C.proc = (parent, x, y, steps, o = {}) => {
    const a = C.group(parent, x, y);
    const n = steps.length;
    const shape = s => SHAPE[s.kind] || 'activity';
    const widths = steps.map(s => SIZE[shape(s)][0]);
    const custom = steps.some(s => s.x != null);
    const MIN = 34; // the shortest connector, in process pixels
    let S = o.scale || 1.3;
    let pos;
    if (custom) pos = steps.map(s => ({ x: s.x || 0, y: s.y || 0 }));
    else {
      const room = o.w || 500;
      const total = widths.reduce((sum, w) => sum + w, 0);
      S = Math.min(S, room / (total + (n - 1) * MIN));
      // a connector is as long as the room allows, but no longer than the tutorial's (o.gap sets it)
      const gap = n > 1 ? Math.min(o.gap ?? 64 * S, (room - total * S) / (n - 1)) : 0;
      const span = total * S + (n - 1) * gap;
      let left = -span / 2;
      pos = steps.map((s, i) => {
        const p = { x: left + (widths[i] * S) / 2, y: 0 };
        left += widths[i] * S + gap;
        return p;
      });
    }
    const hw = i => (SIZE[shape(steps[i])][0] / 2) * S;
    const hh = i => (SIZE[shape(steps[i])][1] / 2) * S;
    // where a Signal Boundary Event sits on its activity
    const bpos = i => ({ x: pos[i].x + hw(i) - 14 * S, y: pos[i].y + hh(i) });

    // ---- the editor around it: a file tab, the dotted canvas ----
    const names = steps.map(s => (s.label && shape(s) !== 'activity' ? wrap(s.label, 190) : []));
    if (o.frame !== false) {
      const more = o.frame || {};
      const x0 = Math.min(...pos.map((p, i) => p.x - Math.max(hw(i), (names[i].length ? Math.max(...names[i].map(l => measure(l, LABEL.size, 400, LABEL.font))) / 2 : 0) * S))) - 20 - (more.l || 0);
      const x1 = Math.max(...pos.map((p, i) => p.x + Math.max(hw(i), (names[i].length ? Math.max(...names[i].map(l => measure(l, LABEL.size, 400, LABEL.font))) / 2 : 0) * S))) + 20 + (more.r || 0);
      const y0 = Math.min(...pos.map((p, i) => p.y - hh(i))) - 16 - (more.t || 0);
      const y1 = Math.max(...pos.map((p, i) => p.y + hh(i) + (names[i].length ? (9 + names[i].length * LABEL.line) * S : 0))) + 14 + (more.b || 0);
      const TAB = 21;
      const frame = svg('g', {}, a.el);
      const id = 'tf-grid-' + (++ids);
      const step = 8 * Math.max(1, S);
      const pattern = svg('pattern', { id, width: step, height: step, patternUnits: 'userSpaceOnUse', x: x0, y: y0 }, defsOf(parent));
      rect(pattern, step / 2 - 0.5, step / 2 - 0.5, 1, 1, { fill: D.dot });
      rect(frame, x0, y0 - TAB, x1 - x0, y1 - y0 + TAB, { r: 7, fill: D.canvas });
      rect(frame, x0, y0, x1 - x0, y1 - y0 - 4, { fill: `url(#${id})` });
      path(frame, `M${x0} ${y0} V${y0 - TAB + 7} Q${x0} ${y0 - TAB} ${x0 + 7} ${y0 - TAB} H${x1 - 7} Q${x1} ${y0 - TAB} ${x1} ${y0 - TAB + 7} V${y0} Z`, { fill: D.bar });
      const file = o.file || 'Process.p.json';
      const tabW = measure(file, 11, 400, FONT.sans) + 40;
      path(frame, `M${x0} ${y0} V${y0 - TAB + 7} Q${x0} ${y0 - TAB} ${x0 + 7} ${y0 - TAB} H${x0 + tabW} V${y0} Z`, { fill: D.canvas });
      // the little process mark of the tab, and the file's name
      circle(frame, x0 + 12, y0 - TAB / 2 - 3, 1.8, { stroke: D.text, sw: 1 });
      path(frame, `M${x0 + 12} ${y0 - TAB / 2 - 1} V${y0 - TAB / 2 + 1.5} M${x0 + 9} ${y0 - TAB / 2 + 4.5} L${x0 + 12} ${y0 - TAB / 2 + 1.5} L${x0 + 15} ${y0 - TAB / 2 + 4.5}`, { stroke: D.text, sw: 1 });
      plain(frame, x0 + 22, y0 - TAB / 2 + 0.5, file, { size: 11, color: D.text, font: FONT.sans });
      path(frame, `M${x0} ${y0} H${x1}`, { stroke: D.line, sw: 1 });
      rect(frame, x0, y0 - TAB, x1 - x0, y1 - y0 + TAB, { r: 7, stroke: D.line, sw: 1.5 });
      a.frame = { x: x + x0, y: y + y0 - TAB, w: x1 - x0, h: y1 - y0 + TAB };
    }

    // ---- connectors ----
    const edges = o.edges || steps.slice(1).map((_, i) => [i, i + 1]);
    const routes = new Map();
    const edgeActors = new Map();
    const lines = svg('g', {}, a.el);
    for (const [i, j, edgeName] of edges) {
      const fromBoundary = !Number.isInteger(i);
      const fi = Math.floor(i);
      const p = fromBoundary ? bpos(fi) : pos[i];
      const q = pos[j];
      let pts;
      if (fromBoundary) pts = [{ x: p.x, y: p.y + 11 * S }, { x: p.x, y: q.y }, { x: q.x - hw(j), y: q.y }];
      else if (Math.abs(p.y - q.y) < 1) pts = [{ x: p.x + hw(i), y: p.y }, { x: q.x - hw(j), y: q.y }];
      else if (shape(steps[i]) === 'gateway' && q.x > p.x) pts = [{ x: p.x, y: p.y + (q.y > p.y ? hh(i) : -hh(i)) }, { x: p.x, y: q.y }, { x: q.x - hw(j), y: q.y }];
      else if (shape(steps[j]) === 'gateway') pts = [{ x: p.x + hw(i), y: p.y }, { x: q.x, y: p.y }, { x: q.x, y: q.y + (p.y > q.y ? hh(j) : -hh(j)) }];
      else {
        const mid = (p.x + hw(i) + q.x - hw(j)) / 2;
        pts = [{ x: p.x + hw(i), y: p.y }, { x: mid, y: p.y }, { x: mid, y: q.y }, { x: q.x - hw(j), y: q.y }];
      }
      const end = pts[pts.length - 1];
      const prev = pts[pts.length - 2];
      const angle = Math.atan2(end.y - prev.y, end.x - prev.x);
      const size = 6.5 * S;
      const g = svg('g', {}, lines);
      path(g, 'M' + pts.map(pt => pt.x + ' ' + pt.y).join(' L'), { stroke: D.stroke, sw: 1 * Math.max(1, S * 0.9) });
      path(g, `M${end.x - size * Math.cos(angle - 0.5)} ${end.y - size * Math.sin(angle - 0.5)} L${end.x} ${end.y} L${end.x - size * Math.cos(angle + 0.5)} ${end.y - size * Math.sin(angle + 0.5)}`, { stroke: D.stroke, sw: 1 * Math.max(1, S * 0.9) });
      if (edgeName) {
        // the name of an exit, at the middle of the connector's longest part
        let best = 1;
        for (let n = 2; n < pts.length; n++) if (Math.hypot(pts[n].x - pts[n - 1].x, pts[n].y - pts[n - 1].y) > Math.hypot(pts[best].x - pts[best - 1].x, pts[best].y - pts[best - 1].y)) best = n;
        const a0 = pts[best - 1];
        const b0 = pts[best];
        const flat = Math.abs(b0.x - a0.x) >= Math.abs(b0.y - a0.y);
        const label = svg('g', { transform: `translate(${(a0.x + b0.x) / 2} ${(a0.y + b0.y) / 2}) scale(${S})` }, lines);
        plain(label, flat ? 0 : 6, flat ? -8 : 0, edgeName, { anchor: flat ? 'middle' : 'start', size: 11, color: D.muted });
      }
      const edge = new Actor(g, { o: 1, state: 'idle' });
      edge.bind('state', v => g.querySelectorAll('path').forEach(e => e.setAttribute('stroke', v === 'done' ? D.done : D.stroke)));
      routes.set(i + '>' + j, pts);
      edgeActors.set(i + '>' + j, edge);
    }

    // ---- elements ----
    a.boundaries = [];
    a.nodes = steps.map((s, i) => {
      const g = C.group(a, pos[i].x, pos[i].y, { o: 1, s: S, state: 'idle', count: 0 });
      const kind = shape(s);
      const outline = [];
      let main;
      let wide = 1;
      let badgeAt;
      if (kind === 'activity') {
        const [w, h] = SIZE.activity;
        main = rect(g, -w / 2 + 0.5, -h / 2 + 0.5, w - 1, h - 1, { r: 5, fill: D.fill, stroke: D.stroke, sw: 1 });
        tileIcon(g, s.kind, -w / 2 + 8, -15);
        const text = s.label ? wrap(s.label, w - 43 - 3).slice(0, 3) : [];
        text.forEach((line, k) => plain(g, -w / 2 + 43, -(text.length * LABEL.line) / 2 + LABEL.line * (k + 0.5) + 0.5, line));
        badgeAt = [w / 2 - 8, -h / 2];
      } else if (kind === 'gateway') {
        main = path(g, 'M0 -16 L16 0 L0 16 L-16 0 Z', { fill: D.fill, stroke: D.stroke, sw: 1.2 });
        const mark = svg('g', {}, g.el);
        // a Task Switch Gateway hands work to people; an Alternative chooses one way (×); a Split and a Join are parallel (+)
        if (s.kind === 'alternative') path(mark, 'M-5 -5 L5 5 M5 -5 L-5 5', { stroke: D.stroke, sw: 1.4 });
        else if (s.kind === 'split' || s.kind === 'join') path(mark, 'M0 -7 V7 M-7 0 H7', { stroke: D.stroke, sw: 1.4 });
        else personGlyph(mark, 0, 0.5, 0.62, D.stroke, 1.2);
        outline.push(...mark.children);
        wide = 1.2;
        badgeAt = [12.8, -12.8];
      } else {
        const thick = s.kind === 'end';
        wide = thick ? 3.2 : 1.2;
        main = circle(g, 0, 0, 15 - wide / 2, { fill: D.fill, stroke: D.stroke, sw: wide });
        const mark = svg('g', {}, g.el);
        if (s.kind === 'switch') personGlyph(mark, 0, 0.5, 0.66, D.stroke, 1.2);
        if (s.kind === 'signalstart') path(mark, 'M0 -6.5 L6.5 5 H-6.5 Z', { stroke: D.stroke, sw: 1.2 });
        outline.push(...mark.children);
        badgeAt = [13.8, -13.8];
      }
      if (kind !== 'activity') names[i].forEach((line, k) => plain(g, s.dx || 0, SIZE[kind][1] / 2 + 7 + LABEL.line * (k + 0.5) + 0.5, line, { anchor: 'middle' }));
      outline.push(main);
      // how often it ran, as the tutorial counts it
      const badge = svg('g', { transform: `translate(${badgeAt[0]} ${badgeAt[1]})` }, g.el);
      rect(badge, -8, -6, 16, 12, { r: 6, fill: D.fill, stroke: D.done, sw: 1 });
      const number = plain(badge, 0, 0.5, '', { anchor: 'middle', size: 8.5, weight: 700, color: D.active });
      g.bind('state', v => {
        const color = v === 'active' ? D.active : v === 'done' ? D.done : D.stroke;
        outline.forEach(e => e.setAttribute('stroke', color));
        main.setAttribute('stroke-width', v === 'active' ? Math.max(wide, 1.8) : wide);
        main.style.filter = v === 'active' ? `drop-shadow(0 0 3px ${D.active})` : '';
      });
      g.bind('count', v => {
        badge.style.display = v ? '' : 'none';
        number.textContent = v || '';
      });
      if (s.boundary) {
        // a boundary event on the activity: two rings, and the signal's triangle or (boundary: 'error') the error's flash
        const b = bpos(i);
        const bg = C.group(a, b.x, b.y, { o: 1, s: S, state: 'idle' });
        const ring = circle(bg, 0, 0, 10.4, { fill: D.fill, stroke: D.stroke, sw: 1.2 });
        const inner = circle(bg, 0, 0, 8, { stroke: D.stroke, sw: 1 });
        const tri = path(bg, s.boundary === 'error' ? 'M-4 3.6 L-1.4 -4 L1.4 1.6 L4 -3.8' : 'M0 -4.6 L4.6 3.4 H-4.6 Z', { stroke: D.stroke, sw: 1.1 });
        bg.bind('state', v => {
          const color = v === 'active' ? D.active : v === 'done' ? D.done : D.stroke;
          [ring, inner, tri].forEach(e => e.setAttribute('stroke', color));
          ring.style.filter = v === 'active' ? `drop-shadow(0 0 3px ${D.active})` : '';
        });
        a.boundaries[i] = bg;
      }
      return g;
    });
    a.S = S;
    a.pos = pos;
    a.counts = steps.map(() => 0);
    a.at = i => (Number.isInteger(i) ? { x: x + pos[i].x, y: y + pos[i].y } : { x: x + bpos(Math.floor(i)).x, y: y + bpos(Math.floor(i)).y });
    a.route = (i, j) => (routes.get(i + '>' + j) || [pos[i], pos[j]]).map(p => ({ x: x + p.x, y: y + p.y }));
    a.edge = (i, j) => edgeActors.get(i + '>' + j);
    a.node = i => (Number.isInteger(i) ? a.nodes[i] : a.boundaries[Math.floor(i)]);
    return a;
  };

  /** The token: the tutorial's green glow with a white core. Hidden until a move shows it. */
  C.token = (parent, x = 0, y = 0, o = {}) => {
    const a = C.group(parent, x, y, { s: o.s || 1 });
    const id = 'tf-glow-' + (++ids);
    const g = svg('radialGradient', { id }, defsOf(parent));
    svg('stop', { offset: '0', 'stop-color': D.active }, g);
    svg('stop', { offset: '0.25', 'stop-color': D.active }, g);
    svg('stop', { offset: '1', 'stop-color': D.active, 'stop-opacity': 0 }, g);
    circle(a, 0, 0, 13, { fill: `url(#${id})` });
    circle(a, 0, 0, 2.1, { fill: '#ffffff' });
    return a;
  };

  /** Two heads' worth of person, for a role's pill. */
  const personIcon = (parent, x, y, s = 1) => {
    const g = svg('g', { transform: `translate(${x} ${y}) scale(${s})` }, el(parent));
    circle(g, 0, -8, 6, { fill: P.ink });
    path(g, 'M-11 10 Q-11 -1 0 -1 Q11 -1 11 10 Z', { fill: P.ink });
    return g;
  };

  /** A case: a folder with a label; things put "into" it sit in front of it. */
  C.folder = (parent, x, y, o = {}) => {
    const w = o.w || 170;
    const h = o.h || 116;
    const a = C.group(parent, x, y);
    path(a, `M${-w / 2} ${-h / 2 + 12} V${-h / 2} Q${-w / 2} ${-h / 2 - 12} ${-w / 2 + 12} ${-h / 2 - 12} H${-w / 2 + 58} L${-w / 2 + 70} ${-h / 2} H${w / 2 - 10} Q${w / 2} ${-h / 2} ${w / 2} ${-h / 2 + 10} V${-h / 2 + 12}`, { fill: o.back || P.goldDark, stroke: P.ink, sw: 3 });
    rect(a, -w / 2, -h / 2 + 8, w, h - 8, { r: 10, fill: o.fill || P.gold, stroke: P.ink, sw: 3 });
    a.label = C.text(a, 0, h / 2 - 20, o.label || '', { size: o.size || 15, weight: 800, color: P.ink });
    return a;
  };

  /** A sheet of paper with a few lines of text (process data). */
  C.doc = (parent, x, y, lines = [], o = {}) => {
    const w = o.w || 120;
    const h = o.h || 28 + lines.length * 21;
    const a = C.group(parent, x, y);
    path(a, `M${-w / 2} ${-h / 2} H${w / 2 - 16} L${w / 2} ${-h / 2 + 16} V${h / 2} H${-w / 2} Z`, { fill: P.field, stroke: P.ink, sw: 3 });
    path(a, `M${w / 2 - 16} ${-h / 2} V${-h / 2 + 16} H${w / 2}`, { stroke: P.ink, sw: 2.5 });
    a.lines = lines.map((s, i) => C.text(a, -w / 2 + 12, -h / 2 + 22 + i * 21, s, { anchor: 'start', size: 15, weight: 700, color: P.ink, font: o.mono ? FONT.mono : FONT.sans }));
    return a;
  };

  /**
   * A form window: a title bar, rows of label and value, a button. values[i] are the value
   * texts, button the button (its face is button.face).
   */
  C.form = (parent, x, y, o = {}) => {
    const w = o.w || 240;
    const rows = o.rows || [];
    const h = o.h || 58 + rows.length * 52 + (o.button ? 52 : 6);
    const a = C.group(parent, x, y);
    rect(a, -w / 2, -h / 2, w, h, { r: 12, fill: P.paper });
    rect(a, -w / 2, -h / 2, w, 36, { r: 12, fill: P.bar });
    rect(a, -w / 2, -h / 2 + 22, w, 14, { fill: P.bar });
    rect(a, -w / 2, -h / 2, w, h, { r: 12, stroke: P.ink, sw: 3 });
    a.title = C.text(a, -w / 2 + 14, -h / 2 + 18, o.title || '', { anchor: 'start', size: 15.5, weight: 700, color: P.cream });
    a.values = rows.map(([label, value], i) => {
      const top = -h / 2 + 50 + i * 52;
      C.text(a, -w / 2 + 14, top + 6, label, { anchor: 'start', size: 13.5, weight: 600, color: P.label });
      rect(a, -w / 2 + 14, top + 16, w - 28, 28, { r: 5, fill: P.field, stroke: P.fieldLine, sw: 1.5 });
      return C.text(a, -w / 2 + 22, top + 30, value, { anchor: 'start', size: 15.5, weight: 700, color: P.ink });
    });
    if (o.button) {
      a.button = C.group(a, w / 2 - 16, h / 2 - 27, { o: 1 });
      const bw = measure(o.button, 15.5, 700) + 30;
      a.button.face = rect(a.button, -bw, -17, bw, 34, { r: 8, fill: o.buttonFill || P.green, stroke: P.ink, sw: 2.5 });
      C.text(a.button, -bw / 2, 0, o.button, { size: 15.5, weight: 700, color: P.cream });
    }
    a.h = h;
    return a;
  };

  /**
   * The inscription view of an element, as the tutorial's simulated Designer shows it (dark,
   * the element's icon and name on top, tabs as boxes): rows of label and value on one tab.
   * values[i] are the value texts, marks[i] a highlight around a row.
   * o: w, title, tab or tabs + active, rows [[label, value]], split (where the fields start).
   */
  C.inscription = (parent, x, y, o = {}) => {
    const w = o.w || 270;
    const rows = o.rows || [];
    const h = 88 + rows.length * 44;
    const a = C.group(parent, x, y);
    rect(a, -w / 2, -h / 2, w, h, { r: 8, fill: D.bar, stroke: D.line, sw: 1.5 });
    // the element's icon tile and its name
    rect(a, -w / 2 + 12, -h / 2 + 11, 20, 20, { r: 4, fill: D.tile });
    rect(a, -w / 2 + 17, -h / 2 + 16, 10, 10, { r: 2, stroke: D.icon, sw: 1.3 });
    C.text(a, -w / 2 + 40, -h / 2 + 21, o.title || '', { anchor: 'start', size: 15, weight: 700, color: D.text });
    // the tabs: boxes side by side, the open one brighter
    const tabs = o.tabs || [o.tab || ''];
    let tx = -w / 2 + 12;
    tabs.forEach((label, i) => {
      const on = i === (o.active || 0);
      const tw = Math.max(64, measure(label, 13.5, on ? 700 : 400) + 28);
      rect(a, tx, -h / 2 + 38, tw, 24, { r: 3, fill: on ? D.canvas : 'none', stroke: on ? '#9a9a9a' : D.dot, sw: on ? 1.4 : 1 });
      C.text(a, tx + tw / 2, -h / 2 + 50.5, label, { size: 13.5, weight: on ? 700 : 400, color: on ? D.stroke : D.muted });
      tx += tw + 6;
    });
    const split = o.split || 0.4;
    a.marks = [];
    a.values = rows.map(([label, value], i) => {
      const cy = -h / 2 + 88 + i * 44;
      a.marks.push(new Actor(rect(a, -w / 2 + 6, cy - 19, w - 12, 38, { r: 6, stroke: D.select, sw: 2.5 }), { o: 0 }));
      C.text(a, -w / 2 + 14, cy, label, { anchor: 'start', size: 13.5, weight: 400, color: '#c5c5c5' });
      const fx = -w / 2 + w * split;
      rect(a, fx, cy - 14, w / 2 - 12 - fx, 28, { r: 3, fill: D.canvas, stroke: '#6b6b6b', sw: 1.2 });
      return C.text(a, fx + 8, cy, value, { anchor: 'start', size: 14.5, weight: 600, color: D.stroke });
    });
    return a;
  };

  /** A role: a coloured pill with two heads and its name. */
  C.badge = (parent, x, y, str, o = {}) => {
    const size = o.size || 16;
    const w = measure(str, size, 800) + 52;
    const a = C.group(parent, x, y);
    rect(a, -w / 2, -18, w, 36, { r: 18, fill: o.fill || P.teal, stroke: P.ink, sw: 3 });
    personIcon(a, -w / 2 + 19, 3, 0.55);
    personIcon(a, -w / 2 + 29, 5, 0.55);
    a.label = C.text(a, -w / 2 + 40 + (w - 52) / 2, 1, str, { size, weight: 800, color: P.ink });
    a.w = w;
    return a;
  };

  C.check = (parent, x, y, o = {}) => {
    const r = o.r || 24;
    const a = C.group(parent, x, y);
    circle(a, 0, 0, r, { fill: P.green, stroke: P.ink, sw: 3 });
    path(a, `M${-r * 0.42} 0 L${-r * 0.1} ${r * 0.32} L${r * 0.45} ${-r * 0.32}`, { stroke: P.cream, sw: r * 0.2 });
    return a;
  };

  C.cross = (parent, x, y, o = {}) => {
    const r = o.r || 24;
    const a = C.group(parent, x, y);
    circle(a, 0, 0, r, { fill: P.red, stroke: P.ink, sw: 3 });
    path(a, `M${-r * 0.35} ${-r * 0.35} L${r * 0.35} ${r * 0.35} M${r * 0.35} ${-r * 0.35} L${-r * 0.35} ${r * 0.35}`, { stroke: P.cream, sw: r * 0.2 });
    return a;
  };

  /** A clock; hour and minute are its hands (tween r: 360 per turn). */
  C.clock = (parent, x, y, o = {}) => {
    const r = o.r || 40;
    const a = C.group(parent, x, y);
    circle(a, 0, 0, r, { fill: P.cream, stroke: P.ink, sw: 4 });
    for (let i = 0; i < 12; i++) {
      const t = (i * Math.PI) / 6;
      path(a, `M${Math.cos(t) * r * 0.78} ${Math.sin(t) * r * 0.78} L${Math.cos(t) * r * 0.9} ${Math.sin(t) * r * 0.9}`, { stroke: P.ink, sw: i % 3 ? 2 : 3.5 });
    }
    a.hour = new Actor(path(a, `M0 0 V${-r * 0.48}`, { stroke: P.ink, sw: 5 }), { r: o.hour ?? 60 });
    a.minute = new Actor(path(a, `M0 0 V${-r * 0.72}`, { stroke: P.ink, sw: 3.5 }), { r: o.minute ?? 0 });
    circle(a, 0, 0, 4.5, { fill: P.red, stroke: P.ink, sw: 2 });
    return a;
  };

  /** A calendar sheet; day is its big text. */
  C.calendar = (parent, x, y, o = {}) => {
    const w = o.w || 96;
    const a = C.group(parent, x, y);
    rect(a, -w / 2, -w / 2, w, w * 1.02, { r: 10, fill: P.cream, stroke: P.ink, sw: 3 });
    rect(a, -w / 2, -w / 2, w, w * 0.3, { r: 10, fill: P.red });
    rect(a, -w / 2, -w / 2 + w * 0.18, w, w * 0.12, { fill: P.red });
    rect(a, -w / 2, -w / 2, w, w * 1.02, { r: 10, stroke: P.ink, sw: 3 });
    a.top = C.text(a, 0, -w / 2 + w * 0.15, o.top || '', { size: 12, weight: 800, color: P.cream });
    a.day = C.text(a, 0, w * 0.12, o.day || '', { size: o.size || 30, weight: 700, color: P.ink, font: FONT.serif });
    return a;
  };

  /** A database: the engine's system database, where waiting tasks keep their data. */
  C.db = (parent, x, y, o = {}) => {
    const w = o.w || 92;
    const h = o.h || 84;
    const a = C.group(parent, x, y);
    path(a, `M${-w / 2} ${-h / 2} V${h / 2} A${w / 2} ${w / 7} 0 0 0 ${w / 2} ${h / 2} V${-h / 2}`, { fill: P.soft, stroke: P.ink, sw: 3 });
    path(a, `M${-w / 2} ${-h / 6} A${w / 2} ${w / 7} 0 0 0 ${w / 2} ${-h / 6} M${-w / 2} ${h / 6} A${w / 2} ${w / 7} 0 0 0 ${w / 2} ${h / 6}`, { stroke: P.ink, sw: 2.5 });
    svg('ellipse', { cx: 0, cy: -h / 2, rx: w / 2, ry: w / 7, fill: P.cream, stroke: P.ink, 'stroke-width': 3 }, a.el);
    if (o.label) a.label = C.text(a, 0, h / 2 + w / 7 + 18, o.label, { size: 13, weight: 700, color: P.soft });
    return a;
  };

  /** A line of the Runtime Log; o.level: INFO (the default) or ERROR. */
  C.log = (parent, x, y, str, o = {}) => {
    const w = o.w || 380;
    const a = C.group(parent, x, y);
    rect(a, -w / 2, -19, w, 38, { r: 7, fill: '#0b0f1c', stroke: P.ink, sw: 2.5 });
    C.text(a, -w / 2 + 12, 1, o.level || 'INFO', { anchor: 'start', size: 13.5, weight: 700, color: o.level === 'ERROR' ? P.red : P.greenLight, font: FONT.mono });
    a.line = C.text(a, -w / 2 + (o.level === 'ERROR' ? 68 : 60), 1, str, { anchor: 'start', size: 14.5, weight: 600, color: P.cream, font: FONT.mono });
    return a;
  };

  /** A mail on its way: a closed envelope; o: w, label (written on it), fill. */
  C.envelope = (parent, x, y, o = {}) => {
    const w = o.w || 84;
    const h = w * 0.64;
    const a = C.group(parent, x, y);
    rect(a, -w / 2, -h / 2, w, h, { r: 5, fill: o.fill || P.cream, stroke: P.ink, sw: 3 });
    path(a, `M${-w / 2 + 2} ${-h / 2 + 3} L0 ${h * 0.1} L${w / 2 - 2} ${-h / 2 + 3}`, { stroke: P.ink, sw: 2.5 });
    if (o.label) a.label = C.text(a, 0, h / 2 + 15, o.label, { size: o.size || 13.5, weight: 700, color: P.cream });
    return a;
  };

  /**
   * An arrow from one point to another, drawn by `draw`: its line (tween with C.draw) and its
   * head, which shows when the line is there. o: color, width.
   */
  C.arrow = (parent, x1, y1, x2, y2, o = {}) => {
    const color = o.color || P.cream;
    const a = C.line(parent, `M${x1} ${y1} L${x2} ${y2}`, { color, width: o.width || 4 });
    const tip = C.group(parent, 0, 0);
    head(tip, x2, y2, (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI, color, o.head || 13);
    a.tip = tip;
    return a;
  };

  // ---- moves ------------------------------------------------------------------------------
  C.pop = (a, at, o = {}) => {
    const s = o.s ?? a.s ?? 1;
    tl.set(a, { s: s * 0.45 }, at);
    tl.to(a, { o: o.o ?? 1 }, at, 0.12, 'linear');
    tl.to(a, { s }, at, o.dur || 0.42, 'back');
  };
  C.fadeIn = (a, at, dur = 0.4) => tl.to(a, { o: 1 }, at, dur, 'linear');
  C.fadeOut = (a, at, dur = 0.35) => tl.to(a, { o: 0 }, at, dur, 'linear');
  C.dim = (a, at, o = 0.3, dur = 0.4) => tl.to(a, { o }, at, dur, 'linear');
  C.move = (a, x, y, at, dur = 0.8, ease = 'inOut') => tl.to(a, { x, y }, at, dur, ease);
  C.pulse = (a, at, amount = 1.14, dur = 0.5) => tl.to(a, { s: (a.s ?? 1) * amount }, at, dur, 'bump');
  C.shake = (a, at) => {
    tl.to(a, { r: -9 }, at, 0.08, 'linear');
    tl.to(a, { r: 8 }, at + 0.08, 0.14, 'linear');
    tl.to(a, { r: -5 }, at + 0.22, 0.12, 'linear');
    tl.to(a, { r: 0 }, at + 0.34, 0.1, 'linear');
  };
  C.draw = (line, at, dur = 0.7) => {
    tl.to(line, { d: 0 }, at, dur, 'inOut');
    if (line.tip) tl.to(line.tip, { o: 1 }, at + dur * 0.8, 0.15, 'linear');
  };
  C.say = (textActor, str, at) => tl.set(textActor, { text: str }, at);
  /** Types `str` into a text, a character at a time. */
  C.type = (textActor, str, at, cps = 16) => {
    const chars = [...String(str)];
    chars.forEach((_, i) => tl.set(textActor, { text: chars.slice(0, i + 1).join('') }, at + i / cps));
    return at + chars.length / cps;
  };
  /** An actor along the given stage points, a segment at a time. */
  C.travel = (actor, points, at, perSegment = 0.6) => {
    points.forEach((p, i) => tl.to(actor, { x: p.x, y: p.y }, at + i * perSegment, perSegment, i === points.length - 1 ? 'out' : 'linear'));
    return at + points.length * perSegment;
  };

  // ---- a token through a process (C.proc), as a run looks in the tutorial ----
  /** The process starts (or goes on) at step i: it lights up. */
  C.enter = (proc, i, at) => {
    tl.set(proc.node(i), { state: 'active' }, at);
    C.pulse(proc.node(i), at, 1.1, 0.4);
    return at;
  };
  /**
   * The token goes from step to step: hops [i, j, k, …] along their connectors, `per` seconds
   * each. What it leaves turns green with its counter, the connector too, what it reaches
   * lights up. o.hold: the token stops at the end of the last connector and stays (a gateway
   * that waits); use arrive for when it goes in. o.quiet: for the second of two tokens that
   * leave a step together.
   */
  C.run = (proc, tok, hops, at, per = 0.8, o = {}) => {
    let t = at;
    for (let n = 1; n < hops.length; n++) {
      const from = hops[n - 1];
      const to = hops[n];
      const pts = proc.route(from, to);
      const fromNode = proc.node(from);
      // o.quiet: a second token leaving the same step at the same time does not count it again
      if (o.quiet) { /* the first token marked it */ } else if (Number.isInteger(from)) {
        proc.counts[from] += 1;
        tl.set(fromNode, { state: 'done', count: proc.counts[from] }, t);
      } else tl.set(fromNode, { state: 'done' }, t);
      tl.set(tok, { x: pts[0].x, y: pts[0].y, s: proc.S }, t);
      tl.to(tok, { o: 1 }, t, 0.1, 'linear');
      const lens = pts.slice(1).map((p, k) => Math.hypot(p.x - pts[k].x, p.y - pts[k].y));
      const total = lens.reduce((sum, l) => sum + l, 0) || 1;
      let tt = t;
      pts.slice(1).forEach((p, k) => {
        const d = (per * lens[k]) / total;
        tl.to(tok, { x: p.x, y: p.y }, tt, d, 'linear');
        tt += d;
      });
      t += per;
      tl.set(proc.edge(from, to), { state: 'done' }, t);
      const last = n === hops.length - 1;
      if (last && o.hold) break;
      tl.to(tok, { o: 0 }, t, 0.25, 'linear');
      tl.set(proc.node(to), { state: 'active' }, t);
      C.pulse(proc.node(to), t, 1.1, 0.4);
      if (!last) t += o.dwell ?? 0.35;
    }
    return t;
  };
  /** Tokens that were held at step i go in: they fade, the step lights up. */
  C.arrive = (proc, toks, i, at) => {
    [].concat(toks).forEach(tok => tl.to(tok, { o: 0 }, at, 0.25, 'linear'));
    tl.set(proc.node(i), { state: 'active' }, at);
    C.pulse(proc.node(i), at, 1.12, 0.4);
    return at;
  };
  /** Step i has run (an end is reached, a task is done): green, with its counter. */
  C.finish = (proc, i, at) => {
    if (Number.isInteger(i)) {
      proc.counts[i] += 1;
      tl.set(proc.node(i), { state: 'done', count: proc.counts[i] }, at);
    } else tl.set(proc.node(i), { state: 'done' }, at);
    return at;
  };

  return C;
}
