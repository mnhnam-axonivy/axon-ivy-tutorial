/**
 * Puts a skill's texts into a text file of the Workflow tree: replaces the skill the file has
 * with that id, or adds it (before the skill `before`, or at the end). A file that does not
 * exist yet is created. A helper for writing a tree in pieces; the text files stay the source.
 *
 *   const { put } = require('./tools/put-text.cjs');
 *   put('task2.en.js', 'skip', `{ name: 'Skip Tasklist', … }`, 'expiry');
 */
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'trees', 'workflow', 'text');

function put(file, id, body, before) {
  const full = path.join(dir, file);
  const [, part, lang] = /^(\w+)\.(\w+)\.js$/.exec(file);
  let s = fs.existsSync(full)
    ? fs.readFileSync(full, 'utf8').replace(/\r\n/g, '\n')
    : `/**\n * The Workflow tree, ${part.replace(/(\d)/, ' level $1')}: its skills in ${lang === 'en' ? 'English' : 'Japanese'}.\n * Keys per skill as described in text/core.${lang}.js.\n */\nexport default {\n};\n`;
  const block = '  ' + id + ': ' + body.trim();
  const own = new RegExp('\\n  ' + id + ': \\{[\\s\\S]*?\\n  \\}(?=,?\\n)');
  if (own.test(s)) s = s.replace(own, () => '\n' + block);
  else if (before && s.includes('\n  ' + before + ': {')) s = s.replace('\n  ' + before + ': {', () => '\n' + block + ',\n\n  ' + before + ': {');
  else if (/export default \{\n\};\n$/.test(s)) s = s.replace(/\n\};\n$/, () => '\n' + block + '\n};\n');
  else s = s.replace(/\n\};\n$/, () => ',\n\n' + block + '\n};\n');
  fs.writeFileSync(full, s);
}

module.exports = { put };
