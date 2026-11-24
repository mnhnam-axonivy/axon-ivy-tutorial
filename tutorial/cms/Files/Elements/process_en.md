<!-- markdownlint-disable MD051 -->
<!-- Links starting with #/ open pages and walkthroughs of the guide. -->

# Process

`Process` · `CallableSubProcess` · `WebserviceProcess` · `HtmlDialogProcess` · Axon Ivy 14.0

## What it is and when to use it

A **process** is one `.p.json` file of the project: elements, the connectors between them, and the data that flows through them. The data is defined by a **data class**. In the Designer, the process has an inscription of its own: select nothing on the canvas, and the inscription view shows the process.

There are four kinds of process. The kind is chosen when the process is created: the Designer has the commands **New Business Process**, **New Callable Sub Process** and **New Web Service Process**; a User Dialog logic process is created together with its dialog.

| Kind | What it is for, in the words of the reference |
| --- | --- |
| Business process | "the regular kind of processes that are used to implement business cases". Users select its starts from their workflow list or the start list. |
| Callable sub process | "a process, that can be called from any other process with the call subprocess element". It has its own data class, so "parameters need to be mapped in both directions". Part 3 of this guide. |
| Web service process | "A web service process will provide a web service with one or more operations". "If the process does contain user-interaction an exception will be thrown." Part 7. |
| User Dialog logic | "the implementation of the behavior of User Dialogs". It is started by a User Dialog element in a business process. Part 5. |

An Embedded Subprocess is not a kind of process: it folds elements of a process into one box, and is available in every kind (part 3).

## Details

The inscription of a business process has three tabs: **General**, **Process Data** and **Permissions**. A callable sub process has the same three. A web service process also has **Web Service Process**. A User Dialog logic process has General and Permissions only: its data is the dialog's own.

### General

| Field | What it does |
| --- | --- |
| Name / Description → Display name | The name of the process, which is the name of its file. The field cannot be changed here. |
| Name / Description → Description | Describes what the process is for. |
| Means / Documents | References to documents that belong to the process. |

A process has no Tags; its elements do.

### Process Data

| Field | What it does |
| --- | --- |
| Data Class | The data class that defines the process's data. "Each process must be associated with a data class, otherwise the tab will show an error." The button next to the field chooses any data class visible to the process. |

Under the field, the Designer warns: "If the process data class changes, all already used fields must exist in the new data class. Otherwise existing mappings and scripts will be removed."

Two processes may use the same data class ("It is legal for two processes to specify the same data class"), but the reference strongly recommends "that you only set data classes that are defined in the same project as the process".

### Permissions

| Field | What it does |
| --- | --- |
| Allow all workflow users to view the process on the Engine | Whether end users may view the process on the Engine. "Per default this is allowed for all business processes but not for the User Dialog Logic processes." |

### Web Service Process

Only on web service processes.

| Field | What it does |
| --- | --- |
| Qualified name | "The Fully qualified Web Service name will be used to generate the web service class and the WSDL." |
| Authentication | None/Container, WS Security or HTTP Basic. With WS Security and HTTP Basic the password is sent in clear text: use them only on a trusted network or over HTTPS. |

### Data classes

"A Data Class generally holds the data that flows through your business or User Dialog process." Each attribute has a name, a type and a comment. Its type decides what it can hold: `String` for text, `Number` for values you calculate with, `Boolean` for yes or no, other data classes for structured data.

Of the four kinds of data class, a process uses a global one: it is "accessible in your project and projects depending on it". The others are the User Dialog data class (part 5), web service data classes, generated from a web service configuration (part 7), and entity classes, which also say how the data is stored.

### At run time

1. Each run of a process is a **case** with its own process data.
2. A new case starts with every attribute at its first value: "Strings are initialized to an empty String, Numbers to zero, Lists to an empty List" (IvyScript reference). A String attribute is never `null`.
3. Every element gets the data as `in`; what it puts into `out` is what the next element gets as `in`.
4. A local variable of a script exists only while that script runs. Only the process data travels from element to element.

## Common questions

**Which kind of process do I need?**
A business process for anything users or links start. A callable sub process for steps that several processes share. A web service process to offer a web service to other systems. A User Dialog logic process is created with its dialog; you do not choose it on its own.

**Can two processes share a data class?**
Yes, the reference allows it. Prefer a data class of the same project, and remember that a change to it changes every process that uses it.

**Why can I not rename the process in the General tab?**
The name is the name of the file. To rename the process, rename its file.

**Where do I see the description of an element?**
Rest the mouse on the element: the description appears as a tooltip. [Walkthrough 2.1](#/walkthrough/2.1)

**How do I make a process open when someone imports the project?**
Give its Start the tag `DEMO`: it "marks a Request Start of a process as demonstration process".

**Should an attribute be a String or a Number?**
A Number only for values you calculate with. Personnel numbers, postal codes and phone numbers are Strings: as a Number they lose their leading zeros. [Walkthrough 2.2](#/walkthrough/2.2)

## Common mistakes

### An element without a name

- *Symptom:* the canvas shows only the icon of the element; nobody can tell what the step does without opening it.
- *Cause:* the Display name was left empty.
- *Fix:* "Give each element a name, always" (the reference's tip). Say what it does: "Confirm the order", not "Script". [Walkthrough 2.1](#/walkthrough/2.1)

### Choosing another data class for a process

- *Symptom:* after the change, mappings and scripts of the process are gone.
- *Cause:* fields that the process used do not exist in the new data class; the Designer then removes the mappings and scripts that use them, as the note under the field says.
- *Fix:* make sure the new data class has every attribute the process uses. To add or rename an attribute, change the data class itself. [Walkthrough 2.1](#/walkthrough/2.1)

### A number that is not an amount, typed as Number

- *Symptom:* "00731" arrives as 731.
- *Cause:* numbers have no leading zeros.
- *Fix:* type such attributes and parameters as String. [Walkthrough 2.2](#/walkthrough/2.2)

### A local variable instead of an attribute

- *Symptom:* a later element does not see a value a script calculated; the Designer reports nothing.
- *Cause:* a local variable, such as `Boolean approved = …;`, exists only while its script runs.
- *Fix:* assign the value to an attribute of `out`; add the attribute to the data class if it is missing. [Walkthrough 2.2](#/walkthrough/2.2)

### A data class from another project

- *Symptom:* the process depends on a project it should not depend on.
- *Cause:* the button next to the Data Class field offers every data class visible to the process, including those of required projects.
- *Fix:* use a data class of the same project, as the reference strongly recommends.

### A person in a web service process

- *Symptom:* the web service fails when it is called.
- *Cause:* "If the process does contain user-interaction an exception will be thrown."
- *Fix:* keep dialogs and tasks out of web service processes.

## Walkthroughs

- [2.1 A process and its elements](#/walkthrough/2.1): elements and connectors, the inscription view, the General tab, the process itself and its kinds, two mistakes.
- [2.2 Data classes and process data](#/walkthrough/2.2): attributes and types, the data class of a process, `in` at every element, start values, two mistakes.

## See also

- [Start and Process End](#/part/2/start): where a process begins and where it ends.
- [Script Step](#/part/3/script-step): changing the process data.
- Official documentation: [Process](https://developer.axonivy.com/doc/14.0/en/reference/process/process-elements/process.html) · [Process Kinds](https://developer.axonivy.com/doc/14.0/en/getting-productive/process-modeling/process-modeling/index.html) · [Data Classes](https://developer.axonivy.com/doc/14.0/en/getting-productive/data-modeling/data-classes/data-classes.html) · [Common Tabs](https://developer.axonivy.com/doc/14.0/en/reference/process/process-elements/common-tabs.html)

*Labels as the Designer for VS Code 14.0.1 shows them.*
