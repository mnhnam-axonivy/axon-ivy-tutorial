/**
 * The puzzle game, drawn with three.js (src/puzzle/gl.js): a brief, an empty process in the
 * Designer's editor, and exactly the elements the answer needs. The player drags the elements
 * onto the process, connects them and sets their fields in the inscription, then presses
 * Finish:
 *   right   the solved process runs once, token and people and all (src/puzzle/run.js)
 *   wrong   every element that is not right turns red; selecting one says which connector or
 *           which field is wrong, and why
 *
 * How it is played:
 *   drag an element from the palette onto the board      it is placed (snapped to the grid)
 *   drag a placed element                                 it moves; back onto the palette: taken out
 *   drag from an element's blue arrow to another element  a connector (or click the arrow, then
 *                                                         the element)
 *   click an element                                      its inscription: its fields as chips
 *   click a connector                                     select it; × or Delete removes it
 *
 * createGame(canvas, cfg) → { resize(w, h), key(event), destroy(), api }
 *   cfg: puzzle (its structure), texts (its texts in this language), vocab (the names every
 *        puzzle shares: element kinds, fields, options), ui(key, …args), nodeName, cast, castNames,
 *        reduced, onSolved(), onClose(), onSay(text), onMode(mode)
 *   api: what the browser check uses to find things on the canvas and to read the game.
 *
 * Everything is laid out again when the stage changes size. On a wide stage the palette, the
 * board and the inscription are beside each other. On a narrow one (a phone) the board has the
 * width to itself and one panel under it shows the palette while nothing is selected and the
 * inscription of what is: nothing is selected by itself there, so the palette stays in reach.
 */
import { makeStage, Node, LAYER } from './gl.js';
import { makePainter, U } from './paint.js';
import { buildRun } from './run.js';
import { D } from '../cast.js';
import { FONT } from '../stage.js';
import * as M from './model.js';

const TAB = 26; // the editor's tab bar

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const fillIn = (text, args) => String(text).replace(/\{(\d+)\}/g, (m, n) => (n in args ? args[n] : m));
const inside = (r, x, y) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

/** The same shuffle every time for the same puzzle, and never the order of the answer. */
function shuffled(ids, seedText) {
  let seed = [...seedText].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const next = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  const out = [...ids];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  if (out.length > 1 && out.every((id, i) => id === ids[i])) out.push(out.shift());
  return out;
}

export function createGame(canvas, cfg) {
  const { puzzle, texts, vocab, ui, cast = {}, castNames = {}, reduced = false } = cfg;
  const options = (typeof window !== 'undefined' && window.ivyTrainingOptions) || {};
  const pace = options.filmPace || 1;
  const RUN_RATE = 1.2; // the solved process runs 20% faster than its timeline says
  const dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
  const stage = makeStage(canvas, { dpr, background: U.bg });
  const paint = makePainter(dpr);

  const kindName = id => vocab.kinds[M.elementOf(puzzle, id).kind];
  const nameOf = id => texts.names[id] || kindName(id);
  /** A field's label; one about a way out names where it leads (with `nth`: the player's nth connector, or … until it is drawn). */
  const fieldLabel = (f, el) => {
    const to = f.to || (f.nth ? M.nthOut(state, el, f.nth) : null);
    return fillIn(vocab.fields[f.label || f.id] || f.id, [to ? nameOf(to) : f.nth ? '…' : '']);
  };
  const optionLabel = key => vocab.options[key] ?? key;
  const paletteOrder = shuffled(puzzle.elements.map(e => e.id), puzzle.file + puzzle.elements.map(e => e.id).join());

  let state = M.newState(puzzle);
  let mode = 'edit'; // edit, review (wrong: the errors are shown), run, solved
  let selected = null; // { type: 'el', id } or { type: 'link', from, to }
  let errors = [];
  let pending = null; // the element a connector is being drawn from, click by click
  let press = null;
  let drag = null;
  let hover = null; // the element a new connector would end on
  let L = null; // where everything is on the stage
  let run = null;
  let runTime = 0;
  let dirty = true;
  let raf = 0;
  let last = 0;
  let said = null;
  let status = { text: '', tone: 'muted' };
  const tweens = [];
  const els = new Map(); // id → { node, port, mark, shadow }
  const lines = new Map(); // 'from>to' → line node
  const pals = new Map(); // id → { node, at, mark }
  const images = new Map();
  const g = {};
  let hits = [];
  let inscHits = [];
  let overHits = [];

  const setMode = next => {
    if (mode === next) return;
    mode = next;
    if (cfg.onMode) cfg.onMode(mode);
  };
  const say = text => {
    if (text === said) return;
    said = text;
    if (cfg.onSay) cfg.onSay(text);
  };

  // ---- images ------------------------------------------------------------------------------
  const elImage = (id, st = 'idle', count = 0, k = L.S) => {
    const key = [id, st, count, k].join('|');
    if (!images.has(key)) images.set(key, paint.element(M.elementOf(puzzle, id).kind, texts.names[id] || '', { state: st, count, k }));
    return images.get(key);
  };
  /** How much room an element takes in the palette: its shape, and an event's name under it. */
  const footprint = id => {
    const img = elImage(id, 'idle', 0, 1);
    const [, h] = M.sizeOf(M.elementOf(puzzle, id).kind);
    return { w: img.w - 24, h: img.h - 24, shapeH: h };
  };
  const tween = (node, props, dur = 0.25, ease = 'out', done = null) => {
    const from = {};
    for (const key of Object.keys(props)) from[key] = node[key];
    tweens.push({ node, from, to: props, dur, t: 0, ease, done });
  };
  const EASE = { out: t => 1 - Math.pow(1 - t, 3), linear: t => t, shake: t => Math.sin(t * Math.PI * 5) * (1 - t) };

  // ---- layout ------------------------------------------------------------------------------
  /** The palette's elements in rows no wider than `width`, each row in the middle. */
  function flow(width, ps, gap) {
    const rows = [[]];
    let x = 0;
    for (const id of paletteOrder) {
      const f = footprint(id);
      const fw = f.w * ps;
      if (rows[rows.length - 1].length && x + fw > width) {
        rows.push([]);
        x = 0;
      }
      rows[rows.length - 1].push({ id, x, fw, fh: f.h * ps, shapeH: f.shapeH * ps });
      x += fw + gap;
    }
    const at = {};
    let y = 0;
    for (const row of rows) {
      const used = row.reduce((sum, it) => sum + it.fw, 0) + (row.length - 1) * gap;
      const rowH = Math.max(...row.map(it => it.fh));
      const shape = Math.max(...row.map(it => it.shapeH));
      for (const it of row) at[it.id] = { x: (width - used) / 2 + it.x + it.fw / 2, y: y + shape / 2, w: it.fw, h: it.fh, shapeH: it.shapeH };
      y += rowH + gap;
    }
    return { at, h: y - gap };
  }

  function computeLayout() {
    const W = stage.width;
    const H = stage.height;
    const narrow = W < 820;
    const pad = narrow ? 10 : 16;
    const maxW = Math.min(W, 1560);
    const x0 = (W - maxW) / 2 + pad;
    const x1 = (W + maxW) / 2 - pad;
    const full = x1 - x0;
    const closeD = 36;
    const textW = full - closeD - 16;
    const head = {
      kicker: paint.label((ui('pzKicker') + ' · ' + cfg.nodeName).toLocaleUpperCase(cfg.lang), { size: 11.5, weight: 700, color: U.accentSoft, family: FONT.mono, rich: false, maxW: textW, maxLines: 1 }),
      title: paint.label(texts.title, { size: narrow ? 19 : 23, weight: 800, color: U.text, maxW: textW, rich: false }),
      brief: paint.label(texts.brief, { size: narrow ? 14 : 15.5, weight: 500, color: '#c5cbd8', bold: '#ffffff', maxW: Math.min(textW, 940) })
    };
    const headH = head.kicker.h + 4 + head.title.h + 6 + head.brief.h;
    const barH = narrow ? 44 : 46;
    const top = pad + headH + 12;
    const bottom = H - pad - barH - 10;
    const gap = 12;
    let palette;
    let insc;
    let frame;
    let ps;
    let slots;
    if (!narrow) {
      const palW = 184;
      const inscW = clamp(Math.round(W * 0.25), 290, 350);
      palette = { x: x0, y: top, w: palW, h: bottom - top };
      insc = { x: x1 - inscW, y: top, w: inscW, h: bottom - top };
      frame = { x: x0 + palW + gap, y: top, w: full - palW - inscW - gap * 2, h: bottom - top };
      for (ps of [1, 0.9, 0.8, 0.7, 0.6]) {
        slots = flow(palW - 24, ps, 12);
        if (slots.h <= palette.h - 62) break;
      }
    } else {
      const sheetH = clamp(Math.round((bottom - top) * 0.3), 150, 230);
      insc = { x: x0, y: bottom - sheetH, w: full, h: sheetH };
      palette = insc; // the same place: the elements, while nothing is selected
      frame = { x: x0, y: top, w: full, h: insc.y - gap - top };
      for (ps of [0.66, 0.6, 0.54, 0.48]) {
        slots = flow(full - 20, ps, 10);
        if (slots.h <= sheetH - 40) break;
      }
    }
    for (const r of [palette, insc, frame]) for (const key of ['x', 'y', 'w', 'h']) r[key] = Math.round(r[key]);
    const board = { x: frame.x, y: frame.y + TAB, w: frame.w, h: frame.h - TAB };
    // the board's scale, such that one step of the dot grid is a whole number of screen pixels
    const unit = M.GRID * dpr;
    const S = Math.round(clamp(Math.min(board.w / 640, board.h / 300), 0.7, 1.35) * unit) / unit;
    return {
      W, H, narrow, pad, x0, x1, full, head, headH, top, bottom, barH, palette, insc, frame, board, S, ps, slots,
      logical: { w: board.w / S, h: board.h / S },
      close: { x: x1 - closeD / 2, y: pad + closeD / 2, d: closeD },
      bar: { x: x0, y: H - pad - barH, w: full, h: barH }
    };
  }

  /** On a narrow stage the palette shares its place with the inscription. */
  const paletteShown = () => !L.narrow || (!selected && puzzle.elements.some(e => !state.placed[e.id]));
  const toBoard = (x, y) => ({ x: (x - L.board.x) / L.S, y: (y - L.board.y) / L.S });
  const toStage = (x, y) => ({ x: L.board.x + x * L.S, y: L.board.y + y * L.S });

  // ---- drawing -----------------------------------------------------------------------------
  const group = (parent, props) => {
    const n = new Node(props);
    parent.add(n);
    return n;
  };
  const put = (parent, image, x, y, layer, props = {}) => {
    const n = stage.sprite(image, { x, y, order: layer, ...props });
    parent.add(n);
    return n;
  };

  function build() {
    stage.root.clear();
    els.clear();
    lines.clear();
    pals.clear();
    images.clear();
    L = computeLayout();
    // what is on the board has to stay on it, whatever size the board has now
    for (const [id, p] of Object.entries(state.placed)) M.place(puzzle, state, id, p.x, p.y, L.logical);

    // the brief
    g.head = group(stage.root);
    let y = L.pad;
    put(g.head, L.head.kicker, L.x0, y, LAYER.ui);
    y += L.head.kicker.h + 4;
    put(g.head, L.head.title, L.x0, y, LAYER.ui);
    y += L.head.title.h + 6;
    put(g.head, L.head.brief, L.x0, y, LAYER.ui);
    // behind the brief while the solved process runs: the editor is the whole floor then
    g.backdrop = stage.quad(U.bg, L.W, L.top - 4, { x: 0, y: 0, order: LAYER.run + 10, o: 0 });
    stage.root.add(g.backdrop);
    put(stage.root, paint.mark('×', { d: L.close.d, fill: U.panel2, stroke: U.line, color: U.text }), L.close.x, L.close.y, LAYER.top);

    // the palette
    g.palette = group(stage.root);
    put(g.palette, paint.panel(L.palette.w, L.palette.h), L.palette.x, L.palette.y, LAYER.panel);
    put(g.palette, paint.label(ui('pzElements').toLocaleUpperCase(cfg.lang), { size: 11, weight: 700, color: U.muted, family: FONT.mono, rich: false }), L.palette.x + 12, L.palette.y + 10, LAYER.ui);
    if (!L.narrow) put(g.palette, paint.label(ui('pzDragHint'), { size: 12, color: U.muted, maxW: L.palette.w - 24, rich: false }), L.palette.x + 12, L.palette.y + 26, LAYER.ui);
    const slotX = L.palette.x + (L.narrow ? 10 : 12);
    const slotY = L.palette.y + (L.narrow ? 30 : 62);
    for (const id of paletteOrder) {
      const at = { ...L.slots.at[id] };
      at.x += slotX;
      at.y += slotY;
      const node = put(g.palette, elImage(id, 'idle', 0, L.ps), at.x, at.y, LAYER.el, { s: L.ps });
      const mark = put(g.palette, paint.mark('!', { d: 16 }), at.x - at.w / 2 + 2, at.y - at.shapeH / 2 + 1, LAYER.mark, { o: 0 });
      pals.set(id, { node, at, mark });
    }

    // the editor: a tab bar, the dotted canvas, and what is on it. It tilts as one when the
    // solved process runs: `tilt` is the board's middle, `content` its top left.
    g.tilt = group(stage.root, { x: L.board.x + L.board.w / 2, y: L.board.y + L.board.h / 2, s: L.S });
    const k = 1 / L.S;
    put(g.tilt, paint.panel(L.frame.w, L.frame.h, { fill: D.canvas, stroke: D.line, r: 8, sw: 1.5 }), (-L.frame.w / 2) * k, (-L.board.h / 2 - TAB) * k, LAYER.panel, { s: k });
    put(g.tilt, paint.tabBar(L.frame.w - 3, puzzle.file), (-L.frame.w / 2 + 1.5) * k, (-L.board.h / 2 - TAB + 1.5) * k, LAYER.panel, { s: k });
    const grid = stage.tiled(paint.dots(M.GRID, L.S), L.logical.w - 4 * k, L.logical.h - 4 * k, { x: -L.logical.w / 2 + 2 * k, y: -L.logical.h / 2, order: LAYER.grid });
    g.tilt.add(grid);
    g.content = group(g.tilt, { x: -L.logical.w / 2, y: -L.logical.h / 2 });
    g.empty = put(g.content, paint.label(ui('pzEmpty'), { size: 15 * k, weight: 600, color: '#6f7480', rich: false, align: 'center' }), L.logical.w / 2, L.logical.h / 2 - 10 * k, LAYER.grid);
    g.shadows = group(g.content);
    g.links = group(g.content);
    g.els = group(g.content);
    g.marks = group(g.content);
    g.run = group(g.content);

    // the inscription, the bar, and what lies over everything
    g.insc = group(stage.root);
    g.bar = group(stage.root);
    g.over = group(stage.root);
    drawBar();
    syncBoard();
    drawInsc();
    dirty = true;
  }

  function drawBar() {
    g.bar.clear();
    const r = L.bar;
    const small = L.narrow;
    const reset = paint.button(small ? '↺' : '↺ ' + ui('pzReset'), { h: r.h, size: small ? 18 : 15, padX: small ? 14 : 18 });
    const finish = paint.button(ui('pzFinish'), { h: r.h, size: small ? 15 : 16, kind: 'primary', padX: small ? 18 : 28 });
    put(g.bar, reset, r.x, r.y, LAYER.ui);
    g.finish = put(g.bar, finish, r.x + r.w - finish.w, r.y, LAYER.ui);
    const room = r.w - reset.w - finish.w - 28;
    const text = status.text || hint();
    const tone = status.text ? status.tone : 'muted';
    const label = paint.label(text, { size: small ? 12.5 : 14, weight: 600, color: tone === 'bad' ? '#ff9aa8' : tone === 'good' ? U.good : U.muted, maxW: Math.max(60, room), maxLines: 2, rich: false });
    put(g.bar, label, r.x + reset.w + 14, r.y + (r.h - label.h) / 2, LAYER.ui);
    L.buttons = {
      reset: { x: r.x, y: r.y, w: reset.w, h: r.h },
      finish: { x: r.x + r.w - finish.w, y: r.y, w: finish.w, h: r.h }
    };
    say(text);
    dirty = true;
  }

  /** What to do next, while nothing else is to be said. */
  function hint() {
    if (pending) return ui('pzHintLink');
    const placed = Object.keys(state.placed).length;
    if (placed < puzzle.elements.length) return ui('pzHintDrag');
    if (state.links.length < puzzle.flow.length) return ui('pzHintConnect');
    return ui('pzHintFields');
  }
  const setStatus = (text = '', tone = 'muted') => {
    status = { text, tone };
    drawBar();
  };

  const errorsOf = id => errors.filter(e => e.el === id);
  const aboutLink = (e, from, to) => e.el === from && (e.code === 'wrongNext' || e.code === 'rowOrder') && e.to === to;
  const linkWrong = (from, to) => errors.some(e => aboutLink(e, from, to));
  function errorText(e) {
    if (e.code === 'notPlaced') return ui('pzNotPlaced');
    if (e.code === 'noPrev') return ui('pzNoPrev');
    const why = (texts.next && texts.next[e.el]) || '';
    if (e.code === 'noNext') return (ui('pzNoNext') + ' ' + why).trim();
    if (e.code === 'wrongNext') return (ui('pzWrongNext', nameOf(e.to)) + ' ' + why).trim();
    if (e.code === 'missingPath') return (ui('pzMissingPath') + ' ' + why).trim();
    if (e.code === 'rowOrder') return ui('pzRowOrder', nameOf(e.to));
    const reasons = (texts.why && texts.why[M.fieldKey(e.el, e.field)]) || {};
    return reasons[e.value] || reasons['*'] || ui('pzWrongValue');
  }

  /** The state an element is drawn in while the player builds. */
  const lookOf = id => (hover === id ? 'target' : selected && selected.type === 'el' && selected.id === id ? 'selected' : errorsOf(id).length ? 'error' : 'idle');
  const portOf = id => {
    const p = state.placed[id];
    const [w] = M.sizeOf(M.elementOf(puzzle, id).kind);
    return { x: p.x + w / 2 + 12, y: p.y };
  };
  const showsPort = id => {
    if (mode !== 'edit' && mode !== 'review') return false;
    const e = M.elementOf(puzzle, id);
    if (e.kind === 'end' || !state.placed[id] || (drag && drag.live)) return false;
    return M.manyOut(e.kind) || !M.outsOf(state, id).length || (selected && selected.type === 'el' && selected.id === id);
  };

  /** Brings the board in line with what the player has built. */
  function syncBoard() {
    const editing = mode === 'edit' || mode === 'review';
    for (const e of puzzle.elements) {
      const p = state.placed[e.id];
      let it = els.get(e.id);
      if (!p) {
        if (it) {
          for (const n of [it.node, it.port, it.mark, it.shadow]) n.dispose();
          els.delete(e.id);
        }
      } else {
        if (!it) {
          it = {
            shadow: put(g.shadows, paint.shadow(e.kind), p.x, p.y, LAYER.shadow, { o: 0 }),
            node: put(g.els, elImage(e.id), p.x, p.y, LAYER.el, { st: 'idle', count: 0 }),
            port: put(g.marks, paint.mark('→', { d: 17, fill: U.accent, stroke: D.canvas }), 0, 0, LAYER.port),
            mark: put(g.marks, paint.mark('!', { d: 17 }), 0, 0, LAYER.mark)
          };
          els.set(e.id, it);
        }
        const [w, h] = M.sizeOf(e.kind);
        it.node.set({ x: p.x, y: p.y });
        it.shadow.set({ x: p.x + 3, y: p.y + 5 });
        if (editing) it.node.show(elImage(e.id, lookOf(e.id)));
        const port = portOf(e.id);
        it.port.set({ x: port.x, y: port.y, o: showsPort(e.id) ? 1 : 0, s: pending === e.id ? 1.25 : 1 });
        it.mark.set({ x: p.x - w / 2 + 3, y: p.y - h / 2 + 3, o: editing && errorsOf(e.id).length ? 1 : 0 });
      }
      const pal = pals.get(e.id);
      const picked = selected && selected.type === 'el' && selected.id === e.id;
      pal.node.set({ o: p || (drag && drag.live && drag.kind === 'new' && drag.id === e.id) ? 0 : 1 });
      if (!p) pal.node.show(elImage(e.id, picked ? 'selected' : errorsOf(e.id).length ? 'error' : 'idle', 0, L.ps));
      pal.mark.set({ o: !p && errorsOf(e.id).length ? 1 : 0 });
    }
    if (editing) g.palette.set({ o: paletteShown() ? 1 : 0 });
    // connectors
    const want = new Set(state.links.map(l => l.from + '>' + l.to));
    for (const [key, node] of lines) {
      if (!want.has(key)) {
        node.dispose();
        lines.delete(key);
      }
    }
    for (const l of state.links) {
      const key = l.from + '>' + l.to;
      let node = lines.get(key);
      if (!node) {
        node = stage.line({ order: LAYER.link, width: Math.max(1, 1 / L.S), tint: 'idle' });
        node.bind('tint', v => node.color(v === 'done' ? D.done : v === 'selected' ? U.accentSoft : v === 'wrong' ? U.bad : D.stroke));
        g.links.add(node);
        lines.set(key, node);
      }
      node.points(M.route(puzzle, state, l.from, l.to));
      if (editing) node.set({ tint: selected && selected.type === 'link' && selected.from === l.from && selected.to === l.to ? 'selected' : linkWrong(l.from, l.to) ? 'wrong' : 'idle' });
    }
    // the × on the selected connector
    if (g.unlink) {
      g.unlink.dispose();
      g.unlink = null;
    }
    L.unlink = null;
    if (editing && selected && selected.type === 'link' && lines.has(selected.from + '>' + selected.to)) {
      const pts = M.route(puzzle, state, selected.from, selected.to);
      const mid = M.along(pts, M.lengthOf(pts) / 2);
      g.unlink = put(g.marks, paint.mark('×', { d: 19 }), mid.x, mid.y, LAYER.mark);
      L.unlink = mid;
    }
    g.empty.set({ o: Object.keys(state.placed).length || !editing ? 0 : 1 });
    rebuildHits();
    dirty = true;
  }

  /**
   * The inscription: what the selected element is, what is wrong with it (after a wrong
   * Finish) and its fields, each a row of chips. Nothing selected: how to play, or the list of
   * what is still wrong.
   */
  function drawInsc() {
    g.insc.clear();
    inscHits = [];
    const r = L.insc;
    const padX = 14;
    const innerW = r.w - padX * 2;
    const rows = [];
    let y = 12;
    const add = (image, o = {}) => {
      rows.push({ image, x: o.x || 0, y, hit: o.hit });
      y += image.h + (o.gap ?? 8);
    };
    const text = (str, o = {}) => add(paint.label(str, { size: 13.5, color: U.text, maxW: innerW, ...o }), o);
    const note = str => add(paint.label('⚠ ' + str, { size: 13, weight: 600, color: '#ffb1bc', bold: '#ffffff', maxW: innerW }), { gap: 10 });
    const kicker = str => text(str.toLocaleUpperCase(cfg.lang), { size: 11, weight: 700, color: U.muted, family: FONT.mono, rich: false, gap: 4 });
    /** Chips next to each other, on as many lines as they need. */
    const chips = (list, gapAfter = 12) => {
      let x = 0;
      let rowH = 0;
      list.forEach(({ image, hit }) => {
        if (x && x + image.w > innerW) {
          x = 0;
          y += rowH + 6;
          rowH = 0;
        }
        rows.push({ image, x, y, hit });
        x += image.w + 6;
        rowH = Math.max(rowH, image.h);
      });
      y += rowH + gapAfter;
    };
    const small = L.narrow;
    const hidden = mode === 'run' || mode === 'solved' || (L.narrow && paletteShown());

    if (hidden) {
      // the run has the stage to itself
    } else if (selected && selected.type === 'el') {
      const e = M.elementOf(puzzle, selected.id);
      const placed = !!state.placed[e.id];
      kicker(vocab.kinds[e.kind]);
      text(nameOf(e.id), { size: small ? 16 : 18, weight: 800, rich: false, gap: 6 });
      if (!small || !(e.fields || []).length) text(vocab.about[e.kind], { size: 13, color: U.muted, gap: 12 });
      for (const err of errorsOf(e.id).filter(x => x.code !== 'field')) note(errorText(err));
      if (!placed) text(ui('pzDragIt'), { size: 13.5, weight: 600, color: U.accentSoft });
      else {
        for (const f of e.fields || []) {
          const key = M.fieldKey(e.id, f.id);
          const err = errors.find(x => x.el === e.id && x.code === 'field' && x.field === f.id);
          text(fieldLabel(f, e.id), { size: 12.5, weight: 700, color: err ? '#ff9aa8' : '#c5cbd8', rich: false, gap: 6 });
          chips(f.options.map(option => ({
            image: paint.chip(optionLabel(option), { selected: state.values[key] === option, error: !!err && state.values[key] === option, h: small ? 28 : 30 }),
            hit: { type: 'chip', el: e.id, field: f.id, option }
          })), err ? 6 : 12);
          if (err) note(errorText(err));
        }
        if (!(e.fields || []).length) text(ui('pzNothing'), { size: 13, color: U.muted, gap: 12 });
        // an Alternative's rows, as its Condition tab lists them: one per exit, in the order drawn
        const exits = M.outsOf(state, e.id);
        if (e.kind === 'alternative' && exits.length > 1) text(ui('pzRows', exits.map((l, i) => (i + 1) + '. ' + nameOf(l.to)).join('  ·  ')), { size: 12.5, color: U.muted, rich: false, gap: 12 });
        const back =paint.button('↩ ' + ui('pzRemove'), { h: 32, size: 13, padX: 12 });
        add(back, { hit: { type: 'btn', name: 'remove' } });
      }
    } else if (selected && selected.type === 'link') {
      kicker(ui('pzConnector'));
      text(nameOf(selected.from) + '  →  ' + nameOf(selected.to), { size: 15, weight: 700, rich: false, gap: 10 });
      for (const err of errors.filter(x => aboutLink(x, selected.from, selected.to))) note(errorText(err));
      add(paint.button('× ' + ui('pzUnlink'), { h: 32, size: 13, padX: 12, kind: 'danger' }), { hit: { type: 'btn', name: 'unlink' } });
    } else if (mode === 'review' && errors.length) {
      kicker(ui('pzNotRight'));
      text(ui('pzPickRed'), { size: 13, color: U.muted, gap: 10 });
      const ids = [...new Set(errors.map(e => e.el))];
      chips(ids.map(id => ({ image: paint.chip(nameOf(id), { selected: true, error: true, h: small ? 28 : 30 }), hit: { type: 'pick', id } })));
    } else {
      kicker(ui('pzHow'));
      ['pzHow1', 'pzHow2', 'pzHow3', 'pzHow4'].forEach((key, i) => text((i + 1) + '  ' + ui(key), { size: small ? 12.5 : 13.5, color: '#c5cbd8', gap: small ? 4 : 9 }));
    }

    const height = L.narrow ? clamp(y + 6, r.h, Math.round(L.H * 0.62)) : r.h;
    const top = r.y + r.h - height;
    L.inscNow = hidden ? null : { x: r.x, y: top, w: r.w, h: height };
    if (!hidden) {
      put(g.insc, paint.panel(r.w, height), r.x, top, LAYER.over);
      if (L.narrow && selected) {
        // a way back to the palette
        put(g.insc, paint.mark('×', { d: 24, fill: U.panel2, stroke: U.line, color: U.text }), r.x + r.w - 20, top + 20, LAYER.over + 1);
        inscHits.push({ type: 'btn', name: 'deselect', x: r.x + r.w - 38, y: top + 2, w: 36, h: 36 });
      }
      for (const row of rows) {
        put(g.insc, row.image, r.x + padX + row.x, top + row.y, LAYER.over + 1);
        if (row.hit) inscHits.push({ ...row.hit, x: r.x + padX + row.x, y: top + row.y, w: row.image.w, h: row.image.h });
      }
    }
    rebuildHits();
    dirty = true;
  }

  // ---- what is where, for the pointer --------------------------------------------------------
  function rebuildHits() {
    hits = [];
    const c = L.close;
    if (mode === 'edit' || mode === 'review') {
      hits.push({ type: 'board', ...L.board });
      for (const e of puzzle.elements) {
        const p = state.placed[e.id];
        if (!p) continue;
        const [w, h] = M.sizeOf(e.kind);
        const at = toStage(p.x, p.y);
        hits.push({ type: 'el', id: e.id, x: at.x - (w / 2 + 3) * L.S, y: at.y - (h / 2 + 3) * L.S, w: (w + 6) * L.S, h: (h + 6) * L.S });
      }
      for (const e of puzzle.elements) {
        if (!showsPort(e.id)) continue;
        const port = portOf(e.id);
        const at = toStage(port.x, port.y);
        hits.push({ type: 'port', id: e.id, x: at.x - 13, y: at.y - 13, w: 26, h: 26 });
      }
      if (L.unlink) {
        const at = toStage(L.unlink.x, L.unlink.y);
        hits.push({ type: 'btn', name: 'unlink', x: at.x - 13, y: at.y - 13, w: 26, h: 26 });
      }
      if (paletteShown()) hits.push({ type: 'palette', ...L.palette });
      for (const [id, pal] of pals) {
        if (state.placed[id] || !paletteShown()) continue;
        const w = Math.max(pal.at.w, 34);
        const h = Math.max(pal.at.h, 34);
        hits.push({ type: 'pal', id, x: pal.at.x - w / 2, y: pal.at.y - pal.at.shapeH / 2 - (h - pal.at.h) / 2, w, h });
      }
      if (L.inscNow) hits.push({ type: 'panel', ...L.inscNow });
      hits.push(...inscHits);
      if (L.buttons) for (const [name, rect] of Object.entries(L.buttons)) hits.push({ type: 'btn', name, ...rect });
    } else hits.push(...overHits.filter(hit => hit.when === mode));
    hits.push({ type: 'btn', name: 'close', x: c.x - c.d / 2 - 4, y: c.y - c.d / 2 - 4, w: c.d + 8, h: c.d + 8 });
  }

  function pick(x, y) {
    for (let i = hits.length - 1; i >= 0; i--) {
      const hit = hits[i];
      if (!inside(hit, x, y)) continue;
      if (hit.type === 'board') {
        // a connector is thin: anywhere near it will do
        const b = toBoard(x, y);
        let best = null;
        for (const l of state.links) {
          const d = M.distanceTo(M.route(puzzle, state, l.from, l.to), b.x, b.y);
          if (d < 8 / L.S && (!best || d < best.d)) best = { type: 'link', from: l.from, to: l.to, d };
        }
        if (best) return best;
      }
      return hit;
    }
    return null;
  }

  // ---- what the player does -------------------------------------------------------------------
  const forget = test => {
    const before = errors.length;
    errors = errors.filter(e => !test(e));
    if (!errors.length && mode === 'review') setMode('edit');
    if (errors.length !== before) status = { text: '', tone: 'muted' };
  };
  const structural = e => e.code !== 'field' && e.code !== 'notPlaced';
  const refresh = () => {
    syncBoard();
    drawInsc();
    drawBar();
  };

  function select(sel) {
    selected = sel;
    refresh();
  }

  function connect(from, to) {
    if (!M.link(puzzle, state, from, to)) return false;
    forget(e => structural(e) && (e.el === from || e.el === to));
    pending = null;
    selected = L.narrow ? null : { type: 'el', id: to };
    refresh();
    return true;
  }

  function disconnect(from, to) {
    if (!M.unlink(state, from, to)) return;
    forget(e => structural(e) && (e.el === from || e.el === to));
    if (selected && selected.type === 'link') selected = null;
    refresh();
  }

  function takeOut(id) {
    const touched = state.links.filter(l => l.from === id || l.to === id).flatMap(l => [l.from, l.to]);
    M.unplace(state, id);
    forget(e => e.el === id || (structural(e) && touched.includes(e.el)));
    if (selected && (selected.id === id || selected.from === id || selected.to === id)) selected = null;
    pending = null;
    refresh();
  }

  /** A free spot for an element at or near x, y: not on top of another one. */
  function freeSpot(id, x, y) {
    const [w, h] = M.sizeOf(M.elementOf(puzzle, id).kind);
    const taken = (px, py) => Object.entries(state.placed).some(([other, p]) => {
      if (other === id) return false;
      const [ow, oh] = M.sizeOf(M.elementOf(puzzle, other).kind);
      return Math.abs(p.x - px) < (w + ow) / 2 + 8 && Math.abs(p.y - py) < (h + oh) / 2 + 8;
    });
    const probe = { placed: {} };
    for (let ring = 0; ring < 14; ring++) {
      for (let i = 0; i < Math.max(1, ring * 8); i++) {
        const angle = ring ? (i / (ring * 8)) * Math.PI * 2 : 0;
        const p = M.place(puzzle, probe, id, x + Math.cos(angle) * ring * 24, y + Math.sin(angle) * ring * 24, L.logical);
        if (!taken(p.x, p.y)) return p;
      }
    }
    return M.place(puzzle, probe, id, x, y, L.logical);
  }

  function drop(id, x, y) {
    const at = freeSpot(id, x, y);
    state.placed[id] = at;
    forget(e => e.el === id && e.code === 'notPlaced');
    selected = L.narrow ? null : { type: 'el', id };
    refresh();
  }

  function setValue(el, field, option) {
    state.values[M.fieldKey(el, field)] = option;
    forget(e => e.el === el && e.code === 'field' && e.field === field);
    refresh();
  }

  function reset() {
    state = M.newState(puzzle);
    errors = [];
    selected = null;
    pending = null;
    status = { text: '', tone: 'muted' };
    setMode('edit');
    refresh();
  }

  function finish() {
    const result = M.check(puzzle, state);
    pending = null;
    if (result.ok) {
      errors = [];
      selected = null;
      status = { text: ui('pzCorrect'), tone: 'good' };
      if (cfg.onSolved) cfg.onSolved();
      startRun();
      return;
    }
    errors = result.errors;
    setMode('review');
    // show the first mistake; on a narrow stage not one in the palette, which would hide the palette
    const first = errors.find(e => state.placed[e.el]) || (L.narrow ? null : errors[0]);
    selected = first ? { type: 'el', id: first.el } : null;
    status = { text: errors.length === 1 ? ui('pzProblem1') : ui('pzProblems', errors.length), tone: 'bad' };
    refresh();
    tween(g.finish, { x: g.finish.x + 7 }, 0.45, 'shake');
  }

  function act(name) {
    if (name === 'close') cfg.onClose && cfg.onClose();
    else if (name === 'finish') finish();
    else if (name === 'reset') reset();
    else if (name === 'remove' && selected && selected.type === 'el') takeOut(selected.id);
    else if (name === 'unlink' && selected && selected.type === 'link') disconnect(selected.from, selected.to);
    else if (name === 'deselect') select(null);
    else if (name === 'skip' && run) runTime = run.duration;
    else if (name === 'again' && run) {
      runTime = 0;
      setMode('run');
      rebuildHits();
    } else if (name === 'done') cfg.onClose && cfg.onClose();
  }

  // ---- the run --------------------------------------------------------------------------------
  function makeRun() {
    g.over.clear();
    g.run.clear();
    run = buildRun({
      stage, paint, puzzle, state, texts, vocab, ui, cast, castNames, L, g, els, lines, elImage, put, group, reduced,
      panels: [g.palette, g.insc, g.bar], backdrop: g.backdrop
    });
    overHits = run.hits;
  }
  function startRun() {
    setMode('run');
    hover = null;
    drag = null;
    syncBoard();
    drawInsc();
    makeRun();
    runTime = reduced ? run.duration : 0;
    run.tl.seek(runTime);
    rebuildHits();
    dirty = true;
  }

  // ---- the pointer ----------------------------------------------------------------------------
  const where = e => {
    const box = canvas.getBoundingClientRect();
    return { x: ((e.clientX - box.left) / box.width) * stage.width, y: ((e.clientY - box.top) / box.height) * stage.height };
  };
  const editing = () => mode === 'edit' || mode === 'review';

  function onDown(e) {
    if (e.button > 0) return;
    const p = where(e);
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* the pointer is already gone */ }
    press = { hit: pick(p.x, p.y), x: p.x, y: p.y, pointer: e.pointerId };
    drag = null;
    e.preventDefault();
  }

  function beginDrag(p) {
    const hit = press.hit;
    if (!hit || !editing()) return;
    if (hit.type === 'pal') {
      drag = { kind: 'new', id: hit.id, live: true, ghost: put(g.over, elImage(hit.id, 'selected'), p.x, p.y, LAYER.top, { s: L.S * 1.06, o: 0.95 }) };
      pending = null;
      syncBoard();
    } else if (hit.type === 'el') {
      const at = toStage(state.placed[hit.id].x, state.placed[hit.id].y);
      drag = { kind: 'move', id: hit.id, live: true, dx: at.x - press.x, dy: at.y - press.y, from: { ...state.placed[hit.id] } };
      els.get(hit.id).node.front();
      pending = null;
      selected = L.narrow ? null : { type: 'el', id: hit.id };
      syncBoard();
      drawInsc();
    } else if (hit.type === 'port') {
      const rubber = stage.line({ order: LAYER.mark, width: Math.max(1.4, 1.4 / L.S), color: U.accentSoft });
      g.links.add(rubber);
      drag = { kind: 'link', from: hit.id, live: true, rubber };
      pending = null;
      syncBoard();
    }
  }

  function onMove(e) {
    const p = where(e);
    if (!press) {
      const hit = editing() || mode === 'solved' || mode === 'run' ? pick(p.x, p.y) : null;
      const type = hit && hit.type;
      canvas.style.cursor = type === 'pal' || type === 'el' ? 'grab' : type === 'port' ? 'crosshair' : type === 'chip' || type === 'btn' || type === 'link' || type === 'pick' ? 'pointer' : 'default';
      return;
    }
    if (!drag) {
      if (Math.hypot(p.x - press.x, p.y - press.y) < 5) return;
      beginDrag(p);
      if (!drag) return;
      canvas.style.cursor = drag.kind === 'link' ? 'crosshair' : 'grabbing';
    }
    if (drag.kind === 'new') drag.ghost.set({ x: p.x, y: p.y });
    else if (drag.kind === 'move') {
      const b = toBoard(p.x + drag.dx, p.y + drag.dy);
      M.place(puzzle, state, drag.id, b.x, b.y, L.logical);
      // over the palette: it is on its way out
      els.get(drag.id).node.set({ o: inside(L.insc.y === L.palette.y ? L.insc : L.palette, p.x, p.y) ? 0.45 : 1 });
      syncBoard();
    } else if (drag.kind === 'link') {
      const b = toBoard(p.x, p.y);
      const hit = pick(p.x, p.y);
      const target = hit && hit.type === 'el' && !M.linkProblem(puzzle, state, drag.from, hit.id) ? hit.id : null;
      const from = state.placed[drag.from];
      const [w] = M.sizeOf(M.elementOf(puzzle, drag.from).kind);
      drag.rubber.points([{ x: from.x + (b.x >= from.x ? w / 2 : -w / 2), y: from.y }, b]);
      if (target !== hover) {
        hover = target;
        syncBoard();
      }
    }
    dirty = true;
  }

  function onUp(e) {
    if (!press) return;
    const p = where(e);
    const was = press;
    const dragged = drag;
    press = null;
    drag = null;
    try { canvas.releasePointerCapture(was.pointer); } catch (err) { /* already released */ }
    canvas.style.cursor = 'default';
    if (dragged) {
      if (dragged.kind === 'new') {
        dragged.ghost.dispose();
        if (inside(L.board, p.x, p.y)) {
          const b = toBoard(p.x, p.y);
          drop(dragged.id, b.x, b.y);
        } else refresh();
      } else if (dragged.kind === 'move') {
        els.get(dragged.id).node.set({ o: 1 });
        if (inside(L.palette, p.x, p.y) && !inside(L.board, p.x, p.y)) takeOut(dragged.id);
        else {
          const at = freeSpot(dragged.id, state.placed[dragged.id].x, state.placed[dragged.id].y);
          state.placed[dragged.id] = at;
          refresh();
        }
      } else if (dragged.kind === 'link') {
        dragged.rubber.dispose();
        const target = hover;
        hover = null;
        if (!target || !connect(dragged.from, target)) refresh();
      }
      return;
    }
    click(was.hit);
  }

  function click(hit) {
    if (!hit) return;
    if (hit.type === 'btn') return act(hit.name);
    if (!editing()) return;
    if (hit.type === 'chip') return setValue(hit.el, hit.field, hit.option);
    if (hit.type === 'pick') return select({ type: 'el', id: hit.id });
    if (hit.type === 'port') {
      pending = pending === hit.id ? null : hit.id;
      return select({ type: 'el', id: hit.id });
    }
    if (hit.type === 'el') {
      if (pending && pending !== hit.id && connect(pending, hit.id)) return;
      pending = null;
      return select({ type: 'el', id: hit.id });
    }
    pending = null;
    if (hit.type === 'pal') return select({ type: 'el', id: hit.id });
    if (hit.type === 'link') return select({ type: 'link', from: hit.from, to: hit.to });
    if (hit.type === 'board' || hit.type === 'palette') return select(null);
  }

  function onCancel() {
    if (drag) {
      if (drag.ghost) drag.ghost.dispose();
      if (drag.rubber) drag.rubber.dispose();
      if (drag.kind === 'move') state.placed[drag.id] = drag.from;
    }
    press = null;
    drag = null;
    hover = null;
    refresh();
  }

  /** Delete takes the selected connector or element away; Escape lets go step by step. */
  function key(e) {
    if (!editing()) return false;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selected && selected.type === 'link') disconnect(selected.from, selected.to);
      else if (selected && selected.type === 'el' && state.placed[selected.id]) takeOut(selected.id);
      else return false;
      return true;
    }
    if (e.key === 'Escape') {
      if (pending) {
        pending = null;
        refresh();
        return true;
      }
      if (selected) {
        select(null);
        return true;
      }
    }
    return false;
  }

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onCancel);
  // A finger's tap is followed by a click on whatever is under it by then: when the tap closed
  // the puzzle, that would be the page's own button, which opens it again. Not here.
  const noClick = e => e.preventDefault();
  canvas.addEventListener('touchstart', noClick, { passive: false });
  canvas.addEventListener('touchend', noClick, { passive: false });

  // ---- every frame ----------------------------------------------------------------------------
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000 || 0);
    last = now;
    for (let i = tweens.length - 1; i >= 0; i--) {
      const t = tweens[i];
      t.t = Math.min(1, t.t + dt / t.dur);
      const p = EASE[t.ease](t.t);
      for (const key of Object.keys(t.to)) t.node[key] = t.from[key] + (t.to[key] - t.from[key]) * p;
      t.node.apply();
      if (t.t >= 1) {
        tweens.splice(i, 1);
        if (t.done) t.done();
      }
      dirty = true;
    }
    if (run && (mode === 'run' || mode === 'solved')) {
      const before = runTime;
      if (mode === 'run') runTime = Math.min(run.duration, runTime + dt * pace * RUN_RATE);
      if (runTime !== before || dirty) {
        run.tl.seek(runTime);
        let line = '';
        for (const cue of run.cues) if (cue.at <= runTime + 1e-3) line = cue.text;
        say(line);
        dirty = true;
      }
      if (mode === 'run' && runTime >= run.duration) {
        setMode('solved');
        rebuildHits();
      }
    }
    if (dirty) {
      dirty = false;
      stage.render();
    }
    raf = requestAnimationFrame(frame);
  }

  function resize(w, h) {
    stage.resize(w, h);
    build();
    if (mode === 'run' || mode === 'solved') {
      makeRun();
      run.tl.seek(runTime);
      rebuildHits();
    }
    dirty = true;
  }

  // ---- for the browser check ------------------------------------------------------------------
  const centre = r => (r ? { x: r.x + r.w / 2, y: r.y + r.h / 2 } : null);
  const api = {
    mode: () => mode,
    state: () => JSON.parse(JSON.stringify(state)),
    errors: () => errors.map(e => ({ ...e, text: errorText(e) })),
    selected: () => selected,
    layout: () => ({ board: L.board, logical: L.logical, S: L.S, palette: L.palette, narrow: L.narrow }),
    /** Where something is on the canvas: its middle, in the canvas' own pixels. */
    find(type, props = {}) {
      return centre([...hits].reverse().find(hit => hit.type === type && Object.entries(props).every(([k, v]) => hit[k] === v)));
    },
    boardPoint: (x, y) => toStage(x, y),
    /** The middle of a connector. */
    linkPoint(from, to) {
      const pts = M.route(puzzle, state, from, to);
      const mid = M.along(pts, M.lengthOf(pts) / 2);
      return toStage(mid.x, mid.y);
    },
    arrange: () => M.arrange(puzzle, L.logical),
    run: () => (run ? { time: runTime, duration: run.duration } : null),
    said: () => said,
    order: () => [...paletteOrder]
  };

  const box = canvas.getBoundingClientRect();
  stage.resize(Math.max(1, box.width), Math.max(1, box.height));
  build();
  raf = requestAnimationFrame(frame);

  return {
    resize, key, api,
    destroy() {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onCancel);
      canvas.removeEventListener('touchstart', noClick);
      canvas.removeEventListener('touchend', noClick);
      stage.dispose();
    }
  };
}
