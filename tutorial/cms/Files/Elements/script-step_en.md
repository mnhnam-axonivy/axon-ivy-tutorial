<!-- markdownlint-disable MD051 -->
<!-- Links starting with #/ open pages and walkthroughs of the guide. -->

# Script Step

`Script` · Axon Ivy 14.0 · a main element of this guide

## What it is and when to use it

A **Script Step** changes the process data, or prepares something for a later step. In the words of the official reference: "With this element you can perform any transformation of the process data or start some other processing in order to make preparations for later steps." It sits in the *Activity* drawer of the palette.

Use it for calculations, for copying and combining values, for decisions written as code, and for log lines. Use a dedicated element instead when you talk to another system. The reference warns: "It is strongly recommended to use the dedicated process elements if you intend to use specific functionality and/or technology (such as invoking Web Services, querying Databases and so on) as these elements encapsulate their use and handle exceptions internally."

| You want to … | Use |
| --- | --- |
| choose a path depending on the data | Alternative (part 3) |
| read or write a database | Database Activity (part 7) |
| call a REST or web service | REST Client Activity, Web Service Call Activity (part 7) |
| reuse the same steps in several processes | a callable sub process with Call Sub (part 3) |
| write longer logic, or logic that needs what IvyScript lacks | a Java class, called from the Script Step |

## Details

The inscription of a Script Step has two tabs: **General** and **Output**.

### General

| Field | What it does |
| --- | --- |
| Name / Description → Display name | The name on the canvas. Say what the step does: "Calculate the total", not "Script". |
| Name / Description → Description | Shown as a tooltip; may use Markdown. |
| Means / Documents | References to documents that belong to the element. |
| Tags | Free keywords, for searching. |

### Output

The Output tab holds three things, in the order in which they run.

| Part | What it does |
| --- | --- |
| **Mapping** | A table with one row per attribute of the outgoing data, `out`, and the columns Attribute, Type and Expression. The row `out` itself has the expression `in`: by default the output is the input. An expression in a row gives that attribute a new value; a row without an expression leaves the attribute as it came in. The Designer writes the row `out` ← `in` into every mapping it saves. Without it, `out` starts as new, empty data, and every attribute without a row of its own is lost. |
| **Code** | IvyScript for what does not fit a row: conditions, loops, several steps. Empty by default. |
| **Disable Permission Checks (Execute this Script Step as SYSTEM)** | Runs the mapping and the code without permission checks; they never throw a `PermissionDeniedException`. Off unless you switch it on. |

The reference recommends: "use the output table to define simple assignments and the code tab if more extensive scripting is needed to calculate data."

Variables:

| Variable | Mapping | Code | What it is |
| --- | --- | --- | --- |
| `in` | yes | yes | The data that came into the step. |
| `out` | yes | yes | The data that leaves the step. |
| `ivy` | yes | yes | The environment: `ivy.log`, `ivy.cms`, … |
| local variables | | yes | Declared in the code, such as `Number price = 8;`. They exist only while the code runs. |

### At run time

1. The data comes in as `in`.
2. **The mapping runs**, row by row, from the top. The first row, `out` ← `in`, makes `out` the same data as `in`; each row below changes it, so a row that reads `in.a` or `out.a` already sees a value a row above set. Without that first row, `out` starts empty and `in` keeps the values as they came in.
3. **The code runs**, after the mapping: "The entered code will be executed *after* the execution of the *output tab*." So a value the code sets replaces the value of the mapping, and the mapping cannot see a value the code sets.
4. Inside the code, `in` and `out` are the same data, with the row `out` ← `in` or without any mapping: the engine runs the code as `out = in;` followed by it. A value written to `in.x` leaves the step too. Write to `out` all the same: it says what you mean.
5. `out` leaves the step. Local variables are gone.
6. When the mapping or the code fails, the request ends with the error `ivy:error:script`: the Runtime Log shows `Problem while processing request '…'` with the cause, and the person who started the process sees an error page. An Error Boundary Event on the step can catch the error (part 3).

Values a new case starts with: "Strings are initialized to an empty String, Numbers to zero, Lists to an empty List" (IvyScript reference); a Boolean starts as `false`. A String is never `null`.

Items 2, 4 and 6 and the Boolean are not in the documentation; they were read from the Designer's engine 14.0.1 (see the note at the end).

## IvyScript is not Java

The code is IvyScript. It looks like Java and calls Java classes, but it is a language of its own. On their forum the Axon Ivy team advises to use it for simple mappings and short snippets of up to about 20 lines, to put complex logic into Java, and says that IvyScript is not going to be extended.

### What IvyScript does not have

Each line was typed into a Script Step of the Designer for VS Code 14.0.1; the message is the one its Problems view shows. A process with such a line still starts, and fails when it reaches the step.

| Java | The Designer reports | Write instead |
| --- | --- | --- |
| `switch (x) { case "a": … }`, a switch expression, `yield` | `Unexpected token: '{'` | `if (x == "a") { … } else if (…) { … } else { … }` |
| `list.forEach(n -> …)`, streams with lambdas | `Unexpected token: '>'` | `for (String n : list) { … }`, or a Java class |
| `return;` | `Variable 'return' cannot be resolved` | an `else`, or an Alternative before the step |
| `throw new …(…);` | `Unexpected token: 'new'` | `BpmError.create("my:error").throwError();` after `import ch.ivyteam.ivy.bpm.error.BpmError;` |
| `throw e;` in a catch | `Class throw not found` | the same `BpmError` |
| `catch (A \| B e)` | `Unexpected token: '\|'` | two catch blocks |
| `new ArrayList<String>()` | `Class ArrayList<String> not found` | `new List<String>()`, `["a", "b"]`, or `import java.util.ArrayList;` first |
| `new ArrayList<>()` | `Unexpected token: '<>'` | the type in full: `new java.util.ArrayList<String>()` |
| `Map<String, String> m` | `Unexpected token: ','` | a `java.util.Map` without type arguments |
| `(String) value` | `Unexpected token: identifier 'value'` | `value as String` |
| `var x = …;` | `Class var not found` | the type: `String x = …;` |
| `final String x = …;` | `Unexpected token: identifier 'x'` | leave out `final` |
| `String[] a = …;` | `Unexpected token: '['` | a `List<String>` |
| `5L` | `Unexpected token: identifier 'L'` | `5` |
| `'text'` in single quotes | `Unexpected token: Illegal Time, Date, DateTime or Duration constant ''text''` | double quotes; single quotes are for dates, such as `'2026-12-01'` |
| `import java.util.Date;` | `The import java.util.Date collides with Date` | Ivy's own `Date`; `java.util.Date` by its full name |
| `text.length`, `list.size` without parentheses | `Field length not found for class String` | `text.length()`, `list.size()` |
| `if (in.text)`, `if (in.count)` | `An expression of type BOOLEAN is expected, but the type is String` | a comparison, such as `!in.text.isEmpty()` |
| `out.cost + " CHF"` | `Method +(String) for class Number of classloader null not found` | text first: `"Cost " + out.cost + " CHF"` |
| a statement without `;` | `A statement is expected, not an expression (maybe missing semicolon)`, or `Unexpected token: …` for the next line | the `;` |

### What works, but not as in Java

| You write | IvyScript gives | Java gives |
| --- | --- | --- |
| `in.text == null` | always `false`: a String attribute starts as `""`, and `in.text = null` leaves it `""` | `true` for a null String |
| `String s = null;` then `s == null` | `false`: a local String is never null either | `true` |
| `in.order == null`, for an attribute of a data class | `false`: the object is created the moment it is used | `true` |
| `in.#order == null` | `true` while nothing has created it: `.#` reads without creating | — |
| `in.text is initialized` (String, Number, Boolean, Date) | whether a value was ever assigned: `false` in a new case, `true` after any assignment, even of `0` or `false` | — |
| `"Hello" == "Hel" + "lo"` | `true`: `==` compares the text | `false`: two objects |
| `7 / 2` | `3.5`, also with Integer variables | `3` |
| `0.1 + 0.2` | `0.3` exactly | `0.30000000000000004` |
| `in.count = 7 / 2`, `count` an Integer | `3`, silently | does not compile |
| `if (in.flag = true)` | assigns, and is true; no warning | the same for a boolean |
| `"Total " + in.amount + 1` | `"Total 01"`: joined left to right | the same |

### What works as in Java

`if`/`else if`/`else`, `for (Number i = 0; i < 3; i++)` and `for (int i …)`, `for (String n : list)`, `while`, `break`, `continue`, `x++`, `x += 2`, `cond ? a : b`, `instanceof`, `try` with `catch (Exception e)`, `catch (NumberFormatException e)`, several catch blocks and `finally`, Java methods such as `in.text.toUpperCase()` or `String.format(…)`, and Java classes by their full name or after an `import`.

`try`/`catch` catches Java exceptions, IvyScript's own errors (a failed cast), and a BPM error thrown by `BpmError.create(…).throwError()`.

## Common questions

**Mapping or code?**
Simple assignments go into the mapping table: you see at a glance which attribute gets which value, and the Designer checks each row. Use the code for conditions, loops and anything with several steps.

**In which order do the mapping and the code run?**
First the mapping, row by row, then the code. [Walkthrough 3.3](#/walkthrough/3.3) shows the data after each of them.

**Why is my `== null` check never true?**
Because a String in IvyScript is never `null`. Ask `in.note.isEmpty()` instead. For an object of a data class, which is created as soon as you use it, ask `in.#order == null`: `.#` reads the attribute without creating the object.

**Can I use try/catch?**
Yes: `try { … } catch (Exception e) { … } finally { … }` works, also with a specific exception type and several catch blocks. What does not exist is `throw`. To raise an error that the process can catch, use `BpmError.create("my:error").throwError();` after `import ch.ivyteam.ivy.bpm.error.BpmError;`.

**Can I use generics, lists and maps?**
Generics only on lists: `List<String> names = ["a", "b"];` or `new List<String>()`. A `java.util.ArrayList` works with its full name or an import, but not with `<>`. A map with two type arguments does not parse; use `java.util.Map` without them. A Java list assigned to an attribute of type List becomes an Ivy List.

**How do I stop the code early?**
There is no `return`. Put the rest into an `else`, or, better, let an Alternative before the step choose another path.

**Can I call Java?**
Yes. Methods of Java objects work directly, such as `in.country.toUpperCase()`, and so do your own Java classes, by their full name or after an `import` line. For anything longer, write a Java class and call it from the step: Java has everything IvyScript lacks, and can be debugged.

**Where do I see what `ivy.log` writes?**
In the Runtime Log of the Designer: the Output view, channel Axon Ivy Runtime Log, which the command **Open Axon Ivy Runtime Log** opens. Each line shows the time, the level, the project, the category (`USER` for `ivy.log`), the element and the message. `ivy.log` has the levels `debug`, `info`, `warn` and `error`. Logging values is the quickest way to see what a step does.

**What does Disable Permission Checks do, and when do I need it?**
The mapping and the code run as SYSTEM, without permission checks. Use it only when the step must do something the user may not do, and only when you are sure that no unauthorized user reaches the step: the reference says "Use this feature with caution!"

## Common mistakes

### Text without quotes

- *Symptom:* the Designer marks the row: `Output 'out.status': Variable 'calculated' cannot be resolved`. Run anyway, and the request fails at the step with `ivy:error:script`.
- *Cause:* without quotes, a word is read as the name of a variable, attribute or class.
- *Fix:* write text in double quotes: `"calculated"`. [Walkthrough 3.1](#/walkthrough/3.1)

### A number in quotes, or a number where text belongs

- *Symptom:* `Output 'out.total': Cannot cast object of type String to type Number`, or in the code `Cannot cast object of type Integer to type String`.
- *Cause:* `"37.5"` is text, and `total` is a Number; `5` is a number, and `status` is a String.
- *Fix:* numbers without quotes, text in quotes. Keep a value with a unit, such as a price in CHF, as a number, and add the unit only where the value is shown. [Walkthrough 3.1](#/walkthrough/3.1)

### A misspelled attribute

- *Symptom:* `Output code: Field weigth not found for class tutorial.part3.ScriptCodeData`.
- *Cause:* the name does not match the data class; upper and lower case count.
- *Fix:* press Ctrl+Space in the field or the code and choose the attribute from the list.

### A Java switch

- *Symptom:* `Output code: Unexpected token: '{'`.
- *Cause:* IvyScript has no `switch`, and no switch expression or `yield`.
- *Fix:* `if` and `else if`. Compare text with `==`: in IvyScript it compares the text itself. [Walkthrough 3.2](#/walkthrough/3.2)

### A Java list or map

- *Symptom:* `Class ArrayList<String> not found`, `Unexpected token: '<>'`, or `Unexpected token: ','` for a typed map.
- *Cause:* IvyScript knows its own `List` and the classes of `java.lang`; of the generics it understands only those of a list.
- *Fix:* `List<String> labels = new List<String>();` or `["fragile"]`. For an ArrayList, `import java.util.ArrayList;` first. A map without type arguments. [Walkthrough 3.2](#/walkthrough/3.2)

### A lambda or a stream

- *Symptom:* `Output code: Unexpected token: '>'`.
- *Cause:* IvyScript has no lambdas.
- *Fix:* `for (String l : labels) { … }`, or a Java class that does the work. [Walkthrough 3.2](#/walkthrough/3.2)

### return or throw to leave the code

- *Symptom:* `Variable 'return' cannot be resolved`; `Unexpected token: 'new'` for `throw new …`. A process with `return` runs the lines before it, then fails with `ivy:error:script` when it reaches it.
- *Cause:* neither exists in IvyScript.
- *Fix:* an `else` for the rest, or an Alternative before the step. To raise an error, `BpmError.create("my:error").throwError();`. [Walkthrough 3.2](#/walkthrough/3.2)

### A Java cast

- *Symptom:* `Unexpected token: identifier 'value'` for `(String) value`.
- *Cause:* IvyScript casts with `as`.
- *Fix:* `value as String`.

### A number before the text

- *Symptom:* `Output code: Method +(String) for class Number of classloader null not found`, for example on `ivy.log.info(out.cost + " CHF")`.
- *Cause:* with a Number on the left, `+` needs a method of Number that takes text, and there is none. With text on the left, `+` joins.
- *Fix:* start with text: `"Cost " + out.cost + " CHF"`. [Walkthrough 3.2](#/walkthrough/3.2)

### A mapping that needs a value from the code

- *Symptom:* a value built in the mapping is missing a part the code sets, for example "Customer level: standard" instead of "Customer level: gold": the mapping saw only what the rows above it set.
- *Cause:* the mapping runs before the code.
- *Fix:* build the value in the code, below the lines it depends on, from `out`. [Walkthrough 3.3](#/walkthrough/3.3)

### The first row of the mapping emptied

- *Symptom:* after the step, attributes that had values are empty or 0; only those with a row of their own are set. The Designer reports nothing.
- *Cause:* the row `out` has no expression: `out` starts as new, empty data instead of the data that came in. A file written by hand without that row does the same (engine 14.0.1).
- *Fix:* give the row `out` the expression `in` again, as the Designer does for every new mapping.

### Checking text with `== null`

- *Symptom:* a check for a missing text never fires.
- *Cause:* a String in IvyScript is never `null`.
- *Fix:* `in.customer.isEmpty()`. [Walkthrough 3.3](#/walkthrough/3.3)

### Decimals into an Integer attribute

- *Symptom:* `3.5` is stored as `3`; no message.
- *Cause:* an Integer attribute keeps the whole part of what it is given.
- *Fix:* use `Number` for amounts and anything with decimals.

### `=` instead of `==` in a condition

- *Symptom:* the condition is always true, and the attribute has changed.
- *Cause:* `if (in.flag = true)` assigns, and the Designer does not warn.
- *Fix:* `if (in.flag)`, or `==`.

### Calling another system from a Script Step

- *Symptom:* errors of the call are hard to handle, and the process cannot react to them.
- *Cause:* the dedicated elements handle connection, errors and configuration for you; code in a Script Step does not.
- *Fix:* use the Database, REST Client or Web Service Call Activity (part 7).

### Disable Permission Checks without guarding the step

- *Symptom:* a user without the right role gets a result they should not get.
- *Cause:* with the option on, nothing in the step checks permissions.
- *Fix:* switch it off, or make sure the process lets only authorized users reach the step.

## Walkthroughs

- [2.4 A first Script Step: run it and read the log](#/walkthrough/2.4): one mapping row, one log line, the data at each step, two mistakes only the log shows.
- [3.1 Mapping values](#/walkthrough/3.1): the mapping table, expressions on `in`, what stays unchanged, two mistakes.
- [3.2 Writing code](#/walkthrough/3.2): local variables, conditions, calling Java, writing to the log, five Java habits IvyScript does not share.
- [3.3 Mapping first, then code](#/walkthrough/3.3): the order, Disable Permission Checks, two mistakes.

## See also

- [Start](#/part/2/start): the same mapping table and code, with `param`.
- [Alternative](#/part/3/alternative): conditions that choose a path.
- Official reference: [Script Step](https://developer.axonivy.com/doc/14.0/en/reference/process/process-elements/script-step.html) · [IvyScript language](https://developer.axonivy.com/doc/14.0/en/reference/process/ivyscript/language.html) · [IvyScript reference](https://developer.axonivy.com/doc/14.0/en/reference/process/ivyscript/reference.html) · [Java integration](https://developer.axonivy.com/doc/14.0/en/reference/process/ivyscript/java-integration.html) · [Error handling](https://developer.axonivy.com/doc/14.0/en/reference/process/error-handling.html)
- Forum: [switch](https://answers.axonivy.com/questions/390/switch-case-statement-in-ivyscript.html) · [generics](https://answers.axonivy.com/questions/878/error-on-creating-a-typed-map-in-ivyscript-ivyscript-and-generics.html) · [lambdas and streams](https://answers.axonivy.com/questions/1902/ivyscript-support-for-streams-and-lambda-expressions.html) · [casting](https://answers.axonivy.com/questions/341/casting-in-ivyscript.html) · [java.util.Date](https://answers.axonivy.com/questions/2489/i-can-t-import-java-util-date-in-script-step-why.html)

*Labels and error messages as the Designer for VS Code 14.0.1 shows them. The behaviour at run time was read from its engine 14.0.1 on 2026-11-16, with one test process for each line of the tables above.*
