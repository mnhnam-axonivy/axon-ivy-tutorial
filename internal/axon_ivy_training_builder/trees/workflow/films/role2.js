/**
 * The Workflow tree, role level 2: each skill's short film. films/kit.js has what all films share;
 * src/film.js describes the kit (k) a film gets.
 */
import { P } from '../../../src/cast.js';
import { FILL, who, chip, beats, scene } from './kit.js';

export const films = {};

// ==================== SYSTEM: work for the engine ====================
films.system = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, B4, END] = beats(k.opening(), 4.6, 4.2, 4.6, 3.8, 6.0);
  const proc = C.proc(L, 300, 100, [{ kind: 'user', label: k.t('approve') }, { kind: 'switch', label: k.f('system') }, { kind: 'script', label: k.t('book') }, { kind: 'end' }], { w: 500, file: 'LeaveRequest.p.json' });
  const tok = C.token(L);
  const max = who(k, L, 'max', 82, 422, 0.6);
  const robot = C.robot(L, 300, 422, { s: 0.74, name: k.f('system'), nameSize: 16 / 0.74 });

  k.say('approved', B0);
  C.fadeIn(proc, B0);
  C.pop(max, B0 + 0.4);
  C.enter(proc, 0, B0 + 1.0);
  C.run(proc, tok, [0, 1], B0 + 2.4, 0.9);

  k.say('system', B1);
  C.pulse(proc.nodes[1], B1 + 0.3, 1.2, 0.6);
  C.dim(max, B1 + 0.8, 0.35);
  C.pop(robot, B1 + 1.2);

  k.say('runs', B2);
  tl.to(robot.gear, { r: 540 }, B2 + 0.2, 3.0, 'inOut');
  C.pulse(robot, B2 + 0.3, 1.08);
  C.run(proc, tok, [1, 2, 3], B2 + 0.6, 0.8);
  C.finish(proc, 3, B2 + 3.4);

  k.say('user', B3);
  const log = C.log(L, 300, 232, k.t('log'), { w: 420 });
  C.pop(log, B3 + 0.4);

  k.say('retry', B4);
  C.fadeOut(log, B4);
  C.shake(robot, B4 + 0.3);
  const retry = C.tag(L, 300, 232, k.t('retry'), { color: P.red, lang: k.lang });
  C.pop(retry, B4 + 0.8);
  const ok = C.check(L, 368, 326, { r: 20 });
  C.pop(ok, B4 + 3.4);
  tl.hold(END);
};

// ==================== Role tree: roles in a tree ====================
films.roletree = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 4.2, 5.2, 4.8, 5.8);
  const file = C.tag(L, 146, 84, k.t('file'), { color: P.violet, size: 14.5, lang: k.lang });
  const doc = C.doc(L, 146, 206, ['Roles:', '  - Id: Employee', '  - Id: Manager', '    Parent: Employee', '  - Id: HR', '    Parent: Employee'], { w: 254, mono: true });
  const top = C.badge(L, 446, 84, k.f('everybody'), { fill: P.pink });
  const emp = C.badge(L, 446, 198, k.f('employee'), { fill: P.sky });
  const mgr = C.badge(L, 366, 318, k.f('manager'), { fill: P.gold });
  const hr = C.badge(L, 526, 318, k.f('hr'), { fill: P.teal });
  const l0 = C.line(L, 'M446 104 V178', { color: P.soft, width: 3 });
  const l1 = C.line(L, 'M446 218 V262 H366 V298', { color: P.soft, width: 3 });
  const l2 = C.line(L, 'M446 262 H526 V298', { color: P.soft, width: 3 });

  k.say('file', B0);
  C.pop(file, B0 + 0.3);
  C.pop(doc, B0 + 0.7);

  k.say('parent', B1);
  C.pop(emp, B1 + 0.4);
  C.pulse(doc.lines[3], B1 + 1.2, 1.1);
  C.draw(l1, B1 + 1.4);
  C.pop(mgr, B1 + 2.0);
  C.pulse(doc.lines[5], B1 + 2.6, 1.1);
  C.draw(l2, B1 + 2.8);
  C.pop(hr, B1 + 3.4);

  k.say('root', B2);
  C.pop(top, B2 + 0.6);
  C.draw(l0, B2 + 1.2);

  k.say('why', B3);
  [emp, mgr, hr].forEach((b, i) => C.pulse(b, B3 + 1.0 + i * 0.6, 1.12));
  tl.hold(END);
};

// ==================== Inherited roles: a manager is an employee too ====================
films.inherited = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 5.2, 4.8, 4.8, 6.0);
  const emp = C.badge(L, 300, 54, k.f('employee'), { fill: P.sky, size: 14 });
  const mgr = C.badge(L, 190, 132, k.f('manager'), { fill: P.gold, size: 14 });
  const hr = C.badge(L, 410, 132, k.f('hr'), { fill: P.teal, size: 14 });
  const l1 = C.line(L, 'M300 72 V94 H190 V114', { color: P.soft, width: 3 });
  const l2 = C.line(L, 'M300 94 H410 V114', { color: P.soft, width: 3 });
  const xs = [110, 300, 490];
  const ids = ['anna', 'max', 'hanna'];
  const people = xs.map((x, i) => who(k, L, ids[i], x, 420, 0.62));
  const own = [['employee', P.sky], ['manager', P.gold], ['hr', P.teal]].map(([key, fill], i) => C.pill(L, xs[i], 346, k.f(key), { fill, size: 12.5, o: 0 }));
  const plus = [1, 2].map(i => C.pill(L, xs[i], 318, k.t('plus'), { fill: P.sky, size: 12.5, o: 0 }));
  const card = C.card(L, 300, 216, { w: 240, title: k.t('forEmployee') });
  const icons = xs.map(x => C.doc(L, x, 276, [], { w: 32, h: 30 }));

  k.say('tree', B0);
  C.pop(emp, B0 + 0.3);
  C.draw(l1, B0 + 0.7);
  C.draw(l2, B0 + 0.9);
  C.pop(mgr, B0 + 1.3);
  C.pop(hr, B0 + 1.5);
  people.forEach((p, i) => C.pop(p, B0 + 2.2 + i * 0.3));
  own.forEach((p, i) => C.pop(p, B0 + 2.6 + i * 0.3));

  k.say('up', B1);
  plus.forEach((p, i) => C.pop(p, B1 + 1.0 + i * 0.5));

  k.say('task', B2);
  C.pop(card, B2 + 0.4);
  icons.forEach((d, i) => C.pop(d, B2 + 1.4 + i * 0.4));

  k.say('down', B3);
  C.say(card.title, k.t('forManager'), B3 + 0.6);
  C.pulse(card, B3 + 0.6, 1.08);
  [0, 2].forEach(i => {
    C.fadeOut(icons[i], B3 + 1.6);
    C.dim(people[i], B3 + 1.6, 0.3);
    C.dim(own[i], B3 + 1.6, 0.3);
  });
  C.dim(plus[1], B3 + 1.6, 0.3);
  C.pulse(icons[1], B3 + 2.4, 1.25);
  tl.hold(END);
};

// ==================== A user's roles: several hats ====================
films.userroles = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 5.2, 5.6, 5.0, 5.6);
  const s1 = scene(k);
  const doc = C.doc(s1, 132, 150, ['- Name: hanna', '  Roles:', '    - HR', ''], { w: 224, mono: true });
  const hanna = who(k, s1, 'hanna', 110, 420, 0.7);
  const fills = [P.teal, P.gold, P.soft, P.soft];
  const pills = ['hr', 'manager', 'employee', 'everybody'].map((key, i) => C.pill(s1, 262, 296 + i * 32, k.f(key), { fill: fills[i], size: 13, o: 0 }));
  const all = C.tag(s1, 262, 256, k.t('all'), { color: P.sky, size: 13.5, lang: k.lang });
  const cards = [C.card(s1, 446, 130, { w: 256, title: k.t('forHr') }), C.card(s1, 446, 200, { w: 256, title: k.t('forManager') })];
  const oks = [C.check(s1, 566, 130, { r: 14 }), C.check(s1, 566, 200, { r: 14 })];

  k.say('one', B0);
  C.pop(doc, B0 + 0.3);
  C.pop(hanna, B0 + 0.7);
  C.pop(pills[0], B0 + 1.4);
  C.pop(cards[0], B0 + 2.2);
  C.pop(oks[0], B0 + 3.0);

  k.say('two', B1);
  C.type(doc.lines[3], '    - Manager', B1 + 1.2, 12);
  C.pop(pills[1], B1 + 2.6);
  C.pop(cards[1], B1 + 3.2);
  C.pop(oks[1], B1 + 4.0);

  k.say('all', B2);
  C.pop(all, B2 + 0.5);
  C.pop(pills[2], B2 + 1.4);
  C.pop(pills[3], B2 + 2.0);

  k.say('table', B3);
  C.fadeOut(s1, B3, 0.4);
  const list = C.list(L, 300, 226, { title: k.t('loginTable'), w: 320, h: 196 });
  C.fadeIn(list, B3 + 0.5);
  [['hanna', k.f('hr') + ', ' + k.f('manager')], ['max', k.f('manager')]].forEach(([name, roles], i) => {
    const c = C.card(L, list.slot(i).x, list.slot(i).y, { w: list.cardW, title: name, sub: roles, size: 15 });
    C.pop(c, B3 + 1.0 + i * 0.4);
  });
  tl.hold(END);
};

// ==================== Several roles: either of them will do ====================
films.severalroles = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 4.8, 4.4, 5.0, 5.2);
  const insc = C.inscription(L, 166, 152, { w: 304, title: k.f('userTask'), tab: k.f('taskTab'), split: 0.4, rows: [[k.f('responsible'), k.f('manager')], ['', '']] });
  const card = C.card(L, 462, 112, { w: 244, title: k.t('approve'), chip: k.f('open'), chipFill: FILL.open });
  const max = who(k, L, 'max', 398, 420, 0.65);
  const hanna = who(k, L, 'hanna', 524, 420, 0.65);
  const pm = C.pill(L, 398, 342, k.f('manager'), { fill: P.gold, size: 12.5, o: 0 });
  const ph = C.pill(L, 524, 342, k.f('hr'), { fill: P.teal, size: 12.5, o: 0 });
  const dm = C.doc(L, 398, 298, [], { w: 32, h: 30 });
  const dh = C.doc(L, 524, 298, [], { w: 32, h: 30 });

  k.say('one', B0);
  C.pop(insc, B0 + 0.3);
  C.pop(card, B0 + 0.8);
  C.pop(max, B0 + 1.4);
  C.pop(pm, B0 + 1.8);
  C.pop(dm, B0 + 2.6);

  k.say('add', B1);
  C.fadeIn(insc.marks[1], B1 + 0.5, 0.3);
  C.type(insc.values[1], k.f('hr'), B1 + 1.0, 8);

  k.say('either', B2);
  C.pop(hanna, B2 + 0.4);
  C.pop(ph, B2 + 0.8);
  C.pop(dh, B2 + 1.6);

  k.say('still', B3);
  C.pulse(hanna, B3 + 0.6, 1.1);
  chip(k, card, 'inProgress', B3 + 1.2);
  C.fadeOut(dm, B3 + 1.6);
  C.dim(max, B3 + 1.6, 0.35);
  C.dim(pm, B3 + 1.6, 0.35);
  tl.hold(END);
};

// ==================== Role from Attribute: a role decided at run time ====================
films.roleattr = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 5.0, 5.2, 5.2, 6.2);
  const insc = C.inscription(L, 416, 118, {
    w: 330, title: k.f('userTask'), tab: k.f('taskTab'), split: 0.3,
    rows: [[k.f('responsible'), k.f('roles')], ['', k.f('manager')]]
  });
  const data = C.doc(L, 112, 116, [k.t('team'), ''], { w: 184, mono: true });
  const hrB = C.badge(L, 160, 322, k.f('hr'), { fill: P.teal, size: 14 });
  const mgB = C.badge(L, 440, 322, k.f('manager'), { fill: P.gold, size: 14 });
  const folks = [who(k, L, 'hanna', 112, 426, 0.5), who(k, L, 'ben', 208, 426, 0.5), who(k, L, 'max', 392, 426, 0.5), who(k, L, 'lea', 488, 426, 0.5)];
  const t1 = C.doc(L, 440, 266, [], { w: 32, h: 30 });
  const t2 = C.doc(L, 300, 230, [], { w: 32, h: 30 });

  k.say('fixed', B0);
  C.pop(insc, B0 + 0.3);
  C.pop(hrB, B0 + 0.9);
  C.pop(mgB, B0 + 1.1);
  folks.forEach((p, i) => C.pop(p, B0 + 1.4 + i * 0.2));
  C.pop(t1, B0 + 2.8);

  k.say('data', B1);
  C.pop(data, B1 + 0.8);
  C.type(data.lines[1], '= "HR"', B1 + 2.2, 10);

  k.say('attr', B2);
  C.say(insc.values[0], '', B2 + 0.3);
  C.type(insc.values[0], k.f('roleFromAttr'), B2 + 0.4, 24);
  C.say(insc.values[1], '', B2 + 1.4);
  C.type(insc.values[1], k.t('team'), B2 + 1.5, 16);
  C.move(t1, 160, 266, B2 + 2.8, 1.0);
  C.pulse(hrB, B2 + 3.8, 1.12);

  k.say('next', B3);
  C.say(data.lines[1], '= "Manager"', B3 + 0.6);
  C.pulse(data, B3 + 0.6, 1.1);
  C.pop(t2, B3 + 1.6);
  C.move(t2, 440, 266, B3 + 2.4, 1.0);
  C.pulse(mgB, B3 + 3.4, 1.12);
  tl.hold(END);
};
