/**
 * IvyScript of the simulation against the real Designer and engine 14.0.1.
 *
 * Every case below was run on 2026-11-16 as a probe process: the Designer's Problems view gave
 * the message (`designer`), the Designer's engine ran it and its Runtime Log gave the lines
 * (`logs`), or the run failed with ivy:error:script and the cause (`fails`). The simulation has
 * to give the same. See PROGRESS.md, "Verified on the engine".
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { runScript, validateScript, javaClassOf } from '../runtime/model/ivyscript.js';

const fields = [
  { name: 'text', type: 'String' }, { name: 'other', type: 'String' }, { name: 'amount', type: 'Number' },
  { name: 'count', type: 'Integer' }, { name: 'flag', type: 'Boolean' }, { name: 'day', type: 'Date' },
  { name: 'names', type: 'List<String>' }, { name: 'booking', type: 'tutorial.part2.StartListData' }
];
const classes = { 'tutorial.part2.StartListData': { name: 'tutorial.part2.StartListData', simpleName: 'StartListData', fields: [{ name: 'day', type: 'String' }, { name: 'space', type: 'String' }] } };
const fresh = () => ({ text: '', other: '', amount: 0, count: 0, flag: false, day: null, names: [], booking: null });

function context(logs) {
  return { data: fresh(), fields, classes, dataClassName: 'tutorial.probe.ProbeData', vars: {}, assigned: new Set(), log: (level, message) => logs.push(message) };
}

/** What the Designer reports for the code, or null. */
const designer = code => {
  const e = validateScript(code, { fields, classes, dataClassName: 'tutorial.probe.ProbeData', vars: {} });
  return e ? e.message : null;
};

/** The log lines of a run, and the error it ended with. */
function run(code) {
  const logs = [];
  try {
    runScript(code, context(logs));
    return { logs, error: null };
  } catch (e) {
    return { logs, error: e };
  }
}

const cases = [
  // what IvyScript does not have: the Designer's messages
  ['switch', 'switch (in.text) {\n  case "a": ivy.log.info("a");\n}', { designer: "Unexpected token: '{'" }],
  ['switch expression', 'String r = switch (in.text) {\n  default -> "x";\n};', { designer: "Unexpected token: '{'" }],
  ['do while', 'do {\n  in.count++;\n} while (in.count < 3);', { designer: "Unexpected token: '{'" }],
  ['lambda', 'in.names.forEach(n -> ivy.log.info(n));', { designer: "Unexpected token: '>'" }],
  ['throw new', 'throw new IllegalStateException("boom");', { designer: "Unexpected token: 'new'" }],
  ['throw e', 'try {\n  Integer.parseInt("abc");\n} catch (Exception e) {\n  throw e;\n}', { designer: 'Class throw not found' }],
  ['yield', 'String r2 = "x";\nyield r2;', { designer: 'Variable r2 already declared' }],
  ['return', 'ivy.log.info("before");\nreturn;\nivy.log.info("after");', { designer: "Variable 'return' cannot be resolved", logs: ['before'], fails: "Variable 'return' cannot be resolved" }],
  ['var', 'var v = "x";', { designer: 'Class var not found' }],
  ['final', 'final String fs = "x";', { designer: "Unexpected token: identifier 'fs'" }],
  ['array', 'String[] arr = new String[3];', { designer: "Unexpected token: '['" }],
  ['array literal', 'String[] arr2 = {"a", "b"};', { designer: "Unexpected token: '['" }],
  ['Java cast', 'Object o = "x";\nString s2 = (String) o;', { designer: "Unexpected token: identifier 'o'" }],
  ['multi-catch', 'try {\n  Integer.parseInt("abc");\n} catch (NumberFormatException | ArithmeticException e) {\n}', { designer: "Unexpected token: '|'" }],
  ['diamond', 'List<String> b = new ArrayList<>();', { designer: "Unexpected token: '<>'" }],
  ['ArrayList without import', 'List<String> a = new ArrayList<String>();', { designer: 'Class ArrayList<String> not found' }],
  ['typed Map', 'java.util.Map<String, String> m = new java.util.HashMap<String, String>();', { designer: "Unexpected token: ','" }],
  ['long literal', 'Number big = 5L;', { designer: "Unexpected token: identifier 'L'" }],
  ['single quotes', "String s1 = 'abc';", { designer: "Unexpected token: Illegal Time, Date, DateTime or Duration constant ''abc''" }],
  ['import java.util.Date', 'import java.util.Date;\nivy.log.info("x");', { designer: 'The import java.util.Date collides with Date' }],
  ['length without ()', 'ivy.log.info("x " + in.text.length);', { designer: 'Field length not found for class String' }],
  ['size without ()', 'ivy.log.info("x " + in.names.size);', { designer: 'Field size not found for class List<String>' }],
  ['misspelled method', 'ivy.log.info("x " + in.text.toUppercase());', { designer: 'Method toUppercase() for class String of classloader null not found' }],
  ['missing semicolon between', 'in.amount = 1\nivy.log.info("x");', { designer: "Unexpected token: identifier 'ivy'" }],
  ['missing semicolon at the end', 'ivy.log.info("no semicolon")', { designer: 'A statement is expected, not an expression (maybe missing semicolon)' }],
  ['a Number into a String', 'in.text = in.amount;', { designer: 'Cannot cast object of type Number to type String', fails: 'Cannot cast object of type Integer to type String' }],
  ['an Integer before text', 'in.text = 5 + "x";', { designer: 'Method +(String) for class Integer of classloader null not found' }],
  ['text as a condition', 'if (in.text) {\n  ivy.log.info("x");\n}', { designer: 'An expression of type BOOLEAN is expected, but the type is String' }],
  ['a number as a condition', 'if (in.count) {\n  ivy.log.info("x");\n}', { designer: 'An expression of type BOOLEAN is expected, but the type is Integer' }],
  ['? : after text', 'ivy.log.info("x " + in.flag ? "y" : "n");', { designer: 'An expression of type BOOLEAN is expected, but the type is String' }],
  ['a field that does not exist', 'ivy.log.info("x " + in.nothere);', { designer: 'Field nothere not found for class tutorial.probe.ProbeData' }],
  ['a mixed list into List<String>', 'in.names = ["a", 1];', { designer: 'Cannot cast object of type Integer to type String', fails: 'Cannot cast object of type Integer to type String' }],

  // what works, and what it gives
  ['try/catch a Java exception', 'try {\n  Integer.parseInt("abc");\n  ivy.log.info("not caught");\n} catch (Exception e) {\n  ivy.log.info("caught " + e.getMessage());\n}', { designer: null, logs: ['caught For input string: "abc"'] }],
  ['catch by its own type', 'try {\n  Integer.parseInt("abc");\n} catch (NumberFormatException e) {\n  ivy.log.info("caught " + e.getClass().getName());\n}', { designer: null, logs: ['caught java.lang.NumberFormatException'] }],
  ['several catch blocks', 'try {\n  Integer.parseInt("abc");\n} catch (ArithmeticException a) {\n  ivy.log.info("arithmetic");\n} catch (Exception e) {\n  ivy.log.info("general " + e.getClass().getName());\n}', { designer: null, logs: ['general java.lang.NumberFormatException'] }],
  ['catch division by zero', 'try {\n  ivy.log.info("x " + (1 / 0));\n} catch (Exception e) {\n  ivy.log.info("caught " + e.getClass().getName() + ": " + e.getMessage());\n}', { designer: null, logs: ['caught java.lang.ArithmeticException: / by zero'] }],
  ['catch a failed cast', 'try {\n  in.text = in.amount;\n} catch (Exception e) {\n  ivy.log.info("caught " + e.getClass().getName());\n}', { designer: 'Cannot cast object of type Number to type String', logs: ['caught ch.ivyteam.ivy.scripting.exceptions.invocation.IvyScriptCastException'] }],
  ['catch substring out of range', 'try {\n  in.text = in.text.substring(0, 3);\n} catch (Exception e) {\n  ivy.log.info("caught " + e.getClass().getName() + ": " + e.getMessage());\n}', { designer: null, logs: ['caught java.lang.StringIndexOutOfBoundsException: Range [0, 3) out of bounds for length 0'] }],
  ['finally', 'try {\n  ivy.log.info("try");\n} catch (java.lang.Exception ex) {\n  ivy.log.info("catch");\n} finally {\n  ivy.log.info("finally");\n}', { designer: null, logs: ['try', 'finally'] }],
  ['try/finally', 'try {\n  ivy.log.info("try");\n} finally {\n  ivy.log.info("finally");\n}', { designer: null, logs: ['try', 'finally'] }],
  ['for with Number', 'for (Number i = 0; i < 3; i++) {\n  ivy.log.info("i " + i);\n}', { designer: null, logs: ['i 0', 'i 1', 'i 2'] }],
  ['for with int', 'for (int j = 0; j < 2; j++) {\n  ivy.log.info("j " + j);\n}', { designer: null, logs: ['j 0', 'j 1'] }],
  ['for each', 'in.names.add("a");\nin.names.add("b");\nfor (String n : in.names) {\n  ivy.log.info("n " + n);\n}', { designer: null, logs: ['n a', 'n b'] }],
  ['while and ++', 'while (in.count < 3) {\n  in.count++;\n}\nivy.log.info("count " + in.count);', { designer: null, logs: ['count 3'] }],
  ['+=', 'in.count += 2;\nivy.log.info("count " + in.count);', { designer: null, logs: ['count 2'] }],
  ['break', 'for (String n : ["a", "b", "c"]) {\n  if (n == "b") {\n    break;\n  }\n  ivy.log.info(n);\n}', { designer: null, logs: ['a'] }],
  ['continue', 'for (String n : ["a", "b", "c"]) {\n  if (n == "b") {\n    continue;\n  }\n  ivy.log.info(n);\n}', { designer: null, logs: ['a', 'c'] }],
  ['else if', 'in.count = 2;\nif (in.count == 1) {\n  ivy.log.info("one");\n} else if (in.count == 2) {\n  ivy.log.info("two");\n} else {\n  ivy.log.info("other");\n}', { designer: null, logs: ['two'] }],
  ['a list literal', 'List<String> d = ["x", "y"];\nivy.log.info("size " + d.size());', { designer: null, logs: ['size 2'] }],
  ['new List<String>()', 'List<String> e = new List<String>();\ne.add("x");\nivy.log.info("size " + e.size());', { designer: null, logs: ['size 1'] }],
  ['java.util.ArrayList with its full name', 'java.util.List<String> c = new java.util.ArrayList<String>();\nivy.log.info("size " + c.size());', { designer: null, logs: ['size 0'] }],
  ['ArrayList after an import', 'import java.util.ArrayList;\nList<String> a = new ArrayList<String>();\na.add("x");\nivy.log.info("size " + a.size());', { designer: null, logs: ['size 1'] }],
  ['a raw HashMap', 'java.util.Map m2 = new java.util.HashMap();\nm2.put("a", "b");\nivy.log.info("map " + m2);', { designer: null, logs: ['map {a=b}'] }],
  ['as', 'Object o2 = "x";\nString s3 = o2 as String;\nivy.log.info("as " + s3);', { designer: null, logs: ['as x'] }],
  ['instanceof', 'Object o = 5;\nif (o instanceof Integer) {\n  ivy.log.info("instanceof");\n}', { designer: null, logs: ['instanceof'] }],
  ['a date constant', "Date due = '2026-12-01';\nivy.log.info(\"due \" + due);", { designer: null, logs: ['due 2026-12-01'] }],
  ['String.format', 'ivy.log.info("f " + String.format("%s-%s", "a", "b"));', { designer: null, logs: ['f a-b'] }],
  ['IF()', 'ivy.log.info("if " + IF(in.flag, "y", "n"));', { designer: null, logs: ['if n'] }],
  ['power', 'ivy.log.info("p " + (2 ** 5));', { designer: null, logs: ['p 32'] }],
  ['nested data class, created when used', 'in.booking.day = "Monday";\nivy.log.info("day " + in.booking.day);', { designer: null, logs: ['day Monday'] }],

  // works, but not as in Java
  ['== null on text is never true', 'ivy.log.info("null " + (in.text == null));', { designer: null, logs: ['null false'] }],
  ['a local String set to null', 'String sn = null;\nivy.log.info("null " + (sn == null) + " " + (sn is initialized));', { designer: null, logs: ['null false false'] }],
  ['null into a String attribute', 'in.text = null;\nivy.log.info("[" + in.text + "] " + (in.text == null));', { designer: null, logs: ['[] false'] }],
  ['a data class object is created when used', 'ivy.log.info("null " + (in.booking == null));', { designer: null, logs: ['null false'] }],
  ['.# does not create it', 'ivy.log.info("null " + (in.#booking == null));', { designer: null, logs: ['null true'] }],
  ['is initialized on text', 'ivy.log.info("before " + (in.text is initialized));\nin.text = "x";\nivy.log.info("after " + (in.text is initialized));', { designer: null, logs: ['before false', 'after true'] }],
  ['is initialized stays true after 0', 'ivy.log.info("a " + (in.amount is initialized));\nin.amount = 5;\nivy.log.info("b " + (in.amount is initialized));\nin.amount = 0;\nivy.log.info("c " + (in.amount is initialized));', { designer: null, logs: ['a false', 'b true', 'c true'] }],
  ['start values', 'ivy.log.info("flag=" + in.flag + " count=" + in.count + " amount=" + in.amount + " names=" + in.names.size() + " text=[" + in.text + "]");', { designer: null, logs: ['flag=false count=0 amount=0 names=0 text=[]'] }],
  ['== compares text', 'ivy.log.info(("Hello" == "HELLO") + " " + ("Hello" == "Hel" + "lo") + " " + (in.text == ""));', { designer: null, logs: ['false true true'] }],
  ['text compares with <', 'ivy.log.info("lt " + ("a" < "b"));', { designer: null, logs: ['lt true'] }],
  ['7 / 2', 'in.text = "" + 7 / 2;\nivy.log.info(in.text);', { designer: null, logs: ['3.5'] }],
  ['an Integer drops the decimals', 'in.count = 7 / 2;\nivy.log.info("count " + in.count);', { designer: null, logs: ['count 3'] }],
  ['a Number into an Integer', 'in.amount = 2.5;\nin.count = in.amount;\nivy.log.info("count " + in.count);', { designer: null, logs: ['count 2'] }],
  ['0.1 + 0.2', 'in.amount = 0.1 + 0.2;\nivy.log.info("sum " + in.amount);', { designer: null, logs: ['sum 0.3'] }],
  ['10 / 3', 'in.amount = 10;\nivy.log.info("q " + (in.amount / 3));', { designer: null, logs: ['q 3.3333333333333335'] }],
  ['rounding to cents', 'in.amount = 1.005;\nivy.log.info("r " + Math.round(in.amount * 100) / 100);', { designer: null, logs: ['r 1.01'] }],
  ['an assignment as a condition', 'if (in.flag = true) {\n  ivy.log.info("inside");\n}', { designer: null, logs: ['inside'] }],
  ['text + a number', 'ivy.log.info("x " + in.amount + 1);', { designer: null, logs: ['x 01'] }],
  ['x++ gives the old value', 'ivy.log.info("v " + in.count++);\nivy.log.info("after " + in.count);', { designer: null, logs: ['v 0', 'after 1'] }],
  ['division by zero', 'ivy.log.info("x " + (1 / 0));', { designer: null, fails: '/ by zero' }],
  ['substring out of range', 'ivy.log.info("x " + in.text.substring(0, 3));', { designer: null, fails: 'Range [0, 3) out of bounds for length 0' }],
  ['get beyond the end', 'ivy.log.info("x " + in.names.get(5));', { designer: null, fails: 'Index 5 out of bounds for length 0' }]
];

for (const [name, code, expected] of cases) {
  test('engine 14.0.1: ' + name, () => {
    if ('designer' in expected) assert.equal(designer(code), expected.designer, 'Designer');
    if (expected.logs || expected.fails) {
      const result = run(code);
      if (expected.logs) assert.deepEqual(result.logs, expected.logs, 'Runtime Log');
      if (expected.fails) {
        assert.ok(result.error, 'the run fails');
        assert.ok(String(result.error.message).endsWith(expected.fails), result.error.message);
      } else if (expected.logs) assert.equal(result.error, null, result.error && result.error.message);
    }
  });
}

test('engine 14.0.1: an error caught in a script names its Java class', () => {
  const result = run('Integer.parseInt("abc");');
  assert.equal(javaClassOf(result.error), 'java.lang.NumberFormatException');
});
