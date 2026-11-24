/**
 * The Workflow tree, case level 2: each skill's short film. films/kit.js has what all films share;
 * src/film.js describes the kit (k) a film gets.
 */
import { P } from '../../../src/cast.js';
import { FILL, who, chip, beats, scene } from './kit.js';

export const films = {};

// ==================== When a case is done: the last task ====================
films.casedone = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 5.4, 4.8, 5.0, 5.4);
  const proc = C.proc(L, 300, 158, [
    { kind: 'start', x: -250 },
    { kind: 'gateway', x: -165 },
    { kind: 'user', x: -25, y: -70, label: k.t('mgr') },
    { kind: 'user', x: -25, y: 70, label: k.t('hr') },
    { kind: 'gateway', x: 115 },
    { kind: 'end', x: 215 }
  ], { scale: 0.92, edges: [[0, 1], [1, 2], [1, 3], [2, 4], [3, 4], [4, 5]], file: 'LeaveRequest.p.json' });
  const tokA = C.token(L);
  const tokB = C.token(L);
  const folder = C.folder(L, 96, 380, { w: 162, h: 104, label: k.f('caseOf', k.f('anna')), size: 14 });
  const state = C.pill(L, 96, 366, 'RUNNING', { fill: P.gold, size: 13, o: 0 });
  const cards = [
    C.card(L, 410, 350, { w: 256, title: k.t('mgrCheck'), chip: k.f('open'), chipFill: FILL.open, size: 15 }),
    C.card(L, 410, 410, { w: 256, title: k.t('hrCheck'), chip: k.f('open'), chipFill: FILL.open, size: 15 })
  ];
  const ok = C.check(L, 168, 332, { r: 17 });

  k.say('two', B0);
  C.fadeIn(proc, B0);
  C.pop(folder, B0 + 0.4);
  C.pop(state, B0 + 0.8);
  C.enter(proc, 0, B0 + 0.9);
  C.run(proc, tokA, [0, 1], B0 + 1.2, 0.5);
  C.run(proc, tokA, [1, 2], B0 + 2.0, 0.8);
  C.run(proc, tokB, [1, 3], B0 + 2.0, 0.8, { quiet: true });
  cards.forEach((c, i) => C.pop(c, B0 + 3.2 + i * 0.3));

  k.say('one', B1);
  chip(k, cards[0], 'done', B1 + 0.5);
  C.run(proc, tokA, [2, 4], B1 + 0.9, 0.9, { hold: true });
  C.pulse(state, B1 + 2.6, 1.25);
  C.pulse(cards[1], B1 + 3.2, 1.06);

  k.say('last', B2);
  chip(k, cards[1], 'done', B2 + 0.5);
  C.run(proc, tokB, [3, 4], B2 + 0.9, 0.9, { hold: true });
  C.arrive(proc, [tokA, tokB], 4, B2 + 2.0);
  C.run(proc, tokA, [4, 5], B2 + 2.5, 0.8);
  C.finish(proc, 5, B2 + 4.0);

  k.say('done', B3);
  tl.set(state, { text: 'DONE', fill: P.greenLight }, B3 + 0.5);
  C.pulse(state, B3 + 0.5, 1.25);
  C.pop(ok, B3 + 1.0);
  tl.hold(END);
};

// ==================== Case name: a case you can find ====================
films.casename = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 4.2, 6.0, 5.0, 5.4);
  const list = C.list(L, 140, 236, { title: k.t('caseList'), w: 252, h: 240 });
  const names = ['Anna', 'Ben', 'Chloé'];
  const cards = [41, 42, 43].map((n, i) => C.card(L, list.slot(i).x, list.slot(i).y, { w: list.cardW, title: k.t('caseN', n), size: 15 }));
  const insc = C.inscription(L, 436, 150, { w: 312, title: k.f('userTask'), tabs: [k.f('taskTab'), k.t('caseTab')], active: 1, split: 0.34, rows: [[k.f('name'), ''], [k.t('desc'), '']] });
  const info = C.tag(L, 436, 300, k.t('info'), { color: P.gold, size: 14.5, lang: k.lang });

  k.say('list', B0);
  C.fadeIn(list, B0 + 0.2);
  cards.forEach((c, i) => C.pop(c, B0 + 0.7 + i * 0.3));

  k.say('tab', B1);
  C.pop(insc, B1 + 0.3);
  C.fadeIn(insc.marks[0], B1 + 1.2, 0.3);
  C.type(insc.values[0], k.t('nameMacro'), B1 + 1.6, 11);

  k.say('named', B2);
  cards.forEach((c, i) => {
    C.say(c.title, k.t('leaveOf', names[i]), B2 + 0.5 + i * 0.7);
    C.pulse(c, B2 + 0.5 + i * 0.7, 1.06, 0.4);
  });

  k.say('info', B3);
  C.pop(info, B3 + 0.6);
  C.pulse(insc, B3 + 1.6, 1.04);
  tl.hold(END);
};

// ==================== Destroying a case: cancelled ====================
films.destroy = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 5.2, 5.0, 5.0, 5.6);
  const folder = C.folder(L, 130, 172, { w: 192, h: 124, label: k.f('caseOf', k.f('anna')) });
  const state = C.pill(L, 130, 152, 'RUNNING', { fill: P.gold, size: 13, o: 0 });
  const list = C.list(L, 440, 172, { title: k.f('taskList'), owner: k.f('max'), w: 262, h: 150 });
  const card = C.card(L, list.slot(0).x, list.slot(0).y, { w: list.cardW, title: k.f('approveLeave'), chip: k.f('open'), chipFill: FILL.open, size: 15 });
  const code = C.doc(L, 300, 330, [k.t('code')], { w: 236, mono: true });

  k.say('mistake', B0);
  C.pop(folder, B0 + 0.3);
  C.pop(state, B0 + 0.7);
  C.fadeIn(list, B0 + 1.0);
  C.pop(card, B0 + 1.5);

  k.say('destroy', B1);
  C.pop(code, B1 + 0.8);
  C.pulse(code, B1 + 2.6, 1.1);

  k.say('gone', B2);
  tl.set(state, { text: 'DESTROYED', fill: P.muted }, B2 + 0.5);
  C.pulse(state, B2 + 0.5, 1.25);
  tl.set(card.chip, { text: k.t('destroyedWord'), fill: P.muted }, B2 + 1.2);
  C.shake(card, B2 + 1.2);
  C.fadeOut(code, B2 + 1.8);
  tl.to(card, { x: 130, y: 300, o: 0.55 }, B2 + 2.4, 1.0, 'inOut');

  k.say('record', B3);
  C.pulse(folder, B3 + 0.8, 1.05);
  C.pulse(card, B3 + 1.6, 1.05);
  tl.hold(END);
};
