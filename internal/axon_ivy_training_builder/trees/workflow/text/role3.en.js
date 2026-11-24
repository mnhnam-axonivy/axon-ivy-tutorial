/**
 * The Workflow tree, role level 3: its skills in English.
 * Keys per skill as described in text/core.en.js.
 */
export default {
  creator: {
    name: 'CREATOR',
    hook: 'Send it back to whoever asked.',
    def: '**CREATOR** stands for the user who started the case. Give a task to CREATOR, and it goes to that person, whoever it is.',
    show: {
      title: 'Back to whoever started it',
      need: 'Max wants Anna to correct her request. The task should go back to her, but any employee could have started this case.',
      creator: 'On the Task tab, choose CREATOR as the role.',
      resolve: 'When the task is created, CREATOR becomes the user who started the case: here, anna.',
      each: 'In Ben’s case it would be ben. One element, always the right person.'
    },
    labels: { correct: 'Correct the request', caseBen: 'Case: Ben' },
    myths: [
      { myth: 'CREATOR is the person who built the process.', fact: 'It is the user who started this case: a different one in every case.' },
      { myth: 'CREATOR has to be worked out in a script before the task.', fact: 'Choose CREATOR as the role on the Task tab. When the task is created, the engine puts in the user who started the case.' },
      { myth: 'A task for CREATOR goes to everyone with that person’s role.', fact: 'It goes to that one user: anna in Anna’s case, ben in Ben’s.' }
    ],
    q: 'Chloé starts a case. Later a task in it has Responsible CREATOR. Who gets it?',
    options: ['The developer of the process', 'Everybody', 'Chloé'],
    why: 'CREATOR is replaced by the user who started the case.'
  },

  self: {
    name: 'SELF',
    hook: 'The same person, one more step.',
    def: '**SELF** stands for the user who worked on the task before. Give the next task to SELF, and the same person continues.',
    show: {
      title: 'The same person again',
      two: 'Hanna checks a contract. Filing it, the next task, should be done by whoever checked it.',
      self: 'On the next task, choose SELF as the role.',
      resolve: 'The new task goes to the user who did the task before: Hanna. Not to all of HR.',
      skip: 'With Skip Tasklist as well, she goes straight on into it.'
    },
    labels: { check: 'Check contract', file: 'File contract' },
    myths: [
      { myth: 'SELF and CREATOR are the same.', fact: '[[creator|CREATOR]] is who started the case. SELF is who did the task just before. After the first task these are often two different people.' },
      { myth: 'A task for SELF goes to the role of the task before.', fact: 'It goes to the one user who did the task before: Hanna, not all of HR.' },
      { myth: 'SELF takes the user straight into the next task.', fact: 'SELF only says whose task it is. Add Skip Tasklist as well, and she goes straight on into it.' }
    ],
    q: 'Anna starts a case. Hanna does its second task. The third task is for SELF. Who gets it?',
    options: ['Hanna', 'Anna', 'Everybody'],
    why: 'SELF is the user who worked on the task before: Hanna.'
  },

  members: {
    name: 'Members from Attribute',
    hook: 'Not one role, not one user: a list.',
    def: '**Members from Attribute** takes a list from the process data: several users and roles at once. In it, a user is written with a `#` in front, a role without.',
    show: {
      title: 'A list of people',
      need: 'A task should go to Anna and to everyone in HR. That is neither one role nor one user.',
      list: 'A step builds a list in the data: ["#anna", "HR"].',
      attr: 'On the Task tab: Members from Attribute, in.members. Anna can start the task, and so can Hanna and Ben.',
      hash: 'Mind the #. Without it, "anna" is read as the name of a role, and Anna does not get the task.'
    },
    labels: { members: 'in.members', listHash: '= ["#anna", "HR"]', listPlain: '= ["anna", "HR"]' },
    myths: [
      { myth: 'In a list of members, a user is written as in User from Attribute: just the name.', fact: 'In a list of members, users need a `#` in front: `"#anna"`. A name without it is taken as a role.' },
      { myth: 'A task is for one role or for one user, never for both.', fact: 'Members from Attribute takes a list with users and roles together: `["#anna", "HR"]` is for Anna and for everyone in HR.' },
      { myth: 'The list of members is typed on the Task tab.', fact: 'It comes from the process data. A step builds the list, and the Task tab names the attribute: `in.members`.' }
    ],
    q: 'Which list gives the task to the user anna and to the role HR?',
    options: ['`["anna", "HR"]`', '`["#anna", "HR"]`', '`["anna", "#HR"]`'],
    why: 'In a members list, `#` marks a user. `"#anna"` is the user, `"HR"` the role.'
  },

  permission: {
    name: 'Who may start',
    hook: 'The link is out there. Who gets in?',
    def: 'A Start’s **Permission** says who may start the process: anonymous users or not, and which roles. A user without the role gets an error instead of the process.',
    show: {
      title: 'Who may start',
      open: 'A new Start is open to everyone: Allow anonymous is checked.',
      roles: 'Uncheck it and choose a role: Employee. Now a user needs that role to start the process.',
      yes: 'Anna has Employee: she gets in. So do Max and Hanna, whose roles are children of Employee.',
      no: 'A user without the role gets an error instead: ivy:security:forbidden.'
    },
    labels: { permission: 'Permission', allowOn: '☑ Allow anonymous', allowOff: '☐ Allow anonymous', error: 'ivy:security:forbidden', visitor: 'Visitor' },
    myths: [
      { myth: 'Not showing the start link is enough to protect a process.', fact: 'Whoever knows the link can still call it. The Start’s Permission is what decides who may start.' },
      { myth: 'A Start for the role Employee keeps managers out.', fact: 'Max and Hanna get in too: their roles, Manager and HR, are children of Employee.' },
      { myth: 'A user without the role can start the process, just not finish it.', fact: 'The Start refuses at once: an error instead of the process, `ivy:security:forbidden`.' }
    ],
    q: 'A Start allows only the role Employee. A user without that role opens the start link. What happens?',
    options: ['The process starts anyway', 'A task for a manager is created', 'An error: the user is not allowed'],
    why: 'Without the role the Start refuses, with the error set in its Permission (ivy:security:forbidden).'
  }
};
