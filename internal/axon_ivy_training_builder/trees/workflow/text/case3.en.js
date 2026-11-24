/**
 * The Workflow tree, case level 3: its skills in English.
 * Keys per skill as described in text/core.en.js.
 */
export default {
  casefields: {
    name: 'Case category and fields',
    hook: 'Hundreds of cases. Find the leave requests.',
    def: 'A [[case|case]] has a **category** and **custom fields** of its own, set on the Case tab. They sort and describe the case; they do not change how it runs.',
    show: {
      title: 'Sorting the cases',
      many: 'Hundreds of cases: leave requests, contracts, orders.',
      category: 'On the Case tab: Category HR/Leave. Now the leave cases can be found as a group.',
      field: 'And custom fields: days = 3. Lists can show the value and filter by it.',
      both: 'A task’s category sorts pieces of work. A case’s category sorts whole cases. Often you set both.'
    },
    labels: { caseTab: 'Case', path: 'HR/Leave', fieldName: 'days', fieldValue: 'in.days', contractCase: 'Contract: Ben', orderCase: 'Order 4711', leaveCase: 'Leave of Anna' },
    myths: [
      { myth: 'The category of a task is also the category of its case.', fact: 'They are separate: a task’s category is on the Task tab, the case’s on the Case tab. Set each where it is needed.' },
      { myth: 'Only tasks have custom fields.', fact: 'A case has custom fields of its own, set on the Case tab: `days` = 3. Lists can show the value and filter by it.' },
      { myth: 'A case’s category changes who gets its tasks.', fact: 'Category and custom fields sort and describe the case. They do not change how it runs.' }
    ],
    q: 'Where do you set the category of a case?',
    options: ['On the Task tab', 'On the Case tab', 'In roles.yaml'],
    why: 'The Case tab holds what describes the case: name, description, category, custom fields.'
  },

  businesscase: {
    name: 'Business case',
    hook: 'One leave request. Two cases?',
    def: 'A **business case** ties together the [[case|cases]] that belong to one piece of business. The first case of a process is its own business case; others can be attached to it.',
    show: {
      title: 'Cases that belong together',
      one: 'Anna’s leave request is a case. It is also its own business case: so far there is nothing else.',
      more: 'Approving it starts another workflow, the booking in the HR system: a case of its own.',
      attach: 'Its Start attaches that case to Anna’s business case: an option on its Trigger tab. Now the two belong together.',
      why: 'Look at the business case, and you see everything that happened for Anna’s leave, across processes.'
    },
    labels: { leave: 'Leave: Anna', booking: 'Booking', bc: 'Business case' },
    myths: [
      { myth: 'One piece of business is always one case.', fact: 'A process can start other workflows, each with a case of its own. The business case keeps them together.' },
      { myth: 'A business case is something you have to create.', fact: 'It is there without doing anything: the first case of a process is its own business case.' },
      { myth: 'To see all that happened for Anna’s leave, you have to look at each process on its own.', fact: 'Look at the business case: it shows everything that happened for her leave, across processes.' }
    ],
    q: 'Anna’s leave case starts a booking workflow that is attached to its business case. What is there now?',
    options: ['Two cases, one business case', 'One case, two business cases', 'Two cases, two business cases'],
    why: 'Each workflow has its own case. Attached, they share one business case: the first case’s.'
  },

  trigger: {
    name: 'Trigger Step',
    hook: 'Start another workflow, and do not wait for it.',
    def: 'A **Trigger Step** starts another workflow from inside a process: a new [[case|case]] with its first task, on a Start that allows it. The calling process does not wait.',
    show: {
      title: 'Starting another workflow',
      need: 'Anna’s leave is approved. Booking it in the HR system is a workflow of its own.',
      trigger: 'A Trigger Step starts it: a new case, with its first task. The booking’s Start has to allow that, on its Trigger tab.',
      goes: 'The leave process does not wait. It goes straight on to its own end.',
      who: 'Who does the new task is set on that Start’s Trigger tab. With SYSTEM, the booking runs by itself.'
    },
    labels: { approve: 'Approve', trig: 'Trigger', book: 'Book', bookStart: 'Booking', triggerTab: 'Trigger', allow: '☑ Yes, this can be started\nwith a Trigger Activity' },
    myths: [
      { myth: 'A Trigger Step is like calling a sub process: the process waits for the result.', fact: 'It only starts the other workflow and goes on. The triggered case runs on its own: when its task is started, or at once with SYSTEM.' },
      { myth: 'A Trigger Step can start any process.', fact: 'Only on a Start that allows it: on its Trigger tab, “Yes, this can be started with a Trigger Activity”.' },
      { myth: 'The triggered task goes to whoever was working in the calling process.', fact: 'Who does the new task is set on that Start’s Trigger tab. With SYSTEM, it runs by itself.' }
    ],
    q: 'A process reaches a Trigger Step. What does the process do?',
    options: ['It waits until the triggered workflow is done', 'It ends', 'It starts the other workflow and goes straight on'],
    why: 'A Trigger Step creates the other case and its task, and the calling process continues at once.'
  },

  signalstart: {
    name: 'Signal Start',
    hook: 'Tell everyone who cares. Whoever that is.',
    def: 'A **Signal Start** starts a process when a signal with its code is sent. The sender does not know who listens, and does not wait.',
    show: {
      title: 'Whoever is listening',
      send: 'A new employee is hired. A process announces it: it sends the signal employee:hired.',
      listen: 'Two processes have a Signal Start with that code: order a laptop, create an account.',
      start: 'Both start, each in a case of its own, run by SYSTEM.',
      loose: 'The sender has already gone on. It never learns who listened: add a third listener, and nothing in the sender changes.'
    },
    labels: { hire: 'Hire', code: 'employee:hired', laptop: 'Order a laptop', account: 'Create an account', sender: 'Goes on' },
    myths: [
      { myth: 'The sender of a signal has to know which processes it starts.', fact: 'It only sends a code. Every Signal Start that listens to that code starts its process, and the sender goes on at once.' },
      { myth: 'A signal starts one process: the first that listens.', fact: 'Every Signal Start with that code starts, each in a case of its own.' },
      { myth: 'A process started by a signal runs as the user who sent it.', fact: 'It is run by SYSTEM.' }
    ],
    q: 'A process sends the signal `employee:hired`. Two other processes have a Signal Start with that code. What happens?',
    options: ['Only the first one starts', 'Both start, each with its own case', 'The sender waits for both to finish'],
    why: 'Every Signal Start with the code starts, in its own case. The sender does not wait.'
  },

  persist: {
    name: 'Persist on start',
    hook: 'Anna is still typing. Does her case exist?',
    def: '**Persist task on creation** stores the [[case|case]] and its first task as soon as a process starts, before any task switch. It needs a Start that does not allow anonymous users.',
    show: {
      title: 'Stored from the first click',
      normal: 'Normally a case is stored at its first task switch. Before that it is only CREATED.',
      option: 'On the Start’s Task tab: Persist task on creation. Now the case is RUNNING at once, and its first task in progress.',
      why: 'So the case can be found from the first moment, while Anna is still filling in her request.',
      cond: 'It only works when the Start does not allow anonymous users. Uncheck that first.'
    },
    labels: { persistOn: '☑ Persist task on creation', options: 'Options', anon: '☐ Allow anonymous', stored: 'Stored' },
    myths: [
      { myth: 'Persist task on creation works on any Start.', fact: 'Only when the Start does not allow anonymous users. The Designer says so next to the option.' },
      { myth: 'With Persist task on creation, the first task waits in a task list.', fact: 'No. The case is RUNNING at once, and its first task is in progress with the person who started.' },
      { myth: 'Storing the case at the start makes no difference anyone could see.', fact: 'The case can be found from the first moment, while Anna is still filling in her request.' }
    ],
    q: 'A Start has “Persist task on creation”. Anna starts the process and sees the form. What is the state of her case?',
    options: ['RUNNING', 'CREATED', 'DONE'],
    why: 'With that option the case skips CREATED: it is stored and RUNNING from the start.'
  },

  caseapi: {
    name: 'The case in code',
    hook: 'Which case is this script running in?',
    def: 'In code, `ivy.case` is the case the code runs in: its id, its name, its state, its custom fields, and its business case.',
    show: {
      title: 'The case in code',
      current: 'In a script, ivy.case is the case you are in.',
      read: 'Read what it carries: its name, its state.',
      bc: 'And from it, the business case it belongs to.',
      same: 'Every task of the case sees the same ivy.case, whoever works on it. Only ivy.task changes.'
    },
    labels: { l1: 'ivy.case.getName()', v1: '"Leave of Anna"', l2: 'ivy.case.getState()', v2: 'RUNNING', l3: 'ivy.case.getBusinessCase()', task1: 'Task 1: ivy.task', task2: 'Task 2: ivy.task', sameCase: 'ivy.case' },
    myths: [
      { myth: '`ivy.case` changes with every task.', fact: 'The task changes, the case stays: `ivy.task` is a different task each time, `ivy.case` the same case from start to end.' },
      { myth: 'A script cannot reach its case: it only has the process data.', fact: '`ivy.case` is the case the code runs in: its id, its name, its state, its custom fields.' },
      { myth: 'To find the business case, code needs a query.', fact: 'Ask the case: `ivy.case.getBusinessCase()`.' }
    ],
    q: 'Two tasks of the same case run one after the other. What is true in their scripts?',
    options: ['Both have the same `ivy.task`', '`ivy.case` is empty in the second task', '`ivy.task` differs, `ivy.case` is the same'],
    why: 'Each task is its own `ivy.task`. The case they belong to is one and the same `ivy.case`.'
  }
};
