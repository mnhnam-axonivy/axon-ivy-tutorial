/**
 * The Workflow tree, E-Mail: each skill's short film. films/kit.js has what all films share;
 * src/film.js describes the kit (k) a film gets.
 */
import { P } from '../../../src/cast.js';
import { who, beats } from './kit.js';

export const films = {};

// ==================== E-Mail: the process writes a mail ====================
films.email = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, B4, END] = beats(k.opening(), 4.8, 5.8, 5.0, 5.4, 6.8);
  const proc = C.proc(L, 300, 88, [{ kind: 'user', label: k.t('approve') }, { kind: 'email', label: k.t('tell') }, { kind: 'end' }], { w: 440, file: 'LeaveRequest.p.json' });
  const tok = C.token(L);
  const tabs = [k.t('headerTab'), k.t('contentTab')];
  const header = C.inscription(L, 188, 290, { w: 352, title: k.t('tell'), tabs, rows: [[k.t('subject'), 'Leave of <%=in.name%>'], [k.t('to'), '<%=in.mail%>']], split: 0.3 });
  const content = C.inscription(L, 188, 290, { w: 352, title: k.t('tell'), tabs, active: 1, rows: [[k.t('message'), k.t('bodyCode')], [k.t('type'), 'text/plain']], split: 0.3 });
  const mail = C.doc(L, 484, 262, [k.t('subjectSent'), 'anna@example.com', ''], { w: 208 });
  const anna = who(k, L, 'anna', 484, 418, 0.6);
  const server = C.db(L, 188, 318, { w: 84, h: 70, label: k.t('server') });
  const env = C.envelope(L, proc.at(1).x, 176, { w: 62 });

  k.say('tell', B0);
  C.fadeIn(proc, B0);
  C.pop(anna, B0 + 0.5);
  C.enter(proc, 0, B0 + 0.9);
  C.run(proc, tok, [0, 1], B0 + 2.0, 0.9);

  k.say('header', B1);
  C.pop(header, B1 + 0.4);
  C.fadeIn(header.marks[0], B1 + 1.6, 0.3);
  C.fadeOut(header.marks[0], B1 + 2.6, 0.2);
  C.fadeIn(header.marks[1], B1 + 2.7, 0.3);

  k.say('data', B2);
  C.fadeOut(header.marks[1], B2, 0.2);
  C.fadeIn(header.marks[0], B2 + 0.2, 0.3);
  C.pop(mail, B2 + 1.0);
  C.pulse(mail, B2 + 2.2, 1.06);

  k.say('content', B3);
  C.fadeOut(header, B3, 0.25);
  C.fadeIn(content, B3 + 0.2, 0.3);
  C.fadeIn(content.marks[0], B3 + 1.2, 0.3);
  C.say(mail.lines[2], k.t('bodySent'), B3 + 2.0);
  C.pulse(mail, B3 + 2.0, 1.06);

  k.say('server', B4);
  C.fadeOut(content, B4, 0.3);
  C.pop(server, B4 + 0.5);
  C.pop(env, B4 + 1.0);
  C.move(env, 188, 300, B4 + 1.6, 0.9);
  C.fadeOut(env, B4 + 2.4, 0.3);
  C.pulse(server, B4 + 2.5, 1.1);
  C.run(proc, tok, [1, 2], B4 + 3.0, 0.9);
  C.finish(proc, 2, B4 + 4.4);
  tl.hold(END);
};

// ==================== When a mail fails: ivy:error:email, and catching it ====================
films.mailerror = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, B4, END] = beats(k.opening(), 5.2, 5.4, 4.8, 5.2, 6.4);
  const steps = boundary => [
    { kind: 'email', x: -124, label: k.t('tell'), boundary },
    { kind: 'script', x: 44, label: k.t('book') },
    { kind: 'end', x: 150 }
  ];
  const plain = C.proc(L, 300, 96, steps(false), { scale: 1.1, frame: { b: 92 }, file: 'LeaveRequest.p.json' });
  const safe = C.proc(L, 300, 96, [...steps('error'), { kind: 'user', x: 44, y: 84, label: k.t('call') }], { scale: 1.1, edges: [[0, 1], [1, 2], [0.5, 3]], file: 'LeaveRequest.p.json' });
  const tok = C.token(L);
  const server = C.db(L, 486, 326, { w: 84, h: 70, label: k.t('server') });
  const env = C.envelope(L, 150, 322, { w: 66 });
  const no = C.cross(L, 414, 322, { r: 17 });
  const silent = C.tag(L, 486, 266, k.t('noAnswer'), { color: P.red, size: 13, lang: k.lang });
  const error = C.log(L, 300, 426, 'ivy:error:email', { w: 300, level: 'ERROR' });
  const code = C.pill(L, safe.at(0.5).x, 262, 'ivy:error:email', { fill: P.cream, size: 13, o: 0 });
  const hanna = who(k, L, 'hanna', 96, 420, 0.58);
  const yaml = C.doc(L, 300, 396, ['ivy.yaml', 'EMail: Server: Host: …'], { w: 250, mono: true });

  k.say('fail', B0);
  C.fadeIn(plain, B0);
  C.enter(plain, 0, B0 + 0.6);
  C.pop(server, B0 + 0.9);
  C.pop(env, B0 + 1.4);
  C.move(env, 350, 322, B0 + 2.0, 0.9);
  C.pop(no, B0 + 3.0);
  C.pop(silent, B0 + 3.2);

  k.say('error', B1);
  C.shake(env, B1 + 0.3);
  C.shake(plain.nodes[0], B1 + 0.5);
  C.pop(error, B1 + 0.9);

  k.say('catch', B2);
  C.fadeOut(error, B2, 0.3);
  C.fadeOut(plain, B2, 0.3);
  C.fadeIn(safe, B2 + 0.1, 0.3);
  C.pulse(safe.node(0.5), B2 + 1.0, 1.5, 0.7);
  C.pop(code, B2 + 1.6);

  k.say('path', B3);
  C.enter(safe, 0, B3 + 0.3);
  C.shake(env, B3 + 0.8);
  C.run(safe, tok, [0.5, 3], B3 + 1.4, 1.0);
  C.pop(hanna, B3 + 2.6);

  k.say('designer', B4);
  C.fadeOut(code, B4, 0.3);
  C.fadeOut(hanna, B4, 0.3);
  C.pop(yaml, B4 + 0.6);
  C.pulse(server, B4 + 1.6, 1.12);
  tl.hold(END);
};
