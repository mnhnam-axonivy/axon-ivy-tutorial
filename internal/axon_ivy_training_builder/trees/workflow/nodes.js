/**
 * The Workflow tree: what a process is built from and how it gives work to people. One root,
 * four branches side by side (Elements, Task, Case, People) and five levels; after each level
 * a boss that needs all four branches. src/layout.js works out every skill's place on the map
 * and what it needs.
 *
 * A level is what one more kind of process needs, and its boss is that process, to be built in
 * the boss's puzzle (puzzles.js) from the elements learned up to there:
 *
 *   level 1  a first process      a form, a task for a role             boss: First approval
 *   level 2  decide and tell      an Alternative, an E-Mail             boss: Approve or reject
 *   level 3  time and hand-overs  delay, expiry, SYSTEM                 boss: Approval workflow
 *   level 4  side by side         Split and Join, parallel tasks        boss: Side by side
 *   level 5  the details          what a real workflow reaches for      boss: The whole business case
 *
 * A skill is { id, emoji, branch, level, answer }: `answer` is the right option of its check,
 * counting from 0. The skills of a branch are listed in the order they are learned. Texts and
 * films are grouped by topic, not by branch: text/<topic>.<lang>.js and films/<topic>.js with
 * the topics task1–3, case1–3, user1–3, role1–3 (as the tree first grew), dialog, flow, mail,
 * and core for the root and the bosses.
 *
 * LEVELS is how many levels are built so far: the tree shows only those.
 *
 * Every fact a skill states was checked against Axon Ivy 14.0.1: the official documentation,
 * the Designer's defaults and messages, and probe processes on the Designer's engine
 * (PROGRESS.md: "Elements for the training, checked on the engine", "Workflow tree, checked on
 * the engine", "Training: tasks, checked on the engine", "Part 3, checked on the engine").
 */
export const LEVELS = 5;

export const branches = [
  { id: 'element', emoji: '🧱', color: 'var(--c-cyan)' },
  { id: 'task', emoji: '📋', color: 'var(--c-green)' },
  { id: 'case', emoji: '🗂️', color: 'var(--c-gold)' },
  { id: 'people', emoji: '👥', color: 'var(--c-pink)' }
];

export const root = { id: 'workflow', emoji: '🧭', answer: 1 };

export const bosses = [
  { id: 'boss1', emoji: '🥉', level: 1, answer: 0 },
  { id: 'boss2', emoji: '🥈', level: 2, answer: 1 },
  { id: 'boss3', emoji: '🥇', level: 3, answer: 2 },
  { id: 'boss4', emoji: '🏅', level: 4, answer: 0 },
  { id: 'boss5', emoji: '🏆', level: 5, answer: 1 }
];

const branch = (id, level, list) => list.map(([sid, emoji, answer]) => ({ id: sid, emoji, branch: id, level, answer }));

export const skills = [
  // ---- Elements: what a process is built from ----
  ...branch('element', 1, [['htmldialog', '🪟', 1], ['userdialog', '📝', 2], ['dialogdata', '🔃', 0], ['dialogclose', '🔘', 1]]),
  ...branch('element', 2, [['alternative', '🛤️', 2], ['altdefault', '🚧', 0], ['email', '✉️', 1]]),
  ...branch('element', 3, [['delay', '⏳', 0]]),
  ...branch('element', 4, [['split', '🍴', 1], ['joinpaths', '🪢', 2]]),
  ...branch('element', 5, [['mailerror', '📭', 0]]),

  // ---- Task: the work itself ----
  ...branch('task', 1, [['task', '📋', 2], ['tasklist', '📥', 0], ['usertask', '🧑‍💻', 1], ['taskswitch', '🤝', 2], ['states', '🚦', 1]]),
  ...branch('task', 2, [['taskname', '🏷️', 1], ['data', '💾', 0], ['priority', '🔺', 2], ['timeout', '⌛', 2]]),
  ...branch('task', 3, [['expiry', '⏰', 2], ['skip', '⏭️', 1], ['notification', '🔔', 1]]),
  ...branch('task', 4, [['gateway', '🔀', 0], ['join', '🔗', 1], ['signalcancel', '📡', 1]]),
  ...branch('task', 5, [['category', '🗃️', 0], ['customfields', '🧾', 2], ['taskcode', '⚙️', 0], ['taskapi', '🔎', 2]]),

  // ---- Case: one run of the process ----
  ...branch('case', 1, [['case', '🗂️', 1], ['onestart', '▶️', 2], ['casestates', '🔄', 0]]),
  ...branch('case', 2, [['casedone', '🏁', 1], ['casename', '✏️', 0]]),
  ...branch('case', 3, [['destroy', '🗑️', 2]]),
  ...branch('case', 4, [['businesscase', '💼', 0], ['trigger', '🚀', 2], ['signalstart', '📣', 1]]),
  ...branch('case', 5, [['casefields', '🔖', 1], ['persist', '📌', 0], ['caseapi', '🔍', 2]]),

  // ---- People: users, and the roles they have ----
  ...branch('people', 1, [['user', '👤', 2], ['role', '👥', 0], ['everybody', '🌍', 1], ['responsible', '🎯', 2]]),
  ...branch('people', 2, [['session', '🪪', 0], ['anonymous', '🕶️', 1], ['testusers', '🧑‍🤝‍🧑', 2], ['developer', '🦸', 0], ['worker', '✍️', 1]]),
  ...branch('people', 3, [['roletree', '🌳', 1], ['inherited', '🧬', 0], ['userroles', '🎫', 2], ['severalroles', '➕', 1], ['userattr', '📇', 1], ['roleattr', '🧮', 0], ['system', '🤖', 0]]),
  ...branch('people', 4, [['creator', '🙋', 2], ['self', '🪞', 0], ['members', '📜', 1]]),
  ...branch('people', 5, [['permission', '🚪', 2], ['language', '🌐', 0], ['absence', '🏖️', 2], ['substitute', '🔁', 1]])
];
