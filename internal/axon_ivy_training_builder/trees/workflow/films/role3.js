/**
 * The Workflow tree, role level 3: each skill's short film. films/kit.js has what all films share;
 * src/film.js describes the kit (k) a film gets.
 */
import { P } from '../../../src/cast.js';
import { FILL, who, chip, beats, scene } from './kit.js';

export const films = {};

// ==================== CREATOR: back to whoever started it ====================
films.creator = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 5.8, 4.0, 5.4, 5.4);
  const folder = C.folder(L, 104, 124, { w: 168, h: 112, label: k.f('caseOf', k.f('anna')), size: 14 });
  const insc = C.inscription(L, 424, 118, { w: 312, title: k.f('userTask'), tab: k.f('taskTab'), split: 0.38, rows: [[k.f('responsible'), k.f('employee')]] });
  const anna = who(k, L, 'anna', 150, 420, 0.7);
  const ben = who(k, L, 'ben', 450, 420, 0.7);
  const card = C.card(L, 300, 240, { w: 250, title: k.t('correct'), size: 15 });
  const card2 = C.card(L, 300, 240, { w: 250, title: k.t('correct'), size: 15 });

  k.say('need', B0);
  C.pop(folder, B0 + 0.3);
  C.pop(anna, B0 + 0.8);
  C.pop(insc, B0 + 2.0);

  k.say('creator', B1);
  C.fadeIn(insc.marks[0], B1 + 0.3, 0.3);
  C.say(insc.values[0], '', B1 + 0.8);
  C.type(insc.values[0], 'CREATOR', B1 + 0.9, 10);

  k.say('resolve', B2);
  C.pop(card, B2 + 0.5);
  C.move(card, 150, 318, B2 + 2.0, 1.0);
  C.pulse(anna, B2 + 3.0, 1.1);

  k.say('each', B3);
  C.say(folder.label, k.t('caseBen'), B3 + 0.5);
  C.pulse(folder, B3 + 0.5, 1.08);
  C.fadeOut(card, B3 + 0.5);
  C.dim(anna, B3 + 0.5, 0.35);
  C.pop(ben, B3 + 1.2);
  C.pop(card2, B3 + 2.0);
  C.move(card2, 450, 318, B3 + 2.8, 1.0);
  tl.hold(END);
};

// ==================== SELF: the same person again ====================
films.self = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 5.2, 4.2, 5.4, 5.0);
  const proc = C.proc(L, 300, 90, [{ kind: 'user', label: k.t('check') }, { kind: 'switch', label: 'SELF' }, { kind: 'dialog', label: k.t('file') }], { w: 500, file: 'Contract.p.json' });
  const tok = C.token(L);
  const xs = [130, 300, 470];
  const people = ['hanna', 'ben', 'chloe'].map((id, i) => who(k, L, id, xs[i], 422, 0.6));
  const pills = xs.map(x => C.pill(L, x, 348, k.f('hr'), { fill: P.teal, size: 12.5, o: 0 }));
  const card = C.card(L, 300, 232, { w: 240, title: k.t('file'), size: 15 });

  k.say('two', B0);
  C.fadeIn(proc, B0);
  people.forEach((p, i) => C.pop(p, B0 + 0.4 + i * 0.25));
  pills.forEach((p, i) => C.pop(p, B0 + 0.8 + i * 0.25));
  C.enter(proc, 0, B0 + 1.6);
  C.pulse(people[0], B0 + 2.4, 1.12);

  k.say('self', B1);
  C.run(proc, tok, [0, 1], B1 + 0.3, 0.9);
  C.pulse(proc.nodes[1], B1 + 1.6, 1.2, 0.6);

  k.say('resolve', B2);
  C.pop(card, B2 + 0.5);
  C.move(card, 130, 304, B2 + 1.8, 1.0);
  C.dim(people[1], B2 + 2.8, 0.3);
  C.dim(people[2], B2 + 2.8, 0.3);
  C.dim(pills[1], B2 + 2.8, 0.3);
  C.dim(pills[2], B2 + 2.8, 0.3);

  k.say('skip', B3);
  C.fadeOut(card, B3 + 0.6);
  C.run(proc, tok, [1, 2], B3 + 0.8, 1.0);
  C.pulse(people[0], B3 + 2.2, 1.12);
  tl.hold(END);
};

// ==================== Members from Attribute: a list of people ====================
films.members = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 4.8, 4.8, 5.8, 6.4);
  const data = C.doc(L, 126, 112, [k.t('members'), ''], { w: 224, mono: true });
  const insc = C.inscription(L, 434, 118, { w: 316, title: k.f('userTask'), tab: k.f('taskTab'), split: 0.3, rows: [[k.f('responsible'), k.f('membersFromAttr')], ['', k.t('members')]] });
  const xs = [120, 320, 470];
  const people = ['anna', 'hanna', 'ben'].map((id, i) => who(k, L, id, xs[i], 420, 0.62));
  const roles = [['employee', P.sky], ['hr', P.teal], ['hr', P.teal]].map(([key, fill], i) => C.pill(L, xs[i], 344, k.f(key), { fill, size: 12.5, o: 0 }));
  const icons = xs.map(x => C.doc(L, x, 298, [], { w: 32, h: 30 }));
  const no = C.cross(L, 172, 298, { r: 15 });

  k.say('need', B0);
  people.forEach((p, i) => C.pop(p, B0 + 0.4 + i * 0.3));
  roles.forEach((p, i) => C.pop(p, B0 + 0.9 + i * 0.3));

  k.say('list', B1);
  C.pop(data, B1 + 0.4);
  C.type(data.lines[1], k.t('listHash'), B1 + 1.6, 10);

  k.say('attr', B2);
  C.pop(insc, B2 + 0.4);
  C.fadeIn(insc.marks[0], B2 + 1.4, 0.3);
  icons.forEach((d, i) => C.pop(d, B2 + 3.0 + i * 0.4));

  k.say('hash', B3);
  C.say(data.lines[1], k.t('listPlain'), B3 + 0.8);
  C.pulse(data, B3 + 0.8, 1.1);
  C.fadeOut(icons[0], B3 + 2.2);
  C.dim(people[0], B3 + 2.2, 0.35);
  C.dim(roles[0], B3 + 2.2, 0.35);
  C.pop(no, B3 + 2.8);
  tl.hold(END);
};

// ==================== Who may start ====================
films.permission = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 4.2, 5.2, 5.6, 5.6);
  const insc = C.inscription(L, 300, 118, { w: 350, title: k.f('start'), tab: k.f('requestTab'), split: 0.32, rows: [[k.t('permission'), k.t('allowOn')], [k.f('roles'), '']] });
  const xs = [84, 228, 372, 516];
  const people = [who(k, L, 'anna', xs[0], 420, 0.62), who(k, L, 'max', xs[1], 420, 0.62), who(k, L, 'hanna', xs[2], 420, 0.62), who(k, L, 'guest', xs[3], 420, 0.62, k.t('visitor'))];
  const roles = [['employee', P.sky], ['manager', P.gold], ['hr', P.teal]].map(([key, fill], i) => C.pill(L, xs[i], 344, k.f(key), { fill, size: 12.5, o: 0 }));
  const oks = [0, 1, 2].map(i => C.check(L, xs[i] + 38, 372, { r: 14 }));
  const no = C.cross(L, xs[3] + 38, 372, { r: 14 });
  const err = C.log(L, 404, 280, k.t('error'), { w: 330, level: 'ERROR' });

  k.say('open', B0);
  C.pop(insc, B0 + 0.3);
  people.forEach((p, i) => C.pop(p, B0 + 1.0 + i * 0.25));

  k.say('roles', B1);
  C.fadeIn(insc.marks[0], B1 + 0.3, 0.2);
  C.say(insc.values[0], k.t('allowOff'), B1 + 0.8);
  C.fadeOut(insc.marks[0], B1 + 1.8, 0.2);
  C.fadeIn(insc.marks[1], B1 + 2.0, 0.2);
  C.type(insc.values[1], k.f('employee'), B1 + 2.4, 10);

  k.say('yes', B2);
  roles.forEach((p, i) => C.pop(p, B2 + 0.4 + i * 0.3));
  oks.forEach((o, i) => C.pop(o, B2 + 1.6 + i * 0.8));

  k.say('no', B3);
  C.pop(no, B3 + 0.6);
  C.dim(people[3], B3 + 0.8, 0.4);
  C.pop(err, B3 + 1.6);
  tl.hold(END);
};
