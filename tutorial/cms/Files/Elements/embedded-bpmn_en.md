<!-- markdownlint-disable MD051 -->
<!-- Links starting with #/ open pages and walkthroughs of the guide. -->

# Embedded Subprocess and BPMN activities

`EmbeddedProcess` · `EmbeddedStart` · `EmbeddedEnd` · the eight BPMN activities · Axon Ivy 14.0

## What they are and when to use them

"An embedded subprocess folds a part of a process into a box." "This makes hierarchical structuring of the process possible." "Subprocesses can be created top down or bottom up, either by selecting and wrapping parts of a process or by inserting an (initially empty) embedded sub element from the palette."

The **BPMN activities** are boxes of the same kind with a meaning attached: "Thus BPMN Activities behave similar to a Embedded Subprocess, but their purpose is different." Their icon tells the reader of the diagram what kind of work the step is; "details of the technical implementation" stay inside.

| BPMN activity | In the words of the reference |
| --- | --- |
| Generic | "An unspecific activity." |
| User | "Indicates an activity that implies execution by the user." |
| Manual | "Indicates an activity that implies execution without assistance of IT means." |
| Script | "Indicates an activity that implies execution inside the process engine itself." |
| Receive | "Indicates an activity that implies reception of a message." |
| Rule | "Indicates an activity where a business rule is evaluated." |
| Send | "Indicates an activity that implies sending of a message." |
| Service | "Indicates an activity that implies calling an automated function." |

On the canvas a box has a small square with a plus at the bottom: there is a process inside.

| You want to … | Use |
| --- | --- |
| keep a process readable by folding steps that belong together | Embedded Subprocess |
| show in the diagram what kind of work a step is | a BPMN activity |
| use the same steps in several processes | a callable sub process (walkthrough 3.8) |

## Details

The Embedded Subprocess and every BPMN activity have only the **General** tab, without tags: display name, description, means and documents. What the box does is the process inside it.

Inside, each connector that leads into the box has an **Embedded Start** ("in 1", "in 2", …), and each connector that leaves it an **Embedded End** ("out 1", …). They have only the General tab too. In the process file a box keeps its elements in `elements`, and an Embedded Start or End names the connector outside that it belongs to (`parentConnector`).

In the process editor you open a box to see and edit its inside, and go back up to the process from there.

### At run time

1. The token reaches the box and goes in at the Embedded Start of the connector it came by.
2. The elements inside run with the same process data as outside: nothing is passed in, nothing is returned. A value set inside is there after the box.
3. At an Embedded End, the token leaves the box by the connector of that end.
4. A box with nothing inside keeps the token: nothing after it runs, and the request ends without an error or a log line.
5. "Each process - including the embedded subprocess - is a separate process level" for error handling: an Error End inside the box throws its error to the level of the box, where an Error Boundary Event on the box catches it.

Points 1 to 4 are not in the documentation; they were read from the Designer's engine 14.0.1 on 2026-11-16, as was point 5 for the boundary on the box.

## Common questions

**Does an Embedded Subprocess have data of its own?**
No. It works on the process data of the process it is in. Only a callable sub process has its own.

**When do I use a BPMN activity instead of an Embedded Subprocess?**
When the diagram should say what kind of step it is: a person's work (User, Manual), a message (Send, Receive), a rule, a service call. At run time they behave the same.

**Can I call an Embedded Subprocess from another process?**
No. It belongs to its process. For steps that several processes need, use a callable sub process.

**What happens to an error inside the box?**
The box is a level of its own: an Error End inside throws to the level of the box, and an Error Boundary Event on the box can catch it (walkthrough 3.10 shows the same for a Call Sub).

## Common mistakes

### An empty box

- *Symptom:* the process stops at the box: nothing after it runs, the Runtime Log has no error.
- *Cause:* the box was placed from the palette, or its inside deleted, and it has no Embedded Start and End with elements between them.
- *Fix:* model what happens inside, from the Embedded Start to the Embedded End, or leave the box out. [Walkthrough 3.9](#/walkthrough/3.9)

### A box where a callable sub process belongs

- *Symptom:* the same steps exist in several processes, as copies of a box that are changed one by one.
- *Cause:* an Embedded Subprocess belongs to one process; a copy is a second, independent box.
- *Fix:* move the steps into a callable sub process and call it where they are needed. [Walkthrough 3.8](#/walkthrough/3.8)

An Embedded Subprocess has little to configure, so there is little that can go wrong with it besides these two.

## Walkthroughs

- [3.9 Folding part of a process into a box](#/walkthrough/3.9): the inside of an Embedded Subprocess, the token going in and out with the same data, two BPMN activities, one mistake (an empty box).

## See also

- [Callable sub process](#/part/3/callable-sub): a process of its own, with its own data.
- [Error handling](#/part/3/error-handling): process levels and where errors are caught.
- Official reference: [Embedded Subprocess](https://developer.axonivy.com/doc/14.0/en/reference/process/process-elements/embedded-subprocess.html) · [BPMN Activities](https://developer.axonivy.com/doc/14.0/en/reference/process/process-elements/bpmn-activity-elements.html)

*Labels as the Designer for VS Code 14.0.1 shows them; the behaviour at run time read from its engine 14.0.1.*
