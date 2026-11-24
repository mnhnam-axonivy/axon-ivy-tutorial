/**
 * The Workflow tree, HTML Dialogs: its skills in English.
 * Keys per skill as described in text/core.en.js.
 */
export default {
  htmldialog: {
    name: 'HTML Dialog',
    hook: 'A process needs a face: a page where a person reads and types.',
    def: 'An **HTML Dialog** is a page a process shows to a person. It is made of three pieces that belong together: the view, its data, and its logic.',
    show: {
      title: 'Three pieces, one dialog',
      need: 'Anna has to tell the process from when she wants leave, and for how many days. The process needs a page for that.',
      view: 'The view is what Anna sees: the fields and the button. It is a file that ends in .xhtml.',
      data: 'The dialog’s data is where the fields keep what she types: a data class of the dialog’s own.',
      logic: 'And the logic: a small process of its own, with a start and with what the buttons do.',
      folder: 'The three live in one folder, named after the dialog. Together they are one HTML Dialog.'
    },
    labels: { request: 'Request leave', send: 'Send', viewFile: 'LeaveForm.xhtml', dataFile: 'LeaveFormData.d.json', logicFile: 'LeaveFormProcess.p.json', view: 'View', data: 'Data', logic: 'Logic' },
    myths: [
      { myth: 'An HTML Dialog is one file with a page in it.', fact: 'It is three files in one folder: the view (`.xhtml`), the dialog’s data (`…Data.d.json`) and its logic (`…Process.p.json`).' },
      { myth: 'A dialog works on the process data directly.', fact: 'It has data of its own. What the process hands in and gets back is decided where the dialog is called: see [[dialogdata|data in and out]].' },
      { myth: 'What a button does is written into the page.', fact: 'The page only names it. What happens is in the dialog’s logic, which is a small process: a start, and an event for a button.' }
    ],
    q: 'Which three pieces make an HTML Dialog?',
    options: ['A start, a task and an end', 'A view, its data and its logic', 'A form, a mail and a role'],
    why: 'The view is the page, the data holds what is typed, and the logic says what the buttons do.'
  },

  userdialog: {
    name: 'User Dialog',
    hook: 'A dialog does nothing until a process shows it.',
    def: 'A **User Dialog** is the element that shows an [[htmldialog|HTML Dialog]]. The dialog opens at once, in the task that is running, and the process waits there until it is closed.',
    show: {
      title: 'The process shows a page',
      element: 'In the process, a User Dialog element stands for the form. Its Dialog tab says which dialog, and which of its starts.',
      opens: 'Anna starts the process. The token reaches the User Dialog, and the page opens on her screen at once.',
      waits: 'The process waits there. Nothing after the element runs while the dialog is open.',
      closes: 'Anna sends the form. The dialog closes and the token goes on.',
      notask: 'All of it happened in one task, Anna’s. A User Dialog creates no task: for a page that waits for someone else, there is the User Task.'
    },
    labels: { request: 'Request leave', check: 'Check dates', dialogTab: 'Dialog', send: 'Send', waits: 'Waits for Anna', oneTask: 'Still one task: Anna’s' },
    myths: [
      { myth: 'A User Dialog creates a task for whoever should fill it in.', fact: 'It creates no task. The dialog opens at once, for whoever is working in the task that is running. A [[usertask|User Task]] is the one that creates a task.' },
      { myth: 'While the dialog is open, the process goes on behind it.', fact: 'The process waits at the User Dialog. What comes after it runs when the dialog is closed.' },
      { myth: 'The form is drawn inside the User Dialog element.', fact: 'The element only calls an [[htmldialog|HTML Dialog]]: on its Dialog tab you choose which one, and which start.' }
    ],
    q: 'The token reaches a User Dialog. What happens?',
    options: ['A task is created and waits in a task list', 'The dialog is sent by mail', 'The dialog opens at once, and the process waits until it is closed'],
    why: 'A User Dialog shows its dialog right away, in the running task, and goes on when the dialog is closed.'
  },

  dialogdata: {
    name: 'Data in and out',
    hook: 'What the dialog is told, and what the process learns from it.',
    def: 'A dialog has its own data. The [[userdialog|User Dialog]] hands values in through the start’s parameters (`param`) and takes values back from the dialog’s **result**, on its Output tab.',
    show: {
      title: 'In through param, out through result',
      own: 'The process has its data, and the dialog has its own. Neither sees the other’s.',
      in: 'In: on the Dialog tab, the User Dialog fills the start’s parameters: param.name ← in.name. Now the dialog knows Anna’s name.',
      typed: 'Anna types her days. They are in the dialog’s data, not yet in the process.',
      out: 'Out: the dialog’s start names what it gives back, its result. On the Output tab the process takes it: out.days ← result.days.',
      lost: 'Leave that row out, and the days are gone when the dialog closes. Nothing warns you.'
    },
    labels: { procData: 'Process data', dlgData: 'Dialog data', nameAnna: 'name: Anna', nameEmpty: 'name:', days0: 'days: 0', days3: 'days: 3', request: 'Request leave', dialogTab: 'Dialog' },
    myths: [
      { myth: 'What a user types into a dialog is in the process data at once.', fact: 'It is in the dialog’s own data. The process only gets what the Output tab takes from `result`.' },
      { myth: 'A new User Dialog passes everything in and out by itself.', fact: 'By default nothing is mapped: its Output is just `out` ← `in`. Without your rows the dialog starts empty and what is typed is lost, without any message.' },
      { myth: 'Inside the dialog, `in` is the process data.', fact: 'Inside the dialog, `in` is the dialog’s own data. Values from the process arrive as the start’s parameters: `param`.' }
    ],
    q: 'A User Dialog should give the days Anna typed back to the process. Where does that happen?',
    options: ['On its Output tab: `out.days` ← `result.days`', 'Nowhere: it happens by itself', 'On the Task tab'],
    why: 'The dialog returns a result, and the User Dialog’s Output tab maps it into the process data.'
  },

  dialogclose: {
    name: 'Closing a dialog',
    hook: 'Two kinds of end, and only one lets the process go on.',
    def: 'A button starts an event in the dialog’s logic. If that path ends in a **User Dialog Exit End**, the dialog closes and the process goes on. If it ends in a User Dialog Process End, the dialog stays open.',
    show: {
      title: 'Stay, or close',
      logic: 'The dialog’s logic is a small process. A new dialog has a start, and one event: close.',
      button: 'A button names its event: #{logic.close}. A click starts that path of the logic.',
      exit: 'The close path ends in a User Dialog Exit End. The dialog closes, its result goes back, and the calling process goes on.',
      stay: 'Another button, another event: check. Its path ends in a User Dialog Process End: the logic has run, and the dialog stays open.',
      rule: 'So the end decides. Exit End: back to the process. Process End: back to the page.'
    },
    labels: { request: 'Request leave', send: 'Send', checkBtn: 'Check', closeCode: '#{logic.close}', checkCode: '#{logic.check}', exitEnd: 'Exit End', processEnd: 'Process End', closed: 'Dialog closed', toProcess: 'Back to the process', toPage: 'Back to the page' },
    myths: [
      { myth: 'Every button of a dialog closes it.', fact: 'Only a path that ends in a User Dialog Exit End closes the dialog. A path that ends in a User Dialog Process End runs, and leaves the dialog open.' },
      { myth: 'A click runs code that is written into the page.', fact: 'The page only names an event of the dialog’s logic, like `#{logic.close}`. What happens then is drawn there, as a process.' },
      { myth: 'When a button’s logic runs, what was typed has not arrived yet.', fact: 'It has. The fields are bound to the dialog’s data, so the logic already sees the typed values.' }
    ],
    q: 'A button’s event ends in a User Dialog Process End. What happens after a click?',
    options: ['The dialog closes and the process goes on', 'The logic runs and the dialog stays open', 'The task is done'],
    why: 'A Process End only ends that path of the logic. To close the dialog, the path has to end in an Exit End.'
  }
};
