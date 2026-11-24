/**
 * The Workflow tree, case level 1: its skills in English.
 * Keys per skill as described in text/core.en.js.
 */
export default {
  case: {
    name: 'Case',
    hook: 'Ten leave requests. One process. Ten cases.',
    def: 'A **case** is one run of a process: one leave request, one order. Every start of a process creates a new case, and its [[task|tasks]] belong to it.',
    show: {
      title: 'One run of the process',
      plan: 'The process is the plan, drawn once: request leave, approve it, done.',
      start: 'Anna starts it. That creates a case: Anna’s leave request.',
      more: 'Ben and Chloé start it too. The same process, two more cases.',
      own: 'Each case has its own tasks and its own data. Approving Anna’s leave changes nothing for Ben.',
      done: 'When the last task of a case is done, the case is done. The others go on.'
    },
    labels: { process: 'The process', approve: 'Approve' },
    myths: [
      { myth: 'The process and the case are the same thing.', fact: 'The process is the plan. A case is one run of it, with its own data and tasks. One process can have thousands of cases at the same time.' },
      { myth: 'A process can only run once at a time.', fact: 'Every start creates a new case. Anna, Ben and Chloé can all have theirs running at the same time.' },
      { myth: 'Approving one leave request moves the others along too.', fact: 'Each case has its own tasks and its own data. Approving Anna’s leave changes nothing for Ben.' }
    ],
    q: 'Three people start the same leave-request process. How many cases are there?',
    options: ['One', 'Three', 'One per task'],
    why: 'Every start creates a new case. Three starts, three cases, all following the same process.'
  },

  onestart: {
    name: 'One start, one case',
    hook: 'One click on the start. What exists now?',
    def: 'Every start of a process creates a new [[case|case]] and its first task. That first task belongs to whoever started the process.',
    show: {
      title: 'One click, one case',
      click: 'Anna clicks the start of the leave process.',
      both: 'At once there is a case, and its first task. Anna is already working in that task.',
      nolist: 'This first task is in nobody’s task list: Anna is in the middle of it, filling in her request.',
      again: 'Tomorrow she starts the process again: another case, another first task.'
    },
    labels: { leave: 'Leave request', firstTask: 'First task', by: 'In progress: {0}', another: 'Another case', noTasks: 'No tasks' },
    myths: [
      { myth: 'The start creates the case. The first task comes later, at the first User Task.', fact: 'The start creates both. Everything up to the first task switch happens in that first task, done by the person who started.' },
      { myth: 'The first task waits in a task list, like any other.', fact: 'It is in nobody’s task list: the person who started is already working in it.' },
      { myth: 'Starting the process again continues yesterday’s case.', fact: 'Every start creates another case, with another first task.' }
    ],
    q: 'Anna starts the leave process and sees the request form. How many tasks does her case have?',
    options: ['None yet', 'None until she submits', 'One: the task she is working in'],
    why: 'A start creates a case and a task. Anna’s form is part of that first task.'
  },

  casestates: {
    name: 'Case states',
    hook: 'A case has a life too.',
    def: 'A [[case|case]] has a **state**: CREATED when it starts, RUNNING once it waits for a task, DONE when its last task is done. DESTROYED means it was cancelled.',
    show: {
      title: 'The life of a case',
      created: 'A case starts as CREATED. The engine has not stored it yet.',
      running: 'At the first task switch the engine stores it. Now it is RUNNING, and stays so while tasks are open.',
      done: 'The last task is finished: the case is DONE.',
      destroyed: 'A case that is cancelled is DESTROYED, and its open tasks with it.'
    },
    labels: { stored: 'Stored', cancelled: 'Destroyed: cancelled, tasks too' },
    myths: [
      { myth: 'A case is stored from the first click.', fact: 'Until its first task switch a case is only CREATED: the engine has not stored it yet. From then on it is RUNNING. (Unless its Start stores it at once: see [[persist|Persist on start]].)' },
      { myth: 'A case that waits for a task is paused, not running.', fact: 'For the engine it is RUNNING, and it stays so while tasks are open.' },
      { myth: 'A cancelled case leaves its open tasks for people to finish.', fact: 'A case that is cancelled is DESTROYED, and its open tasks with it.' }
    ],
    q: 'A case has passed its first task switch and waits for a manager. What is its state?',
    options: ['RUNNING', 'CREATED', 'DONE'],
    why: 'At the first task switch a case is stored and becomes RUNNING. It is DONE only when its last task is done.'
  }
};
