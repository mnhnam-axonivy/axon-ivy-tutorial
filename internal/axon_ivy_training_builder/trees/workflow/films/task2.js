/**
 * The Workflow tree, task level 2: each skill's short film. films/kit.js has what all films share;
 * src/film.js describes the kit (k) a film gets.
 */
import { P } from '../../../src/cast.js';
import { FILL, who, chip, beats, scene } from './kit.js';

export const films = {};

// ==================== Data between tasks: data that waits too ====================
films.data = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, B4, END] = beats(k.opening(), 4.2, 5.0, 4.0, 4.6, 6.4);
  const anna = who(k, L, 'anna', 76, 420, 0.6);
  const aform = C.form(L, 170, 212, { w: 224, title: k.f('approveLeave'), rows: [[k.f('days'), ''], [k.f('from'), '']] });
  const max = who(k, L, 'max', 524, 420, 0.6);
  const mform = C.form(L, 430, 212, { w: 224, title: k.f('approveLeave'), rows: [[k.f('days'), ''], [k.f('from'), '']] });
  const db = C.db(L, 300, 348, { label: k.t('db') });
  const cal = C.calendar(L, 300, 74, { w: 82, day: k.t('days', 1), size: 17 });
  const data = C.doc(L, 170, 212, [k.f('threeDays'), k.f('monday')], { w: 116 });

  k.say('fill', B0);
  C.pop(anna, B0 + 0.2);
  C.pop(aform, B0 + 0.5);
  C.type(aform.values[0], k.f('threeDays'), B0 + 1.2, 10);
  C.type(aform.values[1], k.f('monday'), B0 + 2.0, 10);

  k.say('store', B1);
  C.pop(db, B1 + 0.2);
  C.pop(data, B1 + 0.5, { s: 0.8 });
  tl.to(data, { x: 300, y: 336, s: 0.55 }, B1 + 1.3, 1.0, 'inOut');
  C.fadeOut(data, B1 + 2.3, 0.3);
  C.pulse(db, B1 + 2.3, 1.1);
  C.fadeOut(aform, B1 + 2.8);
  C.dim(anna, B1 + 2.8, 0.35);

  k.say('wait', B2);
  C.pop(cal, B2 + 0.2);
  [2, 3, 4].forEach((d, i) => {
    C.say(cal.day, k.t('days', d), B2 + 1.1 + i * 0.8);
    C.pulse(cal, B2 + 1.1 + i * 0.8, 1.08, 0.3);
  });

  k.say('load', B3);
  C.pop(max, B3 + 0.2);
  C.pop(mform, B3 + 0.6);
  C.fadeIn(data, B3 + 1.2, 0.2);
  tl.to(data, { x: 430, y: 212, s: 0.8 }, B3 + 1.3, 1.0, 'inOut');
  C.fadeOut(data, B3 + 2.3, 0.2);
  C.say(mform.values[0], k.f('threeDays'), B3 + 2.3);
  C.say(mform.values[1], k.f('monday'), B3 + 2.3);
  C.pulse(mform, B3 + 2.3, 1.06);

  k.say('output', B4);
  C.fadeOut(db, B4 + 0.1);
  C.fadeOut(cal, B4 + 0.1);
  const insc = C.inscription(L, 300, 350, { w: 292, title: k.f('taskSwitch'), tab: k.f('output'), split: 0.45, rows: [['out', 'in1']] });
  C.pop(insc, B4 + 0.6);
  C.fadeIn(insc.marks[0], B4 + 1.8, 0.3);
  tl.hold(END);
};

// ==================== Priority: what first? ====================
films.priority = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, B4, END] = beats(k.opening(), 4.0, 4.8, 5.4, 4.6, 5.6);
  const list = C.list(L, 168, 228, { title: k.f('taskList'), owner: k.f('max'), w: 290, h: 296 });
  const titles = [k.t('room'), k.t('invoice'), k.f('approveLeave'), k.t('paper')];
  const cards = titles.map((title, i) => C.card(L, list.slot(i).x, list.slot(i).y, { w: list.cardW, title, chip: k.f('normal'), chipFill: FILL.normal, size: 15 }));
  const insc = C.inscription(L, 452, 128, { w: 262, title: k.f('userTask'), tab: k.f('taskTab'), split: 0.42, rows: [[k.f('priority'), k.f('normal')]] });

  k.say('list', B0);
  C.fadeIn(list, B0 + 0.2);
  cards.forEach((c, i) => C.pop(c, B0 + 0.7 + i * 0.25));

  k.say('field', B1);
  C.pop(insc, B1 + 0.3);
  C.fadeIn(insc.marks[0], B1 + 1.4, 0.3);

  k.say('high', B2);
  C.say(insc.values[0], k.f('high'), B2 + 0.5);
  C.pulse(insc.values[0], B2 + 0.5, 1.2);
  chip(k, cards[2], 'high', B2 + 1.3);
  [[2, 0], [0, 1], [1, 2]].forEach(([c, slot]) => C.move(cards[c], list.slot(slot).x, list.slot(slot).y, B2 + 2.2, 0.8));

  k.say('script', B3);
  C.say(insc.values[0], k.t('script'), B3 + 0.6);
  C.pulse(insc, B3 + 0.6, 1.05);

  k.say('only', B4);
  const only = C.tag(L, 452, 268, k.t('onlyOrder'), { color: P.gold, size: 14.5, lang: k.lang });
  C.pop(only, B4 + 0.4);
  const clock = C.clock(L, 452, 362, { r: 34 });
  C.pop(clock, B4 + 2.2);
  tl.to(clock.minute, { r: 360 }, B4 + 2.4, 2.4, 'linear');
  tl.hold(END);
};

// ==================== Delay: not before next week ====================
films.delay = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, B4, END] = beats(k.opening(), 4.2, 4.8, 4.0, 4.8, 5.2);
  const cal = C.calendar(L, 108, 108, { w: 96, day: k.t('day', 1), size: 19 });
  const insc = C.inscription(L, 405, 104, { w: 330, title: k.f('userTask'), tab: k.f('taskTab'), split: 0.28, rows: [[k.f('delay'), '']] });
  const list = C.list(L, 418, 330, { title: k.f('taskList'), owner: k.f('hanna'), w: 300, h: 168, empty: k.t('empty') });
  const ghost = C.card(L, 140, 330, { w: 220, title: k.t('call'), chip: k.f('delayed'), chipFill: FILL.delayed, ghost: true, size: 15 });
  const real = C.card(L, list.slot(0).x, list.slot(0).y, { w: list.cardW, title: k.t('call'), chip: k.f('open'), chipFill: FILL.open });

  k.say('why', B0);
  C.pop(cal, B0 + 0.3);
  C.fadeIn(list, B0 + 1.2);

  k.say('field', B1);
  C.pop(insc, B1 + 0.3);
  C.fadeIn(insc.marks[0], B1 + 0.9, 0.3);
  C.type(insc.values[0], 'new Duration("7D")', B1 + 1.2, 16);

  k.say('hidden', B2);
  C.pop(ghost, B2 + 0.4);
  C.pulse(ghost, B2 + 1.8, 1.06);
  C.pulse(list.empty, B2 + 2.4, 1.15);

  k.say('shows', B3);
  [2, 3, 4, 5, 6, 7, 8].forEach((d, i) => C.say(cal.day, k.t('day', d), B3 + 0.3 + i * 0.28));
  C.pulse(cal, B3 + 2.3, 1.1);
  C.fadeOut(ghost, B3 + 2.6, 0.3);
  C.fadeOut(list.empty, B3 + 2.6, 0.2);
  C.pop(real, B3 + 2.8);

  k.say('expiry', B4);
  const clock = C.clock(L, 108, 300, { r: 36 });
  C.pop(clock, B4 + 0.5);
  tl.to(clock.minute, { r: 360 }, B4 + 1.2, 2.6, 'linear');
  tl.hold(END);
};

// ==================== Expiry: when time runs out ====================
films.expiry = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, B4, END] = beats(k.opening(), 4.2, 6.0, 3.8, 5.0, 6.6);
  const s1 = scene(k);
  const clock = C.clock(L, 300, 76, { r: 38 });
  const mList = C.list(s1, 150, 262, { title: k.f('taskList'), owner: k.f('max'), w: 262, h: 150 });
  const hList = C.list(s1, 450, 262, { title: k.f('taskList'), owner: k.f('hr'), w: 262, h: 150, empty: '' });
  const max = who(k, s1, 'max', 150, 420, 0.55);
  const hanna = who(k, s1, 'hanna', 450, 420, 0.55);
  const card = C.card(L, mList.slot(0).x, mList.slot(0).y, { w: mList.cardW, title: k.f('approveLeave'), chip: k.f('normal'), chipFill: FILL.normal, size: 15 });
  const insc = C.inscription(L, 300, 236, {
    w: 340, title: k.f('expiry'), tab: k.f('taskTab'), split: 0.38,
    rows: [[k.f('timeout'), k.t('twoDays')], [k.f('responsible'), k.f('hr')], [k.f('priority'), k.f('high')]]
  });

  k.say('wait', B0);
  C.pop(clock, B0 + 0.2);
  C.fadeIn(s1, B0 + 0.4);
  [mList, hList].forEach((l, i) => C.fadeIn(l, B0 + 0.5 + i * 0.2));
  C.pop(max, B0 + 0.9);
  C.pop(hanna, B0 + 1.1);
  C.pop(card, B0 + 1.4);
  tl.to(clock.minute, { r: 720 }, B0 + 1.0, 3.0, 'linear');
  tl.to(clock.hour, { r: 120 }, B0 + 1.0, 3.0, 'linear');

  k.say('timeout', B1);
  C.dim(s1, B1 + 0.2, 0.2);
  C.dim(card, B1 + 0.2, 0.2);
  C.pop(insc, B1 + 0.5);
  [0, 1, 2].forEach(i => {
    C.fadeIn(insc.marks[i], B1 + 1.4 + i * 1.3, 0.2);
    if (i < 2) C.fadeOut(insc.marks[i], B1 + 2.6 + i * 1.3, 0.2);
  });

  k.say('expires', B2);
  C.fadeOut(insc, B2 + 0.1);
  tl.to(s1, { o: 1 }, B2 + 0.3, 0.4, 'linear');
  tl.to(card, { o: 1 }, B2 + 0.3, 0.4, 'linear');
  tl.to(clock.minute, { r: 720 + 1440 }, B2 + 0.4, 1.4, 'inOut');
  tl.to(clock.hour, { r: 120 + 120 }, B2 + 0.4, 1.4, 'inOut');
  C.shake(clock, B2 + 1.9);
  const later = C.tag(L, 300, 150, k.t('later'), { color: P.red, lang: k.lang });
  C.pop(later, B2 + 1.9);
  C.shake(card, B2 + 2.4);

  k.say('moves', B3);
  C.fadeOut(later, B3);
  C.move(card, hList.slot(0).x, hList.slot(0).y, B3 + 0.4, 1.0);
  chip(k, card, 'high', B3 + 1.5);
  C.pulse(hanna, B3 + 2.0, 1.1);

  k.say('defaults', B4);
  const defaults = C.tag(L, 300, 150, k.t('defaults'), { color: P.gold, size: 15, lang: k.lang });
  C.pop(defaults, B4 + 0.6);
  tl.hold(END);
};

// ==================== Name and description: a name that says something ====================
films.taskname = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 4.6, 5.0, 5.0, 6.6);
  const left = scene(k);
  const list = C.list(left, 140, 236, { title: k.f('taskList'), owner: k.f('max'), w: 252, h: 240 });
  const cards = [0, 1, 2].map(i => C.card(left, list.slot(i).x, list.slot(i).y, { w: list.cardW, title: k.t('approve'), size: 15 }));
  const insc = C.inscription(L, 436, 150, { w: 312, title: k.f('userTask'), tab: k.f('taskTab'), split: 0.34, rows: [[k.f('name'), k.t('approve')], [k.t('desc'), '']] });
  const names = ['Anna', 'Ben', 'Chloé'];

  k.say('same', B0);
  C.fadeIn(list, B0 + 0.2);
  cards.forEach((c, i) => C.pop(c, B0 + 0.7 + i * 0.3));

  k.say('macro', B1);
  C.pop(insc, B1 + 0.3);
  C.fadeIn(insc.marks[0], B1 + 1.0, 0.3);
  C.say(insc.values[0], '', B1 + 1.4);
  C.type(insc.values[0], k.t('nameMacro'), B1 + 1.5, 12);

  k.say('better', B2);
  cards.forEach((c, i) => {
    C.say(c.title, k.t('leaveOf', names[i]), B2 + 0.5 + i * 0.5);
    C.pulse(c, B2 + 0.5 + i * 0.5, 1.06, 0.4);
  });
  C.fadeOut(insc.marks[0], B2 + 2.2, 0.2);
  C.fadeIn(insc.marks[1], B2 + 2.4, 0.2);
  C.type(insc.values[1], k.t('descMacro'), B2 + 2.6, 14);

  k.say('in1', B3);
  C.dim(left, B3 + 0.2, 0.12);
  const which = C.doc(L, 146, 222, [k.t('inUserTask'), k.t('inSwitch')], { w: 232, mono: true });
  const err = C.log(L, 300, 392, k.t('err'), { w: 440, level: 'ERROR' });
  C.pop(which, B3 + 0.9);
  C.pulse(which.lines[1], B3 + 2.6, 1.12);
  C.pop(err, B3 + 3.8);
  tl.hold(END);
};

// ==================== Session timeout: halfway, and then lunch ====================
films.timeout = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 5.2, 4.4, 5.6, 4.8);
  const card = C.card(L, 220, 96, { w: 330, title: k.f('contract'), chip: k.f('open'), chipFill: FILL.open });
  const form = C.form(L, 220, 244, { w: 250, title: k.f('contract'), rows: [[k.f('days'), '3']] });
  const ben = who(k, L, 'ben', 492, 420, 0.7);
  const hanna = who(k, L, 'hanna', 492, 420, 0.7);
  const clock = C.clock(L, 492, 150, { r: 40 });
  const ended = C.tag(L, 468, 252, k.t('sessionEnded'), { color: P.red, size: 14.5, lang: k.lang });

  k.say('progress', B0);
  C.pop(card, B0 + 0.3);
  C.pop(ben, B0 + 0.5);
  chip(k, card, 'inProgress', B0 + 1.2);
  C.pop(form, B0 + 1.6);
  C.say(form.values[0], '', B0 + 3.0);
  C.type(form.values[0], '5', B0 + 3.2);

  k.say('timeout', B1);
  C.fadeOut(ben, B1 + 0.3, 0.5);
  C.pop(clock, B1 + 0.6);
  tl.to(clock.minute, { r: 1080 }, B1 + 0.8, 1.8, 'inOut');
  C.pop(ended, B1 + 2.6);
  C.shake(ended, B1 + 3.0);

  k.say('reset', B2);
  chip(k, card, 'open', B2 + 0.5);
  C.say(form.values[0], '3', B2 + 2.6);
  C.pulse(form, B2 + 2.6, 1.06);

  k.say('again', B3);
  C.fadeOut(ended, B3);
  C.fadeOut(clock, B3);
  C.pop(hanna, B3 + 0.5);
  chip(k, card, 'inProgress', B3 + 1.5);
  tl.hold(END);
};

// ==================== Skip Tasklist: straight on ====================
films.skip = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 5.6, 4.6, 5.2, 6.4);
  const proc = C.proc(L, 300, 92, [{ kind: 'dialog', label: k.t('request') }, { kind: 'switch' }, { kind: 'dialog', label: k.t('next') }], { w: 480, file: 'LeaveRequest.p.json' });
  const tok = C.token(L);
  const anna = who(k, L, 'anna', 80, 422, 0.6);
  const role = C.pill(L, 80, 348, k.f('employee'), { fill: P.sky, size: 12.5, o: 0 });
  const list = C.list(L, 320, 282, { title: k.f('taskList'), owner: k.f('anna'), w: 256, h: 132 });
  const card = C.card(L, proc.at(1).x, proc.at(1).y, { w: list.cardW, title: k.t('nextTask'), chip: k.f('open'), chipFill: FILL.open });
  const insc = C.inscription(L, 330, 284, { w: 330, title: k.f('taskSwitch'), tab: k.f('taskTab'), split: 0.28, rows: [[k.t('options'), k.t('skipOn')]] });
  const forE = C.tag(L, proc.at(1).x, 172, k.t('forEmployee'), { color: P.sky, size: 14.5, lang: k.lang });
  const forM = C.tag(L, proc.at(1).x, 172, k.t('forManager'), { color: P.gold, size: 14.5, lang: k.lang });
  const mlist = C.list(L, 330, 290, { title: k.f('taskList'), owner: k.f('manager'), w: 256, h: 132 });
  const mcard = C.card(L, mlist.slot(0).x, mlist.slot(0).y, { w: mlist.cardW, title: k.t('nextTask'), chip: k.f('open'), chipFill: FILL.open });
  const waits = C.tag(L, 330, 398, k.t('waits'), { color: P.red, size: 14.5, lang: k.lang });

  k.say('normal', B0);
  C.fadeIn(proc, B0);
  C.pop(anna, B0 + 0.3);
  C.pop(role, B0 + 0.7);
  C.enter(proc, 0, B0 + 0.9);
  C.run(proc, tok, [0, 1], B0 + 1.5, 0.9);
  C.fadeIn(list, B0 + 2.6);
  C.pop(card, B0 + 3.0, { s: 0.5 });
  tl.to(card, { x: list.slot(0).x, y: list.slot(0).y, s: 1 }, B0 + 3.5, 0.9, 'inOut');

  k.say('skip', B1);
  C.fadeOut(list, B1 + 0.1);
  C.fadeOut(card, B1 + 0.1);
  C.pop(insc, B1 + 0.5);
  C.fadeIn(insc.marks[0], B1 + 1.6, 0.3);

  k.say('allowed', B2);
  C.fadeOut(insc, B2 + 0.1);
  C.pop(forE, B2 + 0.5);
  C.pulse(anna, B2 + 1.4, 1.1);
  C.run(proc, tok, [1, 2], B2 + 2.0, 1.0);

  // the same switch again, this time with a task Anna may not do
  k.say('notallowed', B3);
  tl.set(proc.nodes[2], { state: 'idle' }, B3 + 0.2);
  tl.set(proc.edge(1, 2), { state: 'idle' }, B3 + 0.2);
  tl.set(proc.nodes[1], { state: 'active' }, B3 + 0.2);
  C.fadeOut(forE, B3);
  C.pop(forM, B3 + 0.5);
  C.shake(proc.nodes[1], B3 + 1.6);
  C.fadeIn(mlist, B3 + 2.2);
  C.pop(mcard, B3 + 2.8);
  C.pop(waits, B3 + 3.8);
  tl.hold(END);
};
