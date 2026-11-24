/**
 * The Workflow tree, HTML Dialogs: each skill's short film. films/kit.js has what all films
 * share; src/film.js describes the kit (k) a film gets.
 */
import { P } from '../../../src/cast.js';
import { who, beats } from './kit.js';

export const films = {};

// ==================== HTML Dialog: a view, its data, its logic ====================
films.htmldialog = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, B4, END] = beats(k.opening(), 5.0, 4.4, 4.8, 4.8, 5.6);
  const form = C.form(L, 168, 196, { w: 250, title: k.t('request'), rows: [[k.f('from'), ''], [k.f('days'), '']], button: k.t('send') });
  const anna = who(k, L, 'anna', 450, 300, 0.9);
  const ys = [118, 212, 306];
  const files = [k.t('viewFile'), k.t('dataFile'), k.t('logicFile')].map((name, i) => C.doc(L, 452, ys[i], [name], { w: 248, mono: true }));
  const tags = [[k.t('view'), P.sky], [k.t('data'), P.gold], [k.t('logic'), P.greenLight]].map(([word, color], i) => C.tag(L, 452, ys[i] - 42, word, { color, size: 13, lang: k.lang }));
  const logic = C.proc(L, 168, 392, [{ kind: 'start', label: 'start()' }, { kind: 'end' }], { w: 190, scale: 1, frame: { l: 40, r: 40 }, file: k.t('logicFile') });
  const folder = C.folder(L, 452, 398, { w: 160, h: 70, label: 'LeaveForm', size: 14 });

  k.say('need', B0);
  C.pop(anna, B0 + 0.3);
  C.pop(form, B0 + 1.6);

  k.say('view', B1);
  C.fadeOut(anna, B1);
  C.pop(tags[0], B1 + 0.5);
  C.pop(files[0], B1 + 0.9);
  C.pulse(form, B1 + 1.8, 1.04);

  k.say('data', B2);
  C.type(form.values[0], k.f('monday'), B2 + 0.4);
  C.type(form.values[1], '3', B2 + 1.4);
  C.pop(tags[1], B2 + 2.0);
  C.pop(files[1], B2 + 2.4);

  k.say('logic', B3);
  C.fadeIn(logic, B3 + 0.4);
  C.pop(tags[2], B3 + 1.2);
  C.pop(files[2], B3 + 1.6);
  C.pulse(form.button, B3 + 2.8, 1.15);

  k.say('folder', B4);
  C.pop(folder, B4 + 0.5);
  files.forEach((f, i) => C.pulse(f, B4 + 1.4 + i * 0.4, 1.05));
  tl.hold(END);
};

// ==================== User Dialog: the element that shows the page ====================
films.userdialog = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, B4, END] = beats(k.opening(), 5.4, 4.8, 4.2, 5.0, 6.4);
  const proc = C.proc(L, 300, 88, [{ kind: 'start' }, { kind: 'dialog', label: k.t('request') }, { kind: 'script', label: k.t('check') }, { kind: 'end' }], { w: 520, file: 'LeaveRequest.p.json' });
  const tok = C.token(L);
  const insc = C.inscription(L, 300, 272, { w: 310, title: k.t('request'), tabs: [k.t('dialogTab'), k.f('output')], rows: [[k.t('dialogTab'), 'LeaveForm'], [k.f('start'), 'start()']] });
  const anna = who(k, L, 'anna', 96, 416, 0.62);
  const form = C.form(L, 322, 298, { w: 250, title: k.t('request'), rows: [[k.f('from'), k.f('monday')], [k.f('days'), '3']], button: k.t('send') });
  const waits = C.tag(L, proc.at(1).x, 166, k.t('waits'), { color: P.gold, size: 13.5, lang: k.lang });
  const one = C.pill(L, 322, 262, k.t('oneTask'), { fill: P.sky, size: 15, o: 0 });

  k.say('element', B0);
  C.fadeIn(proc, B0);
  C.pulse(proc.nodes[1], B0 + 0.8, 1.12);
  C.pop(insc, B0 + 1.4);
  C.fadeIn(insc.marks[0], B0 + 2.8, 0.3);

  k.say('opens', B1);
  C.fadeOut(insc, B1, 0.3);
  C.pop(anna, B1 + 0.3);
  C.enter(proc, 0, B1 + 0.5);
  C.run(proc, tok, [0, 1], B1 + 1.0, 0.8);
  C.pop(form, B1 + 2.1);

  k.say('waits', B2);
  C.pop(waits, B2 + 0.4);
  C.pulse(proc.nodes[1], B2 + 1.2, 1.1);

  k.say('closes', B3);
  C.pulse(form.button, B3 + 0.4, 1.18);
  C.fadeOut(form, B3 + 1.0);
  C.fadeOut(waits, B3 + 1.0);
  C.run(proc, tok, [1, 2, 3], B3 + 1.4, 0.8);
  C.finish(proc, 3, B3 + 3.4);

  k.say('notask', B4);
  C.pop(one, B4 + 0.6);
  C.pulse(anna, B4 + 1.4, 1.1);
  tl.hold(END);
};

// ==================== Data in and out: param and result ====================
films.dialogdata = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, B4, END] = beats(k.opening(), 4.6, 6.2, 4.6, 6.6, 5.4);
  const tagL = C.tag(L, 124, 102, k.t('procData'), { color: P.gold, size: 13, lang: k.lang });
  const tagR = C.tag(L, 476, 102, k.t('dlgData'), { color: P.sky, size: 13, lang: k.lang });
  const left = C.doc(L, 124, 162, [k.t('nameAnna'), k.t('days0')], { w: 178, mono: true });
  const right = C.doc(L, 476, 162, [k.t('nameEmpty'), k.t('days0')], { w: 178, mono: true });
  const into = C.arrow(L, 226, 150, 374, 150, { color: P.gold });
  const back = C.arrow(L, 374, 178, 226, 178, { color: P.greenLight });
  const callTab = C.inscription(L, 300, 318, { w: 330, title: k.t('request'), tabs: [k.t('dialogTab'), k.f('output')], rows: [['param.name', 'in.name']], split: 0.46 });
  const outTab = C.inscription(L, 300, 318, { w: 330, title: k.t('request'), tabs: [k.t('dialogTab'), k.f('output')], active: 1, rows: [['out.days', 'result.days']], split: 0.46 });
  const anna = who(k, L, 'anna', 476, 372, 0.8);
  const gone = C.cross(L, 300, 178, { r: 17 });

  k.say('own', B0);
  C.pop(tagL, B0 + 0.3);
  C.pop(left, B0 + 0.5);
  C.pop(tagR, B0 + 1.1);
  C.pop(right, B0 + 1.3);

  k.say('in', B1);
  C.pop(callTab, B1 + 0.4);
  C.fadeIn(callTab.marks[0], B1 + 1.6, 0.3);
  C.draw(into, B1 + 2.6, 0.8);
  C.say(right.lines[0], k.t('nameAnna'), B1 + 3.4);
  C.pulse(right, B1 + 3.4, 1.06);

  k.say('typed', B2);
  C.fadeOut(callTab, B2, 0.3);
  C.pop(anna, B2 + 0.3);
  C.type(right.lines[1], k.t('days3'), B2 + 1.4);
  C.pulse(right, B2 + 2.2, 1.06);

  k.say('out', B3);
  C.fadeOut(anna, B3, 0.3);
  C.pop(outTab, B3 + 0.5);
  C.fadeIn(outTab.marks[0], B3 + 2.6, 0.3);
  C.draw(back, B3 + 3.6, 0.8);
  C.say(left.lines[1], k.t('days3'), B3 + 4.4);
  C.pulse(left, B3 + 4.4, 1.06);

  k.say('lost', B4);
  C.fadeOut(outTab.marks[0], B4 + 0.2, 0.2);
  C.dim(outTab, B4 + 0.4, 0.3);
  C.dim(back, B4 + 0.4, 0.2);
  tl.to(back.tip, { o: 0.2 }, B4 + 0.4, 0.4, 'linear');
  C.pop(gone, B4 + 0.9);
  C.say(left.lines[1], k.t('days0'), B4 + 1.6);
  C.shake(left, B4 + 1.6);
  tl.hold(END);
};

// ==================== Closing a dialog: Exit End or Process End ====================
films.dialogclose = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, B4, END] = beats(k.opening(), 4.8, 5.0, 5.6, 6.4, 5.4);
  const row = y => [{ x: -62, y }, { x: 62, y }];
  const main = C.proc(L, 428, 150, [
    { kind: 'start', label: 'start()', ...row(-42)[0] }, { kind: 'end', label: k.t('processEnd'), ...row(-42)[1] },
    { kind: 'start', label: 'close', ...row(46)[0] }, { kind: 'end', label: k.t('exitEnd'), ...row(46)[1] }
  ], { scale: 1.1, edges: [[0, 1], [2, 3]], frame: { l: 22, r: 22, b: 96 }, file: 'LeaveFormProcess.p.json' });
  const extra = C.proc(L, 428, 150, [{ kind: 'start', label: 'check', ...row(134)[0] }, { kind: 'end', label: k.t('processEnd'), ...row(134)[1] }], { scale: 1.1, edges: [[0, 1]], frame: false });
  const tok = C.token(L);
  const tok2 = C.token(L);
  const form = C.form(L, 136, 168, { w: 216, title: k.t('request'), rows: [[k.f('days'), '3']] });
  const send = C.pill(L, 186, 254, k.t('send'), { fill: P.green, color: P.cream, size: 14.5, o: 0 });
  const check = C.pill(L, 96, 254, k.t('checkBtn'), { fill: P.soft, size: 14.5, o: 0 });
  const code = C.doc(L, 136, 314, [k.t('closeCode')], { w: 200, mono: true });
  const closed = C.tag(L, 136, 168, k.t('closed'), { color: P.red, size: 14, lang: k.lang });
  const toProcess = C.pill(L, 428, 398, k.t('exitEnd') + ' → ' + k.t('toProcess'), { fill: P.greenLight, size: 13.5, o: 0 });
  const toPage = C.pill(L, 428, 428, k.t('processEnd') + ' → ' + k.t('toPage'), { fill: P.soft, size: 13.5, o: 0 });

  k.say('logic', B0);
  C.fadeIn(main, B0);
  C.pulse(main.nodes[0], B0 + 1.6, 1.15);
  C.pulse(main.nodes[2], B0 + 2.6, 1.15);

  k.say('button', B1);
  C.pop(form, B1 + 0.3);
  C.pop(send, B1 + 0.8);
  C.pop(code, B1 + 1.6);
  C.pulse(send, B1 + 3.0, 1.2);
  C.enter(main, 2, B1 + 3.4);

  k.say('exit', B2);
  C.run(main, tok, [2, 3], B2 + 0.3, 0.9);
  C.finish(main, 3, B2 + 1.6);
  C.fadeOut(form, B2 + 2.0);
  C.fadeOut(send, B2 + 2.0);
  C.fadeOut(code, B2 + 2.0);
  C.pop(closed, B2 + 2.5);

  k.say('stay', B3);
  C.fadeOut(closed, B3, 0.3);
  C.fadeIn(form, B3 + 0.4);
  C.fadeIn(send, B3 + 0.4);
  C.pop(check, B3 + 0.6);
  C.say(code.lines[0], k.t('checkCode'), B3 + 0.6);
  C.fadeIn(code, B3 + 0.6);
  C.fadeIn(extra, B3 + 1.0);
  C.pulse(check, B3 + 2.2, 1.2);
  C.enter(extra, 0, B3 + 2.6);
  C.run(extra, tok2, [0, 1], B3 + 3.0, 0.9);
  C.finish(extra, 1, B3 + 4.3);
  C.pulse(form, B3 + 4.8, 1.05);

  k.say('rule', B4);
  C.pop(toProcess, B4 + 0.5);
  C.pulse(main.nodes[3], B4 + 0.6, 1.2);
  C.pop(toPage, B4 + 2.0);
  C.pulse(extra.nodes[1], B4 + 2.1, 1.2);
  tl.hold(END);
};
