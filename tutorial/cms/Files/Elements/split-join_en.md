<!-- markdownlint-disable MD051 -->
<!-- Links starting with #/ open pages and walkthroughs of the guide. -->

# Split and Join

`Split` · `Join` · Axon Ivy 14.0

## What they are and when to use them

They are used together: "Use this element always together with the Join element."

- **Split**: "This allows you to model parallel process paths." It "may split one process path into a number of paths that are executed concurrently. The input process data is copied to all the parallel executions but can be manipulated in each path individually."
- **Join**: "This element synchronizes and joins a parallel execution of process paths together. The output of each incoming path is copied into the element and can be used to define its output." It "waits until all of the parallel incoming process paths have finished and reached this element."

On the canvas both are diamonds with a plus. The reference has a tip for them: "Use the split and the join element to execute parallel database or web service requests."

| You want to … | Use |
| --- | --- |
| do several independent things, and go on when all are done | Split, then Join |
| take one of several paths | Alternative |
| bring alternative paths together again | Alternative, not a Join |

## Details

### Split

Two tabs: **General** and **Output**.

| Section | What it does |
| --- | --- |
| Mapping | One root per outgoing connector: `out1`, `out2`, …, each the process data of its path, with a row per attribute. "For each outgoing connection you have a separate `outX` object available which carries the data of the Xth output." In the Designer, hovering over a connector shows which variable it carries. |
| Code | IvyScript that runs after the mapping, with `in` and `out1`, `out2`, … |

A new Split maps only `out1` ← `in`. In the process file each outgoing connector names its variable (`"outVar" : "out2"`).

### Join

Two tabs: **General** and **Output**.

| Section | What it does |
| --- | --- |
| Mapping | The data that goes on, `out`, with a row per attribute. "For each incoming connection you have a separate `inX` object available which carries the data of the Xth input." There is no `in`. A new Join maps `out` ← `in1`. |
| Code | IvyScript that runs after the mapping, with `out` and `in1`, `in2`, … |

In the process file each incoming connector names its variable (`"var" : "in2"`).

### At run time

1. The Split gives each outgoing connector a token of its own, with the data its `outX` row says. An `outX` without a row starts as new, empty data.
2. The paths take turns, one element each. On the engine 14.0.1 the second path went first: two paths ran `b1 a1 b2 a2`, three paths `2, 3, 1`. In the Axon Ivy community: paths of a Split run in the same thread, so they are only pseudo-parallel; real parallel work happens with elements that run in a thread of their own, such as Program Interface, Database or Web Service Call ([answers 329](https://answers.axonivy.com/questions/329/multi-threading-in-ivy-processes.html), 2010).
3. A token that reaches the Join waits there. When a token has come in on every incoming connector, the Join runs its Output, and one token goes on with `out`.
4. With the default `out` ← `in1`, the data of the first path goes on, and what the other paths changed is lost unless a row takes it: `out.references` ← `in2.references`.
5. A Join that is reached by fewer paths than it has keeps the token: nothing after it runs, and the request ends without an error.
6. `in` in a Join fails: the Designer reports `Output code: Variable 'in' cannot be resolved`.

Points 1, 2 and 4 to 6 are not in the documentation; they were read from the Designer and its engine 14.0.1 on 2026-11-16.

## Common questions

**Do the paths really run at the same time?**
They take turns, one element each, in one thread. Steps that only compute are not faster in parallel; calls to other systems that wait for an answer are where a Split pays off.

**In which order do the paths run?**
Do not rely on one. On the engine 14.0.1 the second path went first. Paths that need each other's results are not parallel: put them one after the other.

**Why is the data empty in my second path?**
A new Split maps only `out1` ← `in`. Map every `outX` from `in`.

**How do I get the results of all paths?**
In the Output of the Join: `out` ← `in1` takes the first path's data, and one row per result of the other paths takes it from its `inX`.

**What happens when a path never reaches the Join?**
The Join waits for it, and the process does not go on after the Join. Make sure every path the Split starts leads to the Join.

## Common mistakes

### The second path has no data

- *Symptom:* a step on a later path finds empty attributes, for example "References of : good". The run does not fail.
- *Cause:* its `outX` has no row; a new Split maps only `out1` ← `in`.
- *Fix:* map every path: `out2` ← `in`, `out3` ← `in`, … [Walkthrough 3.7](#/walkthrough/3.7)

### The Join keeps only one path

- *Symptom:* after the Join, a value a path set is missing.
- *Cause:* the Join maps `out` ← `in1`; what the other paths changed is not taken.
- *Fix:* add a row per result: `out.references` ← `in2.references`. [Walkthrough 3.7](#/walkthrough/3.7)

### `in` in a Join

- *Symptom:* the Designer reports `Output code: Variable 'in' cannot be resolved`.
- *Cause:* a Join has one `inX` per incoming path and no `in`.
- *Fix:* say which path the value comes from: `in1.name`. [Walkthrough 3.7](#/walkthrough/3.7)

### A Join after alternative paths

- *Symptom:* nothing runs after the Join; the Runtime Log has no error.
- *Cause:* the paths come from an Alternative, so only one of them is taken, and the Join waits for the others.
- *Fix:* bring alternative paths together with an Alternative; a Join only closes what a Split opened. [Walkthrough 3.6](#/walkthrough/3.6)

### Paths that depend on each other

- *Symptom:* a path reads a value another path sets, and finds it empty or old.
- *Cause:* each path has its own copy of the data; what one path changes, the other does not see before the Join.
- *Fix:* do dependent steps one after the other; bring results together in the Join.

## Walkthroughs

- [3.7 Two paths at the same time](#/walkthrough/3.7): the Split with `out1` and `out2`, two tokens that take turns, the Join with `in1` and `in2`, three mistakes (the second path without data, the Join keeps one path, `in` in a Join).
- [3.6 Coming back together, and loops](#/walkthrough/3.6): a Join where an Alternative belongs.

## See also

- [Alternative](#/part/3/alternative): one of several paths.
- [Script Step](#/part/3/script-step): the mapping table that the Output tabs share.
- Official reference: [Split](https://developer.axonivy.com/doc/14.0/en/reference/process/process-elements/split.html) · [Join](https://developer.axonivy.com/doc/14.0/en/reference/process/process-elements/join.html)
- Community: [Multi threading in Ivy processes](https://answers.axonivy.com/questions/329/multi-threading-in-ivy-processes.html)

*Labels and error messages as the Designer for VS Code 14.0.1 shows them; the behaviour at run time read from its engine 14.0.1.*
