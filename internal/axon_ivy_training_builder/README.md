# Axon Ivy Training — builder

Builds the training page of the `training` project (Axon Ivy 14.0.1): a skill tree for
beginners, made like the skill-tree posts of nammai-blog. The page is a map of skills, each
locked until the skills it needs are learned; a skill's card has three tabs:

| Tab | What |
| --- | --- |
| Watch | a short animated film with subtitles, then the skill in one sentence over its last picture |
| Facts | three things people think about it, each on a card; a tap turns the card over to what is true |
| Check | one question; the right answer learns the skill and unlocks the next |
| Puzzle | only on a skill that has one (the bosses): a brief, and the way into the puzzle game |

What has been learned, and which puzzles are solved, is kept in the browser, per tree. "Unlock
all" opens every skill. The page works on a phone (the card slides up full screen).

**Themes.** The page follows the reader's light or dark setting, and the two are the themes of
nammai-blog: light is **Paper** (warm paper, black ink, deep inks for the branches, white
sheets that lift off the page, a yellow highlighter on the words that matter), dark is
**Neon** (black, neon colours, glowing edges). The page is set in Roboto everywhere, in both
themes. The films and the puzzle game look the same in both, with fonts of their own.

**Layout.** The page fills the window: its background runs edge to edge (the script takes away
the padding of the dialog layout's container around it). Above 860 px the map takes 40% of the
width and the card the rest, with a divider between them: drag it (or focus it and use the
arrow keys, Shift for bigger steps, Home and End) to give the map 25% to 70%; a double-click
or Enter puts it back to 40%. The width is kept in the browser. The skills on the map are
smaller on a narrow map and bigger on a wide one. On the card, the film grows with the card's
width, as far as the card's height leaves its subtitle and controls in view, and nothing is
under it, so the card does not scroll. The skill's sentence comes up over the film when it
ends (an end card; a click on the dark around it plays the film again). What is read (facts,
check, the puzzle's brief) keeps to a column of at most 820 px. Icons are few: a skill's emoji
on its badge, a tick on what is learned, and one picture on the welcome, locked and finished
screens; the rest is words and colour (a tab whose check is learned or whose puzzle is solved
has a green line).

**Offline.** Everything is in one file; nothing is loaded from the network. That includes the
font: the Latin subset of Roboto is in `vendor/fonts` (fetched once from Google Fonts with
`node tools/fetch-fonts.mjs`), the build embeds it and declares it as "Ivy Training Roboto",
and its licence (SIL Open Font License 1.1) is at the top of the file with three.js's.
Japanese is drawn by the system's fonts.

## The puzzle game

A puzzle is a small job: "Leave needs two approvals: first a manager, then HR …". The player
gets an empty process in the Designer's editor and exactly the elements the answer needs,
drags them onto the process, connects them, and sets their fields (Responsible, Expiry,
Permission …) in the inscription. Then **Finish**:

- **right**: the editor tilts back and the process runs once, as in a walkthrough of the
  tutorial: the token, green for what has run, and at each element who works there and what
  the engine does;
- **wrong**: every element that is not right turns red. Selecting one says which connector or
  which field is wrong, and why.

The game opens over the whole page and is drawn entirely with **three.js** on one WebGL canvas
(the board, the palette, the inscription with its fields, the buttons, the run): a scene
measured in pixels under a perspective camera, so the flat workbench can tilt into a floor for
the run. Texts and elements are painted on 2D canvases and used as textures; an element looks
as in the films and the tutorial. three.js is bundled into the one offline file (with its
licence at the top), which makes that file about 1 MB.

| The player | does |
| --- | --- |
| drags an element from the palette onto the board | places it (on the grid, never on top of another) |
| drags a placed element | moves it; onto the palette: takes it out, with its connectors |
| drags from an element's blue arrow to another element | connects them (or: click the arrow, then the element). Only a gateway has several ways out: elsewhere a new connector replaces the old one |
| clicks an element | sees what it is and sets its fields, each a row of chips |
| clicks a connector | selects it; its × or Delete removes it |

On a phone the board has the width to itself; one panel under it shows the palette while
nothing is selected and the inscription of what is. Without WebGL the puzzle says so instead
of opening. Known limit: the game is played with a pointer; the keyboard only closes it
(Escape), deletes what is selected and lets go of a selection. What the game says (hints,
what is wrong, the run's captions) is read out through a live region.

In the project: the start **Axon Ivy Training** (`training/process/training/AxonIvyTraining.p.json`,
tagged `DEMO`) opens the dialog `training.AxonIvyTraining`, whose page loads
`webContent/resources/js/axon-ivy-training.js` into `<div id="ivy-training" data-lang="…">`.
The language starts as the session's and the reader can switch between English and Japanese.
The project's `config/roles.yaml` and `config/users.yaml` hold the films' cast as roles and
test users (Employee with the child roles Manager and HR; anna, max, lea, hanna, ben, chloe,
password = name), to log in with in the Developer Workflow UI.

## The Workflow tree

`trees/workflow/`: what a process is built from and how Axon Ivy gives work to people. 71
skills: one root (Workflow), four branches side by side (Elements, Task, Case, People) in five
levels, and a boss after each level that needs all four branches. Inside a level the branches
can be taken in any order.

| Level | What a process needs by then | Its boss, and the process to build in its puzzle |
| --- | --- | --- |
| 1 A first process | a form (HTML Dialog, User Dialog), a task for a role | First approval: One approval |
| 2 Decide and tell | an Alternative, an E-Mail | Approve or reject (the run shows two cases, one per way out) |
| 3 Time and hand-overs | delay, expiry, SYSTEM | Approval workflow: Two approvals |
| 4 Side by side | Split and Join, parallel tasks, CREATOR | Side by side |
| 5 The details | what a real workflow reaches for | The whole business case: Two checks at once |

```text
trees/workflow/
  nodes.js              the skills in the order they are learned: { id, emoji, branch, level, answer };
                        LEVELS says how many levels the tree shows
  index.js              puts it together with src/layout.js
  text/core.<lang>.js   the tree's page texts, the labels all films share, the root and the bosses
  text/<topic>.<lang>.js   the skills of one topic: task1–3, case1–3, user1–3, role1–3 (as the tree
                        first grew), dialog, flow (Alternative, Split, Join), mail
  films/core.js, films/<topic>.js   their films
  films/kit.js          what the films share: the cast, chips, beats, scenes
  puzzles.js            the bosses' puzzles: each one's elements, the answer's connectors and fields
  text/puzzles.<lang>.js   the names all puzzles share (element kinds, fields, options) and each
                        puzzle's words: brief, names, reasons, captions
```

## Commands

```sh
npm install
npm run build      # src/ + trees/ → training/webContent/resources/js/axon-ivy-training.js
npm run check      # fails if that file is not what the sources produce
npm run watch
npm run preview    # http://127.0.0.1:4330/ (?lang=ja, #task opens a skill)
npm test           # the tree's map and gates, both languages' texts, the films' use of them, the timeline,
                   # the puzzle's rules and every puzzle's answer and words
npm run smoke      # every skill and every puzzle in a headless browser, both languages (screenshots in .preview/)
node tools/smoke.mjs expiry delay --lang=ja   # only these films
node tools/smoke.mjs --puzzles boss2          # only the puzzles (all, or those named)
```

## Layout

```text
src/
  index.js        finds #ivy-training, opens a shadow root, mounts the tree, switches language
  layout.js       buildTree: every skill's place on the map and what it needs, from branch, level and order
  skilltree.js    the map (columns, level headings, gates) and the card (adapted from nammai-blog's
                  js/skilltree.js, without toys)
  film.js         the film player: SVG stage, subtitles, play/pause/scrub/replay
  timeline.js     a seekable timeline: every value worked out from its tweens, so any moment can be shown
  stage.js        actors (an SVG group or text with x, y, s, r, o and bound properties)
  cast.js         the drawings and moves: people, the SYSTEM robot, task cards, task lists, a form,
                  folder, clock, calendar, database, log line; and what belongs to the Designer,
                  drawn as the tutorial's simulated Designer draws it: a process in its editor
                  (C.proc), its token and run (enter, run, arrive, finish), the inscription view
  texts.js        the page's texts, EN and JA
  puzzle/
    model.js      the rules, without drawing: what may be connected, the check (what is wrong where),
                  a connector's route, the timing of the run
    paint.js      what the game shows, painted on 2D canvases: elements, texts, panels, chips, the cast
    gl.js         the three.js stage: nodes the timeline can move, sprites, lines, confetti
    game.js       the game: layout, drag and drop, connecting, the inscription, Finish
    run.js        the solved process running, as a seekable timeline over the stage
    index.js      the dialog that holds the canvas
  styles.css      the page, in the shadow root
preview/server.mjs  serves the real dialog page with its JSF bits resolved
tools/smoke.mjs     the browser check
tools/put-text.cjs, tools/put-film.mjs   put a skill's texts or film into its file (for writing in pieces)
tools/mark-progress.mjs                  marks skills done in PROGRESS.md
test/
```

## Rules a tree is held to (the tests)

- One root; a boss per level; every branch has skills on every level.
- What a skill needs comes from its place: the first skill of a branch needs the root or the
  boss of the level before, every other skill the one above it, a boss the last skill of every
  branch. Everything a skill needs is drawn above it; no two skills share a spot.
- Both languages have the same keys and placeholders. Three myths per skill, no two the same.
  Three options per check, the right one not always in the same place. `[[id]]` links only to skills on the map.
- Every skill has a film. A film says only subtitles that exist and uses only labels that
  exist; no subtitle and no label of a skill is left unused.
- Every boss has a puzzle. Its story only goes forward (the start first, every connector from
  an earlier element to a later one, several ways out only from a Task Switch Gateway, an Alternative or a Split). A field's default
  is never its answer. Untouched, a puzzle is wrong; solved, it is right; with only the fields
  untouched, exactly the fields are wrong. In both languages every element has a name that
  tells it apart, every wrong option a reason, and no word is written that no puzzle uses.
  Where an Alternative chooses, the run has a story per way out; every element runs in some
  story and has a caption in each story that visits it.

## Writing a skill

Texts, per language: `name`, `hook`, `def` (the skill in one sentence), `show` (the film's
`title` and one line per scene), `labels` (the film's own words), `myths` (three cards of
`{ myth, fact }`: what people think, and what is true),
`q`, `options`, `why` (the check; the right option is `answer` in nodes.js). In texts:
`**bold**`, `` `code` `` and `[[id|words]]` for a link to another skill.

A process in a film is `C.proc(parent, x, y, steps, { w, file })`: it lays the steps out, draws the
editor around them, and `C.enter` / `C.run(proc, token, [0, 1, 2], at)` play a token through it, as a
run looks in a walkthrough of the tutorial. Do not draw process elements by hand.

A film is `films.<id> = (L, k) => { … }`: draw with `k.C` (src/cast.js), put every change on
`k.tl` at a time in seconds, say the subtitles with `k.say(key, at)`, take words from
`k.t(key)` (the skill's labels) or `k.f(key)` (shared ones); `k.opening()` draws the title card
and returns when the film proper starts. Scenes are timed from beats (`beats(start, …lengths)`),
one per subtitle. The stage is 600 × 450. After writing, look at the screenshots of
`node tools/smoke.mjs <id>`: text that runs out of its field or under another drawing does
not fail a test.

## Writing a puzzle

In `puzzles.js`, under the id of its skill: `file` (the name on the editor's tab), `elements`
in the order of the story and `flow`, the answer's connectors. An element is `{ id, kind }`
with kind `start`, `dialog` (User Dialog), `user` (User Task), `script`, `email` (E-Mail),
`switch` (Task Switch Event), `gateway` (Task Switch Gateway), `alternative`, `split`, `join`
or `end`; `by` is who works there in the run (one of
the cast, or `system`) and `role` the role whose task it is. `fields` are what the player sets:
`{ id, options, answer }`, the first option being what the Designer has there (or `default`);
a field about one way out (a gateway's task, an Alternative's condition) has a `label` with a
place for a name (`taskTo`, `condTo`) and `to`, the element that way leads to. A Split's `outN`
belongs to the connector the player drew Nth, whichever path that is: its field has `nth: N`
instead of `to` (`splitOut`). An Alternative tries its rows in the order its exits were drawn,
as the Designer lists them: the check marks it wrong (`rowOrder`) when an exit the answer leaves
empty, which is always true, is not the last one. A process with an Alternative also has
`stories`: the cases its run shows, one per way out
(`{ texts: 'run2', takes: { <alternative>: <next element> }, by? }`); list the empty exit last in
`flow`.

In `text/puzzles.<lang>.js`: `title`, `brief`, `names` (per element; an end has none), `why`
(per `element.field`, a reason for each wrong option: why it is wrong, not what is right),
`next` (per element, why what follows it follows it: said when its connector is missing or
wrong), `run` (per element, the caption while the solved process runs) and `solved`. New
fields and options get their names in `puzzle.fields` and `puzzle.options`, as the Designer
shows them.

A puzzle states only what was checked (see Facts). After writing one, play it:
`node tools/smoke.mjs --puzzles <id>` and look at its screenshots.

## Facts

Every fact in the tree comes from the official 14.0 documentation, the Designer's defaults and
messages, or probe processes on the Designer's engine. What was checked and how is in
PROGRESS.md: "Workflow tree, checked on the engine" and "Training: tasks, checked on the engine".
