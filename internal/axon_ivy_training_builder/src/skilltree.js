/**
 * A skill tree: things to learn laid out like a game's skill tree, each locked until the skills
 * it needs are learned. The page is a map of the skills and a card for the one you pick, made
 * to be gone through like a short video: three tabs, a few seconds each.
 *
 *   watch   a short animated film (src/film.js), then the skill in one sentence
 *   myths   three things people think about it, each on a card; a tap turns the card over
 *           to what is true
 *   check   one question; the right answer learns the skill and unlocks what needs it
 *   puzzle  only where the tree has one for the skill (tree.puzzles): the brief, and the
 *           way into the puzzle game, which opens over the whole page (src/puzzle/)
 *
 * Icons are kept few: a skill's emoji on its badge, a tick on what is learned, and one picture
 * on the screens without a skill (welcome, locked, the end). Everything else says it in words
 * or in colour.
 *
 * Made after the skill-tree posts of nammai-blog (js/skilltree.js there), without their toys.
 *
 *   mountTree(host, { tree, lang, ui, onLang }) → destroy()
 *     tree: what buildTree (src/layout.js) returns: { id, branches, colors, nodes: [{ id, emoji,
 *           branch, level, col, row, span, requires, answer }], headings, rows, films, texts,
 *           puzzles, cast }
 *     ui:   the page's texts in this language (src/texts.js)
 *
 * What has been learned, and which puzzles are solved, is kept in the browser (localStorage),
 * per tree. "Unlock all" opens
 * every skill for readers who only want to look something up. A skill's card has its own
 * address (#task), and a skill written [[task|a task]] in a text links to that skill's card.
 */
import { playFilm } from './film.js';
import { openPuzzle } from './puzzle/index.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const fillIn = (el, attrs, kids) => {
  for (const [k, v] of Object.entries(attrs || {})) if (v != null && v !== false) el.setAttribute(k, v);
  el.append(...kids.filter(c => c != null && c !== false));
  return el;
};
export const h = (tag, attrs, ...kids) => fillIn(document.createElement(tag), attrs, kids);
const s = (tag, attrs, ...kids) => fillIn(document.createElementNS(SVG_NS, tag), attrs, kids);
const fill = (text, args) => String(text).replace(/\{(\d+)\}/g, (m, n) => (n in args ? args[n] : m));

// The divider between the map and the card: the map's share of the width, in percent, kept in
// the browser for every tree. The widths in pixels are those of .st in styles.css.
const SPLIT_KEY = 'ivy-training:split';
const SPLIT = { start: 40, min: 25, max: 70 };
const MAP_MIN = 340, DIVIDER = 28, CARD_MIN = 380;

export function mountTree(host, { tree, lang, ui: UI, onLang }) {
  const { nodes } = tree;
  const branches = tree.colors; // a branch's colour
  const T = tree.texts[lang];
  const ui = (key, ...args) => fill(UI[key] ?? T.ui?.[key] ?? key, args);
  const tui = (key, ...args) => fill(T.ui?.[key] ?? UI[key] ?? key, args);
  const byId = new Map(nodes.map(n => [n.id, n]));
  const nameOf = id => T.nodes[id].name;
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cleanups = [];

  // ---- what has been learned -----------------------------------------------------------
  const KEY = 'ivy-training:' + tree.id;
  const puzzles = (T.puzzles && T.puzzle && tree.puzzles) || {};
  const hasPuzzle = n => !!(puzzles[n.id] && T.puzzles[n.id]);
  const saved = { learned: [], free: false, solved: [] };
  try { Object.assign(saved, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) { /* no storage: nothing is kept */ }
  const learned = new Set((saved.learned || []).filter(id => byId.has(id)));
  const solved = new Set((saved.solved || []).filter(id => byId.has(id) && puzzles[id]));
  let free = !!saved.free;
  const persist = () => {
    try { localStorage.setItem(KEY, JSON.stringify({ learned: [...learned], free, solved: [...solved] })); } catch (e) { /* not kept */ }
  };
  const stateOf = n => (learned.has(n.id) ? 'done' : free || (n.requires || []).every(r => learned.has(r)) ? 'open' : 'locked');
  // the skills to go to next: the unlocked ones this skill leads to first, then any other
  const nextUp = from => {
    const open = nodes.filter(n => stateOf(n) === 'open');
    const leads = n => from && (n.requires || []).includes(from.id);
    return [...open.filter(leads), ...open.filter(n => !leads(n))];
  };

  // ---- the map -------------------------------------------------------------------------
  const count = h('span', { class: 'st-count' });
  const meter = h('i');
  const puzzleCount = h('span', { class: 'st-pzcount', title: ui('pzPuzzles') });
  const freeBtn = h('button', { class: 'st-chip', type: 'button' }, ui('freeRoam'));
  const resetBtn = h('button', { class: 'st-chip', type: 'button' }, ui('reset'));
  const finished = h('p', { class: 'st-finished' }, h('strong', {}, tui('complete')), ' ', tui('completeBody'));
  const edgeLayer = s('svg', { class: 'st-edges', 'aria-hidden': 'true' });
  const grid = h('div', { class: 'st-grid', style: `--cols:${tree.branches.length};grid-template-rows:repeat(${tree.rows},auto)` }, edgeLayer);
  // a heading row per level, with how much of the level is learned
  const levelCounts = new Map();
  for (const { level, row } of tree.headings) {
    const n = h('span', { class: 'st-level-count' });
    levelCounts.set(level, n);
    grid.append(h('div', { class: 'st-level', style: `grid-row:${row + 1}` }, h('span', { class: 'st-level-name' }, tui('level' + level)), n));
  }
  const buttons = new Map();
  for (const n of nodes) {
    const button = h('button', { class: 'st-node' + (n.span ? ' st-wide' : ''), type: 'button', 'data-id': n.id, style: `grid-column:${n.span ? '1 / -1' : n.col + 1};grid-row:${n.row + 1};--b:${branches[n.branch]}` },
      h('span', { class: 'st-badge' }, h('span', { class: 'st-emo', 'aria-hidden': 'true' }, n.emoji), h('span', { class: 'st-flag', 'aria-hidden': 'true' })),
      h('span', { class: 'st-name' }, nameOf(n.id)));
    button.addEventListener('click', () => open(n.id));
    buttons.set(n.id, button);
    grid.append(button);
  }
  const edges = [];
  for (const n of nodes) {
    for (const from of n.requires || []) {
      const path = s('path', { class: 'st-edge' });
      edges.push({ from, to: n.id, path });
      edgeLayer.append(path);
    }
  }
  // each edge runs from under one skill's name to the top of the next skill's badge
  const drawEdges = () => {
    const box = grid.getBoundingClientRect();
    if (!box.width) return;
    edgeLayer.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    const place = id => {
      const badge = buttons.get(id).querySelector('.st-badge').getBoundingClientRect();
      const whole = buttons.get(id).getBoundingClientRect();
      return { x: badge.left - box.left + badge.width / 2, top: badge.top - box.top, bottom: whole.bottom - box.top };
    };
    for (const { from, to, path } of edges) {
      const a = place(from);
      const b = place(to);
      const y1 = a.bottom + 5;
      const y2 = b.top - 5;
      const mid = (y1 + y2) / 2;
      path.setAttribute('d', `M${a.x.toFixed(1)} ${y1.toFixed(1)}C${a.x.toFixed(1)} ${mid.toFixed(1)} ${b.x.toFixed(1)} ${mid.toFixed(1)} ${b.x.toFixed(1)} ${y2.toFixed(1)}`);
    }
  };
  const langSwitch = h('div', { class: 'st-lang', role: 'group', 'aria-label': ui('language') },
    ...['en', 'ja'].map(code => {
      const b = h('button', { class: 'st-lang-btn', type: 'button', 'aria-pressed': String(code === lang), lang: code }, code === 'en' ? 'EN' : '日本語');
      b.addEventListener('click', () => { if (code !== lang && onLang) onLang(code); });
      return b;
    }));
  const map = h('section', { class: 'st-map', 'aria-label': ui('mapLabel') },
    h('div', { class: 'st-brand' }, h('span', { class: 'st-mark', 'aria-hidden': 'true' }, 'ivy'), h('span', {}, ui('brand')), h('span', { class: 'st-spacer' }), langSwitch),
    h('div', { class: 'st-intro' }, h('p', { class: 'st-kicker' }, tui('kicker')), h('h1', {}, tui('introTitle')), h('p', {}, tui('introBody'))),
    h('div', { class: 'st-head' },
      h('div', { class: 'st-head-row' },
        h('div', { class: 'st-progress' }, count, h('span', { class: 'st-meter' }, meter), Object.keys(puzzles).length ? puzzleCount : null),
        h('div', { class: 'st-tools' }, freeBtn, resetBtn)),
      // the branches, as the heads of the map's columns
      h('div', { class: 'st-cols', style: `--cols:${tree.branches.length}` }, ...tree.branches.map(b =>
        h('span', { class: 'st-col', style: `--b:${b.color}` }, tui('branch_' + b.id))))),
    finished,
    grid,
    h('p', { class: 'st-disclaimer' }, tui('disclaimer')));

  const refresh = () => {
    for (const n of nodes) {
      const state = stateOf(n);
      const button = buttons.get(n.id);
      button.dataset.state = state;
      if (hasPuzzle(n)) button.dataset.puzzle = solved.has(n.id) ? 'solved' : 'open';
      button.setAttribute('aria-label', `${nameOf(n.id)}: ${ui(state)}`);
    }
    for (const { from, to, path } of edges) path.dataset.state = !learned.has(from) ? 'locked' : learned.has(to) ? 'done' : 'open';
    count.textContent = ui('progress', learned.size, nodes.length);
    puzzleCount.textContent = ui('pzCount', solved.size, Object.keys(puzzles).length);
    puzzleCount.setAttribute('aria-label', ui('pzPuzzles') + ': ' + solved.size + '/' + Object.keys(puzzles).length);
    for (const [level, el] of levelCounts) {
      const mine = nodes.filter(n => n.level === level);
      el.textContent = mine.filter(n => learned.has(n.id)).length + '/' + mine.length;
    }
    meter.style.width = `${(learned.size / nodes.length) * 100}%`;
    host.classList.toggle('complete', learned.size === nodes.length);
    freeBtn.setAttribute('aria-pressed', String(free));
  };
  freeBtn.addEventListener('click', () => {
    free = !free;
    persist();
    refresh();
    if (current) render();
  });
  // asks once more before forgetting everything
  let sure = 0;
  resetBtn.addEventListener('click', () => {
    if (Date.now() - sure > 3000) {
      sure = Date.now();
      resetBtn.textContent = ui('resetSure');
      setTimeout(() => { resetBtn.textContent = ui('reset'); }, 3000);
      return;
    }
    sure = 0;
    learned.clear();
    solved.clear();
    free = false;
    persist();
    resetBtn.textContent = ui('reset');
    close();
    refresh();
  });

  // ---- the card ------------------------------------------------------------------------
  const card = h('aside', { class: 'st-card', tabindex: '-1' });
  let current = null;
  let slide = 0; // the tab on show, counting in the skill's tabs
  const tabsOf = n => (hasPuzzle(n) ? ['watch', 'myths', 'check', 'puzzle'] : ['watch', 'myths', 'check']);
  let closePuzzle = null;
  let stops = [];
  const stopAll = () => {
    for (const stop of stops) stop();
    stops = [];
  };

  // a text with **bold** and [[id]] / [[id|label]] links to other skills' cards
  const rich = text => {
    const out = document.createDocumentFragment();
    const re = /\*\*(.+?)\*\*|\[\[([\w-]+)(?:\|(.+?))?\]\]|`([^`]+)`/g;
    let last = 0;
    for (let m; (m = re.exec(text)); last = re.lastIndex) {
      out.append(text.slice(last, m.index));
      if (m[1] != null) out.append(h('strong', {}, m[1]));
      else if (m[4] != null) out.append(h('code', {}, m[4]));
      else if (byId.has(m[2])) {
        const id = m[2];
        const link = h('button', { class: 'st-link', type: 'button', style: `--b:${branches[byId.get(id).branch]}` }, m[3] || nameOf(id));
        link.addEventListener('click', () => open(id));
        out.append(link);
      } else out.append(m[3] || m[2]);
    }
    out.append(text.slice(last));
    return out;
  };

  const burst = () => {
    if (reduced) return;
    const layer = h('div', { class: 'st-burst', 'aria-hidden': 'true' }, ...Array.from({ length: 14 }, (_, i) => {
      const angle = (i / 14) * Math.PI * 2 + Math.random() * 0.4;
      const far = 90 + Math.random() * 90;
      return h('i', { style: `--dx:${(Math.cos(angle) * far).toFixed(0)}px;--dy:${(Math.sin(angle) * far).toFixed(0)}px` }, i % 3 ? '✨' : '🎉');
    }));
    card.append(layer);
    setTimeout(() => layer.remove(), 1000);
  };

  const go = step => {
    if (!current || stateOf(current) === 'locked') return;
    const to = Math.max(0, Math.min(tabsOf(current).length - 1, slide + step));
    if (to === slide) return;
    slide = to;
    render();
  };

  const nav = (label, onClick, kind = '') => {
    const button = h('button', { class: `st-btn ${kind}`.trim(), type: 'button' }, label);
    button.addEventListener('click', onClick);
    return button;
  };

  function render() {
    stopAll();
    const n = current;
    const t = T.nodes[n.id];
    card.style.setProperty('--b', branches[n.branch]);
    card.dataset.node = n.id;
    const closeBtn = h('button', { class: 'st-close', type: 'button', 'aria-label': ui('close') }, '✕');
    closeBtn.addEventListener('click', close);
    const body = h('div', { class: 'st-body' });
    const foot = h('div', { class: 'st-foot' });

    if (stateOf(n) === 'locked') {
      // not yet: name what it needs, each a way to get there
      const missing = (n.requires || []).filter(r => !learned.has(r));
      body.classList.add('st-lockcard');
      body.append(
        h('div', { class: 'st-big' }, '🔒'),
        h('h2', { class: 'st-word' }, t.name),
        h('p', { class: 'st-def' }, ui('lockedBody')),
        h('div', { class: 'st-opts' }, ...missing.map(id => nav(nameOf(id), () => open(id), 'st-opt'))));
      card.replaceChildren(h('div', { class: 'st-top' }, h('span', { class: 'st-tabs' }), closeBtn), body, foot);
      card.dataset.tab = 'locked';
      return;
    }

    const keys = tabsOf(n);
    const tab = keys[slide];
    card.dataset.tab = tab;
    const tabBar = h('div', { class: 'st-tabs', role: 'tablist', 'aria-label': ui('tabsLabel') }, ...keys.map((key, i) => {
      // a learned check and a solved puzzle: the tab's line turns green
      const done = (key === 'check' && learned.has(n.id)) || (key === 'puzzle' && solved.has(n.id));
      const button = h('button', { class: 'st-tab', type: 'button', role: 'tab', 'aria-selected': String(i === slide), 'data-tab': key, 'data-done': done ? 'true' : null },
        h('span', { class: 'st-tab-label' }, ui('tab_' + key)));
      button.addEventListener('click', () => {
        if (i === slide) return;
        slide = i;
        render();
      });
      return button;
    }));
    const back = () => nav('‹', () => go(-1), 'ghost');
    body.setAttribute('role', 'tabpanel');

    if (tab === 'watch') {
      const film = tree.films && tree.films[n.id];
      body.classList.add('st-watch');
      if (film) {
        const stage = h('div', { class: 'st-film' });
        body.append(stage);
        stops.push(playFilm(stage, {
          film,
          kit: { h, ui, reduced, lang, name: t.name, show: t.show || {}, labels: t.labels || {}, filmLabels: T.film || {} }
        }));
        // the film, then the sentence: it comes up over the film when the film has ended (styles.css,
        // .tf-end), so the film can have all the card's height. A click on the dark around it plays
        // the film again; a click on the sentence (or a skill linked in it) does not.
        const inner = h('div', { class: 'tf-end-in' }, h('p', { class: 'st-short-word' }, t.name), h('p', { class: 'st-def' }, rich(t.def)));
        inner.addEventListener('click', e => e.stopPropagation());
        const screen = stage.querySelector('.tf-screen');
        if (screen) screen.append(h('div', { class: 'tf-end', 'aria-live': 'polite' }, inner));
        else body.append(inner);
      } else {
        body.append(h('p', { class: 'st-hook' }, t.hook), h('h2', { class: 'st-word' }, t.name), h('p', { class: 'st-def' }, rich(t.def)));
      }
      foot.append(nav(ui('next'), () => go(1), 'primary'));
    } else if (tab === 'myths') {
      // a card per myth: what people think on its front, what is true on its back
      const cards = (t.myths || []).map(m => {
        const front = h('div', { class: 'st-face front' }, h('small', {}, ui('myth')), h('p', {}, rich(m.myth)));
        const behind = h('div', { class: 'st-face back', 'aria-hidden': 'true', inert: '' }, h('small', {}, ui('fact')), h('p', {}, rich(m.fact)));
        const flip = h('div', { class: 'st-flip', role: 'button', tabindex: '0', 'aria-pressed': 'false' }, h('div', { class: 'st-flip-in' }, front, behind));
        const turn = () => {
          const on = flip.classList.toggle('on');
          flip.setAttribute('aria-pressed', String(on));
          // only the side on show can be read, reached and pressed
          for (const [face, away] of [[front, on], [behind, !on]]) {
            face.toggleAttribute('inert', away);
            face.setAttribute('aria-hidden', String(away));
          }
        };
        flip.addEventListener('click', e => {
          if (!e.target.closest('.st-link')) turn(); // a link in the text goes to its skill
        });
        flip.addEventListener('keydown', e => {
          if (e.target !== flip || (e.key !== 'Enter' && e.key !== ' ')) return;
          e.preventDefault();
          turn();
        });
        return flip;
      });
      body.append(
        h('div', { class: 'st-myths-head' }, h('p', { class: 'st-kicker' }, ui('myths')), h('p', { class: 'st-flip-hint' }, ui('flip'))),
        h('div', { class: 'st-flips' }, ...cards));
      foot.append(back(), nav(ui('next'), () => go(1), 'primary'));
    } else if (tab === 'puzzle') {
      const words = T.puzzles[n.id];
      const done = solved.has(n.id);
      body.append(
        h('p', { class: 'st-kicker' }, ui('pzKicker')),
        h('h3', { class: 'st-q' }, words.title),
        h('p', { class: 'st-def' }, rich(words.brief)),
        h('ul', { class: 'st-steps' }, h('li', {}, ui('pzGet', puzzles[n.id].elements.length)), h('li', {}, ui('pzReward'))),
        ...(done ? [h('p', { class: 'st-right' }, ui('pzSolvedFlag'))] : []));
      foot.append(back(), nav(ui(done ? 'pzOpenAgain' : 'pzOpen'), () => startPuzzle(n), 'primary'));
    } else {
      const result = h('div', { class: 'st-result', 'aria-live': 'polite' });
      const options = t.options.map((label, i) => nav(rich(label), () => answer(i), 'st-opt'));
      const showSolved = () => {
        options.forEach((o, i) => {
          o.disabled = true;
          o.classList.toggle('right', i === n.answer);
        });
        const next = nextUp(n).slice(0, 2);
        const all = learned.size === nodes.length;
        result.replaceChildren(...[
          h('p', { class: 'st-right' }, all ? tui('complete') : ui('right')),
          h('p', { class: 'st-why' }, rich(t.why)),
          all && h('p', { class: 'st-why' }, tui('completeBody'))
        ].filter(Boolean));
        // a skill with a puzzle: building it comes first
        const build = hasPuzzle(n) && !solved.has(n.id);
        foot.replaceChildren(back(), ...(build ? [nav(ui('pzNow'), () => go(1), 'primary')] : []), ...(next.length
          ? next.slice(0, build ? 1 : 2).map((x, i) => nav(ui('nextSkill', nameOf(x.id)), () => open(x.id), i || build ? '' : 'primary'))
          : build ? [] : [nav(ui('backToTree'), close, 'primary')]));
      };
      const answer = i => {
        if (i !== n.answer) {
          options[i].disabled = true;
          options[i].classList.add('wrong');
          result.replaceChildren(h('p', { class: 'st-wrong' }, ui('wrong')));
          if (navigator.vibrate) navigator.vibrate(40);
          return;
        }
        const first = !learned.has(n.id);
        learned.add(n.id);
        persist();
        refresh();
        showSolved();
        if (first) {
          burst();
          if (navigator.vibrate) navigator.vibrate([20, 40, 20]);
        }
      };
      body.append(h('p', { class: 'st-kicker' }, ui('quizPrompt')), h('h3', { class: 'st-q' }, rich(t.q)), h('div', { class: 'st-opts' }, ...options), result);
      foot.append(back());
      if (learned.has(n.id)) showSolved();
    }
    card.replaceChildren(h('div', { class: 'st-top' }, tabBar, closeBtn), body, foot);
  }

  /** The puzzle game, over the whole page; back on the card afterwards. */
  function startPuzzle(n) {
    stopAll();
    closePuzzle = openPuzzle(host, {
      puzzle: puzzles[n.id],
      texts: T.puzzles[n.id],
      vocab: T.puzzle,
      ui,
      nodeName: nameOf(n.id),
      lang,
      cast: tree.cast || {},
      castNames: T.film || {},
      reduced,
      onSolved: () => {
        solved.add(n.id);
        persist();
        refresh();
      },
      onClose: () => {
        closePuzzle = null;
        if (current === n) render();
        card.focus({ preventScroll: true });
      }
    });
  }

  // nothing picked: how it works and where to start, or, with everything learned, the end
  function welcome() {
    stopAll();
    card.style.setProperty('--b', branches[nodes[0].branch]);
    card.dataset.tab = 'welcome';
    delete card.dataset.node;
    const next = nextUp(null)[0];
    if (!next) {
      card.replaceChildren(h('div', { class: 'st-body st-welcome' },
        h('div', { class: 'st-big' }, '🏆'), h('h2', { class: 'st-word' }, tui('complete')), h('p', { class: 'st-def' }, tui('completeBody'))));
      return;
    }
    const start = h('button', { class: 'st-btn primary', type: 'button' }, ui('start', nameOf(next.id)));
    start.addEventListener('click', () => open(next.id));
    card.replaceChildren(h('div', { class: 'st-body st-welcome' },
      h('div', { class: 'st-big' }, '🌱'),
      h('h2', { class: 'st-word' }, ui('welcome')),
      h('ol', { class: 'st-steps' }, h('li', {}, ui('howWatch')), h('li', {}, ui('howMyths')), h('li', {}, ui('howCheck')))),
    h('div', { class: 'st-foot' }, start));
  }

  function open(id) {
    if (!byId.has(id)) return;
    current = byId.get(id);
    slide = 0; // a skill always opens on its film
    for (const [nid, button] of buttons) button.classList.toggle('on', nid === id);
    host.classList.add('open');
    try { history.replaceState(null, '', '#' + id); } catch (e) { /* the address stays */ }
    render();
    card.focus({ preventScroll: true });
  }
  function close() {
    const was = current && buttons.get(current.id);
    current = null;
    for (const button of buttons.values()) button.classList.remove('on');
    host.classList.remove('open');
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* the address stays */ }
    welcome();
    if (was) was.focus({ preventScroll: true });
  }

  // ← → move between the card's tabs, Esc puts it away; on a phone, swipe up and down
  const onKey = e => {
    const target = e.composedPath ? e.composedPath()[0] : e.target;
    if (!current || (target && target.closest && target.closest('input,textarea,.tf-scrub'))) return;
    if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === 'Escape') close();
  };
  document.addEventListener('keydown', onKey);
  cleanups.push(() => document.removeEventListener('keydown', onKey));
  let touchY = null;
  card.addEventListener('touchstart', e => {
    const body = card.querySelector('.st-body');
    const scrolls = body && body.scrollHeight > body.clientHeight + 2;
    touchY = scrolls || e.target.closest('input,.tf-show') ? null : e.touches[0].clientY;
  }, { passive: true });
  card.addEventListener('touchend', e => {
    if (touchY == null) return;
    const dy = e.changedTouches[0].clientY - touchY;
    touchY = null;
    if (Math.abs(dy) > 60) go(dy < 0 ? 1 : -1);
  }, { passive: true });

  // ---- the divider: drag it, or use the arrow keys, to share the width between the map and
  // the card; a double-click or Enter puts it back. Not there on a phone (the card covers the map).
  const split = h('div', { class: 'st-split', role: 'separator', tabindex: '0', 'aria-orientation': 'vertical', 'aria-controls': 'st-map',
    'aria-label': ui('resize'), title: ui('resizeHint'), 'aria-valuemin': String(SPLIT.min), 'aria-valuemax': String(SPLIT.max) },
    h('span', { class: 'st-grip', 'aria-hidden': 'true' }));
  map.id = 'st-map';
  let share = SPLIT.start;
  try {
    const kept = Number(localStorage.getItem(SPLIT_KEY));
    if (kept >= SPLIT.min && kept <= SPLIT.max) share = kept;
  } catch (e) { /* no storage: the default */ }
  const setShare = (value, keep) => {
    share = Math.round(Math.min(SPLIT.max, Math.max(SPLIT.min, value)) * 10) / 10;
    host.style.setProperty('--split', share + '%');
    split.setAttribute('aria-valuenow', String(Math.round(share)));
    split.setAttribute('aria-valuetext', Math.round(share) + '%');
    if (keep) {
      try { localStorage.setItem(SPLIT_KEY, String(share)); } catch (e) { /* not kept */ }
    }
  };
  let grab = null; // where on the divider it was taken, from the map's right edge
  split.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    grab = e.clientX - map.getBoundingClientRect().right;
    split.setPointerCapture(e.pointerId);
    host.classList.add('resizing');
    e.preventDefault();
  });
  split.addEventListener('pointermove', e => {
    if (grab == null) return;
    const cs = getComputedStyle(host);
    const left = host.getBoundingClientRect().left + parseFloat(cs.paddingLeft);
    const width = host.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const px = Math.min(width - DIVIDER - CARD_MIN, Math.max(MAP_MIN, e.clientX - grab - left));
    setShare((px / width) * 100);
  });
  const drop = () => {
    if (grab == null) return;
    grab = null;
    host.classList.remove('resizing');
    setShare(share, true);
  };
  split.addEventListener('pointerup', drop);
  split.addEventListener('pointercancel', drop);
  split.addEventListener('lostpointercapture', drop);
  split.addEventListener('dblclick', () => setShare(SPLIT.start, true));
  split.addEventListener('keydown', e => {
    const step = e.shiftKey ? 10 : 2;
    const to = { ArrowLeft: share - step, ArrowRight: share + step, Home: SPLIT.min, End: SPLIT.max, Enter: SPLIT.start }[e.key];
    if (to == null) return;
    e.preventDefault();
    setShare(to, true);
  });
  setShare(share);

  host.replaceChildren(map, split, card);
  host.classList.add('st');
  refresh();
  const ro = new ResizeObserver(drawEdges);
  ro.observe(grid);
  cleanups.push(() => ro.disconnect());
  if (document.fonts) document.fonts.ready.then(drawEdges);
  const asked = decodeURIComponent(location.hash.slice(1));
  if (byId.has(asked)) open(asked);
  else welcome();

  return () => {
    if (closePuzzle) closePuzzle();
    stopAll();
    cleanups.forEach(f => f());
  };
}
