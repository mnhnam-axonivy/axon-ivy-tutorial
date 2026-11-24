/**
 * The Workflow tree in English: the tree's own page texts (ui), the labels every film shares
 * (film), and the root and the bosses (nodes).
 *
 * Per skill: its name, a hook, the skill in one sentence (def), its film's title and subtitles
 * (show), the film's own labels, its myths (three of { myth, fact }: what people think, and what is true) and the check (q, options, why; the right
 * option is `answer` in nodes.js). In texts: **bold**, `code`, and [[id]] or [[id|words]] for a
 * link to another skill.
 */
export const ui = {
  kicker: 'Axon Ivy training · Workflow',
  introTitle: 'Elements, tasks, cases and people: how a process gets work done.',
  introBody: 'Four branches, five levels. Each skill is a short film, three myths to turn over, and one question that unlocks the next. Inside a level, take the branches in any order; the boss at its end needs all four, and gives you a process to build yourself.',
  branch_element: 'Elements',
  branch_task: 'Task',
  branch_case: 'Case',
  branch_people: 'People',
  level1: 'Level 1 · A first process',
  level2: 'Level 2 · Decide and tell',
  level3: 'Level 3 · Time and hand-overs',
  level4: 'Level 4 · Side by side',
  level5: 'Level 5 · The details',
  complete: 'Tree complete 🏆',
  completeBody: 'You know what a process is built from and how Axon Ivy gives work to people: its elements, what a task and a case are, who the users are, and how roles decide who gets what.',
  disclaimer: 'Checked against Axon Ivy 14.0.1: the official documentation, the Designer, and probe processes on its engine.'
};

export const film = {
  anna: 'Anna',
  max: 'Max',
  hanna: 'Hanna',
  ben: 'Ben',
  chloe: 'Chloé',
  lea: 'Lea',
  developer: 'Developer',
  taskList: 'Task list',
  open: 'Open',
  inProgress: 'In progress',
  done: 'Done',
  delayed: 'Delayed',
  high: 'High',
  normal: 'Normal',
  low: 'Low',
  everybody: 'Everybody',
  manager: 'Manager',
  hr: 'HR',
  system: 'SYSTEM',
  responsible: 'Responsible',
  priority: 'Priority',
  delay: 'Delay',
  expiry: 'Expiry',
  timeout: 'Timeout',
  taskTab: 'Task',
  name: 'Name',
  roles: 'Roles',
  userFromAttr: 'User from Attribute',
  roleFromAttr: 'Role from Attribute',
  category: 'Category',
  customFields: 'Custom Fields',
  notification: 'Notification',
  membersFromAttr: 'Members from Attribute',
  leaveOf: 'Leave: {0}',
  output: 'Output',
  userTask: 'User Task',
  taskSwitch: 'Task Switch Event',
  taskSwitchGateway: 'Task Switch Gateway',
  approveLeave: 'Approve leave: Anna',
  contract: 'Check the contract',
  days: 'Days',
  from: 'From',
  monday: 'Monday',
  threeDays: '3 days',
  caseOf: 'Case: {0}',
  employee: 'Employee',
  taskWord: 'Task',
  caseWord: 'Case',
  userWord: 'User',
  roleWord: 'Role',
  elementWord: 'Elements',
  peopleWord: 'People',
  creator: 'CREATOR',
  start: 'Start',
  requestTab: 'Request',
  sessionUser: 'Session user: {0}'
};

export const nodes = {
  workflow: {
    name: 'Workflow',
    hook: 'A process that needs people.',
    def: 'A **workflow** is a process that gives work to people and waits for them. It is built from elements, and it runs as cases and tasks that users with the right roles work on.',
    show: {
      title: 'Work that moves',
      process: 'A process is a plan: steps in order. Many of them the engine does by itself.',
      people: 'But some work needs people. A workflow hands it to them, and waits.',
      four: 'It takes four things. Elements: what the process is built from. A task: one piece of work. A case: one run of the process. And people: users, and the roles they have.',
      tree: 'They are the four branches of this tree. Five levels, each ending in a boss: a process to build yourself. Start with any branch of level 1.'
    },
    labels: { check: 'Check', approve: 'Approve', book: 'Book', waits: 'Waits for a person' },
    myths: [
      { myth: 'A workflow is the same as a process.', fact: 'The process is the plan. The workflow is the plan at work: cases started, tasks waiting, users with the right roles doing them.' },
      { myth: 'In a workflow, people do every step.', fact: 'Many steps the engine does by itself. A workflow hands people only the work that needs them, and waits.' },
      { myth: 'To understand a workflow you need dozens of concepts.', fact: 'Four are enough to begin: a task is one piece of work, a case one run of the process, a user one person, a role a group with the same job.' }
    ],
    q: 'What makes a process a workflow?',
    options: ['It has more than ten steps', 'It gives work to people and waits for them', 'It is drawn in the Designer'],
    why: 'A workflow is about people: it creates tasks for them and goes on when they are done.'
  },

  boss1: {
    name: 'First approval',
    hook: 'Boss of level 1: the four branches in one process.',
    def: 'Level 1 together: a [[onestart|start]] creates a [[case|case]] and its first [[task|task]], a [[usertask|User Task]] hands the work to a [[role|role]], and a [[user|user]] with that role does it.',
    show: {
      title: 'The first approval',
      start: 'Anna starts the leave process: a case, and its first task. She fills in the form and submits.',
      usertask: 'A User Task creates the next task, for the role Manager. The case is RUNNING, the task open.',
      max: 'Max has the role Manager. He finds the task in his task list and starts it: in progress.',
      done: 'He approves. The task is done and, as it was the last one, so is the case.'
    },
    labels: { request: 'Request', approve: 'Approve', approveCard: 'Approve: Anna', running: 'RUNNING', caseDone: 'DONE' },
    myths: [
      { myth: 'The process moves the work. Users and roles are someone else’s job.', fact: 'A process only names roles. Who really gets the work depends on which users have them. Both sides have to fit.' },
      { myth: 'The case is done when Anna submits her request.', fact: 'Submitting ends only her task. The User Task creates another one, for Manager, and the case stays RUNNING until Max has done it.' },
      { myth: 'Max gets the approval because Anna picked him.', fact: 'Nobody picked him. The task is for the role Manager, and Max has that role: he finds it in his task list.' }
    ],
    q: 'Anna submits her request. Next comes a User Task for the role Manager, which Max has. What has to happen before the case can be done?',
    options: ['Max starts the task and finishes it', 'Anna approves it herself', 'Nothing: it finishes by itself'],
    why: 'The task is for Manager, so it waits for a user with that role. When Max has done it, the last task is done, and so is the case.'
  },

  boss2: {
    name: 'Approve or reject',
    hook: 'Boss of level 2: a process that decides, and tells.',
    def: 'Level 2 together: a [[userdialog|dialog]] brings the decision into the [[data|process data]], an [[alternative|Alternative]] chooses the way, and an [[email|E-Mail]] tells the one who asked when the answer is no.',
    show: {
      title: 'Yes, or no with a mail',
      request: 'Anna asks for leave. Max gets the task, as before: it is for the role Manager.',
      decide: 'Max decides in his dialog. Its result goes into the process data: approved, true or false.',
      yes: 'An Alternative looks at it. Approved: the leave is booked, and Anna’s case is done.',
      no: 'Another case: Ben’s request. Max says no, and the same Alternative sends the token the other way.',
      mail: 'There an E-Mail step writes to Ben. No task, nobody waits: his case is done as well.'
    },
    labels: { request: 'Request', decide: 'Decide', book: 'Book leave', sayNo: 'Say no', yes: 'yes', no: 'no', annaCase: 'Anna’s case', benCase: 'Ben’s case', approvedTrue: 'approved: true', approvedFalse: 'approved: false', approveBtn: 'Approve', rejectBtn: 'Reject', done: 'Case done' },
    myths: [
      { myth: 'A decision needs two tasks: one to approve, one to reject.', fact: 'One task is enough. The decision is a value in the process data, and an [[alternative|Alternative]] after the task chooses the way.' },
      { myth: 'To tell someone, a process has to give them a task.', fact: 'An [[email|E-Mail]] step tells them without a task: the mail goes out, and the process goes on.' },
      { myth: 'Both paths after an Alternative run. The wrong one just does nothing.', fact: 'Only one path runs in a case: the first exit whose condition is true. Another case may take the other.' }
    ],
    q: 'Max rejects Ben’s request. The Alternative’s rows are: 1. `in.approved` → Book leave, 2. (empty) → Say no. What happens?',
    options: ['The leave is booked', 'The mail is sent, and the case is done', 'The process fails: no condition is true'],
    why: 'Row 1 is false. Row 2 is empty, so it is true: the token goes to the E-Mail step, and after that nothing is left to do.'
  },

  boss3: {
    name: 'Approval workflow',
    hook: 'Boss of level 3: an approval that does not get stuck.',
    def: 'Level 3 together: a [[usertask|User Task]] for the [[userattr|right person]], an [[expiry|expiry]] for when they are away, and [[system|SYSTEM]] to finish the job without anyone.',
    show: {
      title: 'Leave, from request to booking',
      start: 'Anna starts the leave request: a new case. She fills in the form.',
      approve: 'A User Task for her manager, max, from the process data. The process waits.',
      away: 'Max is away. After two days the task expires and goes to HR, with priority High.',
      hr: 'Hanna approves.',
      system: 'A Task Switch to SYSTEM books the leave in the HR system. Nobody clicks.',
      done: 'The last task is done, so the case is done. Anna’s leave is booked.'
    },
    labels: { request: 'Request', approve: 'Approve', book: 'Book', approveCard: 'Approve: Anna', done: 'Case done' },
    myths: [
      { myth: 'A workflow is finished when the happy path works.', fact: 'Ask the other questions too: who may see the task ([[responsible|responsible]]), who does it when that person is away ([[expiry|expiry]]), and what runs without anyone ([[system|SYSTEM]]).' },
      { myth: 'With priority High, a task cannot be left waiting.', fact: 'Priority only orders the list, and a delay only hides the task. What hands a waiting task to someone else in time is an expiry.' },
      { myth: 'Booking the leave needs someone in HR to click.', fact: 'A Task Switch gives that task to SYSTEM. The engine books the leave by itself; nobody clicks.' }
    ],
    q: 'Max is away for three weeks. What keeps Anna’s request from waiting for him all that time?',
    options: ['Priority High', 'A delay of three weeks', 'An expiry that hands the task to HR'],
    why: 'Priority only orders the list, and a delay only hides the task. An expiry hands it to someone else in time.'
  },

  boss4: {
    name: 'Side by side',
    hook: 'Boss of level 4: more than one thing at a time.',
    def: 'Level 4 together: a [[gateway|Task Switch Gateway]] for what people do side by side, [[creator|CREATOR]] to hand the result back to the one who asked, and a [[split|Split]] with a [[joinpaths|Join]] for what the engine does side by side.',
    show: {
      title: 'Two kinds of “at the same time”',
      people: 'Anna’s request needs two checks. A Task Switch Gateway creates two tasks, and Max and Hanna work side by side.',
      joinTasks: 'The second gateway waits for both. Then it creates one task for CREATOR: Anna, who started the case.',
      engine: 'Anna confirms. What is left needs no person: book the leave, and send her the mail.',
      split: 'A Split sends a token down both paths, in the same task. A Join brings them together again.',
      point: 'Tasks side by side: Task Switch Gateways. Steps side by side: Split and Join. Both wait for all their paths.'
    },
    labels: { mgr: 'Manager’s check', hr: 'HR’s check', confirm: 'Confirm', book: 'Book leave', tell: 'Tell Anna', tasksWord: 'Tasks side by side: Task Switch Gateway', stepsWord: 'Steps side by side: Split and Join' },
    myths: [
      { myth: 'Work at the same time always means several tasks.', fact: 'Only when people are to work side by side: a [[gateway|Task Switch Gateway]] creates a task per path. Steps of the engine run side by side in one task, after a [[split|Split]].' },
      { myth: 'After parallel paths, the process goes on as soon as one of them is done.', fact: 'Both kinds wait for all their paths: a [[joinpaths|Join]] for every token, a [[join|joining Task Switch Gateway]] for every task.' },
      { myth: 'The task after the checks has to go to a role.', fact: 'It can go to one person the process finds by itself: [[creator|CREATOR]] is the user who started the case.' }
    ],
    q: 'After the approval, the leave has to be booked and a mail sent: both by the engine, side by side. Which elements do that?',
    options: ['A Split and a Join', 'Two Task Switch Gateways', 'An Alternative'],
    why: 'A Split runs all its paths in the same task, and a Join brings them together. Task Switch Gateways would create tasks; an Alternative takes only one path.'
  },

  boss5: {
    name: 'The whole business case',
    hook: 'The last boss: everything, in one story.',
    def: 'Everything together: a [[permission|start]] only employees may use, [[join|parallel checks]], a [[substitute|substitute]] when someone is away, and a [[trigger|triggered]] workflow in the same [[businesscase|business case]].',
    show: {
      title: 'Leave, the whole story',
      start: 'Anna starts her leave request. Only employees may: the Start’s Permission says so.',
      parallel: 'Two checks at once: her own manager’s, for max alone, and HR’s. The joining gateway waits for both.',
      away: 'Max is absent. His task is for him alone, so his substitute Lea starts it instead.',
      trigger: 'Approved. A Trigger Step starts the booking: a second case, in the same business case.',
      system: 'The booking’s task belongs to SYSTEM. It runs by itself.',
      done: 'Both cases are done. The business case holds the whole story of Anna’s leave.'
    },
    labels: { request: 'Request', mgr: 'Manager', hr: 'HR', trig: 'Trigger', leaveCase: 'Leave', bookingCase: 'Booking', bc: 'Business case', absent: 'Absent', subst: 'Substitute' },
    myths: [
      { myth: 'Big workflows need tricks that small ones do not.', fact: 'They are the same few things, combined: tasks, cases, users and roles. Each of them you have now seen on its own.' },
      { myth: 'The booking is part of the leave case.', fact: 'The Trigger Step starts it as a second case. Both belong to the same business case, which holds the whole story.' },
      { myth: 'With Max absent, the manager’s check has to wait for him.', fact: 'It is for max alone, so it would. But his substitute Lea may start it while he is absent.' }
    ],
    q: 'In this workflow, why can the booking run without anyone opening a task?',
    options: ['Because it has priority High', 'Because its task belongs to SYSTEM', 'Because Anna is its creator'],
    why: 'A task for SYSTEM is started by the engine itself. Nobody has to open it.'
  }
};
