/**
 * The Workflow tree, user level 3: each skill's short film. films/kit.js has what all films share;
 * src/film.js describes the kit (k) a film gets.
 */
import { P } from '../../../src/cast.js';
import { FILL, who, chip, beats, scene } from './kit.js';

export const films = {};

// ==================== The user's language: in your own language ====================
films.language = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 4.8, 4.8, 5.2, 5.8);
  const cms = C.doc(L, 300, 92, [k.t('cmsEn'), k.t('cmsJa')], { w: 250 });
  const tag = C.tag(L, 300, 40, 'CMS', { color: P.violet, size: 14.5, lang: k.lang });
  const max = who(k, L, 'max', 150, 420, 0.7);
  const anna = who(k, L, 'anna', 450, 420, 0.7);
  const lm = C.pill(L, 150, 336, k.t('noLang'), { fill: P.soft, size: 12.5, o: 0 });
  const la = C.pill(L, 450, 336, k.t('langJa'), { fill: P.gold, size: 12.5, o: 0 });
  const cm = C.card(L, 150, 252, { w: 236, title: k.t('textEn') });
  const ca = C.card(L, 450, 252, { w: 236, title: k.t('textJa') });
  const l1 = C.line(L, 'M240 128 H150 V226', { color: P.soft, width: 3 });
  const l2 = C.line(L, 'M360 128 H450 V226', { color: P.soft, width: 3 });

  k.say('cms', B0);
  C.pop(tag, B0 + 0.3);
  C.pop(cms, B0 + 0.7);

  k.say('en', B1);
  C.pop(max, B1 + 0.3);
  C.pop(lm, B1 + 0.8);
  C.draw(l1, B1 + 1.4);
  C.pop(cm, B1 + 2.0);

  k.say('ja', B2);
  C.pop(anna, B2 + 0.3);
  C.pop(la, B2 + 0.8);
  C.draw(l2, B2 + 1.8);
  C.pop(ca, B2 + 2.4);

  k.say('names', B3);
  C.pulse(cms, B3 + 0.8, 1.08);
  C.pulse(cm, B3 + 2.0, 1.06);
  C.pulse(ca, B3 + 2.4, 1.06);
  tl.hold(END);
};

// ==================== Absence: out of office ====================
films.absence = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 4.2, 4.8, 4.8, 5.6);
  const anna = who(k, L, 'anna', 100, 420, 0.75);
  const away = C.tag(L, 100, 300, k.t('absent'), { color: P.gold, size: 14.5, lang: k.lang });
  const c1 = C.card(L, 372, 106, { w: 270, title: k.t('forHr'), chip: k.f('open'), chipFill: FILL.open });
  const hanna = who(k, L, 'hanna', 548, 150, 0.5);
  const c2 = C.card(L, 372, 240, { w: 270, title: k.t('forAnna'), chip: k.f('open'), chipFill: FILL.open });
  const clock = C.clock(L, 548, 244, { r: 26 });
  const waits = C.tag(L, 372, 300, k.t('waits'), { color: P.red, size: 14.5, lang: k.lang });
  const ben = who(k, L, 'ben', 480, 420, 0.62);

  k.say('away', B0);
  C.pop(anna, B0 + 0.3);
  C.pop(away, B0 + 1.2);
  C.dim(anna, B0 + 1.8, 0.4);

  k.say('role', B1);
  C.pop(c1, B1 + 0.4);
  C.pop(hanna, B1 + 1.2);
  chip(k, c1, 'inProgress', B1 + 2.0);
  chip(k, c1, 'done', B1 + 3.2);

  k.say('personal', B2);
  C.pop(c2, B2 + 0.4);
  C.pop(clock, B2 + 1.4);
  tl.to(clock.minute, { r: 1080 }, B2 + 1.6, 2.4, 'linear');
  C.pop(waits, B2 + 2.6);

  k.say('next', B3);
  C.pop(ben, B3 + 1.0);
  C.pulse(ben, B3 + 2.2, 1.12);
  tl.hold(END);
};

// ==================== Substitute: standing in ====================
films.substitute = (L, k) => {
  const { C, tl } = k;
  const [B0, B1, B2, B3, END] = beats(k.opening(), 4.4, 4.6, 5.2, 5.6);
  const anna = who(k, L, 'anna', 130, 420, 0.75);
  const ben = who(k, L, 'ben', 470, 420, 0.75);
  const link = C.line(L, 'M186 384 H414', { color: P.gold, width: 3 });
  const sub = C.tag(L, 300, 356, k.t('subst'), { color: P.gold, size: 13.5, lang: k.lang });
  const card = C.card(L, 300, 130, { w: 290, title: k.t('forAnna'), chip: k.f('open'), chipFill: FILL.open });
  const away = C.tag(L, 130, 292, k.t('absent'), { color: P.red, size: 13.5, lang: k.lang });
  const back = C.tag(L, 130, 292, k.t('back'), { color: P.green, size: 13.5, lang: k.lang });
  const ok = C.check(L, 470, 296, { r: 18 });
  const no = C.cross(L, 470, 296, { r: 18 });
  const reach = C.line(L, 'M470 270 V190 H420', { color: P.greenLight, width: 3 });

  k.say('set', B0);
  C.pop(anna, B0 + 0.3);
  C.pop(ben, B0 + 0.7);
  C.draw(link, B0 + 1.6);
  C.pop(sub, B0 + 2.2);

  k.say('task', B1);
  C.pop(card, B1 + 0.5);
  C.pulse(anna, B1 + 2.0, 1.1);

  k.say('ben', B2);
  C.pop(away, B2 + 0.4);
  C.dim(anna, B2 + 0.8, 0.4);
  C.pop(ok, B2 + 2.0);
  C.draw(reach, B2 + 2.6);

  k.say('back', B3);
  C.fadeOut(away, B3 + 0.2);
  C.pop(back, B3 + 0.6);
  tl.to(anna, { o: 1 }, B3 + 0.6, 0.4, 'linear');
  C.fadeOut(ok, B3 + 1.6);
  C.fadeOut(reach, B3 + 1.6);
  C.pop(no, B3 + 2.2);
  tl.hold(END);
};
