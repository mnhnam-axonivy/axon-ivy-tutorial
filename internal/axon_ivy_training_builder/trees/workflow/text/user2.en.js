/**
 * The Workflow tree, user level 2: its skills in English.
 * Keys per skill as described in text/core.en.js.
 */
export default {
  testusers: {
    name: 'Test users',
    hook: 'To test a workflow, you have to be several people.',
    def: '**Test users** are the users you test with in the Designer. A project lists them in `config/users.yaml`, each with a password and roles.',
    show: {
      title: 'Being several people',
      file: 'A project’s users.yaml lists its test users: a name, a password, and their roles.',
      login: 'In the Developer Workflow UI, the login table shows them all with their roles. You switch between them.',
      play: 'So you start the request as anna, approve it as max, and see what each of them sees.',
      only: 'They are for the Designer only. A real engine gets its users from its own user management.'
    },
    labels: { file: 'users.yaml', loginTable: 'Login', asUser: 'Logged in as {0}', only: 'Designer only: not deployed' },
    myths: [
      { myth: 'My test users will be there on the real engine too.', fact: 'They exist only in the Designer; they are not deployed. On an engine, users come from the engine’s own security system.' },
      { myth: 'To test as another user, I have to restart the Designer.', fact: 'In the Developer Workflow UI the login table shows all test users with their roles. You switch between them.' },
      { myth: 'Test users have no roles: roles belong to the real engine.', fact: 'users.yaml gives each test user a name, a password and roles. So you start the request as anna and approve it as max.' }
    ],
    q: 'Where do the users come from that you log in with in the Designer?',
    options: ['From roles.yaml', 'From the engine’s identity provider', 'From the project’s users.yaml'],
    why: 'users.yaml holds the test users of a project. They are for testing in the Designer.'
  },

  developer: {
    name: 'The Developer user',
    hook: 'It works on my machine. Of course it does.',
    def: 'In the Designer you are **Developer** unless you log in as someone else: a built-in user that may do everything, and can start the task of any role.',
    show: {
      title: 'The user who may do everything',
      you: 'Start a process in the Designer, and you are the user Developer.',
      all: 'Developer may do everything. It can start a task for Manager, a task for HR, even a task meant for anna alone.',
      trap: 'So your workflow always works for you, even when the roles are wrong.',
      test: 'To really test it, log in as a test user, with exactly the roles a real person has.'
    },
    labels: { forManager: 'For Manager', forHr: 'For HR', forAnna: 'For anna', always: 'Always works for Developer' },
    myths: [
      { myth: 'It works when I test it, so the roles are right.', fact: 'You tested as Developer, who can start every task. Log in as a [[testusers|test user]] like anna or max to see what real users can do.' },
      { myth: 'Developer can only start tasks that are for a role.', fact: 'It can start any task: one for Manager, one for HR, even a task meant for anna alone.' },
      { myth: 'Developer is one of the test users in users.yaml.', fact: 'It is built in, and not listed there. In the Designer you are Developer until you log in as someone else.' }
    ],
    q: 'In the Designer you start a task that is for the role HR, without logging in as anyone. Why does it work?',
    options: ['Because you are Developer, who may start every task', 'Because HR is the default role', 'Because roles are not checked in the Designer'],
    why: 'Roles are checked, but Developer passes every check. A test user with the wrong role would not get in.'
  },

  worker: {
    name: 'Worker',
    hook: 'Who approved this? The task knows.',
    def: 'The **worker** of a [[task|task]] is the user who worked on it. Every task keeps that name, so a case shows later who did what.',
    show: {
      title: 'Who did it',
      start: 'A task for HR waits. Ben starts it: from now on, ben is its worker.',
      done: 'He finishes it. The task is done, and it keeps his name.',
      later: 'Weeks later the case still shows who did which task.',
      system: 'And a task the engine did by itself has the worker SYSTEM.'
    },
    labels: { worker: 'Worker: {0}', doneBy: 'Done by {0}', history: 'Case: contract', request: 'Request contract', sign: 'Sign the contract', file: 'File the contract' },
    myths: [
      { myth: 'A task for a role is done “by the role”.', fact: 'A role only says who may do it. One user starts the task, and that user is its worker: the task keeps the name.' },
      { myth: 'Once a task is done, nobody can tell who did it.', fact: 'The task keeps its worker’s name. Weeks later the case still shows who did which task.' },
      { myth: 'A task the engine did by itself has no worker.', fact: 'Its worker is SYSTEM.' }
    ],
    q: 'Ben, who has the role HR, finishes a task that was for HR. What does the task remember?',
    options: ['That the role HR did it', 'That the user ben did it', 'Nothing: tasks are anonymous'],
    why: 'Every task knows the user who worked on it. That is how you see later who approved what.'
  },

  userattr: {
    name: 'User from Attribute',
    hook: 'Not any manager. Anna’s manager.',
    def: 'With **User from Attribute**, the [[responsible|responsible]] is one user, whose user name comes from the process data while the process runs.',
    show: {
      title: 'One user, decided at run time',
      fixed: 'Roles on the Task tab are fixed when you draw the process: every manager gets the task. Max and Lea.',
      field: 'But Anna’s request must go to her own manager. A step before the task looks him up: in.approver = "max".',
      attr: 'On the Task tab: User from Attribute, in.approver. Now the task is for max alone.',
      typo: 'Careful with the name. A user name that does not exist is accepted without a word, and then nobody can see the task.'
    },
    labels: { ghost: 'Nobody sees this task' },
    myths: [
      { myth: 'To give a task to one person, you need a role just for them.', fact: 'No: User from Attribute gives the task to one user, whose user name is in the process data. But check the name: a wrong one is accepted silently, and the task waits where nobody finds it.' },
      { myth: 'Who gets a task is always fixed when the process is drawn.', fact: 'Roles on the Task tab are. With User from Attribute the user name comes from the process data, while the process runs.' },
      { myth: 'User from Attribute wants the name with a `#` in front.', fact: 'It takes the plain user name: `max`. The `#` belongs to Members from Attribute, where it tells a user from a role.' }
    ],
    q: 'Anna’s request must go to her own manager, whose user name a step put into `in.approver`. What do you choose as Responsible of the User Task?',
    options: ['Roles: Manager', 'User from Attribute: `in.approver`', 'Role from Attribute: `in.approver`'],
    why: 'The role would let every manager take it. User from Attribute gives it to the one user named in the data.'
  }
};
