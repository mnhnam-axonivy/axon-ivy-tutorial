/**
 * The guide page (built to js/axon-ivy-guide.js). It renders into <div id="ivy-guide"> of the
 * AxonIvyGuide dialog, inside a shadow root so the dialog's theme and the guide keep out of
 * each other's styles.
 *
 * What the dialog hands over:
 *   <div id="ivy-guide" data-lang="en|ja">                       the session language
 *   <div id="ivy-guide-docs"><div data-doc="start" data-lang="en">…markdown…</div>…</div>
 *                                                                the element documents (CMS)
 * Walkthroughs register themselves with window.ivyGuide (js/walkthrough-*.js).
 *
 * Routes (location.hash): #/  ·  #/part/<n>/<page>  ·  #/walkthrough/<n.m> (opens it)
 */
import css from './guide.css';
import { parts, strings, homeOf } from './catalog.js';

const STORE = 'ivy-guide-lang';
const LANGS = ['en', 'ja'];

function h(tag, props, ...children) {
  const [name, ...classes] = tag.split('.');
  const el = document.createElement(name || 'div');
  if (classes.length) el.className = classes.join(' ');
  Object.entries(props || {}).forEach(([key, value]) => {
    if (value == null || value === false) return;
    if (key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2), value);
    else if (key.includes('-') || key === 'role' || key === 'href') el.setAttribute(key, value === true ? '' : value);
    else el[key] = value;
  });
  const add = list => list.forEach(c => {
    if (c == null || c === false) return;
    if (Array.isArray(c)) add(c);
    else el.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c)));
  });
  add(children);
  return el;
}

const storage = {
  get() { try { return window.localStorage.getItem(STORE); } catch (e) { return null; } },
  set(v) { try { window.localStorage.setItem(STORE, v); } catch (e) { /* private mode: not remembered */ } }
};

/** Markdown to HTML with the bundled marked, then only harmless markup is kept. */
function renderMarkdown(text) {
  const box = document.createElement('div');
  const md = window.marked;
  if (!md) { box.textContent = text; return box; }
  box.innerHTML = (md.parse || md)(text);
  box.querySelectorAll('script,style,iframe,object,embed,form').forEach(n => n.remove());
  box.querySelectorAll('*').forEach(n => [...n.attributes].forEach(a => {
    if (/^on/i.test(a.name) || (/^(href|src)$/i.test(a.name) && /^\s*javascript:/i.test(a.value))) n.removeAttribute(a.name);
  }));
  // links to other pages of the guide stay in the guide; others open in a new tab
  box.querySelectorAll('a[href]').forEach(a => {
    if (!a.getAttribute('href').startsWith('#')) { a.target = '_blank'; a.rel = 'noopener'; }
  });
  return box;
}

class Guide {
  constructor(root) {
    this.root = root;
    this.lang = LANGS.includes(storage.get()) ? storage.get() : (root.dataset.lang === 'ja' || root.dataset.lang === 'jp' ? 'ja' : 'en');
    this.docs = {};
    document.querySelectorAll('#ivy-guide-docs [data-doc]').forEach(node => {
      const lang = node.getAttribute('data-lang') === 'jp' ? 'ja' : node.getAttribute('data-lang');
      if (node.textContent.trim()) this.docs[node.getAttribute('data-doc') + ':' + lang] = node.textContent;
    });
    this.shadow = root.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = css;
    this.shadow.appendChild(style);
    this.view = h('div.guide');
    this.shadow.appendChild(this.view);
    this.player = null;
    window.addEventListener('hashchange', () => this.route());
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && this.player) this.closePlayer(); });
    this.route();
  }

  t(key, params) {
    const text = (strings[this.lang] && strings[this.lang][key]) || strings.en[key] || key;
    return params ? text.replace(/\{(\w+)\}/g, (m, k) => (params[k] === undefined ? m : params[k])) : text;
  }

  ready(id) {
    return Boolean(window.ivyGuide && window.ivyGuide.has(id));
  }

  setLang(lang) {
    this.lang = lang;
    storage.set(lang);
    this.route(false);
    if (this.player) {
      this.player.handle.setLanguage(lang);
      this.player.title.textContent = this.walkthroughTitle(this.player.id);
    }
  }

  walkthroughTitle(id) {
    return id + ' ' + this.t('w.' + id + '.title');
  }

  // ── routing ────────────────────────────────────────────────────────────────

  route(open = true) {
    const parts_ = (location.hash.replace(/^#\/?/, '') || '').split('/').filter(Boolean);
    if (parts_[0] === 'walkthrough' && parts_[1]) {
      const home = homeOf(parts_[1]);
      this.render(home ? home.part : null, home ? home.page : null);
      if (open && this.ready(parts_[1])) this.openPlayer(parts_[1]);
      return;
    }
    if (parts_[0] === 'part') {
      const part = parts.find(p => String(p.n) === parts_[1]);
      const page = part ? (part.pages.find(p => p.id === parts_[2]) || part.pages[0]) : null;
      this.render(part, page);
      return;
    }
    this.render(null, null);
  }

  link(part, page) {
    return '#/part/' + part.n + '/' + page.id;
  }

  // ── pages ──────────────────────────────────────────────────────────────────

  render(part, page) {
    const t = this.t.bind(this);
    const view = this.view;
    view.textContent = '';
    view.lang = this.lang;
    const langSwitch = h('div.lang', { role: 'group', 'aria-label': t('guide.lang') },
      LANGS.map(l => h('button.lang-btn' + (l === this.lang ? '.active' : ''), { type: 'button', 'aria-pressed': String(l === this.lang), onclick: () => this.setLang(l) }, l.toUpperCase())));
    view.append(h('header.head', null,
      h('a.brand', { href: '#/' }, h('span.brand-mark', null, 'ivy'), h('span', null, t('guide.title'))),
      h('span.spacer'), langSwitch));
    const body = h('div.body');
    body.append(this.nav(part, page), part && page ? this.pageView(part, page) : this.home());
    view.append(body);
    const main = view.querySelector('main');
    if (main) main.scrollTop = 0;
  }

  nav(current, currentPage) {
    const t = this.t.bind(this);
    return h('nav.nav', { 'aria-label': t('guide.parts') },
      h('a.nav-home' + (!current ? '.active' : ''), { href: '#/' }, t('guide.home')),
      parts.map(part => h('div.nav-part' + (part === current ? '.open' : ''), null,
        h('a.nav-part-title', { href: this.link(part, part.pages[0]) }, h('span.num', null, String(part.n)), h('span', null, t('part.' + part.n + '.title'))),
        part === current ? h('div.nav-pages', null, part.pages.map(page => h('a.nav-page' + (page === currentPage ? '.active' : ''), {
          href: this.link(part, page), 'aria-current': page === currentPage ? 'page' : null
        }, t('page.' + page.id + '.title')))) : null)));
  }

  home() {
    const t = this.t.bind(this);
    return h('main.main', null,
      h('section.hero', null, h('h1', null, t('guide.title')), h('p', null, t('guide.subtitle')), h('p.note', null, t('guide.offline'))),
      h('div.cards', null, parts.map(part => {
        const all = [...new Set(part.pages.flatMap(p => p.walkthroughs))];
        const ready = all.filter(id => this.ready(id)).length;
        return h('a.card', { href: this.link(part, part.pages[0]) },
          h('div.card-num', null, t('guide.part', { n: part.n })),
          h('div.card-title', null, t('part.' + part.n + '.title')),
          h('div.card-text', null, t('part.' + part.n + '.intro')),
          h('div.card-foot' + (ready ? '.has' : ''), null, t('guide.ready', { ready, total: all.length })));
      })));
  }

  pageView(part, page) {
    const t = this.t.bind(this);
    const main = h('main.main');
    main.append(h('div.crumb', null, h('a', { href: this.link(part, part.pages[0]) }, t('guide.part', { n: part.n }) + ' · ' + t('part.' + part.n + '.title'))),
      h('h1', null, t('page.' + page.id + '.title'), page.main ? h('span.badge', null, t('guide.main')) : null));
    if (page === part.pages[0]) main.append(h('p.lead', null, t('part.' + part.n + '.intro')));
    const walks = h('section.walk-list', { id: 'walkthroughs' }, h('h2', null, t('guide.walkthroughs')), h('div.walks', null, page.walkthroughs.map(id => this.walkCard(id))));
    // the element document comes first, its walkthroughs after it (PROGRESS.md, Guide)
    if (page.doc) {
      const text = this.docs[page.doc + ':' + this.lang] || this.docs[page.doc + ':en'];
      main.append(
        h('button.jump', { type: 'button', onclick: () => walks.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, '↓ ' + t('guide.walkthroughs') + ' (' + page.walkthroughs.length + ')'),
        h('section.doc', { 'aria-label': t('guide.document') },
          h('div.doc-kicker', null, t('guide.document')),
          text ? renderMarkdown(text) : h('p.muted', null, t('guide.noDocument'))));
    }
    main.append(walks);
    return main;
  }

  walkCard(id) {
    const t = this.t.bind(this);
    const ready = this.ready(id);
    const info = ready ? window.ivyGuide.info(id, this.lang) : null;
    return h('div.walk' + (ready ? '.ready' : ''), null,
      h('div.walk-num', null, id),
      h('div.walk-body', null,
        h('div.walk-title', null, t('w.' + id + '.title')),
        h('div.walk-text', null, t('w.' + id + '.shows')),
        info && info.chapters.length ? h('ol.walk-chapters', null, info.chapters.map(c => h('li', null, c))) : null),
      ready
        ? h('button.play', { type: 'button', onclick: () => { location.hash = '#/walkthrough/' + id; } },
          h('span.play-icon', { 'aria-hidden': 'true' }, '▶'), h('span', null, t('guide.play')), info ? h('span.play-time', null, info.duration) : null)
        : h('span.coming', null, t('guide.coming')));
  }

  // ── the full-screen player ─────────────────────────────────────────────────

  openPlayer(id) {
    if (this.player && this.player.id === id) return;
    this.closePlayer(false);
    const title = h('div.player-title', null, this.walkthroughTitle(id));
    const stage = h('div.player-stage');
    const close = h('button.player-close', { type: 'button', title: this.t('guide.close'), 'aria-label': this.t('guide.close'), onclick: () => this.closePlayer() }, '✕');
    const box = h('div.player', { role: 'dialog', 'aria-modal': 'true', 'aria-label': this.walkthroughTitle(id) },
      h('div.player-bar', null, title, close), stage);
    this.shadow.appendChild(box);
    document.documentElement.style.overflow = 'hidden';
    const handle = window.ivyGuide.mount(stage, id, { lang: this.lang, autoplay: true });
    this.player = { id, box, title, handle, back: location.hash };
    close.focus({ preventScroll: true });
  }

  closePlayer(updateHash = true) {
    if (!this.player) return;
    const { handle, box, id } = this.player;
    this.player = null;
    handle.dispose();
    box.remove();
    document.documentElement.style.overflow = '';
    if (updateHash && location.hash === '#/walkthrough/' + id) {
      const home = homeOf(id);
      history.replaceState(null, '', home ? this.link(home.part, home.page) : '#/');
      this.route(false);
    }
  }
}

function start() {
  const root = document.getElementById('ivy-guide');
  if (root && !root.shadowRoot) window.ivyGuidePage = new Guide(root);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
