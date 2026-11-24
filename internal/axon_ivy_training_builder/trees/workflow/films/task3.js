/**
 * The Workflow tree, task level 3: each skill's short film. films/kit.js has what all films share;
 * src/film.js describes the kit (k) a film gets.
 */
import { P } from '../../../src/cast.js';
import { FILL, who, chip, beats, scene } from './kit.js';

export const films = {};

// ==================== Parallel tasks: two tasks at once ====================
films.gateway = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 4.6, 4.6, 4.4, 6.2);
  const proc = C.proc(L, 300, 196, [
    { kind: 'start', x: -250 },
    { kind: 'gateway', x: -165 },
    { kind: 'user', x: -25, y: -72, label: k.t('mgr') },
    { kind: 'user', x: -25, y: 72, label: k.t('hr') },
    { kind: 'gateway', x: 115 },
    { kind: 'end', x: 215 }
  ], { scale: 0.95, edges: [[0, 1], [1, 2], [1, 3], [2, 4], [3, 4], [4, 5]], file: 'LeaveRequest.p.json' });
  const at = i => proc.at(i);
  const tokA = C.token(L);
  const tokB = C.token(L);
  const tm = C.pill(L, at(2).x + 96, at(2).y - 16, k.f('max'), { fill: P.sky, size: 13, o: 0 });
  const th = C.pill(L, at(3).x + 96, at(3).y + 16, k.f('hanna'), { fill: P.teal, size: 13, o: 0 });

  k.say('two', B0);
  C.fadeIn(proc, B0);
  C.enter(proc, 0, B0 + 0.6);
  C.pulse(proc.nodes[2], B0 + 1.8, 1.1);
  C.pulse(proc.nodes[3], B0 + 2.2, 1.1);

  k.say('split', B1);
  C.run(proc, tokA, [0, 1], B1 + 0.2, 0.7);
  C.run(proc, tokA, [1, 2], B1 + 1.2, 0.9);
  C.run(proc, tokB, [1, 3], B1 + 1.2, 0.9, { quiet: true });

  k.say('work', B2);
  C.pop(tm, B2 + 0.3);
  C.pop(th, B2 + 0.6);
  [0, 1, 2].forEach(i => {
    C.pulse(proc.nodes[2], B2 + 1.1 + i * 0.9, 1.08, 0.45);
    C.pulse(proc.nodes[3], B2 + 1.5 + i * 0.9, 1.08, 0.45);
  });

  k.say('own', B3);
  C.dim(proc, B3 + 0.1, 0.2);
  C.fadeOut(tm, B3 + 0.1);
  C.fadeOut(th, B3 + 0.1);
  const insc = C.inscription(L, 300, 220, { w: 330, title: k.f('taskSwitchGateway'), tab: k.t('tasksTab'), split: 0.36, rows: [['TaskA', k.t('mgr')], ['TaskB', k.t('hr')]] });
  C.pop(insc, B3 + 0.6);
  C.fadeIn(insc.marks[0], B3 + 1.8, 0.3);
  C.fadeOut(insc.marks[0], B3 + 3.2, 0.3);
  C.fadeIn(insc.marks[1], B3 + 3.4, 0.3);
  tl.hold(END);
};

// ==================== Category: a place for every task ====================
films.category = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 4.2, 4.8, 5.4, 6.0);
  const list = C.list(L, 150, 236, { title: k.f('taskList'), owner: k.f('max'), w: 272, h: 244 });
  const cards = [k.f('approveLeave'), k.t('invoice'), k.f('contract')].map((title, i) =>
    C.card(L, list.slot(i).x, list.slot(i).y, { w: list.cardW, title, sub: '', size: 15 }));
  const insc = C.inscription(L, 450, 130, { w: 284, title: k.f('userTask'), tab: k.f('taskTab'), split: 0.36, rows: [[k.f('category'), '']] });
  const cms = C.doc(L, 450, 318, [k.t('cms')], { w: 286, mono: true });

  k.say('pile', B0);
  C.fadeIn(list, B0 + 0.2);
  cards.forEach((c, i) => C.pop(c, B0 + 0.7 + i * 0.3));

  k.say('field', B1);
  C.pop(insc, B1 + 0.3);
  C.fadeIn(insc.marks[0], B1 + 1.0, 0.3);
  C.type(insc.values[0], k.t('path'), B1 + 1.4, 10);

  k.say('group', B2);
  C.type(cards[0].sub, k.t('path'), B2 + 0.4, 18);
  C.type(cards[1].sub, k.t('other'), B2 + 1.0, 18);
  C.dim(cards[1], B2 + 2.8, 0.25);
  C.dim(cards[2], B2 + 2.8, 0.25);
  C.pulse(cards[0], B2 + 3.2, 1.06);

  k.say('cms', B3);
  C.pop(cms, B3 + 0.8);
  tl.hold(END);
};

// ==================== Custom fields: your own columns ====================
films.customfields = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 4.4, 5.8, 5.0, 5.2);
  const list = C.list(L, 150, 236, { title: k.f('taskList'), owner: k.f('max'), w: 272, h: 244 });
  const names = ['anna', 'ben', 'chloe'];
  const days = ['3', '10', '1'];
  const cards = names.map((n, i) => C.card(L, list.slot(i).x, list.slot(i).y, { w: list.cardW, title: k.f('leaveOf', k.f(n)), size: 15 }));
  const cols = days.map((d, i) => C.pill(L, list.slot(i).x + list.cardW / 2 - 12, list.slot(i).y - 23, k.t('col') + ': ' + d, { anchor: 'end', fill: P.gold, size: 12.5, o: 0 }));
  const insc = C.inscription(L, 450, 150, { w: 284, title: k.f('userTask'), tab: k.f('taskTab'), split: 0.44, rows: [[k.f('customFields'), ''], ['', '']] });
  const info = C.tag(L, 450, 318, k.t('info'), { color: P.gold, size: 14.5, lang: k.lang });

  k.say('need', B0);
  C.fadeIn(list, B0 + 0.2);
  cards.forEach((c, i) => C.pop(c, B0 + 0.7 + i * 0.3));

  k.say('field', B1);
  C.pop(insc, B1 + 0.3);
  C.fadeIn(insc.marks[0], B1 + 1.0, 0.3);
  C.type(insc.values[0], k.t('fieldName') + ' : ' + k.t('fieldType'), B1 + 1.4, 10);
  C.type(insc.values[1], k.t('fieldValue'), B1 + 3.4, 10);

  k.say('list', B2);
  cols.forEach((p, i) => C.pop(p, B2 + 0.6 + i * 0.5));

  k.say('info', B3);
  C.pop(info, B3 + 0.6);
  tl.hold(END);
};

// ==================== Notification: you have a new task ====================
films.notification = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 4.6, 4.4, 5.4, 5.8);
  const card = C.card(L, 300, 84, { w: 300, title: k.f('contract'), chip: k.f('hr'), chipFill: P.teal });
  const xs = [130, 300, 470];
  const people = ['hanna', 'ben', 'chloe'].map((id, i) => who(k, L, id, xs[i], 420, 0.62));
  const bells = xs.map(x => C.tag(L, x, 316, k.t('newTask'), { color: P.gold, size: 13, lang: k.lang }));
  const channels = [k.t('portal'), k.t('mail'), k.t('teams')].map((t, i) => C.pill(L, 190 + i * 110, 200, t, { fill: P.sky, size: 14, o: 0 }));
  const insc = C.inscription(L, 300, 200, { w: 320, title: k.f('userTask'), tab: k.f('taskTab'), split: 0.42, rows: [[k.f('notification'), k.t('suppress')]] });

  k.say('new', B0);
  C.pop(card, B0 + 0.3);
  people.forEach((p, i) => C.pop(p, B0 + 1.0 + i * 0.3));

  k.say('notify', B1);
  bells.forEach((b, i) => {
    C.pop(b, B1 + 0.5 + i * 0.6);
    C.shake(b, B1 + 0.9 + i * 0.6);
  });

  k.say('channels', B2);
  channels.forEach((c, i) => C.pop(c, B2 + 0.8 + i * 0.7));

  k.say('suppress', B3);
  channels.forEach(c => C.fadeOut(c, B3 + 0.1));
  C.pop(insc, B3 + 0.6);
  C.fadeIn(insc.marks[0], B3 + 1.6, 0.3);
  bells.forEach(b => C.fadeOut(b, B3 + 2.4, 0.5));
  tl.hold(END);
};

// ==================== Joining tasks: waiting for each other ====================
films.join = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 4.0, 4.8, 5.4, 7.2);
  const proc = C.proc(L, 300, 196, [
    { kind: 'start', x: -250 },
    { kind: 'gateway', x: -165 },
    { kind: 'user', x: -25, y: -72, label: k.t('mgr') },
    { kind: 'user', x: -25, y: 72, label: k.t('hr') },
    { kind: 'gateway', x: 115 },
    { kind: 'end', x: 215 }
  ], { scale: 0.95, edges: [[0, 1], [1, 2], [1, 3], [2, 4], [3, 4], [4, 5]], file: 'LeaveRequest.p.json' });
  const at = i => proc.at(i);
  const tokA = C.token(L);
  const tokB = C.token(L);
  const waits = C.tag(L, 470, 122, k.t('waits'), { color: P.gold, size: 14.5, lang: k.lang });
  const in1 = C.pill(L, at(4).x + 36, at(4).y - 48, 'in1', { fill: P.cream, size: 13, o: 0 });
  const in2 = C.pill(L, at(4).x + 36, at(4).y + 48, 'in2', { fill: P.cream, size: 13, o: 0 });

  // the film starts where the last one ended: both tasks are being worked on
  k.say('join', B0);
  C.fadeIn(proc, B0);
  C.finish(proc, 0, B0 + 0.3);
  C.finish(proc, 1, B0 + 0.3);
  tl.set(proc.edge(0, 1), { state: 'done' }, B0 + 0.3);
  tl.set(proc.edge(1, 2), { state: 'done' }, B0 + 0.3);
  tl.set(proc.edge(1, 3), { state: 'done' }, B0 + 0.3);
  C.enter(proc, 2, B0 + 0.6);
  C.enter(proc, 3, B0 + 0.6);
  C.pulse(proc.nodes[4], B0 + 2.0, 1.2, 0.6);

  k.say('wait', B1);
  C.run(proc, tokA, [2, 4], B1 + 0.3, 1.0, { hold: true });
  C.pop(waits, B1 + 1.7);
  C.pulse(proc.nodes[3], B1 + 2.6, 1.08);

  k.say('data', B2);
  C.run(proc, tokB, [3, 4], B2 + 0.3, 1.0, { hold: true });
  C.fadeOut(waits, B2 + 1.5);
  C.pop(in1, B2 + 1.8);
  C.pop(in2, B2 + 2.2);
  C.arrive(proc, [tokA, tokB], 4, B2 + 3.0);
  C.run(proc, tokA, [4, 5], B2 + 3.5, 0.7);
  C.finish(proc, 5, B2 + 4.8);

  k.say('map', B3);
  C.dim(proc, B3 + 0.1, 0.2);
  C.fadeOut(in1, B3 + 0.1);
  C.fadeOut(in2, B3 + 0.1);
  const insc = C.inscription(L, 300, 220, { w: 330, title: k.f('taskSwitchGateway'), tab: k.f('output'), split: 0.42, rows: [['out', 'in1'], ['out.hrNote', '']] });
  C.pop(insc, B3 + 0.5);
  C.fadeIn(insc.marks[0], B3 + 1.6, 0.3);
  C.fadeOut(insc.marks[0], B3 + 3.4, 0.3);
  C.fadeIn(insc.marks[1], B3 + 3.6, 0.3);
  C.type(insc.values[1], k.t('note'), B3 + 4.0, 16);
  tl.hold(END);
};

// ==================== Task code: right after it is created ====================
films.taskcode = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 4.0, 5.0, 5.4, 5.6);
  const insc = C.inscription(L, 166, 152, { w: 304, title: k.f('userTask'), tab: k.f('taskTab'), split: 0.42, rows: [[k.f('name'), k.f('approveLeave')], [k.f('responsible'), k.f('manager')], [k.t('code'), '…']] });
  const code = C.doc(L, 300, 322, [k.t('line')], { w: 440, mono: true });
  const card = C.card(L, 466, 130, { w: 232, title: k.f('approveLeave'), chip: k.f('open'), chipFill: FILL.open, size: 14.5 });
  const log = C.log(L, 300, 400, k.t('log'), { w: 300 });

  k.say('where', B0);
  C.pop(insc, B0 + 0.3);
  C.fadeIn(insc.marks[2], B0 + 1.4, 0.3);

  k.say('when', B1);
  C.pop(code, B1 + 0.4);
  C.pop(card, B1 + 2.0);

  k.say('task', B2);
  C.pulse(code, B2 + 0.5, 1.05);
  C.pop(log, B2 + 1.8);

  k.say('use', B3);
  C.fadeOut(insc.marks[2], B3 + 0.4, 0.3);
  C.fadeIn(insc.marks[0], B3 + 0.8, 0.3);
  C.fadeIn(insc.marks[1], B3 + 1.4, 0.3);
  tl.hold(END);
};

// ==================== Cancel by a signal: called off ====================
films.signalcancel = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 4.6, 5.2, 5.2, 6.0);
  // a User Task with a Signal Boundary Event (node 1.5), and the path that leaves from it
  const proc = C.proc(L, 300, 100, [
    { kind: 'start', x: -230 },
    { kind: 'user', x: -90, label: k.t('approve'), boundary: true },
    { kind: 'end', x: 60 },
    { kind: 'script', x: 90, y: 112, label: k.t('inform') },
    { kind: 'end', x: 210, y: 112 }
  ], { scale: 1, edges: [[0, 1], [1, 2], [1.5, 3], [3, 4]], frame: { b: 24 }, file: 'LeaveRequest.p.json' });
  const tok = C.token(L);
  const list = C.list(L, 138, 352, { title: k.f('taskList'), owner: k.f('max'), w: 252, h: 132 });
  const card = C.card(L, list.slot(0).x, list.slot(0).y, { w: list.cardW, title: k.f('approveLeave'), chip: k.f('open'), chipFill: FILL.open, size: 14.5 });
  const anna = who(k, L, 'anna', 530, 422, 0.6);
  const signal = C.doc(L, 492, 324, [k.t('code')], { w: 186, mono: true });
  const system = C.pill(L, proc.at(3).x, proc.at(3).y + 46, k.f('system'), { fill: P.sky, size: 12.5, o: 0 });

  // the process is already waiting in the User Task
  k.say('wait', B0);
  C.fadeIn(proc, B0);
  C.finish(proc, 0, B0 + 0.4);
  tl.set(proc.edge(0, 1), { state: 'done' }, B0 + 0.4);
  C.enter(proc, 1, B0 + 0.6);
  C.fadeIn(list, B0 + 1.0);
  C.pop(card, B0 + 1.6);

  k.say('signal', B1);
  C.pop(anna, B1 + 0.3);
  C.pop(signal, B1 + 1.4);
  tl.to(signal, { x: proc.at(1.5).x + 40, y: proc.at(1.5).y + 34, s: 0.55 }, B1 + 3.0, 1.0, 'inOut');
  C.fadeOut(signal, B1 + 4.0, 0.3);

  k.say('destroy', B2);
  C.enter(proc, 1.5, B2 + 0.2);
  tl.set(proc.nodes[1], { state: 'idle' }, B2 + 0.6);
  tl.set(card.chip, { text: k.t('destroyedWord'), fill: P.muted }, B2 + 1.0);
  C.shake(card, B2 + 1.0);
  C.fadeOut(card, B2 + 2.8, 0.5);

  k.say('path', B3);
  C.run(proc, tok, [1.5, 3], B3 + 0.4, 1.2);
  C.pop(system, B3 + 2.0);
  C.run(proc, tok, [3, 4], B3 + 3.2, 0.8);
  C.finish(proc, 4, B3 + 4.6);
  tl.hold(END);
};

// ==================== Tasks in code ====================
films.taskapi = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 4.4, 5.4, 5.2, 5.8);
  const code1 = C.doc(L, 176, 92, [k.t('l1')], { w: 264, mono: true });
  const out1 = C.pill(L, 452, 92, k.f('approveLeave'), { fill: P.cream, size: 13.5, o: 0 });
  const code2 = C.doc(L, 210, 204, [k.t('l2'), k.t('l3')], { w: 332, mono: true });
  const found = C.pill(L, 478, 204, k.t('found'), { fill: P.greenLight, size: 14, o: 0 });
  const dev = who(k, L, 'developer', 110, 420, 0.62);
  const anna = who(k, L, 'anna', 110, 420, 0.62);
  const denied = C.log(L, 384, 330, k.t('denied'), { w: 380, level: 'ERROR' });

  k.say('current', B0);
  C.pop(code1, B0 + 0.4);
  C.pop(out1, B0 + 1.8);

  k.say('query', B1);
  C.pop(code2, B1 + 0.4);
  C.pop(dev, B1 + 1.4);
  C.pop(found, B1 + 2.8);

  k.say('perm', B2);
  C.fadeOut(dev, B2 + 0.2);
  C.pop(anna, B2 + 0.7);
  C.fadeOut(found, B2 + 1.4);
  C.pop(denied, B2 + 2.0);
  C.shake(denied, B2 + 2.5);

  k.say('dev', B3);
  C.fadeOut(anna, B3 + 0.3);
  C.fadeOut(denied, B3 + 0.3);
  C.fadeIn(dev, B3 + 0.9);
  C.pop(found, B3 + 1.8);
  tl.hold(END);
};
