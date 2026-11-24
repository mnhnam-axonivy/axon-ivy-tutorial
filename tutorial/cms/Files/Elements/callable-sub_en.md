<!-- markdownlint-disable MD051 -->
<!-- Links starting with #/ open pages and walkthroughs of the guide. -->

# Callable sub process

`SubProcessCall` · `CallSubStart` · `CallSubEnd` · Axon Ivy 14.0

## What it is and when to use it

A callable sub process is a process of the kind *Callable Sub Process* (walkthrough 2.1) that other processes call, like a function. Three elements belong to it:

- **Call Sub**, in the calling process: "The Call Sub element allows to embed a process (independent subprocess) into another." "This is like jumping from the main process into the called sub process, execute the sub process and afterwards jump back."
- **Sub Process Start**, where the callable sub process begins: "Each Sub Start element can be called by a Call Sub element. It has input and output parameters." It "is located in the Subprocess drawer of the process editor palette and only available in callable sub processes."
- **Sub Process End**, where it ends and goes back to the caller. It has only the General tab.

"Process data attributes from the main process are mapped to parameters for the called sub process." The sub process works on data of its own and returns its results.

| You want to … | Use |
| --- | --- |
| use the same steps in several processes | callable sub process |
| fold some steps of one process into a box, for readability | Embedded Subprocess (walkthrough 3.9) |
| start a process that runs on its own, for someone else, later | a Trigger Step (part 6) |

The Designer creates one with the command *New Callable Sub Process*.

## Details

### Call Sub

Three tabs: **General**, **Process** and **Output**.

| Tab | Section | What it does |
| --- | --- | --- |
| Process | Process start | The start that is called: the process, a colon, and the signature, for example `tutorial/part3/ShippingCost:calculate(Number,String)`. *Create new Sub Process* creates one. |
| Process | Mapping | One row per input parameter of that start: `param.<name>` ← an expression on `in`. "You can use any IvyScript expression in the parameter mapping." The tooltip of a parameter shows its description. |
| Output | Mapping, Code | The caller's data after the call, `out`, with `result`: "The variable `result` contains the output parameters that are returned by the called sub process". The first row is `out` ← `in`. |

### Sub Process Start

Three tabs: **General**, **Start** and **Result**.

| Tab | Section | What it does |
| --- | --- | --- |
| Start | Signature | The name a Call Sub calls it by; the display name follows it, with the types: `calculate(Number,String)`. |
| Start | Input parameters | Name, type and description of each parameter. The list may be empty. |
| Start | Mapping, Code | `param.<name>` into the sub process's own data, `out`. There is no `in`. |
| Result | Result parameters | What the sub process returns: name, type and description. |
| Result | Mapping, Code | `result.<name>` ← an expression on `in`, the sub process's data. "All logic in this tab will be executed when the end element is reached." |

### Sub Process End

Only **General**. It ends the sub process and returns to the Call Sub.

### At run time

1. The Call Sub maps the parameters from the caller's data.
2. The sub process starts with new data of its own. The caller's data is not there: an attribute of the caller with the same name is empty in the sub process.
3. The Sub Process Start maps `param` into that data, and its code runs. Then the steps of the sub process run.
4. At the Sub Process End, the Result tab fills `result` from the sub process's data as the steps left it.
5. Back in the caller, the Output tab maps `result` into the caller's data, and the process goes on after the Call Sub.
6. A parameter that the Call Sub does not map arrives as 0 or empty; a result parameter that the Result tab does not set returns as 0 or empty. Neither is reported.
7. An Output mapping without the row `out` ← `in` starts the caller's data anew: everything the call did not return is lost.
8. An Error End in the sub process throws its error to the caller, where an Error Boundary Event on the Call Sub, or an Error Start of the caller, can catch it ([Error handling](#/part/3/error-handling)).

Points 2 and 4 (the values after the steps), 6 and 7 are not in the documentation; they were read from the Designer's engine 14.0.1 on 2026-11-16.

## Common questions

**How do I pass values to the sub process, and get its results back?**
Declare input parameters on the Start tab and result parameters on the Result tab of the Sub Process Start. The Call Sub maps `param.<name>` on its Process tab and takes `result.<name>` on its Output tab.

**Can the sub process read the caller's process data?**
No. It has data of its own and gets only what the parameters bring. Pass what it needs.

**When is the result filled?**
When the Sub Process End is reached. The Result tab reads the sub process's data as its steps left it.

**What is the difference to an Embedded Subprocess?**
An Embedded Subprocess is part of its process and works on the same data; it cannot be called from elsewhere. A callable sub process is a process of its own, with its own data, that any process can call.

**What happens when the sub process fails?**
Its error goes to the caller. Catch it with an Error Boundary Event on the Call Sub, or with an Error Start of the caller (walkthrough 3.10).

## Common mistakes

### A parameter not passed

- *Symptom:* the sub process calculates with 0 or an empty text; the run does not fail.
- *Cause:* the Process tab of the Call Sub has no row for that parameter. The Designer reports nothing.
- *Fix:* map every parameter the start declares. [Walkthrough 3.8](#/walkthrough/3.8)

### A result not set

- *Symptom:* the caller gets 0 or an empty text from the sub process.
- *Cause:* the Result tab of the Sub Process Start does not fill that result parameter.
- *Fix:* map every result parameter from the sub process's data. [Walkthrough 3.8](#/walkthrough/3.8)

### The Output without `out` ← `in`

- *Symptom:* after the call, the caller's attributes are empty; only what the call returned is set.
- *Cause:* the Output tab of the Call Sub has no expression in its row `out`, so `out` starts as new data.
- *Fix:* keep `out` ← `in` as the first row, as the Designer writes it. [Walkthrough 3.8](#/walkthrough/3.8)

### Expecting the caller's data in the sub process

- *Symptom:* in the sub process, an attribute is empty that the caller had filled.
- *Cause:* the sub process has its own data class and its own data.
- *Fix:* add a parameter for the value and map it in the Call Sub. [Walkthrough 3.8](#/walkthrough/3.8)

## Walkthroughs

- [3.8 Calling a sub process](#/walkthrough/3.8): the Sub Process Start with its Start and Result tabs, the Call Sub with its Process and Output tabs, a run into the sub process and back, three mistakes (a parameter not passed, a result not set, the Output without `out` ← `in`).
- [3.10 Throwing and catching an error](#/walkthrough/3.10): an error that a callable sub process throws to its caller.

## See also

- [Embedded Subprocess and BPMN activities](#/part/3/embedded-bpmn): a box with the same data.
- [Error handling](#/part/3/error-handling): errors that come back from a sub process.
- [Start and Process End](#/part/2/start): the Start tab that a Sub Process Start shares with the Request Start.
- Official reference: [Call Sub](https://developer.axonivy.com/doc/14.0/en/reference/process/process-elements/call-sub.html) · [Sub Process Start](https://developer.axonivy.com/doc/14.0/en/reference/process/process-elements/sub-process-start.html) · [Common Tabs](https://developer.axonivy.com/doc/14.0/en/reference/process/process-elements/common-tabs.html)

*Labels as the Designer for VS Code 14.0.1 shows them; the behaviour at run time read from its engine 14.0.1.*
