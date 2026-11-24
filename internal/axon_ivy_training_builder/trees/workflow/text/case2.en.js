/**
 * The Workflow tree, case level 2: its skills in English.
 * Keys per skill as described in text/core.en.js.
 */
export default {
  casedone: {
    name: 'When a case is done',
    hook: 'One task finished. Is the case finished?',
    def: 'A [[case|case]] is **done** when its last task is done. While any task is still open, the case is RUNNING.',
    show: {
      title: 'The last task',
      two: 'Anna’s case has two tasks at the same time: one for her manager, one for HR.',
      one: 'Max finishes his. The case is still RUNNING: HR’s task is open.',
      last: 'Hanna finishes hers. No task is left, and the process reaches its end.',
      done: 'Now the case is DONE. It stays in the system with its tasks, as a record.'
    },
    labels: { mgr: 'Manager', hr: 'HR', mgrCheck: 'Manager check', hrCheck: 'HR check' },
    myths: [
      { myth: 'A case is done when the task I see is done.', fact: 'A case can have several tasks, one after another or side by side. It is done when the last of them is.' },
      { myth: 'A finished case is removed from the system.', fact: 'It stays in the system with its tasks, as a record.' },
      { myth: 'Someone has to close a case when the work is finished.', fact: 'Nobody closes it. When no task is left and the process has reached its end, the case is DONE.' }
    ],
    q: 'A case has two open tasks. One of them is finished. What is the state of the case?',
    options: ['DONE', 'RUNNING', 'DESTROYED'],
    why: 'One task is still open, so the case is RUNNING. It is DONE when the last task is done.'
  },

  casename: {
    name: 'Case name',
    hook: 'Which of these cases is Anna’s leave?',
    def: 'The Case tab gives a [[case|case]] its **name** and **description**, with data in them. They describe the case for people; they change nothing about how it runs.',
    show: {
      title: 'A case you can find',
      list: 'A list of cases. With nothing but numbers, they all look the same.',
      tab: 'Elements that create a task have a Case tab too. On a User Task: Leave of <%=in.name%> (on a Task Switch, in1).',
      named: 'Now each case says what it is: Leave of Anna, Leave of Ben, Leave of Chloé.',
      info: 'Name, description and category are information for people. The engine treats the case the same.'
    },
    labels: { caseTab: 'Case', caseList: 'Cases', caseN: 'Case {0}', nameMacro: 'Leave of <%=in.name%>', leaveOf: 'Leave of {0}', desc: 'Description', info: 'Information for people' },
    myths: [
      { myth: 'A case is named after its process.', fact: 'A case gets its name from a Case tab. One process can name each of its cases with data: Leave of Anna, Leave of Ben.' },
      { myth: 'A good name makes a case run differently.', fact: 'Name, description and category are information for people. The engine treats the case the same.' },
      { myth: 'A case can only be named where the process starts.', fact: 'Elements that create a task have a Case tab too. A Task Switch can name the case, with the data the process has by then.' }
    ],
    q: 'Where does a case get its name?',
    options: ['From a Case tab, for example `Leave of <%=in.name%>`', 'From roles.yaml', 'It always has the name of its process'],
    why: 'The Case tab of an element that creates a task names the case, and can put data into the name.'
  },

  destroy: {
    name: 'Destroying a case',
    hook: 'The request was a mistake. Make it stop.',
    def: '**Destroying** a [[case|case]] cancels it: the case becomes DESTROYED, and its open tasks with it. They leave every task list.',
    show: {
      title: 'Cancelled',
      mistake: 'Anna asked for leave by mistake. Her case waits for Max, with an open task in his list.',
      destroy: 'An administrator destroys the case. In code that is one call: ivy.case.destroy().',
      gone: 'The case is DESTROYED, and its open task too. It is no longer in Max’s list.',
      record: 'Nothing is deleted. The case and its task stay in the system, marked as destroyed.'
    },
    labels: { code: 'ivy.case.destroy()', destroyedWord: 'Destroyed' },
    myths: [
      { myth: 'Destroying a case deletes it.', fact: 'It ends it. The case and its tasks stay in the system with the state DESTROYED; only the open tasks disappear from the task lists.' },
      { myth: 'After a case is destroyed, Max can still finish its task.', fact: 'The open task is destroyed with the case. It is no longer in Max’s list, and nobody can start it.' },
      { myth: 'A case only ends when it has been worked through to its end.', fact: 'An administrator can destroy it. In code that is one call: `ivy.case.destroy()`.' }
    ],
    q: 'A case with two open tasks is destroyed. What happens to the tasks?',
    options: ['They stay open', 'They are finished as done', 'They are destroyed too'],
    why: 'Destroying a case destroys its open tasks with it. Nobody can start them any more.'
  }
};
