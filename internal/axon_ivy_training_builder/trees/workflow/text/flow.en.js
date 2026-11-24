/**
 * The Workflow tree, the way a token takes (Alternative, Split, Join): its skills in English.
 * Keys per skill as described in text/core.en.js.
 */
export default {
  alternative: {
    name: 'Alternative',
    hook: 'Approved or rejected? A process has to choose its way.',
    def: 'An **Alternative** sends the token down one of its exits. Each exit has a condition on the Condition tab, and the first one that is true is taken.',
    show: {
      title: 'One way out of several',
      decide: 'Max decides on a leave request. Approved: book it. Rejected: say no. The process has to choose.',
      element: 'An Alternative has several exits. On its Condition tab each exit has a condition: an expression that is true or false.',
      yes: 'Anna’s request is approved: in.approved is true. Her token takes that exit.',
      no: 'Ben’s request is rejected. The first condition is false, the second is true: his token goes the other way.',
      one: 'Always one exit, never both. For two paths at the same time there is the Split.'
    },
    labels: { decide: 'Decide', book: 'Book leave', sayNo: 'Say no', approvedQ: 'Approved?', condTab: 'Condition', yes: 'yes', no: 'no', annaCase: 'Anna: approved', benCase: 'Ben: rejected', oneExit: 'One exit, every time' },
    myths: [
      { myth: 'An Alternative can send the token down several exits at once.', fact: 'It takes exactly one: the first exit whose condition is true. For paths that run side by side there is the [[split|Split]].' },
      { myth: 'The condition of a path is set on its connector.', fact: 'The conditions are on the Alternative itself: its Condition tab has a row for each exit.' },
      { myth: 'A condition can be any value, a text for example.', fact: 'It has to be true or false, like `in.approved` or `in.days > 5`. For a text the Designer says: Cannot cast object of type String to type Boolean.' }
    ],
    q: 'An Alternative has two exits, and the condition of the first one is true. What does the token do?',
    options: ['It waits for a person to choose', 'It takes both exits', 'It takes the first exit'],
    why: 'The conditions are tried from the top, and the exit of the first true one is taken. Only that one.'
  },

  altdefault: {
    name: 'The default exit',
    hook: 'What if two conditions are true? What if none is?',
    def: 'An [[alternative|Alternative]] tries its conditions from the top, and the first true one wins. An **empty condition is always true**: put it last, for everything else. If no condition is true, the process fails.',
    show: {
      title: 'First true wins',
      order: 'Short leave goes to the manager, long leave to HR. The Alternative tries its conditions from the top, row by row.',
      first: 'Anna asks for 3 days. Row 1 is true and is taken. Row 2 is not even looked at.',
      none: 'Ben asks for exactly 5. Row 1: false. Row 2: false. No exit is left, and the process fails with an error.',
      empty: 'The cure: leave the last condition empty. An empty condition is always true, so it catches whatever the rows above let through.',
      last: 'And keep it last. On top it would win every time, because the first true row is taken.'
    },
    labels: { request: 'Request leave', howLong: 'How long?', mgr: 'Manager approves', hr: 'HR approves', condTab: 'Condition', days3: 'days: 3', days5: 'days: 5', empty: '(empty)', keepLast: 'The empty condition goes last' },
    myths: [
      { myth: 'If no condition is true, the token takes the last exit.', fact: 'The process fails with an error: “In the alternative all conditions evaluate to false”. Give the last exit an empty condition to catch what is left.' },
      { myth: 'An exit without a condition is never taken.', fact: 'An empty condition is always true. That exit is taken whenever its row is reached.' },
      { myth: 'When two conditions are true, the one that fits better wins.', fact: 'The order of the rows decides: the first true one is taken. On the Condition tab the rows can be moved up and down.' }
    ],
    q: 'An Alternative’s rows are: 1. (empty) → Manager, 2. `in.days > 5` → HR. Anna asks for 10 days. Where does her request go?',
    options: ['To the manager: the empty condition on top is true', 'To HR: its condition fits better', 'Nowhere: the process fails'],
    why: 'An empty condition is always true, and the first true row wins. So the default belongs at the bottom.'
  },

  split: {
    name: 'Split',
    hook: 'Two things to do, and neither has to wait for the other.',
    def: 'A **Split** sends a token down every one of its exits. The paths run side by side in the same task. Its Output tab decides what data each path starts with: `out1`, `out2`, …',
    show: {
      title: 'Every way out',
      both: 'Anna’s leave is approved. Now book it, and tell her by mail. Neither has to wait for the other.',
      split: 'A Split sends a token down every exit: here two tokens, one for each path.',
      turns: 'No task is created and nobody waits. The paths take turns, step by step, in the task that is running.',
      data: 'Mind the data. The Output tab has a row per path, out1 and out2, and by default only out1 gets the data. The second path starts empty.',
      fix: 'Add the row out2 ← in, and the second path knows whom to write to.'
    },
    labels: { approve: 'Approve', book: 'Book leave', tell: 'Tell Anna', noTask: 'Same task, no waiting', path1: 'Path 1', path2: 'Path 2', nameAnna: 'name: Anna', nameEmpty: 'name:' },
    myths: [
      { myth: 'A Split is an Alternative with more exits: one of them is taken.', fact: 'A Split takes all of its exits, every time. Choosing one is what an [[alternative|Alternative]] does.' },
      { myth: 'Every path of a Split starts with all the data.', fact: 'By default only the first one does: `out1` ← `in`. Every other path starts with empty data until you add its row, like `out2` ← `in`.' },
      { myth: 'A Split creates a task for each path.', fact: 'It creates none. The paths run in the task that is running, taking turns. Tasks for different people are what a [[gateway|Task Switch Gateway]] creates.' }
    ],
    q: 'A Split has two exits, and nothing was changed on its Output tab. What data does the second path start with?',
    options: ['The same as the first', 'Empty data', 'None: the second path does not run'],
    why: 'By default there is only `out1` ← `in`. Add `out2` ← `in` for the second path.'
  },

  joinpaths: {
    name: 'Join',
    hook: 'What was split has to come together again.',
    def: 'A **Join** waits until every path that leads into it has arrived, then lets one token go on. Each path’s data is there on its own, as `in1`, `in2`; the Output decides what is kept.',
    show: {
      title: 'Together again',
      wait: 'Two paths from a Split lead into a Join. The first token arrives. Nothing goes on yet.',
      all: 'The second arrives. Now the Join lets one token go on.',
      data: 'Each path brings its own data: in1 from the first, in2 from the second. By default the Output is out ← in1.',
      map: 'What the second path worked out, you take with a row of its own: out.mailSent ← in2.mailSent.',
      alone: 'And use a Join only where all its paths arrive. Reached by one path only, it waits for ever, without an error.'
    },
    labels: { approve: 'Approve', book: 'Book leave', tell: 'Tell Anna', waitsTag: 'Waits for the other path', forever: 'One path only: waits for ever' },
    myths: [
      { myth: 'A Join lets each token through as it arrives.', fact: 'It waits until all the paths that lead into it have arrived. Then one token goes on.' },
      { myth: 'At a Join the paths’ data is merged by itself.', fact: 'The Join gets each path’s data on its own: `in1`, `in2`. Its Output takes `in1` by default; what another path changed is lost unless a row takes it.' },
      { myth: 'A Join after an Alternative just passes the one token on.', fact: 'A Join waits for every path that leads into it. If only one arrives, it waits there for ever, and nothing reports an error.' }
    ],
    q: 'Two paths lead into a Join. One token has arrived. What happens?',
    options: ['It goes on at once', 'The process fails', 'The Join waits for the other path'],
    why: 'A Join waits for all the paths that lead into it. Only then does one token go on.'
  }
};
