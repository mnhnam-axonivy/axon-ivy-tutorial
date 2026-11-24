/**
 * The Workflow tree, user level 3: its skills in English.
 * Keys per skill as described in text/core.en.js.
 */
export default {
  language: {
    name: 'The user’s language',
    hook: 'The same task, read in Tokyo and in Zug.',
    def: 'A user can have a **language**. Task names from the CMS are shown in it, if it is one of the application’s workflow languages; otherwise in the default one.',
    show: {
      title: 'In your own language',
      cms: 'The CMS holds a text in several languages: here a task’s name in English and in Japanese.',
      en: 'Max has no language set. He gets the default language: here English.',
      ja: 'Anna’s language is Japanese. Logged in as her, the same text comes back in Japanese.',
      names: 'So take the names and descriptions of tasks from the CMS, and everyone reads them in their own language.'
    },
    labels: { cmsEn: 'en: Approve leave', cmsJa: 'ja: 休暇の承認', textEn: 'Approve leave', textJa: '休暇の承認', noLang: 'Language: –', langJa: 'Language: ja' },
    myths: [
      { myth: 'Task names are in the language of whoever built the process.', fact: 'Only if you type them into the process. Take them from the CMS, and each user sees them in their own language.' },
      { myth: 'A user without a language gets no text at all.', fact: 'They still get one: the default language. Max has no language set, and reads the English text.' },
      { myth: 'Setting a user’s language translates everything by itself.', fact: 'It only chooses between texts the CMS has. A text is shown in the user’s language when the CMS has it in that language.' }
    ],
    q: 'Anna’s language is Japanese, one of the workflow languages, and a task’s name comes from the CMS in English and Japanese. What does Anna see?',
    options: ['The Japanese name', 'The English name', 'Both names'],
    why: 'Japanese is one of the workflow languages and the CMS has the name in it, so Anna reads the Japanese name.'
  },

  absence: {
    name: 'Absence',
    hook: 'Two weeks of holiday. And her tasks?',
    def: 'A user can be **absent** for a time. Tasks for a role do not mind: others do them. A task for that one user waits.',
    show: {
      title: 'Out of office',
      away: 'Anna is on holiday for two weeks. In Axon Ivy, she is absent.',
      role: 'Tasks for a role are no problem: the others with that role do them.',
      personal: 'But a task for anna alone waits until she is back.',
      next: 'Unless someone stands in for her. That is the next skill: a substitute.'
    },
    labels: { absent: 'Absent', forHr: 'For HR', forAnna: 'For anna', waits: 'Waits for two weeks' },
    myths: [
      { myth: 'When a user is absent, their tasks go to someone else by themselves.', fact: 'Not by themselves. A task for that one user waits, unless the user has a substitute. One more reason to give tasks to roles.' },
      { myth: 'While one user is absent, the tasks of their role wait too.', fact: 'Tasks for a role do not mind: the others with that role do them.' },
      { myth: 'A task for an absent user is cancelled.', fact: 'Without a substitute it is neither cancelled nor passed on: it waits until the user is back.' }
    ],
    q: 'Anna is absent and has no substitute. A task is for the user anna alone. What happens to it?',
    options: ['It is destroyed', 'It goes to her manager', 'It waits until she is back'],
    why: 'Nobody else may start a task that is for anna alone. Without a substitute, it waits.'
  },

  substitute: {
    name: 'Substitute',
    hook: 'Someone to stand in while you are away.',
    def: 'A **substitute** is a user who stands in for another. While Anna is absent, her substitute Ben can start the tasks that are for her alone.',
    show: {
      title: 'Standing in',
      set: 'Before her holiday, Anna names Ben as her substitute.',
      task: 'A task arrives for anna alone. Normally only she could start it.',
      ben: 'Anna is absent, so the substitution is active: Ben can start the task too.',
      back: 'When Anna is back, it ends. Her tasks are hers alone again.'
    },
    labels: { subst: 'Substitute: ben', forAnna: 'For anna', absent: 'Absent', back: 'Back at work' },
    myths: [
      { myth: 'A substitute gets the other user’s tasks for ever.', fact: 'A substitute for absences only steps in while the other user is absent. (A substitution can also be set to be permanent.)' },
      { myth: 'With a substitute, Anna’s tasks are taken away from her.', fact: 'Ben can start them too, that is all. When Anna is back, the substitution ends and her tasks are hers alone again.' },
      { myth: 'When someone is away, the engine picks a substitute by itself.', fact: 'Someone has to be named. Before her holiday, Anna names Ben as her substitute.' }
    ],
    q: 'Ben is Anna’s substitute for when she is absent. Today Anna is at work. Can Ben start a task that is for anna alone?',
    options: ['Yes, always', 'No: the substitution is only active while she is absent', 'Only if he has the role Manager'],
    why: 'A substitution for absences is active only while the user is absent.'
  }
};
