/**
 * The Workflow tree, role level 1: each skill's short film. films/kit.js has what all films share;
 * src/film.js describes the kit (k) a film gets.
 */
import { P } from '../../../src/cast.js';
import { FILL, who, chip, beats, scene } from './kit.js';

export const films = {};

// ==================== Role: a job, not a person ====================
films.role = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, B4, END] = beats(k.opening(), 4.8, 4.4, 4.6, 4.6, 5.6);
  const s1 = scene(k);
  const xs = [150, 300, 450];
  const ids = ['hanna', 'ben', 'chloe'];
  const people = xs.map((x, i) => who(k, s1, ids[i], x, 420, 0.72));
  const badge = C.badge(s1, 300, 64, k.f('hr'), { fill: P.teal });
  const pills = xs.map(x => C.pill(s1, x + 38, 362, k.f('hr'), { fill: P.teal, size: 12, o: 0 }));
  const big = C.card(s1, 300, 160, { w: 250, title: k.f('contract') });
  const cards = xs.map(x => C.card(s1, x, 290, { w: 132, title: k.t('contract'), sub: '', size: 14.5 }));

  k.say('group', B0);
  people.forEach((p, i) => C.pop(p, B0 + 0.2 + i * 0.3));
  C.pop(badge, B0 + 1.5);
  pills.forEach((p, i) => C.pop(p, B0 + 2.2 + i * 0.25));

  k.say('task', B1);
  C.pop(big, B1 + 0.3);
  C.fadeOut(big, B1 + 1.7, 0.3);
  cards.forEach((c, i) => C.pop(c, B1 + 1.8 + i * 0.2));

  k.say('away', B2);
  const holiday = C.tag(s1, 300, 228, k.t('holiday'), { color: P.gold, lang: k.lang });
  C.pop(holiday, B2 + 0.4);
  C.dim(people[1], B2 + 0.6, 0.22);
  C.dim(cards[1], B2 + 0.6, 0.22);
  C.dim(pills[1], B2 + 0.6, 0.22);
  C.pulse(cards[0], B2 + 2.0, 1.08);
  C.pulse(cards[2], B2 + 2.4, 1.08);

  k.say('first', B3);
  C.fadeOut(holiday, B3);
  C.pulse(people[2], B3 + 0.3, 1.1);
  C.type(cards[2].sub, k.f('inProgress'), B3 + 0.8, 20);
  C.shake(cards[0], B3 + 1.8);
  C.dim(cards[0], B3 + 2.2, 0.25);

  k.say('tree', B4);
  C.fadeOut(s1, B4, 0.5);
  const top = C.badge(L, 300, 120, k.f('everybody'), { fill: P.gold });
  const hr = C.badge(L, 190, 262, k.f('hr'), { fill: P.teal });
  const mgr = C.badge(L, 410, 262, k.f('manager'), { fill: P.sky });
  const l1 = C.line(L, 'M300 140 V190 H190 V242', { color: P.soft, width: 3 });
  const l2 = C.line(L, 'M300 190 H410 V242', { color: P.soft, width: 3 });
  const file = C.tag(L, 300, 362, k.t('file'), { color: P.violet, lang: k.lang });
  C.pop(top, B4 + 0.6);
  C.draw(l1, B4 + 1.1);
  C.draw(l2, B4 + 1.4);
  C.pop(hr, B4 + 1.7);
  C.pop(mgr, B4 + 1.9);
  C.pop(file, B4 + 3.0);
  tl.hold(END);
};

// ==================== Responsible: who gets the task ====================
films.responsible = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 4.6, 4.6, 4.6, 5.4);
  const insc = C.inscription(L, 178, 205, {
    w: 310, title: k.f('userTask'), tab: k.f('taskTab'), split: 0.36,
    rows: [[k.f('name'), k.t('approve')], [k.f('responsible'), k.f('everybody')], [k.f('priority'), k.f('normal')]]
  });
  const xs = [385, 448, 511, 574];
  const ids = ['anna', 'ben', 'max', 'hanna'];
  const people = xs.map((x, i) => who(k, L, ids[i], x, 418, 0.5));
  const icons = xs.map(x => C.doc(L, x, 326, [], { w: 30, h: 28 }));
  const pill = C.pill(L, 511, 282, k.f('manager'), { fill: P.gold, size: 12.5, o: 0 });

  k.say('tab', B0);
  C.pop(insc, B0 + 0.3);
  C.fadeIn(insc.marks[1], B0 + 1.6, 0.3);

  k.say('default', B1);
  C.pulse(insc.values[1], B1 + 0.4, 1.12);
  people.forEach((p, i) => C.pop(p, B1 + 0.9 + i * 0.2));
  icons.forEach((d, i) => C.pop(d, B1 + 1.9 + i * 0.15));

  k.say('choose', B2);
  C.say(insc.values[1], '', B2 + 0.4);
  C.type(insc.values[1], k.f('manager'), B2 + 0.6, 14);
  [0, 1, 3].forEach(i => {
    C.dim(people[i], B2 + 1.8, 0.25);
    C.fadeOut(icons[i], B2 + 1.8);
  });
  C.pop(pill, B2 + 2.0);
  C.pulse(icons[2], B2 + 2.4, 1.2);

  k.say('check', B3);
  const tag = C.tag(L, 178, 345, k.t('checkIt'), { color: P.red, lang: k.lang });
  C.pop(tag, B3 + 0.5);
  C.pulse(insc.marks[1], B3 + 1.2, 1.04);
  tl.hold(END);
};

// ==================== Everybody: the role everyone has ====================
films.everybody = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 6.0, 4.6, 4.4, 5.8);
  const s1 = scene(k);
  const xs = [130, 300, 470];
  const ids = ['hanna', 'max', 'anna'];
  const roles = [['hr', P.teal], ['manager', P.gold], ['employee', P.sky]];
  const people = xs.map((x, i) => who(k, s1, ids[i], x, 420, 0.7));
  const own = xs.map((x, i) => C.pill(s1, x, 326, k.f(roles[i][0]), { fill: roles[i][1], size: 13, o: 0 }));
  const every = xs.map(x => C.pill(s1, x, 296, k.f('everybody'), { fill: P.pink, size: 13, o: 0 }));
  const big = C.badge(L, 300, 66, k.f('everybody'), { fill: P.pink });
  const lines = xs.map(x => C.line(L, `M300 86 V150 H${x} V276`, { color: P.soft, width: 3 }));
  const insc = C.inscription(L, 300, 218, { w: 330, title: k.f('userTask'), tab: k.f('taskTab'), split: 0.4, rows: [[k.f('responsible'), k.f('everybody')]] });
  const docs = xs.map(x => C.doc(L, x, 248, [], { w: 32, h: 30 }));

  k.say('all', B0);
  people.forEach((p, i) => C.pop(p, B0 + 0.2 + i * 0.3));
  own.forEach((p, i) => C.pop(p, B0 + 1.4 + i * 0.5));
  every.forEach((p, i) => C.pop(p, B0 + 3.6 + i * 0.3));

  k.say('builtin', B1);
  C.pop(big, B1 + 0.3);
  lines.forEach((l, i) => C.draw(l, B1 + 0.9 + i * 0.25));

  k.say('default', B2);
  C.dim(s1, B2 + 0.2, 0.2);
  lines.forEach(l => C.fadeOut(l, B2 + 0.2));
  C.pop(insc, B2 + 0.6);
  C.fadeIn(insc.marks[0], B2 + 1.6, 0.3);

  k.say('meaning', B3);
  C.fadeOut(insc, B3 + 0.1);
  tl.to(s1, { o: 1 }, B3 + 0.4, 0.4, 'linear');
  docs.forEach((d, i) => C.pop(d, B3 + 1.2 + i * 0.3));
  tl.hold(END);
};
