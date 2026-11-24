/**
 * The Workflow tree, role level 2: its skills in English.
 * Keys per skill as described in text/core.en.js.
 */
export default {
  roletree: {
    name: 'Role tree',
    hook: 'Roles have parents.',
    def: 'Roles form a **tree**. A project defines them in `config/roles.yaml`: an Id, a name, and if you like a Parent. A role without a parent sits right under Everybody.',
    show: {
      title: 'Roles in a tree',
      file: 'A project lists its roles in roles.yaml. Each has an Id.',
      parent: 'A role can name a Parent. Here Manager and HR are children of Employee.',
      root: 'A role without a parent, like Employee, sits under Everybody, the built-in root.',
      why: 'The tree is not decoration: it decides who else gets a role’s tasks. That is the next skill.'
    },
    labels: { file: 'roles.yaml' },
    myths: [
      { myth: 'Roles are a flat list of names.', fact: 'They are a tree under [[everybody|Everybody]]. A role’s place in it matters: users of a child role also count for its parents.' },
      { myth: 'Every role has to name a parent.', fact: 'Parent is optional. A role without one, like Employee, sits right under Everybody, the built-in root.' },
      { myth: 'The order of the roles in roles.yaml makes one the child of another.', fact: 'The order means nothing. A role names its parent with `Parent`: `Parent: Employee` on Manager.' }
    ],
    q: 'In roles.yaml, how do you make HR a child of Employee?',
    options: ['By listing HR before Employee', 'With `Parent: Employee` on the role HR', 'By giving both the same Id'],
    why: 'A role names its parent with `Parent`. Without it, the role sits right under Everybody.'
  },

  inherited: {
    name: 'Inherited roles',
    hook: 'A manager is an employee too.',
    def: 'A user with a role also counts for every **parent** of that role. Max has Manager, a child of Employee, so he can start tasks for Employee too.',
    show: {
      title: 'A manager is an employee too',
      tree: 'Manager and HR are children of Employee. Max has only the role Manager, Hanna only HR.',
      up: 'But a role brings its parents with it: Max and Hanna count as Employee too.',
      task: 'So a task for Employee can be started by Anna, by Max and by Hanna.',
      down: 'It does not work downwards. A task for Manager is not for Anna, who is only an Employee.'
    },
    labels: { forEmployee: 'For Employee', forManager: 'For Manager', plus: '+ Employee' },
    myths: [
      { myth: 'A task for Employee is only for users who have exactly the role Employee.', fact: 'It is also for users of its child roles: managers and HR people are employees too. Give a task to a parent role, and all its children are included.' },
      { myth: 'A task for Manager can be started by every Employee.', fact: 'It does not work downwards. A task for Manager is not for Anna, who is only an Employee.' },
      { myth: 'A role only brings its direct parent with it.', fact: 'It goes all the way up. Max, with Manager, counts as Manager, Employee and Everybody.' }
    ],
    q: 'Manager is a child role of Employee. A task is for Employee. Can Max, who only has Manager, start it?',
    options: ['Yes: his role brings its parent with it', 'No: he would need Employee too', 'Only if nobody else starts it first'],
    why: 'Whoever has a child role counts for its parents as well. Max is a Manager, and therefore an Employee.'
  },

  userroles: {
    name: 'A user’s roles',
    hook: 'One person, several hats.',
    def: 'A user can have several roles. For test users they are listed under `Roles` in users.yaml; Everybody comes on top without being listed.',
    show: {
      title: 'Several hats',
      one: 'In users.yaml, Hanna has one role: HR. She can start the tasks for HR.',
      two: 'Now she leads a team as well. Add Manager to her roles, and she can start the managers’ tasks too.',
      all: 'With the parents of her roles, Hanna counts as HR, Manager, Employee and Everybody.',
      table: 'The login table of the Developer Workflow UI shows every user with their roles.'
    },
    labels: { forHr: 'For HR', forManager: 'For Manager', all: 'All roles of hanna', loginTable: 'Login' },
    myths: [
      { myth: 'A user has exactly one role.', fact: 'A user can have as many as needed, and gets the [[inherited|parents]] of each on top. Their task list shows the tasks of all of them.' },
      { myth: 'Everybody has to be listed for every user in users.yaml.', fact: 'Everybody comes on top without being listed.' },
      { myth: 'To see a test user’s roles, I have to open users.yaml.', fact: 'The login table of the Developer Workflow UI shows every user with their roles.' }
    ],
    q: 'Hanna has the roles HR and Manager. Which tasks can she start?',
    options: ['Only tasks for HR, her first role', 'None: two roles cancel each other', 'Tasks for HR and tasks for Manager'],
    why: 'Every role a user has counts. With two roles she can start the tasks of both.'
  },

  severalroles: {
    name: 'Several roles',
    hook: 'Either of them will do.',
    def: '[[responsible|Responsible]] can name more than one role. Then a user needs only one of them to start the task.',
    show: {
      title: 'Either of them will do',
      one: 'A task for the role Manager: only managers can start it.',
      add: 'Add HR to Responsible. Now the task has two roles.',
      either: 'Max can start it, and so can Hanna. A user needs one of the roles, not both.',
      still: 'It is still one task. Whoever starts it first does it.'
    },
    labels: { approve: 'Approve leave' },
    myths: [
      { myth: 'With two roles in Responsible, a user needs both.', fact: 'One is enough. Two roles widen the circle: the task shows up for the users of either.' },
      { myth: 'Two roles in Responsible make two tasks, one for each.', fact: 'It is still one task. Whoever starts it first does it.' },
      { myth: 'To let HR do a managers’ task, the HR users need the role Manager.', fact: 'Add HR to the task’s Responsible instead. The task then has two roles, and nobody’s roles change.' }
    ],
    q: 'A task has Responsible Manager and HR. Hanna only has HR. Can she start it?',
    options: ['No: she would need Manager too', 'Yes: one of the roles is enough', 'Only after a manager has looked at it'],
    why: 'A user needs one of the responsible roles. Hanna has HR, so the task is in her list.'
  },

  roleattr: {
    name: 'Role from Attribute',
    hook: 'Which team? It depends on the request.',
    def: 'With **Role from Attribute**, the [[responsible|responsible]] role comes from the process data: a role name worked out while the process runs.',
    show: {
      title: 'A role decided at run time',
      fixed: 'A fixed role sends every request to the same people. Here: the managers.',
      data: 'But questions about pay belong to HR. A step before the task works out the role: in.team = "HR".',
      attr: 'On the Task tab: Role from Attribute, in.team. This task goes to HR.',
      next: 'The next request has in.team = "Manager", and goes to the managers. One element, different roles.'
    },
    labels: { team: 'in.team' },
    myths: [
      { myth: 'Each role needs its own task element.', fact: 'One element is enough: Role from Attribute takes the role’s name from the data, anew for every case.' },
      { myth: 'Role from Attribute takes a user’s name.', fact: 'It reads a role name, like `HR`. For a user’s name there is User from Attribute.' },
      { myth: 'With Role from Attribute, the user picks the role.', fact: 'Nobody picks. A step before the task puts the role’s name into the data, for example `in.team = "HR"`, and the task reads it there.' }
    ],
    q: 'A step put the role name "HR" into `in.team`. Which Responsible sends the task to that role?',
    options: ['Role from Attribute: `in.team`', 'Roles: in.team', 'User from Attribute: `in.team`'],
    why: 'Role from Attribute reads a role name from the data. User from Attribute would look for a user called HR.'
  },

  system: {
    name: 'SYSTEM',
    hook: 'A task nobody has to open.',
    def: 'Give a [[task|task]] to the role **SYSTEM**, and the engine works on it by itself, as soon as it is created. No person opens it.',
    show: {
      title: 'Work for the engine',
      approved: 'Max approves Anna’s leave. Booking it in the HR system needs no person.',
      system: 'So the next Task Switch gives the task to the role SYSTEM.',
      runs: 'The engine starts the task by itself. The steps after it run, and nobody clicks anything.',
      user: 'In the log, the user of that task is SYSTEM.',
      retry: 'If it fails, the engine tries again later: after 1, 2, 4, 8 minutes, up to 23 hours.'
    },
    labels: { approve: 'Approve', book: 'Book', log: 'Book leave · user=SYSTEM', retry: 'Again in 1, 2, 4, 8 min …' },
    myths: [
      { myth: 'Steps after a task switch always need someone to click Continue.', fact: 'Give the new task to SYSTEM and the engine starts it by itself. That is the way to go on in the background, after a person’s task.' },
      { myth: 'A SYSTEM task waits in the administrator’s task list.', fact: 'It is in nobody’s list. The engine starts it by itself, as soon as it is created.' },
      { myth: 'If a SYSTEM task fails, that is the end of it.', fact: 'The engine tries again later: after 1, 2, 4, 8 minutes and so on, up to 23 hours.' }
    ],
    q: 'A Task Switch gives the next task to SYSTEM. Who works on it?',
    options: ['The engine itself, without anyone opening it', 'The administrator', 'Nobody: it waits for ever'],
    why: 'SYSTEM is the engine. It starts the task by itself.'
  }
};
