/**
 * The reward for a right answer: the process the player built runs once, as a small film.
 *
 * The workbench (palette, inscription, bar) fades, the editor tilts back and the camera goes
 * in on the process until it fills the stage, and its elements lift off the canvas. Then the token goes through the process as the
 * tutorial shows it: what it is on glows green, what it has passed stays green with a counter.
 * The story stays on each element for as long as its caption takes to read. Who works there
 * (one of the cast, or the engine's robot for SYSTEM) says it: big beside the caption, with
 * the role that got the task, and small on the element itself. Where paths run side by side their tokens wait on their elements until the
 * story gets there, as a task waits for its user. A process with an Alternative runs once per
 * story of the puzzle (model.js, storiesOf): a case for each way out, and the counters show how
 * often each element ran. At the end: confetti, and the puzzle's closing words with "watch
 * again" and "done".
 *
 * buildRun(c) → { tl, cues, duration, hits }
 *   tl     a seekable timeline (src/timeline.js) over the stage's nodes
 *   cues   [{ at, text }] what is said from when (read out through the page's live region)
 *   hits   the buttons, each with `when`: the mode in which it can be pressed
 */
import { Timeline } from '../timeline.js';
import { P } from '../cast.js';
import { LAYER } from './gl.js';
import { U } from './paint.js';
import * as M from './model.js';

const TILT = 0.6;
const SPEED = 220; // board pixels a second
const LIFT = 7;

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
/** How long a caption takes to read (a kana or kanji counts for two letters). */
const reading = text => clamp(1.2 + [...text.replace(/\*\*|`/g, '')].reduce((n, ch) => n + (ch.charCodeAt(0) > 0x2e80 ? 2.1 : 1), 0) * 0.05, 2.4, 7.5);

export function buildRun(c) {
  const { stage, paint, puzzle, state, texts, vocab, ui, cast, castNames, L, g, els, lines, elImage, put, group, panels, backdrop } = c;
  const tl = new Timeline();
  const cues = [];
  const hits = [];
  const stories = M.storiesOf(puzzle).map(story => ({ ...story, captions: texts[story.texts] || {} }));

  // ---- what is said, and the closing words: both sit at the bottom of the stage ----
  const boxW = Math.min(L.W - L.pad * 2, 800);
  const boxX = (L.W - boxW) / 2;
  const SPEAKER = L.narrow ? 76 : 96; // the column of who is speaking
  const personOf = (e, k, named) => {
    const robot = e.by === 'system';
    return paint.person(robot ? 'system' : cast[e.by], named ? (robot ? vocab.options.system : castNames[e.by] || e.by) : '', { k });
  };
  const roleOf = (e, size) => paint.pill(vocab.options[e.role] || e.role, { fill: P.teal, size });
  /** An element as a story has it: another of the cast may work there (story.by). */
  const actor = (story, e) => (story.by && story.by[e.id] ? { ...e, by: story.by[e.id] } : e);
  /** What is said on an element in a story: who says it, in which role, and the words. */
  const says = new Map();
  for (const story of stories) {
    for (const el of puzzle.elements) {
      if (!story.captions[el.id]) continue;
      const e = actor(story, el);
      const who = e.by ? personOf(e, L.narrow ? 0.42 : 0.5, true) : null;
      const role = who && e.role ? roleOf(e, 11) : null;
      const text = paint.label(story.captions[e.id], { size: L.narrow ? 14.5 : 17, weight: 600, color: U.text, bold: '#ffffff', maxW: boxW - 40 - (who ? SPEAKER : 0), align: who ? 'left' : 'center' });
      says.set(story.texts + '.' + e.id, { who, role, text, h: Math.max(text.h, who ? who.h + (role ? role.h + 3 : 0) : 0) });
    }
  }
  const capH = Math.max(46, ...[...says.values()].map(say => say.h)) + 24;
  const title = paint.label(ui('pzSolved'), { size: L.narrow ? 20 : 24, weight: 800, color: U.good, rich: false, align: 'center' });
  const closing = paint.label(texts.solved || '', { size: L.narrow ? 14 : 16, weight: 500, color: U.text, bold: '#ffffff', maxW: boxW - 40, align: 'center' });
  const again = paint.button('↻ ' + ui('pzAgain'), { h: 42, size: 15 });
  const done = paint.button(ui('pzDone'), { h: 42, size: 15, kind: 'primary', padX: 30 });
  const resH = 16 + title.h + 6 + closing.h + 14 + 42 + 16;
  const low = Math.max(capH, resH);

  // ---- 1 · the workbench makes room; the editor tilts back and the process fills the stage ----
  // the process itself, with room over it for who stands on it
  const box = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity };
  for (const e of puzzle.elements) {
    const p = state.placed[e.id];
    const [w, h] = M.sizeOf(e.kind);
    box.x0 = Math.min(box.x0, p.x - w / 2 - 22);
    box.x1 = Math.max(box.x1, p.x + w / 2 + 22);
    box.y0 = Math.min(box.y0, p.y - h / 2 - 54);
    box.y1 = Math.max(box.y1, p.y + h / 2 + 30);
  }
  const bandTop = L.top;
  const band = L.H - L.pad - low - 14 - bandTop;
  const flat = Math.cos(TILT);
  const zoom = clamp(Math.min((L.W - L.pad * 2 - 20) / ((box.x1 - box.x0) * L.S), band / ((box.y1 - box.y0) * L.S * flat)), 0.6, 2.2);
  const k = L.S * zoom;
  // where the process' middle is, from the board's middle
  const cx = (box.x0 + box.x1) / 2 - L.logical.w / 2;
  const cy = (box.y0 + box.y1) / 2 - L.logical.h / 2;
  for (const panel of panels) tl.to(panel, { o: 0 }, 0, 0.3, 'linear');
  tl.to(backdrop, { o: 1 }, 0, 0.3, 'linear');
  tl.to(g.tilt, { x: L.W / 2 - cx * k, y: bandTop + band / 2 - cy * k * flat, s: k, rx: -TILT }, 0.15, 1.0, 'inOut');
  // painted for the size they are shown at
  const sharp = Math.min(3, Math.max(L.S, k));
  const image = (id, st, count) => elImage(id, st, count, sharp);
  puzzle.elements.forEach((e, i) => {
    const it = els.get(e.id);
    it.node.show(image(e.id, it.node.st, it.node.count));
    tl.to(it.node, { z: LIFT }, 0.35 + i * 0.05, 0.6, 'out');
    tl.to(it.shadow, { o: 1 }, 0.35 + i * 0.05, 0.6, 'linear');
  });

  // ---- 2 · the token's way, element by element, once per story ----
  const T0 = 1.5;
  const tokenImage = paint.token();
  const token = (x, y, s = 1) => put(g.run, tokenImage, x, y, LAYER.run, { o: 0, s, z: LIFT + 2, glow: true });
  /** Something that stands on the board and faces the camera. */
  const standing = (image, x, y, from, to) => {
    const n = put(g.run, image, x, y, LAYER.run + 5, { o: 0, s: 0.6, z: LIFT + 6, rx: TILT });
    tl.to(n, { o: 1, s: 1 }, from, 0.35, 'back');
    tl.to(n, { o: 0 }, to, 0.25, 'linear');
    return n;
  };

  const capBox = group(g.over, { o: 0 });
  const capY = L.H - L.pad - capH;
  put(capBox, paint.panel(boxW, capH, { fill: U.panel, stroke: U.line }), boxX, capY, LAYER.top);
  tl.to(capBox, { o: 1 }, T0 - 0.35, 0.3, 'linear');
  let shown = null;
  for (const e of puzzle.elements) {
    const it = els.get(e.id);
    const redraw = () => it.node.show(image(e.id, it.node.st, it.node.count));
    it.node.bind('st', redraw);
    it.node.bind('count', redraw);
  }
  const ran = {}; // how often each element has run
  let END = T0;
  let lastId = puzzle.elements[0].id;
  stories.forEach((story, n) => {
    // the next case starts on a process at rest: what ran keeps its counter
    const from = n ? END + 1.1 : T0;
    if (n) {
      for (const e of puzzle.elements) tl.set(els.get(e.id).node, { st: 'idle' }, from - 0.6);
      for (const line of lines.values()) tl.set(line, { tint: 'idle' }, from - 0.6);
    }
    const plan = M.schedule(
      puzzle,
      e => (story.captions[e.id] ? reading(story.captions[e.id]) : 0.9),
      (a, b) => Math.max(0.5, M.lengthOf(M.route(puzzle, state, a, b)) / SPEED),
      from,
      story.takes || {}
    );
    END = plan.duration;
    lastId = plan.visits[plan.visits.length - 1].el;

    for (const v of plan.visits) {
      const e = actor(story, M.elementOf(puzzle, v.el));
      const it = els.get(e.id);
      const p = state.placed[e.id];
      const [w, h] = M.sizeOf(e.kind);
      ran[e.id] = (ran[e.id] || 0) + 1;
      tl.set(it.node, { st: 'active' }, v.arrive);
      tl.set(it.node, { st: 'done', count: ran[e.id] }, v.end);
      tl.to(it.node, { s: 1.07 }, v.begin, 0.5, 'bump');
      // the token sits on its element (an activity's icon) until the story has been here
      const sits = M.shapeOf(e.kind) === 'activity' ? token(p.x - w / 2 + 23, p.y, 0.8) : token(p.x, p.y);
      tl.set(sits, { o: 1 }, v.arrive);
      tl.to(sits, { o: 0 }, v.end, 0.15, 'linear');

      // on the board: the role over the element as soon as its task is there, and a small
      // figure on it while it is worked on
      const wide = M.shapeOf(e.kind) === 'activity';
      let top = p.y - h / 2 - 3;
      if (e.role) {
        const pill = roleOf(e, 10.5);
        standing(pill, wide ? p.x + 16 : p.x, top - pill.h / 2, v.arrive + 0.1, v.end);
        if (!wide) top -= pill.h + 3;
      }
      if (e.by) standing(personOf(e, 0.3, false), wide ? p.x - w / 2 + 22 : p.x, top + 3, v.begin + 0.1, v.end);

      // what is said, and who says it
      const say = says.get(story.texts + '.' + e.id);
      if (say) {
        const node = group(capBox, { o: 0 });
        if (say.who) {
          const x = boxX + 14 + SPEAKER / 2;
          const tall = say.who.h + (say.role ? say.role.h + 3 : 0);
          const feet = capY + (capH - tall) / 2 + say.who.h;
          put(node, say.who, x, feet, LAYER.top + 1);
          if (say.role) put(node, say.role, x, feet + 3 + say.role.h / 2, LAYER.top + 1);
          put(node, say.text, boxX + 20 + SPEAKER, capY + (capH - say.text.h) / 2, LAYER.top + 1);
        } else put(node, say.text, L.W / 2, capY + (capH - say.text.h) / 2, LAYER.top + 1);
        if (shown) tl.to(shown, { o: 0 }, v.begin - 0.05, 0.15, 'linear');
        tl.to(node, { o: 1 }, v.begin + 0.1, 0.2, 'linear');
        shown = node;
        cues.push({ at: v.begin, text: story.captions[e.id].replace(/\*\*|`/g, '') });
      }
    }

    for (const m of plan.moves) {
      const pts = M.route(puzzle, state, m.from, m.to);
      const total = M.lengthOf(pts) || 1;
      const tok = token(pts[0].x, pts[0].y);
      tl.set(tok, { o: 1 }, m.start);
      let t = m.start;
      for (let i = 1; i < pts.length; i++) {
        const d = ((m.end - m.start) * Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)) / total;
        tl.to(tok, { x: pts[i].x, y: pts[i].y }, t, d, 'linear');
        t += d;
      }
      tl.set(tok, { o: 0 }, m.end);
      const line = lines.get(m.from + '>' + m.to);
      if (line) tl.set(line, { tint: 'done' }, m.end);
    }
  });

  // a way past the film
  const skip = paint.button(ui('pzSkip') + ' ▸▸', { h: 34, size: 13, padX: 14 });
  const skipAt = { x: boxX + boxW - skip.w, y: capY - 34 - 8, w: skip.w, h: 34 };
  const skipNode = put(g.over, skip, skipAt.x, skipAt.y, LAYER.top, { o: 0 });
  tl.to(skipNode, { o: 1 }, T0 - 0.35, 0.3, 'linear');
  tl.to(skipNode, { o: 0 }, END, 0.2, 'linear');
  hits.push({ type: 'btn', name: 'skip', when: 'run', ...skipAt });

  // ---- 3 · the end: confetti over the last element, and the closing words ----
  const burst = stage.confetti(paint.dot());
  burst.set({ x: state.placed[lastId].x, y: state.placed[lastId].y, z: LIFT + 4 });
  g.run.add(burst);
  tl.to(burst, { p: 1 }, END, 1.6, 'linear');

  const resY = L.H - L.pad - resH;
  const res = group(g.over, { o: 0 });
  put(res, paint.panel(boxW, resH, { fill: U.panel, stroke: U.good, sw: 1.5 }), boxX, resY, LAYER.top + 2);
  let y = resY + 16;
  put(res, title, L.W / 2, y, LAYER.top + 3);
  y += title.h + 6;
  put(res, closing, L.W / 2, y, LAYER.top + 3);
  y += closing.h + 14;
  const buttonsW = again.w + 10 + done.w;
  const bx = (L.W - buttonsW) / 2;
  put(res, again, bx, y, LAYER.top + 3);
  put(res, done, bx + again.w + 10, y, LAYER.top + 3);
  hits.push({ type: 'btn', name: 'again', when: 'solved', x: bx, y, w: again.w, h: 42 });
  hits.push({ type: 'btn', name: 'done', when: 'solved', x: bx + again.w + 10, y, w: done.w, h: 42 });
  tl.to(capBox, { o: 0 }, END + 0.6, 0.25, 'linear');
  tl.to(res, { o: 1 }, END + 0.85, 0.4, 'linear');
  cues.push({ at: END + 0.85, text: ui('pzSolved') + ' ' + (texts.solved || '').replace(/\*\*|`/g, '') });
  tl.hold(END + 1.4);

  tl.prepare();
  return { tl, cues, duration: tl.duration, hits };
}
