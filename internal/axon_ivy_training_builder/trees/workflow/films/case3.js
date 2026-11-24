/**
 * The Workflow tree, case level 3: each skill's short film. films/kit.js has what all films share;
 * src/film.js describes the kit (k) a film gets.
 */
import { P, D } from '../../../src/cast.js';
import { FILL, who, chip, beats, scene } from './kit.js';

export const films = {};

// ==================== Case category and fields: sorting the cases ====================
films.casefields = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 4.0, 5.2, 5.2, 6.0);
  const list = C.list(L, 150, 236, { title: k.f('caseWord'), w: 272, h: 244 });
  const cards = [k.t('leaveCase'), k.t('contractCase'), k.t('orderCase')].map((title, i) =>
    C.card(L, list.slot(i).x, list.slot(i).y, { w: list.cardW, title, sub: '', size: 15 }));
  const insc = C.inscription(L, 450, 152, { w: 284, title: k.f('userTask'), tabs: [k.f('taskTab'), k.t('caseTab')], active: 1, split: 0.46, rows: [[k.f('category'), ''], [k.f('customFields'), '']] });

  k.say('many', B0);
  C.fadeIn(list, B0 + 0.2);
  cards.forEach((c, i) => C.pop(c, B0 + 0.7 + i * 0.3));

  k.say('category', B1);
  C.pop(insc, B1 + 0.3);
  C.fadeIn(insc.marks[0], B1 + 1.0, 0.3);
  C.type(insc.values[0], k.t('path'), B1 + 1.4, 10);
  C.type(cards[0].sub, k.t('path'), B1 + 3.0, 18);
  C.pulse(cards[0], B1 + 3.2, 1.06);

  k.say('field', B2);
  C.fadeOut(insc.marks[0], B2 + 0.2, 0.2);
  C.fadeIn(insc.marks[1], B2 + 0.4, 0.2);
  C.type(insc.values[1], k.t('fieldName') + ' = ' + k.t('fieldValue'), B2 + 0.8, 12);
  C.say(cards[0].sub, k.t('path') + ' · ' + k.t('fieldName') + ': 3', B2 + 3.0);
  C.pulse(cards[0], B2 + 3.0, 1.06);

  k.say('both', B3);
  C.fadeOut(insc.marks[1], B3 + 0.4, 0.3);
  C.pulse(insc, B3 + 1.4, 1.04);
  tl.hold(END);
};

// ==================== Business case: cases that belong together ====================
films.businesscase = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 5.2, 5.0, 5.6, 5.8);
  const frame = C.group(L, 176, 244, { s: 0.5 });
  C.rect(frame, -250, -150, 500, 300, { r: 22, stroke: P.gold, sw: 5, dash: '12 9' });
  const tag = C.tag(L, 176, 144, k.t('bc'), { color: P.gold, size: 14.5, lang: k.lang });
  const f1 = C.folder(L, 176, 250, { w: 176, h: 120, label: k.t('leave'), size: 14.5 });
  const f2 = C.folder(L, 424, 250, { w: 176, h: 120, label: k.t('booking'), size: 14.5 });
  const arrow = C.line(L, 'M268 250 H328', { color: P.cream, width: 3 });
  const tip = C.group(L, 0, 0);
  C.head(tip, 334, 250, 0, P.cream);

  k.say('one', B0);
  C.pop(f1, B0 + 0.3);
  C.fadeIn(frame, B0 + 1.6);
  C.pop(tag, B0 + 2.2);

  k.say('more', B1);
  C.draw(arrow, B1 + 0.8);
  C.fadeIn(tip, B1 + 1.4, 0.2);
  C.pop(f2, B1 + 1.6);

  k.say('attach', B2);
  tl.to(frame, { x: 300, s: 1 }, B2 + 0.5, 1.0, 'inOut');
  C.move(tag, 300, 70, B2 + 0.5, 1.0);
  C.pulse(f2, B2 + 1.8, 1.07);

  k.say('why', B3);
  C.pulse(f1, B3 + 0.8, 1.07);
  C.pulse(f2, B3 + 1.4, 1.07);
  tl.hold(END);
};

// ==================== Trigger Step: starting another workflow ====================
films.trigger = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 4.6, 6.2, 4.4, 6.2);
  const top = C.proc(L, 166, 94, [{ kind: 'user', label: k.t('approve') }, { kind: 'trigger', label: k.t('trig') }, { kind: 'end' }], { w: 290, file: 'LeaveRequest.p.json' });
  const bottom = C.proc(L, 166, 316, [{ kind: 'start', label: k.t('bookStart') }, { kind: 'script', label: k.t('book') }, { kind: 'end' }], { w: 290, scale: 1, file: 'Booking.p.json' });
  const tok = C.token(L);
  const tok2 = C.token(L);
  const link = C.line(L, `M${top.at(1).x} ${top.at(1).y + 30 * top.S} V206 H${bottom.at(0).x} V${bottom.at(0).y - 15 * bottom.S - 3}`, { color: P.gold, width: 3 });
  // the rows use the whole width; the checkbox's label is the Designer's long one, on two lines in its row
  const insc = C.inscription(L, 464, 222, { w: 258, title: k.f('start'), tab: k.t('triggerTab'), split: 0.04, rows: [['', ''], ['', k.f('responsible') + ': ' + k.f('system')]] });
  k.t('allow').split('\n').forEach((line, i, all) => C.text(insc, -129 + 258 * 0.04 + 8, (i - (all.length - 1) / 2) * 13, line, { anchor: 'start', size: 12, weight: 600, color: D.stroke }));
  const robot = C.robot(L, 486, 424, { s: 0.5, name: k.f('system'), nameSize: 32 });

  k.say('need', B0);
  C.fadeIn(top, B0);
  C.enter(top, 0, B0 + 0.5);
  C.run(top, tok, [0, 1], B0 + 2.2, 0.9);

  k.say('trigger', B1);
  C.draw(link, B1 + 0.6, 0.9);
  C.fadeIn(bottom, B1 + 1.2);
  C.enter(bottom, 0, B1 + 2.0);
  C.pop(insc, B1 + 3.0);
  C.fadeIn(insc.marks[0], B1 + 4.0, 0.3);

  k.say('goes', B2);
  C.run(top, tok, [1, 2], B2 + 0.4, 0.9);
  C.finish(top, 2, B2 + 2.2);

  k.say('who', B3);
  C.fadeOut(insc.marks[0], B3 + 0.3, 0.2);
  C.fadeIn(insc.marks[1], B3 + 0.5, 0.2);
  C.pop(robot, B3 + 1.4);
  C.run(bottom, tok2, [0, 1, 2], B3 + 2.4, 0.8);
  C.finish(bottom, 2, B3 + 4.8);
  tl.hold(END);
};

// ==================== Signal Start: whoever is listening ====================
films.signalstart = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 5.0, 5.0, 4.6, 6.6);
  const sender = C.proc(L, 126, 112, [{ kind: 'script', label: k.t('hire') }, { kind: 'end' }], { w: 200, scale: 1.1, file: 'Hiring.p.json' });
  const tok = C.token(L);
  const sig = C.doc(L, 126, 232, [k.t('code')], { w: 176, mono: true });
  const ys = [124, 316];
  const files = ['Laptop.p.json', 'Account.p.json'];
  const listeners = [k.t('laptop'), k.t('account')].map((label, i) => C.proc(L, 452, ys[i], [{ kind: 'signalstart' }, { kind: 'script', label }], { w: 200, scale: 1.1, file: files[i] }));
  const toks = listeners.map(() => C.token(L));
  const waves = listeners.map(p => C.line(L, `M214 232 H276 V${p.at(0).y} H${p.at(0).x - 15 * p.S - 4}`, { color: P.gold, width: 3 }));
  const sys = listeners.map(p => C.pill(L, p.at(1).x, p.at(1).y + 62, k.f('system'), { fill: P.sky, size: 12.5, o: 0 }));
  const goes = C.tag(L, 126, 326, k.t('sender'), { color: P.green, size: 14.5, lang: k.lang });

  k.say('send', B0);
  C.fadeIn(sender, B0);
  C.enter(sender, 0, B0 + 0.6);
  C.pop(sig, B0 + 2.2);

  k.say('listen', B1);
  listeners.forEach((p, i) => C.fadeIn(p, B1 + 0.4 + i * 0.4));
  waves.forEach((w, i) => C.draw(w, B1 + 1.8 + i * 0.3, 0.9));

  k.say('start', B2);
  listeners.forEach((p, i) => {
    C.enter(p, 0, B2 + 0.4 + i * 0.3);
    C.run(p, toks[i], [0, 1], B2 + 1.2 + i * 0.3, 0.9);
    C.pop(sys[i], B2 + 2.4 + i * 0.3);
  });

  k.say('loose', B3);
  C.run(sender, tok, [0, 1], B3 + 0.4, 0.9);
  C.finish(sender, 1, B3 + 2.0);
  C.pop(goes, B3 + 1.8);
  tl.hold(END);
};

// ==================== Persist on start: stored from the first click ====================
films.persist = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 4.6, 5.8, 4.6, 5.6);
  const track = C.group(L, 0, 0);
  const xs = [150, 300, 450];
  C.path(track, 'M150 84 H450', { stroke: P.soft, sw: 3 });
  ['CREATED', 'RUNNING', 'DONE'].forEach((name, i) => {
    C.circle(track, xs[i], 84, 11, { fill: [P.cream, P.gold, P.greenLight][i], stroke: P.ink, sw: 3 });
    C.text(track, xs[i], 118, name, { size: 15.5, weight: 700, color: P.cream, font: 'Consolas, monospace' });
  });
  const marker = C.group(L, xs[0], 84);
  C.circle(marker, 0, 0, 19, { stroke: P.gold, sw: 4 });
  const folder = C.folder(L, 110, 290, { w: 170, h: 116, label: k.f('caseOf', k.f('anna')), size: 14 });
  const insc = C.inscription(L, 404, 262, { w: 350, title: k.f('start'), tab: k.f('taskTab'), split: 0.26, rows: [[k.t('options'), k.t('persistOn')]] });
  const db = C.db(L, 420, 280, { w: 78, h: 70, label: k.t('stored') });
  const data = C.doc(L, 110, 270, [], { w: 32, h: 30 });
  const anon = C.tag(L, 300, 404, k.t('anon'), { color: P.red, size: 14.5, lang: k.lang });

  k.say('normal', B0);
  C.fadeIn(track, B0 + 0.2);
  C.pop(marker, B0 + 0.8);
  C.pop(folder, B0 + 1.4);

  k.say('option', B1);
  C.pop(insc, B1 + 0.4);
  C.fadeIn(insc.marks[0], B1 + 1.4, 0.3);
  C.move(marker, xs[1], 84, B1 + 3.4, 0.7);

  k.say('why', B2);
  C.fadeOut(insc, B2 + 0.1);
  C.pop(db, B2 + 0.6);
  C.pop(data, B2 + 1.0);
  tl.to(data, { x: 420, y: 270, s: 0.7 }, B2 + 1.5, 0.9, 'inOut');
  C.fadeOut(data, B2 + 2.4, 0.25);
  C.pulse(db, B2 + 2.4, 1.12);

  k.say('cond', B3);
  C.pop(anon, B3 + 0.8);
  tl.hold(END);
};

// ==================== The case in code ====================
films.caseapi = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 3.8, 5.6, 4.6, 6.2);
  const folder = C.folder(L, 104, 120, { w: 168, h: 112, label: k.f('caseOf', k.f('anna')), size: 14 });
  const docs = scene(k);
  const d1 = C.doc(docs, 408, 84, [k.t('l1'), '→ ' + k.t('v1')], { w: 322, mono: true });
  const d2 = C.doc(docs, 408, 176, [k.t('l2'), '→ ' + k.t('v2')], { w: 322, mono: true });
  const d3 = C.doc(docs, 408, 258, [k.t('l3')], { w: 322, mono: true });
  const t1 = C.card(L, 196, 300, { w: 262, title: k.t('task1'), size: 14.5 });
  const t2 = C.card(L, 196, 372, { w: 262, title: k.t('task2'), size: 14.5 });
  const same = C.pill(L, 470, 336, k.t('sameCase'), { fill: P.gold, size: 14.5, o: 0 });
  const j1 = C.line(L, 'M328 300 H380 V336 H420', { color: P.soft, width: 3 });
  const j2 = C.line(L, 'M328 372 H380 V336', { color: P.soft, width: 3 });

  k.say('current', B0);
  C.pop(folder, B0 + 0.4);

  k.say('read', B1);
  C.pop(d1, B1 + 0.4);
  C.pop(d2, B1 + 2.6);

  k.say('bc', B2);
  C.pop(d3, B2 + 0.6);

  k.say('same', B3);
  C.fadeOut(docs, B3 + 0.1);
  C.pop(t1, B3 + 0.6);
  C.pop(t2, B3 + 1.2);
  C.draw(j1, B3 + 2.0);
  C.draw(j2, B3 + 2.2);
  C.pop(same, B3 + 2.8);
  tl.hold(END);
};
