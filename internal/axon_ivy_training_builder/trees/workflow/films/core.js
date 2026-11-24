/**
 * The Workflow tree, core: each skill's short film. films/kit.js has what all films share;
 * src/film.js describes the kit (k) a film gets.
 */
import { P } from '../../../src/cast.js';
import { FILL, who, chip, beats, scene } from './kit.js';

export const films = {};

// ==================== Approval workflow: the boss of level 3 ====================
films.boss3 = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, B4, B5, END] = beats(k.opening(), 4.4, 4.8, 5.0, 3.6, 4.6, 5.2);
  const proc = C.proc(L, 300, 92, [
    { kind: 'start' }, { kind: 'dialog', label: k.t('request') }, { kind: 'user', label: k.t('approve') },
    { kind: 'switch', label: k.f('system') }, { kind: 'script', label: k.t('book') }, { kind: 'end' }
  ], { w: 556, file: 'LeaveRequest.p.json' });
  const tok = C.token(L);
  const folder = C.folder(L, 88, 296, { w: 150, h: 108, label: k.f('caseOf', k.f('anna')), size: 14 });
  const anna = who(k, L, 'anna', 88, 424, 0.5);
  const max = who(k, L, 'max', 250, 424, 0.5);
  const hanna = who(k, L, 'hanna', 400, 424, 0.5);
  const robot = C.robot(L, 532, 424, { s: 0.5, name: k.f('system'), nameSize: 32 });
  const card = C.card(L, 250, 302, { w: 164, title: k.t('approveCard'), sub: k.f('normal'), size: 14.5 });
  const clock = C.clock(L, 250, 226, { r: 24 });

  k.say('start', B0);
  C.fadeIn(proc, B0);
  C.pop(folder, B0 + 0.4);
  C.pop(anna, B0 + 0.7);
  C.enter(proc, 0, B0 + 1.1);
  C.run(proc, tok, [0, 1], B0 + 1.6, 0.8);

  k.say('approve', B1);
  C.run(proc, tok, [1, 2], B1 + 0.2, 0.8);
  C.pop(max, B1 + 1.2);
  C.pop(card, B1 + 1.7);

  k.say('away', B2);
  C.dim(max, B2 + 0.3, 0.3);
  C.pop(clock, B2 + 0.6);
  tl.to(clock.minute, { r: 1080 }, B2 + 0.8, 1.6, 'inOut');
  C.shake(clock, B2 + 2.4);
  C.pop(hanna, B2 + 2.6);
  C.move(card, 400, 302, B2 + 2.8, 0.9);
  C.say(card.sub, k.f('high'), B2 + 3.6);
  C.fadeOut(clock, B2 + 3.6);

  k.say('hr', B3);
  C.pulse(hanna, B3 + 0.2, 1.1);
  C.say(card.sub, k.f('done'), B3 + 0.8);
  tl.to(card.tick, { o: 1 }, B3 + 0.8, 0.2, 'linear');
  C.run(proc, tok, [2, 3], B3 + 1.4, 0.8);

  k.say('system', B4);
  C.fadeOut(card, B4 + 0.1);
  C.pop(robot, B4 + 0.3);
  tl.to(robot.gear, { r: 360 }, B4 + 0.6, 2.2, 'inOut');
  C.run(proc, tok, [3, 4, 5], B4 + 0.9, 0.8);
  C.finish(proc, 5, B4 + 3.6);

  k.say('done', B5);
  const ok = C.check(L, 150, 256, { r: 20 });
  C.pop(ok, B5 + 0.4);
  const done = C.tag(L, 300, 196, k.t('done'), { color: P.green, size: 17, lang: k.lang });
  C.pop(done, B5 + 0.9);
  tl.hold(END);
};

// ==================== Workflow: the root ====================
films.workflow = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 4.4, 4.6, 7.4, 5.8);
  const top = scene(k);
  const proc = C.proc(top, 300, 118, [
    { kind: 'start' }, { kind: 'script', label: k.t('check') }, { kind: 'user', label: k.t('approve') }, { kind: 'script', label: k.t('book') }, { kind: 'end' }
  ], { w: 540, file: 'LeaveRequest.p.json' });
  const tok = C.token(top);
  const wait = C.tag(top, proc.at(2).x, 190, k.t('waits'), { color: P.gold, lang: k.lang });
  const max = who(k, top, 'max', 300, 404, 0.85);

  k.say('process', B0);
  C.fadeIn(proc, B0);
  C.enter(proc, 0, B0 + 0.6);
  C.run(proc, tok, [0, 1], B0 + 1.2, 0.9);

  k.say('people', B1);
  C.run(proc, tok, [1, 2], B1 + 0.2, 0.9);
  C.pop(wait, B1 + 1.3);
  C.pop(max, B1 + 2.0);

  // the four things, in the order of the tree's branches
  k.say('four', B2);
  C.fadeOut(top, B2, 0.4);
  const xs = [84, 228, 372, 516];
  const things = [
    C.proc(L, xs[0], 180, [{ kind: 'user', label: k.t('approve') }], { frame: false, scale: 1.05 }),
    C.card(L, xs[1], 180, { w: 128, title: k.t('approve'), size: 15 }),
    C.folder(L, xs[2], 182, { w: 112, h: 88, label: '' }),
    who(k, L, 'max', xs[3], 226, 0.7, '')
  ];
  const role = C.badge(L, xs[3], 122, k.f('manager'), { fill: P.pink, size: 13 });
  C.pop(role, B2 + 5.8);
  const words = [['elementWord', P.sky], ['taskWord', P.green], ['caseWord', P.gold], ['peopleWord', P.pink]];
  const tags = words.map(([key, color], i) => C.tag(L, xs[i], 288, k.f(key), { color, size: 15, lang: k.lang }));
  things.forEach((thing, i) => {
    C.pop(thing, B2 + 0.7 + i * 1.5);
    C.pop(tags[i], B2 + 1.1 + i * 1.5);
  });

  // five levels under each
  k.say('tree', B3);
  [0, 1, 2, 3, 4].forEach(level => xs.forEach((x, i) => {
    const dot = C.group(L, x, 326 + level * 22);
    C.circle(dot, 0, 0, 7.5, { fill: words[i][1], stroke: P.ink, sw: 2.5 });
    C.pop(dot, B3 + 0.5 + level * 0.6 + i * 0.08);
  }));
  tl.hold(END);
};

// ==================== First approval: the boss of level 1 ====================
films.boss1 = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 5.4, 5.4, 4.8, 5.8);
  const proc = C.proc(L, 300, 96, [{ kind: 'start' }, { kind: 'dialog', label: k.t('request') }, { kind: 'user', label: k.t('approve') }, { kind: 'end' }], { w: 480, file: 'LeaveRequest.p.json' });
  const tok = C.token(L);
  const folder = C.folder(L, 100, 300, { w: 164, h: 112, label: k.f('caseOf', k.f('anna')), size: 14 });
  const state = C.pill(L, 100, 284, 'CREATED', { fill: P.cream, size: 13, o: 0 });
  const anna = who(k, L, 'anna', 100, 424, 0.5);
  const list = C.list(L, 418, 268, { title: k.f('taskList'), owner: k.f('max'), w: 262, h: 146 });
  const max = who(k, L, 'max', 400, 424, 0.5);
  const badge = C.pill(L, 474, 398, k.f('manager'), { fill: P.pink, size: 12.5, o: 0 });
  const card = C.card(L, proc.at(2).x, proc.at(2).y, { w: list.cardW, title: k.t('approveCard'), chip: k.f('open'), chipFill: FILL.open });
  const ok = C.check(L, 172, 250, { r: 18 });

  k.say('start', B0);
  C.fadeIn(proc, B0);
  C.pop(folder, B0 + 0.4);
  C.pop(state, B0 + 0.8);
  C.pop(anna, B0 + 1.0);
  C.enter(proc, 0, B0 + 1.4);
  C.run(proc, tok, [0, 1], B0 + 2.0, 0.8);

  k.say('usertask', B1);
  C.run(proc, tok, [1, 2], B1 + 0.2, 0.8);
  C.fadeIn(list, B1 + 1.0);
  C.pop(card, B1 + 1.5, { s: 0.5 });
  tl.to(card, { x: list.slot(0).x, y: list.slot(0).y, s: 1 }, B1 + 2.0, 0.9, 'inOut');
  tl.set(state, { text: k.t('running'), fill: P.gold }, B1 + 3.0);
  C.pulse(state, B1 + 3.0, 1.2);

  k.say('max', B2);
  C.pop(max, B2 + 0.3);
  C.pop(badge, B2 + 0.8);
  chip(k, card, 'inProgress', B2 + 2.2);

  k.say('done', B3);
  chip(k, card, 'done', B3 + 0.5);
  C.run(proc, tok, [2, 3], B3 + 1.2, 0.9);
  C.finish(proc, 3, B3 + 2.6);
  tl.set(state, { text: k.t('caseDone'), fill: P.greenLight }, B3 + 2.6);
  C.pulse(state, B3 + 2.6, 1.2);
  C.pop(ok, B3 + 3.0);
  tl.hold(END);
};

// ==================== The whole business case: the last boss ====================
films.boss5 = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, B4, B5, END] = beats(k.opening(), 4.8, 5.6, 5.6, 5.2, 4.6, 5.8);
  // the business case: a frame around both cases
  const frame = C.group(L, 300, 188);
  C.rect(frame, -292, -180, 584, 360, { r: 20, stroke: P.gold, sw: 3, dash: '11 8' });
  const bc = C.tag(L, 506, 304, k.t('bc'), { color: P.gold, size: 13.5, lang: k.lang });
  // the leave process: two checks at once, then a Trigger Step
  const leave = C.proc(L, 300, 122, [
    { kind: 'start', x: -250, label: k.t('request') },
    { kind: 'gateway', x: -185 },
    { kind: 'user', x: -90, y: -42, label: k.t('mgr') },
    { kind: 'user', x: -90, y: 42, label: k.t('hr') },
    { kind: 'gateway', x: 5 },
    { kind: 'trigger', x: 110, label: k.t('trig') },
    { kind: 'end', x: 225 }
  ], { scale: 0.8, edges: [[0, 1], [1, 2], [1, 3], [2, 4], [3, 4], [4, 5], [5, 6]], file: k.t('leaveCase') + '.p.json' });
  // the booking, started by the trigger
  const booking = C.proc(L, 250, 304, [{ kind: 'start' }, { kind: 'script', label: k.f('system') }, { kind: 'end' }], { w: 300, scale: 0.9, file: k.t('bookingCase') + '.p.json' });
  const link = C.line(L, `M${leave.at(5).x} ${leave.at(5).y + 24} V232 H${booking.at(0).x} V${booking.at(0).y - 16}`, { color: P.gold, width: 3 });
  const tokA = C.token(L);
  const tokB = C.token(L);
  const tok2 = C.token(L);
  // the people
  const anna = who(k, L, 'anna', 70, 434, 0.42);
  const max = who(k, L, 'max', 170, 434, 0.42);
  const lea = who(k, L, 'lea', 270, 434, 0.42);
  const hanna = who(k, L, 'hanna', 370, 434, 0.42);
  const robot = C.robot(L, 500, 434, { s: 0.42, name: k.f('system'), nameSize: 38 });
  const absent = C.pill(L, 170, 380, k.t('absent'), { fill: P.red, size: 11.5, o: 0 });
  const subst = C.pill(L, 270, 380, k.t('subst'), { fill: P.gold, size: 11.5, o: 0 });
  const ok1 = C.check(L, 572, 44, { r: 12 });
  const ok2 = C.check(L, 420, 270, { r: 12 });

  k.say('start', B0);
  C.fadeIn(leave, B0);
  C.pop(anna, B0 + 0.8);
  C.enter(leave, 0, B0 + 1.2);
  C.run(leave, tokA, [0, 1], B0 + 2.2, 0.7);

  k.say('parallel', B1);
  C.run(leave, tokA, [1, 2], B1 + 0.4, 0.7);
  C.run(leave, tokB, [1, 3], B1 + 0.4, 0.7, { quiet: true });
  C.pop(max, B1 + 1.6);
  C.pop(hanna, B1 + 1.9);
  C.pulse(leave.nodes[4], B1 + 3.0, 1.2, 0.6);

  k.say('away', B2);
  C.pop(absent, B2 + 0.4);
  C.dim(max, B2 + 0.6, 0.35);
  C.pop(lea, B2 + 1.4);
  C.pop(subst, B2 + 1.8);
  C.run(leave, tokA, [2, 4], B2 + 3.0, 0.7, { hold: true });

  k.say('trigger', B3);
  C.run(leave, tokB, [3, 4], B3 + 0.2, 0.7, { hold: true });
  C.arrive(leave, [tokA, tokB], 4, B3 + 1.1);
  C.run(leave, tokA, [4, 5], B3 + 1.5, 0.6);
  C.draw(link, B3 + 2.3, 0.8);
  C.fadeIn(booking, B3 + 2.7);
  C.enter(booking, 0, B3 + 3.3);
  C.fadeIn(frame, B3 + 3.6, 0.6);
  C.pop(bc, B3 + 3.8);

  k.say('system', B4);
  C.run(leave, tokA, [5, 6], B4 + 0.2, 0.7);
  C.finish(leave, 6, B4 + 1.4);
  C.pop(robot, B4 + 0.6);
  tl.to(robot.gear, { r: 360 }, B4 + 1.0, 2.2, 'inOut');
  C.run(booking, tok2, [0, 1, 2], B4 + 1.4, 0.8);
  C.finish(booking, 2, B4 + 3.8);

  k.say('done', B5);
  C.pop(ok1, B5 + 0.5);
  C.pop(ok2, B5 + 1.0);
  C.pulse(frame, B5 + 1.8, 1.03, 0.8);
  tl.hold(END);
};

// ==================== Approve or reject: the boss of level 2 ====================
films.boss2 = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, B4, END] = beats(k.opening(), 5.2, 5.0, 4.6, 6.4, 5.2);
  const proc = C.proc(L, 300, 126, [
    { kind: 'start', x: -250 },
    { kind: 'dialog', x: -160, label: k.t('request') },
    { kind: 'user', x: -24, label: k.t('decide') },
    { kind: 'alternative', x: 76 },
    { kind: 'script', x: 192, y: -46, label: k.t('book') },
    { kind: 'email', x: 192, y: 46, label: k.t('sayNo') }
  ], { scale: 0.98, edges: [[0, 1], [1, 2], [2, 3], [3, 4, k.t('yes')], [3, 5, k.t('no')]], file: 'LeaveRequest.p.json' });
  const tok = C.token(L);
  const tok2 = C.token(L);
  const whose = C.pill(L, 96, 258, k.t('annaCase'), { fill: P.gold, size: 14, o: 0 });
  const max = who(k, L, 'max', 92, 420, 0.6);
  const yes = C.form(L, 296, 326, { w: 236, title: k.t('decide'), rows: [[k.f('anna'), k.f('threeDays')]], button: k.t('approveBtn') });
  const no = C.form(L, 296, 326, { w: 236, title: k.t('decide'), rows: [[k.f('ben'), k.f('threeDays')]], button: k.t('rejectBtn'), buttonFill: P.red });
  const data = C.doc(L, 498, 262, [k.t('approvedTrue')], { w: 180, mono: true });
  const done = C.tag(L, 498, 318, k.t('done'), { color: P.green, size: 13.5, lang: k.lang });
  const env = C.envelope(L, proc.at(5).x, proc.at(5).y + 70, { w: 58 });
  const ben = who(k, L, 'ben', 498, 424, 0.56);

  k.say('request', B0);
  C.fadeIn(proc, B0);
  C.pop(whose, B0 + 0.4);
  C.enter(proc, 0, B0 + 0.8);
  C.run(proc, tok, [0, 1, 2], B0 + 1.3, 0.7);
  C.pop(max, B0 + 3.4);

  k.say('decide', B1);
  C.pop(yes, B1 + 0.3);
  C.pulse(yes.button, B1 + 2.2, 1.18);
  C.pop(data, B1 + 2.8);

  k.say('yes', B2);
  C.fadeOut(yes, B2, 0.3);
  C.run(proc, tok, [2, 3, 4], B2 + 0.5, 0.8);
  C.finish(proc, 4, B2 + 2.8);
  C.pop(done, B2 + 3.0);

  // the same process, another case
  k.say('no', B3);
  C.fadeOut(done, B3, 0.2);
  C.fadeOut(data, B3, 0.2);
  [0, 1, 2, 3, 4].forEach(i => tl.set(proc.nodes[i], { state: 'idle' }, B3 + 0.2));
  [[0, 1], [1, 2], [2, 3], [3, 4]].forEach(([a, b]) => tl.set(proc.edge(a, b), { state: 'idle' }, B3 + 0.2));
  tl.set(whose, { text: k.t('benCase') }, B3 + 0.3);
  C.pulse(whose, B3 + 0.3, 1.15);
  C.enter(proc, 0, B3 + 0.6);
  C.run(proc, tok2, [0, 1, 2], B3 + 0.9, 0.5, { dwell: 0.2 });
  C.pop(no, B3 + 2.2);
  C.pulse(no.button, B3 + 3.2, 1.18);
  tl.set(data.lines[0], { text: k.t('approvedFalse') }, B3 + 3.6);
  C.pop(data, B3 + 3.6);
  C.fadeOut(no, B3 + 4.0, 0.3);
  C.run(proc, tok2, [2, 3, 5], B3 + 4.3, 0.8);

  k.say('mail', B4);
  C.fadeOut(max, B4, 0.3);
  C.pop(ben, B4 + 0.3);
  C.pop(env, B4 + 0.8);
  C.move(env, 420, 398, B4 + 1.4, 0.9);
  C.finish(proc, 5, B4 + 2.4);
  C.pop(done, B4 + 2.8);
  tl.hold(END);
};

// ==================== Side by side: the boss of level 4 ====================
films.boss4 = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, B4, END] = beats(k.opening(), 5.2, 5.8, 4.8, 6.0, 5.6);
  const people = C.proc(L, 300, 132, [
    { kind: 'gateway', x: -206 },
    { kind: 'dialog', x: -78, y: -46, label: k.t('mgr') },
    { kind: 'dialog', x: -78, y: 46, label: k.t('hr') },
    { kind: 'gateway', x: 50 },
    { kind: 'dialog', x: 178, label: k.t('confirm') }
  ], { scale: 1.05, edges: [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4]], file: 'LeaveRequest.p.json' });
  const engine = C.proc(L, 300, 132, [
    { kind: 'dialog', x: -206, label: k.t('confirm') },
    { kind: 'split', x: -92 },
    { kind: 'script', x: 30, y: -46, label: k.t('book') },
    { kind: 'email', x: 30, y: 46, label: k.t('tell') },
    { kind: 'join', x: 152 },
    { kind: 'end', x: 218 }
  ], { scale: 1.05, edges: [[0, 1], [1, 2], [1, 3], [2, 4], [3, 4], [4, 5]], file: 'LeaveRequest.p.json' });
  const [a, b, c, d] = [C.token(L), C.token(L), C.token(L), C.token(L)];
  const max = who(k, L, 'max', 150, 420, 0.56);
  const hanna = who(k, L, 'hanna', 290, 420, 0.56);
  const anna = who(k, L, 'anna', 478, 420, 0.56);
  const creator = C.pill(L, people.at(3).x, 262, k.f('creator'), { fill: P.pink, size: 13.5, o: 0 });
  const tasks = C.tag(L, 300, 286, k.t('tasksWord'), { color: P.gold, size: 13, lang: k.lang });
  const steps = C.tag(L, 300, 330, k.t('stepsWord'), { color: P.sky, size: 13, lang: k.lang });

  k.say('people', B0);
  C.fadeIn(people, B0);
  C.enter(people, 0, B0 + 0.6);
  C.run(people, a, [0, 1], B0 + 1.4, 0.8);
  C.run(people, b, [0, 2], B0 + 1.4, 0.8, { quiet: true });
  C.pop(max, B0 + 2.6);
  C.pop(hanna, B0 + 2.9);

  k.say('joinTasks', B1);
  C.run(people, a, [1, 3], B1 + 0.4, 0.9, { hold: true });
  C.run(people, b, [2, 3], B1 + 1.3, 0.9, { hold: true });
  C.arrive(people, [a, b], 3, B1 + 2.5);
  C.pop(creator, B1 + 2.8);
  C.run(people, a, [3, 4], B1 + 3.4, 0.8);
  C.pop(anna, B1 + 4.2);

  k.say('engine', B2);
  [people, max, hanna, creator].forEach(x => C.fadeOut(x, B2, 0.3));
  C.fadeIn(engine, B2 + 0.2, 0.3);
  C.enter(engine, 0, B2 + 0.6);
  C.pulse(anna, B2 + 0.8, 1.1);
  C.run(engine, c, [0, 1], B2 + 2.4, 0.8);

  k.say('split', B3);
  C.run(engine, c, [1, 2], B3 + 0.3, 0.8);
  C.run(engine, d, [1, 3], B3 + 0.3, 0.8, { quiet: true });
  C.run(engine, c, [2, 4], B3 + 1.7, 0.9, { hold: true });
  C.run(engine, d, [3, 4], B3 + 2.1, 0.9, { hold: true });
  C.arrive(engine, [c, d], 4, B3 + 3.3);
  C.run(engine, c, [4, 5], B3 + 3.8, 0.7);
  C.finish(engine, 5, B3 + 4.9);

  k.say('point', B4);
  C.pop(tasks, B4 + 0.5);
  C.pop(steps, B4 + 1.8);
  tl.hold(END);
};
