/**
 * The Workflow tree, role level 1: its skills in English.
 * Keys per skill as described in text/core.en.js.
 */
export default {
  role: {
    name: 'Role',
    hook: 'Give the work to a job, not to a person.',
    def: 'A **role** is a group of [[user|users]] with the same job, like Manager or HR. Give a [[task|task]] to a role, and every user with that role can start it.',
    show: {
      title: 'A job, not a person',
      group: 'Hanna, Ben and Chloé all work in HR. In Axon Ivy they share a role: HR.',
      task: 'A process creates a task for the role HR. It shows up for all three.',
      away: 'Ben is on holiday. Nothing waits for him: two people with the role are still there.',
      first: 'Chloé starts it first. Now it is hers; Hanna can no longer start it.',
      tree: 'Roles form a tree under Everybody, the role every user has. A project lists its roles in roles.yaml.'
    },
    labels: { holiday: 'On holiday', contract: 'Contract', file: 'roles.yaml' },
    myths: [
      { myth: 'To be safe, give each task to one named person.', fact: 'Then the task waits whenever that person is away. Give it to a role, and anyone with the role can do it.' },
      { myth: 'A task for a role has to be done by everyone who has the role.', fact: 'One of them does it. Whoever starts it first has it; the others can no longer start it.' },
      { myth: 'Roles are a flat list.', fact: 'They form a tree under Everybody, the role every user has. A project lists its roles in roles.yaml.' }
    ],
    q: 'A task is for the role HR, which three users have. Who can work on it?',
    options: ['Any of the three: whoever starts it first', 'Only the first user in roles.yaml', 'All three, together'],
    why: 'Everyone with the role sees it. The first one to start it does it.'
  },

  responsible: {
    name: 'Responsible',
    hook: 'Who gets the task? You decide on the Task tab.',
    def: '**Responsible** on the Task tab says who may work on the [[task|task]]: one or more [[role|roles]]. A new task is for Everybody until you change it.',
    show: {
      title: 'Who gets the task',
      tab: 'Every element that creates a task has a Task tab. Its most important field: Responsible.',
      default: 'A new task is for the role Everybody, which every user has. Anyone could do it.',
      choose: 'Choose the role Manager instead. Now only managers see the task.',
      check: 'Everybody is the default, and an easy one to forget. Check Responsible on every task you create.'
    },
    labels: { approve: 'Approve leave', checkIt: 'Check Responsible' },
    myths: [
      { myth: 'A new task goes to the right people by itself.', fact: 'It goes to Everybody, the default. Unless you set Responsible, every user can start the approval meant for managers.' },
      { myth: 'Responsible takes exactly one role.', fact: 'It takes one or more. Give a task two roles, and the users of both can start it.' },
      { myth: 'Only a User Task has a Responsible.', fact: 'Every element that creates a task has a Task tab, and Responsible is on it.' }
    ],
    q: 'You add a User Task and leave its Task tab as it is. Who can work on the task?',
    options: ['Nobody, until Responsible is set', 'Only the user who started the case', 'Every user: it is for Everybody'],
    why: 'Responsible starts as the role Everybody, and every user has that role.'
  },

  everybody: {
    name: 'Everybody',
    hook: 'The role you never created.',
    def: '**Everybody** is the role every user has. It is built in, the root of all other roles, and what a new task gets when you choose nothing.',
    show: {
      title: 'The role everyone has',
      all: 'Hanna has the role HR, Max the role Manager, Anna the role Employee. And all three have one more: Everybody.',
      builtin: 'Everybody is built in. You do not create it, and every other role sits under it.',
      default: 'It is also the default: a new task has Responsible Everybody.',
      meaning: 'A task for Everybody can be started by any user. Sometimes right, often an oversight.'
    },
    myths: [
      { myth: 'Everybody means everybody in my team.', fact: 'It means every user of the system, and anonymous visitors have it too. For a team, make a role of its own.' },
      { myth: 'Everybody is a role you create for your project.', fact: 'It is built in. You do not create it, and every other role sits under it.' },
      { myth: 'A user with another role no longer has Everybody.', fact: 'Every user has it, whatever other roles they have. Hanna has HR, and Everybody too.' }
    ],
    q: 'Which users have the role Everybody?',
    options: ['Only administrators', 'All of them', 'Those without any other role'],
    why: 'Everybody is the root of the role tree: every user has it, whatever other roles they have.'
  }
};
