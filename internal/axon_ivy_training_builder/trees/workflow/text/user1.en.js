/**
 * The Workflow tree, user level 1: its skills in English.
 * Keys per skill as described in text/core.en.js.
 */
export default {
  user: {
    name: 'User',
    hook: 'Who are you, as far as the engine knows?',
    def: 'A **user** is one person with a login: a user name, a full name, a mail address. The engine knows which user is working at any moment.',
    show: {
      title: 'Someone who logs in',
      login: 'Ben logs in. From now on the engine knows him: he is the user ben.',
      card: 'A user has a user name to log in with, a full name and a mail address.',
      known: 'Whatever Ben starts or finishes from now on is done by the user ben.',
      many: 'Every person gets a user of their own. If they shared one, nobody could tell who did what.'
    },
    labels: { userField: 'User', password: 'Password', login: 'Log in', userName: 'User name', fullName: 'Full name', mail: 'Mail', known: 'User: {0}' },
    myths: [
      { myth: 'A user and a role are the same thing.', fact: 'A user is one person. A [[role|role]] is a group, like Manager, that many users can have. Tasks are usually given to roles, so the work does not depend on one person.' },
      { myth: 'A team can share one user. That is simpler.', fact: 'Every person gets a user of their own. If they shared one, nobody could tell who did what.' },
      { myth: 'The engine only knows who logged in, not what they did.', fact: 'Whatever Ben starts or finishes after logging in is done by the user ben. The engine knows which user is working at any moment.' }
    ],
    q: 'What is a user in Axon Ivy?',
    options: ['A group of people with the same job', 'A task that belongs to someone', 'One person with a login'],
    why: 'One person, one user. Groups of users with the same job are roles.'
  },

  session: {
    name: 'Session user',
    hook: 'Who is working right now?',
    def: 'The **session user** is whoever is logged in and working at this moment. In code, `ivy.session.getSessionUserName()` gives the name.',
    show: {
      title: 'Who is working right now',
      anna: 'Anna is logged in and fills in her request. In this step the session user is anna.',
      max: 'Later Max works on the next task, in his own session. There the session user is max.',
      system: 'In a task the engine does by itself, the session user is SYSTEM.',
      creator: 'So the session user changes from task to task. The user who started the case stays the same: its creator.'
    },
    labels: { request: 'Request', approve: 'Approve', book: 'Book', session: 'Session', creator: 'Creator of the case: anna' },
    myths: [
      { myth: 'The session user is the person who started the process.', fact: 'It is whoever works on the current task. In Max’s task it is max, in a SYSTEM task it is SYSTEM. The user who started the case is the case’s creator.' },
      { myth: 'The session user stays the same for the whole case.', fact: 'It changes from task to task: anna in her task, max in his. What stays the same is the creator of the case.' },
      { myth: 'A task the engine does by itself has no session user.', fact: 'It has one: SYSTEM.' }
    ],
    q: 'Anna started the case. Now Max works on its second task. Who is the session user in that task?',
    options: ['max', 'anna', 'SYSTEM'],
    why: 'The session user is the one working now: Max. Anna is the creator of the case.'
  },

  anonymous: {
    name: 'Anonymous',
    hook: 'Someone opens your start link without logging in.',
    def: 'Someone who is not logged in is **anonymous**. A new Start lets them in: “Allow anonymous” is checked in its Permission until you uncheck it.',
    show: {
      title: 'Not logged in',
      who: 'A visitor opens a start link without logging in. For the engine, this user is anonymous.',
      default: 'A new Start lets them in: under Permission, “Allow anonymous” is checked.',
      risk: 'So anyone who has the link can start the process. For a leave request, that is not what you want.',
      fix: 'Uncheck it and choose the roles that may start. Now only users the engine knows, with one of those roles, get in.'
    },
    labels: { link: 'Start link', permission: 'Permission', allow: 'Allow anonymous', visitor: 'Visitor', anyone: 'Anyone with the link' },
    myths: [
      { myth: 'Only logged-in users can start my process.', fact: 'By default anyone can: “Allow anonymous” is checked on every new Start. Uncheck it and pick the roles that may start the process.' },
      { myth: 'A start link is safe as long as nobody publishes it.', fact: 'Anyone who has the link can start the process, logged in or not. Who may start is decided by the Start’s Permission.' },
      { myth: 'An anonymous user is a user called “anonymous”, with a login.', fact: 'Anonymous means not logged in at all. The engine does not know who it is.' }
    ],
    q: 'You create a new process and change nothing on its Start. Who can start it?',
    options: ['Only users with the role Manager', 'Anyone, even without logging in', 'Nobody, until a role is chosen'],
    why: 'A new Start allows anonymous users. To restrict it, uncheck that and choose roles.'
  }
};
