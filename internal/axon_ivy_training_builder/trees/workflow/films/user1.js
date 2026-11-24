/**
 * The Workflow tree, user level 1: each skill's short film. films/kit.js has what all films share;
 * src/film.js describes the kit (k) a film gets.
 */
import { P } from '../../../src/cast.js';
import { FILL, who, chip, beats, scene } from './kit.js';

export const films = {};

// ==================== User: someone who logs in ====================
films.user = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 4.6, 4.6, 5.0, 5.6);
  const ben = who(k, L, 'ben', 108, 420, 0.9);
  const form = C.form(L, 392, 200, { w: 262, title: k.t('login'), rows: [[k.t('userField'), ''], [k.t('password'), '']], button: k.t('login'), buttonFill: P.sky });
  const card = C.form(L, 392, 205, { w: 290, title: k.f('userWord'), rows: [[k.t('userName'), 'ben'], [k.t('fullName'), 'Ben Suter'], [k.t('mail'), 'ben@example.com']] });

  k.say('login', B0);
  C.pop(ben, B0 + 0.2);
  C.pop(form, B0 + 0.5);
  C.type(form.values[0], 'ben', B0 + 1.1, 8);
  C.type(form.values[1], '••••••', B0 + 1.8, 14);
  C.pulse(form.button, B0 + 2.8, 1.15);

  k.say('card', B1);
  C.fadeOut(form, B1 + 0.1);
  C.pop(card, B1 + 0.5);

  k.say('known', B2);
  C.fadeOut(card, B2 + 0.1);
  const known = C.tag(L, 392, 140, k.t('known', 'ben'), { color: P.sky, size: 17, lang: k.lang });
  C.pop(known, B2 + 0.5);
  const task = C.card(L, 392, 226, { w: 276, title: k.f('contract'), chip: k.f('open'), chipFill: FILL.open });
  C.pop(task, B2 + 1.2);
  chip(k, task, 'inProgress', B2 + 2.2);
  chip(k, task, 'done', B2 + 3.4);

  k.say('many', B3);
  C.fadeOut(known, B3 + 0.1);
  C.fadeOut(task, B3 + 0.1);
  const pills = [C.pill(L, 108, 316, 'ben', { fill: P.sky, size: 13, o: 0 })];
  C.pop(pills[0], B3 + 0.5);
  [['hanna', 300], ['max', 410], ['anna', 520]].forEach(([id, x], i) => {
    const p = who(k, L, id, x, 420, 0.7);
    const pill = C.pill(L, x, 334, id, { fill: P.sky, size: 13, o: 0 });
    C.pop(p, B3 + 0.9 + i * 0.5);
    C.pop(pill, B3 + 1.2 + i * 0.5);
  });
  tl.hold(END);
};

// ==================== Session user: who is working right now ====================
films.session = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 4.8, 4.8, 4.4, 6.0);
  const xs = [104, 300, 496];
  const names = ['anna', 'max', 'SYSTEM'];
  const proc = C.proc(L, 300, 82, [{ kind: 'dialog', label: k.t('request') }, { kind: 'user', label: k.t('approve') }, { kind: 'script', label: k.t('book') }], { w: 540, file: 'LeaveRequest.p.json' });
  const tok = C.token(L);
  const wins = xs.map((x, i) => {
    const g = scene(k, { o: 0 });
    const win = C.list(g, x, 222, { title: k.t('session'), owner: names[i], w: 172, h: 128 });
    tl.set(win, { o: 1 }, 0);
    const actor = i === 2 ? C.robot(g, x, 280, { s: 0.5 }) : who(k, g, names[i], x, 280, 0.5, '');
    tl.set(actor, { o: 1 }, 0);
    return g;
  });
  const log = C.log(L, 300, 334, k.f('sessionUser', 'anna'), { w: 380 });
  const creator = C.tag(L, 300, 396, k.t('creator'), { color: P.red, size: 15, lang: k.lang });

  k.say('anna', B0);
  C.fadeIn(proc, B0);
  C.enter(proc, 0, B0 + 0.5);
  C.fadeIn(wins[0], B0 + 0.8);
  C.pop(log, B0 + 1.6);

  k.say('max', B1);
  C.run(proc, tok, [0, 1], B1 + 0.3, 0.9);
  C.dim(wins[0], B1 + 0.6, 0.35);
  C.fadeIn(wins[1], B1 + 1.2);
  C.say(log.line, k.f('sessionUser', 'max'), B1 + 1.6);
  C.pulse(log, B1 + 1.6, 1.06);

  k.say('system', B2);
  C.run(proc, tok, [1, 2], B2 + 0.3, 0.9);
  C.dim(wins[1], B2 + 0.6, 0.35);
  C.fadeIn(wins[2], B2 + 1.2);
  C.say(log.line, k.f('sessionUser', 'SYSTEM'), B2 + 1.6);
  C.pulse(log, B2 + 1.6, 1.06);

  k.say('creator', B3);
  C.pop(creator, B3 + 0.8);
  tl.to(wins[0], { o: 1 }, B3 + 1.2, 0.4, 'linear');
  tl.hold(END);
};

// ==================== Anonymous: not logged in ====================
films.anonymous = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 4.6, 4.6, 5.0, 6.6);
  const crowd = scene(k);
  const visitor = who(k, crowd, 'guest', 84, 420, 0.75, k.t('visitor'));
  const link = C.tag(L, 106, 262, k.t('link'), { color: P.sky, size: 15, lang: k.lang });
  const insc = C.inscription(L, 404, 140, { w: 350, title: k.f('start'), tab: k.f('requestTab'), split: 0.32, rows: [[k.t('permission'), '☑ ' + k.t('allow')], [k.f('roles'), '']] });
  const others = [200, 292, 384].map(x => who(k, crowd, 'guest', x, 420, 0.6, ''));
  const anyone = C.tag(L, 292, 300, k.t('anyone'), { color: P.red, size: 15, lang: k.lang });
  const anna = who(k, L, 'anna', 508, 420, 0.7);
  const role = C.pill(L, 508, 336, k.f('employee'), { fill: P.sky, size: 13, o: 0 });
  const ok = C.check(L, 560, 372, { r: 16 });

  k.say('who', B0);
  C.pop(visitor, B0 + 0.3);
  C.pop(link, B0 + 1.4);

  k.say('default', B1);
  C.pop(insc, B1 + 0.3);
  C.fadeIn(insc.marks[0], B1 + 1.4, 0.3);

  k.say('risk', B2);
  others.forEach((p, i) => C.pop(p, B2 + 0.4 + i * 0.35));
  C.pop(anyone, B2 + 1.8);

  k.say('fix', B3);
  C.say(insc.values[0], '☐ ' + k.t('allow'), B3 + 0.6);
  C.pulse(insc.values[0], B3 + 0.6, 1.1);
  C.fadeOut(insc.marks[0], B3 + 1.2, 0.2);
  C.fadeIn(insc.marks[1], B3 + 1.4, 0.2);
  C.type(insc.values[1], k.f('employee'), B3 + 1.6, 12);
  C.dim(crowd, B3 + 2.6, 0.22);
  C.fadeOut(anyone, B3 + 2.6);
  C.fadeOut(link, B3 + 2.6);
  C.pop(anna, B3 + 3.2);
  C.pop(role, B3 + 3.6);
  C.pop(ok, B3 + 4.2);
  tl.hold(END);
};
