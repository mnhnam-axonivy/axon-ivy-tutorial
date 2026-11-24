/**
 * A deliberately small IvyScript interpreter — just enough to run the mappings, code blocks
 * and conditions of the guide's processes:
 *
 *   out.total = in.quantity * in.unitPrice;                  assignments to process data
 *   ivy.log.info("Order of " + in.customer);                 Runtime Log calls
 *   param.room                                               parameters of a start
 *   Number base = 10;                                        local variables
 *   if (...) { ... } else if (...) { ... } else { ... }      conditions
 *   in.customer.toUpperCase(), Math.max(a, b)                a few String methods and Java statics
 *   for (Number i = 0; i < 3; i++), for (String n : list), while, break, continue, x++, x += 1
 *   ["a", "b"], new List<String>(), new java.util.ArrayList<String>()   lists
 *   try { ... } catch (NumberFormatException e) { ... } finally { ... }
 *   cond ? a : b, value as Type, x instanceof Type, x is initialized, in.#field
 *
 * It follows the engine 14.0.1 where the documentation is silent (probes of 2026-11-16, run on
 * the Designer's engine and read from its Runtime Log): a String is never null, not even a
 * local one set to null; an Integer attribute drops the decimals of what it is given; + - * on
 * decimals are exact (0.1 + 0.2 is 0.3), / is not (10 / 3 is 3.3333333333333335); 7 / 2 is 3.5;
 * `is initialized` is true once a value was assigned, even 0; an assignment inside a condition
 * is allowed and has the value assigned. What IvyScript does not have (switch, lambdas, throw,
 * return, var, final, arrays, Java casts, generics other than List) is reported with the
 * Designer's own message: "Unexpected token: '{'", "Class var not found", and so on.
 *
 * Copied from internal/interactive_app_builder of the Smart Workflow tutorial and adapted: the
 * Smart Workflow classes are gone, defaults follow the Ivy base types, Math is there.
 *
 * Anything outside that subset raises an IvyScriptError of kind "unsupported" with a message
 * the UI can show as-is, so readers are told what the simulation cannot do instead of
 * getting a silent wrong answer.
 */

export class IvyScriptError extends Error {
  constructor(message, { pos = 0, kind = 'syntax' } = {}) {
    super(message);
    this.name = 'IvyScriptError';
    this.pos = pos;
    this.kind = kind;
  }
}

const LOG_LEVELS = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
// words the parser itself knows; `switch`, `do`, `return`, `throw`, `var`, `yield` are not among
// them: IvyScript reads them as names, which is why the Designer reports e.g. "Variable 'return'
// cannot be resolved" or "Class var not found" for them (Designer 14.0.1, checked)
const KEYWORDS = new Set(['if', 'else', 'for', 'while', 'new', 'import', 'try', 'catch', 'finally', 'break', 'continue']);
const LITERALS = new Set(['true', 'false', 'null']);
// longest first, so that '+=' wins over '+'; '<>' is a token of its own, as in the Designer
const PUNCTUATION = ['**', '++', '--', '+=', '-=', '*=', '/=', '<>', '==', '!=', '&&', '||', '<=', '>=', '.', ',', ';', '(', ')', '+', '-', '*', '/', '=', '<', '>', '!', '[', ']', '{', '}', '?', ':', '%', '#', '|', '&'];
const SUPPORTED_HINT = 'This simulation understands assignments, local variables, if/else, for, while, try/catch, lists, comparisons, arithmetic, text joined with +, a few String, List and Math methods, and ivy.log calls.';
// binary operators, loosest first
const LEVELS = [['||'], ['&&'], ['==', '!='], ['<', '>', '<=', '>='], ['+', '-'], ['*', '/', '%'], ['**']];
const COMPOUND = { '+=': '+', '-=': '-', '*=': '*', '/=': '/' };
/** Time, Date, DateTime and Duration constants in single quotes (IvyScript → Reference, Data Types). */
const DATE_CONSTANT = /^(\d{4}-\d{2}-\d{2}([ T]\d{2}:\d{2}(:\d{2})?)?|\d{1,2}\.\d{1,2}\.\d{4}( \d{2}:\d{2}(:\d{2})?)?|\d{2}:\d{2}(:\d{2})?|P[0-9YMWDTHS.]+|(\d+[yMwdhms])+)$/;
const LOOP_LIMIT = 10000;

/** "Unexpected token: …", worded as the Designer reports it. */
function unexpected(t) {
  if (!t || t.t === 'eof') return new IvyScriptError('The expression is incomplete', { pos: t ? t.pos : 0 });
  if (t.t === 'id') return new IvyScriptError(KEYWORDS.has(t.v) ? "Unexpected token: '" + t.v + "'" : "Unexpected token: identifier '" + t.v + "'", { pos: t.pos });
  if (t.t === 'str') return new IvyScriptError('Unexpected token: "' + t.v + '"', { pos: t.pos });
  if (t.t === 'num') return new IvyScriptError('Unexpected token: ' + t.v, { pos: t.pos });
  return new IvyScriptError("Unexpected token: '" + t.v + "'", { pos: t.pos });
}

// ── Tokenizer ────────────────────────────────────────────────────────────────

export function tokenize(source) {
  const src = String(source == null ? '' : source);
  const tokens = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (ch === '/' && src[i + 1] === '/') {
      while (i < src.length && src[i] !== '\n') i++;
      continue;
    }
    if (ch === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2);
      if (end < 0) throw new IvyScriptError('Comment is not closed with */', { pos: i });
      i = end + 2;
      continue;
    }
    if (ch === '"') {
      const start = i;
      let value = '';
      i++;
      let closed = false;
      while (i < src.length) {
        const c = src[i];
        if (c === '\\') {
          const n = src[i + 1];
          if (n === 'n') value += '\n';
          else if (n === 't') value += '\t';
          else if (n === 'r') value += '\r';
          else if (n === 'u' && /^[0-9a-fA-F]{4}$/.test(src.substr(i + 2, 4))) {
            value += String.fromCharCode(parseInt(src.substr(i + 2, 4), 16));
            i += 4;
          } else if (n !== undefined) value += n;
          i += 2;
          continue;
        }
        if (c === '"') { closed = true; i++; break; }
        if (c === '\n') break;
        value += c;
        i++;
      }
      if (!closed) throw new IvyScriptError('Text is not closed with "', { pos: start });
      tokens.push({ t: 'str', v: value, pos: start });
      continue;
    }
    if (ch === "'") {
      // single quotes are for Date, Time, DateTime and Duration constants, never for text
      const end = src.indexOf("'", i + 1);
      const raw = end < 0 ? src.slice(i + 1) : src.slice(i + 1, end);
      if (end < 0 || !DATE_CONSTANT.test(raw)) {
        throw new IvyScriptError("Unexpected token: Illegal Time, Date, DateTime or Duration constant ''" + raw + "''", { pos: i });
      }
      tokens.push({ t: 'date', v: raw, pos: i });
      i = end + 1;
      continue;
    }
    if (/[0-9]/.test(ch)) {
      const m = /^[0-9]+(\.[0-9]+)?/.exec(src.slice(i));
      tokens.push({ t: 'num', v: parseFloat(m[0]), int: !m[1], pos: i });
      i += m[0].length;
      continue;
    }
    if (/[A-Za-z_$]/.test(ch)) {
      const m = /^[A-Za-z_$][\w$]*/.exec(src.slice(i));
      tokens.push({ t: 'id', v: m[0], pos: i });
      i += m[0].length;
      continue;
    }
    const p = PUNCTUATION.find(x => src.startsWith(x, i));
    if (!p) throw new IvyScriptError("Unexpected character '" + ch + "'", { pos: i });
    tokens.push({ t: 'p', v: p, pos: i });
    i += p.length;
  }
  tokens.push({ t: 'eof', v: '', pos: src.length });
  return tokens;
}

// ── Parser ───────────────────────────────────────────────────────────────────

const word = t => t && t.t === 'id' && !KEYWORDS.has(t.v) && !LITERALS.has(t.v);

class Parser {
  constructor(source) {
    this.tokens = tokenize(source);
    this.i = 0;
  }

  peek(k = 0) { return this.tokens[Math.min(this.i + k, this.tokens.length - 1)]; }
  at(j) { return this.tokens[Math.min(j, this.tokens.length - 1)]; }
  next() { return this.tokens[this.i++]; }
  is(type, value) {
    const t = this.peek();
    return t.t === type && (value === undefined || t.v === value);
  }

  expectPunct(value) {
    if (!this.is('p', value)) throw unexpected(this.peek());
    return this.next();
  }

  program() {
    const statements = [];
    while (!this.is('eof')) {
      if (this.is('p', ';')) { this.next(); continue; }
      statements.push(this.statement());
    }
    return statements;
  }

  /** A statement ends with ';'. Without it the Designer says so, or names the next token. */
  end() {
    if (this.is('p', ';')) { this.next(); return; }
    if (this.is('eof') || this.is('p', '}')) {
      throw new IvyScriptError('A statement is expected, not an expression (maybe missing semicolon)', { pos: this.peek().pos });
    }
    throw unexpected(this.peek());
  }

  block() {
    const open = this.expectPunct('{');
    const body = [];
    while (!this.is('p', '}')) {
      if (this.is('eof')) throw new IvyScriptError("A block is not closed with '}'", { pos: open.pos });
      if (this.is('p', ';')) { this.next(); continue; }
      body.push(this.statement());
    }
    this.next();
    return { type: 'block', body, pos: open.pos };
  }

  /**
   * A type at token j: Name, a.b.Name, Name<Arg>, Name<a.b.Arg>. Returns { name, generic, end }
   * (end: the index after it), with `comma` or `diamond` set to the token the Designer rejects,
   * and `array` to the '[' of Name[]. null when there is no type.
   */
  typeAt(j) {
    const first = this.at(j);
    if (!word(first)) return null;
    let name = first.v;
    j++;
    while (this.at(j).t === 'p' && this.at(j).v === '.' && word(this.at(j + 1))) { name += '.' + this.at(j + 1).v; j += 2; }
    const type = { name, generic: name, end: j };
    const t = this.at(j);
    if (t.t === 'p' && t.v === '<>') return { ...type, diamond: t, end: j + 1 };
    if (t.t === 'p' && t.v === '[' && this.at(j + 1).t === 'p' && this.at(j + 1).v === ']') return { ...type, array: t, end: j + 2 };
    if (t.t === 'p' && t.v === '<') {
      // generics: only List<…> is understood by IvyScript; two type arguments are a syntax error
      let k = j + 1;
      let depth = 1;
      let text = '<';
      let comma = null;
      while (depth > 0) {
        const u = this.at(k);
        if (u.t === 'eof') return type;
        if (u.t === 'p' && u.v === '<') depth++;
        else if (u.t === 'p' && u.v === '>') depth--;
        else if (u.t === 'p' && u.v === ',') { if (!comma) comma = u; } else if (!(u.t === 'id' || (u.t === 'p' && u.v === '.'))) return type;
        text += u.v;
        k++;
      }
      return { name, generic: name + text, end: k, comma };
    }
    return type;
  }

  /** Consumes the tokens of a type found by typeAt. */
  takeType(type) {
    if (type.diamond) throw unexpected(type.diamond);
    if (type.comma) throw unexpected(type.comma);
    if (type.array) throw unexpected(type.array);
    this.i = type.end;
    return type.generic;
  }

  statement() {
    const start = this.peek();
    if (this.is('p', '{')) return this.block();
    if (this.is('id', 'if')) {
      this.next();
      const test = this.condition();
      const then = this.statement();
      let otherwise = null;
      if (this.is('id', 'else')) { this.next(); otherwise = this.statement(); }
      return { type: 'if', test, then, otherwise, pos: start.pos };
    }
    if (this.is('id', 'while')) {
      this.next();
      const test = this.condition();
      return { type: 'while', test, body: this.statement(), pos: start.pos };
    }
    if (this.is('id', 'for')) return this.forStatement();
    if (this.is('id', 'break') || this.is('id', 'continue')) {
      this.next();
      this.end();
      return { type: start.v, pos: start.pos };
    }
    if (this.is('id', 'import')) {
      // import a.b.C; — the class is then known by its short name
      this.next();
      const parts = [];
      while (!this.is('p', ';') && !this.is('eof')) parts.push(this.next().v);
      this.end();
      return { type: 'import', name: parts.join(''), pos: start.pos };
    }
    if (this.is('id', 'try')) return this.tryStatement();
    const node = this.simple();
    this.end();
    return node;
  }

  /** A declaration, an assignment, x++ or an expression; the caller takes the ';'. */
  simple() {
    const start = this.peek();
    const type = this.typeAt(this.i);
    if (type) {
      const name = this.at(type.end);
      const after = this.at(type.end + 1);
      if (word(name) && after.t === 'p' && (after.v === '=' || after.v === ';' || after.v === ':')) {
        const varType = this.takeType(type);
        this.next();
        let value = null;
        if (this.is('p', '=')) { this.next(); value = this.expression(); }
        return { type: 'declare', varType, name: name.v, value, pos: start.pos };
      }
      // `final String name = …`: the Designer stops at the third word
      if (word(name) && word(after)) throw unexpected(after);
      if (type.array && word(this.at(type.end))) throw unexpected(type.array);
    }
    const left = this.expression();
    if (this.is('p', '=')) {
      this.next();
      return { type: 'assign', target: left, value: this.expression(), pos: start.pos };
    }
    if (this.is('p') && COMPOUND[this.peek().v]) {
      const op = COMPOUND[this.next().v];
      return { type: 'assign', target: left, value: { type: 'binary', op, left, right: this.expression(), pos: start.pos }, pos: start.pos };
    }
    return { type: 'expr', expr: left, pos: start.pos };
  }

  /** ( test ) — an assignment is allowed there and has the value assigned, as in IvyScript. */
  condition() {
    this.expectPunct('(');
    const test = this.expression();
    if (this.is('p', '=')) {
      const mark = this.next();
      const value = this.expression();
      this.expectPunct(')');
      return { type: 'assignExpr', target: test, value, pos: mark.pos };
    }
    this.expectPunct(')');
    return test;
  }

  forStatement() {
    const start = this.next();
    this.expectPunct('(');
    // for (String name : list)
    const type = this.typeAt(this.i);
    if (type && word(this.at(type.end)) && this.at(type.end + 1).t === 'p' && this.at(type.end + 1).v === ':') {
      const varType = this.takeType(type);
      const name = this.next().v;
      this.next();
      const iterable = this.expression();
      this.expectPunct(')');
      return { type: 'foreach', varType, name, iterable, body: this.statement(), pos: start.pos };
    }
    // for (init; test; update)
    const init = this.is('p', ';') ? null : this.simple();
    this.expectPunct(';');
    const test = this.is('p', ';') ? null : this.expression();
    this.expectPunct(';');
    const update = this.is('p', ')') ? null : this.simple();
    this.expectPunct(')');
    return { type: 'for', init, test, update, body: this.statement(), pos: start.pos };
  }

  tryStatement() {
    const start = this.next();
    const body = this.block();
    const handlers = [];
    while (this.is('id', 'catch')) {
      this.next();
      this.expectPunct('(');
      const type = this.typeAt(this.i);
      if (!type) throw unexpected(this.peek());
      const javaType = this.takeType(type);
      if (this.is('p', '|')) throw unexpected(this.peek()); // catch (A | B e): not in IvyScript
      const name = this.next();
      if (!word(name)) throw unexpected(name);
      this.expectPunct(')');
      handlers.push({ javaType, name: name.v, body: this.block() });
    }
    let finalizer = null;
    if (this.is('id', 'finally')) { this.next(); finalizer = this.block(); }
    if (!handlers.length && !finalizer) throw unexpected(this.peek());
    return { type: 'try', body, handlers, finalizer, pos: start.pos };
  }

  singleExpression() {
    const expr = this.expression();
    if (!this.is('eof')) throw unexpected(this.peek());
    return expr;
  }

  /** The condition of an Alternative: an expression, or an assignment, which has the value assigned. */
  conditionExpression() {
    const test = this.expression();
    if (this.is('p', '=')) {
      const mark = this.next();
      const value = this.expression();
      if (!this.is('eof')) throw unexpected(this.peek());
      return { type: 'assignExpr', target: test, value, pos: mark.pos };
    }
    if (!this.is('eof')) throw unexpected(this.peek());
    return test;
  }

  expression() {
    const test = this.binary(0);
    if (this.is('id', 'as')) {
      // a cast: value as some.Type — the value stays what it is
      this.next();
      const type = this.typeAt(this.i);
      if (!type) throw unexpected(this.peek());
      return { type: 'cast', value: test, className: this.takeType(type), pos: test.pos };
    }
    if (!this.is('p', '?')) return test;
    const mark = this.next();
    const yes = this.expression();
    this.expectPunct(':');
    return { type: 'cond', test, yes, no: this.expression(), pos: mark.pos };
  }

  binary(level) {
    if (level >= LEVELS.length) return this.unary();
    let left = this.binary(level + 1);
    for (;;) {
      if (this.is('p') && LEVELS[level].includes(this.peek().v)) {
        const op = this.next();
        left = { type: 'binary', op: op.v, left, right: this.binary(level + 1), pos: op.pos };
      } else if (level === 3 && this.is('id', 'instanceof')) {
        const op = this.next();
        const type = this.typeAt(this.i);
        if (!type) throw unexpected(this.peek());
        left = { type: 'instanceof', value: left, className: this.takeType(type), pos: op.pos };
      } else break;
    }
    return left;
  }

  unary() {
    if (this.is('p', '!') || this.is('p', '-')) {
      const op = this.next();
      return { type: 'unary', op: op.v, operand: this.unary(), pos: op.pos };
    }
    return this.primary();
  }

  args() {
    const args = [];
    if (!this.is('p', ')')) {
      args.push(this.expression());
      while (this.is('p', ',')) { this.next(); args.push(this.expression()); }
    }
    this.expectPunct(')');
    return args;
  }

  primary() {
    const t = this.next();
    let node;
    if (t.t === 'str') node = { type: 'str', value: t.v, pos: t.pos };
    else if (t.t === 'num') node = { type: 'num', value: t.v, int: t.int, pos: t.pos };
    else if (t.t === 'date') node = { type: 'date', value: t.v, pos: t.pos };
    else if (t.t === 'p' && t.v === '[') {
      // a list: ["a", "b"]
      const items = [];
      if (!this.is('p', ']')) {
        items.push(this.expression());
        while (this.is('p', ',')) { this.next(); items.push(this.expression()); }
      }
      this.expectPunct(']');
      node = { type: 'list', items, pos: t.pos };
    } else if (t.t === 'id' && t.v === 'new') {
      const type = this.typeAt(this.i);
      if (!type) throw unexpected(this.peek());
      const generic = this.takeType(type);
      this.expectPunct('(');
      node = { type: 'new', className: type.name, generic, args: this.args(), pos: t.pos };
    } else if (t.t === 'id') {
      if (KEYWORDS.has(t.v)) throw unexpected(t);
      if (t.v === 'true' || t.v === 'false') node = { type: 'lit', value: t.v === 'true', pos: t.pos };
      else if (t.v === 'null') node = { type: 'lit', value: null, pos: t.pos };
      else node = { type: 'name', name: t.v, pos: t.pos };
    } else if (t.t === 'p' && t.v === '(') {
      node = this.expression();
      this.expectPunct(')');
    } else {
      throw unexpected(t);
    }

    for (;;) {
      if (this.is('p', '.')) {
        this.next();
        // in.#customer: the field without automatic object creation
        const raw = this.is('p', '#') ? Boolean(this.next()) : false;
        const prop = this.next();
        if (prop.t !== 'id') throw unexpected(prop);
        node = { type: 'member', object: node, prop: prop.v, raw, pos: prop.pos };
      } else if (this.is('p', '(')) {
        const open = this.next();
        node = { type: 'call', callee: node, args: this.args(), pos: open.pos };
      } else if (this.is('p', '++') || this.is('p', '--')) {
        const op = this.next();
        node = { type: 'postfix', op: op.v, target: node, pos: op.pos };
      } else if (this.is('id', 'is') && this.peek(1).t === 'id' && this.peek(1).v === 'initialized') {
        const op = this.next();
        this.next();
        node = { type: 'initialized', value: node, pos: op.pos };
      } else break;
    }
    return node;
  }
}

export function parseScript(source) { return new Parser(source).program(); }
export function parseExpression(source) { return new Parser(source).singleExpression(); }

// ── Evaluation ───────────────────────────────────────────────────────────────

/** Flattens `a.b.c` into ['a','b','c'] when the node is a plain dotted name, else null. */
function dottedName(node) {
  const parts = [];
  let n = node;
  while (n && n.type === 'member') { parts.unshift(n.prop); n = n.object; }
  if (!n || n.type !== 'name') return null;
  parts.unshift(n.name);
  return parts;
}

/*
 * Error messages use the wording of the Designer 14.0.1, as it reports them in the Problems
 * view (checked with a probe process): "Variable 'x' cannot be resolved", "Field price not
 * found for class tutorial.part3.ScriptMappingData", "Cannot cast object of type String to
 * type Number".
 */
function fieldOf(ctx, name, pos) {
  const field = (ctx.fields || []).find(f => f.name === name);
  if (!field) {
    throw new IvyScriptError('Field ' + name + ' not found for class ' + (ctx.dataClassName || 'the process data'), { pos, kind: 'field' });
  }
  return field;
}

/**
 * `in` and `out` are the process data. In a Start and in a Join there is no `in` (ctx.noIn);
 * in the condition of an Alternative, the parameters of a Call Sub and the result of a Sub
 * Process Start there is no `out` (ctx.noOut) — Designer and engine 14.0.1.
 */
function isDataRoot(name, ctx) { return (name === 'out' && !(ctx && ctx.noOut)) || (name === 'in' && !(ctx && ctx.noIn)); }

const unresolved = (name, pos) => new IvyScriptError("Variable '" + name + "' cannot be resolved", { pos, kind: 'field' });

/** Java names of the Ivy base types, as the Designer prints the class of `param`. */
const javaType = type => ({ String: 'java.lang.String', Number: 'java.lang.Number', Boolean: 'java.lang.Boolean' }[type] || type);

/**
 * The declared type of a field of a variable: of `param` or `result` (ctx.varTypes.param =
 * [{ name, type }]), or of an object of a data class such as `in1` or `out2`. Throws the
 * Designer's message when there is no such field; null when the variable declares nothing.
 */
function varField(ctx, root, name, pos) {
  const types = ctx.varTypes && ctx.varTypes[root];
  if (types) {
    const found = types.find(t => t.name === name);
    if (found) return found.type || 'String';
    throw new IvyScriptError('Field ' + name + ' not found for class <' + types.map(t => javaType(t.type) + ' ' + t.name).join(',') + '>', { pos, kind: 'field' });
  }
  const value = ctx.vars && ctx.vars[root];
  if (isTyped(value) && classOf(ctx, value.__type)) {
    const field = classOf(ctx, value.__type).fields.find(f => f.name === name);
    if (field) return field.type || 'String';
    throw new IvyScriptError('Field ' + name + ' not found for class ' + value.__type, { pos, kind: 'field' });
  }
  return null;
}

/** An object of a data class: { __type: 'tutorial.InvoiceData', invoiceNumber: '…', … }. */
const isTyped = value => value !== null && typeof value === 'object' && typeof value.__type === 'string';
const classOf = (ctx, name) => (ctx.classes && ctx.classes[name]) || null;
const NUMERIC_TYPE = /(^|\.)(BigDecimal|BigInteger|Number|Integer|Long|Double|Float|Short)$/;

/** The field `path[i]` of the data class `type`; throws when that class has no such field. */
function subField(ctx, type, path, i, pos) {
  const cls = classOf(ctx, type);
  const sub = cls ? cls.fields.find(f => f.name === path[i]) : null;
  if (!sub) {
    throw new IvyScriptError("'" + path.slice(0, i + 1).join('.') + "' cannot be read: " + path[i - 1] + ' has no field ' + path[i], { pos, kind: 'field' });
  }
  return sub;
}

/**
 * The value an attribute of this type has before anything is assigned. IvyScript base types
 * are never null: "Strings are initialized to an empty String, Numbers to zero, Lists to an
 * empty List" (IvyScript → Language). Java types such as java.lang.Integer may be null.
 * Boolean false is not stated there; it is the value an unset Boolean has in the Designer.
 */
export function defaultValue(type) {
  const t = String(type || 'String');
  if (t === 'String') return '';
  if (t === 'Number') return 0;
  if (t === 'Boolean') return false;
  if (/^List<.*>$/.test(t)) return [];
  return null;
}

/** An exception a script can catch: it carries the name of its Java class. */
function javaError(javaType, message, pos) {
  const error = new IvyScriptError(javaType + ': ' + message, { pos, kind: 'runtime' });
  error.javaType = javaType;
  error.javaMessage = message;
  return error;
}

const JAVA_NUMBER = /^\s*[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?[dDfF]?\s*$/;
const JAVA_INTEGER = /^[-+]?\d+$/;

function parseJavaNumber(value, pattern, pos) {
  if (value === null || value === undefined) throw javaError('NullPointerException', 'the value to parse is null', pos);
  if (typeof value === 'number') return value;
  const raw = text(value);
  if (!pattern.test(raw)) throw javaError('NumberFormatException', raw.trim() === '' ? 'empty String' : 'For input string: "' + raw + '"', pos);
  return parseFloat(raw);
}

const numbers = (args, pos) => args.map(a => number(a, pos));

/** Static Java methods the guide's processes call. */
const STATIC_METHODS = {
  'Math.max': (args, ctx, pos) => Math.max(...numbers(args, pos)),
  'Math.min': (args, ctx, pos) => Math.min(...numbers(args, pos)),
  'Math.abs': (args, ctx, pos) => Math.abs(number(args[0], pos)),
  'Math.round': (args, ctx, pos) => Math.round(number(args[0], pos)),
  'Math.floor': (args, ctx, pos) => Math.floor(number(args[0], pos)),
  'Math.ceil': (args, ctx, pos) => Math.ceil(number(args[0], pos)),
  'Double.parseDouble': (args, ctx, pos) => parseJavaNumber(args[0], JAVA_NUMBER, pos),
  'Double.valueOf': (args, ctx, pos) => parseJavaNumber(args[0], JAVA_NUMBER, pos),
  'Integer.parseInt': (args, ctx, pos) => parseJavaNumber(args[0], JAVA_INTEGER, pos),
  'Integer.valueOf': (args, ctx, pos) => parseJavaNumber(args[0], JAVA_INTEGER, pos),
  'String.valueOf': args => text(args[0]),
  'String.join': args => (Array.isArray(args[1]) ? args[1] : args.slice(1)).map(text).join(text(args[0])),
  'String.format': args => { let n = 1; return text(args[0]).replace(/%[sd]/g, () => text(args[n++])); },
  // IF(condition, then, else), the function form of ? :
  IF: (args, ctx, pos) => (truth(args[0], pos) ? args[1] : args[2])
};

/** Which thrown exception a catch clause takes; IvyScript's own errors are caught by Exception (engine 14.0.1). */
function catches(declared, thrown) {
  const d = String(declared).split('.').pop();
  const t = String(thrown || '').split('.').pop();
  if (d === t || ['Exception', 'Throwable'].includes(d)) return true;
  if (d === 'RuntimeException') return t !== '';
  if (d === 'IllegalArgumentException') return t === 'NumberFormatException';
  return d === 'IndexOutOfBoundsException' && t === 'StringIndexOutOfBoundsException';
}

/** The class of a BPM error; a script uses it after `import ch.ivyteam.ivy.bpm.error.BpmError;` (engine 14.0.1). */
export const BPM_ERROR = 'ch.ivyteam.ivy.bpm.error.BpmError';

/** BpmError.create(code), written in full or after the import. */
function isBpmCreate(path, ctx) {
  if (!path || path.length < 2 || path[path.length - 1] !== 'create') return false;
  const name = path.slice(0, -1).join('.');
  return name === BPM_ERROR || (name === 'BpmError' && Boolean(ctx.imports && ctx.imports.get && ctx.imports.get('BpmError') === BPM_ERROR));
}

/** The error throwError() throws: a script, a try/catch or the process can take it (kind 'bpm'). */
export function bpmThrown(code, pos) {
  const error = new IvyScriptError('BpmError ' + code, { pos, kind: 'bpm' });
  error.javaType = 'BpmError';
  error.javaMessage = code;
  error.bpmCode = code;
  return error;
}

/** What BpmError.create(code) returns: a builder whose throwError() throws. */
const bpmBuilder = (code, pos) => ({ __native: true, throwError: () => { throw bpmThrown(code, pos); } });

/** The Java class of an error, as the engine reports it (getClass().getName(), the Runtime Log). */
const JAVA_LANG = new Set(['NumberFormatException', 'ArithmeticException', 'NullPointerException', 'IllegalArgumentException', 'IllegalStateException', 'StringIndexOutOfBoundsException', 'IndexOutOfBoundsException']);
export function javaClassOf(e) {
  if (e.javaType === 'BpmError') return BPM_ERROR;
  if (e.javaType) return JAVA_LANG.has(e.javaType) ? 'java.lang.' + e.javaType : e.javaType;
  const m = String(e.message);
  const pkg = 'ch.ivyteam.ivy.scripting.exceptions.';
  if (/^Cannot cast/.test(m)) return pkg + 'invocation.IvyScriptCastException';
  if (/^Field .* not found/.test(m)) return pkg + 'invocation.IvyScriptFieldNotFoundException';
  if (/^Variable .* cannot be resolved/.test(m)) return pkg + 'invocation.IvyScriptVariableNotFoundException';
  if (/^Method /.test(m)) return pkg + 'invocation.IvyScriptMethodNotFoundException';
  if (e.kind === 'syntax') return pkg + 'compiler.IvyScriptParserException';
  return pkg + 'runtime.IvyScriptRuntimeException';
}

const NUMERIC_LOCAL = /^(double|float|int|long|short|Double|Float|Integer|Long|Short|Number)$/;

function text(value) {
  if (value == null) return '';
  if (Array.isArray(value)) return '[' + value.map(text).join(', ') + ']';
  if (value instanceof Map) return '{' + [...value].map(([k, v]) => text(k) + '=' + text(v)).join(', ') + '}';
  if (typeof value === 'object' && value.__class) return 'class ' + value.__class;
  if (isTyped(value)) {
    return value.__type.split('.').pop() + '[' + Object.keys(value).filter(k => !k.startsWith('__')).map(k => k + '=' + text(value[k])).join(', ') + ']';
  }
  return String(value);
}

const defaultFor = field => defaultValue(field.type);

const STRING_METHODS = {
  toString: s => s,
  equals: (s, a) => typeof a === 'string' && s === a,
  equalsIgnoreCase: (s, a) => typeof a === 'string' && s.toLowerCase() === a.toLowerCase(),
  trim: s => s.trim(),
  toUpperCase: s => s.toUpperCase(),
  toLowerCase: s => s.toLowerCase(),
  length: s => s.length,
  isEmpty: s => s.length === 0,
  isBlank: s => s.trim().length === 0,
  contains: (s, a) => s.includes(text(a)),
  startsWith: (s, a) => s.startsWith(text(a)),
  endsWith: (s, a) => s.endsWith(text(a)),
  replace: (s, a, b) => s.split(text(a)).join(text(b)),
  indexOf: (s, a) => s.indexOf(text(a)),
  substring: (s, a, b) => {
    const lo = Number(a) || 0;
    const hi = b === undefined ? s.length : Number(b);
    if (lo < 0 || hi > s.length || lo > hi) throw javaError('StringIndexOutOfBoundsException', 'Range [' + lo + ', ' + hi + ') out of bounds for length ' + s.length);
    return s.substring(lo, hi);
  }
};

/** Methods of a list (an Ivy List or a java.util.List). */
const LIST_METHODS = {
  add: (l, v) => { l.push(v); return true; },
  size: l => l.length,
  isEmpty: l => l.length === 0,
  contains: (l, v) => l.some(x => same(x, v)),
  indexOf: (l, v) => l.findIndex(x => same(x, v)),
  clear: l => { l.length = 0; },
  get: (l, i) => {
    if (!(i >= 0 && i < l.length)) throw javaError('IndexOutOfBoundsException', 'Index ' + i + ' out of bounds for length ' + l.length);
    return l[i];
  },
  remove: (l, v) => {
    const at = l.findIndex(x => same(x, v));
    if (at >= 0) l.splice(at, 1);
    return at >= 0;
  },
  toString: l => text(l)
};

const MAP_METHODS = {
  put: (m, k, v) => { const old = m.get(k); m.set(k, v); return old === undefined ? null : old; },
  get: (m, k) => (m.has(k) ? m.get(k) : null),
  containsKey: (m, k) => m.has(k),
  size: m => m.size,
  isEmpty: m => m.size === 0,
  toString: m => text(m)
};

/** + - * on decimals give the exact decimal, as the engine's numbers do (0.1 + 0.2 is 0.3). */
const tidy = n => (Number.isFinite(n) && !Number.isInteger(n) ? Number(n.toPrecision(15)) : n);

const isNumeric = value => typeof value === 'number' || (typeof value === 'string' && /^\s*-?\d+(\.\d+)?\s*$/.test(value));

function number(value, pos) {
  if (!isNumeric(value)) throw new IvyScriptError("'" + text(value) + "' is not a number", { pos, kind: 'runtime' });
  return typeof value === 'number' ? value : parseFloat(value);
}

/** A condition has to be true or false; nothing (null) counts as false. */
function truth(value, pos) {
  if (value === true || value === false) return value;
  if (value === null || value === undefined) return false;
  throw new IvyScriptError("'" + text(value) + "' is neither true nor false", { pos, kind: 'runtime' });
}

/** == as IvyScript compares: by value. */
function same(a, b) {
  const none = v => v === null || v === undefined;
  if (none(a) || none(b)) return none(a) && none(b);
  if (isNumeric(a) && isNumeric(b)) return number(a) === number(b);
  if (typeof a === 'object' || typeof b === 'object') return a === b;
  return text(a) === text(b);
}

function evaluate(node, ctx) {
  switch (node.type) {
    case 'str':
    case 'num':
    case 'lit':
    case 'date':
      return node.value;
    case 'list':
      return node.items.map(item => evaluate(item, ctx));
    case 'cast':
      return evaluate(node.value, ctx);
    case 'instanceof':
      return isInstance(evaluate(node.value, ctx), node.className);
    case 'initialized':
      return isInitialized(node.value, ctx);
    case 'assignExpr': {
      const value = evaluate(node.value, ctx);
      assign(node.target, value, ctx);
      return value;
    }
    case 'postfix': {
      const old = evaluate(node.target, ctx);
      assign(node.target, tidy(number(old, node.pos) + (node.op === '++' ? 1 : -1)), ctx);
      return old;
    }
    case 'unary': {
      const value = evaluate(node.operand, ctx);
      return node.op === '!' ? !truth(value, node.pos) : -number(value, node.pos);
    }
    case 'cond':
      return truth(evaluate(node.test, ctx), node.pos) ? evaluate(node.yes, ctx) : evaluate(node.no, ctx);
    case 'binary': {
      if (node.op === '&&') return truth(evaluate(node.left, ctx), node.pos) && truth(evaluate(node.right, ctx), node.pos);
      if (node.op === '||') return truth(evaluate(node.left, ctx), node.pos) || truth(evaluate(node.right, ctx), node.pos);
      const a = evaluate(node.left, ctx);
      const b = evaluate(node.right, ctx);
      switch (node.op) {
        case '+':
          if (typeof a === 'number' && typeof b === 'string') throw noPlus(staticType(node.left, ctx) || 'Number', node.pos);
          return typeof a === 'number' && typeof b === 'number' ? tidy(a + b) : text(a) + text(b);
        case '-': return tidy(number(a, node.pos) - number(b, node.pos));
        case '*': return tidy(number(a, node.pos) * number(b, node.pos));
        case '**': return tidy(number(a, node.pos) ** number(b, node.pos));
        case '/':
          if (number(b, node.pos) === 0) throw javaError('ArithmeticException', '/ by zero', node.pos);
          return number(a, node.pos) / number(b, node.pos);
        case '%': return number(a, node.pos) % number(b, node.pos);
        case '==': return same(a, b);
        case '!=': return !same(a, b);
        default: {
          // text compares as Java's compareTo does: "a" < "b"
          const both = typeof a === 'string' && typeof b === 'string' && !(isNumeric(a) && isNumeric(b));
          const x = both ? a : number(a, node.pos);
          const y = both ? b : number(b, node.pos);
          if (node.op === '<') return x < y;
          if (node.op === '>') return x > y;
          if (node.op === '<=') return x <= y;
          return x >= y;
        }
      }
    }
    case 'name':
    case 'member':
      return evaluateReference(node, ctx);
    case 'new': {
      const make = constructorOf(node, ctx);
      return make(...node.args.map(a => evaluate(a, ctx)));
    }
    case 'call':
      return evaluateCall(node, ctx);
    default:
      throw new IvyScriptError('Unsupported expression', { pos: node.pos, kind: 'unsupported' });
  }
}

const today = () => new Date().toISOString().slice(0, 10);
/** Classes `new` can create in the simulation, by full name; short names need an import, except Ivy's own. */
const BUILT_IN = {
  List: () => [],
  'java.util.ArrayList': () => [],
  'java.util.LinkedList': () => [],
  'java.util.HashMap': () => new Map(),
  'java.util.LinkedHashMap': () => new Map(),
  Date: () => today(),
  DateTime: () => new Date().toISOString().slice(0, 19).replace('T', ' '),
  // a Java date becomes an Ivy DateTime (IvyScript → Java Integration)
  'java.util.Date': () => new Date().toISOString().slice(0, 19).replace('T', ' ')
};
/** Types every script knows without an import: Ivy's types and those of java.lang. */
const KNOWN_TYPES = new Set(['String', 'Number', 'Integer', 'Long', 'Double', 'Float', 'Short', 'Byte', 'BigDecimal', 'BigInteger',
  'Boolean', 'Character', 'Date', 'DateTime', 'Time', 'Duration', 'Object', 'List', 'Record', 'Recordset', 'Binary', 'File', 'Xml', 'Tree',
  'Math', 'System', 'StringBuilder', 'Exception', 'RuntimeException', 'Throwable', 'NumberFormatException', 'ArithmeticException',
  'IllegalStateException', 'IllegalArgumentException', 'NullPointerException', 'IndexOutOfBoundsException', 'StringIndexOutOfBoundsException',
  'int', 'long', 'double', 'float', 'short', 'byte', 'boolean', 'char']);
const IVY_TYPES = new Set(['Date', 'DateTime', 'Time', 'Duration', 'List', 'Record', 'Recordset', 'Binary', 'File', 'Xml', 'Tree']);
const baseName = type => String(type).replace(/<.*$/, '');

/** Whether a type name can be used here: known, qualified, imported, or a data class. */
function knownType(type, ctx) {
  const name = baseName(type);
  if (KNOWN_TYPES.has(name) || name.includes('.')) return true;
  if (ctx.imports && ctx.imports.has(name)) return true;
  return Object.keys(ctx.classes || {}).some(full => full === name || full.split('.').pop() === name) || ctx.dataClassName === name;
}

/** The full name a short class name stands for: imported, or as written. */
function fullName(name, ctx) {
  return (ctx.imports && ctx.imports.get && ctx.imports.get(name)) || name;
}

/** The classes a script may create with `new`: the built-in ones, data classes, or what the surroundings give (ctx.constructors). */
function constructorOf(node, ctx) {
  const known = ctx.constructors || {};
  const full = fullName(node.className, ctx);
  if (BUILT_IN[full] && (IVY_TYPES.has(full) || full.includes('.'))) return BUILT_IN[full];
  if (known[node.className] || known[full]) return known[node.className] || known[full];
  const cls = classOf(ctx, full) || Object.values(ctx.classes || {}).find(c => c.simpleName === node.className);
  if (cls) return () => newObject(ctx, cls.name);
  if (!knownType(node.className, ctx)) throw new IvyScriptError('Class ' + node.generic + ' not found', { pos: node.pos, kind: 'field' });
  throw new IvyScriptError("'new " + node.generic + "' is not part of this simulation. " + SUPPORTED_HINT, { pos: node.pos, kind: 'unsupported' });
}

/** A new object of a data class, every field at its first value. */
function newObject(ctx, type) {
  const cls = classOf(ctx, type);
  const obj = { __type: type };
  ((cls && cls.fields) || []).forEach(f => { obj[f.name] = defaultValue(f.type); });
  return obj;
}

/** x instanceof Type */
function isInstance(value, type) {
  const name = baseName(type).split('.').pop();
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return ['String', 'Object', 'CharSequence'].includes(name);
  if (typeof value === 'boolean') return ['Boolean', 'Object'].includes(name);
  if (typeof value === 'number') return ['Number', 'Object'].includes(name) || (name === 'Integer' && Number.isInteger(value)) || (name === 'Double' && !Number.isInteger(value));
  if (Array.isArray(value)) return ['List', 'Object', 'Collection'].includes(name);
  if (isTyped(value)) return value.__type.split('.').pop() === name || name === 'Object';
  return name === 'Object';
}

/**
 * x is initialized: for an attribute, whether a value was assigned to it in this case (even
 * 0 or false), or it holds something other than its first value; for anything else, whether
 * it holds something other than nothing, "", 0, false or an empty list (engine 14.0.1).
 */
function isInitialized(node, ctx) {
  const path = dottedName(node);
  if (path && path.length === 2 && isDataRoot(path[0], ctx)) {
    const field = fieldOf(ctx, path[1], node.pos);
    if (ctx.assigned && ctx.assigned.has(field.name)) return true;
    const v = (path[0] === 'in' && ctx.inData ? ctx.inData : ctx.data)[field.name];
    if (v === null || v === undefined) return false;
    if (isTyped(v)) return true;
    return !(Array.isArray(v) ? v.length === 0 : same(v, defaultFor(field)));
  }
  const v = evaluate(node, ctx);
  return !(v === null || v === undefined || v === '' || v === 0 || v === false || (Array.isArray(v) && v.length === 0));
}

function evaluateReference(node, ctx) {
  const path = dottedName(node);
  if (path) {
    const root = path[0];
    if (isDataRoot(root, ctx)) {
      // in a mapping, `in` is the data as it came in and `out` the data being filled (engine 14.0.1)
      const data = root === 'in' && ctx.inData ? ctx.inData : ctx.data;
      if (path.length === 1) return data;
      const field = fieldOf(ctx, path[1], node.pos);
      let value = data[field.name];
      if (value === undefined || value === null) {
        // an object of a data class is created the moment it is used, unless read with .#
        const raw = path.length === 2 && node.raw;
        if (classOf(ctx, field.type) && !raw) { value = newObject(ctx, field.type); data[field.name] = value; } else value = raw && classOf(ctx, field.type) ? null : defaultFor(field);
      }
      // fields of a data class object, e.g. in.result.totalAmount (null while the object is missing)
      let type = field.type || 'String';
      for (let i = 2; i < path.length; i++) {
        const sub = subField(ctx, type, path, i, node.pos);
        value = value == null ? null : value[sub.name];
        if (value === undefined) value = null;
        type = sub.type;
      }
      return value;
    }
    if (ctx.locals && ctx.locals.has(root)) {
      if (path.length > 1) {
        const type = ctx.localTypes && ctx.localTypes.get(root);
        if (type && !classOf(ctx, type)) throw new IvyScriptError('Field ' + path[1] + ' not found for class ' + type, { pos: node.pos, kind: 'field' });
        let value = ctx.locals.get(root);
        for (let i = 1; i < path.length; i++) value = value == null ? null : (value[path[i]] === undefined ? null : value[path[i]]);
        return value;
      }
      return ctx.locals.get(root);
    }
    if (path.length >= 2 && ['Integer.MAX_VALUE', 'Integer.MIN_VALUE', 'Math.PI'].includes(path.join('.'))) {
      return { 'Integer.MAX_VALUE': 2147483647, 'Integer.MIN_VALUE': -2147483648, 'Math.PI': Math.PI }[path.join('.')];
    }
    if (ctx.vars && Object.prototype.hasOwnProperty.call(ctx.vars, root)) {
      // e.g. param.room in the mapping of a start
      if (path.length > 1) varField(ctx, root, path[1], node.pos);
      let value = ctx.vars[root];
      for (let i = 1; i < path.length; i++) {
        if (value === null || value === undefined) return null;
        if (typeof value !== 'object') throw new IvyScriptError("Cannot read '" + path.slice(i).join('.') + "' of " + path.slice(0, i).join('.'), { pos: node.pos, kind: 'unsupported' });
        value = value[path[i]];
      }
      return value === undefined ? null : value;
    }
    if (root === 'ivy') {
      throw new IvyScriptError("Only ivy.log is part of this simulation, not '" + path.join('.') + "'", { pos: node.pos, kind: 'unsupported' });
    }
    if (path.length > 1 && path[path.length - 1] === 'class') {
      return { __class: path.slice(0, -1).join('.') };
    }
    throw unresolved(root, node.pos);
  }
  // member access on a computed value, e.g. ("a" + "b").length — only methods are supported
  throw new IvyScriptError("Cannot read '" + node.prop + "' here", { pos: node.pos, kind: 'unsupported' });
}

function evaluateCall(node, ctx) {
  const path = dottedName(node.callee);
  if (path && isBpmCreate(path, ctx)) return bpmBuilder(text(node.args.length ? evaluate(node.args[0], ctx) : ''), node.pos);
  if (path && STATIC_METHODS[path.join('.')]) return STATIC_METHODS[path.join('.')](node.args.map(a => evaluate(a, ctx)), ctx, node.pos);
  // static methods the surroundings provide, e.g. CircuitBreakerSignal.stopAll()
  if (path && ctx.statics && ctx.statics[path.join('.')]) return ctx.statics[path.join('.')](node.args.map(a => evaluate(a, ctx)));
  if (path && path[0] === 'ivy') {
    if (path.length === 3 && path[1] === 'log' && LOG_LEVELS.includes(path[2])) {
      if (node.args.length < 1) throw new IvyScriptError('ivy.log.' + path[2] + '(...) needs a message', { pos: node.pos });
      // further arguments fill {0}, {1}, … of the message
      const rest = node.args.slice(1).map(a => text(evaluate(a, ctx)));
      const message = text(evaluate(node.args[0], ctx)).replace(/\{(\d+)\}/g, (all, n) => (Number(n) < rest.length ? rest[Number(n)] : all));
      if (ctx.log) ctx.log(path[2], message);
      return undefined;
    }
    throw new IvyScriptError("'" + path.join('.') + "(...)' is not available in this simulation — only ivy.log." + LOG_LEVELS.slice(1, 5).join('/') + '(...)', { pos: node.pos, kind: 'unsupported' });
  }
  if (node.callee.type === 'member') {
    const target = evaluate(node.callee.object, ctx);
    const method = node.callee.prop;
    const args = node.args.map(a => evaluate(a, ctx));
    if (target === null || target === undefined) return null; // a call on nothing yields nothing, as in IvyScript
    if (typeof target === 'string' && STRING_METHODS[method]) {
      try {
        return STRING_METHODS[method](target, ...args);
      } catch (e) {
        if (e instanceof IvyScriptError && !e.pos) e.pos = node.pos;
        throw e;
      }
    }
    if (Array.isArray(target) && LIST_METHODS[method]) return LIST_METHODS[method](target, ...args);
    if (target instanceof Map && MAP_METHODS[method]) return MAP_METHODS[method](target, ...args);
    if (target instanceof IvyScriptError && method === 'getClass') return { __class: javaClassOf(target) };
    if (target && target.__class && method === 'getName') return target.__class;
    if (target && target.__class && method === 'getSimpleName') return target.__class.split('.').pop();
    if (typeof target === 'number' && method === 'toString') return String(target);
    if (typeof target === 'boolean' && method === 'toString') return String(target);
    if (target instanceof IvyScriptError && method === 'getMessage') return target.javaMessage || target.message;
    if (target && target.__class && method === 'toString') return text(target);
    // a caught BPM error, as an Error Boundary Event hands it to the process data
    if (target && target.__bpmError && method === 'getMessage') return target.message;
    if (target && target.__bpmError && method === 'getErrorCode') return target.errorCode;
    if (target && target.__bpmError && method === 'getTechnicalCause') return target.technicalCause == null ? null : target.technicalCause;
    if (target && target.__bpmError && method === 'getAttribute') {
      const value = (target.attributes || {})[text(args[0])];
      return value === undefined ? null : value;
    }
    if (target && target.__bpmError && method === 'setAttribute') {
      target.attributes = target.attributes || {};
      target.attributes[text(args[0])] = args[1];
      return undefined;
    }
    // an object the surroundings created, e.g. new DecisionMaker(...)
    if (target && target.__native && typeof target[method] === 'function') return target[method](...args);
    throw new IvyScriptError("The method '" + method + "()' is not part of this simulation", { pos: node.callee.pos, kind: 'unsupported' });
  }
  throw new IvyScriptError('This call is not part of this simulation', { pos: node.pos, kind: 'unsupported' });
}

/** The IvyScript type of a value, as the Designer names it in "Cannot cast object of type …". */
function typeName(value) {
  if (typeof value === 'string') return 'String';
  if (typeof value === 'boolean') return 'Boolean';
  if (typeof value === 'number') return Number.isInteger(value) ? 'Integer' : 'Number';
  if (isTyped(value)) return value.__type;
  return 'Object';
}

const NUMBER_TYPES = /^(Number|Integer|Long|Double|Float|Short|BigDecimal|BigInteger)$/;
/** `number + "text"`: Number has no method + that takes a String (Designer 14.0.1). */
const noPlus = (type, pos) => new IvyScriptError('Method +(String) for class ' + type + ' of classloader null not found', { pos, kind: 'field' });

const cannotCast = (value, type, pos) => new IvyScriptError('Cannot cast object of type ' + typeName(value) + ' to type ' + type, { pos, kind: 'runtime' });

/** An assignment checks the type as the Designer does: no text into a Number, no number into a String. */
function coerce(field, value, pos) {
  const type = field.type || 'String';
  if (value === null || value === undefined) return defaultValue(type);
  if (type === 'String') {
    if (typeof value !== 'string') throw cannotCast(value, type, pos);
    return value;
  }
  if (type === 'Number') {
    if (typeof value !== 'number') throw cannotCast(value, type, pos);
    return value;
  }
  if (/^(Integer|Long|Short|java\.lang\.(Integer|Long|Short))$/.test(type)) {
    // an Integer attribute keeps the whole part of a decimal, silently (engine 14.0.1)
    if (typeof value !== 'number') throw cannotCast(value, type, pos);
    return Math.trunc(value);
  }
  const list = /^(?:java\.util\.)?List<(.+)>$/.exec(type);
  if (list) {
    if (!Array.isArray(value)) throw cannotCast(value, type, pos);
    const element = { type: list[1] };
    value.forEach(item => coerce(element, item, pos));
    return value;
  }
  if (type === 'Date' || type === 'DateTime' || type === 'Time') return value;
  if (type === 'Boolean') {
    if (typeof value !== 'boolean') throw cannotCast(value, type, pos);
    return value;
  }
  // every other type is a class: only an object of that class fits
  if (isTyped(value) && value.__type === type) return value;
  throw cannotCast(value, type, pos);
}

function assign(targetNode, value, ctx) {
  const path = dottedName(targetNode);
  if (path && path.length === 1 && ctx.locals && ctx.locals.has(path[0])) {
    ctx.locals.set(path[0], localValue(ctx.localTypes && ctx.localTypes.get(path[0]), value, targetNode.pos));
    return;
  }
  // a field of a data class object: in.booking.day = "Monday" (the object is created on the way)
  if (path && path.length === 3 && isDataRoot(path[0], ctx)) {
    const field = fieldOf(ctx, path[1], targetNode.pos);
    const sub = subField(ctx, field.type, path, 2, targetNode.pos);
    let obj = ctx.data[field.name];
    if (!isTyped(obj)) { obj = newObject(ctx, field.type); ctx.data[field.name] = obj; }
    obj[sub.name] = coerce(sub, value, targetNode.pos);
    if (ctx.assigned) ctx.assigned.add(field.name);
    if (ctx.onAssign) ctx.onAssign(field.name, obj);
    return;
  }
  if (path && path.length >= 1 && !isDataRoot(path[0], ctx) && !(ctx.locals && ctx.locals.has(path[0])) && !(ctx.vars && path[0] in ctx.vars)) {
    throw unresolved(path[0], targetNode.pos);
  }
  // a field of a variable that is filled here: param.weight of a Call Sub, result.price, out2.text of a Split
  if (path && path.length === 2 && !isDataRoot(path[0], ctx) && ctx.vars && path[0] in ctx.vars && ctx.vars[path[0]] && typeof ctx.vars[path[0]] === 'object') {
    const type = varField(ctx, path[0], path[1], targetNode.pos);
    ctx.vars[path[0]][path[1]] = type ? coerce({ type }, value, targetNode.pos) : value;
    if (ctx.onAssignVar) ctx.onAssignVar(path[0], path[1], ctx.vars[path[0]][path[1]]);
    return;
  }
  if (!path || !isDataRoot(path[0], ctx) || path.length !== 2) {
    throw new IvyScriptError('Only attributes of the process data, such as out.total, can be assigned in this simulation', { pos: targetNode.pos, kind: path ? 'field' : 'unsupported' });
  }
  const field = fieldOf(ctx, path[1], targetNode.pos);
  const coerced = coerce(field, value, targetNode.pos);
  ctx.data[field.name] = coerced;
  if (ctx.assigned) ctx.assigned.add(field.name);
  if (ctx.onAssign) ctx.onAssign(field.name, coerced);
}

/**
 * The type an expression has, as far as it can be told without running it: literals, text
 * joined with +, arithmetic, attributes of the process data and fields of `param`. null when
 * it cannot be told (method calls, locals, …): then nothing is reported.
 */
function staticType(node, ctx) {
  if (!node) return null;
  switch (node.type) {
    case 'str': return 'String';
    case 'num': return node.int === false ? 'Number' : Number.isInteger(node.value) ? 'Integer' : 'Number';
    case 'date': return 'Date';
    case 'list': return 'List';
    case 'cast': return node.className;
    case 'instanceof':
    case 'initialized': return 'Boolean';
    case 'assignExpr': return staticType(node.value, ctx);
    case 'lit': return typeof node.value === 'boolean' ? 'Boolean' : null;
    case 'binary': {
      if (['==', '!=', '<', '>', '<=', '>=', '&&', '||'].includes(node.op)) return 'Boolean';
      const a = staticType(node.left, ctx);
      const b = staticType(node.right, ctx);
      if (node.op === '+' && (a === 'String' || b === 'String')) return 'String';
      return a && b ? 'Number' : null;
    }
    case 'unary': return node.op === '!' ? 'Boolean' : staticType(node.operand, ctx);
    case 'name':
    case 'member': {
      const path = dottedName(node);
      if (path && path.length === 1 && ctx.localTypes && ctx.localTypes.has(path[0])) {
        const declared = String(ctx.localTypes.get(path[0])).split('.').pop();
        return NUMBER_TYPES.test(declared) ? (declared === 'Integer' ? 'Integer' : 'Number') : declared;
      }
      if (!path || path.length !== 2) return null;
      if (isDataRoot(path[0], ctx)) {
        const field = (ctx.fields || []).find(f => f.name === path[1]);
        return field ? field.type || 'String' : null;
      }
      if (ctx.vars && path[0] in ctx.vars) {
        try {
          return varField(ctx, path[0], path[1], node.pos);
        } catch (e) {
          return null;
        }
      }
      return null;
    }
    default: return null;
  }
}

/** Whether a value of type `from` may be assigned to an attribute of type `to` (Designer 14.0.1). */
function fits(from, to) {
  if (!from || !['String', 'Number', 'Boolean', 'Integer'].includes(to)) return true;
  if (to === 'Number' || to === 'Integer') return from === 'Number' || from === 'Integer';
  return from === to;
}

/** A local variable keeps its declared kind: numbers as numbers, a String is never null. */
function localValue(type, value, pos) {
  if (type === 'String' && (value === null || value === undefined)) return '';
  if (value !== null && value !== undefined && NUMERIC_LOCAL.test(String(type))) return number(value, pos);
  return value;
}

/** A condition must be a Boolean: "An expression of type BOOLEAN is expected, but the type is String". */
function checkCondition(node, ctx) {
  check(node, ctx);
  const type = node.type === 'assignExpr' ? null : staticType(node, ctx);
  if (type && ['String', 'Number', 'Integer', 'Date', 'List'].includes(type)) {
    throw new IvyScriptError('An expression of type BOOLEAN is expected, but the type is ' + type, { pos: node.pos, kind: 'field' });
  }
}

const BASE = /^(String|Number|Integer|Boolean|Date|DateTime|Time|(java\.util\.)?List<.+>)$/;
const shortClass = type => String(type).replace(/^java\.lang\./, '');

/** Statically checks field references without running anything. */
function check(node, ctx) {
  if (!node) return;
  switch (node.type) {
    case 'import': {
      const simple = node.name.split('.').pop();
      if (IVY_TYPES.has(simple) && !node.name.startsWith('ch.ivyteam.')) {
        throw new IvyScriptError('The import ' + node.name + ' collides with ' + simple, { pos: node.pos, kind: 'field' });
      }
      if (ctx.imports) ctx.imports.set(simple, node.name);
      return;
    }
    case 'new':
      constructorOf(node, ctx);
      node.args.forEach(a => check(a, ctx));
      return;
    case 'block': node.body.forEach(s => check(s, ctx)); return;
    case 'if': checkCondition(node.test, ctx); check(node.then, ctx); check(node.otherwise, ctx); return;
    case 'while': checkCondition(node.test, ctx); check(node.body, ctx); return;
    case 'for':
      check(node.init, ctx);
      if (node.test) checkCondition(node.test, ctx);
      check(node.update, ctx);
      check(node.body, ctx);
      return;
    case 'foreach':
      check(node.iterable, ctx);
      if (ctx.localNames) ctx.localNames.add(node.name);
      if (ctx.localTypes) ctx.localTypes.set(node.name, node.varType);
      check(node.body, ctx);
      return;
    case 'break':
    case 'continue':
    case 'date':
      return;
    case 'list': node.items.forEach(item => check(item, ctx)); return;
    case 'cast':
    case 'instanceof':
    case 'initialized': check(node.value, ctx); return;
    case 'postfix': check(node.target, ctx); return;
    case 'assignExpr': check({ type: 'assign', target: node.target, value: node.value, pos: node.pos }, ctx); return;
    case 'try':
      check(node.body, ctx);
      node.handlers.forEach(handler => {
        if (ctx.localNames) ctx.localNames.add(handler.name);
        check(handler.body, ctx);
      });
      check(node.finalizer, ctx);
      return;
    case 'declare':
      // the parser knows the variables declared before (not those of a catch), then the classes are checked
      if (ctx.declared && ctx.declared.has(node.name)) throw new IvyScriptError('Variable ' + node.name + ' already declared', { pos: node.pos, kind: 'field' });
      if (!knownType(node.varType, ctx)) throw new IvyScriptError('Class ' + node.varType + ' not found', { pos: node.pos, kind: 'field' });
      if (ctx.declared) ctx.declared.add(node.name);
      check(node.value, ctx);
      if (ctx.localNames) ctx.localNames.add(node.name);
      if (ctx.localTypes) ctx.localTypes.set(node.name, node.varType);
      return;
    case 'unary': check(node.operand, ctx); return;
    case 'cond': checkCondition(node.test, ctx); check(node.yes, ctx); check(node.no, ctx); return;
    case 'assign': {
      const path = dottedName(node.target);
      if (path && path.length === 1 && ctx.localNames && ctx.localNames.has(path[0])) {
        check(node.value, ctx);
        return;
      }
      if (path && !isDataRoot(path[0], ctx) && !(ctx.localNames && ctx.localNames.has(path[0])) && !(ctx.vars && path[0] in ctx.vars)) {
        throw unresolved(path[0], node.target.pos);
      }
      if (path && path.length === 2 && !isDataRoot(path[0], ctx) && ctx.vars && path[0] in ctx.vars) {
        // param.weight ← …, result.price ← …, out2.text ← …: the declared type has to fit
        const declared = varField(ctx, path[0], path[1], node.target.pos);
        check(node.value, ctx);
        const from = staticType(node.value, ctx);
        if (declared && node.value && !fits(from, declared)) throw new IvyScriptError('Cannot cast object of type ' + from + ' to type ' + declared, { pos: node.target.pos, kind: 'field' });
        return;
      }
      if (path && isDataRoot(path[0], ctx) && path.length === 3) {
        // a field of a data class object: in.booking.day = …
        const sub = subField(ctx, fieldOf(ctx, path[1], node.target.pos).type, path, 2, node.target.pos);
        check(node.value, ctx);
        const type = staticType(node.value, ctx);
        if (node.value && !fits(type, sub.type || 'String')) throw new IvyScriptError('Cannot cast object of type ' + type + ' to type ' + (sub.type || 'String'), { pos: node.target.pos, kind: 'field' });
        return;
      }
      if (!path || !isDataRoot(path[0], ctx) || path.length !== 2) {
        throw new IvyScriptError('Only attributes of the process data, such as out.total, can be assigned in this simulation', { pos: node.target.pos, kind: 'field' });
      }
      const field = fieldOf(ctx, path[1], node.target.pos);
      check(node.value, ctx);
      // a list literal into List<String>: each element has to fit
      const list = /^(?:java\.util\.)?List<(.+)>$/.exec(field.type || '');
      if (list && node.value && node.value.type === 'list') {
        node.value.items.forEach(item => {
          const type = staticType(item, ctx);
          if (!fits(type, list[1])) throw new IvyScriptError('Cannot cast object of type ' + type + ' to type ' + list[1], { pos: item.pos, kind: 'field' });
        });
        return;
      }
      const from = staticType(node.value, ctx);
      if (node.value && !fits(from, field.type || 'String')) {
        throw new IvyScriptError('Cannot cast object of type ' + from + ' to type ' + (field.type || 'String'), { pos: node.target.pos, kind: 'field' });
      }
      return;
    }
    case 'expr': check(node.expr, ctx); return;
    case 'binary': {
      check(node.left, ctx);
      check(node.right, ctx);
      if (node.op === '+') {
        const a = staticType(node.left, ctx);
        if (a && NUMBER_TYPES.test(a) && staticType(node.right, ctx) === 'String') throw noPlus(a, node.pos);
      }
      return;
    }
    case 'call': {
      const path = dottedName(node.callee);
      if (path && (isBpmCreate(path, ctx) || STATIC_METHODS[path.join('.')] || (ctx.statics && ctx.statics[path.join('.')]))) {
        node.args.forEach(a => check(a, ctx));
        return;
      }
      if (path && path[0] === 'ivy') {
        if (!(path.length === 3 && path[1] === 'log' && LOG_LEVELS.includes(path[2]))) {
          throw new IvyScriptError("'" + path.join('.') + "(...)' is not available in this simulation — only ivy.log.info/warn/error(...)", { pos: node.pos, kind: 'unsupported' });
        }
      } else if (node.callee.type === 'member') {
        check(node.callee.object, ctx);
        const target = staticType(node.callee.object, ctx);
        if (target === 'String' && !STRING_METHODS[node.callee.prop] && !['hashCode', 'charAt', 'split', 'matches', 'compareTo', 'concat', 'lastIndexOf', 'replaceAll', 'strip', 'repeat', 'getClass', 'format'].includes(node.callee.prop)) {
          const types = node.args.map(a => staticType(a, ctx) || 'Object');
          throw new IvyScriptError('Method ' + node.callee.prop + '(' + types.join(',') + ') for class String of classloader null not found', { pos: node.callee.pos, kind: 'field' });
        }
      }
      node.args.forEach(a => check(a, ctx));
      return;
    }
    case 'name':
    case 'member': {
      const path = dottedName(node);
      if (!path) { check(node.object, ctx); return; }
      if (isDataRoot(path[0], ctx)) {
        if (path.length > 1) {
          let type = fieldOf(ctx, path[1], node.pos).type || 'String';
          for (let i = 2; i < path.length; i++) {
            // in.text.length, in.names.size: a String or a List has methods, not fields
            if (BASE.test(type)) throw new IvyScriptError('Field ' + path[i] + ' not found for class ' + shortClass(type), { pos: node.pos, kind: 'field' });
            type = subField(ctx, type, path, i, node.pos).type;
          }
        }
        return;
      }
      if (ctx.localNames && ctx.localNames.has(path[0])) return;
      if (ctx.vars && Object.prototype.hasOwnProperty.call(ctx.vars, path[0])) {
        if (path.length > 1) varField(ctx, path[0], path[1], node.pos);
        return;
      }
      if (path[0] === 'ivy') return;
      if (path.length > 1 && path[path.length - 1] === 'class') return;
      throw unresolved(path[0], node.pos);
    }
    default:
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * @typedef {Object} ScriptContext
 * @property {Object} data                         process data values (shared by in. and out.)
 * @property {{name:string,type?:string}[]} fields data class fields
 * @property {string} [dataClassName]
 * @property {Object} [classes]                     other data classes by full name: { name, fields }
 * @property {Object} [cms]                         CMS objects by path (see macro.js)
 * @property {(level:string,message:string)=>void} [log]
 * @property {(field:string,value:any)=>void} [onAssign]
 * @property {Object} [vars]                       extra variables, e.g. { result }
 */

/** Runs a script step. Throws IvyScriptError. */
export function runScript(source, ctx) {
  const scope = { ...ctx, locals: new Map(), localTypes: new Map(), imports: new Map() };
  parseScript(source).forEach(stmt => execute(stmt, scope));
}

class LoopSignal {
  constructor(kind) { this.kind = kind; }
}

/** Runs a loop body; false when a break ends the loop. */
function loopBody(body, ctx, count) {
  if (count > LOOP_LIMIT) throw new IvyScriptError('This loop ran ' + LOOP_LIMIT + ' times; the simulation stops it here', { pos: body.pos, kind: 'unsupported' });
  try {
    execute(body, ctx);
  } catch (e) {
    if (e instanceof LoopSignal) return e.kind !== 'break';
    throw e;
  }
  return true;
}

function execute(stmt, ctx) {
  switch (stmt.type) {
    case 'assign':
      assign(stmt.target, evaluate(stmt.value, ctx), ctx);
      return;
    case 'import':
      if (ctx.imports) ctx.imports.set(stmt.name.split('.').pop(), stmt.name);
      return;
    case 'declare': {
      const value = stmt.value ? evaluate(stmt.value, ctx) : null;
      if (ctx.localTypes) ctx.localTypes.set(stmt.name, stmt.varType);
      ctx.locals.set(stmt.name, localValue(stmt.varType, value, stmt.pos));
      return;
    }
    case 'while': {
      let n = 0;
      while (truth(evaluate(stmt.test, ctx), stmt.pos)) if (!loopBody(stmt.body, ctx, ++n)) break;
      return;
    }
    case 'for': {
      if (stmt.init) execute(stmt.init, ctx);
      let n = 0;
      while (!stmt.test || truth(evaluate(stmt.test, ctx), stmt.pos)) {
        if (!loopBody(stmt.body, ctx, ++n)) break;
        if (stmt.update) execute(stmt.update, ctx);
      }
      return;
    }
    case 'foreach': {
      const items = evaluate(stmt.iterable, ctx);
      const list = Array.isArray(items) ? items.slice() : items instanceof Map ? [...items.keys()] : [];
      let n = 0;
      for (const item of list) {
        ctx.locals.set(stmt.name, item);
        if (ctx.localTypes) ctx.localTypes.set(stmt.name, stmt.varType);
        if (!loopBody(stmt.body, ctx, ++n)) break;
      }
      return;
    }
    case 'break':
    case 'continue':
      throw new LoopSignal(stmt.type);
    case 'block':
      stmt.body.forEach(s => execute(s, ctx));
      return;
    case 'if':
      if (truth(evaluate(stmt.test, ctx), stmt.test.pos)) execute(stmt.then, ctx);
      else if (stmt.otherwise) execute(stmt.otherwise, ctx);
      return;
    case 'try':
      try {
        execute(stmt.body, ctx);
      } catch (e) {
        // Java exceptions, IvyScript's own errors at run time (a failed cast, …), BPM errors
        const caught = e instanceof IvyScriptError && e.kind !== 'unsupported';
        const handler = caught ? stmt.handlers.find(h => catches(h.javaType, e.javaType || javaClassOf(e))) : null;
        if (!handler) {
          if (stmt.finalizer) execute(stmt.finalizer, ctx);
          throw e;
        }
        ctx.locals.set(handler.name, e);
        try {
          execute(handler.body, ctx);
        } catch (inner) {
          if (stmt.finalizer) execute(stmt.finalizer, ctx);
          throw inner;
        }
      }
      if (stmt.finalizer) execute(stmt.finalizer, ctx);
      return;
    default:
      evaluate(stmt.expr, ctx);
  }
}

/** Evaluates one expression and returns its value. Throws IvyScriptError. */
export function evalExpression(source, ctx) {
  return evaluate(parseExpression(source), ctx);
}

/** Evaluates the condition of an Alternative; `in.flag = true` assigns and is true (engine 14.0.1). */
export function evalCondition(source, ctx) {
  return evaluate(new Parser(source).conditionExpression(), ctx);
}

/**
 * Checks the condition of an Alternative as the Designer does: a condition that is not a
 * Boolean is "Cannot cast object of type String to type Boolean"; an assignment passes.
 */
export function validateCondition(source, ctx) {
  try {
    const node = new Parser(source).conditionExpression();
    check(node, ctx);
    const type = node.type === 'assignExpr' ? null : staticType(node, ctx);
    if (type && type !== 'Boolean') throw new IvyScriptError('Cannot cast object of type ' + type + ' to type Boolean', { pos: node.pos, kind: 'field' });
    return null;
  } catch (e) {
    if (e instanceof IvyScriptError) return e;
    throw e;
  }
}

/** Executes `<target> = value`, the way a row of a mapping table assigns. Throws IvyScriptError. */
export function assignTo(target, value, ctx) {
  assign(parseExpression(target), value, ctx);
}

/** Returns null when the script would run, otherwise the IvyScriptError describing why not. */
export function validateScript(source, ctx) {
  try {
    const scope = { ...ctx, localNames: new Set(), declared: new Set(), localTypes: new Map(), imports: new Map() };
    parseScript(source).forEach(stmt => check(stmt, scope));
    return null;
  } catch (e) {
    if (e instanceof IvyScriptError) return e;
    throw e;
  }
}

/** Validates a single expression; `assignable` additionally requires an in./out. field. */
export function validateExpression(source, ctx, { assignable = false } = {}) {
  try {
    const node = parseExpression(source);
    if (assignable) check({ type: 'assign', target: node, value: null }, ctx);
    else check(node, ctx);
    return null;
  } catch (e) {
    if (e instanceof IvyScriptError) return e;
    throw e;
  }
}

/**
 * Validates one row of a mapping table: the expression, and whether its type fits the
 * attribute, as the Designer reports it ("Cannot cast object of type String to type Number").
 */
export function validateMapping(target, source, ctx) {
  try {
    check({ type: 'assign', target: parseExpression(target), value: parseExpression(source), pos: 0 }, { ...ctx, localNames: new Set(), imports: new Map() });
    return null;
  } catch (e) {
    if (e instanceof IvyScriptError) return e;
    throw e;
  }
}

/** Converts a character offset into a 1-based line/column pair. */
export function positionOf(source, pos) {
  const before = String(source).slice(0, pos);
  const line = before.split('\n').length;
  return { line, column: pos - before.lastIndexOf('\n') };
}
