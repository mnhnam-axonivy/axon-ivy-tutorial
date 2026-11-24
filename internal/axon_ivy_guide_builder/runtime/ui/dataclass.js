/**
 * The data class of the process, as a second editor tab: its attributes, their types, and the
 * value each one has when a case starts. Read-only; the reader changes the data class in the
 * Designer.
 */
import { h, clear } from '../util.js';
import { icon } from './icons.js';
import { defaultValue } from '../model/ivyscript.js';
import { showValue } from './panel.js';

export class DataClassView {
  constructor(app, root) {
    this.app = app;
    this.root = root;
  }

  render() {
    const { app } = this;
    const t = app.t;
    const cls = app.model.dataClass;
    clear(this.root).append(h('div.dataclass', null,
      h('div.var-path', null, icon('braces', 13), (app.def.dataClassPath || cls.name)),
      h('h4', null, t('dataclass.title', { name: cls.simpleName })),
      h('p.field-note', null, t('dataclass.text')),
      h('table.mapping.dataclass-table', { 'data-tour': 'dataclass' },
        h('thead', null, h('tr', null,
          h('th', null, t('dataclass.attribute')), h('th', null, t('dataclass.type')), h('th', null, t('dataclass.default')), h('th', null, t('dataclass.comment')))),
        h('tbody', null, cls.fields.map(f => h('tr', { 'data-tour': 'attr:' + f.name },
          h('td', null, h('code', null, f.name)),
          h('td', { title: f.type }, String(f.type).split('.').pop()),
          h('td', null, h('code', null, showValue(defaultValue(f.type)))),
          h('td', null, f.comment)))))));
  }
}
