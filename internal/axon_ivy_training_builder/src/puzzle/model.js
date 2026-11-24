/**
 * A puzzle's rules, without any drawing: what a puzzle is, what the player has built so far,
 * what may be connected to what, whether the answer is right and, if not, what is wrong where.
 *
 * A puzzle (trees/<tree>/puzzles.js):
 *   { file, elements: [{ id, kind, fields?, by?, role? }], flow: [[from, to], …] }
 *   kind    start (Request Start), dialog (User Dialog), user (User Task), script, email (E-Mail),
 *           switch (Task Switch Event), gateway (Task Switch Gateway), alternative, split,
 *           join, end (Process End)
 *   fields  [{ id, options: [key, …], answer, default?, label?, to?, nth? }]: what the player sets
 *           in the element's inscription. `default` is what the Designer has there (else the first
 *           option); `label` names another shared field label than `id`; `to` is the element
 *           whose name completes that label (a gateway's task per outgoing path, an Alternative's
 *           condition per exit); `nth` instead: the element the player's nth connector out of it
 *           leads to (a Split's `outN` belongs to its nth connector, whichever path that is).
 *           The option EMPTY is an empty condition, which is always true.
 *   by      who works on it when the solved process runs (a name of the cast, or 'system');
 *           role: the role that got the task
 *   flow    the connectors of the answer. The elements are listed in the order of the story,
 *           so every connector leads from an earlier element to a later one.
 *   stories what the solved process shows when it runs: by default one case that goes down
 *           every path. A process with an Alternative runs once per story: [{ texts, takes }],
 *           `texts` the name of the captions (run, run2), `takes` which exit an Alternative
 *           takes in that case: { <alternative>: <next element> }.
 *
 * What the player has built (a state):
 *   { placed: { id: { x, y } }, links: [{ from, to }], values: { 'element.field': option } }
 *   x, y is the middle of the element on the board, in process pixels.
 *
 * check(puzzle, state) → { ok, errors: [{ el, code, field?, value?, to? }] }
 *   notPlaced   the element is still in the palette
 *   noPrev      nothing leads to it
 *   noNext      nothing comes after it
 *   wrongNext   it is connected to `to`, which is not what comes next
 *   missingPath one of its paths is missing (a gateway)
 *   rowOrder    an Alternative's exit to `to`, whose condition the answer leaves empty, has its
 *               row above another one: an Alternative tries its rows from the top, one per exit in
 *               the order the exits were drawn, and an empty condition is always true
 *   field       `field` has the wrong `value`
 */
export const EMPTY = 'empty';
export const SHAPE = {
  start: 'event', end: 'event', switch: 'event', gateway: 'gateway', alternative: 'gateway', split: 'gateway', join: 'gateway',
  script: 'activity', user: 'activity', dialog: 'activity', email: 'activity'
};
/** Only these have several ways out; on any other element a new connector replaces the old one. */
export const manyOut = kind => kind === 'gateway' || kind === 'alternative' || kind === 'split';
export const storiesOf = puzzle => puzzle.stories || [{ texts: 'run', takes: {} }];
export const SIZE = { activity: [112, 60], event: [30, 30], gateway: [32, 32] };
export const GRID = 8;

export const shapeOf = kind => SHAPE[kind] || 'activity';
export const sizeOf = kind => SIZE[shapeOf(kind)];
export const fieldKey = (el, field) => el + '.' + field;
export const elementOf = (puzzle, id) => puzzle.elements.find(e => e.id === id);
export const defaultOf = field => (field.default != null ? field.default : field.options[0]);

/** Nothing placed, nothing connected, every field as the Designer has it. */
export function newState(puzzle) {
  const values = {};
  for (const e of puzzle.elements) for (const f of e.fields || []) values[fieldKey(e.id, f.id)] = defaultOf(f);
  return { placed: {}, links: [], values };
}

export const outsOf = (state, id) => state.links.filter(l => l.from === id);
export const insOf = (state, id) => state.links.filter(l => l.to === id);
export const nextOf = (puzzle, id) => puzzle.flow.filter(f => f[0] === id).map(f => f[1]);
export const prevOf = (puzzle, id) => puzzle.flow.filter(f => f[1] === id).map(f => f[0]);
/** Where the player's nth connector out of an element leads (counting from 1, in the order drawn). */
export const nthOut = (state, id, n) => (outsOf(state, id)[n - 1] || {}).to;

/** Why `from` cannot be connected to `to`, or null when it can. */
export function linkProblem(puzzle, state, from, to) {
  const a = elementOf(puzzle, from);
  const b = elementOf(puzzle, to);
  if (!a || !b || !state.placed[from] || !state.placed[to]) return 'missing';
  if (from === to) return 'self';
  if (a.kind === 'end') return 'fromEnd';
  if (b.kind === 'start') return 'toStart';
  if (state.links.some(l => l.from === from && l.to === to)) return 'same';
  return null;
}

/**
 * Connects two elements. Only a gateway that splits has several outgoing connectors (manyOut):
 * on any other element the new connector replaces the old one. Returns whether anything changed.
 */
export function link(puzzle, state, from, to) {
  if (linkProblem(puzzle, state, from, to)) return false;
  if (!manyOut(elementOf(puzzle, from).kind)) state.links = state.links.filter(l => l.from !== from);
  // a connector back the other way would make the two a circle
  state.links = state.links.filter(l => !(l.from === to && l.to === from));
  state.links.push({ from, to });
  return true;
}

export function unlink(state, from, to) {
  const before = state.links.length;
  state.links = state.links.filter(l => !(l.from === from && l.to === to));
  return state.links.length !== before;
}

/** Puts an element on the board, snapped to the grid and kept inside the board. */
export function place(puzzle, state, id, x, y, board) {
  const [w, h] = sizeOf(elementOf(puzzle, id).kind);
  const snap = v => Math.round(v / GRID) * GRID;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const kind = elementOf(puzzle, id).kind;
  const pad = 6;
  const right = kind === 'end' ? pad : 26; // room for the arrow a connector is drawn from
  const under = shapeOf(kind) === 'activity' ? 0 : 18; // room for an event's name
  state.placed[id] = board
    ? { x: clamp(snap(x), pad + w / 2, Math.max(pad + w / 2, board.w - right - w / 2)), y: clamp(snap(y), pad + h / 2, Math.max(pad + h / 2, board.h - pad - h / 2 - under)) }
    : { x: snap(x), y: snap(y) };
  return state.placed[id];
}

/** Takes an element off the board, with its connectors. */
export function unplace(state, id) {
  delete state.placed[id];
  state.links = state.links.filter(l => l.from !== id && l.to !== id);
}

export function check(puzzle, state) {
  const errors = [];
  const expected = new Set(puzzle.flow.map(f => f[0] + '>' + f[1]));
  for (const e of puzzle.elements) {
    if (!state.placed[e.id]) {
      errors.push({ el: e.id, code: 'notPlaced' });
      continue;
    }
    const outs = outsOf(state, e.id);
    const wanted = nextOf(puzzle, e.id);
    if (e.kind !== 'start' && !insOf(state, e.id).length) errors.push({ el: e.id, code: 'noPrev' });
    if (e.kind !== 'end' && !outs.length) errors.push({ el: e.id, code: 'noNext' });
    const wrong = outs.filter(l => !expected.has(l.from + '>' + l.to));
    for (const l of wrong) errors.push({ el: e.id, code: 'wrongNext', to: l.to });
    // a gateway with some of its paths: say so once, unless a wrong connector already says more
    if (outs.length && !wrong.length && wanted.some(to => !outs.some(l => l.to === to))) errors.push({ el: e.id, code: 'missingPath' });
    // an Alternative's rows: an exit the answer leaves empty (always true) has to be the last row
    if (e.kind === 'alternative' && !wrong.length) {
      const emptyInAnswer = to => {
        const f = (e.fields || []).find(x => x.to === to);
        return !f || f.answer === EMPTY;
      };
      const rows = outs.map(l => l.to);
      const top = rows.findIndex(emptyInAnswer);
      if (top >= 0 && top < rows.length - 1) errors.push({ el: e.id, code: 'rowOrder', to: rows[top] });
    }
    for (const f of e.fields || []) {
      const value = state.values[fieldKey(e.id, f.id)];
      if (value !== f.answer) errors.push({ el: e.id, code: 'field', field: f.id, value });
    }
  }
  return { ok: !errors.length, errors };
}

/**
 * Where the elements of the answer go on a board of w × h: columns by how far an element is
 * from the start, rows for what runs side by side; folded into several lines when the board is
 * too narrow for one. Used to show a puzzle solved (the browser check, the tests).
 */
export function arrange(puzzle, board) {
  const rank = {};
  for (const e of puzzle.elements) rank[e.id] = Math.max(0, ...prevOf(puzzle, e.id).map(p => rank[p] + 1));
  const cols = [];
  for (const e of puzzle.elements) (cols[rank[e.id]] = cols[rank[e.id]] || []).push(e);
  const GAP = 28;
  const colW = cols.map(col => Math.max(...col.map(e => sizeOf(e.kind)[0])));
  const tall = Math.max(...cols.map(col => col.length));
  const lineH = tall * 60 + (tall - 1) * 34 + 30;
  // fill each line with as many columns as fit
  const lines = [[]];
  let used = 0;
  cols.forEach((col, i) => {
    const line = lines[lines.length - 1];
    const need = colW[i] + (line.length ? GAP : 0);
    if (line.length && used + need > board.w - 24) {
      lines.push([i]);
      used = colW[i];
    } else {
      line.push(i);
      used += need;
    }
  });
  const placed = {};
  const top = Math.max(lineH / 2 + 6, (board.h - lines.length * lineH - (lines.length - 1) * 14) / 2 + lineH / 2);
  lines.forEach((line, row) => {
    const width = line.reduce((sum, i) => sum + colW[i], 0) + (line.length - 1) * GAP;
    let x = Math.max(12, (board.w - width) / 2);
    for (const i of line) {
      const col = cols[i];
      col.forEach((e, k) => {
        placed[e.id] = { x: x + colW[i] / 2, y: top + row * (lineH + 14) + (k - (col.length - 1) / 2) * 94 };
      });
      x += colW[i] + GAP;
    }
  });
  return placed;
}

/** The puzzle solved: every element placed (arrange), connected and set as the answer says. */
export function solved(puzzle, board = { w: 720, h: 420 }) {
  const state = newState(puzzle);
  const at = arrange(puzzle, board);
  for (const e of puzzle.elements) {
    place(puzzle, state, e.id, at[e.id].x, at[e.id].y, board);
    for (const f of e.fields || []) state.values[fieldKey(e.id, f.id)] = f.answer;
  }
  state.links = puzzle.flow.map(([from, to]) => ({ from, to }));
  return state;
}

// ---- connectors on the board ---------------------------------------------------------------

/**
 * The points of a connector between two placed elements: it leaves and arrives on the sides
 * that face each other, straight when the two are in line, with one bend at a gateway and two
 * otherwise.
 */
export function route(puzzle, state, from, to) {
  const p = state.placed[from];
  const q = state.placed[to];
  const [pw, ph] = sizeOf(elementOf(puzzle, from).kind);
  const [qw, qh] = sizeOf(elementOf(puzzle, to).kind);
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  const sx = Math.sign(dx) || 1;
  const sy = Math.sign(dy) || 1;
  const roomX = Math.abs(dx) - (pw + qw) / 2; // free room between them, side by side
  const roomY = Math.abs(dy) - (ph + qh) / 2; // and one above the other
  const sides = () => {
    // a gateway's connector leaves its top or bottom corner, or arrives there
    if (shapeOf(elementOf(puzzle, from).kind) === 'gateway' && Math.abs(dy) > ph / 2) return [{ x: p.x, y: p.y + (sy * ph) / 2 }, { x: p.x, y: q.y }, { x: q.x - (sx * qw) / 2, y: q.y }];
    if (shapeOf(elementOf(puzzle, to).kind) === 'gateway' && Math.abs(dy) > qh / 2) return [{ x: p.x + (sx * pw) / 2, y: p.y }, { x: q.x, y: p.y }, { x: q.x, y: q.y - (sy * qh) / 2 }];
    const mid = (p.x + (sx * pw) / 2 + q.x - (sx * qw) / 2) / 2;
    return [{ x: p.x + (sx * pw) / 2, y: p.y }, { x: mid, y: p.y }, { x: mid, y: q.y }, { x: q.x - (sx * qw) / 2, y: q.y }];
  };
  if (Math.abs(dy) < 1 && roomX > 0) return [{ x: p.x + (sx * pw) / 2, y: p.y }, { x: q.x - (sx * qw) / 2, y: q.y }];
  if (Math.abs(dx) < 1 && roomY > 0) return [{ x: p.x, y: p.y + (sy * ph) / 2 }, { x: q.x, y: q.y - (sy * qh) / 2 }];
  // forwards: side to side
  if (dx > 0 && roomX >= 12) return sides();
  // back to the start of the next line, or straight down: bottom to top
  if (roomY >= 12) {
    const y0 = p.y + (sy * ph) / 2;
    const y1 = q.y - (sy * qh) / 2;
    const mid = (y0 + y1) / 2;
    return [{ x: p.x, y: y0 }, { x: p.x, y: mid }, { x: q.x, y: mid }, { x: q.x, y: y1 }];
  }
  if (roomX >= 12) return sides();
  return [{ x: p.x, y: p.y }, { x: q.x, y: q.y }];
}

export const lengthOf = pts => pts.slice(1).reduce((sum, p, i) => sum + Math.hypot(p.x - pts[i].x, p.y - pts[i].y), 0);

/** The point `d` pixels along a line of points. */
export function along(pts, d) {
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    if (d <= seg || i === pts.length - 1) {
      const p = seg ? Math.min(1, d / seg) : 1;
      return { x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * p, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * p };
    }
    d -= seg;
  }
  return pts[0];
}

/** How far a point is from a line of points. */
export function distanceTo(pts, x, y) {
  let best = Infinity;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const len2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
    const t = len2 ? Math.max(0, Math.min(1, ((x - a.x) * (b.x - a.x) + (y - a.y) * (b.y - a.y)) / len2)) : 0;
    best = Math.min(best, Math.hypot(x - (a.x + (b.x - a.x) * t), y - (a.y + (b.y - a.y) * t)));
  }
  return best;
}

// ---- the solved process, running -----------------------------------------------------------

/**
 * When what happens while the solved process runs, in seconds. The story goes through the
 * elements in the puzzle's order, one at a time; a token that arrives while the story is still
 * elsewhere waits on its element, as a task waits for its user.
 *
 *   dwell(element)        how long the story stays on an element
 *   travel(from, to)      how long a token takes along that connector
 *
 * → { visits: [{ el, arrive, begin, end }], moves: [{ from, to, start, end }], duration }
 *   arrive: the first token is there; begin … end: the story is on it.
 *
 * takes: { <element>: <next element> } where only one exit is taken (an Alternative). What no
 * token reaches is not visited.
 */
export function schedule(puzzle, dwell, travel, start = 0, takes = {}) {
  const arrivals = {};
  const visits = [];
  const moves = [];
  let free = start;
  for (const [i, e] of puzzle.elements.entries()) {
    const came = i ? arrivals[e.id] : [start];
    if (!came) continue; // not on this case's way
    const begin = Math.max(free, ...came);
    const end = begin + dwell(e);
    free = end;
    visits.push({ el: e.id, arrive: Math.min(...came), begin, end });
    for (const to of nextOf(puzzle, e.id)) {
      if (takes[e.id] && takes[e.id] !== to) continue;
      const move = { from: e.id, to, start: end, end: end + travel(e.id, to) };
      moves.push(move);
      (arrivals[to] = arrivals[to] || []).push(move.end);
    }
  }
  return { visits, moves, duration: free };
}
