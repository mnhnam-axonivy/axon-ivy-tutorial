/**
 * The Workflow tree, the way a token takes (Alternative, Split, Join): each skill's short film.
 * films/kit.js has what all films share; src/film.js describes the kit (k) a film gets.
 */
import { P } from '../../../src/cast.js';
import { who, beats } from './kit.js';

export const films = {};

// ==================== what the films of this file share ====================
/** A process at rest again, for the next case: what ran keeps its counter. */
const rest = (k, proc, nodes, edges, at) => {
  nodes.forEach(i => k.tl.set(proc.nodes[i], { state: 'idle' }, at));
  edges.forEach(([a, b]) => k.tl.set(proc.edge(a, b), { state: 'idle' }, at));
};

/** The process of the Split and Join films: approve, then book and tell side by side. */
const sideBySide = (k, L, approve, book, tell) => k.C.proc(L, 300, 124, [
  { kind: 'user', x: -196, label: approve },
  { kind: 'split', x: -84 },
  { kind: 'script', x: 36, y: -46, label: book },
  { kind: 'email', x: 36, y: 46, label: tell },
  { kind: 'join', x: 156 },
  { kind: 'end', x: 222 }
], { scale: 1.02, edges: [[0, 1], [1, 2], [1, 3], [2, 4], [3, 4], [4, 5]], file: 'LeaveRequest.p.json' });

// ==================== Alternative: one way out of several ====================
films.alternative = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, B4, END] = beats(k.opening(), 4.8, 5.6, 4.8, 5.8, 4.8);
  const proc = C.proc(L, 300, 132, [
    { kind: 'user', x: -178, label: k.t('decide') },
    { kind: 'alternative', x: -58, dx: -40, label: k.t('approvedQ') },
    { kind: 'script', x: 96, y: -46, label: k.t('book') },
    { kind: 'email', x: 96, y: 46, label: k.t('sayNo') }
  ], { scale: 1.05, edges: [[0, 1], [1, 2, k.t('yes')], [1, 3, k.t('no')]], frame: { r: 16 }, file: 'LeaveRequest.p.json' });
  const tok = C.token(L);
  const tok2 = C.token(L);
  const max = who(k, L, 'max', 84, 424, 0.6);
  const insc = C.inscription(L, 392, 334, { w: 380, title: k.t('approvedQ'), tab: k.t('condTab'), rows: [[k.t('book'), 'in.approved'], [k.t('sayNo'), 'in.approved == false']], split: 0.36 });
  const caseA = C.pill(L, 102, 276, k.t('annaCase'), { fill: P.greenLight, size: 14, o: 0 });
  const caseB = C.pill(L, 102, 276, k.t('benCase'), { fill: P.pink, size: 14, o: 0 });
  const one = C.tag(L, 300, 250, k.t('oneExit'), { color: P.gold, size: 14, lang: k.lang });

  k.say('decide', B0);
  C.fadeIn(proc, B0);
  C.pop(max, B0 + 0.5);
  C.enter(proc, 0, B0 + 1.0);

  k.say('element', B1);
  C.pulse(proc.nodes[1], B1 + 0.4, 1.2, 0.6);
  C.pop(insc, B1 + 1.2);

  k.say('yes', B2);
  C.pop(caseA, B2 + 0.3);
  C.fadeIn(insc.marks[0], B2 + 0.8, 0.3);
  C.run(proc, tok, [0, 1, 2], B2 + 1.0, 0.8);

  k.say('no', B3);
  C.fadeOut(caseA, B3, 0.2);
  C.fadeOut(insc.marks[0], B3, 0.2);
  rest(k, proc, [0, 1, 2], [[0, 1], [1, 2]], B3 + 0.2);
  C.pop(caseB, B3 + 0.4);
  C.enter(proc, 0, B3 + 0.8);
  C.run(proc, tok2, [0, 1], B3 + 1.4, 0.8);
  C.fadeIn(insc.marks[1], B3 + 2.4, 0.3);
  C.run(proc, tok2, [1, 3], B3 + 2.8, 0.8);

  k.say('one', B4);
  C.fadeOut(insc, B4, 0.3);
  C.fadeOut(caseB, B4, 0.3);
  C.fadeOut(max, B4, 0.3);
  C.pulse(proc.nodes[1], B4 + 0.5, 1.25, 0.6);
  C.pop(one, B4 + 0.9);
  tl.hold(END);
};

// ==================== The default exit: first true wins, empty is true ====================
films.altdefault = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, B4, END] = beats(k.opening(), 4.8, 4.8, 6.2, 6.0, 5.0);
  const proc = C.proc(L, 300, 126, [
    { kind: 'dialog', x: -178, label: k.t('request') },
    { kind: 'alternative', x: -58, dx: -40, label: k.t('howLong') },
    { kind: 'user', x: 96, y: -46, label: k.t('mgr') },
    { kind: 'user', x: 96, y: 46, label: k.t('hr') }
  ], { scale: 1.05, edges: [[0, 1], [1, 2], [1, 3]], frame: { r: 16 }, file: 'LeaveRequest.p.json' });
  const tok = C.token(L);
  const tok2 = C.token(L);
  const insc = C.inscription(L, 210, 320, { w: 356, title: k.t('howLong'), tab: k.t('condTab'), rows: [[k.t('mgr'), 'in.days < 5'], [k.t('hr'), 'in.days > 5']], split: 0.5 });
  const data = C.doc(L, 492, 300, [k.t('days3')], { w: 150, mono: true });
  const error = C.log(L, 300, 428, 'In the alternative all conditions evaluate to false', { w: 540, level: 'ERROR' });
  const keep = C.tag(L, 300, 428, k.t('keepLast'), { color: P.gold, size: 14, lang: k.lang });

  k.say('order', B0);
  C.fadeIn(proc, B0);
  C.pop(insc, B0 + 1.0);

  k.say('first', B1);
  C.pop(data, B1 + 0.2);
  C.enter(proc, 0, B1 + 0.6);
  C.run(proc, tok, [0, 1], B1 + 1.0, 0.8);
  C.fadeIn(insc.marks[0], B1 + 1.9, 0.3);
  C.run(proc, tok, [1, 2], B1 + 2.5, 0.8);

  k.say('none', B2);
  C.fadeOut(insc.marks[0], B2, 0.2);
  rest(k, proc, [0, 1, 2], [[0, 1], [1, 2]], B2 + 0.2);
  C.say(data.lines[0], k.t('days5'), B2 + 0.4);
  C.pulse(data, B2 + 0.4, 1.08);
  C.enter(proc, 0, B2 + 0.8);
  C.run(proc, tok2, [0, 1], B2 + 1.2, 0.8);
  // row 1, then row 2: neither is true
  C.fadeIn(insc.marks[0], B2 + 2.2, 0.2);
  C.fadeOut(insc.marks[0], B2 + 3.0, 0.2);
  C.fadeIn(insc.marks[1], B2 + 3.1, 0.2);
  C.fadeOut(insc.marks[1], B2 + 3.9, 0.2);
  C.shake(proc.nodes[1], B2 + 4.0);
  C.pop(error, B2 + 4.2);

  k.say('empty', B3);
  C.fadeOut(error, B3, 0.3);
  C.say(insc.values[1], k.t('empty'), B3 + 0.8);
  C.fadeIn(insc.marks[1], B3 + 0.8, 0.3);
  C.run(proc, tok2, [1, 3], B3 + 2.6, 0.8);

  k.say('last', B4);
  C.pulse(insc, B4 + 0.4, 1.03);
  C.pop(keep, B4 + 0.8);
  tl.hold(END);
};

// ==================== Split: every way out, and the data each path gets ====================
films.split = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, B4, END] = beats(k.opening(), 4.6, 4.4, 5.0, 6.6, 5.0);
  const proc = sideBySide(k, L, k.t('approve'), k.t('book'), k.t('tell'));
  const tok = C.token(L);
  const tok2 = C.token(L);
  const same = C.tag(L, 300, 248, k.t('noTask'), { color: P.gold, size: 14, lang: k.lang });
  const insc = C.inscription(L, 192, 338, { w: 316, title: 'Split', tab: k.f('output'), rows: [['out1', 'in'], ['out2', '']], split: 0.34 });
  const p1 = C.pill(L, 482, 262, k.t('path1'), { fill: P.cream, size: 13, o: 0 });
  const d1 = C.doc(L, 482, 302, [k.t('nameAnna')], { w: 180, mono: true });
  const p2 = C.pill(L, 482, 350, k.t('path2'), { fill: P.cream, size: 13, o: 0 });
  const d2 = C.doc(L, 482, 390, [k.t('nameEmpty')], { w: 180, mono: true });
  const ok = C.check(L, 572, 424, { r: 15 });

  k.say('both', B0);
  C.fadeIn(proc, B0);
  C.enter(proc, 0, B0 + 0.8);

  k.say('split', B1);
  C.run(proc, tok, [0, 1], B1 + 0.3, 0.8);
  C.run(proc, tok, [1, 2], B1 + 1.6, 0.8);
  C.run(proc, tok2, [1, 3], B1 + 1.6, 0.8, { quiet: true });

  k.say('turns', B2);
  C.pop(same, B2 + 0.4);
  [3, 2, 3, 2].forEach((i, n) => C.pulse(proc.nodes[i], B2 + 1.2 + n * 0.7, 1.1, 0.5));

  k.say('data', B3);
  C.fadeOut(same, B3, 0.3);
  C.pop(insc, B3 + 0.5);
  C.pop(p1, B3 + 2.2);
  C.pop(d1, B3 + 2.4);
  C.fadeIn(insc.marks[1], B3 + 3.6, 0.3);
  C.pop(p2, B3 + 4.0);
  C.pop(d2, B3 + 4.2);
  C.shake(d2, B3 + 4.9);

  k.say('fix', B4);
  C.type(insc.values[1], 'in', B4 + 0.6);
  C.say(d2.lines[0], k.t('nameAnna'), B4 + 1.6);
  C.pulse(d2, B4 + 1.6, 1.08);
  C.pop(ok, B4 + 2.2);
  tl.hold(END);
};

// ==================== Join: waits for all its paths ====================
films.joinpaths = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, B4, END] = beats(k.opening(), 4.8, 4.6, 5.4, 5.4, 5.6);
  const proc = sideBySide(k, L, k.t('approve'), k.t('book'), k.t('tell'));
  const tokA = C.token(L);
  const tokB = C.token(L);
  const waits = C.tag(L, 430, 240, k.t('waitsTag'), { color: P.gold, size: 13.5, lang: k.lang });
  const rows1 = C.inscription(L, 192, 338, { w: 330, title: 'Join', tab: k.f('output'), rows: [['out', 'in1']], split: 0.46 });
  const rows2 = C.inscription(L, 192, 338, { w: 330, title: 'Join', tab: k.f('output'), rows: [['out', 'in1'], ['out.mailSent', 'in2.mailSent']], split: 0.46 });
  const p1 = C.pill(L, 484, 252, 'in1', { fill: P.cream, size: 13, o: 0 });
  const d1 = C.doc(L, 484, 300, ['booked: true', 'mailSent: false'], { w: 190, mono: true });
  const p2 = C.pill(L, 484, 354, 'in2', { fill: P.cream, size: 13, o: 0 });
  const d2 = C.doc(L, 484, 402, ['booked: false', 'mailSent: true'], { w: 190, mono: true });
  const clock = C.clock(L, 204, 330, { r: 34 });
  const forever = C.tag(L, 330, 398, k.t('forever'), { color: P.red, size: 14, lang: k.lang });

  // the film starts after the Split: both paths are on their way
  k.say('wait', B0);
  C.fadeIn(proc, B0);
  C.finish(proc, 0, B0 + 0.3);
  C.finish(proc, 1, B0 + 0.3);
  [[0, 1], [1, 2], [1, 3]].forEach(([a, b]) => tl.set(proc.edge(a, b), { state: 'done' }, B0 + 0.3));
  C.enter(proc, 2, B0 + 0.6);
  C.enter(proc, 3, B0 + 0.6);
  C.run(proc, tokA, [2, 4], B0 + 1.6, 0.9, { hold: true });
  C.pop(waits, B0 + 2.8);

  k.say('all', B1);
  C.run(proc, tokB, [3, 4], B1 + 0.3, 0.9, { hold: true });
  C.fadeOut(waits, B1 + 1.3);
  C.arrive(proc, [tokA, tokB], 4, B1 + 1.6);
  C.run(proc, tokA, [4, 5], B1 + 2.2, 0.7);
  C.finish(proc, 5, B1 + 3.3);

  k.say('data', B2);
  C.pop(p1, B2 + 0.4);
  C.pop(d1, B2 + 0.6);
  C.pop(p2, B2 + 1.2);
  C.pop(d2, B2 + 1.4);
  C.pop(rows1, B2 + 2.6);
  C.fadeIn(rows1.marks[0], B2 + 3.6, 0.3);

  k.say('map', B3);
  C.fadeOut(rows1, B3, 0.25);
  C.fadeIn(rows2, B3 + 0.2, 0.3);
  C.fadeIn(rows2.marks[1], B3 + 1.2, 0.3);
  C.pulse(d2, B3 + 1.8, 1.08);

  k.say('alone', B4);
  [rows2, p1, d1, p2, d2].forEach(a => C.fadeOut(a, B4, 0.3));
  rest(k, proc, [4, 5], [[3, 4], [4, 5]], B4 + 0.4);
  tl.set(proc.nodes[3], { state: 'idle' }, B4 + 0.4);
  C.pulse(proc.nodes[4], B4 + 0.8, 1.25, 0.6);
  C.pop(clock, B4 + 1.2);
  tl.to(clock.minute, { r: 720 }, B4 + 1.4, 3.6, 'linear');
  C.pop(forever, B4 + 1.6);
  tl.hold(END);
};
