/**
 * The Workflow tree, task level 1: its skills in English.
 * Keys per skill as described in text/core.en.js.
 */
export default {
  task: {
    name: 'Task',
    hook: 'Some work needs a person. The process has to wait.',
    def: 'A **task** is one piece of work in a case. A start creates the first one; where work needs a person, the process stops at a task switch and waits until someone has done the new task.',
    show: {
      title: 'Work that waits',
      runs: 'A process runs by itself, step after step, until it reaches work that only a person can do.',
      stops: 'There it stops and creates a task: a piece of work with a name, like “Approve leave: Anna”.',
      list: 'The task waits in a task list until someone who may do it opens it. Here that is Max.',
      done: 'When Max has finished, the task is done and the process goes on from there.',
      point: 'That is all a task is: the process saying “a person has to do this, I will wait”.'
    },
    labels: { check: 'Check', approve: 'Approve', waiting: 'Waits for a person', summary: 'Task = work that waits for a person' },
    myths: [
      { myth: 'A task is just another step of the process.', fact: 'Most steps run by themselves in a split second. A task is where the process stops and waits, sometimes for days, until a person has done the work.' },
      { myth: 'While a task waits, the process keeps running in the background.', fact: 'No. At a task the process stops and waits. It goes on from there when a person has done the work.' },
      { myth: 'A task has to be done right away, or the process fails.', fact: 'A task can wait as long as it takes, minutes or days. The process does not fail: it waits.' }
    ],
    q: 'A process reaches a task. What does it do?',
    options: ['It does the work itself and goes on', 'It fails, because no person is there', 'It stops and waits until someone has done the task'],
    why: 'A task is work for a person. The process waits for it, however long that takes.'
  },

  tasklist: {
    name: 'Task list',
    hook: 'Where does the work show up?',
    def: 'The **task list** shows the open [[task|tasks]] you may work on. Start one, and it is in progress with you until you finish it.',
    show: {
      title: 'Your inbox for work',
      list: 'Everyone who works with processes has a task list. Ben and Hanna both work in HR.',
      new: 'A process creates a task for HR. It appears in both their lists.',
      pick: 'Ben starts it. The task is now in progress, with Ben.',
      others: 'Nobody else can start it any more: one task, one person.',
      done: 'Ben finishes. The task is done, and the process goes on.',
      where: 'For real users the task list is in the Axon Ivy Portal. In the Designer you test with the Developer Workflow UI.'
    },
    labels: { paper: 'Order paper', portal: 'Axon Ivy Portal', devUi: 'Developer Workflow UI' },
    myths: [
      { myth: 'Every task shows up for everyone.', fact: 'A task shows up only for the people who may work on it: the [[role|role]] or the user it is given to.' },
      { myth: 'When two people have the same task in their lists, both can work on it.', fact: 'Only until one of them starts it. Then it is in progress with that person, and nobody else can start it: one task, one person.' },
      { myth: 'Real users work in the task list that developers test with in the Designer.', fact: 'Real users find their task list in the Axon Ivy Portal. The Developer Workflow UI is for testing in the Designer.' }
    ],
    q: 'Ben starts a task from his task list. What happens to it?',
    options: ['It is in progress with Ben; nobody else can start it', 'Everyone with the role works on it together', 'It is done at once'],
    why: 'A task is done by one person. Once Ben has started it, it is his until he finishes.'
  },

  usertask: {
    name: 'User Task',
    hook: 'A form, but later, and for someone else.',
    def: 'A **User Task** creates a [[task|task]] with a dialog. When someone starts the task, the dialog opens for them; when they finish it, the process goes on.',
    show: {
      title: 'A dialog that waits',
      request: 'Anna requests leave in a dialog. Her manager has to approve it, but not now, and not on Anna’s screen.',
      create: 'A User Task does exactly that: it creates a task for the role Manager, and the process waits.',
      list: 'The task appears in Max’s task list: approve leave for Anna.',
      open: 'Max starts it. Now the dialog opens, with Anna’s request, and Max approves.',
      on: 'He finishes the dialog: the task is done and the process goes on. A User Task is a Task Switch and a dialog in one.'
    },
    labels: { request: 'Request', approve: 'Approve', submit: 'Submit', approveBtn: 'Approve', leave: 'Leave request', approveTitle: 'Approve leave', waits: 'Waits for a manager' },
    myths: [
      { myth: 'A User Task opens its dialog at once, for whoever is using the process.', fact: 'It creates a task first. The dialog opens when someone who may do the task starts it, maybe days later. A User Dialog element is the one that opens a dialog at once.' },
      { myth: 'A User Task is only a dialog. The task needs another element.', fact: 'A User Task is a Task Switch and a dialog in one: it creates the task, and opens the dialog when the task is started.' },
      { myth: 'As soon as the User Task has created its task, the process goes on.', fact: 'The process waits. It goes on when someone has started the task and finished its dialog.' }
    ],
    q: 'Anna submits her request. Next comes a User Task for the role Manager. What happens?',
    options: ['The approval dialog opens on Anna’s screen', 'A task for managers is created, and the process waits', 'The process fails: Anna is not a manager'],
    why: 'The User Task creates a task for the role Manager. Its dialog opens when a manager starts that task.'
  },

  taskswitch: {
    name: 'Task Switch',
    hook: 'Hand the work over, without a dialog.',
    def: 'A **Task Switch Event** ends the current [[task|task]] and creates a new one, for example for another [[role|role]]. The process goes on when someone starts the new task.',
    show: {
      title: 'Passing the baton',
      before: 'Anna fills in her request. Everything so far happens in Anna’s task.',
      switch: 'At the Task Switch the process stops. Anna’s task is done, and a new task is created for Manager.',
      store: 'The process data is stored with the new task, in the engine’s database.',
      next: 'Max starts the new task. The process goes on from the Task Switch, with Anna’s data.',
      vs: 'A User Task does the same and opens a dialog. After a Task Switch, the next steps run as soon as the task is started.'
    },
    labels: { fill: 'Fill in', book: 'Book', task1: 'Task 1: Anna', task2: 'Task 2: Max', db: 'Engine database', toManager: 'Manager', same: 'User Task = Task Switch + dialog' },
    myths: [
      { myth: 'After a Task Switch, the next steps run right away.', fact: 'They run when someone starts the new task. Until then the process waits at the Task Switch, stored in the database.' },
      { myth: 'At a Task Switch the process data is lost: the new task starts empty.', fact: 'The process data is stored with the new task, in the engine’s database. Whoever starts the new task goes on with it.' },
      { myth: 'A Task Switch hands the running task on to the next person.', fact: 'It ends the current task and creates a new one. That makes two tasks: the first is done, the second waits for whoever is responsible.' }
    ],
    q: 'A process reaches a Task Switch Event for the role Manager. When do the next steps run?',
    options: ['Right away', 'Never: a Task Switch ends the process', 'When a manager starts the new task'],
    why: 'The Task Switch ends the current task and waits. The next steps run in the new task, once a manager starts it.'
  },

  states: {
    name: 'Task states',
    hook: 'Open, in progress, done. And a few more.',
    def: 'A [[task|task]] has a **state**: open while it waits, in progress while someone works on it, done when finished. The engine names them SUSPENDED, RESUMED and DONE.',
    show: {
      title: 'The life of a task',
      open: 'A new task is open: it waits in the task list. The engine calls this SUSPENDED.',
      progress: 'Ben starts it: in progress, RESUMED for the engine. Now it is his.',
      done: 'He finishes: the task is DONE. It stays in its case, as a record of what was done.',
      other: 'There are a few more. Destroyed: cancelled. Delayed: not there yet.'
    },
    labels: { destroyed: 'Destroyed: cancelled', delayedTag: 'Delayed: not yet' },
    myths: [
      { myth: 'A task is either open or done.', fact: 'In between it is in progress, RESUMED: one person is working on it, and nobody else can start it. And a task can end without being done: DESTROYED.' },
      { myth: 'SUSPENDED means something went wrong with the task.', fact: 'SUSPENDED is the engine’s name for open: the task waits in the task list, just as it should.' },
      { myth: 'A task that is done disappears.', fact: 'It stays in its case, as a record of what was done.' }
    ],
    q: 'A task waits in the task list; nobody has started it yet. What is its state for the engine?',
    options: ['RESUMED', 'SUSPENDED', 'CREATED'],
    why: 'SUSPENDED is the engine’s name for open: the task waits. RESUMED means someone is working on it.'
  }
};
