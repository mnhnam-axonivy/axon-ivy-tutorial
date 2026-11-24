/**
 * The inscription view: the panel on the right where an element is configured.
 *
 * Which tabs an element has, the sections on each tab and their order follow the process
 * editor of the Designer for VS Code 14.0.1 (axonivy.vscode-designer-14); every label is the
 * Designer's own, in English or Japanese (designer-labels.json). Fields the simulation does
 * not act on are shown as in the Designer, read-only, and say so.
 *
 *   Request Start           General, Start, Request, Trigger, Task, Case
 *   Script Step             General, Output (mapping, code, Disable Permission Checks)
 *   Process End Page        General, End Page
 *   Alternative             General, Condition (Type: "<target>: <type>", Expression)
 *   Split, Join             General, Output (out1, out2, … of a Split; in1, in2, … in a Join)
 *   Call Sub                General, Process (Process start, mapping of `param`), Output (`result`)
 *   Sub Process Start       General, Start, Result (Result parameters, mapping of `result`, code)
 *   Error End               General, Error (Error Code to throw, Error Cause, Code)
 *   Error Boundary Event,
 *   Error Start             General, Error (Error Code; << Empty >> catches all errors), Output
 *   Embedded Subprocess,
 *   BPMN activities         General without tags
 *   Process End, Sub Process End, Embedded Start/End: General
 *
 * Fields a walkthrough points at or types into carry data-tour="<key>"; their controls are in
 * `controls[<key>]`. Keys: tabs, name, description, docs, tags, signature, params, mapping,
 * map:<target> (map:out, map:out.total, map:out1, map:param.weight, map:result.price), code,
 * resultCode, resultParams, sudo, link, startPerHttp, startList, requestName,
 * requestDescription, category, permission, anonymous, roles, triggerable, page, conditions,
 * condition:<connector id>, processStart, errorCode, errorThrow, errorCause; of the process
 * itself: displayName, dataClass, dataClassMessage, viewer, wsName, wsAuth.
 *
 * With no element selected the view shows the process itself, as the Designer does. Its tabs
 * depend on the kind of process: General, Process Data, Permissions; a web service process has
 * Web Service Process too, a User Dialog logic process has no Process Data.
 */
import { h, clear } from '../util.js';
import { icon, elementGlyph } from './icons.js';
import { section, field, note, textBox, checkbox, scriptInput, codeEditor } from './fields.js';
import {
  elementById, startParams, resultParams, signatureText, startLink, joinLines, orderedConditions, resolveCall,
  mappingBlockName, incoming, BPMN_TYPES
} from '../model/process.js';
import { validateMapping, validateScript, validateCondition, validateExpression, positionOf, defaultValue } from '../model/ivyscript.js';

const shortType = type => String(type || 'String').split('.').pop();

/** Which tab opens first: the one the element is about. */
const DEFAULT_TAB = {
  RequestStart: 'start', CallSubStart: 'start', Script: 'output', TaskEndPage: 'endPage', Alternative: 'condition',
  Split: 'output', Join: 'output', SubProcessCall: 'process', ErrorEnd: 'error', ErrorBoundaryEvent: 'error', ErrorStartEvent: 'error'
};

/** Elements whose General tab has no tags (Designer: the editor of boxes hides them). */
const NO_TAGS = new Set(['EmbeddedProcess', ...BPMN_TYPES]);

/** Where a part of an inscription's messages starts, as the Designer's Problems view words it. */
const PART = { input: 'Start', output: 'Output', call: 'Parameter', result: 'Result' };

export class Inscription {
  /** @param {Object} app  the DesignerApp  @param {HTMLElement} root */
  constructor(app, root) {
    this.app = app;
    this.root = root;
    this.checks = [];
    this.controls = {};
    this.title = null;
  }

  /** A label of the Designer, in the current language. */
  l(key, params) {
    return this.app.label(key, params);
  }

  render() {
    const { app } = this;
    const t = app.t;
    clear(this.root);
    this.checks = [];
    this.controls = {};
    this.title = null;
    const el = app.selected();
    const closeButton = h('button.icon-btn.inscription-close', { type: 'button', title: t('toggle.inscription'), 'aria-label': t('toggle.inscription'), onclick: () => app.setInscriptionOpen(false) }, icon('close', 14));

    if (!el) {
      this.renderProcess(closeButton);
      return;
    }

    this.title = h('span.inscription-title');
    this.updateTitle();
    this.root.append(h('div.inscription-head', null, elementGlyph(el), this.title, h('span.spacer'),
      h('span.icon-btn.inert', { title: t('quick.inert') }, icon('help', 14)), closeButton));

    this.renderTabs(el.id, this.tabsFor(el), DEFAULT_TAB[el.type] || 'general', tab => app.setInscriptionTab(el, tab));
  }

  /** The tab strip and the body of the active tab. */
  renderTabs(id, tabs, fallback, choose) {
    const { app } = this;
    const wanted = app.state.inscriptionTabs[id] || fallback;
    const active = tabs.find(tab => tab.id === wanted) || tabs[0];
    this.root.append(h('div.inscription-tabs', { role: 'tablist', 'data-tour': 'tabs' }, tabs.map(tab =>
      h('button.inscription-tab' + (tab === active ? '.active' : ''), {
        type: 'button', role: 'tab', 'aria-selected': String(tab === active), 'data-tab': tab.id,
        onclick: () => choose(tab.id)
      }, h('span', null, tab.label), tab.dot ? h('span.tab-dot') : null))));
    const body = h('div.inscription-body', { role: 'tabpanel' });
    this.root.append(body);
    active.render(body);
    this.validate();
  }

  // ── the process itself ─────────────────────────────────────────────────────

  renderProcess(closeButton) {
    const { app } = this;
    const model = app.model;
    const t = app.t;
    this.root.append(h('div.inscription-head', null, icon('process', 15),
      h('span.inscription-title', null, t('process.kind.' + model.kind) + ' - ' + model.name), h('span.spacer'),
      h('span.icon-btn.inert', { title: t('quick.inert') }, icon('help', 14)), closeButton));
    const tab = (id, labelKey, render, dot = false) => ({ id, label: this.l(labelKey), render, dot });
    const general = tab('general', 'part.general.title', body => this.processGeneral(body), Boolean(model.description));
    const data = tab('processData', 'part.processData.title', body => this.processDataTab(body), true);
    const permissions = tab('permissions', 'part.permission.title', body => this.permissionsTab(body), model.viewAllowed !== (model.kind !== 'HTML_DIALOG'));
    let tabs = [general, data, permissions];
    if (model.kind === 'HTML_DIALOG') tabs = [general, permissions];
    if (model.kind === 'WEB_SERVICE') tabs = [general, tab('webService', 'part.wsprocess.title', body => this.webServiceTab(body), true), data, permissions];
    this.renderTabs('process', tabs, 'general', id => {
      app.state.inscriptionTabs.process = id;
      this.render();
      app.emit({ type: 'inscription', element: null, tab: id });
    });
  }

  /** The General tab of a process: its name is the file's name and cannot be changed here; no tags. */
  processGeneral(body) {
    const { app } = this;
    const model = app.model;
    const state = key => this.sectionState({ id: 'process' }, key, key === 'name');
    const name = textBox({ value: model.name, readOnly: true });
    const description = textBox({ value: model.description, rows: 2, onInput: v => { model.description = v; app.emit({ type: 'config', element: null, key: 'description' }); } });
    this.controls.displayName = name;
    this.controls.description = description;
    body.append(
      section({ title: this.l('part.general.nameAndDescription'), ...state('name') },
        this.tagged(field(this.l('part.general.displayName'), name), 'displayName'),
        this.tagged(field(this.l('common.label.description'), description), 'description')),
      this.tagged(section({ title: this.l('part.general.meansAndDocuments'), ...state('docs') }, note(app.t('inscription.orientation'))), 'docs'));
  }

  processDataTab(body) {
    const { app } = this;
    body.append(section({ title: this.l('part.processData.title'), ...this.sectionState({ id: 'process' }, 'data', true) },
      this.shown('part.processData.dataClass', app.model.dataClassName, 'dataClass', { mono: true }),
      this.tagged(note(this.l('part.processData.dataClassMessage')), 'dataClassMessage')));
  }

  permissionsTab(body) {
    body.append(section({ title: this.l('part.permission.title'), ...this.sectionState({ id: 'process' }, 'permissions', true) },
      this.tagged(checkbox({ label: this.l('part.permission.allowProcessViewer'), checked: this.app.model.viewAllowed, disabled: true }), 'viewer'),
      note(this.app.t('inscription.orientation'))));
  }

  webServiceTab(body) {
    const model = this.app.model;
    const auth = { NONE: 'part.wsprocess.auth.none', WS_SECURITY: 'part.wsprocess.auth.wsSecurity', HTTP_BASIC: 'part.wsprocess.auth.httpBasic' };
    body.append(section({ title: this.l('part.wsprocess.title'), ...this.sectionState({ id: 'process' }, 'ws', true) },
      this.shown('part.wsprocess.qualifiedName', model.wsTypeName, 'wsName', { mono: true }),
      this.shown('part.wsprocess.authentication', this.l(auth[model.wsAuth] || auth.NONE), 'wsAuth'),
      note(this.app.t('inscription.orientation'))));
  }

  updateTitle() {
    const el = this.app.selected();
    if (this.title && el) this.title.textContent = this.app.typeName(el) + (el.name ? ' - ' + el.name.replace(/\n/g, ' ') : '');
  }

  validate() {
    this.checks.forEach(fn => fn());
  }

  tabsFor(el) {
    const tab = (id, labelKey, render, dot = false) => ({ id, label: this.l(labelKey), render, dot });
    const general = tab('general', 'part.general.title', body => this.general(el, body), Boolean(el.name || el.description));
    const output = (render, dot = true) => tab('output', 'part.output.title', render, dot);
    const error = render => tab('error', 'part.error.title', render, true);
    switch (el.type) {
      case 'RequestStart':
        return [general,
          tab('start', 'part.start.title', body => this.startTab(el, body), true),
          tab('request', 'part.request.title', body => this.requestTab(el, body)),
          tab('trigger', 'part.trigger.title', body => this.triggerTab(el, body)),
          tab('task', 'part.task.task', body => this.startTaskTab(el, body)),
          tab('case', 'part.case.title', body => this.caseTab(el, body))];
      case 'CallSubStart':
        return [general,
          tab('start', 'part.start.title', body => this.startTab(el, body), true),
          tab('result', 'part.result.title', body => this.resultTab(el, body), resultParams(el).length > 0)];
      case 'Script':
        return [general, output(body => this.outputTab(el, body))];
      case 'TaskEndPage':
        return [general, tab('endPage', 'part.endPage.title', body => this.endPageTab(el, body), Boolean(el.config.page))];
      case 'Alternative':
        return [general, tab('condition', 'part.condition.title', body => this.conditionTab(el, body), true)];
      case 'Split':
        return [general, output(body => this.splitTab(el, body))];
      case 'Join':
        return [general, output(body => this.joinTab(el, body))];
      case 'SubProcessCall':
        return [general,
          tab('process', 'part.call.title', body => this.callProcessTab(el, body), Boolean(el.config.processCall)),
          output(body => this.callOutputTab(el, body))];
      case 'ErrorEnd':
        return [general, error(body => this.errorEndTab(el, body))];
      case 'ErrorBoundaryEvent':
      case 'ErrorStartEvent':
        return [general, error(body => this.errorCodeTab(el, body)), output(body => this.errorOutputTab(el, body))];
      default:
        return [general];
    }
  }

  sectionState(el, id, fallback) {
    const key = el.id + ':' + id;
    const stored = this.app.state.sections[key];
    return { open: stored === undefined ? fallback : stored, onToggle: open => { this.app.state.sections[key] = open; } };
  }

  tagged(node, key) {
    node.setAttribute('data-tour', key);
    return node;
  }

  /** A read-only text field as the Designer shows it. */
  shown(labelKey, value, key, { rows = 1, mono = false, placeholder = '' } = {}) {
    const box = textBox({ value: value == null ? '' : String(value), readOnly: true, rows, mono, placeholder });
    const node = field(labelKey ? this.l(labelKey) : null, box);
    return key ? this.tagged(node, key) : node;
  }

  /** A check context for the scripts of an element (see DesignerApp.scriptContext). */
  ctx(el, options) {
    return this.app.scriptContext(el, options);
  }

  /** An object of the process data class, as in1, out2 … are while checking. */
  typed() {
    return { __type: this.app.model.dataClass.name };
  }

  // ── General ────────────────────────────────────────────────────────────────

  general(el, body) {
    const { app } = this;
    const name = textBox({ value: el.name, rows: 2, onInput: v => { app.changeElement(el, e => { e.name = v; }); this.updateTitle(); } });
    const description = textBox({ value: el.description, rows: 2, onInput: v => app.changeElement(el, e => { e.description = v; }, 'description') });
    this.controls.name = name;
    this.controls.description = description;
    const tags = el.tags || [];
    body.append(
      section({ title: this.l('part.general.nameAndDescription'), ...this.sectionState(el, 'name', true) },
        this.tagged(field(this.l('part.general.displayName'), name), 'name'),
        this.tagged(field(this.l('common.label.description'), description), 'description')),
      this.tagged(section({ title: this.l('part.general.meansAndDocuments'), ...this.sectionState(el, 'docs', false) }, note(app.t('inscription.orientation'))), 'docs'),
      NO_TAGS.has(el.type) ? null : section({ title: this.l('part.general.tags'), ...this.sectionState(el, 'tags', tags.length > 0) },
        tags.length ? this.tagged(h('div.tags', null, tags.map(tag => h('span.chip.plain', null, tag))), 'tags') : note(app.t('inscription.orientation'))));
  }

  // ── mapping table and code ─────────────────────────────────────────────────

  /**
   * The mapping tree of one block of an element (`input`, `output`, `call`, `result`): for
   * each root (out; out1, out2 of a Split; param; result) a row, and one row per field
   * beneath it, with the expression that gives it its value. A root row of the process data
   * (out ← in) can be edited; param and result have none. `context()` is what the
   * expressions may use.
   */
  mappingTable(el, blockName, roots, context) {
    const { app } = this;
    const block = (e = el, create = false) => {
      if (create && !e.config[blockName]) e.config[blockName] = {};
      return e.config[blockName];
    };
    const map = () => (block() || {}).map || {};
    const setMap = (target, value) => app.changeElement(el, e => {
      const b = block(e, true);
      b.map = { ...(b.map || {}) };
      if (value.trim() === '') delete b.map[target];
      else b.map[target] = value;
    }, 'map:' + target);
    const message = h('div.field-msg');
    const rows = [];
    const input = target => {
      const box = scriptInput({ value: map()[target] || '', placeholder: this.l('label.enterExpression'), onInput: v => setMap(target, v) });
      box.input.setAttribute('aria-label', target);
      this.controls['map:' + target] = box;
      return box;
    };
    const tbody = h('tbody');
    roots.forEach(root => {
      if (root.row) {
        const tr = h('tr.map-root', { 'data-tour': 'map:' + root.name },
          h('td', null, h('code', null, root.name)), h('td', { title: root.type }, shortType(root.type)),
          h('td.map-expr', null, root.editable ? input(root.name) : null));
        if (root.editable) rows.push({ tr, target: root.name, root: true });
        tbody.append(tr);
      }
      root.fields.forEach(f => {
        const target = root.name + '.' + f.name;
        const tr = h('tr', { 'data-tour': 'map:' + target },
          h('td', { style: { paddingLeft: (6 + (root.row ? 14 : 0)) + 'px' } }, h('code', null, f.name)),
          h('td', { title: f.type }, shortType(f.type)),
          h('td.map-expr', null, input(target)));
        rows.push({ tr, target });
        tbody.append(tr);
      });
    });
    const table = h('table.mapping.map-tree', null,
      h('thead', null, h('tr', null, h('th', null, this.l('common.label.attribute')), h('th', null, this.l('common.label.type')), h('th', null, this.l('label.expression')))),
      tbody);
    const part = PART[blockName] || 'Output';
    this.checks.push(() => {
      let first = null;
      rows.forEach(({ tr, target, root }) => {
        const source = String(map()[target] || '').trim();
        const error = !source ? null : root ? validateExpression(source, context()) : validateMapping(target, source, context());
        tr.classList.toggle('invalid', Boolean(error));
        tr.title = error ? error.message : '';
        // worded as the Designer's Problems view: Output 'out.status': Variable 'x' cannot be resolved
        if (error && !first) first = part + " '" + target + "': " + error.message;
      });
      message.className = 'field-msg' + (first ? ' error' : '');
      clear(message);
      if (first) message.append(icon('error', 12), h('span', null, first));
    });
    return this.tagged(h('div.field', null, table, message), 'mapping');
  }

  /** The code of a block, checked like the Designer underlines errors. `key` is the control's name. */
  codeBlock(el, read, write, context, { key = 'code', part = 'Output' } = {}) {
    const { app } = this;
    const editor = codeEditor({ value: read(), language: 'ivyscript', label: this.l('label.code'), onInput: v => app.changeElement(el, e => write(e, v), key) });
    const node = this.tagged(field(null, editor), key);
    this.controls[key] = editor;
    this.checks.push(() => {
      const code = read();
      const error = code.trim() ? validateScript(code, context()) : null;
      if (error) {
        const at = positionOf(code, error.pos);
        editor.setMarkers([{ line: at.line, message: error.message }]);
        node.setMessage('error', part + ' code: ' + error.message);
      } else {
        editor.setMarkers([]);
        node.setMessage('', '');
      }
    });
    return node;
  }

  /** The code section of a block (`input`, `output`, `result`). */
  codeSection(el, blockName, context, { open = true, key = 'code' } = {}) {
    const read = () => joinLines((el.config[blockName] || {}).code);
    const write = (e, v) => { if (!e.config[blockName]) e.config[blockName] = {}; e.config[blockName].code = v; };
    return section({ title: this.l('label.code'), ...this.sectionState(el, key, open || Boolean(read())) },
      this.codeBlock(el, read, write, context, { key, part: PART[blockName] || 'Output' }));
  }

  /** The process data as the root `out` of a mapping, its row editable (out ← in). */
  outRoot(name = 'out') {
    const cls = this.app.model.dataClass;
    return { name, type: cls.simpleName, row: true, editable: true, fields: cls.fields };
  }

  // ── Start (Request Start, Sub Process Start) ───────────────────────────────

  /** Values the checks pretend a parameter has: the default of its type. */
  paramVars(params) {
    const values = {};
    params.forEach(p => { values[p.name] = defaultValue(p.type); });
    return values;
  }

  paramTable(params, key) {
    return this.tagged(h('div.field', null, params.length
      ? h('table.mapping', null,
        h('thead', null, h('tr', null, h('th', null, this.l('common.label.name')), h('th', null, this.l('common.label.type')), h('th', null, this.l('common.label.description')))),
        h('tbody', null, params.map(p => h('tr', { 'data-tour': key.replace(/s$/, '') + ':' + p.name },
          h('td', null, h('code', null, p.name)), h('td', { title: p.type }, shortType(p.type)), h('td', null, p.desc)))))
      : note(this.app.t('inscription.noParams'))), key);
  }

  startTab(el, body) {
    const { app } = this;
    const params = startParams(el);
    const signature = textBox({ value: el.config.signature || '', mono: true, onInput: v => app.changeElement(el, e => { e.config.signature = v; }, 'signature') });
    this.controls.signature = signature;
    const context = () => this.ctx(el, { vars: { param: this.paramVars(params) }, varTypes: { param: params }, noIn: true });
    body.append(
      section({ title: this.l('part.start.signature'), ...this.sectionState(el, 'signature', true) },
        this.tagged(field(null, signature), 'signature'),
        this.tagged(h('p.field-note.signature-text', null, app.t('inscription.signature', { signature: signatureText(el) })), 'signatureText')),
      section({ title: this.l('part.start.inputParamters'), ...this.sectionState(el, 'params', true) }, this.paramTable(params, 'params')),
      section({ title: this.l('common.label.mapping'), ...this.sectionState(el, 'mapping', true) },
        this.mappingTable(el, 'input', [{ ...this.outRoot(), row: false }], context)),
      this.codeSection(el, 'input', context, { open: Boolean(joinLines((el.config.input || {}).code)) }));
  }

  /** Sub Process Start, Result tab: what the sub process returns, mapped when its end is reached. */
  resultTab(el, body) {
    const results = resultParams(el);
    const context = () => this.ctx(el, { vars: { result: this.paramVars(results) }, varTypes: { result: results }, noOut: true });
    body.append(
      section({ title: this.l('part.result.paramter'), ...this.sectionState(el, 'resultParams', true) }, this.paramTable(results, 'resultParams')),
      section({ title: this.l('common.label.mapping'), ...this.sectionState(el, 'resultMapping', true) },
        this.mappingTable(el, 'result', [{ name: 'result', type: 'Result', row: true, editable: false, fields: results }], context)),
      this.codeSection(el, 'result', context, { open: Boolean(joinLines((el.config.result || {}).code)), key: 'resultCode' }));
  }

  requestTab(el, body) {
    const { app } = this;
    const request = { isHttpRequestable: true, isVisibleOnStartList: true, ...(el.config.request || {}) };
    const permission = { anonymous: true, roles: ['Everybody'], ...(el.config.permission || {}) };
    const tagged = (node, key) => this.tagged(node, key);
    body.append(
      tagged(checkbox({ label: this.l('part.request.startPerHttp'), checked: request.isHttpRequestable !== false, disabled: true }), 'startPerHttp'));
    if (request.isHttpRequestable === false) return;
    body.append(
      section({ title: this.l('part.request.title'), ...this.sectionState(el, 'request', true) },
        tagged(h('div.field', null, h('code.start-link', null, request.linkName || startLink(el))), 'link'),
        tagged(checkbox({ label: this.l('part.request.showOnStartList'), checked: request.isVisibleOnStartList !== false, disabled: true }), 'startList'),
        this.shown('common.label.name', request.name, 'requestName'),
        this.shown('common.label.description', joinLines(request.description), 'requestDescription', { rows: 2 }),
        this.shown('common.label.category', request.category, 'category'),
        note(app.t('inscription.orientation'))),
      tagged(section({ title: this.l('label.permission'), ...this.sectionState(el, 'permission', false) },
        tagged(checkbox({ label: this.l('label.allowAnonymous'), checked: permission.anonymous !== false, disabled: true }), 'anonymous'),
        this.shown('common.label.roles', (permission.roles || []).join(', '), 'roles'),
        permission.error ? this.shown('label.validationError', permission.error, null, { mono: true }) : null,
        note(app.t('inscription.orientation'))), 'permission'));
  }

  triggerTab(el, body) {
    body.append(
      this.tagged(checkbox({ label: this.l('part.trigger.startTriggerable'), checked: Boolean(el.config.triggerable), disabled: true }), 'triggerable'),
      note(this.app.t('inscription.orientation')));
  }

  startTaskTab(el, body) {
    const task = el.config.task || {};
    const anonymous = !el.config.permission || el.config.permission.anonymous !== false;
    body.append(
      section({ title: this.l('part.task.task'), ...this.sectionState(el, 'task', true) },
        this.shown('common.label.name', joinLines(task.name)),
        this.shown('common.label.description', joinLines(task.description), null, { rows: 2 }),
        this.shown('common.label.category', task.category)),
      section({ title: this.l('part.task.options'), ...this.sectionState(el, 'taskOptions', false) },
        checkbox({ label: this.l(anonymous ? 'part.task.persistDisabled' : 'part.task.persist'), checked: Boolean(el.config.persistOnStart), disabled: true })),
      note(this.app.t('inscription.orientation')));
  }

  caseTab(el, body) {
    const c = el.config.case || {};
    body.append(
      section({ title: this.l('part.case.title'), ...this.sectionState(el, 'case', true) },
        this.shown('common.label.name', joinLines(c.name)),
        this.shown('common.label.description', joinLines(c.description), null, { rows: 2 }),
        this.shown('common.label.category', c.category)),
      note(this.app.t('inscription.orientation')));
  }

  // ── Script Step: Output ────────────────────────────────────────────────────

  outputTab(el, body) {
    const { app } = this;
    const sudo = checkbox({
      label: this.l('part.output.disablePermission'),
      checked: Boolean(el.config.sudo),
      onChange: checked => app.changeElement(el, e => { if (checked) e.config.sudo = true; else delete e.config.sudo; }, 'sudo')
    });
    const context = () => this.ctx(el);
    body.append(
      section({ title: this.l('common.label.mapping'), ...this.sectionState(el, 'mapping', true) }, this.mappingTable(el, 'output', [this.outRoot()], context)),
      this.codeSection(el, 'output', context),
      this.tagged(sudo, 'sudo'));
  }

  // ── Process End Page ───────────────────────────────────────────────────────

  endPageTab(el, body) {
    body.append(
      this.shown('part.endPage.title', el.config.page || '', 'page', { mono: true }),
      note(this.app.t('inscription.orientation')));
  }

  // ── Alternative ────────────────────────────────────────────────────────────

  /**
   * One row per exit, in the order the conditions are tried; "Type" names the element the
   * exit leads to as "<name>: <type>" (Designer 14.0.1). An empty condition always holds.
   */
  conditionTab(el, body) {
    const { app } = this;
    const message = h('div.field-msg');
    const exits = orderedConditions(el);
    const rows = exits.map((exit, i) => {
      const target = elementById(app.model, exit.to);
      const read = () => String(((el.config.conditions || {})[exit.id]) || '');
      const input = scriptInput({
        value: read(), placeholder: this.l('label.enterExpression'),
        onInput: v => app.changeElement(el, e => { e.config.conditions = { ...(e.config.conditions || {}), [exit.id]: v }; }, 'condition:' + exit.id)
      });
      input.input.setAttribute('aria-label', 'Condition #' + (i + 1));
      this.controls['condition:' + exit.id] = input;
      const tr = h('tr', { 'data-tour': 'condition:' + exit.id },
        h('td', null, target ? (target.name.replace(/\n/g, ' ') || app.typeName(target)) + ': ' + target.type : '⛔ ' + exit.id),
        h('td.map-expr', null, input));
      return { tr, read, n: i + 1 };
    });
    this.checks.push(() => {
      let first = null;
      rows.forEach(({ tr, read, n }) => {
        const source = read().trim();
        const error = source ? validateCondition(source, this.ctx(el, { noOut: true })) : null;
        tr.classList.toggle('invalid', Boolean(error));
        tr.title = error ? error.message : '';
        if (error && !first) first = 'Condition #' + n + ': ' + error.message;
      });
      message.className = 'field-msg' + (first ? ' error' : '');
      clear(message);
      if (first) message.append(icon('error', 12), h('span', null, first));
    });
    body.append(section({ title: this.l('part.condition.title'), ...this.sectionState(el, 'condition', true) },
      this.tagged(h('div.field', null, h('table.mapping', null,
        h('thead', null, h('tr', null, h('th', null, this.l('common.label.type')), h('th', null, this.l('label.expression')))),
        h('tbody', null, rows.map(r => r.tr))), message), 'conditions')));
  }

  // ── Split and Join ─────────────────────────────────────────────────────────

  /** Split: out1, out2, … one per outgoing connector, each the process data of its path. */
  splitTab(el, body) {
    const names = el.outgoing.map((c, i) => c.outVar || 'out' + (i + 1));
    const context = () => {
      const vars = {};
      names.forEach(n => { vars[n] = this.typed(); });
      return this.ctx(el, { vars, noOut: true });
    };
    body.append(
      section({ title: this.l('common.label.mapping'), ...this.sectionState(el, 'mapping', true) },
        this.mappingTable(el, 'output', names.map(n => this.outRoot(n)), context)),
      this.codeSection(el, 'output', context, { open: Boolean(joinLines((el.config.output || {}).code)) }));
  }

  /** Join: in1, in2, … one per incoming connector; there is no `in`. */
  joinTab(el, body) {
    const names = incoming(this.app.model, el).map((c, i) => c.var || 'in' + (i + 1));
    const context = () => {
      const vars = {};
      names.forEach(n => { vars[n] = this.typed(); });
      return this.ctx(el, { vars, noIn: true });
    };
    body.append(
      this.tagged(note(names.join(', ')), 'inputs'),
      section({ title: this.l('common.label.mapping'), ...this.sectionState(el, 'mapping', true) },
        this.mappingTable(el, 'output', [this.outRoot()], context)),
      this.codeSection(el, 'output', context, { open: Boolean(joinLines((el.config.output || {}).code)) }));
  }

  // ── Call Sub ───────────────────────────────────────────────────────────────

  /** The Sub Process Start a Call Sub calls, in the processes of the walkthrough. */
  callTarget(el) {
    return resolveCall(this.app.models || [this.app.model], el.config.processCall);
  }

  callProcessTab(el, body) {
    const target = this.callTarget(el);
    const params = target ? startParams(target.start) : [];
    const context = () => this.ctx(el, { vars: { param: this.paramVars(params) }, varTypes: { param: params }, noOut: true });
    body.append(
      section({ title: this.l('part.call.processStart'), ...this.sectionState(el, 'processStart', true) },
        this.shown(null, el.config.processCall || '', 'processStart', { mono: true })),
      section({ title: this.l('common.label.mapping'), ...this.sectionState(el, 'callMapping', true) },
        this.mappingTable(el, 'call', [{ name: 'param', type: target ? signatureText(target.start) : 'param', row: true, editable: false, fields: params }], context)));
  }

  callOutputTab(el, body) {
    const target = this.callTarget(el);
    const results = target ? resultParams(target.start) : [];
    const context = () => this.ctx(el, { vars: { result: this.paramVars(results) }, varTypes: { result: results } });
    body.append(
      section({ title: this.l('common.label.mapping'), ...this.sectionState(el, 'mapping', true) }, this.mappingTable(el, 'output', [this.outRoot()], context)),
      this.codeSection(el, 'output', context, { open: Boolean(joinLines((el.config.output || {}).code)) }));
  }

  // ── Errors ─────────────────────────────────────────────────────────────────

  /** Error End: the code of the error it throws, the error it re-throws, and code that runs first. */
  errorEndTab(el, body) {
    const { app } = this;
    const throws = el.config.throws || {};
    const code = textBox({ value: throws.error || '', mono: true, onInput: v => app.changeElement(el, e => { e.config.throws = { ...(e.config.throws || {}), error: v }; }, 'errorThrow') });
    const cause = textBox({ value: throws.cause || '', mono: true, onInput: v => app.changeElement(el, e => { e.config.throws = { ...(e.config.throws || {}), cause: v }; }, 'errorCause') });
    this.controls.errorThrow = code;
    this.controls.errorCause = cause;
    const context = () => this.ctx(el, { vars: { error: { __bpmError: true } } });
    const read = () => joinLines(el.config.code);
    body.append(
      section({ title: this.l('part.error.title'), ...this.sectionState(el, 'error', true) },
        this.tagged(field(this.l('part.error.codeToThrow'), code), 'errorThrow'),
        this.tagged(field(this.l('part.error.cause'), cause), 'errorCause')),
      section({ title: this.l('label.code'), ...this.sectionState(el, 'code', Boolean(read())) },
        this.codeBlock(el, read, (e, v) => { e.config.code = v; }, context, { part: 'Error' })));
  }

  /** Error Boundary Event, Error Start: the Error Code they catch; empty catches every error. */
  errorCodeTab(el, body) {
    const { app } = this;
    const value = String(el.config.errorCode || '');
    const code = textBox({
      value, mono: true, placeholder: this.l('part.error.empty'),
      onInput: v => app.changeElement(el, e => { if (v.trim()) e.config.errorCode = v; else delete e.config.errorCode; }, 'errorCode')
    });
    this.controls.errorCode = code;
    body.append(section({ title: this.l('part.error.code'), ...this.sectionState(el, 'errorCode', true) },
      this.tagged(field(null, code), 'errorCode'),
      value.trim() ? null : this.tagged(note(this.l('part.error.empty') + ' — ' + this.l('part.error.emptyDesc')), 'errorEmpty')));
  }

  /** The Output of a handler: the process data as at the error, and `error`. */
  errorOutputTab(el, body) {
    const context = () => this.ctx(el, { vars: { error: { __bpmError: true } } });
    body.append(
      section({ title: this.l('common.label.mapping'), ...this.sectionState(el, 'mapping', true) }, this.mappingTable(el, 'output', [this.outRoot()], context)),
      this.codeSection(el, 'output', context, { open: Boolean(joinLines((el.config.output || {}).code)) }));
  }
}

export { mappingBlockName };
