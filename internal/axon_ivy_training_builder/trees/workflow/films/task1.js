/**
 * The Workflow tree, task level 1: each skill's short film. films/kit.js has what all films share;
 * src/film.js describes the kit (k) a film gets.
 */
import { P } from '../../../src/cast.js';
import { FILL, who, chip, beats, scene } from './kit.js';

export const films = {};

// ==================== Task: the process stops and waits ====================
films.task = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, B4, END] = beats(k.opening(), 4.6, 5, 4.6, 4.6, 4.6);
  const proc = C.proc(L, 300, 104, [{ kind: 'start' }, { kind: 'script', label: k.t('check') }, { kind: 'user', label: k.t('approve') }, { kind: 'end' }], { w: 480, file: 'LeaveRequest.p.json' });
  const tok = C.token(L);

  k.say('runs', B0);
  C.fadeIn(proc, B0);
  C.enter(proc, 0, B0 + 0.6);
  C.run(proc, tok, [0, 1, 2], B0 + 1.1, 0.8);

  k.say('stops', B1);
  C.pulse(proc.nodes[2], B1, 1.12, 0.6);
  const wait = C.tag(L, proc.at(2).x, 180, k.t('waiting'), { color: P.gold, lang: k.lang });
  C.pop(wait, B1 + 0.3);
  const list = C.list(L, 205, 326, { title: k.f('taskList'), owner: k.f('max'), w: 290, h: 156 });
  C.fadeIn(list, B1 + 0.9);
  const card = C.card(L, proc.at(2).x, proc.at(2).y, { w: list.cardW, title: k.f('approveLeave'), chip: k.f('open'), chipFill: FILL.open });
  C.pop(card, B1 + 1.5, { s: 0.5 });
  const slot = list.slot(0);
  tl.to(card, { x: slot.x, y: slot.y, s: 1 }, B1 + 2.1, 1.0, 'inOut');

  k.say('list', B2);
  const max = who(k, L, 'max', 485, 418, 0.8);
  C.pop(max, B2 + 0.3);
  C.pulse(card, B2 + 1.4, 1.08);
  chip(k, card, 'inProgress', B2 + 2.4);

  k.say('done', B3);
  chip(k, card, 'done', B3 + 0.3);
  C.fadeOut(wait, B3 + 0.6);
  C.run(proc, tok, [2, 3], B3 + 1.2, 0.9);
  C.finish(proc, 3, B3 + 2.8);

  k.say('point', B4);
  const sum = C.tag(L, 300, 200, k.t('summary'), { color: P.red, size: 16, lang: k.lang });
  C.pop(sum, B4 + 0.4);
  C.pulse(proc.nodes[2], B4 + 0.5, 1.12);
  tl.hold(END);
};

// ==================== Task list: where the work shows up ====================
films.tasklist = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, B4, B5, END] = beats(k.opening(), 4.4, 4.2, 4.0, 4.0, 4.0, 5.4);
  const s1 = scene(k);
  const lists = [
    C.list(s1, 155, 205, { title: k.f('taskList'), owner: k.f('ben'), w: 262, h: 190 }),
    C.list(s1, 445, 205, { title: k.f('taskList'), owner: k.f('hanna'), w: 262, h: 190 })
  ];
  const people = [who(k, s1, 'ben', 155, 420, 0.62), who(k, s1, 'hanna', 445, 420, 0.62)];
  const old = lists.map(list => C.card(s1, list.slot(0).x, list.slot(0).y, { w: list.cardW, title: k.t('paper'), chip: k.f('open'), chipFill: FILL.open }));
  const fresh = lists.map(list => C.card(s1, list.slot(1).x, list.slot(1).y, { w: list.cardW, title: k.f('contract'), chip: k.f('open'), chipFill: FILL.open }));

  k.say('list', B0);
  lists.forEach((l, i) => C.fadeIn(l, B0 + 0.2 + i * 0.3));
  people.forEach((p, i) => C.pop(p, B0 + 0.8 + i * 0.3));
  old.forEach((c, i) => C.pop(c, B0 + 1.6 + i * 0.2));

  k.say('new', B1);
  fresh.forEach((c, i) => C.pop(c, B1 + 0.6 + i * 0.25));

  k.say('pick', B2);
  C.pulse(people[0], B2 + 0.4, 1.1);
  C.pulse(fresh[0], B2 + 0.9, 1.08);
  chip(k, fresh[0], 'inProgress', B2 + 1.1);

  k.say('others', B3);
  C.shake(fresh[1], B3 + 0.4);
  C.dim(fresh[1], B3 + 0.9, 0.28);

  k.say('done', B4);
  chip(k, fresh[0], 'done', B4 + 0.4);
  C.fadeOut(fresh[0], B4 + 2.4, 0.5);
  C.fadeOut(fresh[1], B4 + 2.4, 0.5);

  k.say('where', B5);
  C.fadeOut(s1, B5, 0.5);
  const portal = C.tag(L, 300, 180, k.t('portal'), { color: P.green, size: 18, lang: k.lang });
  const dev = C.tag(L, 300, 262, k.t('devUi'), { color: P.sky, size: 18, lang: k.lang });
  C.pop(portal, B5 + 0.6);
  C.pop(dev, B5 + 2.6);
  tl.hold(END);
};

// ==================== User Task: a dialog that waits ====================
films.usertask = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, B4, END] = beats(k.opening(), 5.4, 5.0, 3.8, 5.0, 6.2);
  const proc = C.proc(L, 300, 96, [{ kind: 'start' }, { kind: 'dialog', label: k.t('request') }, { kind: 'user', label: k.t('approve') }, { kind: 'end' }], { w: 480, file: 'LeaveRequest.p.json' });
  const tok = C.token(L);
  const anna = who(k, L, 'anna', 90, 422, 0.6);
  const form = C.form(L, 168, 266, { w: 220, title: k.t('leave'), rows: [[k.f('days'), k.f('threeDays')]], button: k.t('submit') });
  const max = who(k, L, 'max', 510, 422, 0.6);
  const list = C.list(L, 440, 262, { title: k.f('taskList'), owner: k.f('max'), w: 236, h: 146 });

  k.say('request', B0);
  C.fadeIn(proc, B0);
  C.enter(proc, 0, B0 + 0.4);
  C.run(proc, tok, [0, 1], B0 + 0.8, 0.8);
  C.pop(anna, B0 + 0.9);
  C.pop(form, B0 + 1.6);
  C.pulse(form.button, B0 + 3.4, 1.15);

  k.say('create', B1);
  C.fadeOut(form, B1 + 0.2);
  C.run(proc, tok, [1, 2], B1 + 0.4, 0.9);
  const waits = C.tag(L, proc.at(2).x, 168, k.t('waits'), { color: P.gold, size: 14.5, lang: k.lang });
  C.pop(waits, B1 + 1.5);
  C.fadeIn(list, B1 + 1.6);
  const card = C.card(L, proc.at(2).x, proc.at(2).y, { w: list.cardW, title: k.f('approveLeave'), chip: k.f('open'), chipFill: FILL.open, size: 15 });
  C.pop(card, B1 + 2.0, { s: 0.5 });
  tl.to(card, { x: list.slot(0).x, y: list.slot(0).y, s: 1 }, B1 + 2.5, 0.9, 'inOut');
  C.fadeOut(waits, B1 + 3.6);

  k.say('list', B2);
  C.pop(max, B2 + 0.3);
  C.pulse(list, B2 + 1.1, 1.05);
  C.pulse(card, B2 + 2.0, 1.08);

  k.say('open', B3);
  C.fadeOut(list, B3 + 0.2);
  C.fadeOut(card, B3 + 0.2);
  const approve = C.form(L, 430, 266, { w: 250, title: k.t('approveTitle'), rows: [[k.f('anna'), k.f('threeDays')]], button: k.t('approveBtn') });
  C.pop(approve, B3 + 0.7);
  C.pulse(approve.button, B3 + 3.0, 1.15);

  k.say('on', B4);
  C.fadeOut(approve, B4 + 0.3);
  C.run(proc, tok, [2, 3], B4 + 0.7, 0.9);
  C.finish(proc, 3, B4 + 2.2);
  const ok = C.check(L, 430, 266, { r: 26 });
  C.pop(ok, B4 + 1.8);
  tl.hold(END);
};

// ==================== Task Switch: passing the baton ====================
films.taskswitch = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, B4, END] = beats(k.opening(), 4.6, 5.0, 4.6, 5.2, 6.0);
  const proc = C.proc(L, 300, 100, [
    { kind: 'start' }, { kind: 'dialog', label: k.t('fill') }, { kind: 'switch', label: k.t('toManager') }, { kind: 'script', label: k.t('book') }, { kind: 'end' }
  ], { w: 520, file: 'LeaveRequest.p.json' });
  const tok = C.token(L);
  // which task each part of the process runs in, under the editor
  const x0 = proc.at(0).x - 18;
  const xs = proc.at(2).x;
  const x1 = proc.at(4).x + 18;
  const b1 = C.line(L, `M${x0} 192 V206 H${xs - 6} V192`, { color: P.red, width: 3 });
  const b2 = C.line(L, `M${xs + 6} 192 V206 H${x1} V192`, { color: P.sky, width: 3 });
  const t1 = C.tag(L, (x0 + xs) / 2, 230, k.t('task1'), { color: P.red, size: 14.5, lang: k.lang });
  const t2 = C.tag(L, (xs + x1) / 2, 230, k.t('task2'), { color: P.sky, size: 14.5, lang: k.lang });
  const anna = who(k, L, 'anna', 76, 422, 0.6);
  const max = who(k, L, 'max', 524, 422, 0.6);
  const db = C.db(L, 300, 334, { w: 84, h: 72, label: k.t('db') });
  const data = C.doc(L, xs, proc.at(2).y, [k.f('threeDays')], { w: 100 });

  k.say('before', B0);
  C.fadeIn(proc, B0);
  C.enter(proc, 0, B0 + 0.4);
  C.run(proc, tok, [0, 1], B0 + 0.8, 0.8);
  C.pop(anna, B0 + 0.9);
  C.draw(b1, B0 + 1.6);
  C.pop(t1, B0 + 2.1);

  k.say('switch', B1);
  C.run(proc, tok, [1, 2], B1 + 0.3, 0.9);
  const ok = C.check(L, (x0 + xs) / 2 + t1.w / 2 + 18, 230, { r: 13 });
  C.pop(ok, B1 + 1.8);
  C.dim(anna, B1 + 2.4, 0.35);

  k.say('store', B2);
  C.pop(db, B2 + 0.2);
  C.pop(data, B2 + 0.6, { s: 0.7 });
  tl.to(data, { x: 300, y: 326, s: 0.6 }, B2 + 1.3, 1.0, 'inOut');
  C.fadeOut(data, B2 + 2.3, 0.3);
  C.pulse(db, B2 + 2.3, 1.1);

  k.say('next', B3);
  C.pop(max, B3 + 0.2);
  C.draw(b2, B3 + 0.6);
  C.pop(t2, B3 + 1.0);
  C.fadeIn(data, B3 + 1.3, 0.2);
  tl.to(data, { x: xs, y: proc.at(2).y + 6, s: 0.5 }, B3 + 1.4, 0.8, 'inOut');
  C.fadeOut(data, B3 + 2.2, 0.2);
  C.run(proc, tok, [2, 3, 4], B3 + 2.4, 0.7);
  C.finish(proc, 4, B3 + 4.4);

  k.say('vs', B4);
  C.fadeOut(db, B4 + 0.1);
  const same = C.tag(L, 300, 330, k.t('same'), { color: P.gold, size: 16, lang: k.lang });
  C.pop(same, B4 + 0.6);
  tl.hold(END);
};

// ==================== Task states: open, in progress, done ====================
films.states = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 4.8, 4.6, 5.0, 5.4);
  const card = C.card(L, 300, 100, { w: 330, title: k.f('contract'), chip: k.f('open'), chipFill: FILL.open });
  const track = C.group(L, 0, 0);
  const xs = [140, 300, 460];
  C.path(track, 'M140 215 H460', { stroke: P.soft, sw: 3 });
  [['open', 'SUSPENDED'], ['inProgress', 'RESUMED'], ['done', 'DONE']].forEach(([key, name], i) => {
    C.circle(track, xs[i], 215, 11, { fill: FILL[key], stroke: P.ink, sw: 3 });
    C.text(track, xs[i], 247, k.f(key), { size: 16, weight: 700, color: P.cream });
    C.text(track, xs[i], 270, name, { size: 13.5, weight: 700, color: P.soft, font: 'Consolas, monospace' });
  });
  const marker = C.group(L, xs[0], 215);
  C.circle(marker, 0, 0, 19, { stroke: P.gold, sw: 4 });
  const ben = who(k, L, 'ben', 520, 418, 0.62);

  k.say('open', B0);
  C.pop(card, B0 + 0.3);
  C.fadeIn(track, B0 + 0.9);
  C.pop(marker, B0 + 1.5);

  k.say('progress', B1);
  C.pop(ben, B1 + 0.2);
  chip(k, card, 'inProgress', B1 + 0.9);
  C.move(marker, xs[1], 215, B1 + 0.9, 0.7);

  k.say('done', B2);
  chip(k, card, 'done', B2 + 0.5);
  C.move(marker, xs[2], 215, B2 + 0.5, 0.7);
  C.pulse(card, B2 + 1.6, 1.06);

  k.say('other', B3);
  const destroyed = C.tag(L, 250, 338, k.t('destroyed'), { color: P.muted, lang: k.lang });
  const delayed = C.tag(L, 250, 390, k.t('delayedTag'), { color: P.soft, lang: k.lang });
  C.pop(destroyed, B3 + 0.6);
  C.pop(delayed, B3 + 1.8);
  tl.hold(END);
};
