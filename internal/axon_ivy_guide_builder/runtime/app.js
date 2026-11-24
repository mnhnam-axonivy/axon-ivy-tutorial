/**
 * DesignerApp: one mounted walkthrough. It owns the process model, creates the canvas and the
 * UI parts, and turns a ProcessRunner run into what the reader sees: the token on the canvas,
 * the request that starts the process, the process data, and the Runtime Log.
 *
 * Adapted from internal/interactive_app_builder of the Smart Workflow tutorial; the agent,
 * variables.yaml and source-file parts are left out.
 */
import { h, clear, Emitter, openPopover, debounce } from './util.js';
import { createTranslator, normalizeLanguage } from './i18n.js';
import { loadProcess, elementById, restore, startElement, nextOf, startParams, startLink, levelView, levelPath } from './model/process.js';
import { ProcessRunner } from './model/runner.js';
import { CanvasStage } from './stage/canvas-stage.js';
import { attachController } from './stage/controller.js';
import { connectorPath } from './stage/layout.js';
import { icon } from './ui/icons.js';
import { Inscription } from './ui/inscription.js';
import { BottomPanel } from './ui/panel.js';
import { DataClassView } from './ui/dataclass.js';
import { Tour } from './ui/tour.js';

const NARROW = 1000;
const SMALL = 620;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const freshVisual = () => ({ executed: {}, connectors: {}, active: null, error: null, breakpoints: new Set() });

export class DesignerApp {
  /**
   * @param {HTMLElement} root        container inside the shadow root
   * @param {Object} definition       the walkthrough's definition (see README)
   * @param {Object} [options]
   * @param {string} [options.lang]         'en' | 'ja' | 'jp'
   * @param {number} [options.tourPace]     plays the walkthrough faster (tests)
   * @param {boolean} [options.autoplay]    start at once instead of on the opening card
   */
  constructor(root, definition, options = {}) {
    this.root = root;
    this.def = definition;
    this.options = options;
    this.lang = normalizeLanguage(options.lang);
    this.t = createTranslator(this.lang, definition.strings);
    // the project name the Runtime Log shows: the guide project is called "tutorial" (.ivyproject)
    const project = definition.project || 'tutorial';
    this.model = loadProcess(definition.process, definition.dataClass, { file: definition.file, path: definition.path, project, classes: definition.classes });
    this.mainModel = this.model;
    // processes a Call Sub of the walkthrough reaches, each with its own data class (definition.subProcesses)
    this.models = [this.model, ...(definition.subProcesses || []).map(sub => loadProcess(sub.process, sub.dataClass, { file: sub.file, path: sub.path, project, classes: sub.classes || definition.classes }))];
    this.level = null; // the box of the shown process whose inside the canvas shows (null: the top)
    this.events = new Emitter();
    const motion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    this.reducedMotion = options.reducedMotion !== undefined ? options.reducedMotion : Boolean(motion && motion.matches);
    this.state = {
      tab: 'process',
      selection: null,
      hover: null,
      inscriptionOpen: true,
      inscriptionTabs: {},
      sections: {},
      panelTab: 'log',
      panelOpen: true,
      panelPinned: false,
      status: 'idle',
      statusParams: null
    };
    this.visual = freshVisual();
    this.data = null;
    this.request = null;
    this.params = { ...(definition.params || {}) }; // what Run sends as the request's parameters
    this.resume = null;
    this.runGeneration = 0;
    this.caption = '';
    this.toastTimers = new Map();
    this.mode = null; // 'intro' | 'tour' | 'explore'
    this.runHooks = null; // set by the walkthrough while it runs the process

    this.runner = new ProcessRunner({ model: this.model, models: this.models, io: this.createIo() });
    this.buildSkeleton();
    this.createStage();
    this.inscription = new Inscription(this, this.inscriptionEl);
    this.panel = new BottomPanel(this, this.panelEl);
    this.dataClassView = new DataClassView(this, this.dataClassEditor);
    this.tour = new Tour(this, definition.tour);
    this.renderChrome();
    if (!this.tour.available) this.setMode('explore');
    else if (options.autoplay) this.tour.start(0);
    else this.tour.showIntro();
  }

  // ── construction ───────────────────────────────────────────────────────────

  buildSkeleton() {
    const root = clear(this.root);
    root.classList.add('app');
    this.tabsEl = h('div.tabs');
    this.toolbarEl = h('div.toolbar');
    this.canvasHost = h('div.canvas-host');
    this.overlayEl = h('div.overlays');
    // inside a box: where the canvas is, and the way back up (Designer: the breadcrumb of the process editor)
    this.crumbsEl = h('div.crumbs-bar', { hidden: true, 'data-tour': 'crumbs' });
    this.canvasHost.append(this.overlayEl, this.crumbsEl);
    this.inscriptionEl = h('aside.inscription');
    this.processEditor = h('div.editor.editor-process', null,
      h('div.editor-main', null, this.toolbarEl, this.canvasHost), this.inscriptionEl);
    this.dataClassEditor = h('div.editor.editor-view', { hidden: true, 'data-view': 'dataclass' });
    this.panelEl = h('div.panel');
    this.playerEl = h('div.player');
    this.layer = h('div.layer');
    root.append(this.tabsEl, h('div.workbench', null, this.processEditor, this.dataClassEditor), this.panelEl, this.playerEl, this.layer);
  }

  createStage() {
    const app = this;
    // the canvas shows one level of one process: the top, or the inside of a box
    const scene = { get model() { return levelView(app.model, app.level); }, stateOf: id => this.stateOf(id), connectorState: route => this.connectorState(route) };
    const stage = new CanvasStage(this.canvasHost, scene);
    this.canvasHost.insertBefore(stage.canvas, this.overlayEl);
    stage.canvas.setAttribute('role', 'application');
    stage.setReducedMotion(this.reducedMotion);
    this.stage = stage;
    this.detachController = attachController(stage, {
      model: () => levelView(this.model, this.level),
      select: el => this.select(el ? el.id : null),
      // a double click jumps into a box, as in the Designer; on any other element it opens the inscription
      open: el => { if (el.kind === 'embedded') { this.showLevel(this.model, el.id); return; } this.select(el.id); this.setInscriptionOpen(true); },
      hover: el => {
        const previous = this.state.hover;
        this.state.hover = el ? el.id : null;
        if (previous) this.refresh(previous);
        if (el) this.refresh(el.id);
        // the description appears as a tooltip when the mouse stays over the element (General Tab)
        clearTimeout(this.tooltipTimer);
        if (this.mode !== 'explore') return;
        if (!el) this.hideTooltip();
        else this.tooltipTimer = setTimeout(() => { if (this.state.hover === el.id) this.showTooltip(el.id); }, 600);
      },
      moved: el => stage.refresh(el.id),
      wheelZooms: () => true,
      wheelBlocked: () => {},
      key: key => this.canvasKey(key)
    });
    const onResize = debounce(() => {
      this.updateLayout();
      this.stage.resize();
    }, 30);
    this.resizeObserver = new ResizeObserver(onResize);
    this.resizeObserver.observe(this.canvasHost);
    this.resizeObserver.observe(this.root);
    this.updateLayout(true);
    this.stage.resize();
  }

  refresh(target) {
    this.stage.refresh(target);
  }

  /** Everything that carries text; rebuilt when the language changes. */
  renderChrome() {
    this.root.lang = this.lang;
    this.stage.canvas.setAttribute('aria-label', this.t('canvas.label', { file: this.def.file }));
    this.tour.render();
    this.renderTabs();
    this.renderToolbar();
    this.renderOverlays();
    this.inscription.render();
    this.dataClassView.render();
    this.panel.render();
    this.applyStatus();
  }

  // ── painter state ──────────────────────────────────────────────────────────

  /** The key of an element in the run's visual state: element ids repeat across processes. */
  vkey(id, model = this.model) {
    return model.id + '/' + id;
  }

  stateOf(id) {
    const key = this.vkey(id);
    return {
      selected: this.state.selection === id,
      hover: this.state.hover === id,
      executed: this.visual.executed[key] || 0,
      active: this.visual.active === key,
      error: this.visual.error === key,
      breakpoint: false
    };
  }

  connectorState(route) {
    return { executed: (this.visual.connectors[this.vkey(route.id)] || 0) > 0, dashed: route.from.removed || route.to.removed };
  }

  /** The model a process tab, a run or a Call Sub means: by its ref or file, or the first. */
  modelOf(ref) {
    return (ref && this.models.find(m => m.ref === ref || m.file === ref)) || this.mainModel;
  }

  /**
   * Shows a process and one of its levels on the canvas: the top (null) or the inside of an
   * Embedded Subprocess or BPMN activity, as the Designer does when one jumps into a box.
   */
  showLevel(model, level = null, { fit = true } = {}) {
    const changed = model !== this.model || (level || null) !== this.level;
    if (model !== this.model) {
      this.model = model;
      this.state.selection = null;
    }
    this.level = level || null;
    if (this.state.tab !== 'process') this.setTab('process');
    if (!changed) return;
    this.hideTooltip();
    this.renderTabs();
    this.renderToolbar();
    this.inscription.render();
    this.dataClassView.render();
    if (fit) this.stage.fit({ animate: false });
    this.refresh('all');
    this.emit({ type: 'level', model, level: this.level });
  }

  /**
   * For checking a script or an expression of an element; `vars` are what it may use besides
   * in/out. In a Start there is no `in`, and `param` has the fields of the signature.
   */
  scriptContext(el, { vars = {}, varTypes, noIn, noOut = false } = {}) {
    const start = el && (el.type === 'RequestStart' || el.type === 'CallSubStart');
    return {
      data: {}, fields: this.model.dataClass.fields, dataClassName: this.model.dataClass.name, classes: this.model.classes, vars,
      noIn: noIn === undefined ? start : noIn, noOut, varTypes: varTypes || (start ? { param: startParams(el) } : undefined)
    };
  }

  // ── events ─────────────────────────────────────────────────────────────────

  emit(event) {
    this.events.emit(event);
  }

  /** How a run hook names an element: its id, with the process ref in front for another process ('enter:tutorial/part3/Price/f3'). */
  hookId(el, model = this.model) {
    return model && model !== this.mainModel ? model.ref + '/' + el.id : el.id;
  }

  /** Lets the walkthrough step in at a point of the run (see ui/tour.js). */
  async hook(name, payload) {
    const fn = this.runHooks && this.runHooks[name];
    if (fn) await fn(payload);
  }

  // ── modes: the opening card, the walkthrough, the editable simulation ───────

  setMode(mode) {
    if (this.mode === mode) return;
    this.mode = mode;
    this.hideTooltip();
    this.root.dataset.mode = mode;
    if (mode === 'explore') {
      this.setPanelOpen(true);
      if (this.root.dataset.layout !== 'narrow') this.setInscriptionOpen(true);
    } else {
      this.select(null);
      this.setInscriptionOpen(false);
      this.setPanelOpen(false);
    }
    requestAnimationFrame(() => {
      if (this.disposed) return;
      this.stage.resize();
      this.stage.fit({ animate: false });
    });
  }

  // ── editor tabs: the process and its data class ────────────────────────────

  renderTabs() {
    const t = this.t;
    clear(this.tabsEl);
    this.aboutButton = h('button.badge', { type: 'button', 'aria-haspopup': 'dialog', onclick: () => this.showAbout() }, icon('info', 13), t('badge'));
    this.replayButton = this.tour.available
      ? h('button.badge.replay', { type: 'button', 'aria-haspopup': 'menu', onclick: () => this.showReplay() }, icon('play', 11), t('tour.replay'))
      : null;
    // one tab per process file and per data class, as the Designer opens them
    const processTab = model => {
      const active = this.state.tab === 'process' && this.model === model;
      return h('button.tab' + (active ? '.active' : ''), {
        type: 'button', role: 'tab', 'aria-selected': String(active), 'data-tab': model === this.mainModel ? 'process' : 'process:' + model.ref,
        onclick: () => this.showLevel(model, null)
      }, icon('process', 14), h('span', null, model.file || this.def.file));
    };
    const classTab = model => {
      const active = this.state.tab === 'dataclass' && this.model === model;
      return h('button.tab' + (active ? '.active' : ''), {
        type: 'button', role: 'tab', 'aria-selected': String(active), 'data-tab': model === this.mainModel ? 'dataclass' : 'dataclass:' + model.ref,
        onclick: () => { if (this.model !== model) this.showLevel(model, null); this.setTab('dataclass'); }
      }, icon('braces', 14), h('span', null, model.dataClass.simpleName + '.d.json'));
    };
    const classes = this.models.filter((m, i) => this.models.findIndex(o => o.dataClass.name === m.dataClass.name) === i);
    this.tabsEl.append(
      h('div.tab-strip', { role: 'tablist' }, this.models.map(processTab), classes.map(classTab)),
      h('span.spacer'),
      this.replayButton,
      this.aboutButton);
  }

  /** 'process' or 'dataclass' of the shown process; 'process:<ref>' / 'dataclass:<ref>' switch to another process first. */
  setTab(id) {
    const [kind, ref] = String(id).split(':');
    if (ref) {
      const model = this.modelOf(ref);
      if (model !== this.model) {
        this.model = model;
        this.level = null;
        this.state.selection = null;
        this.renderToolbar();
        this.inscription.render();
        this.dataClassView.render();
        if (kind === 'process') this.stage.fit({ animate: false });
      }
    }
    id = kind;
    if (this.state.tab === id) { this.renderTabs(); this.refresh('all'); return; }
    this.state.tab = id;
    this.processEditor.hidden = id !== 'process';
    this.dataClassEditor.hidden = id !== 'dataclass';
    this.renderTabs();
    if (id === 'process') {
      this.stage.resize();
      this.stage.invalidate();
    }
    this.emit({ type: 'tab', tab: id });
  }

  showAbout() {
    const t = this.t;
    const close = openPopover(this.layer, this.aboutButton, h('div.about', null,
      h('h3', null, t('about.title')),
      h('p', null, t('about.p1')),
      h('p', null, t('about.p2', { file: this.def.path || this.def.file })),
      h('p', null, t('about.p3')),
      h('div.about-actions', null, h('button.btn', { type: 'button', onclick: () => close() }, t('about.close')))), { align: 'right' });
  }

  showReplay() {
    const t = this.t;
    const item = (label, index) => h('button.menu-item', { type: 'button', role: 'menuitem', onclick: () => { close(); this.tour.start(index); } }, label);
    const close = openPopover(this.layer, this.replayButton, h('div.menu', { role: 'menu' },
      item(t('tour.replay.all'), 0),
      h('div.menu-title', null, t('tour.replay.chapters')),
      this.tour.chapters.map((c, i) => item((i + 1) + ' · ' + t('tour.chapter.' + c.id), i))), { align: 'right' });
  }

  updateLayout(initial = false) {
    const width = this.root.clientWidth;
    if (!width) return;
    const narrow = width < NARROW;
    const was = this.root.dataset.layout;
    this.root.dataset.layout = narrow ? 'narrow' : 'wide';
    this.root.classList.toggle('small', width < SMALL);
    if ((initial || was === undefined) && narrow) this.setInscriptionOpen(false);
  }

  // ── toolbar and canvas overlays ────────────────────────────────────────────

  renderToolbar() {
    const t = this.t;
    clear(this.toolbarEl);
    const inert = name => h('span.icon-btn.inert', { title: t('quick.inert') }, icon(name, 15));
    this.inscriptionToggle = h('button.icon-btn' + (this.state.inscriptionOpen ? '.active' : ''), {
      type: 'button', title: t('toggle.inscription'), 'aria-label': t('toggle.inscription'), 'aria-pressed': String(this.state.inscriptionOpen),
      onclick: () => this.setInscriptionOpen(!this.state.inscriptionOpen)
    }, icon('panelRight', 15));
    // inside a box: where the canvas is, and the way back up (Designer: the breadcrumb of the process editor)
    const path = levelPath(this.model, this.level);
    const boxName = box => box.name.replace(/\n/g, ' ') || this.typeName(box);
    const crumbs = path.length ? h('div.crumbs', null,
      h('button.crumb-link', { type: 'button', onclick: () => this.showLevel(this.model, null) }, this.model.name || this.def.file),
      path.map((box, i) => [h('span.crumb-sep', null, '›'), i === path.length - 1
        ? h('span.crumb-here', null, boxName(box))
        : h('button.crumb-link', { type: 'button', onclick: () => this.showLevel(this.model, box.id) }, boxName(box))])) : null;
    this.toolbarEl.append(
      h('div.tool-group', null, h('span.icon-btn.active', { title: this.label('toolbar.selection') }, icon('pointer', 15)), inert('marquee'), h('span.tool-sep'), inert('undo'), inert('redo')),
      h('div.tool-group', null,
        h('button.icon-btn', { type: 'button', title: this.label('toolbar.openDataClass').replace(/\s*\(.*\)$/, ''), onclick: () => this.setTab('dataclass') }, icon('braces', 15)),
        this.inscriptionToggle));
    clear(this.crumbsEl);
    if (crumbs) this.crumbsEl.append(crumbs);
    this.crumbsEl.hidden = !crumbs;
  }

  renderOverlays() {
    const t = this.t;
    clear(this.overlayEl);
    this.runButton = h('button.run-btn.primary', { type: 'button', onclick: () => this.onRunButton() });
    this.stepButton = h('button.run-btn', { type: 'button', title: t('step.tip'), onclick: () => this.run({ step: true }) }, icon('step', 14), h('span', null, t('step')));
    this.resetButton = h('button.run-btn', { type: 'button', title: t('reset.tip'), onclick: () => this.reset() }, icon('reset', 14), h('span', null, t('reset')));
    this.statusEl = h('span.run-status', { role: 'status', 'aria-live': 'polite' });
    this.captionEl = h('div.caption', { hidden: !this.caption }, this.caption);
    this.toastEl = h('div.toasts', { 'aria-live': 'polite' });
    this.requestEl = h('div.request-bar', { hidden: !this.request });
    this.renderRequest();
    this.tooltipEl = h('div.el-tooltip', { hidden: true, role: 'tooltip', 'data-tour': 'tooltip' });
    this.pageEl = h('div.page-view', { hidden: true, 'data-tour': 'page' });
    if (this.page) this.showPage(this.page.element, this.page.path);
    this.overlayEl.append(
      h('div.runbar', null, this.runButton, this.stepButton, this.resetButton, this.statusEl),
      this.requestEl,
      h('div.zoombar', null,
        h('button.icon-btn', { type: 'button', title: t('zoom.out'), 'aria-label': t('zoom.out'), onclick: () => { this.stage.effects.userMovedView(); this.stage.zoomBy(1 / 1.25); } }, icon('minus', 14)),
        h('button.icon-btn', { type: 'button', title: t('zoom.fit'), 'aria-label': t('zoom.fit'), onclick: () => { this.stage.effects.userMovedView(); this.stage.fit({ animate: true }); } }, icon('fit', 14)),
        h('button.icon-btn', { type: 'button', title: t('zoom.in'), 'aria-label': t('zoom.in'), onclick: () => { this.stage.effects.userMovedView(); this.stage.zoomBy(1.25); } }, icon('plus', 14))),
      this.captionEl, this.toastEl, this.tooltipEl, this.pageEl);
  }

  /** The description of an element, as the tooltip the Designer shows over it. */
  showTooltip(id) {
    const el = elementById(this.model, id);
    if (!el || !el.description || !this.tooltipEl) { this.hideTooltip(); return; }
    clear(this.tooltipEl).append(h('div.el-tooltip-name', null, el.name.replace(/\n/g, ' ') || this.typeName(el)),
      ...el.description.split('\n').map(line => h('div', null, line.split('`').map((part, i) => (i % 2 ? h('code', null, part) : part)))));
    const host = this.canvasHost.getBoundingClientRect();
    const at = this.stage.worldToClient(el.x, el.y + el.h / 2);
    this.tooltipEl.hidden = false;
    this.tooltipEl.style.left = Math.max(8, at.x - host.left - 20) + 'px';
    this.tooltipEl.style.top = (at.y - host.top + 18 * this.stage.view.zoom + 26) + 'px';
  }

  hideTooltip() {
    clearTimeout(this.tooltipTimer);
    if (this.tooltipEl) this.tooltipEl.hidden = true;
  }

  /**
   * The page a Process End Page shows, in a small browser window over the canvas. The page is
   * the project's own file (definition.pages), shown in a sandbox: no scripts, nothing loaded.
   */
  showPage(el, path) {
    this.page = { element: el, path };
    if (!this.pageEl) return;
    const t = this.t;
    const html = (this.def.pages || {})[path];
    clear(this.pageEl).append(
      h('div.page-bar', null, icon('page', 13), h('code.page-url', null, path || t('endpage.none')),
        h('span.spacer'), h('button.icon-btn', { type: 'button', title: t('endpage.close'), 'aria-label': t('endpage.close'), onclick: () => this.hidePage() }, icon('close', 12))),
      html
        ? h('iframe.page-frame', { sandbox: '', title: path, srcdoc: html })
        : h('div.page-missing', null, t(path ? 'endpage.notSimulated' : 'endpage.empty')));
    this.pageEl.hidden = false;
  }

  hidePage() {
    this.page = null;
    if (this.pageEl) this.pageEl.hidden = true;
  }

  /** The address the request of the run went to, as a browser would show it. */
  renderRequest() {
    if (!this.requestEl) return;
    clear(this.requestEl);
    this.requestEl.hidden = !this.request;
    if (!this.request) return;
    this.requestEl.append(icon('globe', 13), h('span.request-label', null, this.t('request.label')),
      h('code.request-url', { 'data-tour': 'request' }, '…/' + this.request.link));
  }

  setCaption(text) {
    this.caption = text || '';
    if (!this.captionEl) return;
    this.captionEl.textContent = this.caption;
    this.captionEl.hidden = !this.caption;
  }

  toast(text, { id = text, duration = 2800, tone = 'info' } = {}) {
    if (!this.toastEl) return;
    let node = [...this.toastEl.children].find(n => n.dataset.id === id);
    if (!node) {
      node = h('div.toast.' + tone, { 'data-id': id }, text);
      this.toastEl.append(node);
    } else node.textContent = text;
    clearTimeout(this.toastTimers.get(id));
    this.toastTimers.set(id, setTimeout(() => { node.remove(); this.toastTimers.delete(id); }, duration));
  }

  /** A label of the real Designer, in the current language (designer-labels.json). */
  label(key, params) {
    return this.t('designer:' + key, params);
  }

  /** The name of an element type, e.g. "Script Step". */
  typeName(el) {
    return this.t(el.typeLabel);
  }

  // ── selection and inscription ──────────────────────────────────────────────

  selected() {
    return this.state.selection ? elementById(this.model, this.state.selection) : null;
  }

  select(id) {
    if (this.state.selection === id) return;
    const previous = this.state.selection;
    this.state.selection = id;
    if (previous) this.refresh(previous);
    if (id) this.refresh(id);
    this.inscription.render();
    this.emit({ type: 'select', element: this.selected() });
    this.revealSelection();
  }

  setInscriptionOpen(open) {
    this.state.inscriptionOpen = open;
    this.processEditor.classList.toggle('inscription-closed', !open);
    if (this.inscriptionToggle) {
      this.inscriptionToggle.classList.toggle('active', open);
      this.inscriptionToggle.setAttribute('aria-pressed', String(open));
    }
    if (open) requestAnimationFrame(() => this.revealSelection());
  }

  setInscriptionTab(el, tabId) {
    this.state.inscriptionTabs[el.id] = tabId;
    this.inscription.render();
    this.emit({ type: 'inscription', element: el, tab: tabId });
  }

  /** In the narrow layout the inscription view covers part of the canvas: keep the selection beside it. */
  revealSelection() {
    const el = this.selected();
    if (!el || this.root.dataset.layout !== 'narrow' || !this.state.inscriptionOpen) return;
    const host = this.canvasHost.getBoundingClientRect();
    const free = this.inscriptionEl.getBoundingClientRect().left - host.left;
    if (free < 160) return;
    const x = this.stage.worldToClient(el.x, el.y).x - host.left;
    const half = (el.w / 2 + 28) * this.stage.view.zoom;
    if (x + half <= free && x - half >= 0) return;
    this.stage.effects.moveView({ x: this.stage.view.x + (x - free / 2) / this.stage.view.zoom }, 320);
  }

  /** Applies an edit to an element and refreshes everything that shows it. */
  changeElement(el, mutate, key = 'name') {
    mutate(el);
    this.refresh(el.id);
    this.inscription.validate();
    this.emit({ type: 'config', element: el, key });
  }

  canvasKey(key) {
    const el = this.selected();
    if (key === 'Enter' && el) { this.setInscriptionOpen(true); return true; }
    if (key === 'Escape' && el) { this.select(null); return true; }
    if (key === 'ArrowRight' || key === 'ArrowLeft') {
      const order = [];
      for (let e = startElement(this.model); e && !order.includes(e); e = (nextOf(this.model, e) || {}).element) order.push(e);
      if (!order.length) return false;
      const index = el ? order.indexOf(el) : -1;
      const next = order[clamp(index + (key === 'ArrowRight' ? 1 : -1), 0, order.length - 1)] || order[0];
      this.select(next.id);
      return true;
    }
    return false;
  }

  // ── bottom panel ───────────────────────────────────────────────────────────

  setPanelTab(id, byUser = false) {
    this.state.panelTab = id;
    if (byUser) { this.state.panelPinned = true; this.state.panelOpen = true; }
    this.panel.update();
  }

  setPanelOpen(open) {
    this.state.panelOpen = open;
    this.panel.update();
  }

  // ── running ────────────────────────────────────────────────────────────────

  setStatus(status, params = null) {
    this.state.status = status;
    this.state.statusParams = params;
    this.applyStatus();
  }

  applyStatus() {
    if (!this.runButton) return;
    const t = this.t;
    const { status, statusParams } = this.state;
    const running = status === 'running';
    const paused = status === 'paused';
    clear(this.runButton).append(icon(running ? 'stop' : 'play', 14), h('span', null, t(running ? 'stop' : paused ? 'continue' : 'run')));
    this.runButton.title = running ? t('stop') : t('run.tip');
    this.runButton.classList.toggle('stop', running);
    this.stepButton.disabled = running;
    this.statusEl.textContent = status === 'idle' ? '' : t('status.' + status, statusParams || {});
    this.statusEl.className = 'run-status ' + status;
  }

  onRunButton() {
    if (this.state.status === 'running') this.stop();
    else if (this.runner.running) this.run();
    else if (this.startNeedsRequest()) this.askRequest();
    else this.run();
  }

  /** The start that Run begins at has input parameters: the reader fills in the request first. */
  startNeedsRequest() {
    const start = this.runStart();
    return Boolean(start && start.type === 'RequestStart' && startParams(start).length);
  }

  runStart() {
    const selected = this.selected();
    return selected && selected.kind === 'start' ? selected : startElement(this.model);
  }

  /** A small form with one field per input parameter, filled with the values of the last run. */
  askRequest() {
    const t = this.t;
    const start = this.runStart();
    const inputs = startParams(start).map(p => {
      const input = h('input.input.mono', { type: 'text', value: this.params[p.name] == null ? '' : String(this.params[p.name]), spellcheck: false, 'aria-label': p.name });
      return { p, input };
    });
    const send = () => {
      inputs.forEach(({ p, input }) => { this.params[p.name] = input.value; });
      close();
      this.run();
    };
    const close = openPopover(this.layer, this.runButton, h('form.request-form', { onsubmit: e => { e.preventDefault(); send(); } },
      h('div.menu-title', null, t('request.title', { link: startLink(start) })),
      inputs.map(({ p, input }) => h('label.request-field', null, h('code', null, p.name), h('span.request-type', null, String(p.type).split('.').pop()), input)),
      h('p.field-note', null, t('request.note')),
      h('div.about-actions', null, h('button.btn.primary', { type: 'submit' }, t('request.send')))));
    if (inputs[0]) inputs[0].input.focus({ preventScroll: true });
  }

  /** Starts a run, or continues a paused one. `step` pauses before every element. */
  async run({ step = false, params = null, start = null, stepLimit } = {}) {
    if (this.runner.running) {
      if (!this.resume) return undefined;
      this.runner.setStepMode(step);
      const resume = this.resume;
      this.resume = null;
      this.setStatus('running');
      resume();
      return undefined;
    }
    if (this.model !== this.mainModel || this.level) this.showLevel(this.mainModel, null);
    if (this.state.tab !== 'process') this.setTab('process');
    if (params) this.params = { ...this.params, ...params };
    const generation = ++this.runGeneration;
    Object.assign(this.visual, { active: null, error: null, executed: {}, connectors: {} });
    this.cancelEffects();
    this.data = null;
    this.request = null;
    this.renderRequest();
    this.hidePage();
    this.hideTooltip();
    this.panel.setData(null);
    this.panel.setRequest(null);
    this.state.panelPinned = false;
    this.setCaption('');
    this.refresh('all');
    this.setStatus('running');
    let result;
    try {
      const from = start || (this.runStart() || {}).id || null;
      result = await this.runner.run({ params: this.params, stepMode: step, breakpoints: this.visual.breakpoints, start: from, stepLimit });
    } catch (e) {
      console.error('[ivyGuide] The simulated run stopped unexpectedly.', e);
      result = { status: 'failed', error: { kind: 'internal', message: String((e && e.message) || e) }, logs: [], visited: [] };
    }
    if (generation !== this.runGeneration) return result;
    this.resume = null;
    const failedModel = this.modelOf(result.failedIn);
    const failed = result.failedAt ? elementById(failedModel, result.failedAt) : null;
    if (result.status === 'failed') {
      this.visual.error = result.failedAt ? this.vkey(result.failedAt, failedModel) : null;
      if (failed) this.refresh(failed.id);
      if (result.error && result.error.kind === 'script') this.setCaption(this.t('note.script.failed', { message: result.error.message }));
      this.setStatus('failed', { name: failed ? failed.name || this.typeName(failed) : '' });
    } else if (result.status === 'stopped') {
      const at = result.stoppedAt ? elementById(this.model, result.stoppedAt) : null;
      this.setStatus('stopped.' + (result.stopReason || 'join'), { name: at ? at.name || this.typeName(at) : '' });
    } else this.setStatus(result.status);
    this.emit({ type: 'run', result });
    return result;
  }

  stop() {
    if (!this.runner.running) return;
    this.runner.cancel();
    const resume = this.resume;
    this.resume = null;
    this.cancelEffects();
    if (resume) resume();
  }

  cancelEffects() {
    this.stage.effects.cancelAll();
  }

  /** Clears the run and puts the process back to how the guide ships it. */
  reset() {
    this.runGeneration++;
    this.stop();
    this.cancelEffects();
    this.models.forEach(model => restore(model, model.original));
    if (this.model !== this.mainModel || this.level) {
      this.model = this.mainModel;
      this.level = null;
      this.state.selection = null;
      this.renderToolbar();
    }
    this.params = { ...(this.def.params || {}) };
    this.visual = freshVisual();
    this.data = null;
    this.request = null;
    this.renderRequest();
    this.hidePage();
    this.hideTooltip();
    this.dataClassView.render();
    this.panel.clearLog();
    this.panel.setData(null);
    this.panel.setRequest(null);
    this.state.panelPinned = false;
    this.setPanelTab('log');
    this.setCaption('');
    this.setStatus('idle');
    this.refresh('all');
    this.stage.fit({ animate: true });
    this.renderTabs();
    this.inscription.render();
    this.emit({ type: 'reset' });
  }

  createIo() {
    const named = params => {
      const el = params && params.element;
      const target = params && params.target;
      return {
        name: el ? el.name || this.typeName(el) : '',
        dataClass: this.model.dataClass.simpleName,
        condition: (params && params.condition) || '',
        count: params && params.count !== undefined ? params.count : '',
        target: target ? target.name || this.typeName(target) : ''
      };
    };
    return {
      travel: async connector => {
        await this.hook('after:' + this.hookId(connector.from, connector.model), connector.from);
        const model = connector.model || this.model;
        if (model === this.model && (connector.to.parent || null) === this.level) await this.stage.effects.travel(connectorPath(connector));
        const key = this.vkey(connector.id, model);
        this.visual.connectors[key] = (this.visual.connectors[key] || 0) + 1;
        this.refresh('connectors');
      },
      enter: async (el, where = {}) => {
        const model = where.model || this.model;
        // the canvas follows the token into another process or box
        if (model !== this.model || (where.level || null) !== this.level) this.showLevel(model, where.level || null);
        if (where.data && where.data !== this.data) {
          this.data = where.data;
          this.panel.setData(this.data);
        }
        const previous = this.visual.active;
        this.visual.active = this.vkey(el.id, model);
        if (previous) this.refresh(previous);
        this.refresh(el.id);
        this.stage.effects.pulse(el, 'assistant');
        await this.stage.effects.wait(el.kind === 'start' ? 320 : 220);
        await this.hook('enter:' + this.hookId(el, model), el);
      },
      leave: (el, outcome) => {
        const key = this.vkey(el.id);
        if (outcome === 'done') this.visual.executed[key] = (this.visual.executed[key] || 0) + 1;
        else this.visual.error = key;
        this.refresh(el.id);
        // the last element of a run that ends there gets its "after" moment too
        if (outcome === 'done' && el.kind === 'end') return this.hook('after:' + this.hookId(el), el);
        return undefined;
      },
      pause: (el, reason) => {
        const waiting = new Promise(resolve => { this.resume = resolve; });
        this.setStatus('paused', { name: el.name || this.typeName(el) });
        return waiting;
      },
      note: (key, params) => this.setCaption(this.t('note.' + key, named(params))),
      log: entry => {
        this.panel.addLog(entry);
        if (!this.state.panelPinned) this.setPanelTab('log');
      },
      request: (el, request) => {
        this.request = request;
        this.renderRequest();
        this.data = request.data || {};
        this.panel.setRequest(request);
        this.panel.setData(this.data);
        this.stage.effects.chip(el, startLink(el), 'user');
      },
      mapped: (el, rows) => this.hook('mapped:' + this.hookId(el), { element: el, rows }),
      data: (name, value, el, data) => {
        // a path of a Split or another process changes its own data: only the data shown is redrawn
        if (data && this.data && data !== this.data) return;
        if (!this.data) this.data = data || {};
        this.data[name] = value;
        this.panel.setData(this.data, name);
      },
      descend: async ({ model, level, from }) => {
        await this.hook('descend:' + this.hookId(from), { model, level, from });
        this.showLevel(model, level);
        await this.stage.effects.wait(260);
      },
      ascend: async ({ model, level, to, data }) => {
        this.showLevel(model, level);
        if (data && data !== this.data) { this.data = data; this.panel.setData(this.data); }
        await this.stage.effects.wait(200);
        await this.hook('ascend:' + this.hookId(to, model), { model, level, to });
      },
      caught: (handler, { code }) => {
        this.stage.effects.chip(handler, code || this.label('part.error.empty'), 'error');
      },
      page: async (el, page) => {
        await this.stage.effects.chip(el, page || this.t('endpage.none'), 'neutral');
        this.showPage(el, page);
      }
    };
  }

  // ── language and teardown ──────────────────────────────────────────────────

  setLanguage(lang) {
    const next = normalizeLanguage(lang);
    if (next === this.lang) return;
    this.lang = next;
    this.t = createTranslator(next, this.def.strings);
    this.setCaption('');
    this.renderChrome();
    this.refresh('all');
  }

  dispose() {
    this.disposed = true;
    this.runGeneration++;
    this.stop();
    this.toastTimers.forEach(timer => clearTimeout(timer));
    if (this.detachController) this.detachController();
    if (this.resizeObserver) this.resizeObserver.disconnect();
    this.tour.dispose();
    this.stage.dispose();
    clear(this.root);
  }
}
