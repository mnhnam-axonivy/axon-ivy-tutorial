/**
 * The Workflow tree, task level 2: its skills in English.
 * Keys per skill as described in text/core.en.js.
 */
export default {
  taskname: {
    name: 'Name and description',
    hook: 'Three tasks called “Approve leave”. Which one is Anna’s?',
    def: 'The **name** and **description** on the Task tab are what people see in the task list. Put data into them with `<%= %>`, so every task says what it is about.',
    show: {
      title: 'A name that says something',
      same: 'Max has three tasks, all called “Approve leave”. He has to open each to see whose it is.',
      macro: 'On the Task tab, write the name with data in it: Leave: <%=in.name%>.',
      better: 'Now every task carries its own name, and the description adds the details.',
      in1: 'One thing to know: in a User Task the data is called in. In a Task Switch it is in1, and in is an error.'
    },
    labels: { approve: 'Approve leave', nameMacro: 'Leave: <%=in.name%>', descMacro: '<%=in.days%> days', leaveOf: 'Leave: {0}', desc: 'Description', inUserTask: 'User Task: in', inSwitch: 'Task Switch: in1', err: 'Variable \'in\' cannot be resolved' },
    myths: [
      { myth: '`in` works everywhere on the Task tab.', fact: 'In a User Task, yes. In a Task Switch Event or Gateway the data is `in1`, and `in` gives “Variable \'in\' cannot be resolved”.' },
      { myth: 'Every task of a process has the same name.', fact: 'Put data into the name with `<%= %>`: `Leave: <%=in.name%>` gives every task a name of its own.' },
      { myth: 'The description is a note for developers.', fact: 'People see it in the task list, with the name. It adds the details the name has no room for.' }
    ],
    q: 'On a Task Switch Event you want the task to be called “Leave: Anna”. Which name works?',
    options: ['`Leave: <%=in.name%>`', '`Leave: <%=in1.name%>`', '`Leave: in1.name`'],
    why: 'Data goes into a name between `<%=` and `%>`, and in a Task Switch the data is `in1`.'
  },

  data: {
    name: 'Data between tasks',
    hook: 'The process waits three days. Where is the data?',
    def: 'When a process waits for a [[task|task]], the engine stores the process data with it. Whoever starts the task gets the data back, on any computer, days later.',
    show: {
      title: 'Data that waits too',
      fill: 'Anna fills in her request: 3 days, from Monday.',
      store: 'At the task switch the engine writes the process data to its database, with the new task.',
      wait: 'Days pass. The data waits there, with the task.',
      load: 'Max starts the task. The data is loaded back: 3 days, from Monday.',
      output: 'What goes on is decided by the Task Switch’s Output. Its default, out ← in1, takes the data as it arrived.'
    },
    labels: { days: 'Day {0}', db: 'Engine database' },
    myths: [
      { myth: 'While the process waits, the data lives in someone’s browser.', fact: 'It is stored in the engine’s database, with the task, and comes back when the task starts.' },
      { myth: 'Max has to start the task on the computer Anna used.', fact: 'The data is in the engine’s database. Whoever starts the task gets it back, on any computer, days later.' },
      { myth: 'A Task Switch has no say in the data: it only passes it through.', fact: 'What goes on is decided by the Task Switch’s Output. Its default, `out` ← `in1`, takes the data as it arrived.' }
    ],
    q: 'Anna’s request waits three days for Max. Where is its process data meanwhile?',
    options: ['Stored by the engine, with the waiting task', 'In Anna’s browser', 'Nowhere: Max has to ask Anna again'],
    why: 'At the task switch the engine stores the data with the new task, and loads it again when the task is started.'
  },

  timeout: {
    name: 'Session timeout',
    hook: 'Lunch break in the middle of a task.',
    def: 'If a session ends while a [[task|task]] from the task list is in progress, the task is **reset**: it is open again, with the process data as it was when the task started. A start’s [[onestart|first task]], not stored yet, is destroyed with its case instead.',
    show: {
      title: 'Halfway, and then lunch',
      progress: 'Ben starts a task and changes the days from 3 to 5. He does not finish.',
      timeout: 'He goes to lunch. His session times out.',
      reset: 'The task is open again, for anyone who may do it. And its data is back to 3: what Ben typed is gone.',
      again: 'Whoever starts it next begins the task from its start.'
    },
    labels: { sessionEnded: 'Session timed out' },
    myths: [
      { myth: 'If my session ends halfway through a task, what I typed is kept.', fact: 'The task goes back to open and its data back to how it was when the task started. Unsaved input is lost.' },
      { myth: 'A task whose session timed out stays with that user until they come back.', fact: 'It is open again, for anyone who may do it. Whoever starts it next begins the task from its start.' },
      { myth: 'A session timeout always cancels the task.', fact: 'Not a task from the task list: that one is reset and waits there again, open. Only a start’s first task, which is not stored yet, is destroyed with its case.' }
    ],
    q: 'Ben starts a task, fills in half the form, and his session times out. What happens?',
    options: ['The task stays in progress with Ben', 'It is done, with what Ben typed', 'It is open again, with the data from when the task started'],
    why: 'A timed-out task is reset: open again, and its data back to how it was when it started.'
  },

  priority: {
    name: 'Priority',
    hook: 'Not all work is equally urgent.',
    def: 'Every [[task|task]] has a **priority**: Low, Normal, High or Exception. It is Normal unless you set it, and task lists can sort and filter by it.',
    show: {
      title: 'What first?',
      list: 'Max has four tasks in his list. Which one first?',
      field: 'On the Task tab: Priority. Low, Normal, High or Exception. A new task is Normal.',
      high: 'Anna’s leave must be answered today: High. Sorted by priority, it moves to the top.',
      script: 'Or choose Script, and work the priority out from the process data while the process runs.',
      only: 'Priority only orders the list. To make sure a task does not wait too long, give it an expiry.'
    },
    labels: { room: 'Book a room', invoice: 'Check invoice', paper: 'Order paper', script: 'Script', onlyOrder: 'It orders the list. Nothing more.' },
    myths: [
      { myth: 'A task with priority High is done faster.', fact: 'Priority helps people choose: task lists sort and filter by it. To make sure a task does not wait too long, use an [[expiry|expiry]].' },
      { myth: 'A new task has no priority until someone sets one.', fact: 'Every task has one. A new task is Normal unless you set it.' },
      { myth: 'The priority is fixed when the process is drawn.', fact: 'Choose Script, and the priority is worked out from the process data while the process runs.' }
    ],
    q: 'You create a task and leave Priority as it is. What is it?',
    options: ['Low', 'High', 'Normal'],
    why: 'Normal is the default: on the Task tab, and on its Expiry section too.'
  },

  delay: {
    name: 'Delay',
    hook: 'Not yet. Remind me next week.',
    def: 'A **delay** keeps a new [[task|task]] out of every task list for a while. Until then it is DELAYED; after that it is open like any other.',
    show: {
      title: 'Not before next week',
      why: 'A contract is signed today. The customer should get a call in a week, not now.',
      field: 'On the Task tab: Delay, a duration. Here new Duration("7D"): seven days.',
      hidden: 'The task is created now, but nobody sees it. Its state is DELAYED.',
      shows: 'Seven days later it appears in the task list, open, like any other task.',
      expiry: 'If it has an expiry too, the expiry only starts counting after the delay.'
    },
    labels: { call: 'Call the customer', day: 'Day {0}', empty: 'No tasks' },
    myths: [
      { myth: 'A delayed task is a task that is late.', fact: 'Delay means “not yet”. The task exists, but nobody sees it or hears of it until its time comes. A task that waits too long is a matter for [[expiry|expiry]].' },
      { myth: 'A task with a delay is created when the delay is over.', fact: 'It is created at once, in the state DELAYED. It just is in nobody’s task list until its time comes.' },
      { myth: 'With a delay and an expiry, both count from the moment the task is created.', fact: 'The expiry only starts counting after the delay.' }
    ],
    q: 'A task has a delay of 3 days. What do the users of its role see today?',
    options: ['Nothing yet: it shows up in 3 days', 'The task, marked as late', 'The task, with priority High'],
    why: 'Until the delay is over, the task is DELAYED and in nobody’s task list.'
  },

  expiry: {
    name: 'Expiry',
    hook: 'Nobody did it in two days. Now what?',
    def: 'An **expiry** gives a [[task|task]] a time limit. When it runs out, the same task gets a new [[responsible|responsible]] and [[priority|priority]].',
    show: {
      title: 'When time runs out',
      wait: 'Max should approve within two days. But Max is busy.',
      timeout: 'On the Task tab: Expiry. Timeout 2 days, then Responsible HR and Priority High.',
      expires: 'Two days pass. The task expires.',
      moves: 'The same task now belongs to HR, with priority High. Hanna takes care of it.',
      defaults: 'Set only a timeout, and the expired task goes to Everybody, Normal: the defaults of the Expiry section.'
    },
    labels: { later: '2 days later', twoDays: 'new Duration("2D")', defaults: 'Only a timeout → Everybody, Normal' },
    myths: [
      { myth: 'A task that expires is deleted.', fact: 'It stays and changes hands: the Responsible and Priority under Expiry say to whom, and how urgent. Set only a timeout, and it goes to Everybody.' },
      { myth: 'When a task expires, a second task is created for someone else.', fact: 'It is the same task. It only gets a new responsible and a new priority.' },
      { myth: 'An expired task becomes more urgent by itself.', fact: 'Only if you say so: the Priority under Expiry decides. Set only a timeout, and the expired task is Normal, for Everybody.' }
    ],
    q: 'A task for Manager has an expiry of 2 days with Responsible HR. Nobody works on it for 2 days. What happens?',
    options: ['It is deleted', 'A copy goes to HR; the managers keep theirs', 'The same task now belongs to HR'],
    why: 'The task expires and changes hands, to the Expiry’s Responsible, with the Expiry’s Priority.'
  },

  skip: {
    name: 'Skip Tasklist',
    hook: 'Same person, next task. Why go back to the list?',
    def: '**Skip Tasklist** sends the user straight into the next [[task|task]], without a stop at the task list. It only happens if that user may work on the task and the Task Switch waits for no other task. Of a gateway’s tasks, only one can have it.',
    show: {
      title: 'Straight on',
      normal: 'Normally a task switch ends what the user was doing. The next task waits in a list, even when the same person will do it.',
      skip: 'With Skip Tasklist on the Task tab, the user goes straight on into the new task.',
      allowed: 'Only if they may do it. Anna has the role Employee: into a task for Employee she goes straight on.',
      notallowed: 'A task for Manager she may not do. It waits in the managers’ list, as if Skip Tasklist were off.'
    },
    labels: { request: 'Request', next: 'Next', options: 'Options', skipOn: '☑ Skip Tasklist', forEmployee: 'For Employee', forManager: 'For Manager', waits: 'Waits for a manager', nextTask: 'Next task' },
    myths: [
      { myth: 'Skip Tasklist gives the next task to the same user.', fact: 'It does not change who the task is for. It only saves the stop at the list, when the user who finished the last task may also do the next one.' },
      { myth: 'With Skip Tasklist, the user goes on into any next task.', fact: 'Only into a task they may do. Anna, an Employee, does not get into a task for Manager: it waits in the managers’ list.' },
      { myth: 'Without Skip Tasklist, the same person cannot do the next task.', fact: 'They can: it waits in their task list, and they start it from there. Skip Tasklist only saves that stop.' }
    ],
    q: 'Anna (Employee) finishes her task. The next task is for Manager and has Skip Tasklist. What happens?',
    options: ['Anna goes straight into it', 'It waits in the managers’ task list', 'The process fails'],
    why: 'Skip Tasklist only works for a user who may do the task. Anna may not, so it waits for a manager.'
  }
};
