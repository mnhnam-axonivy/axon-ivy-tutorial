<!-- markdownlint-disable MD051 -->
<!-- Links starting with #/ open pages and walkthroughs of the guide. -->

# Error handling

`ErrorEnd` · `ErrorBoundaryEvent` · `ErrorStartEvent` · Axon Ivy 14.0

## What they are and when to use them

"The execution of a process element can be aborted with an error." Three elements throw and catch such errors:

- **Error End**: "can be used to leave the happy path of a process by throwing an error (e.g., if an approval is denied). It can also be used to re-throw previously caught errors."
- **Error Boundary Event**: "can be attached to any activity by using its context menu." When the activity ends with an error, "the execution is then redirected to this Error Boundary Event element and continued from there."
- **Error Start**: a start without incoming connectors: "The execution can continue at an Error Start Event which handles the occurred error."

"An error is caught by an Error Boundary Event or Error Start Event if their Error Code pattern matches the Error Code. An Error Boundary Event or Error Start Event with an empty Error Code catches every error."

| You want to … | Use |
| --- | --- |
| end a process with an error the caller can handle | Error End, in a callable sub process or a box |
| throw an error from code | `BpmError.create("…").throwError();` in a Script Step |
| handle the errors of one activity | Error Boundary Event on it |
| handle the errors of a whole process level | Error Start |

## Details

### Error codes

"Error codes are defined as strings. They can be refined by inserting a colon (:)." "Multiple sub-error codes can be caught using wildcards (\*)." "Trailing wildcards are optional so the string `custom:error` is the same as `custom:error:*`." An error thrown as `booking:failed` is caught by `booking:failed`, `booking` and `*:failed`, not by `payment`. The errors of the system have codes that start with `ivy`: a script that fails throws `ivy:error:script`, "On the error object, the causing Java exception is available as the technical cause."

### Error End

Two tabs: **General** and **Error**.

| Section | Field | What it does |
| --- | --- | --- |
| Error | Error Code to throw | The code of the error it throws, for example `booking:full`. |
| Error | Error Cause | An error to re-throw, as its cause. |
| Code | | IvyScript that runs before the error is thrown; `error` is the BpmError that will be thrown. |

### Error Boundary Event and Error Start

Three tabs: **General**, **Error** and **Output**.

| Section | What it does |
| --- | --- |
| Error Code | The code or pattern it catches. Empty, shown as `<< Empty >>`, "Catches all errors". |
| Output: Mapping, Code | The process data as it was when the error happened, `in`, and `error`: "References the occurred `BpmError`. Gives access to the occurred Error Code, Cause and CallStack." `error.getErrorCode()` gives the code, `error.getTechnicalCause()` the Java exception. |

### Throwing from code

The reference: `BpmError.create("mystock:empty").throwError();`. In IvyScript, BpmError needs its import first: `import ch.ivyteam.ivy.bpm.error.BpmError;`. Without it the Designer reports `Output code: Variable 'BpmError' cannot be resolved`.

### Where a handler is searched

The reference names the order:

1. An Error Start Event directly addressed in the element's inscription mask (elements that call other systems, part 7).
2. An Error Boundary Event attached directly to the activity the error comes from.
3. An Error Start Event on the same process level, if the error was not thrown by an Error End Event.
4. The next higher process level, starting again at step 2, until the top-level process is reached.
5. A Project Error Process in the top-level project.
6. If still uncaught, the error is shown to the user on the standard Error Pages.

"Each process - including the embedded subprocess - is a separate process level." "The Error End Event throws the error to the upper process level, it can't be caught on the same process level." A Project Error Process "catches uncaught errors from the whole project"; its name "must start with `Error`", it lies "in the top-level process group *Processes*", and "the process data of the throwing process (i.e., the value of the `in` variable) is not available" there.

### At run time

1. A handler takes over with the data as it was at the error: what a script changed before it failed is kept.
2. An Error End's code runs, then the error goes to the level above: from a callable sub process to the Call Sub, from a box to the box.
3. On the level above, a boundary on the Call Sub or the box is tried first, then an Error Start of that level, which also takes errors an Error End threw below.
4. An Error End and an Error Start on the same level: the error is not caught there.
5. An error nobody catches fails the request: HTTP 500, and the Runtime Log has `Problem while processing request '…'`, caused by `BpmError booking:full`, or by the Java exception of a script.
6. When a catcher runs again for the same error on its level, the error handling goes on one level up with `ivy:error:loop` "to interrupt the cycle".

Points 1 to 5 were read from the Designer and its engine 14.0.1 on 2026-11-16; point 6 is the reference's.

## Common questions

**Error End or BpmError in a script?**
An Error End throws to the level above, so it is caught by the caller. A BpmError thrown from a script can be caught on the same level, by a boundary on the step or by an Error Start.

**How do I catch every error of a process?**
An Error Start with an empty Error Code catches every error of its level that no boundary catches, except one an Error End on that level threw. For a whole project there is the Project Error Process.

**How do I find out which error happened?**
In the Output of the handler: `error.getErrorCode()`, and for a failed script `error.getTechnicalCause()`, the Java exception.

**Why does my Error Start not catch the error of my Error End?**
They are on the same level. Put the throwing part into a callable sub process or a box, so that it throws to this level, or throw from a script.

**In which order are handlers tried across processes?**
First the boundaries on the activity, then the Error Start of the level, then the caller's, up to the Project Error Process; the Axon Ivy community describes the same order ([answers 3543](https://answers.axonivy.com/questions/3543/how-to-create-errorhandling-process-for-dependent-project-model.html)).

**What is ivy:error:loop?**
An error that comes back to a catcher that already ran for it on this level. A case from the community: a call that fails again inside a loop with its handlers; the advice was to move the call and its handlers into a sub process of their own ([answers 3181](https://answers.axonivy.com/questions/3181/prevent-by-pass-ivy-error-loop.html)).

## Common mistakes

### A code that does not match

- *Symptom:* the error is not caught; the request fails with `Caused by: BpmError booking:full`. The Designer reports nothing.
- *Cause:* the catcher's code is another one (`payment`) or almost the same one (`imports` for `import:empty`); codes are compared part by part, between the colons.
- *Fix:* catch the thrown code or one of its leading parts: `booking:full`, `booking`. [Walkthrough 3.10](#/walkthrough/3.10) · [3.11](#/walkthrough/3.11)

### An empty code that catches a bug

- *Symptom:* the business path of an error runs for a case that is not that error, and the code is `ivy:error:script`.
- *Cause:* an empty Error Code catches every error, a failing script too.
- *Fix:* catch the codes you can handle; leave the others to fail, or to one handler that reports them. [Walkthrough 3.10](#/walkthrough/3.10)

### An Error End and an Error Start on the same level

- *Symptom:* the request fails with the Error End's code although an Error Start with that code is in the process.
- *Cause:* an Error End throws to the level above; it "can't be caught on the same process level".
- *Fix:* throw from a script with BpmError, or let a sub process or a box throw it to this level. [Walkthrough 3.11](#/walkthrough/3.11)

### BpmError without its import

- *Symptom:* the Designer reports `Output code: Variable 'BpmError' cannot be resolved`; at run time the script fails with `ivy:error:script`, not with the intended code.
- *Cause:* IvyScript does not know BpmError without its import.
- *Fix:* `import ch.ivyteam.ivy.bpm.error.BpmError;` at the top of the code. [Walkthrough 3.11](#/walkthrough/3.11)

### `error` as the cause of a later Error End

- *Symptom:* the Designer reports `Error cause: Variable 'error' cannot be resolved` on an Error End after a boundary event.
- *Cause:* `error` exists only in the Output of the handler that caught it.
- *Fix:* keep the error in an attribute of the process data in the handler's Output, and use that attribute as the cause.

## Walkthroughs

- [3.10 Throwing and catching an error](#/walkthrough/3.10): an Error End in a callable sub process, an Error Boundary Event on the Call Sub, two mistakes (a code that does not match, an empty code that catches a bug).
- [3.11 One handler for the whole process](#/walkthrough/3.11): an Error Start, a BpmError thrown from a script, the order of the search, an Error End its own level cannot catch, two mistakes (BpmError without its import, a code with one letter too many).

## See also

- [Callable sub process](#/part/3/callable-sub) and [Embedded Subprocess](#/part/3/embedded-bpmn): the levels an error is thrown from.
- [Script Step](#/part/3/script-step): try/catch inside code.
- Official reference: [Error Handling](https://developer.axonivy.com/doc/14.0/en/reference/process/error-handling.html) · [Error End](https://developer.axonivy.com/doc/14.0/en/reference/process/process-elements/error-end.html) · [Error Boundary Event](https://developer.axonivy.com/doc/14.0/en/reference/process/process-elements/error-boundary-event.html) · [Error Start](https://developer.axonivy.com/doc/14.0/en/reference/process/process-elements/error-start.html)
- Community: [How to create ErrorHandling process for dependent project model?](https://answers.axonivy.com/questions/3543/how-to-create-errorhandling-process-for-dependent-project-model.html) · [Prevent/by-pass ivy:error:loop](https://answers.axonivy.com/questions/3181/prevent-by-pass-ivy-error-loop.html)

*Labels and error messages as the Designer for VS Code 14.0.1 shows them; the behaviour at run time read from its engine 14.0.1.*
