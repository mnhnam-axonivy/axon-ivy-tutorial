/**
 * Entry point of the shared runtime (built to js/axon-ivy-guide-runtime.min.js).
 *
 * It exposes `window.ivyGuide`:
 *   register(id, definition)                  called by each js/walkthrough-*.js
 *   has(id), ids()                            which walkthroughs are on the page
 *   info(id, lang)                            { title, intro, duration } of a walkthrough
 *   mount(container, id, { lang, autoplay })  renders it; returns { host, app, setLanguage, dispose }
 *   instances()                               what is mounted (debugging and tests)
 *
 * Each walkthrough renders into a shadow root, so the hosting page and the simulation cannot
 * disturb each other's styles.
 */
import css from './ui/styles.css';
import { DesignerApp } from './app.js';
import { createTranslator } from './i18n.js';

/* global __GUIDE_VERSION__ */
const VERSION = typeof __GUIDE_VERSION__ === 'string' ? __GUIDE_VERSION__ : 'dev';

if (!window.ivyGuide) {
  const registry = new Map();
  const mounted = new Set();
  let sheet = null;

  const applyStyles = shadow => {
    if (typeof CSSStyleSheet === 'function' && 'adoptedStyleSheets' in shadow) {
      try {
        if (!sheet) { sheet = new CSSStyleSheet(); sheet.replaceSync(css); }
        shadow.adoptedStyleSheets = [sheet];
        return;
      } catch (e) { /* older browsers: fall back to a <style> element */ }
    }
    const style = document.createElement('style');
    style.textContent = css;
    shadow.appendChild(style);
  };

  const mount = (container, id, options = {}) => {
    const definition = registry.get(id);
    if (!definition) throw new Error('ivyGuide: no walkthrough is registered as "' + id + '"');
    const host = document.createElement('div');
    host.className = 'ivy-guide-host';
    host.setAttribute('data-walkthrough', id);
    const shadow = host.attachShadow({ mode: 'open' });
    applyStyles(shadow);
    const root = document.createElement('div');
    shadow.appendChild(root);
    container.appendChild(host);
    const app = new DesignerApp(root, definition, { ...(window.ivyGuideOptions || {}), ...options });
    const handle = {
      id,
      host,
      app,
      setLanguage: lang => app.setLanguage(lang),
      dispose() {
        app.dispose();
        host.remove();
        mounted.delete(handle);
      }
    };
    mounted.add(handle);
    return handle;
  };

  const api = {
    version: VERSION,
    register(id, definition) { registry.set(id, definition); },
    has: id => registry.has(id),
    ids: () => [...registry.keys()],
    info(id, lang) {
      const definition = registry.get(id);
      if (!definition) return null;
      const t = createTranslator(lang, definition.strings);
      return { title: t('tour.intro.title'), intro: t('tour.intro.text'), duration: t('tour.intro.duration'), chapters: (definition.tour.chapters || []).map(c => t('tour.chapter.' + c.id)) };
    },
    instances: () => [...mounted],
    mount
  };

  // Walkthrough scripts may load before or after this file; both orders work.
  const queued = window.__ivyGuideQueue;
  if (Array.isArray(queued)) queued.forEach(([id, definition]) => api.register(id, definition));
  window.__ivyGuideQueue = { push: ([id, definition]) => api.register(id, definition) };
  window.ivyGuide = api;
}
