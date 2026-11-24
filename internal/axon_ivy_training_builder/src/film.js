/**
 * The film player: the short animated film at the top of a skill's Watch tab. A film is a
 * function (stage, k) that draws into an SVG stage of 600 × 450 and puts every change on k.tl,
 * a seekable timeline (src/timeline.js). What is said runs as a subtitle under the picture;
 * play, pause, replay and a scrubber sit under that, like the blog's skill-tree films.
 *
 * The film's kit k:
 *   k.tl                      the timeline
 *   k.C                       the cast and the moves (src/cast.js)
 *   k.P, k.W, k.H             the film's colours, the stage's size
 *   k.say(key, at)            from `at` seconds on, the subtitle is the skill's show.<key>
 *   k.t(key, …args)           the skill's own film labels; k.f(key) the labels every film shares
 *   k.lang                    'en' or 'ja'
 *   k.opening()               the title card; returns when the film proper starts (seconds)
 *
 * playFilm(host, { film, kit }) → stop()   builds the player in host and starts the film.
 * window.ivyTrainingOptions.filmPace speeds films up (the browser check plays them fast).
 */
import { Timeline } from './timeline.js';
import { makeCast, P, W, H } from './cast.js';
import { svg, makeMeasure, FONT } from './stage.js';

const ICON = {
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5.5h3.5v13H7zM13.5 5.5H17v13h-3.5z"/></svg>',
  replay: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12a7 7 0 1 0 2.1-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M4.5 3.8v4.6h4.6z"/></svg>'
};
const TAIL = 1.4; // a moment on the last picture

const fill = (text, args) => String(text).replace(/\{(\d+)\}/g, (m, n) => (n in args ? args[n] : m));

export function playFilm(host, { film, kit }) {
  const { h, ui, reduced } = kit;
  const options = (typeof window !== 'undefined' && window.ivyTrainingOptions) || {};
  const pace = options.filmPace || 1;

  const btn = (act, label) => h('button', { class: 'tf-pbtn', type: 'button', 'data-act': act, 'aria-label': label });
  const stageEl = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'tf-svg', role: 'img', 'aria-label': kit.name });
  const screen = h('div', { class: 'tf-screen' }, stageEl);
  const big = h('button', { class: 'tf-bigplay', type: 'button', 'aria-label': ui('play'), hidden: '' });
  big.innerHTML = ICON.play;
  screen.append(big);
  const sub = h('p', { class: 'tf-sub', 'aria-live': 'polite' });
  const toggle = btn('toggle', ui('pause'));
  toggle.innerHTML = ICON.pause;
  const replay = btn('replay', ui('replay'));
  replay.innerHTML = ICON.replay;
  const bar = h('i');
  const scrub = h('div', { class: 'tf-scrub', role: 'slider', tabindex: '0', 'aria-label': ui('seek'), 'aria-valuemin': '0', 'aria-valuemax': '100' }, h('span', {}, bar));
  const show = h('div', { class: 'tf-show', 'data-state': 'paused' }, h('div', { class: 'tf-frame' }, screen), sub, h('div', { class: 'tf-pbar' }, toggle, scrub, replay));
  host.append(show);

  // ---- build the film ----
  const tl = new Timeline();
  const measure = makeMeasure(stageEl);
  const C = makeCast(tl, measure);
  const root = C.group(stageEl, 0, 0, { o: 1 });
  const cues = [];
  const labels = kit.labels || {};
  const shared = kit.filmLabels || {};
  const k = {
    tl, C, P, W, H, lang: kit.lang, root,
    say(key, at) { cues.push({ at, text: (kit.show && kit.show[key]) || '' }); },
    t: (key, ...args) => fill(labels[key] ?? shared[key] ?? key, args),
    f: (key, ...args) => fill(shared[key] ?? key, args),
    caps: s => String(s).toLocaleUpperCase(kit.lang),
    // the title card: a double frame, the series in spaced capitals, the skill's name in a big
    // serif and the film's own title in red; it gives way to the film after about three seconds
    opening() {
      const g = C.group(root, 0, 0, { o: 1 });
      const outer = C.line(g, `M26 26 H${W - 26} V${H - 26} H26 Z`, { color: P.sky, width: 6 });
      outer.el.setAttribute('stroke-opacity', 0.55);
      const inner = C.line(g, `M40 40 H${W - 40} V${H - 40} H40 Z`, { color: P.sky, width: 2 });
      inner.el.setAttribute('stroke-opacity', 0.75);
      C.draw(outer, 0, 0.9);
      C.draw(inner, 0.15, 0.9);
      const kicker = C.text(g, W / 2, 150, k.caps(ui('filmKicker')), { size: 16, weight: 600, spacing: 0.22, color: P.soft, o: 0 });
      C.fadeIn(kicker, 0.3, 0.5);
      const word = k.caps(kit.name);
      const size = Math.min(78, (78 * 470) / Math.max(1, measure(word, 78, 700, FONT.serif)));
      const title = C.text(g, W / 2, 228, word, { size, weight: 700, color: P.cream, font: FONT.serif, o: 0 });
      tl.set(title, { s: 0.86 }, 0.5);
      tl.to(title, { o: 1, s: 1 }, 0.5, 0.7, 'out');
      const red = C.text(g, W / 2, 304, k.caps((kit.show && kit.show.title) || ''), { size: 20, weight: 800, spacing: 0.05, color: P.red, o: 0 });
      C.fadeIn(red, 1.1, 0.5);
      tl.to(g, { o: 0 }, 2.9, 0.45, 'linear');
      return 3.2;
    }
  };
  film(root, k);
  cues.sort((a, b) => a.at - b.at);
  tl.prepare();
  const duration = tl.duration + TAIL;

  // ---- play ----
  let time = 0;
  let playing = !reduced && !options.filmPaused;
  let raf = 0;
  let last = 0;
  let shown = null;
  let stopped = false;

  const draw = () => {
    tl.seek(time);
    let line = '';
    for (const cue of cues) if (cue.at <= time + 1e-3) line = cue.text;
    if (line !== shown) {
      shown = line;
      sub.textContent = line;
    }
    const p = duration ? time / duration : 0;
    bar.style.width = (p * 100).toFixed(2) + '%';
    scrub.setAttribute('aria-valuenow', String(Math.round(p * 100)));
  };
  const setButtons = () => {
    const ended = time >= duration - 1e-6;
    toggle.innerHTML = playing ? ICON.pause : ICON.play;
    toggle.setAttribute('aria-label', playing ? ui('pause') : ui('play'));
    // the big button only before the start and at the end
    big.hidden = playing || (time > 0 && !ended);
    big.innerHTML = ended ? ICON.replay : ICON.play;
    big.setAttribute('aria-label', ended ? ui('replay') : ui('play'));
    show.dataset.state = playing ? 'playing' : ended ? 'ended' : 'paused';
  };
  const frame = now => {
    if (stopped) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.1, (now - (last || now)) / 1000);
    last = now;
    if (!playing || !show.isConnected) return;
    time = Math.min(duration, time + dt * pace);
    draw();
    if (time >= duration) {
      playing = false;
      setButtons();
    }
  };
  const play = () => {
    if (time >= duration - 1e-6) time = 0;
    playing = true;
    last = 0;
    setButtons();
  };
  const pause = () => {
    playing = false;
    setButtons();
  };
  toggle.addEventListener('click', () => (playing ? pause() : play()));
  big.addEventListener('click', play);
  screen.addEventListener('click', e => {
    if (e.target === big || big.contains(e.target)) return;
    playing ? pause() : play();
  });
  replay.addEventListener('click', () => {
    time = 0;
    draw();
    play();
  });
  const seekTo = e => {
    const r = scrub.getBoundingClientRect();
    time = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * duration;
    draw();
    setButtons();
  };
  let wasPlaying = false;
  scrub.addEventListener('pointerdown', e => {
    wasPlaying = playing;
    playing = false;
    scrub.setPointerCapture(e.pointerId);
    scrub.classList.add('on');
    seekTo(e);
  });
  scrub.addEventListener('pointermove', e => { if (scrub.hasPointerCapture(e.pointerId)) seekTo(e); });
  const release = () => {
    scrub.classList.remove('on');
    if (wasPlaying && time < duration) play();
    else setButtons();
  };
  scrub.addEventListener('pointerup', release);
  scrub.addEventListener('pointercancel', release);
  scrub.addEventListener('keydown', e => {
    const step = { ArrowRight: 2, ArrowLeft: -2, Home: -1e3, End: 1e3 }[e.key];
    if (step == null) return;
    e.preventDefault();
    e.stopPropagation(); // not the card's ← → (they change tabs)
    time = Math.max(0, Math.min(duration, time + step));
    draw();
    setButtons();
  });

  draw();
  setButtons();
  raf = requestAnimationFrame(frame);
  // for the browser check and for whoever wants to know how long it is
  show.filmDuration = duration;
  return () => {
    stopped = true;
    cancelAnimationFrame(raf);
  };
}
