<!-- markdownlint-disable MD051 -->
<!-- Links starting with #/ open pages and walkthroughs of the guide. -->

# Alternative

`Alternative` · Axon Ivy 14.0

## What it is and when to use it

In the words of the official reference: "An Alternative is a switch that connects the process flow to one of the exits of the element depending on the evaluation of the exit conditions." It is the *if – else if – else* of a process, and it is also used "to build loops in the process flow". On the canvas it is a diamond with a cross.

An Alternative has one or more ways in and several ways out, and it sends the token down exactly one of them. It reads the process data; it does not change it.

| You want to … | Use |
| --- | --- |
| take one of several paths, depending on the data | Alternative |
| repeat a step until something is true | Alternative with an exit that leads back |
| bring alternative paths together again | Alternative with one exit, or let both paths lead to the same element |
| run several paths at the same time | Split and Join |
| let a person decide | a User Task or a User Dialog before the Alternative (parts 5 and 6) |

## Details

The inscription of an Alternative has two tabs: **General** and **Condition**.

### General

Display name, Description, Means / Documents and Tags, as every element. Name the question the Alternative asks ("More than 500?"), and name its connectors with the answers ("yes", "no"): both show on the canvas.

### Condition

One row per exit, in the order in which the conditions are tried.

| Column | What it does |
| --- | --- |
| Type | Where the exit leads, as `<name of the element>: <its type>`, for example `Ask the manager: Script`. |
| Expression | The condition: an IvyScript expression that is true or false. An empty expression is always true. |

The rows can be moved up and down; their order is the order of the questions. A new Alternative lists every exit with an empty condition. In the process file the conditions are kept in `config.conditions`: the id of each connector with its condition, in the order of the table.

Variables in a condition:

| Variable | What it is |
| --- | --- |
| `in` | The process data. |
| `ivy` | The environment: `ivy.log`, `ivy.cms`, … |
| `out` | **Not available.** The Designer reports `Condition #1: Variable 'out' cannot be resolved`. |

### At run time

1. "The conditions are evaluated from the top to the bottom and the exit of the first one that evaluates to *true* is chosen." The rows below it are not tried at all.
2. An empty condition is true. An empty last row is therefore the *else*: it takes whatever the rows above did not take.
3. When no condition is true, the request fails. The Runtime Log has `Problem while processing request '…'`, caused by `java.lang.IllegalStateException: In the alternative all conditions evaluate to false`. The Designer warns of nothing.
4. A condition that fails, such as `1 / in.count > 0` with a count of 0, fails the request too.
5. A condition that is text and not a Boolean is never true on the engine, filled or not. The Designer reports `Condition #1: Cannot cast object of type String to type Boolean`.
6. `in.flag = true` with a single `=` assigns: it sets `flag` and is true. The Designer reports nothing.
7. Nothing stops a loop: a loop back through an Alternative ran 10 000 rounds on the engine.

Points 2 to 7 are not in the documentation; they were read from the Designer and its engine 14.0.1 on 2026-11-16. An exit that a process file does not list in `config.conditions` (a file written by hand) is tried after the listed ones, as if its condition were empty.

## Common questions

**How do I make an "else" path?**
Leave the condition of the last row empty. It is always true, so it takes every case the rows above did not take.

**In which order are the conditions tried?**
From the top of the Condition tab to the bottom; the first true one decides. When two conditions can both be true, the narrower one has to come first: "more than 30 kg" before "more than 2 kg".

**Can a condition change the data?**
It can, by accident: `in.flag = true` assigns. Change data in a Script Step before the Alternative, and keep the conditions to comparisons and Booleans.

**How do I bring two paths together again?**
Let both lead to the same element, or to an Alternative with one exit and an empty condition, which also makes the meeting point visible. Do not use a Join: it waits for every incoming path, and of alternative paths only one comes.

**How do I build a loop?**
Lead an exit back to an element before the Alternative. Make sure something the conditions read changes in every round, and that one exit is sure to be taken in the end, such as a maximum number of rounds.

**Why does my request fail with "In the alternative all conditions evaluate to false"?**
None of the conditions was true for this data. Usually the last row has a condition where an empty one belongs, or a value the conditions check did not arrive (a parameter not sent is 0 or empty).

## Common mistakes

### No condition is true

- *Symptom:* the request fails: `Problem while processing request '…'`, caused by `IllegalStateException: In the alternative all conditions evaluate to false`.
- *Cause:* every row has a condition, and none fits this data.
- *Fix:* leave the last row empty. Handle missing values on a path of their own. [Walkthrough 3.5](#/walkthrough/3.5)

### The wider condition first

- *Symptom:* some cases always take the same exit, and one exit is never taken.
- *Cause:* a condition that is true for more cases stands above a narrower one: "more than 2 kg" above "more than 30 kg".
- *Fix:* move the narrower condition up, or make each condition exact on its own: `in.weight > 2 && in.weight <= 30`. [Walkthrough 3.5](#/walkthrough/3.5)

### Text instead of a condition

- *Symptom:* the Designer reports `Condition #1: Cannot cast object of type String to type Boolean`; at run time the exit is never taken.
- *Cause:* the condition is a text attribute, such as `in.employee`.
- *Fix:* compare it: `in.employee == "Anna"`, `!in.employee.isEmpty()`. [Walkthrough 3.4](#/walkthrough/3.4)

### `=` instead of `==`

- *Symptom:* every case takes this exit, and a Boolean attribute is suddenly true. The Designer reports nothing.
- *Cause:* `in.urgent = true` assigns true and is true.
- *Fix:* `in.urgent == true`, or simply `in.urgent`. [Walkthrough 3.4](#/walkthrough/3.4)

### `out` in a condition

- *Symptom:* the Designer reports `Condition #1: Variable 'out' cannot be resolved`; at run time the request fails.
- *Cause:* an Alternative has no outgoing data of its own, only `in`.
- *Fix:* read `in`. [Walkthrough 3.5](#/walkthrough/3.5)

### A loop that never ends

- *Symptom:* the same step runs again and again; the request does not end.
- *Cause:* nothing in the loop changes what the conditions read, or no way out is sure to come.
- *Fix:* change a counter or a state in every round, and give the loop an exit that ends it after a maximum. [Walkthrough 3.6](#/walkthrough/3.6)

### A Join where an Alternative belongs

- *Symptom:* after two alternative paths meet, nothing runs, and the Runtime Log has no error.
- *Cause:* a Join waits for a token on every incoming connector; of alternative paths only one comes.
- *Fix:* bring alternative paths together with an Alternative, or let them lead to the same element. [Walkthrough 3.6](#/walkthrough/3.6)

## Walkthroughs

- [3.4 Two paths, one condition](#/walkthrough/3.4): the Condition tab, an empty condition as the else, two runs, two mistakes (text as a condition, `=` instead of `==`).
- [3.5 Several conditions](#/walkthrough/3.5): the order of the conditions, the empty last row, three mistakes (the wider condition first, no row true, `out` in a condition).
- [3.6 Coming back together, and loops](#/walkthrough/3.6): a loop, two ways out, paths that meet again, two mistakes (a loop that never ends, a Join where an Alternative belongs).

## See also

- [Split and Join](#/part/3/split-join): several paths at the same time.
- [Script Step](#/part/3/script-step): where the data a condition reads is prepared.
- Official reference: [Alternative](https://developer.axonivy.com/doc/14.0/en/reference/process/process-elements/alternative.html) · [IvyScript language](https://developer.axonivy.com/doc/14.0/en/reference/process/ivyscript/language.html)

*Labels and error messages as the Designer for VS Code 14.0.1 shows them; the behaviour at run time read from its engine 14.0.1.*
