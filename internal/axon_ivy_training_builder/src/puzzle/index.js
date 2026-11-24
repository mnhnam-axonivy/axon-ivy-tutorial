/**
 * Opens a puzzle over the whole page: a dialog that holds one WebGL canvas, on which three.js
 * draws the game (src/puzzle/game.js). Beside the canvas there is only what a canvas cannot
 * give: a line that reads out what the game says (its hints, what is wrong, the run's
 * captions) and a close button for the keyboard.
 *
 *   openPuzzle(host, { puzzle, texts, vocab, ui, nodeName, lang, cast, castNames, reduced,
 *                      onSolved, onClose }) → close()
 *
 * host is the page inside the shadow root. Escape lets go of what is selected first and
 * closes the puzzle after that. The overlay tells the browser check where it is through
 * data-mode (edit, review, run, solved) and its game's api (overlay.puzzle).
 */
import { createGame } from './game.js';
import { hasWebGL } from './gl.js';

export function openPuzzle(host, cfg) {
  const { ui } = cfg;
  const el = (tag, attrs = {}, ...kids) => {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    node.append(...kids);
    return node;
  };
  const live = el('p', { class: 'pz-live', 'aria-live': 'polite' });
  const closeBtn = el('button', { class: 'pz-close', type: 'button' }, ui('pzClose'));
  const canvas = el('canvas', { class: 'pz-canvas', 'aria-hidden': 'true' });
  const overlay = el('div', { class: 'pz', role: 'dialog', 'aria-modal': 'true', 'aria-label': ui('pzLabel', cfg.texts.title), 'data-mode': 'edit', tabindex: '-1' }, closeBtn, canvas, live);
  host.append(overlay);
  host.classList.add('pz-open');
  // the page behind stays where it is
  const scroller = document.documentElement;
  const overflowWas = scroller.style.overflow;
  scroller.style.overflow = 'hidden';

  let game = null;
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    document.removeEventListener('keydown', onKey, true);
    if (observer) observer.disconnect();
    if (game) game.destroy();
    overlay.remove();
    host.classList.remove('pz-open');
    scroller.style.overflow = overflowWas;
    if (cfg.onClose) cfg.onClose();
  };
  const onKey = e => {
    if (game && game.key(e)) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      close();
    } else if (['ArrowLeft', 'ArrowRight'].includes(e.key)) e.stopPropagation(); // not the card's tabs
  };
  document.addEventListener('keydown', onKey, true);
  closeBtn.addEventListener('click', close);

  let observer = null;
  if (!hasWebGL()) {
    canvas.remove();
    overlay.append(el('p', { class: 'pz-none' }, ui('pzNoWebGL')));
    overlay.dataset.mode = 'none';
  } else {
    try {
      game = createGame(canvas, {
        ...cfg,
        onClose: close,
        onMode: mode => { overlay.dataset.mode = mode; },
        onSay: text => { live.textContent = text; }
      });
      overlay.puzzle = game.api;
      let size = canvas.getBoundingClientRect();
      observer = new ResizeObserver(() => {
        const box = canvas.getBoundingClientRect();
        if (box.width > 0 && box.height > 0 && (box.width !== size.width || box.height !== size.height)) game.resize(box.width, box.height);
        size = box;
      });
      observer.observe(canvas);
    } catch (e) {
      // no WebGL after all (a blocked or lost context): say so instead of an empty screen
      console.warn('[training] the puzzle could not start: ' + e.message);
      canvas.remove();
      overlay.append(el('p', { class: 'pz-none' }, ui('pzNoWebGL')));
      overlay.dataset.mode = 'none';
    }
  }
  overlay.focus({ preventScroll: true });
  return close;
}
