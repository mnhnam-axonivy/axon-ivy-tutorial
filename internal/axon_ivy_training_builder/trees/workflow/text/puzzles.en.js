/**
 * The Workflow tree's puzzles in English: the names every puzzle shares (`puzzle`: element
 * kinds and what they do, field labels, options) and each puzzle's own words (`puzzles`).
 *
 * Per puzzle: title, brief (what to build), names (the elements' names on the board), why (per
 * 'element.field', a reason for each wrong option, or '*' for any), next (per element, why
 * what follows it follows it: said when its connector is missing or wrong), run (the captions
 * while the solved process runs; run2 for a second case, where an Alternative chooses) and
 * solved (the closing words). **bold** and `code` work.
 */
export const puzzle = {
  kinds: {
    start: 'Request Start', dialog: 'User Dialog', user: 'User Task', script: 'Script', email: 'E-Mail', switch: 'Task Switch Event',
    gateway: 'Task Switch Gateway', alternative: 'Alternative', split: 'Split', join: 'Join', end: 'Process End'
  },
  about: {
    start: 'Where a user starts the process. Each start makes a new case, and its first task.',
    dialog: 'Shows a form in the task that is running. It creates no task of its own.',
    user: 'Creates a new task with a form. The process waits until someone responsible has done it.',
    script: 'Runs code in the task that is running. Nobody sees it.',
    email: 'Sends a mail. It creates no task and waits for nobody.',
    switch: 'Ends the task that is running and creates a new one, for whoever is responsible.',
    gateway: 'Creates a task on every outgoing path, all at once. Where paths meet, it waits for all of them.',
    alternative: 'Sends the token down one exit: the first one whose condition is true.',
    split: 'Sends a token down every exit. The paths run side by side, in the same task.',
    join: 'Waits for every path that leads into it, then lets one token go on.',
    end: 'This path of the process ends here.'
  },
  fields: {
    responsible: 'Responsible',
    delay: 'Delay',
    expiryTimeout: 'Expiry · Timeout',
    expiryResponsible: 'Expiry · Responsible',
    expiryPriority: 'Expiry · Priority',
    anonymous: 'Permission · Allow anonymous',
    role: 'Permission · Role',
    taskTo: 'Task to “{0}” · Responsible',
    condTo: 'Condition · the exit to “{0}”',
    mailTo: 'Header · To',
    splitOut: 'Output · out2, the path to “{0}”'
  },
  options: {
    everybody: 'Everybody', employee: 'Employee', manager: 'Manager', hr: 'HR', system: 'SYSTEM', creator: 'CREATOR',
    none: 'none', h1: '1 hour', d1: '1 day', h2: '2 hours', d2: '2 days', low: 'Low', normal: 'Normal', high: 'High', on: '☑ yes', off: '☐ no',
    empty: '(empty)', approved: 'in.approved', days: 'in.days > 5', in: 'in', managerMail: '<%=in.managerMail%>', requesterMail: '<%=in.requesterMail%>'
  }
};

const everybodyTask = 'Everybody is what every new task gets. Every user could start this approval, Anna too.';
const ownRole = 'Employee is Anna’s own role: she could approve her own leave.';
const firstForm = 'After the start, Anna first fills in her request.';
const noRecipient = 'A mail without a recipient cannot be sent: the step fails with `ivy:error:email`.';

export const puzzles = {
  boss1: {
    title: 'One approval',
    brief: 'Your company wants leave requests approved. **Anna**, an employee, fills in a request; a **manager** has to approve it. Build the process.',
    names: { start: 'start.ivp', form: 'Request leave', approve: 'Approve leave', end: '' },
    why: {
      'approve.responsible': { everybody: everybodyTask, employee: ownRole, hr: 'The brief asks for a manager. HR is another role.' }
    },
    next: {
      start: firstForm,
      form: 'When the request is filled in, the approval follows.',
      approve: 'After the approval nothing is left to do: the process ends.'
    },
    run: {
      start: 'Anna starts the process. The engine makes a new **case** and its first **task**, hers.',
      form: 'The User Dialog shows the form in that task. Anna fills it in and sends it.',
      approve: 'The User Task makes a new task for the role **Manager**. Max has that role: he takes it from his task list and approves.',
      end: 'No task is left, so the case is done.'
    },
    solved: 'One start, one case, two tasks: Anna’s and Max’s.'
  },

  boss2: {
    title: 'Approve or reject',
    brief: 'A **manager** decides on a leave request. If it is **approved**, the leave is booked. If not, the one who asked gets a **mail**. Build the process.',
    names: { start: 'start.ivp', form: 'Request leave', decide: 'Decide', which: 'Approved?', book: 'Book leave', booked: 'Booked', mail: 'Say no', told: 'Told' },
    why: {
      'decide.responsible': { everybody: everybodyTask, employee: ownRole, hr: 'The brief asks for a manager. HR is another role.' },
      'which.toBook': {
        empty: 'An empty condition is always true, and it is what a new exit has. Every request would be booked, rejected ones too.',
        days: 'The number of days does not decide here. The manager’s decision does.'
      },
      'mail.mailTo': { empty: noRecipient, managerMail: 'Max said no himself. The one who has to hear of it is the one who asked.' }
    },
    next: {
      start: firstForm,
      form: 'When the request is in, the manager decides.',
      decide: 'After the decision the process has to choose its way: that is the Alternative.',
      which: 'The Alternative needs both ways out: one to the booking, one to the mail.',
      book: 'After the booking this path ends, in an end of its own.',
      mail: 'After the mail this path ends, in an end of its own.'
    },
    run: {
      start: 'Anna starts the process: a new case.',
      form: 'She fills in her request.',
      decide: 'A task for the role **Manager**. Max approves, and his dialog puts `approved` = true into the process data.',
      which: 'The Alternative tries its rows from the top. `in.approved` is true: the token takes the way to the booking.',
      book: 'The Script books the leave, still in Max’s task.',
      booked: 'Nothing is left to do: this case is done.'
    },
    run2: {
      start: 'The same process, another case: now Ben asks for leave.',
      form: 'He fills in his request.',
      decide: 'Again a task for Manager. This time Max says no: `approved` is false.',
      which: 'Row 1, `in.approved`, is false. The other exit has an empty condition, which is always true: the token goes that way.',
      mail: 'The E-Mail step writes to Ben. No task is created, and nobody waits.',
      told: 'This case is done too. One process, two cases, two ways through it.'
    },
    solved: 'One task for the decision, an Alternative for the two ways, and a mail instead of a task for the no.'
  },

  boss3: {
    title: 'Two approvals',
    brief: 'Leave now needs two approvals: first a **manager**, then **HR**. A manager who has not decided after **2 days** loses the task: it goes to **HR**, with priority **High**. HR’s own approval shall show up only **a day later**. After both, the leave is booked **without anyone clicking**.',
    names: { start: 'start.ivp', form: 'Request leave', manager: 'Manager approves', hr: 'HR approves', switch: 'To the engine', book: 'Book leave', end: '' },
    why: {
      'manager.responsible': { everybody: everybodyTask, employee: ownRole, hr: 'HR comes second. The first approval is a manager’s.' },
      'manager.expiryTimeout': {
        none: 'Without a timeout the task never expires: it waits for a manager, however long that takes.',
        h2: 'The brief gives the manager 2 days, not 2 hours.'
      },
      'manager.expiryResponsible': {
        everybody: 'Everybody is the default here too. After 2 days every user could approve, Anna as well.',
        manager: 'Then the expired task stays with the managers, who did not react. The brief hands it to HR.'
      },
      'manager.expiryPriority': {
        normal: 'Normal is the default. The brief wants the late task to stand out: High.',
        low: 'Low would push the late task down the list. The brief says High.'
      },
      'hr.responsible': { everybody: everybodyTask, employee: ownRole, manager: 'A manager has already approved, in the task before. This one is HR’s.' },
      'hr.delay': {
        none: 'Without a delay the task is in HR’s task list at once. The brief gives it a day.',
        h1: 'The brief says a day, not an hour.'
      },
      'switch.responsible': {
        everybody: 'A task for Everybody waits in the task lists until someone starts it. The booking has to run without anyone clicking.',
        hr: 'Then someone in HR has to start the task first. The booking has to run without anyone clicking.'
      }
    },
    next: {
      start: firstForm,
      form: 'A manager decides first. HR only sees what a manager has approved.',
      manager: 'After the manager comes HR: the leave is booked only when both have approved.',
      hr: 'After both approvals the work goes to the engine: that takes the Task Switch Event, before the Script.',
      switch: 'What comes after a Task Switch Event runs in its new task. That is where the booking belongs.',
      book: 'After the booking nothing is left to do: the process ends.'
    },
    run: {
      start: 'Anna starts the process: a new case, and its first task, hers.',
      form: 'She fills in the request and sends it.',
      manager: 'A task for the role **Manager**. Max approves within two days, so the expiry never fires.',
      hr: 'The next User Task makes a task for **HR**, with a delay: for a day it is in nobody’s task list. Then Hanna approves.',
      switch: 'The Task Switch Event ends Hanna’s task and creates one for **SYSTEM**. The engine starts it by itself.',
      book: 'The Script books the leave in SYSTEM’s task. Nobody clicked.',
      end: 'The last task is done, so the case is done.'
    },
    solved: 'Two approvals, a delay, an expiry as a safety net, and the booking in the background.'
  },

  boss4: {
    title: 'Side by side',
    brief: 'When a **manager** has approved, two things happen **at the same time**, and no person is needed for either: the leave is **booked**, and the one who asked gets a **mail**. When **both** are done, the process ends.',
    names: { start: 'start.ivp', form: 'Request leave', approve: 'Approve leave', split: 'Then both', book: 'Book leave', mail: 'Tell Anna', join: 'Both done', end: '' },
    why: {
      'approve.responsible': { everybody: everybodyTask, employee: ownRole, hr: 'The brief asks for a manager. HR is another role.' },
      'split.out2': { empty: 'By default a Split gives only its first path the data: `out1` ← `in`. The other path would start empty: the booking would not know whose leave it is, or the mail whom to write to.' },
      'mail.mailTo': { empty: noRecipient, managerMail: 'Max has just approved it himself. The one to tell is the one who asked.' }
    },
    next: {
      start: firstForm,
      form: 'When the request is in, the manager approves it.',
      approve: 'After the approval two things happen side by side: that takes the Split.',
      split: 'The Split needs both paths: one to the booking, one to the mail.',
      book: 'Each path ends in the Join, which waits for both.',
      mail: 'Each path ends in the Join, which waits for both.',
      join: 'When both paths have arrived, the process ends.'
    },
    run: {
      start: 'Anna starts the process: a new case.',
      form: 'She fills in her request.',
      approve: 'A task for the role **Manager**. Max approves.',
      split: 'The Split sends a token down both paths. No task is created: all of this runs in Max’s task.',
      book: 'One path books the leave.',
      mail: 'The other writes to Anna. It knows her address: `out1` ← `in` and `out2` ← `in` gave both paths the data.',
      join: 'The Join has waited for both paths. Now one token goes on.',
      end: 'No task is left: the case is done.'
    },
    solved: 'A Split for two things at once, the data for its second path, and a Join to bring them together.'
  },

  boss5: {
    title: 'Two checks at once',
    brief: 'Faster: after the request, a **manager** and **HR** check it **at the same time**. Only **employees** may start the request. When **both** checks are done, the one who started the case confirms the dates.',
    names: { start: 'start.ivp', form: 'Request leave', split: 'Check', mcheck: 'Manager’s check', hcheck: 'HR’s check', join: 'Checked', confirm: 'Confirm dates', end: '' },
    why: {
      'start.anonymous': { on: 'With Allow anonymous on, anyone who knows the link can start the process, signed in or not.' },
      'start.role': {
        everybody: 'Everybody is every user, also those who are not employees.',
        manager: 'Then only managers could ask for leave. Anna is an Employee, not a Manager.',
        hr: 'Then only HR could ask for leave. Anna is an Employee, not in HR.'
      },
      'split.toManager': {
        everybody: 'Everybody is the default: any user could do the manager’s check, Anna too.',
        hr: 'This path leads to the manager’s check. HR has the other path.'
      },
      'split.toHr': {
        everybody: 'Everybody is the default: any user could do HR’s check, Anna too.',
        manager: 'This path leads to HR’s check. The managers have the other path.'
      },
      'join.responsible': {
        everybody: 'Then any user could confirm Anna’s dates.',
        system: 'SYSTEM is the engine. The brief wants the person who started the case.'
      }
    },
    next: {
      start: firstForm,
      form: 'When the request is in, both checks begin: the first gateway creates their tasks.',
      split: 'The first gateway needs two paths: one to the manager’s check, one to HR’s.',
      mcheck: 'After its check, each path goes into the second gateway, which waits for both.',
      hcheck: 'After its check, each path goes into the second gateway, which waits for both.',
      join: 'When both checks are done, the dates are confirmed.',
      confirm: 'After the confirmation nothing is left to do: the process ends.'
    },
    run: {
      start: 'Anna has the role Employee, so the Start lets her in. Anyone without it gets an error instead of the process.',
      form: 'She fills in her request.',
      split: 'The Task Switch Gateway ends her task and creates two at once: one for **Manager**, one for **HR**.',
      mcheck: 'Max does the manager’s check, in his task.',
      hcheck: 'Hanna does HR’s check, in hers. Neither waits for the other.',
      join: 'The second gateway has waited for both. Now it creates one task for **CREATOR**: the user who started the case.',
      confirm: 'That is Anna. She confirms her dates.',
      end: 'Every task is done, so the case is done.'
    },
    solved: 'A start only employees may use, two tasks side by side, a gateway that waits, and CREATOR for the one who asked.'
  }
};
