/**
 * Checks every process (*.p.json) and data class (*.d.json) of the tutorial project against the
 * Axon Ivy 14.0 JSON schemas (tools/schemas/, copied from the Designer for VS Code 14.0.1,
 * published at https://json-schema.axonivy.com/14.0/project/). The processes the walkthroughs
 * play are real files a reader opens in the Designer, so they must be valid.
 *
 * Only the parts of JSON Schema the two schemas use are understood: $ref, type, properties,
 * additionalProperties: false, required, items, anyOf, enum.
 *
 *   node tools/check-project.mjs
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const project = resolve(root, '../../tutorial');
const schemas = { '.p.json': 'process.json', '.d.json': 'data-class.json' };

const TYPES = {
  string: v => typeof v === 'string',
  number: v => typeof v === 'number',
  integer: v => Number.isInteger(v),
  boolean: v => typeof v === 'boolean',
  object: v => v !== null && typeof v === 'object' && !Array.isArray(v),
  array: v => Array.isArray(v),
  null: v => v === null
};

/** Problems of `value` against `schema`, as "path: message". */
function validate(value, schema, defs, path, problems) {
  if (schema.$ref) return validate(value, defs[schema.$ref.split('/').pop()], defs, path, problems);
  if (schema.anyOf) {
    const fits = schema.anyOf.some(s => { const p = []; validate(value, s, defs, path, p); return !p.length; });
    if (!fits) problems.push(path + ': does not match any allowed form');
    return problems;
  }
  if (schema.type && !TYPES[schema.type](value)) { problems.push(path + ': expected ' + schema.type); return problems; }
  if (schema.enum && !schema.enum.includes(value)) problems.push(path + ': not one of ' + schema.enum.join(', '));
  if (TYPES.object(value) && (schema.properties || schema.additionalProperties !== undefined)) {
    (schema.required || []).forEach(key => { if (!(key in value)) problems.push(path + ': missing ' + key); });
    Object.keys(value).forEach(key => {
      const sub = schema.properties && schema.properties[key];
      if (sub) validate(value[key], sub, defs, path + '.' + key, problems);
      else if (schema.additionalProperties === false) problems.push(path + ': unknown key "' + key + '"');
      else if (schema.additionalProperties && typeof schema.additionalProperties === 'object') validate(value[key], schema.additionalProperties, defs, path + '.' + key, problems);
    });
  }
  if (Array.isArray(value) && schema.items) value.forEach((item, i) => validate(item, schema.items, defs, path + '[' + i + ']', problems));
  return problems;
}

function files(dir, out = []) {
  readdirSync(dir).forEach(name => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) { if (name !== 'target') files(full, out); } else out.push(full);
  });
  return out;
}

/**
 * The element configs are typed by the element: the schema keeps one definition per type
 * (Element<Type>), which this checker applies to `config` itself.
 */
function checkProcess(json, schema, problems) {
  const defs = schema.$defs;
  const known = defs.ElementTypes.enum || [];
  const walk = (elements, path) => (elements || []).forEach((el, i) => {
    const at = path + '[' + i + '](' + el.id + ')';
    const def = defs['Element' + el.type];
    if (!known.includes(el.type)) problems.push(at + ': unknown element type ' + el.type);
    else if (el.config && !def) problems.push(at + ': a ' + el.type + ' has no config');
    else if (el.config) validate(el.config, def, defs, at + '.config', problems);
    walk(el.boundaries, at + '.boundaries');
    walk(el.elements, at + '.elements');
  });
  walk(json.elements, 'elements');
}

export function checkProject() {
  const report = [];
  files(project).forEach(file => {
    const kind = Object.keys(schemas).find(ext => file.endsWith(ext));
    if (!kind) return;
    const schema = JSON.parse(readFileSync(join(root, 'tools/schemas', schemas[kind]), 'utf8'));
    const json = JSON.parse(readFileSync(file, 'utf8'));
    const problems = validate(json, schema, schema.$defs, '', []);
    if (kind === '.p.json') checkProcess(json, schema, problems);
    report.push({ file: relative(project, file).replace(/\\/g, '/'), problems });
  });
  return report;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = checkProject();
  const bad = report.filter(r => r.problems.length);
  bad.forEach(r => { console.error(r.file); r.problems.forEach(p => console.error('  ' + p)); });
  console.log(report.length + ' files checked, ' + bad.length + ' with problems');
  process.exit(bad.length ? 1 : 0);
}
