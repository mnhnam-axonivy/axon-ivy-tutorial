<!-- markdownlint-disable MD051 -->
<!-- Links starting with #/ open pages and walkthroughs of the guide. -->

# Start and Process End

`RequestStart` · `TaskEnd` · `TaskEndPage` · Axon Ivy 14.0

## What it is and when to use it

A **Start** is where a process begins. Every time it starts, Axon Ivy creates a new case and a task. It sits in the *Event & Gateway* drawer of the palette (the official reference calls it the Request Start).

A Start can be started in two ways, which are switched on separately:

- **by a request**: a link, a page with a list of processes, or another system calling the link;
- **by a Trigger Step** in another process (part 6 of this guide).

Its pair is the end: a process that begins at a Start ends at a Process End or a Process End Page. They have little to configure, so they get a short section at the end of the details below.

Use another start element when the process is not started by a person or a link:

| The process starts … | Use |
| --- | --- |
| when another process calls it and waits for its result | Sub Process Start (part 3) |
| when a signal is sent | Signal Start (part 6) |
| on a timer or by an outside event | Program Start (part 7) |
| to handle an error | Error Start (part 3) |

## Details

The inscription of a Start has six tabs: **General**, **Start**, **Request**, **Trigger**, **Task** and **Case**.

### General

| Field | What it does |
| --- | --- |
| Name / Description → Display name | The name shown on the canvas. The official reference advises: give each element a name, always. |
| Name / Description → Description | Shown as a tooltip in the editor; may use Markdown. |
| Means / Documents | References to documents that belong to the element. |
| Tags | Free keywords. For a Start, `DEMO` opens the process automatically when the project is imported into the Designer, and `DEPRECATED` makes callers show a deprecation warning. |

### Start

| Section | What it does |
| --- | --- |
| **Signature** | The name of the start. It is case sensitive and may only contain letters, numbers and underscores. |
| **Input parameters** | One row per parameter: name, type and description. The list may be empty. The name together with the types in their order is the *signature*, for example `bookRoom(String,Number)`. |
| **Mapping** | One row per attribute of the process data (`out.<attribute>`). An expression gives the attribute its value, usually `param.<name>`. A row without an expression leaves the attribute at its starting value. |
| **Code** | IvyScript that runs after the mapping, with the same variables. |

Variables in the mapping and the code of the Start:

| Variable | What it is |
| --- | --- |
| `param` | The input parameters, one field each: `param.room`. Only in the Start. |
| `out` | The process data that leaves the Start. |
| `ivy` | The environment: `ivy.log`, `ivy.cms`, … |
| `in` | **Not available.** The Designer reports `Variable 'in' cannot be resolved`. |

A parameter is declared with a name and a type. A tip of the reference: you can type `myDate:Date` in the name field to set the type at once, and a colon without a type gives a String.

### Request

| Field | Default | What it does |
| --- | --- | --- |
| Yes, this can be started with a HTTP-Request / -Link | on | Without it, the Start cannot be started by a link. The other fields are then hidden. |
| The start link | `<signature>.ivp` | The link the Start is called by. It always ends in `.ivp` and is unique within the process. Parameters are added to it: `bookRoom.ivp?room=Matterhorn&people=4`. |
| Show on start list | on | Whether the process is listed on the page that lists the processes a user can start. |
| Name, Description, Category | empty | How the process appears in that list. They are also used for the case, unless the Case tab sets its own. |
| Custom Fields | none | Information for start lists, such as `cssIcon` for an icon. They do not change how Axon Ivy treats the start. |
| Permission → Roles | Everybody | Users who start the process must have one of these roles. |
| Permission → Allow anonymous | on | Lets users start the process without logging in. |
| Permission → Violation error | | The error that is thrown when the user does not have the role. An Error Start can catch it. |

> The reference warns: when a new process or start element is created, anonymous access is allowed. Review and restrict these settings before you deploy to a public or production environment.

### Trigger

| Field | What it does |
| --- | --- |
| Yes, this can be started with a Trigger Activity | Lets a Trigger Step in another process start this one. Off by default. |
| Responsible, Options (Attach to Business Case that triggered this process, Delay) | Who gets the task a trigger creates, and when. Shown only when the option above is on. Part 6 explains them. |

### Task

Name, description, category, priority, expiry, custom fields and code of the task the Start creates. The option **Persist task on creation** saves case and task at once; it only works when anonymous users are not allowed. A task started by a link is worked on at once, so most of these settings matter only for a Start that is triggered (part 6).

### Case

Name, description, category and custom fields of the case. Without them, the case takes name, description and category from the Request tab.

### At run time

1. The request arrives. Each input parameter becomes a field of `param`, from the value of the same name in the link. Text that does not fit the type is logged, and the parameter arrives as nothing: `?people=abc` for a Number writes `ParameterMapToObjectFiller: Could not convert string 'abc' to a Number.` to the Runtime Log, and the process goes on with 0. A Boolean is `true` only for `true` (in any case); `yes` gives `false`.
2. The rows of the mapping are assigned to the process data, one after the other.
3. The code runs.
4. The token moves on. From now on, only what is in the process data is left: `param` is gone.

The conversion of the parameters, the order of the rows and the reserved `lang` are not in the documentation; they were read from the Designer's engine 14.0.1 on 2026-11-16.

### Its pair: Process End and Process End Page

Both terminate the process. In the words of the reference:

| Element | What it does | Inscription |
| --- | --- | --- |
| **Process End** | "This element terminates the current process." | General only |
| **Process End Page** | "This element terminates the current process and displays a dialog page." | General, and **End Page**: "the web page displayed when a case ends with this End Page Element". **Open file** next to it opens the page. |

Use a Process End Page when the person who started the process should see a last page that is the same for everybody: a confirmation, a thank-you. Use a Process End otherwise. When a process has several ends, give each a name that says its outcome: "Order done", "Order rejected".

"Pages can be referenced from the content management system or the web content directory." The guide's example is `view/tutorial/part2/parking-booked.html`, a file in `webContent`. A JSF page (`.xhtml`) "need[s] to be in the webcontent/view directory".

The page is static: "Even if you use a static JSF page as the workflow end page, it is not possible to access the case and task context." To show the data of the case, use a User Dialog before the end (part 5). Two other ends come in part 3: the Error End, which ends with an error a handler can catch, and the Sub Process End, which returns to the process that called it.

## Common questions

**How do I pass a value to a process when it starts?**
Declare an input parameter on the Start tab and map it to an attribute of the process data. The caller adds it to the link: `bookRoom.ivp?room=Matterhorn`. A Trigger Step passes it in its own mapping (part 6).

**Why is my start parameter empty later in the process?**
Almost always because no row of the mapping uses it: the parameter arrives in `param`, but nothing copies it into the process data. The Designer shows no warning for this. Check the row of the attribute on the Start tab. See also the mistake about reserved names below.

**Can I use `in` in the Start?**
No. In the mapping and the code of a Start there is only `param` and `out`. Write `out.room = param.room;`, not `in.room = …`.

**What happens to callers when I change a parameter?**
The types and their order are part of the signature. Change either, and every element that calls this start (a Trigger Step, for example) has to be updated. Links that others have saved use the name: keep it stable once the process is in use.

**Who may start my process?**
Whoever has one of the roles in Permission, and anybody when **Allow anonymous** is on, which it is for a new start.

**How do I keep a start out of the list of processes?**
Switch off **Show on start list** on the Request tab. The start link still works.

**Can the end page show what was booked?**
No. Even as an end page, a static page has no access to the case and task. Show the data in a User Dialog before the end (part 5).

## Common mistakes

### A parameter is declared but not mapped

- *Symptom:* the attribute is empty or 0 after the Start, though the link carries a value.
- *Cause:* no row of the mapping assigns `param.<name>`. The run does not fail.
- *Fix:* add the row, for example `out.people` ← `param.people`. [Walkthrough 2.3](#/walkthrough/2.3) shows this.

### `in` in the Start

- *Symptom:* the Designer reports `Start 'out.room': Variable 'in' cannot be resolved` (or `Start code: …` for the code).
- *Cause:* a Start has no incoming data yet.
- *Fix:* read from `param`, write to `out`. [Walkthrough 2.3](#/walkthrough/2.3) shows this.

### A misspelled parameter

- *Symptom:* the Designer reports `Start 'out.room': Field rooms not found for class <java.lang.String room,java.lang.Number people>`.
- *Cause:* the expression names a parameter that is not declared. The class in the message lists the ones that are.
- *Fix:* use one of the listed names. Ctrl+Space in the field offers them.

### A parameter with a reserved name

- *Symptom:* a parameter called `lang` is always empty.
- *Cause:* some request parameters are used by Axon Ivy itself. Reported for `lang` in the Axon Ivy community; on the engine 14.0.1, `?lang=de` arrives as an empty String.
- *Fix:* give the parameter a more specific name, such as `language`.

### Anonymous access left on

- *Symptom:* anyone with the link can start the process on a public Engine.
- *Cause:* **Allow anonymous** is on for every new start.
- *Fix:* switch it off and choose the roles that may start the process.

### Case data on the end page

- *Symptom:* the end page cannot say what was booked, ordered or approved.
- *Cause:* the page of a Process End Page is static; it has no access to the case and task context.
- *Fix:* show the data in a User Dialog before the end; keep the end page for what is the same for everybody. [Walkthrough 2.5](#/walkthrough/2.5) shows this.

## Walkthroughs

- [2.3 Starting a process with parameters](#/walkthrough/2.3): signature, parameters, the start link, the mapping, the Process End, two mistakes (a parameter that is not mapped, `in` in the Start).
- [2.5 Who may start it and how it is listed](#/walkthrough/2.5): the Request tab (start link, start list, permission), the Process End Page and its End Page tab, two mistakes (Anonymous left on, case data on the end page).

## See also

- [Process](#/part/2/process): the process itself and its data.
- [Script Step](#/part/3/script-step): the same mapping table and code, in the middle of a process.
- Official reference: [Start](https://developer.axonivy.com/doc/14.0/en/reference/process/process-elements/start.html) · [Process End](https://developer.axonivy.com/doc/14.0/en/reference/process/process-elements/process-end.html) · [Process End Page](https://developer.axonivy.com/doc/14.0/en/reference/process/process-elements/process-end-page.html) · [Common Tabs](https://developer.axonivy.com/doc/14.0/en/reference/process/process-elements/common-tabs.html) · [Static JSF Pages](https://developer.axonivy.com/doc/14.0/en/getting-productive/user-interface/static-jsf-pages.html)
- Community: [Passing parameters with an Ivylink](https://answers.axonivy.com/questions/1274/passing-parameters-with-an-ivylink) · [Reserved request parameters](https://answers.axonivy.com/questions/2586/reserved-request-parameters.html)

*Labels and error messages as the Designer for VS Code 14.0.1 shows them.*
