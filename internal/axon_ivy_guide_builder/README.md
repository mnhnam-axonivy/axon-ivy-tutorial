# Axon Ivy Guide builder

This folder builds the **Axon Ivy Guide** of the `tutorial` project: its walkthroughs and its page script. It is an internal tool, written in plain JavaScript with Node.js. Neither the Designer nor the Engine uses it, and a reader of the guide never needs it. You need it to change a walkthrough or to add one.

The structure and much of the code come from `internal/interactive_app_builder` of the Smart Workflow tutorial. Nothing is shared at build time: what was useful was copied and adapted, and everything that only served Smart Workflow agents was left out.

---

## What it builds

A **walkthrough** plays a real process of the `tutorial` project in a simulated Designer, like an explainer video: the token moves, the inscription view opens, fields are typed into, and a short note explains each moment. A black title screen opens each chapter, a voice can read the notes, and the reader can pause, skip, or replay a chapter. At the end the reader keeps a working simulation: click any element, change its fields and run the process again.

The **guide page** (`AxonIvyGuide` dialog) lists the eight parts of the guide, their pages and walkthroughs, and shows the element document of each element page (Markdown from the CMS, `cms/Files/Elements/<name>_<en|ja>.md`). A walkthrough opens full screen. Everything works offline, in English and Japanese.

| Source | Output in `tutorial/` |
| --- | --- |
| `runtime/` | `webContent/resources/js/axon-ivy-guide-runtime.min.js`, shared by every walkthrough |
| `walkthroughs/<n-m>/` | `webContent/resources/js/walkthrough-<n-m>.js`, one per walkthrough |
| `guide/` | `webContent/resources/js/axon-ivy-guide.js`, the page script with its styles |
| `vendor/marked.min.js` | `webContent/resources/js/marked.min.js` (marked 15.0.12, MIT), renders the documents |
| the list of walkthroughs | the `<h:outputScript>` lines between the markers in `dialog/tutorial/AxonIvyGuide/AxonIvyGuide.xhtml` |

Commit the outputs together with the sources: `npm run check` fails when they are out of date.

## Commands

```bash
npm install               # once (esbuild, puppeteer-core)
npm run build             # write everything into the tutorial project
npm run watch             # rebuild the scripts on every change
npm run preview           # the guide without an engine: http://127.0.0.1:4320/  (?lang=ja, #/walkthrough/2.3)
npm test                  # unit tests: runner, IvyScript (and its parity with the engine), layout, voice, texts
npm run smoke             # plays every walkthrough in headless Chrome or Edge, in both languages
node tools/smoke.mjs 3.1 --lang=ja --notes   # one walkthrough; a screenshot of every note in .preview/
npm run check             # fail if the committed outputs are stale
node tools/check-project.mjs  # every .p.json and .d.json of the project against the 14.0 schemas
node tools/new-walkthrough.mjs 3.4 part3/TwoPaths "Two paths, one condition"   # index.js of a new walkthrough
node tools/engine-probe.mjs probes.json --keep   # run IvyScript snippets or small processes on the Designer's engine, print its Runtime Log
node tools/designer-check.mjs process/tutorial/part3/TwoPaths.p.json --defaults   # the Designer's messages (and defaults) for every element
npm run labels            # copy the Designer's inscription labels again (after a Designer update)
```

Set `CHROME_PATH` when the smoke test finds no browser.

## How it stays true to Axon Ivy

| Rule | How |
| --- | --- |
| The process is the real one | A walkthrough imports its `.p.json` and `.d.json` from the project. Change the process in the Designer, rebuild, and the walkthrough follows. The processes are valid 14.0 files (`tools/check-project.mjs`) and open in the Designer without problems. |
| The words are the Designer's | Tab, section and field labels come from the Designer for VS Code 14.0.1 itself, in English and Japanese (`runtime/designer-labels.json`, written by `tools/extract-designer-labels.mjs`). Which tabs an element has follows the Designer's process editor. |
| The behaviour is the documented one | `runtime/model/runner.js` lists, per element, the sentence of the official reference it follows. |
| Error messages are the Designer's | Messages such as `Output 'out.status': Variable 'calculated' cannot be resolved` were read from the Designer's Problems view with probe processes, and the tests pin them. |
| What the documentation leaves open is the engine's | Probe processes were run on the Designer's own engine and its Runtime Log read (`tools/engine-probe.mjs`): the order of mapping rows, `in` and `out`, what a failed script logs, how IvyScript differs from Java, Alternative, Split and Join, sub processes, error handling. `test/engine-parity.test.mjs` and `test/engine-part3.test.mjs` replay the probes through the simulation; `test/part3-processes.test.mjs` pins what the guide's own processes logged on the engine. The Designer's messages and defaults are read from its inscription server (`tools/designer-check.mjs`). |
| Imitate, never invent | What the interpreter does not know is reported as not part of the simulation, not guessed at. What the documentation leaves open is listed in `PROGRESS.md`. |

## A walkthrough

Each walkthrough is a folder `walkthroughs/<n-m>/` (for walkthrough n.m) with three files:

| File | What goes in it |
| --- | --- |
| `index.js` | Its definition (below). |
| `tour.js` | The chapters. |
| `text.js` | Every text, in English and Japanese. |

`index.js` default-exports:

| Field | Purpose |
| --- | --- |
| `id` | `'2.3'`: the number in the guide's catalog. |
| `process`, `dataClass` | The project's `.p.json` and `.d.json`, imported. |
| `file`, `path`, `dataClassPath` | Shown as tab title, and in the "About" box. |
| `params` | What Run sends when the reader runs the process: the values of the start link. |
| `subProcesses` | Optional. The processes a Call Sub of the walkthrough calls: `[{ process, dataClass, file, path }]`, imported like the main one. Each gets a tab; the token follows a call into it and back. |
| `pages` | Optional. End pages of the project, by the path a Process End Page names, imported as text (`import page from '…/webContent/view/….html'`). The end page view shows them in a sandbox. |
| `tour` | `{ chapters: [{ id, play }] }`, or with parts: `{ id, label, parts: [{ id, play }] }`. |
| `strings` | `{ en, ja }`: `tour.intro.title/text/duration`, `tour.chapter.<id>`, `tour.<note>.title/text`, and for chapters with parts `tour.screen.<label>`, `tour.count.<label>`, `tour.<part>.title`. |

A chapter drives the simulation through the director `d`:

```js
async function mapping(d) {
  await d.open('f0', 'start');                                   // the inscription view, Start tab
  await d.note('mappingRow', { target: 'field:f0.map:out.room' }); // a note on one row of the mapping
  await d.close();
  await d.run({                                                  // run, and step in at moments of it
    params: { room: 'Matterhorn', people: '4' },
    on: { 'after:f0': async () => { await d.panel('data'); await d.note('dataFilled', { target: 'data:room' }); } }
  });
}
```

- **Notes**: `d.note(key, { target, quote, wait, extra })`. Targets: `el:<id>` (an element of the process and level shown), `field:<id>.<key>` (a field of the inscription: `tabs`, `name`, `description`, `docs`, `tags`, `code`, `mapping`, `map:out.total`, `params`, `param:room`, `signature`, `signatureText`, `link`, `startList`, `anonymous`, `roles`, `page`, `sudo`, …), `field:process.<key>` (the process itself: `displayName`, `dataClass`, `dataClassMessage`, `viewer`), `field:<id>.code@<text>` (a line of code), `field:<id>.condition:<connector>` (a row of an Alternative), `field:<id>.map:param.weight` / `map:result.cost` / `map:out1` (rows of a Call Sub, a Sub Process Start, a Split), `field:<id>.errorCode` / `errorThrow` (Error tabs), `log:last`, `data:<attribute>`, `param:<name>`, `request`, `dataclass`, `dataclass:<attribute>`, `tooltip`, `page` (the end page).
- **Edits are typed**: `d.edit('f3.map:out.status', 'calculated')`, `d.edit('f3.code', code => code.replace(…))`, `d.edit('f0.signature', …)`, `d.edit('f2.condition:f21', 'in.amount > 500')`, `d.edit('f9.errorCode', 'payment')`.
- **Runs**: `d.run({ fast, params, on, start, stepLimit })`; hooks `enter:<id>`, `mapped:<id>` (the mapping is assigned, the code has not run), `after:<id>`, `descend:<id>` / `ascend:<id>` (the token goes into a Call Sub's process or a box, and back). An element of another process is named with its ref: `enter:tutorial/part3/ShippingCost/f3`. `stepLimit` stops an endless loop sooner (default 400 elements).
- **Views**: `d.open(id, tab)`, `d.open('process', tab)` (the process itself), `d.close()`, `d.panel('log' | 'data' | null)`, `d.tab('process' | 'dataclass' | 'process:<ref>')` (`<ref>`: another process of the walkthrough, its path without `.p.json`), `d.level(boxId | null)` (into a box and back), `d.tooltip(id | null)`, `d.focus(target)`, `d.wait(ms)`.
- **Changes that are not typed** (a type in the data class, a checkbox, rows moved, an element of another type): change the model through `d.app` (`d.app.changeElement(el, e => …)`, `d.app.model.dataClass.fields`, then `d.app.dataClassView.render()`). Reset puts the data class back too.

Every chapter, and every part of a chapter, starts from the process as the project ships it. `runtime/ui/tour.js` documents the director in full.

### Adding a walkthrough

1. Create the process and its data class in the project, under `process/tutorial/part<n>/` and `dataclass/tutorial/part<n>/`. Open it in the Designer and make sure the Problems view is empty.
2. `node tools/new-walkthrough.mjs <n.m> part<n>/<Process> "<title>"` writes `walkthroughs/<n>-<m>/index.js`; set the request values in `params`.
3. Write `tour.js` and `text.js`. Quote the Designer's labels as `designer-labels.json` has them, in both languages.
4. `npm run build`, `npm test`, `node tools/smoke.mjs <n.m> --notes` and look at every note, then `npm run smoke`.
5. Mark the walkthrough in `PROGRESS.md`.

## What the simulation can do

| Element | Simulated |
| --- | --- |
| The process itself | Shown when nothing is selected, with the tabs of its kind: General (the display name is the file's name), Process Data, Permissions; Web Service Process for a web service process; no Process Data for User Dialog logic. |
| Every element | General tab: display name and description can be typed; the description is the element's tooltip. |
| Start | Input parameters from the request (`param`, typed from the text of the link), the mapping into the process data, the code. No `in` in a Start. Request, Trigger, Task and Case tabs are shown read-only. |
| Script Step | Mapping (expressions on `in`, assigned to `out`; rows without an expression keep their value), then the code. Disable Permission Checks is shown and has no effect. |
| Process End, Process End Page | The run ends; a Process End Page shows its page (from `pages`) in a small browser window. |
| Alternative | Condition tab (Type `<target>: <type>`, Expression). The conditions of `config.conditions` are tried in their order, then the exits not listed; the first true one decides, an empty one is true; none true fails the request (`IllegalStateException: In the alternative all conditions evaluate to false`). No `out` in a condition; text is never true; `=` assigns. |
| Split, Join | Output tabs with `out1`, `out2`, … and `in1`, `in2`, …; one token per path, each with its own data (an `outX` without a row starts empty; the default maps only `out1` ← `in`); the paths take turns, the second first; the Join waits for every incoming connector (default `out` ← `in1`); a Join that is short of a path keeps the token. |
| Call Sub, Sub Process Start, Sub Process End | Process tab (`param`), Output (`result`); Start and Result tabs. The sub process runs in its own tab with its own data; the Result tab runs at its end. |
| Embedded Subprocess, BPMN activities | General only; the token goes in at the Embedded Start of its connector, the inside runs with the same data, it leaves by the Embedded End's connector; the canvas follows it in, with a breadcrumb back. An empty box keeps the token. |
| Error End, Error Boundary Event, Error Start | Error tabs (code to throw, cause; code to catch, empty catches all), Output with `error` (`getErrorCode()`, `getTechnicalCause()`). A failing script throws `ivy:error:script`, `BpmError.create(…).throwError()` (with its import) its code. Handlers: the boundary on the element, then an Error Start of the level (not for an Error End of that level), then one level up (box, Call Sub). An error nobody catches fails the request with the engine's log line. |
| An endless loop | stopped by the simulation after 400 elements (the engine stops nothing). |

IvyScript (`runtime/model/ivyscript.js`): assignments to `out.`/`in.` attributes (and fields of data class objects), `param.` in a Start, local variables, `if`/`else`, `for (;;)`, `for (String n : list)`, `while`, `break`, `continue`, `x++`, `x += 1`, `try`/`catch`/`finally`, comparisons, arithmetic (`+ - *` exact on decimals, `/` not, `**`), text joined with `+`, `? :`, `IF(…)`, `as`, `instanceof`, `is initialized`, `.#`, lists (`["a"]`, `new List<String>()`, `java.util.ArrayList`), raw maps, `ivy.log.*`, String, List and Map methods, `Math.*`, `Integer.parseInt`, `String.format/join`. A mapping's first row `out` ← `in` makes `out` the same data as `in` (the Designer writes it into every mapping); without it `out` starts empty. Values behave as on the engine 14.0.1: a String is never null, an Integer drops decimals, a data class object is created when used. What IvyScript does not have (switch, lambdas, `return`, `throw`, `var`, `final`, arrays, Java casts, generics other than List) gives the Designer's own message (`Unexpected token: '{'`, `Class var not found`, …). Assignments check the type as the Designer does (`Cannot cast object of type String to type Number`), and so does `+` with a Number on the left and text on the right. A script that fails ends the run with the engine's Runtime Log line: `Problem while processing request '…'`, `ivy:error:script` and the cause.

The simulation grows with the walkthroughs: `PROGRESS.md` lists, per capability, the walkthrough that first needs it.

## Folder layout

```text
runtime/
  index.js              window.ivyGuide: register / has / info / mount
  app.js                one mounted walkthrough: tabs, canvas, inscription, panel, runs
  i18n.js               texts of the simulation (en, ja) and the Designer's labels
  designer-labels.json  labels copied from the Designer for VS Code 14.0.1
  model/                process model, runner, IvyScript, YAML reader (preview)
  stage/                the 2D canvas: painters, layout, token and ripples, mouse and keys
  ui/                   inscription view, bottom panel, data class view, walkthrough player, voice, styles
walkthroughs/<n-m>/     one walkthrough each
guide/                  the guide page: catalog of parts and pages (en, ja), page script, styles
preview/server.mjs      the guide dialog without an engine
tools/                  smoke test, project check (with the 14.0 schemas), label extraction, new walkthrough, engine probes, Designer check
test/                   unit tests
vendor/                 marked (Markdown)
```

## Debugging

In the browser console of the guide:

```js
ivyGuide.instances()[0].app           // the walkthrough that is open
window.ivyGuideOptions = { tourPace: 4, speech: null }   // before opening one: faster, no voice
```
