/**
 * The panel below the editor: the Runtime Log, and the process data of the run — where a run
 * becomes visible. While a start with input parameters runs, the parameters of its request
 * (param) are shown above the process data (in).
 */
import { h, clear } from '../util.js';
import { icon } from './icons.js';

const pad = (n, width = 2) => String(n).padStart(width, '0');
const shortType = type => String(type || 'String').split('.').pop();

export function formatTime(date) {
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + ' ' +
    pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds()) + '.' + pad(date.getMilliseconds(), 3);
}

/** A value as the data view shows it: text in quotes, numbers and true/false as they are. */
export function showValue(value) {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'string') return '"' + value + '"';
  if (Array.isArray(value)) return '[' + value.map(showValue).join(', ') + ']';
  return String(value);
}

export class BottomPanel {
  constructor(app, root) {
    this.app = app;
    this.root = root;
    this.logs = [];
    this.data = null;
    this.request = null;
    this.changed = null;
    this.render();
  }

  render() {
    const { app } = this;
    const t = app.t;
    clear(this.root);
    const tabs = [['log', 'list', t('panel.log')], ['data', 'braces', t('panel.data')]];
    this.tabButtons = {};
    this.counter = h('span.panel-count');
    const head = h('div.panel-head', { role: 'tablist' },
      tabs.map(([id, iconName, label]) => {
        const button = h('button.panel-tab', { type: 'button', role: 'tab', 'data-tab': id, onclick: () => app.setPanelTab(id, true) },
          icon(iconName, 13), h('span', null, label), id === 'log' ? this.counter : null);
        this.tabButtons[id] = button;
        return button;
      }),
      h('span.spacer'),
      h('button.icon-btn', { type: 'button', title: t('panel.clear'), 'aria-label': t('panel.clear'), onclick: () => this.clearLog() }, icon('trash', 14)),
      h('button.icon-btn.panel-toggle', { type: 'button', title: t('panel.toggle'), 'aria-label': t('panel.toggle'), onclick: () => app.setPanelOpen(!app.state.panelOpen) }, icon('chevronDown', 14)));
    this.logView = h('div.panel-view.log', { role: 'log', tabIndex: 0 });
    this.dataView = h('div.panel-view.data', { tabIndex: 0 });
    this.root.append(head, h('div.panel-body', null, this.logView, this.dataView));
    this.renderLog();
    this.renderData();
    this.update();
  }

  update() {
    const { panelTab, panelOpen } = this.app.state;
    Object.keys(this.tabButtons).forEach(id => {
      this.tabButtons[id].classList.toggle('active', id === panelTab);
      this.tabButtons[id].setAttribute('aria-selected', String(id === panelTab));
    });
    this.logView.hidden = panelTab !== 'log';
    this.dataView.hidden = panelTab !== 'data';
    this.root.classList.toggle('collapsed', !panelOpen);
    if (panelTab === 'log') this.logView.scrollTop = this.logView.scrollHeight;
  }

  // ── Runtime Log ────────────────────────────────────────────────────────────

  logLine(entry) {
    const line = h('div.log-line', null,
      h('span.log-time', null, formatTime(entry.time)), ' ',
      h('span.log-level.' + entry.level, null, '[' + entry.level + ']'), ' ',
      '[' + entry.project + '] ', entry.category ? '[' + entry.category + '] ' : '',
      h('span.log-ctx', null, '[' + entry.context + ']'), ' ',
      entry.message);
    return entry.detail ? [line, h('div.log-detail', null, entry.detail)] : [line];
  }

  renderLog() {
    clear(this.logView);
    if (!this.logs.length) this.logView.append(h('div.panel-empty', null, this.app.t('log.empty')));
    else this.logs.forEach(entry => this.logView.append(...this.logLine(entry)));
    this.counter.textContent = this.logs.length ? String(this.logs.length) : '';
    this.counter.hidden = !this.logs.length;
  }

  addLog(entry) {
    if (!this.logs.length) clear(this.logView);
    this.logs.push(entry);
    this.logView.append(...this.logLine(entry));
    this.logView.scrollTop = this.logView.scrollHeight;
    this.counter.textContent = String(this.logs.length);
    this.counter.hidden = false;
  }

  clearLog() {
    this.logs = [];
    this.renderLog();
  }

  // ── Process data ───────────────────────────────────────────────────────────

  setData(data, changedField = null) {
    this.data = data;
    this.changed = changedField;
    this.renderData();
  }

  setRequest(request) {
    this.request = request;
    this.renderData();
  }

  renderData() {
    const { app } = this;
    const t = app.t;
    clear(this.dataView);
    if (!this.data) { this.dataView.append(h('div.panel-empty', null, t('data.empty'))); return; }
    const head = h('thead', null, h('tr', null, h('th', null, t('data.field')), h('th', null, t('data.type')), h('th', null, t('data.value'))));
    const valueCell = value => (value === undefined ? h('span.muted', null, t('data.unset')) : h('code.data-value', null, showValue(value)));
    if (this.request && this.request.params.length) {
      this.dataView.append(
        h('div.data-class', null, icon('globe', 13), h('span', null, t('data.param'))),
        h('table.data-table.params', null, head.cloneNode(true),
          h('tbody', null, this.request.params.map(p => h('tr', { 'data-param': p.name },
            h('td', null, h('code', null, 'param.' + p.name)),
            h('td', { title: p.type }, shortType(p.type)),
            h('td', null, valueCell(this.request.param[p.name])))))));
    }
    const dataClass = app.model.dataClass;
    this.dataView.append(
      h('div.data-class', null, icon('braces', 13), h('span', null, t('data.in')), h('span.muted', null, dataClass.name)),
      h('table.data-table', null, head,
        h('tbody', null, dataClass.fields.map(f => h('tr' + (this.changed === f.name ? '.changed' : ''), { 'data-field': f.name },
          h('td', null, h('code', null, 'in.' + f.name), f.comment ? h('div.data-comment', null, f.comment) : null),
          h('td', { title: f.type }, shortType(f.type)),
          h('td', null, valueCell(this.data[f.name])))))));
  }
}
