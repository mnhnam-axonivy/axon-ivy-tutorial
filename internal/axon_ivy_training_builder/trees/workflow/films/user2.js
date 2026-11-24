/**
 * The Workflow tree, user level 2: each skill's short film. films/kit.js has what all films share;
 * src/film.js describes the kit (k) a film gets.
 */
import { P } from '../../../src/cast.js';
import { FILL, who, chip, beats, scene } from './kit.js';

export const films = {};

// ==================== User from Attribute: one user, decided at run time ====================
films.userattr = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 5.4, 5.4, 5.0, 6.6);
  const insc = C.inscription(L, 410, 118, {
    w: 330, title: k.f('userTask'), tab: k.f('taskTab'), split: 0.3,
    rows: [[k.f('responsible'), k.f('roles')], ['', k.f('manager')]]
  });
  const data = C.doc(L, 112, 116, ['in.approver', ''], { w: 180, mono: true });
  const anna = who(k, L, 'anna', 92, 420, 0.62);
  const xs = [330, 480];
  const managers = [who(k, L, 'max', xs[0], 420, 0.62), who(k, L, 'lea', xs[1], 420, 0.62)];
  const pills = xs.map(x => C.pill(L, x, 340, k.f('manager'), { fill: P.gold, size: 12, o: 0 }));
  const icons = xs.map(x => C.doc(L, x, 298, [], { w: 32, h: 30 }));
  const ghost = C.tag(L, 300, 236, k.t('ghost'), { color: P.red, size: 15, lang: k.lang });

  k.say('fixed', B0);
  C.pop(insc, B0 + 0.3);
  managers.forEach((m, i) => C.pop(m, B0 + 1.0 + i * 0.3));
  pills.forEach((p, i) => C.pop(p, B0 + 1.6 + i * 0.2));
  icons.forEach((d, i) => C.pop(d, B0 + 2.4 + i * 0.2));

  k.say('field', B1);
  C.pop(anna, B1 + 0.3);
  C.pop(data, B1 + 0.8);
  C.type(data.lines[1], '= "max"', B1 + 2.0, 12);

  k.say('attr', B2);
  C.say(insc.values[0], '', B2 + 0.3);
  C.type(insc.values[0], k.f('userFromAttr'), B2 + 0.4, 24);
  C.say(insc.values[1], '', B2 + 1.4);
  C.type(insc.values[1], 'in.approver', B2 + 1.5, 20);
  C.dim(managers[1], B2 + 2.6, 0.25);
  C.dim(pills[1], B2 + 2.6, 0.25);
  C.fadeOut(icons[1], B2 + 2.6);
  C.pulse(icons[0], B2 + 3.0, 1.25);

  // a name that does not exist: accepted, and nobody sees the task
  k.say('typo', B3);
  C.say(data.lines[1], '= "maxx"', B3 + 0.7);
  C.pulse(data, B3 + 0.7, 1.1);
  C.fadeOut(icons[0], B3 + 1.6);
  C.dim(managers[0], B3 + 1.6, 0.25);
  C.dim(pills[0], B3 + 1.6, 0.25);
  C.pop(ghost, B3 + 2.6);
  tl.hold(END);
};

// ==================== Test users: being several people ====================
films.testusers = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 5.0, 5.4, 5.2, 5.6);
  const file = C.tag(L, 146, 76, k.t('file'), { color: P.violet, size: 14.5, lang: k.lang });
  const doc = C.doc(L, 146, 200, ['Users:', '  - Name: anna', '    Password: anna', '    Roles:', '      - Employee', '  - Name: max', '    …'], { w: 252, mono: true });
  const list = C.list(L, 440, 204, { title: k.t('loginTable'), w: 272, h: 252 });
  const rows = [['anna', 'employee'], ['max', 'manager'], ['hanna', 'hr']].map(([name, role], i) =>
    C.card(L, list.slot(i).x, list.slot(i).y, { w: list.cardW, title: name, sub: k.f(role), size: 15 }));
  const as = C.tag(L, 440, 366, k.t('asUser', 'anna'), { color: P.sky, size: 14.5, lang: k.lang });
  const only = C.tag(L, 300, 414, k.t('only'), { color: P.red, size: 14.5, lang: k.lang });

  k.say('file', B0);
  C.pop(file, B0 + 0.3);
  C.pop(doc, B0 + 0.7);

  k.say('login', B1);
  C.fadeIn(list, B1 + 0.4);
  rows.forEach((r, i) => C.pop(r, B1 + 1.0 + i * 0.4));

  k.say('play', B2);
  C.pulse(rows[0], B2 + 0.4, 1.07);
  C.pop(as, B2 + 0.8);
  C.pulse(rows[1], B2 + 2.6, 1.07);
  C.say(as.label, k.caps(k.t('asUser', 'max')), B2 + 2.8);
  C.pulse(as, B2 + 2.8, 1.1);

  k.say('only', B3);
  C.pop(only, B3 + 0.8);
  tl.hold(END);
};

// ==================== The Developer user: may do everything ====================
films.developer = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 3.8, 6.2, 4.4, 6.4);
  const dev = who(k, L, 'developer', 106, 408, 0.9);
  const anna = who(k, L, 'anna', 106, 408, 0.9);
  const ys = [118, 194, 270];
  const cards = [k.t('forManager'), k.t('forHr'), k.t('forAnna')].map((title, i) => C.card(L, 400, ys[i], { w: 284, title }));
  const oks = ys.map(y => C.check(L, 572, y, { r: 15 }));
  const marks = [C.cross(L, 572, ys[0], { r: 15 }), C.cross(L, 572, ys[1], { r: 15 }), C.check(L, 572, ys[2], { r: 15 })];
  const always = C.tag(L, 400, 348, k.t('always'), { color: P.gold, size: 14.5, lang: k.lang });

  k.say('you', B0);
  C.pop(dev, B0 + 0.4);

  k.say('all', B1);
  cards.forEach((c, i) => C.pop(c, B1 + 0.4 + i * 0.4));
  oks.forEach((o, i) => C.pop(o, B1 + 2.4 + i * 0.9));

  k.say('trap', B2);
  C.pop(always, B2 + 0.6);

  k.say('test', B3);
  C.fadeOut(dev, B3 + 0.2);
  C.fadeOut(always, B3 + 0.2);
  oks.forEach(o => C.fadeOut(o, B3 + 0.2));
  C.pop(anna, B3 + 0.8);
  marks.forEach((m, i) => C.pop(m, B3 + 2.0 + i * 0.9));
  tl.hold(END);
};

// ==================== Worker: who did it ====================
films.worker = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 5.0, 4.2, 5.0, 5.2);
  const ben = who(k, L, 'ben', 92, 420, 0.75);
  const card = C.card(L, 376, 150, { w: 330, title: k.f('contract'), sub: '', chip: k.f('open'), chipFill: FILL.open });

  k.say('start', B0);
  C.pop(card, B0 + 0.3);
  C.pop(ben, B0 + 0.8);
  chip(k, card, 'inProgress', B0 + 1.8);
  C.type(card.sub, k.t('worker', 'ben'), B0 + 2.4, 16);

  k.say('done', B1);
  chip(k, card, 'done', B1 + 0.5);
  C.pulse(card, B1 + 1.6, 1.05);

  k.say('later', B2);
  C.fadeOut(card, B2 + 0.1);
  const list = C.list(L, 380, 246, { title: k.t('history'), w: 330, h: 306 });
  C.fadeIn(list, B2 + 0.5);
  const rows = [[k.t('request'), 'anna'], [k.f('contract'), 'ben'], [k.t('sign'), 'max'], [k.t('file'), 'SYSTEM']].map(([title, by], i) => {
    const c = C.card(L, list.slot(i).x, list.slot(i).y, { w: list.cardW, title, sub: k.t('doneBy', by), chip: k.f('done'), chipFill: FILL.done, size: 15 });
    tl.set(c.tick, { o: 1 }, 0);
    return c;
  });
  rows.slice(0, 3).forEach((c, i) => C.pop(c, B2 + 1.0 + i * 0.4));
  C.pulse(rows[1], B2 + 3.0, 1.06);

  k.say('system', B3);
  C.pop(rows[3], B3 + 0.6);
  C.pulse(rows[3], B3 + 2.0, 1.06);
  tl.hold(END);
};
