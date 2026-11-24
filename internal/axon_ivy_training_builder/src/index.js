/**
 * The training page: finds <div id="ivy-training" data-lang="…"> (the AxonIvyTraining dialog of
 * the training project), opens a shadow root on it so the dialog's theme and the page cannot
 * affect each other, and mounts the skill tree in it.
 *
 * The page fills the window: its backdrop (.training) runs edge to edge and at least the window's
 * height, with the skill tree (.st) in the middle of it. Outside the shadow root it changes the
 * padding of the element around the host (the dialog layout's container), so no frame of the
 * dialog's theme shows around the page, and it declares the page's fonts there (build.mjs embeds
 * them; a font declared inside a shadow root is not loaded by every browser).
 *
 * Language: the reader's last choice, else the session's (data-lang), else English.
 */
import css from './styles.css';
import fontFaces from 'fonts:css';
import { mountTree } from './skilltree.js';
import { UI } from './texts.js';
import workflow from '../trees/workflow/index.js';

const TREES = [workflow];
const LANG_KEY = 'ivy-training:lang';
// the element around the host loses its padding (Freya's .container has 1em), so the page meets the window's edges
const FRAME_CSS = ':has(> #ivy-training) { padding: 0; margin: 0; width: auto; max-width: none; }';

function start() {
  const host = document.getElementById('ivy-training');
  if (!host || host.shadowRoot) return;
  if (!document.getElementById('ivy-training-frame')) {
    const frame = document.createElement('style');
    frame.id = 'ivy-training-frame';
    frame.textContent = fontFaces + FRAME_CSS;
    document.head.append(frame);
  }
  const root = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = css;
  const page = document.createElement('main');
  page.className = 'training';
  const layout = document.createElement('div'); // mountTree makes it .st
  page.append(layout);
  root.append(style, page);

  let lang = 'en';
  try { lang = localStorage.getItem(LANG_KEY) || ''; } catch (e) { lang = ''; }
  if (lang !== 'en' && lang !== 'ja') lang = String(host.dataset.lang || '').toLowerCase().startsWith('ja') ? 'ja' : 'en';

  let destroy = null;
  const mount = code => {
    lang = code;
    if (destroy) destroy();
    page.setAttribute('lang', code);
    destroy = mountTree(layout, {
      tree: TREES[0],
      lang: code,
      ui: UI[code],
      onLang: next => {
        try { localStorage.setItem(LANG_KEY, next); } catch (e) { /* not kept */ }
        mount(next);
      }
    });
  };
  mount(lang);
  window.ivyTraining = { trees: TREES, lang: () => lang, mount };
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
