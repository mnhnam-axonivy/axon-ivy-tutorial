/**
 * Executes a process model the way the Axon Ivy 14.0 engine runs the elements the guide
 * simulates. A run moves tokens: one from the start, several after a Split, one again after
 * the Join. A Call Sub runs its sub process with data of its own, an Embedded Subprocess (or
 * a BPMN activity) runs the elements inside it with the same data. What the documentation
 * says, and where it says it:
 *
 *   Start (Request Start)   the request brings the input parameters as fields of `param`; the
 *                           Mapping section assigns them to the process data, then the Code
 *                           section runs with the same `param` (Common Tabs → Start Tab).
 *   Script Step             the Output mapping runs first, then the code ("The entered code will
 *                           be executed after the execution of the output tab", Script Step).
 *   Process End             "terminates the current process".
 *   Process End Page        "terminates the current process and displays a dialog page".
 *   Alternative             "The conditions are evaluated from the top to the bottom and the exit
 *                           of the first one that evaluates to true is chosen" (Alternative).
 *   Split                   "may split one process path into a number of paths that are executed
 *                           concurrently"; "For each outgoing connection you have a separate outX
 *                           object" (Split).
 *   Join                    "waits until all of the parallel incoming process paths have finished
 *                           and reached this element"; "a separate inX object" per incoming
 *                           connection (Join).
 *   Call Sub                "like jumping from the main process into the called sub process,
 *                           execute the sub process and afterwards jump back"; "The variable
 *                           result contains the output parameters" (Call Sub). The Result tab of
 *                           the Sub Process Start: "All logic in this tab will be executed when
 *                           the end element is reached" (Common Tabs).
 *   Embedded Subprocess     "folds a part of a process into a box"; BPMN activities "behave
 *                           similar to a Embedded Subprocess" (BPMN Activities).
 *   Errors                  caught by an Error Boundary Event on the activity, then an Error
 *                           Start on the same level "if the error was not thrown by an Error End
 *                           Event", then the next higher level; "Each process - including the
 *                           embedded subprocess - is a separate process level"; an empty Error
 *                           Code catches every error; codes are refined with ":" and "*"
 *                           (Error Handling).
 *
 * Not stated in the documentation, and simulated as the engine 14.0.1 does it (probe processes
 * run on the Designer's engine, 2026-11-16; PROGRESS.md, "Verified on the engine"):
 *   - a mapping's first row `out` ← `in` makes `out` the same data as `in`; without it `out`
 *     starts empty. The Designer writes that row into every mapping it saves (Join: out ← in1,
 *     Split: out1 ← in only). The rows run in order, then the code;
 *   - an Alternative tries config.conditions in their order, then the exits not listed there;
 *     an empty condition holds; when none holds the request fails with IllegalStateException;
 *   - the paths of a Split take turns, one element each, the second path first;
 *   - a Join reached by fewer paths than it has keeps the token: nothing after it runs;
 *   - an empty Embedded Subprocess or BPMN activity keeps the token;
 *   - a script that fails, or an error nobody catches, ends the request: the Runtime Log has
 *     "Problem while processing request '…'" (category REQUEST) with the error and its cause;
 *   - a parameter whose text is not a number is logged and arrives as nothing (0).
 *
 * The runner has no DOM or animation knowledge: everything visible goes through `io`, whose
 * async methods let the UI pace the run.
 */
import { runScript, evalExpression, evalCondition, assignTo, IvyScriptError, positionOf, defaultValue, javaClassOf } from './ivyscript.js';
import {
  startElement, elementById, startParams, resultParams, startLink, joinLines, levelElements, boundariesOf,
  incoming, orderedConditions, resolveCall
} from './process.js';

class Cancelled extends Error {}

/** A failure the process cannot catch: the request ends (a condition-less Alternative, a missing process). */
class ProcessFailure extends Error {
  constructor(element, info) {
    super(info.message);
    this.element = element;
    this.info = info;
  }
}

/**
 * A BPM error on its way to a handler: thrown by an Error End, by BpmError…throwError() in a
 * script, or for a script that failed (ivy:error:script).
 */
class BpmFailure extends Error {
  constructor({ code, element, model, levelKey, fromErrorEnd = false, info, technicalCause = null }) {
    super(code);
    Object.assign(this, { code, element, model, levelKey, fromErrorEnd, info, technicalCause });
  }
}

/** The run went on too long: the simulation stops what the engine would not (an endless loop). */
class TooLong extends Error {}

const noop = () => {};
const IO_METHODS = ['travel', 'enter', 'leave', 'pause', 'log', 'note', 'data', 'request', 'mapped', 'page', 'descend', 'ascend', 'caught'];
const STEP_LIMIT = 400;
const clone = value => JSON.parse(JSON.stringify(value));

/** Whether a parameter of this type is a number. */
export const numericParam = type => /^(Number|Integer|Long|Double|Float|Short|BigDecimal)$/.test(String(type || 'String').split('.').pop());

/** A value of a request parameter, as text in the URL, turned into the parameter's type. */
export function paramValue(type, raw) {
  if (raw === undefined || raw === null) return null;
  const simple = String(type || 'String').split('.').pop();
  if (numericParam(type)) {
    if (typeof raw === 'number') return raw;
    const n = Number(String(raw).trim());
    return String(raw).trim() === '' || Number.isNaN(n) ? null : n;
  }
  if (simple === 'Boolean') return raw === true || String(raw).toLowerCase() === 'true';
  return String(raw);
}

/** The query string of a start link: name=value&… with the values URL-encoded. */
export function queryString(params, values) {
  return params.filter(p => values[p.name] !== undefined && values[p.name] !== null)
    .map(p => encodeURIComponent(p.name) + '=' + encodeURIComponent(String(values[p.name]))).join('&');
}

/**
 * Whether an Error Code pattern catches a code: an empty pattern catches every error; the
 * parts between ":" have to match, "*" matches any part, and missing parts at the end are
 * wildcards ("booking" catches "booking:failed"; "custom:error" is "custom:error:*").
 */
export function errorCodeMatches(pattern, code) {
  const p = String(pattern || '').trim();
  if (!p) return true;
  const want = p.split(':');
  const have = String(code || '').split(':');
  return want.every((part, i) => part === '*' || (i < have.length && part === have[i]));
}

/** The `error` variable a handler gets: a BpmError with its code and technical cause. */
function errorObject(failure) {
  return { __bpmError: true, errorCode: failure.code, technicalCause: failure.technicalCause, message: failure.code, attributes: {} };
}

/** The elements a mapping produces, and what they start as when the mapping has no row for them. */
const OUT = [{ name: 'out' }];

export class ProcessRunner {
  /**
   * @param {Object} options
   * @param {Object} options.model    process model (see process.js): the one that is started
   * @param {Object[]} [options.models] every process model a Call Sub may reach (with the first)
   * @param {Object} [options.io]     presentation callbacks, all optional
   * @param {() => Date} [options.now]
   */
  constructor({ model, models = null, io = {}, now = () => new Date() }) {
    this.model = model;
    this.models = models || [model];
    this.now = now;
    this.io = {};
    IO_METHODS.forEach(m => { this.io[m] = typeof io[m] === 'function' ? io[m].bind(io) : noop; });
    this.active = null;
  }

  get running() { return this.active !== null; }

  cancel() {
    if (this.active) this.active.cancelled = true;
  }

  setStepMode(stepMode) {
    if (this.active) this.active.stepMode = stepMode;
  }

  /**
   * @param {Object} options
   * @param {Object} [options.params]   values of the start's input parameters, as a request
   *                                     would bring them (text, or already typed)
   * @param {boolean} [options.stepMode] pause after every element
   * @param {Set<string>} [options.breakpoints]
   * @param {string} [options.start]     id of the start element (default: the first)
   * @returns {Promise<Object>} what happened: status, visited, logs, data, …
   */
  async run({ params = {}, stepMode = false, breakpoints = new Set(), start = null, stepLimit = STEP_LIMIT } = {}) {
    if (this.active) throw new Error('A run is already in progress');
    const run = {
      cancelled: false,
      stepMode,
      breakpoints,
      params,
      steps: 0,
      stepLimit,
      assigned: new WeakMap(), // per data object: the attributes a value was assigned to (`is initialized`)
      result: { status: 'completed', visited: [], routes: [], logs: [], mapped: [], data: null, request: null }
    };
    this.active = run;
    const data = this.#fresh(this.model);
    try {
      const first = (start && elementById(this.model, start)) || startElement(this.model);
      const outcome = await this.#flow(run, { model: this.model, level: null, top: true }, [{ element: first, via: null, data }]);
      this.#settle(run, outcome);
      run.result.data = { ...(outcome.token ? outcome.token.data : data) };
    } catch (e) {
      if (e instanceof Cancelled) run.result.status = 'cancelled';
      else if (e instanceof TooLong) {
        run.result.status = 'stopped';
        run.result.stoppedAt = e.message;
        run.result.stopReason = 'loop';
        this.io.note('loop', { element: elementById(this.model, e.message), count: run.stepLimit });
      } else if (e instanceof BpmFailure || e instanceof ProcessFailure) this.#fail(run, e);
      else {
        this.active = null;
        throw e;
      }
      if (!run.result.data) run.result.data = { ...(run.lastData || data) };
    }
    this.active = null;
    return run.result;
  }

  // ── the flow of tokens ─────────────────────────────────────────────────────

  /**
   * Moves the tokens of one level until one leaves it (a Sub Process End, an Embedded End) or
   * none is left. Tokens take turns, one element each. Returns { exit, token } or, when the
   * tokens are gone, { exit: null, waiting } with the Join or the box that kept the last one.
   */
  async #flow(run, flow, tokens) {
    const queue = tokens.slice();
    flow.joins = new Map();
    let finished = null;
    let kept = null;
    while (queue.length) {
      const token = queue.shift();
      const step = await this.#step(run, flow, token);
      if (step.exit) {
        if (!flow.top || step.exit.type !== 'TaskEnd' && step.exit.type !== 'TaskEndPage') return { exit: step.exit, token: step.token };
        finished = { exit: step.exit, token: step.token };
        continue;
      }
      if (step.kept) kept = step.kept;
      queue.push(...step.next);
    }
    if (finished) return finished;
    const waiting = [...flow.joins.keys()].map(id => elementById(flow.model, id)).find(Boolean) || kept;
    return { exit: null, waiting, token: null };
  }

  /** One element: travel to it, enter it, run it, leave it. Errors go to their handler here. */
  async #step(run, flow, token) {
    const el = token.element;
    if (!el || el.removed) {
      run.result.status = 'incomplete';
      run.result.missing = el ? el.id : null;
      this.io.note('incomplete', { element: el });
      return { next: [] };
    }
    if (++run.steps > run.stepLimit) throw new TooLong(el.id);
    if (token.via) await this.#wait(run, this.io.travel({ id: token.via.id, from: token.via.from, to: el, model: flow.model }));
    if (run.breakpoints.has(el.id) && !token.stepped) await this.#wait(run, this.io.pause(el, 'breakpoint'));
    await this.#wait(run, this.io.enter(el, { model: flow.model, level: flow.level, data: token.data }));
    run.result.visited.push(flow.model === this.model ? el.id : flow.model.ref + ':' + el.id);
    run.lastData = token.data;
    let result;
    try {
      result = await this.#execute(run, flow, token);
    } catch (e) {
      if (e instanceof Cancelled || e instanceof TooLong || e instanceof ProcessFailure) {
        if (e instanceof ProcessFailure) this.io.leave(el, 'error');
        throw e;
      }
      const failure = e instanceof BpmFailure ? e : null;
      if (!failure) throw e;
      this.io.leave(el, 'error');
      const handled = this.#handler(flow, el, failure);
      if (!handled) throw failure;
      this.io.caught(handled, { code: failure.code, from: el });
      return { next: [{ element: handled, via: null, data: token.data, error: failure }] };
    }
    if (result.exit) {
      await this.#wait(run, this.io.leave(el, 'done'));
      return result;
    }
    await this.#wait(run, this.io.leave(el, 'done'));
    if (run.stepMode && result.next.length === 1 && result.next[0].element && !result.next[0].element.removed) {
      await this.#wait(run, this.io.pause(result.next[0].element, 'step'));
      result.next[0].stepped = true;
    }
    return result;
  }

  /** The token leaves `el` by its first connector (or the one given). */
  #onward(flow, el, data, connector = el.outgoing[0]) {
    if (!connector) return [];
    return [{ element: elementById(flow.model, connector.to), via: { id: connector.id, from: el }, data }];
  }

  async #execute(run, flow, token) {
    const el = token.element;
    const model = flow.model;
    switch (el.kind) {
      case 'start':
        if (el.type === 'CallSubStart') {
          await this.#subStart(run, flow, token);
        } else {
          await this.#start(run, flow, token);
        }
        return { next: this.#onward(flow, el, token.data) };
      case 'script': {
        this.io.note('script', { element: el });
        const { out } = await this.#mapping(run, flow, el, el.config.output, 'Output', { in: token.data });
        return { next: this.#onward(flow, el, out) };
      }
      case 'gateway': {
        const route = this.#route(run, flow, el, token.data);
        return { next: [{ element: route.element, via: { id: route.connectorId, from: el }, data: token.data }] };
      }
      case 'split':
        return { next: await this.#split(run, flow, el, token.data) };
      case 'join':
        return { next: await this.#join(run, flow, el, token) };
      case 'call':
        return { next: await this.#call(run, flow, el, token) };
      case 'embedded':
        return this.#embedded(run, flow, el, token);
      case 'boundary':
      case 'errorStart': {
        // a handler: its Output with `error`, then on along its connector
        this.io.note('caught', { element: el, condition: token.error ? token.error.code : '' });
        const vars = { error: errorObject(token.error || { code: '' }) };
        const { out } = await this.#mapping(run, flow, el, el.config.output, 'Output', { in: token.data, vars });
        return { next: this.#onward(flow, el, out) };
      }
      case 'embeddedStart':
        return { next: this.#onward(flow, el, token.data) };
      case 'end':
        return this.#end(run, flow, el, token);
      default:
        this.io.note('passthrough', { element: el });
        return { next: this.#onward(flow, el, token.data) };
    }
  }

  async #end(run, flow, el, token) {
    if (el.type === 'ErrorEnd') {
      // the Error End's code runs first, with `error` the BpmError it is about to throw (engine 14.0.1)
      const code = String(((el.config.throws || {}).error) || '');
      const failure = new BpmFailure({ code, element: el, model: flow.model, levelKey: this.#levelKey(flow), fromErrorEnd: true, info: { kind: 'bpm', code, message: code } });
      const script = joinLines(el.config.code);
      if (script.trim()) {
        try {
          runScript(script, this.#context(run, flow, el, token.data, { vars: { error: errorObject(failure) } }));
        } catch (e) {
          if (!(e instanceof IvyScriptError)) throw e;
          throw this.#scriptFailure(run, flow, el, e, script, 'Error', null);
        }
      }
      this.io.note('error-end', { element: el, condition: code });
      throw failure;
    }
    if (el.type === 'TaskEndPage') {
      this.io.note('end-page', { element: el });
      await this.#wait(run, this.io.page(el, el.config.page || ''));
    } else if (el.type === 'TaskEnd') this.io.note('end', { element: el });
    return { exit: el, token };
  }

  // ── helpers ────────────────────────────────────────────────────────────────

  /** Process data as a new case has it: every attribute at the default of its type. */
  #fresh(model) {
    const data = {};
    model.dataClass.fields.forEach(f => { data[f.name] = defaultValue(f.type); });
    return data;
  }

  /** An object of the process data class, for in1, out2, …: readable like any data class object. */
  #typed(model, data) {
    return Object.assign(data, { __type: model.dataClass.name });
  }

  #assignedOf(run, data) {
    if (!run.assigned.has(data)) run.assigned.set(data, new Set());
    return run.assigned.get(data);
  }

  #levelKey(flow) {
    return flow.model.id + '/' + (flow.level || '');
  }

  async #wait(run, value) {
    const v = await value;
    if (run.cancelled) throw new Cancelled();
    return v;
  }

  #log(run, level, element, message, { category = 'USER', detail = '', model = this.model } = {}) {
    const entry = {
      time: this.now(),
      level,
      project: model.project || this.model.project,
      category,
      context: element ? model.id + '-' + element.id : model.id,
      message,
      detail
    };
    run.result.logs.push(entry);
    this.io.log(entry);
  }

  /** What a script or an expression of `el` may use: `in`/`out` (data), plus variables. */
  #context(run, flow, el, data, { inData = null, vars = {}, varTypes, noIn = false, noOut = false } = {}) {
    const model = flow.model;
    return {
      data,
      inData,
      fields: model.dataClass.fields,
      dataClassName: model.dataClass.name,
      classes: model.classes,
      vars,
      varTypes,
      noIn,
      noOut,
      assigned: this.#assignedOf(run, data),
      log: (level, message) => this.#log(run, level, el, message, { model }),
      onAssign: (field, value) => this.io.data(field, value, el, data)
    };
  }

  /**
   * A script error at an element: a BPM error with the code ivy:error:script (or the code a
   * script threw with BpmError…throwError()). `info` carries the message as the Designer words
   * it in its Problems view ("Output 'out.total': …", "Output code: …") for the caption.
   */
  #scriptFailure(run, flow, element, e, source, part, target) {
    const at = positionOf(source, e.pos);
    if (e.kind === 'bpm') {
      return new BpmFailure({ code: e.bpmCode, element, model: flow.model, levelKey: this.#levelKey(flow), info: { kind: 'bpm', code: e.bpmCode, message: e.bpmCode, line: at.line } });
    }
    // "Output 'out.total': …", "Output code: …", "Condition #1: …" (the Designer's Problems view)
    const label = target ? part + " '" + target + "'" : /^Condition #/.test(part) ? part : part + ' code';
    const message = label + ': ' + e.message + (source.includes('\n') ? ' (line ' + at.line + ')' : '');
    const cause = javaClassOf(e).split('.').pop() + ': ' + e.message;
    return new BpmFailure({
      code: 'ivy:error:script', element, model: flow.model, levelKey: this.#levelKey(flow),
      technicalCause: javaClassOf(e) + ': ' + e.message,
      info: { kind: 'script', message, cause, line: at.line, target: target || 'code' }
    });
  }

  /** An error nobody caught: the request fails, with the engine's Runtime Log line. */
  #fail(run, e) {
    const element = e.element || null;
    const model = e.model || this.model;
    const link = run.result.request ? run.result.request.link : '';
    const line = "Problem while processing request '…/" + this.model.id + '/' + link + "'";
    let detail;
    if (e instanceof ProcessFailure) detail = e.info.cause ? 'Caused by: ' + e.info.cause : '';
    else if (e.code === 'ivy:error:script' && e.info && e.info.cause) detail = 'ivy:error:script — Caused by: ' + e.info.cause;
    else detail = e.code + ' — Caused by: BpmError ' + e.code;
    this.#log(run, 'error', element, line, { category: 'REQUEST', detail, model });
    run.result.status = 'failed';
    run.result.failedAt = element ? element.id : null;
    run.result.failedIn = model === this.model ? null : model.ref;
    run.result.error = e instanceof ProcessFailure ? e.info : { ...(e.info || {}), code: e.code };
    if (!(e instanceof ProcessFailure) && e.code !== 'ivy:error:script') this.io.note('error-uncaught', { element, condition: e.code });
  }

  #settle(run, outcome) {
    if (outcome.exit || run.result.status !== 'completed') return;
    // no token left: one waits at a Join, or went into an empty box
    if (outcome.waiting) {
      run.result.status = 'stopped';
      run.result.stoppedAt = outcome.waiting.id;
      run.result.stopReason = outcome.waiting.type === 'Join' ? 'join' : 'empty';
      this.io.note(outcome.waiting.type === 'Join' ? 'join-waits' : 'empty-box', { element: outcome.waiting });
    }
  }

  /**
   * The handler of an error at `el` on this level, or null: an Error Boundary Event on `el`
   * whose code matches, then an Error Start of this level — neither for an Error End that
   * threw on this level ("can't be caught on the same process level").
   */
  #handler(flow, el, failure) {
    const sameLevel = failure.fromErrorEnd && failure.levelKey === this.#levelKey(flow);
    if (sameLevel) return null;
    const boundary = boundariesOf(flow.model, el).find(b => errorCodeMatches(b.config.errorCode, failure.code));
    if (boundary) return boundary;
    return levelElements(flow.model, flow.level).find(e => e.type === 'ErrorStartEvent' && errorCodeMatches(e.config.errorCode, failure.code)) || null;
  }

  // ── mapping and code ───────────────────────────────────────────────────────

  /**
   * A mapping table and its code. `roots` are the variables it fills (out; out1, out2 of a
   * Split; param of a Call Sub; result of a Sub Process Start), each starting as its row says
   * (out ← in: the same data) or, without a row, as new data. Then the other rows, top to
   * bottom, then the code with the same variables. Between rows and code the walkthrough can
   * step in ('mapped:<id>'). Returns the roots.
   */
  async #mapping(run, flow, el, block = {}, part, { in: inData = null, vars = {}, varTypes, noIn = false, noOut = false, roots = OUT, defaults = { out: 'in' } } = {}) {
    const given = block && block.map;
    const map = given || { ...defaults };
    const rootNames = roots.map(r => r.name);
    // the variables a row may read: in, the extra ones, and the roots as they fill
    const values = {};
    const probe = this.#context(run, flow, el, inData || {}, { vars: { ...vars }, varTypes, noIn, noOut: true });
    for (const root of roots) {
      const source = map[root.name];
      if (source !== undefined && String(source).trim() !== '') {
        try {
          const value = evalExpression(String(source), probe);
          values[root.name] = root.copy ? this.#typed(flow.model, clone(stripType(value))) : value;
        } catch (e) {
          if (!(e instanceof IvyScriptError)) throw e;
          throw this.#scriptFailure(run, flow, el, e, String(source), part, root.name);
        }
      } else values[root.name] = root.fresh ? root.fresh() : this.#fresh(flow.model);
    }
    const out = rootNames.includes('out') ? values.out : null;
    const rootVars = {};
    rootNames.filter(n => n !== 'out').forEach(n => { rootVars[n] = values[n]; });
    const ctx = this.#context(run, flow, el, out || inData || {}, {
      inData: out && inData && out !== inData ? inData : null,
      vars: { ...vars, ...rootVars }, varTypes, noIn, noOut: noOut || !out
    });
    if (!out && !noIn && inData) ctx.data = inData;
    const rows = Object.keys(map).filter(target => !rootNames.includes(target) && String(map[target]).trim() !== '');
    const assigned = rows.map(target => {
      const source = String(map[target]);
      let value;
      try {
        value = evalExpression(source, ctx);
        assignTo(target, value, ctx);
      } catch (e) {
        if (!(e instanceof IvyScriptError)) throw e;
        throw this.#scriptFailure(run, flow, el, e, source, part, target);
      }
      return { target, source, value };
    });
    run.result.mapped.push({ elementId: el.id, rows: assigned });
    await this.#wait(run, this.io.mapped(el, assigned));
    const code = joinLines((block || {}).code);
    if (code.trim()) {
      try {
        runScript(code, ctx);
      } catch (e) {
        if (!(e instanceof IvyScriptError)) throw e;
        throw this.#scriptFailure(run, flow, el, e, code, part);
      }
    }
    return values;
  }

  /**
   * Request Start: the parameters arrive with the request, the mapping assigns them to new
   * process data, the code runs. A parameter that is not mapped is gone after the start.
   */
  async #start(run, flow, token) {
    const el = token.element;
    const params = startParams(el);
    const param = {};
    params.forEach(p => {
      const raw = run.params[p.name];
      param[p.name] = paramValue(p.type, raw);
      if (numericParam(p.type) && param[p.name] === null && raw !== undefined && raw !== null && String(raw).trim() !== '') {
        this.#log(run, 'error', el, "ParameterMapToObjectFiller: Could not convert string '" + raw + "' to a Number.", { category: 'PROCESS', model: flow.model });
      }
    });
    const query = queryString(params, run.params);
    const link = startLink(el) + (query ? '?' + query : '');
    run.result.request = { link, param };
    this.io.request(el, { link, param, params, data: token.data });
    this.io.note('start', { element: el });
    // in the mapping and the code of a Start there is `param` and `out`, but no `in` (Designer 14.0.1)
    const fresh = token.data;
    await this.#mapping(run, flow, el, el.config.input, 'Start', { vars: { param }, varTypes: { param: params }, noIn: true, roots: [{ name: 'out', fresh: () => fresh }], defaults: {} });
  }

  /** Sub Process Start: `param` from the Call Sub, mapped into the sub process's own new data. */
  async #subStart(run, flow, token) {
    const el = token.element;
    const fresh = token.data;
    this.io.note('sub-start', { element: el });
    await this.#mapping(run, flow, el, el.config.input, 'Start', { vars: { param: token.param || {} }, varTypes: { param: startParams(el) }, noIn: true, roots: [{ name: 'out', fresh: () => fresh }], defaults: {} });
  }

  /**
   * Alternative: the conditions in their order (config.conditions, then the exits not listed);
   * the first that holds decides, an empty one always holds. When none holds the request fails.
   */
  #route(run, flow, element, data) {
    const ctx = this.#context(run, flow, element, data, { noOut: true });
    const exits = orderedConditions(element);
    for (let i = 0; i < exits.length; i++) {
      const exit = exits[i];
      const condition = exit.condition.trim();
      let holds = true;
      if (condition !== '') {
        try {
          holds = evalCondition(condition, ctx) === true;
        } catch (e) {
          if (!(e instanceof IvyScriptError)) throw e;
          throw this.#scriptFailure(run, flow, element, e, condition, 'Condition #' + (i + 1), null);
        }
      }
      if (!holds) continue;
      const target = elementById(flow.model, exit.to);
      run.result.routes.push({ gateway: element.id, connectorId: exit.id, condition, to: exit.to });
      this.io.note(condition ? 'gateway' : 'gateway-default', { element, condition, target });
      return { connectorId: exit.id, element: target };
    }
    throw new ProcessFailure(element, {
      kind: 'gateway', model: flow.model,
      message: 'In the alternative all conditions evaluate to false',
      cause: 'java.lang.IllegalStateException: In the alternative all conditions evaluate to false'
    });
  }

  /**
   * Split: one token per outgoing connector, each with data of its own (outX). The Output
   * mapping fills them; without a row an outX starts empty (the default maps only out1 ← in).
   * The paths take turns, the second first (engine 14.0.1).
   */
  async #split(run, flow, el, data) {
    const outs = el.outgoing.map((c, i) => ({ connector: c, name: c.outVar || 'out' + (i + 1) }));
    this.io.note('split', { element: el });
    const roots = outs.map(o => ({ name: o.name, copy: true, fresh: () => this.#typed(flow.model, this.#fresh(flow.model)) }));
    const values = await this.#mapping(run, flow, el, el.config.output, 'Output', { in: data, roots, defaults: { out1: 'in' }, noOut: true });
    const tokens = outs.map(o => ({ element: elementById(flow.model, o.connector.to), via: { id: o.connector.id, from: el }, data: stripType(values[o.name]) }));
    return tokens.length > 1 ? [...tokens.slice(1), tokens[0]] : tokens;
  }

  /**
   * Join: a token waits until one has come in on every incoming connector; then the Output
   * maps in1, in2, … (default out ← in1) and one token goes on.
   */
  async #join(run, flow, el, token) {
    const inputs = incoming(flow.model, el);
    const arrived = flow.joins.get(el.id) || new Map();
    flow.joins.set(el.id, arrived);
    arrived.set(token.via ? token.via.id : '?', token);
    if (inputs.some(c => !arrived.has(c.id))) {
      this.io.note('join-wait', { element: el });
      return [];
    }
    flow.joins.delete(el.id);
    const vars = {};
    const varTypes = {};
    inputs.forEach((c, i) => {
      vars[c.var || 'in' + (i + 1)] = this.#typed(flow.model, { ...arrived.get(c.id).data });
    });
    this.io.note('join', { element: el });
    const { out } = await this.#mapping(run, flow, el, el.config.output, 'Output', { in: null, vars, varTypes, noIn: true, defaults: { out: 'in1' }, roots: [{ name: 'out', copy: true }] });
    return this.#onward(flow, el, stripType(out));
  }

  /**
   * Call Sub: the Process tab maps `param`; the sub process runs from its Sub Process Start
   * with new data; at its end the Result tab of the start fills `result`; the Output tab maps
   * it back (default out ← in).
   */
  async #call(run, flow, el, token) {
    const target = resolveCall(this.models, el.config.processCall);
    if (!target) {
      throw new ProcessFailure(el, { kind: 'call', model: flow.model, message: 'The process ' + (el.config.processCall || '(none)') + ' is not part of this simulation', cause: '' });
    }
    const { model: sub, start } = target;
    const params = startParams(start);
    const param = {};
    params.forEach(p => { param[p.name] = defaultValue(p.type); });
    this.io.note('call', { element: el, target: start });
    await this.#mapping(run, flow, el, el.config.call, 'Parameter', { in: token.data, varTypes: { param: params }, noOut: true, roots: [{ name: 'param', fresh: () => param }], defaults: {} });
    const subData = this.#fresh(sub);
    const subFlow = { model: sub, level: null, top: false };
    await this.#wait(run, this.io.descend({ model: sub, level: null, from: el }));
    let outcome;
    try {
      outcome = await this.#flow(run, subFlow, [{ element: start, via: null, data: subData, param }]);
    } finally {
      await this.#wait(run, this.io.ascend({ model: flow.model, level: flow.level, to: el, data: token.data }));
    }
    if (!outcome.exit) {
      // the sub process kept its token (a Join, an empty box): the caller waits for ever
      return [];
    }
    const results = resultParams(start);
    const result = {};
    results.forEach(p => { result[p.name] = defaultValue(p.type); });
    await this.#mapping(run, subFlow, start, start.config.result, 'Result', { in: outcome.token.data, varTypes: { result: results }, noOut: true, roots: [{ name: 'result', fresh: () => result }], defaults: {} });
    this.io.note('call-back', { element: el });
    const { out } = await this.#mapping(run, flow, el, el.config.output, 'Output', { in: token.data, vars: { result }, varTypes: { result: results } });
    return this.#onward(flow, el, out);
  }

  /**
   * Embedded Subprocess or BPMN activity: the token goes in at the Embedded Start of the
   * connector it came by, runs the elements inside with the same data, and leaves by the
   * connector of the Embedded End it reaches. An empty box keeps the token.
   */
  async #embedded(run, flow, el, token) {
    const inside = levelElements(flow.model, el.id);
    const entry = inside.find(e => e.type === 'EmbeddedStart' && token.via && e.parentConnector === token.via.id)
      || (inside.filter(e => e.type === 'EmbeddedStart').length === 1 && !token.via ? inside.find(e => e.type === 'EmbeddedStart') : null);
    if (!entry) {
      this.io.note('empty-box', { element: el });
      return { next: [], kept: el };
    }
    const innerFlow = { model: flow.model, level: el.id, top: false };
    await this.#wait(run, this.io.descend({ model: flow.model, level: el.id, from: el }));
    let outcome;
    try {
      outcome = await this.#flow(run, innerFlow, [{ element: entry, via: null, data: token.data }]);
    } finally {
      await this.#wait(run, this.io.ascend({ model: flow.model, level: flow.level, to: el, data: token.data }));
    }
    if (!outcome.exit) return { next: [], kept: outcome.waiting || el };
    const connector = el.outgoing.find(c => c.id === outcome.exit.parentConnector) || null;
    return { next: connector ? this.#onward(flow, el, outcome.token.data, connector) : [] };
  }
}

/** Process data without the marker that makes it readable as an object of its class. */
function stripType(value) {
  if (!value || typeof value !== 'object') return value;
  const copy = { ...value };
  delete copy.__type;
  return copy;
}
