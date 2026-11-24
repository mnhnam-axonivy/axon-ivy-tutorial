/**
 * The Workflow tree, task level 3: its skills in English.
 * Keys per skill as described in text/core.en.js.
 */
export default {
  category: {
    name: 'Category',
    hook: 'Leave, contracts, invoices: one long list.',
    def: 'A **category** is a path like `HR/Leave` that sorts tasks into groups. The name people see for it comes from the CMS.',
    show: {
      title: 'A place for every task',
      pile: 'A long task list. Leave, contracts, invoices: all mixed together.',
      field: 'On the Task tab: Category, a path like HR/Leave.',
      group: 'Now a list can filter by it: everything under HR, or only the leave requests.',
      cms: 'The path is the key. Its display name is read from the CMS, so it can be translated: /Categories/HR/Leave/name.'
    },
    labels: { invoice: 'Check invoice', path: 'HR/Leave', other: 'Finance/Invoices', cms: '/Categories/HR/Leave/name' },
    myths: [
      { myth: 'A category is just a label: any text will do.', fact: 'It is a path with a meaning: `HR/Leave` puts the task under HR, then Leave. And its display name is read from the CMS under `/Categories/…`, so write it the same way everywhere.' },
      { myth: 'Tasks can only be filtered by their name.', fact: 'Give them a category, and a list can filter by it: everything under HR, or only the leave requests.' },
      { myth: 'A category’s name cannot be translated: it is the path.', fact: 'The path is the key. The name people see comes from the CMS, in each language: `/Categories/HR/Leave/name`.' }
    ],
    q: 'Where does the name that people see for the category `HR/Leave` come from?',
    options: ['From the CMS, under `/Categories/HR/Leave/name`', 'From roles.yaml', 'From the task’s description'],
    why: 'The category is a path; its name, in each language, is a text in the CMS under /Categories.'
  },

  customfields: {
    name: 'Custom fields',
    hook: 'How many days? Max has to open every task to see.',
    def: '**Custom fields** attach your own values to a task: a number of days, a customer. They are information only, for lists to show and filter by.',
    show: {
      title: 'Your own columns',
      need: 'Max wants to see the number of days in his task list, without opening each task.',
      field: 'On the Task tab: Custom Fields. A name, a type, and a value from the data: days, NUMBER, in.days.',
      list: 'The value travels with the task. A task list can show it as a column, and filter by it.',
      info: 'Custom fields only inform. They change nothing about how the engine treats the task.'
    },
    labels: { fieldName: 'days', fieldType: 'NUMBER', fieldValue: 'in.days', col: 'Days', info: 'Information only' },
    myths: [
      { myth: 'A custom field changes what the task does.', fact: 'It only carries information: a text, a number or a timestamp, for people and lists. The engine treats the task the same.' },
      { myth: 'To show the number of days in the task list, it has to go into the task’s name.', fact: 'A custom field carries it: a name, a type and a value from the data. A task list can show it as a column, and filter by it.' },
      { myth: 'A custom field is always a text.', fact: 'It has a type: a text, a number or a timestamp.' }
    ],
    q: 'What is a custom field on a task for?',
    options: ['To decide who may do the task', 'To set its priority', 'To carry extra information that lists can show and filter by'],
    why: 'Custom fields are information: they travel with the task, and change nothing about how it runs.'
  },

  notification: {
    name: 'Notification',
    hook: 'A task nobody knows about is a task nobody does.',
    def: 'When a task is created or assigned, Axon Ivy sends a **notification** to the users who can do it. A task can switch that off with Suppress.',
    show: {
      title: 'You have a new task',
      new: 'A task for HR is created. Hanna, Ben and Chloé all have that role.',
      notify: 'Each of them gets a notification: a new task is waiting.',
      channels: 'It arrives on the channels the engine has switched on: in the Portal, by mail, in Microsoft Teams.',
      suppress: 'For a task nobody needs to hear about, check Suppress under Notification on the Task tab.'
    },
    labels: { newTask: 'New task', portal: 'Portal', mail: 'Mail', teams: 'Teams', suppress: '☑ Suppress' },
    myths: [
      { myth: 'A notification is one mail to one person.', fact: 'It goes to every user who can do the task, on the channels the engine has switched on. Users choose their own channels in the Portal.' },
      { myth: 'Every task sends a notification, like it or not.', fact: 'A task can switch it off: check Suppress under Notification on the Task tab.' },
      { myth: 'Notifications only show up in the Portal.', fact: 'They arrive on the channels the engine has switched on: in the Portal, by mail, in Microsoft Teams.' }
    ],
    q: 'A task for the role HR is created. Who gets its notification?',
    options: ['Only the first HR user', 'Every user with the role HR', 'Only the user who started the case'],
    why: 'For a role, every user of that role is notified: any of them could do the task.'
  },

  gateway: {
    name: 'Parallel tasks',
    hook: 'The manager and HR, at the same time.',
    def: 'A **Task Switch Gateway** creates a [[task|task]] on each outgoing path, all at once. Each has its own responsible, and they are worked on side by side.',
    show: {
      title: 'Two tasks at once',
      two: 'Anna’s request needs two checks: her manager’s and HR’s. Neither has to wait for the other.',
      split: 'A Task Switch Gateway creates a task on each outgoing path: one for Manager, one for HR.',
      work: 'Max and Hanna work at the same time, each in their own task.',
      own: 'On the gateway’s Tasks tab, each path has its own task: a name, a responsible, a priority.'
    },
    labels: { mgr: 'Manager', hr: 'HR', tasksTab: 'Tasks' },
    myths: [
      { myth: 'Work at the same time needs two processes.', fact: 'One gateway is enough: it creates a task per outgoing path, and each path goes on when its own task is started.' },
      { myth: 'The tasks of a gateway all go to the same people.', fact: 'On the gateway’s Tasks tab each path has its own task: a name, a responsible, a priority.' },
      { myth: 'Of a gateway’s two tasks, the second waits until the first is done.', fact: 'They are created at once and worked on side by side. Neither waits for the other.' }
    ],
    q: 'A Task Switch Gateway has three outgoing paths. How many tasks does it create?',
    options: ['Three, one per path', 'One, for all paths', 'None, until a user picks a path'],
    why: 'The gateway creates a task on every outgoing path, all at the same time.'
  },

  join: {
    name: 'Joining tasks',
    hook: 'Two tasks went out. How do they come back?',
    def: 'Where parallel paths meet in a **Task Switch Gateway**, it waits until all their tasks are done. Then it has each path’s data on its own: `in1`, `in2`.',
    show: {
      title: 'Waiting for each other',
      join: 'Both paths lead into another Task Switch Gateway.',
      wait: 'Max is done first. Nothing goes on yet: the gateway waits for HR.',
      data: 'Hanna is done. Now it goes on, with each path’s data on its own: in1 and in2.',
      map: 'Out ← in1 keeps the first path’s data. What you need from the second, you map: out.hrNote ← in2.hrNote.'
    },
    labels: { mgr: 'Manager', hr: 'HR', waits: 'Waits for HR', note: 'in2.hrNote' },
    myths: [
      { myth: 'Where parallel tasks meet, their data is merged by itself.', fact: 'The gateway where they meet gets each path’s data on its own, as `in1`, `in2`. Its Output takes `in1` by default; map what you need from `in2`, or the second task’s input is lost.' },
      { myth: 'When the first of the parallel tasks is done, the process goes on.', fact: 'Not yet. The gateway where the paths meet waits until all their tasks are done.' },
      { myth: 'After the join, the data of the task that finished last is what stays.', fact: 'Who finished first does not matter. `in1` and `in2` are the paths’ data, and the Output decides what is kept: by default `in1`.' }
    ],
    q: 'Two parallel tasks meet in a Task Switch Gateway whose Output is just `out ← in1`. The HR task, which came in as `in2`, set `hrNote`. Is `hrNote` kept?',
    options: ['Yes, the data of both is merged', 'No, unless a row maps it from `in2`', 'Only if HR finished last'],
    why: '`out ← in1` takes the first path’s data. Add the row `out.hrNote ← in2.hrNote`.'
  },

  taskcode: {
    name: 'Task code',
    hook: 'One more thing to do to the new task.',
    def: 'The **Code** section of the Task tab runs right after the task is created. The new task is there as the variable `task`.',
    show: {
      title: 'Right after it is created',
      where: 'At the bottom of the Task tab there is a Code section.',
      when: 'It runs once, right after the task is created, before anyone has seen it.',
      task: 'The new task is the variable task. Here the code writes its id to the log.',
      use: 'Use it for what the fields above cannot do. For everything else, the fields are easier to read.'
    },
    labels: { code: 'Code', line: 'ivy.log.info("created " + task.getId());', log: 'created 105' },
    myths: [
      { myth: 'The Code section runs when someone starts the task.', fact: 'It runs when the task is created, still in the task before it. The new task is open and nobody has started it yet.' },
      { myth: 'In the Code section, `task` is the task that is running.', fact: 'There `task` is the task that was just created, not the one the code runs in.' },
      { myth: 'Everything about a task is best set in code.', fact: 'Use the code for what the fields above it cannot do. For everything else, the fields are easier to read.' }
    ],
    q: 'In the Code section of the Task tab, what is the variable `task`?',
    options: ['The task that was just created', 'The task list of the user', 'The process data'],
    why: 'The created task is handed to the code as `task`, right after its creation.'
  },

  signalcancel: {
    name: 'Cancel by a signal',
    hook: 'Anna withdraws her request. Max’s task is still there.',
    def: 'A **Signal Boundary Event** on a User Task listens for a signal while its task waits, open (SUSPENDED). When it arrives, the task is destroyed and the process goes on along the event’s own path.',
    show: {
      title: 'Called off',
      wait: 'Anna’s request waits for Max: a User Task, open in his list.',
      signal: 'Anna withdraws her request. Code sends a signal: leave:withdrawn.',
      destroy: 'The Signal Boundary Event on the User Task hears it. Max’s task is destroyed, and leaves his list.',
      path: 'The process goes on from the boundary event, along its own path. That part runs as SYSTEM.'
    },
    labels: { approve: 'Approve', inform: 'Inform', code: 'leave:withdrawn', destroyedWord: 'Destroyed' },
    myths: [
      { myth: 'A waiting task can only end when someone does it.', fact: 'A signal can end it too: the boundary event destroys the open task and takes the process down another path, without anyone opening the task.' },
      { myth: 'After the signal, Max still finds the task in his list.', fact: 'The task is destroyed, and leaves his list.' },
      { myth: 'What follows the boundary event runs as the user who sent the signal.', fact: 'That part of the process runs as SYSTEM.' }
    ],
    q: 'A User Task with a Signal Boundary Event waits in Max’s list. The matching signal is sent. What happens to the task?',
    options: ['It stays open', 'It is destroyed, and the process goes on from the boundary event', 'It is done, as if Max had finished it'],
    why: 'The boundary event destroys the open task and continues on its own path.'
  },

  taskapi: {
    name: 'Tasks in code',
    hook: 'Your script wants to know about tasks.',
    def: 'In code, `ivy.task` is the task that is running now. Other tasks you find with a `TaskQuery`, if the user running the code may see them.',
    show: {
      title: 'Tasks in code',
      current: 'In a script, ivy.task is the task you are in: its id, its name, its state.',
      query: 'To find other tasks, build a TaskQuery: for example, every task whose name starts with Leave.',
      perm: 'But reading everyone’s tasks needs permission. Run as anna, this query is refused.',
      dev: 'In the Designer it works, because Developer may do everything. Test such code as a real user.'
    },
    labels: { l1: 'ivy.task.getName()', l2: 'TaskQuery.create().where()', l3: '  .name().isLike("Leave%")', found: '3 tasks', denied: 'PermissionDeniedException' },
    myths: [
      { myth: 'If my query works in the Designer, it works for every user.', fact: 'In the Designer you are Developer, who may read all tasks. An ordinary user’s code may not query everyone’s tasks: it fails with a PermissionDeniedException.' },
      { myth: 'To read the task it runs in, code first has to search for it.', fact: '`ivy.task` is that task: its id, its name, its state.' },
      { myth: 'Code can only see the task it runs in.', fact: 'Other tasks are found with a `TaskQuery`, for example every task whose name starts with Leave, if the user may see them.' }
    ],
    q: 'What is `ivy.task` in a script?',
    options: ['The first task of the case', 'The next task that will be created', 'The task that is running the script now'],
    why: '`ivy.task` is always the current task: the one this code runs in.'
  }
};
