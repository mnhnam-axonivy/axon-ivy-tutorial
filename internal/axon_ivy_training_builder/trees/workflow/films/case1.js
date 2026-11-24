/**
 * The Workflow tree, case level 1: each skill's short film. films/kit.js has what all films share;
 * src/film.js describes the kit (k) a film gets.
 */
import { P } from '../../../src/cast.js';
import { FILL, who, chip, beats, scene } from './kit.js';

export const films = {};

// ==================== Case: one run of the process ====================
films.case = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, B4, END] = beats(k.opening(), 4.4, 4.4, 4.6, 5.4, 4.8);
  const proc = C.proc(L, 300, 96, [{ kind: 'start' }, { kind: 'user', label: k.t('approve') }, { kind: 'end' }], { w: 380, file: 'LeaveRequest.p.json' });
  const head = C.tag(L, 300, 176, k.t('process'), { color: P.sky, lang: k.lang });
  const xs = [110, 300, 490];
  const names = ['anna', 'ben', 'chloe'];
  const folders = xs.map((x, i) => C.folder(L, x, 318, { w: 172, h: 134, label: k.f('caseOf', k.f(names[i])) }));
  const cards = xs.map(x => C.card(L, x, 300, { w: 150, title: k.t('approve'), sub: k.f('open'), size: 15 }));
  const toks = xs.map(() => C.token(L, proc.at(0).x, proc.at(0).y, { s: proc.S }));

  k.say('plan', B0);
  C.fadeIn(proc, B0);
  C.pop(head, B0 + 0.3);
  proc.nodes.forEach((n, i) => C.pulse(n, B0 + 1.2 + i * 0.45, 1.1));

  // every start: a token leaves the start and a case is there
  const startCase = (i, at) => {
    C.pulse(proc.nodes[0], at, 1.3, 0.4);
    tl.set(toks[i], { x: proc.at(0).x, y: proc.at(0).y }, at);
    tl.to(toks[i], { o: 1 }, at, 0.1, 'linear');
    C.pop(folders[i], at + 0.3);
    C.travel(toks[i], [{ x: xs[i], y: 262 }], at + 0.5, 0.8);
    C.fadeOut(toks[i], at + 1.3, 0.25);
    C.pop(cards[i], at + 1.4);
  };
  k.say('start', B1);
  C.fadeOut(head, B1);
  startCase(0, B1 + 0.4);

  k.say('more', B2);
  startCase(1, B2 + 0.3);
  startCase(2, B2 + 1.1);

  k.say('own', B3);
  C.pulse(cards[0], B3 + 0.9, 1.1);
  tl.set(cards[0].sub, { text: k.f('done') }, B3 + 1.2);
  tl.to(cards[0].tick, { o: 1 }, B3 + 1.2, 0.2, 'linear');
  C.pulse(cards[1], B3 + 2.6, 1.08);
  C.pulse(cards[2], B3 + 3.0, 1.08);

  k.say('done', B4);
  const ok = C.check(L, xs[0] + 66, 250, { r: 20 });
  C.pop(ok, B4 + 0.5);
  C.pulse(folders[0], B4 + 0.5, 1.06);
  tl.hold(END);
};

// ==================== One start, one case ====================
films.onestart = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 4.0, 5.0, 5.4, 5.6);
  const proc = C.proc(L, 300, 92, [{ kind: 'start' }, { kind: 'dialog', label: k.t('leave') }, { kind: 'user' }, { kind: 'end' }], { w: 470, file: 'LeaveRequest.p.json' });
  const tok = C.token(L);
  const anna = who(k, L, 'anna', 70, 422, 0.6);
  const folder = C.folder(L, 222, 296, { w: 204, h: 144, label: k.f('caseOf', k.f('anna')) });
  const card = C.card(L, 222, 276, { w: 182, title: k.t('firstTask'), sub: k.t('by', 'anna'), size: 15 });
  const list = C.list(L, 470, 300, { title: k.f('taskList'), owner: k.f('max'), w: 226, h: 132, empty: k.t('noTasks') });
  const second = C.folder(L, 468, 296, { w: 204, h: 144, label: k.t('another') });
  const card2 = C.card(L, 468, 276, { w: 182, title: k.t('firstTask'), sub: k.t('by', 'anna'), size: 15 });

  k.say('click', B0);
  C.fadeIn(proc, B0);
  C.pop(anna, B0 + 0.4);
  C.enter(proc, 0, B0 + 1.6);
  C.run(proc, tok, [0, 1], B0 + 2.2, 0.8);

  k.say('both', B1);
  C.pop(folder, B1 + 0.3);
  C.pop(card, B1 + 1.3);
  C.pulse(card, B1 + 2.8, 1.07);

  k.say('nolist', B2);
  C.fadeIn(list, B2 + 0.4);
  C.pulse(list.empty, B2 + 1.8, 1.2);
  C.pulse(card, B2 + 3.0, 1.07);

  k.say('again', B3);
  C.fadeOut(list, B3 + 0.1);
  C.pulse(proc.nodes[0], B3 + 0.6, 1.3, 0.5);
  C.pop(second, B3 + 1.1);
  C.pop(card2, B3 + 1.9);
  tl.hold(END);
};

// ==================== Case states: the life of a case ====================
films.casestates = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 4.4, 5.4, 4.2, 5.6);
  const folder = C.folder(L, 250, 112, { w: 196, h: 122, label: k.f('caseOf', k.f('anna')) });
  const db = C.db(L, 480, 104, { w: 74, h: 66, label: k.t('stored') });
  const data = C.doc(L, 250, 100, [], { w: 32, h: 30 });
  const track = C.group(L, 0, 0);
  const xs = [140, 300, 460];
  C.path(track, 'M140 250 H460', { stroke: P.soft, sw: 3 });
  ['CREATED', 'RUNNING', 'DONE'].forEach((name, i) => {
    C.circle(track, xs[i], 250, 11, { fill: [P.cream, P.gold, P.greenLight][i], stroke: P.ink, sw: 3 });
    C.text(track, xs[i], 284, name, { size: 15.5, weight: 700, color: P.cream, font: 'Consolas, monospace' });
  });
  const marker = C.group(L, xs[0], 250);
  C.circle(marker, 0, 0, 19, { stroke: P.gold, sw: 4 });
  const ok = C.check(L, 346, 58, { r: 19 });
  const gone = C.tag(L, 300, 356, k.t('cancelled'), { color: P.red, size: 15, lang: k.lang });

  k.say('created', B0);
  C.pop(folder, B0 + 0.3);
  C.fadeIn(track, B0 + 0.9);
  C.pop(marker, B0 + 1.5);

  k.say('running', B1);
  C.pop(db, B1 + 0.5);
  C.pop(data, B1 + 0.9);
  tl.to(data, { x: 480, y: 96, s: 0.7 }, B1 + 1.4, 0.9, 'inOut');
  C.fadeOut(data, B1 + 2.3, 0.25);
  C.pulse(db, B1 + 2.3, 1.12);
  C.move(marker, xs[1], 250, B1 + 2.6, 0.7);

  k.say('done', B2);
  C.move(marker, xs[2], 250, B2 + 0.6, 0.7);
  C.pop(ok, B2 + 1.4);

  k.say('destroyed', B3);
  C.pop(gone, B3 + 0.7);
  C.shake(gone, B3 + 1.4);
  tl.hold(END);
};
