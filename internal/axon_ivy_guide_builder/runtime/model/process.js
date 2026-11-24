/**
 * Turns an Axon Ivy process file (*.p.json) plus its data class (*.d.json) into the model the
 * simulation works on. The JSON is imported from the guide project at build time, so the
 * simulated process is always the real one a reader can open in the Designer.
 *
 * Element types, shapes and sizes follow the Process Elements Reference of Axon Ivy 14.0.
 *
 * An Embedded Subprocess and a BPMN activity hold elements of their own (process.json,
 * ElementNode.elements): those are elements of the same model with `parent` set to the id of
 * the box they are in. The canvas shows one level at a time (`levelElements`). An Embedded
 * Start and an Embedded End name the connector outside the box they belong to
 * (`parentConnector`).
 */

const ACTIVITY = { w: 112, h: 60 };
const EVENT = { w: 30, h: 30 };
const GATEWAY = { w: 32, h: 32 };
const BOUNDARY = { w: 22, h: 22 };

/** The eight BPMN activities: boxes like an Embedded Subprocess, with a meaning attached. */
export const BPMN_TYPES = ['GenericBpmnElement', 'UserBpmnElement', 'ManualBpmnElement', 'ScriptBpmnElement', 'ReceiveBpmnElement', 'RuleBpmnElement', 'SendBpmnElement', 'ServiceBpmnElement'];

/**
 * type → how the element is drawn (shape), what the runner does with it (kind), and the
 * key of its name in i18n.js (the element names of the official reference).
 */
const TYPES = {
  RequestStart: { kind: 'start', shape: 'event' },
  CallSubStart: { kind: 'start', shape: 'event' },
  SignalStartEvent: { kind: 'start', shape: 'event' },
  ProgramStart: { kind: 'start', shape: 'event' },
  ErrorStartEvent: { kind: 'errorStart', shape: 'event' },
  EmbeddedStart: { kind: 'embeddedStart', shape: 'event' },
  TaskEnd: { kind: 'end', shape: 'event' },
  TaskEndPage: { kind: 'end', shape: 'event' },
  CallSubEnd: { kind: 'end', shape: 'event' },
  ErrorEnd: { kind: 'end', shape: 'event' },
  EmbeddedEnd: { kind: 'end', shape: 'event' },
  ErrorBoundaryEvent: { kind: 'boundary', shape: 'event' },
  Script: { kind: 'script', shape: 'activity' },
  DialogCall: { kind: 'activity', shape: 'activity' },
  UserTask: { kind: 'activity', shape: 'activity' },
  SubProcessCall: { kind: 'call', shape: 'activity' },
  EmbeddedProcess: { kind: 'embedded', shape: 'activity' },
  Alternative: { kind: 'gateway', shape: 'gateway' },
  Split: { kind: 'split', shape: 'gateway' },
  Join: { kind: 'join', shape: 'gateway' },
  ProcessAnnotation: { kind: 'note', shape: 'note' }
};
BPMN_TYPES.forEach(type => { TYPES[type] = { kind: 'embedded', shape: 'activity' }; });

const clone = value => JSON.parse(JSON.stringify(value));
/** Code and texts are stored as one string or as a list of lines; the editor works with LF. */
export const joinLines = value => (Array.isArray(value) ? value.join('\n') : value == null ? '' : String(value).replace(/\r\n/g, '\n'));

/** Blocks of an element that hold IvyScript code: Start/Output/Process/Result tabs, and the Error End's own. */
const CODE_BLOCKS = ['input', 'output', 'call', 'result'];

function toElement(raw, colors, { attachedTo = null, parent = null } = {}) {
  const def = TYPES[raw.type] || { kind: 'activity', shape: 'activity' };
  const visual = raw.visual || {};
  const at = visual.at || { x: 0, y: 0 };
  const base = def.kind === 'boundary' ? BOUNDARY : def.shape === 'event' ? EVENT : def.shape === 'gateway' ? GATEWAY : ACTIVITY;
  const size = visual.size || {};
  const config = clone(raw.config || {});
  CODE_BLOCKS.forEach(key => { if (config[key] && config[key].code !== undefined) config[key].code = joinLines(config[key].code); });
  if (config.code !== undefined) config.code = joinLines(config.code);
  const outgoing = (raw.connect || []).map(c => ({ id: c.id, to: c.to, via: c.via ? clone(c.via) : null, var: c.var || null, outVar: c.outVar || null, label: c.label && c.label.name ? joinLines(c.label.name) : '' }));
  // older files keep the condition of an Alternative on its connector; 14.0 keeps them in config.conditions
  if (raw.type === 'Alternative' && !config.conditions && (raw.connect || []).some(c => c.condition !== undefined)) {
    config.conditions = {};
    (raw.connect || []).forEach(c => { if (c.condition !== undefined) config.conditions[c.id] = c.condition; });
  }
  return {
    id: raw.id,
    attachedTo,
    parent,
    parentConnector: raw.parentConnector || null,
    labelOffset: visual.labelOffset || null,
    type: raw.type,
    kind: def.kind,
    shape: def.shape,
    typeLabel: 'element.' + raw.type,
    name: joinLines(raw.name),
    description: joinLines(visual.description), // the description is part of the visual (process.json, VisualNodeShape)
    tags: (raw.tags || []).slice(),
    x: at.x,
    y: at.y,
    w: size.width || base.w,
    h: size.height || base.h,
    colorName: visual.color || null,
    color: visual.color ? (colors[visual.color] || null) : null,
    config,
    outgoing,
    removed: false
  };
}

/** A data class file (*.d.json) as { name, simpleName, fields: [{ name, type, comment }] }. */
export function toClass(json) {
  return {
    name: (json.namespace ? json.namespace + '.' : '') + json.simpleName,
    simpleName: json.simpleName,
    // a field without a type is a String (data-class.json)
    fields: (json.fields || []).map(f => ({ name: f.name, type: f.type || 'String', comment: f.comment || '' }))
  };
}

/** The elements of a list, and of the boxes in it, flat; boundary events become elements of their own. */
function collect(list, colors, parent, into) {
  (list || []).forEach(raw => {
    into.push(toElement(raw, colors, { parent }));
    (raw.boundaries || []).forEach(boundary => {
      const element = toElement(boundary, colors, { attachedTo: raw.id, parent });
      element.labelAbove = element.y < ((raw.visual || {}).at || { y: 0 }).y;
      into.push(element);
    });
    if (raw.elements) collect(raw.elements, colors, raw.id, into);
  });
}

/**
 * @param {Object} processJson   contents of a *.p.json
 * @param {Object} dataClassJson contents of its *.d.json
 * @param {{ file?: string, path?: string, project?: string, classes?: Object[] }} [meta]
 */
export function loadProcess(processJson, dataClassJson, meta = {}) {
  const colors = (processJson.layout && processJson.layout.colors) || {};
  const elements = [];
  collect(processJson.elements, colors, null, elements);
  const dataClass = toClass(dataClassJson);
  const classes = {};
  (meta.classes || []).forEach(json => {
    const cls = toClass(json);
    classes[cls.name] = cls;
  });
  // the process data class itself, so that in1, out1, … can be read like any object of a data class
  classes[dataClass.name] = dataClass;
  const config = processJson.config || {};
  const kind = processJson.kind || 'NORMAL';
  const path = meta.path || '';
  const model = {
    id: processJson.id,
    kind,
    // the process itself, as its own inscription shows it: the display name is the file's name
    name: String(meta.file || '').replace(/.p.json$/, ''),
    description: joinLines(processJson.description),
    dataClassName: config.data || dataClass.name,
    // "Per default this is allowed for all business processes but not for the User Dialog Logic processes" (Process)
    viewAllowed: config.permissions && config.permissions.view && config.permissions.view.allowed !== undefined
      ? Boolean(config.permissions.view.allowed) : kind !== 'HTML_DIALOG',
    wsTypeName: config.wsTypeName || '',
    wsAuth: config.wsAuth || 'NONE',
    file: meta.file || '',
    path,
    // how a Call Sub names this process: its path below the process folder, without .p.json
    ref: path.replace(/^(.*\/)?processe?s?\//, '').replace(/\.p\.json$/, ''),
    project: meta.project || '',
    dataClass,
    classes,
    elements,
    colors
  };
  model.original = snapshot(model);
  return model;
}

/**
 * Editable state of every element, of the process itself and of its data class — used for
 * "reset" and for change detection.
 */
export function snapshot(model) {
  const elements = clone(model.elements.map(e => ({ id: e.id, type: e.type, kind: e.kind, typeLabel: e.typeLabel, parent: e.parent, name: e.name, description: e.description, tags: e.tags, x: e.x, y: e.y, config: e.config, removed: e.removed })));
  elements.process = { description: model.description, fields: clone(model.dataClass.fields) };
  return elements;
}

export function restore(model, snap) {
  if (snap.process) {
    model.description = snap.process.description;
    model.dataClass.fields = clone(snap.process.fields);
  }
  snap.forEach(s => {
    const el = elementById(model, s.id);
    if (!el) return;
    if (s.type) { el.type = s.type; el.kind = s.kind; el.typeLabel = s.typeLabel; }
    if (s.parent !== undefined) el.parent = s.parent;
    el.name = s.name;
    el.description = s.description;
    el.tags = (s.tags || []).slice();
    el.x = s.x;
    el.y = s.y;
    el.config = clone(s.config);
    el.removed = s.removed;
  });
}

export function elementById(model, id) {
  return model.elements.find(e => e.id === id) || null;
}

/** The elements of one level of a process: the top (null) or the inside of a box. */
export function levelElements(model, level = null) {
  return model.elements.filter(e => (e.parent || null) === (level || null));
}

/** A view of one level that the canvas, hit tests and layout use like a process model. */
export function levelView(model, level = null) {
  return { id: model.id, elements: levelElements(model, level), level, process: model };
}

/** The boxes from the top down to a level: [] for the top, [outer, …, the box] inside. */
export function levelPath(model, level) {
  const path = [];
  for (let box = level ? elementById(model, level) : null; box; box = box.parent ? elementById(model, box.parent) : null) path.unshift(box);
  return path;
}

/** The first start of a process: a Request Start or a Sub Process Start, not an Error Start. */
export function startElement(model) {
  return model.elements.find(e => e.kind === 'start' && !e.parent) || null;
}

export function originalOf(model, id) {
  return model.original.find(s => s.id === id) || null;
}

/** All connectors as { id, from, to, via } with resolved elements. */
export function connectors(model) {
  const list = [];
  model.elements.forEach(from => {
    from.outgoing.forEach(c => {
      const to = elementById(model, c.to);
      if (to) list.push({ id: c.id, from, to, via: c.via, label: c.label || '' });
    });
  });
  return list;
}

/** The connector with this id, with the element it leaves and the one it reaches. */
export function connectorById(model, id) {
  for (const from of model.elements) {
    const c = from.outgoing.find(o => o.id === id);
    if (c) return { ...c, from, toElement: elementById(model, c.to) };
  }
  return null;
}

/** The connectors that reach an element: [{ id, from, var, … }]. */
export function incoming(model, element) {
  const list = [];
  model.elements.forEach(from => from.outgoing.forEach(c => { if (c.to === element.id) list.push({ ...c, from }); }));
  return list;
}

/** The element reached through the first outgoing connector. */
export function nextOf(model, element) {
  const out = element.outgoing[0];
  return out ? { connectorId: out.id, element: elementById(model, out.to) } : null;
}

/** Error Boundary Events attached to an element. */
export function boundariesOf(model, element) {
  return model.elements.filter(e => e.attachedTo === element.id && e.type === 'ErrorBoundaryEvent');
}

/**
 * The exits of an Alternative in the order the engine tries them: those listed in
 * config.conditions in their order, then the exits that are not listed, in the order of the
 * connectors. An empty condition holds (engine 14.0.1). [{ id, to, condition, listed }]
 */
export function orderedConditions(element) {
  const conditions = element.config.conditions || {};
  const exits = new Map(element.outgoing.map(c => [c.id, c]));
  const list = [];
  Object.keys(conditions).forEach(id => {
    const c = exits.get(id);
    if (c) list.push({ id, to: c.to, condition: String(conditions[id] == null ? '' : conditions[id]), listed: true });
  });
  element.outgoing.forEach(c => {
    if (!(c.id in conditions)) list.push({ id: c.id, to: c.to, condition: '', listed: false });
  });
  return list;
}

/**
 * The block of an element's config that holds a mapping row (or code): a start's `input`, a
 * Sub Process Start's `result` for result.*, a Call Sub's `call` for param.*, else `output`.
 */
export function mappingBlockName(el, target = '') {
  const root = String(target).split('.')[0];
  if (el.type === 'CallSubStart') return root === 'result' ? 'result' : 'input';
  if (el.type === 'RequestStart') return 'input';
  if (el.type === 'SubProcessCall' && root === 'param') return 'call';
  return 'output';
}

// ── the Start element: signature and parameters ─────────────────────────────

/** The input parameters of a start: [{ name, type, desc }]. */
export function startParams(el) {
  return ((el.config.input || {}).params || []).map(p => ({ name: p.name, type: p.type || 'String', desc: p.desc || '' }));
}

/** The result parameters of a Sub Process Start: [{ name, type, desc }]. */
export function resultParams(el) {
  return ((el.config.result || {}).params || []).map(p => ({ name: p.name, type: p.type || 'String', desc: p.desc || '' }));
}

/**
 * The signature as the Designer shows it: name(Type1,Type2). Namespaces of the types are
 * hidden, but stay part of the signature (Common Tabs, Start Tab).
 */
export function signatureText(el) {
  const name = el.config.signature || '';
  const types = startParams(el).map(p => String(p.type).split('.').pop());
  return name + '(' + types.join(',') + ')';
}

/** The link a Request Start is called by: the signature name with ".ivp" (Start, Request Tab). */
export function startLink(el) {
  return (el.config.signature || 'start') + '.ivp';
}

/**
 * The process and the start a Call Sub calls: "tutorial/part3/Price:price(Number)" → the model
 * whose `ref` is the part before the colon, and its Sub Process Start with that signature.
 */
export function resolveCall(models, processCall) {
  const call = String(processCall || '');
  const colon = call.lastIndexOf(':');
  if (colon < 0) return null;
  const ref = call.slice(0, colon);
  // the types may be written in full (ch.ivyteam.ivy.workflow.ICase); the signature shows the short names
  const signature = call.slice(colon + 1).replace(/\s+/g, '').replace(/[\w.]+\.(\w+)(?=[,)<>])/g, '$1');
  const model = models.find(m => m.ref === ref);
  if (!model) return null;
  const start = model.elements.find(e => e.type === 'CallSubStart' && signatureText(e) === signature);
  return start ? { model, start } : null;
}
