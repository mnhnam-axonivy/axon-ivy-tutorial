/**
 * The Workflow tree's puzzles: one per boss. A puzzle gives the player a brief, an empty
 * process and exactly the elements of the answer; the player places them, connects them and
 * sets their fields (src/puzzle/). Each boss's puzzle is built from the elements learned up to
 * its level. Here is each puzzle's answer; its words are in text/puzzles.<lang>.js.
 *
 *   elements  in the order of the story (every connector leads from an earlier element to a
 *             later one). kind: start, dialog (User Dialog), user (User Task), script, email
 *             (E-Mail), switch (Task Switch Event), gateway (Task Switch Gateway), alternative,
 *             split, join, end.
 *             by: who works there when the solved process runs (one of the cast, or 'system');
 *             role: the role whose task it is.
 *   fields    what the player sets on the element: { id, options, answer }. The first option
 *             is what the Designer has there (or `default`), and it is never the answer: every
 *             field asks for a decision. A field about one way out (a gateway's task, an
 *             Alternative's condition) has a `label` with a place for a name and `to`, the
 *             element that way leads to. A Split's `outN` belongs to its Nth connector, whichever
 *             path the player drew Nth: such a field has `nth` instead of `to`.
 *             An Alternative tries its rows in the order its exits were drawn: the exit the
 *             answer leaves empty (always true) has to be drawn last (src/puzzle/model.js checks).
 *   flow      the connectors of the answer.
 *   stories   only where an Alternative chooses: the cases the solved process shows, one per
 *             way out ({ texts, takes, by? }; `by` puts another of the cast on an element).
 *
 * Every fact a puzzle relies on was checked on Axon Ivy 14.0.1 (PROGRESS.md: "Elements for the
 * training, checked on the engine", "Workflow tree, checked on the engine", "Training: tasks,
 * checked on the engine", "Part 3, checked on the engine"): a new task is for Everybody; a task
 * for a role can be started by its users, and Employee is also Manager's and HR's parent; a
 * new exit of an Alternative has an empty condition, which is always true, and the first true
 * row is taken; a mail without a recipient fails with ivy:error:email; a delayed task is in
 * nobody's list until its time; an expiry hands the same task to its own Responsible and
 * Priority, which are Everybody and Normal unless set; a task for SYSTEM is started by the
 * engine; a Split gives only its first path the data (out1 ← in) unless told otherwise (also a
 * Split with no mapping at all, as the Designer saves a new one: probed again 2026-11-22), and a
 * Join waits for all its paths; a Task Switch Gateway creates a task per outgoing path and,
 * where paths meet, waits for all; CREATOR is the user who started the case; a Start's
 * Permission allows anonymous users until changed, and without a role every logged-in user.
 */
import { WHO } from './films/kit.js';

/** The people who work in a solved puzzle's run: the films' cast. */
export const cast = WHO;

const ROLES = ['everybody', 'employee', 'manager', 'hr'];
const MAIL_TO = ['empty', 'managerMail', 'requesterMail'];
const chain = ids => ids.slice(1).map((id, i) => [ids[i], id]);

export const puzzles = {
  // Level 1: a start, a form, one task for a role
  boss1: {
    file: 'LeaveRequest.p.json',
    elements: [
      { id: 'start', kind: 'start', by: 'anna' },
      { id: 'form', kind: 'dialog', by: 'anna' },
      { id: 'approve', kind: 'user', by: 'max', role: 'manager', fields: [{ id: 'responsible', options: ROLES, answer: 'manager' }] },
      { id: 'end', kind: 'end' }
    ],
    flow: chain(['start', 'form', 'approve', 'end'])
  },

  // Level 2: a decision and its two ways: an Alternative with a condition, an E-Mail for the no
  boss2: {
    file: 'LeaveRequest.p.json',
    elements: [
      { id: 'start', kind: 'start', by: 'anna' },
      { id: 'form', kind: 'dialog', by: 'anna' },
      { id: 'decide', kind: 'user', by: 'max', role: 'manager', fields: [{ id: 'responsible', options: ROLES, answer: 'manager' }] },
      { id: 'which', kind: 'alternative', fields: [{ id: 'toBook', label: 'condTo', to: 'book', options: ['empty', 'approved', 'days'], answer: 'approved' }] },
      { id: 'book', kind: 'script' },
      { id: 'booked', kind: 'end' },
      { id: 'mail', kind: 'email', fields: [{ id: 'mailTo', options: MAIL_TO, answer: 'requesterMail' }] },
      { id: 'told', kind: 'end' }
    ],
    flow: [['start', 'form'], ['form', 'decide'], ['decide', 'which'], ['which', 'book'], ['book', 'booked'], ['which', 'mail'], ['mail', 'told']],
    stories: [
      { texts: 'run', takes: { which: 'book' } },
      { texts: 'run2', takes: { which: 'mail' }, by: { start: 'ben', form: 'ben' } }
    ]
  },

  // Level 3: two approvals, a delay, an expiry, and the booking for SYSTEM
  boss3: {
    file: 'LeaveRequest.p.json',
    elements: [
      { id: 'start', kind: 'start', by: 'anna' },
      { id: 'form', kind: 'dialog', by: 'anna' },
      {
        id: 'manager', kind: 'user', by: 'max', role: 'manager',
        fields: [
          { id: 'responsible', options: ROLES, answer: 'manager' },
          { id: 'expiryTimeout', options: ['none', 'h2', 'd2'], answer: 'd2' },
          { id: 'expiryResponsible', options: ['everybody', 'manager', 'hr'], answer: 'hr' },
          { id: 'expiryPriority', options: ['low', 'normal', 'high'], default: 'normal', answer: 'high' }
        ]
      },
      {
        id: 'hr', kind: 'user', by: 'hanna', role: 'hr',
        fields: [
          { id: 'responsible', options: ROLES, answer: 'hr' },
          { id: 'delay', options: ['none', 'h1', 'd1'], answer: 'd1' }
        ]
      },
      { id: 'switch', kind: 'switch', by: 'system', fields: [{ id: 'responsible', options: ['everybody', 'hr', 'system'], answer: 'system' }] },
      { id: 'book', kind: 'script', by: 'system' },
      { id: 'end', kind: 'end' }
    ],
    flow: chain(['start', 'form', 'manager', 'hr', 'switch', 'book', 'end'])
  },

  // Level 4: two things side by side in one task: a Split, the data for its second path, a Join
  boss4: {
    file: 'LeaveRequest.p.json',
    elements: [
      { id: 'start', kind: 'start', by: 'anna' },
      { id: 'form', kind: 'dialog', by: 'anna' },
      { id: 'approve', kind: 'user', by: 'max', role: 'manager', fields: [{ id: 'responsible', options: ROLES, answer: 'manager' }] },
      { id: 'split', kind: 'split', fields: [{ id: 'out2', label: 'splitOut', nth: 2, options: ['empty', 'in'], answer: 'in' }] },
      { id: 'book', kind: 'script' },
      { id: 'mail', kind: 'email', fields: [{ id: 'mailTo', options: MAIL_TO, answer: 'requesterMail' }] },
      { id: 'join', kind: 'join' },
      { id: 'end', kind: 'end' }
    ],
    flow: [['start', 'form'], ['form', 'approve'], ['approve', 'split'], ['split', 'book'], ['split', 'mail'], ['book', 'join'], ['mail', 'join'], ['join', 'end']]
  },

  // Level 5: who may start, two tasks side by side, a gateway that waits, CREATOR
  boss5: {
    file: 'LeaveRequest.p.json',
    elements: [
      {
        id: 'start', kind: 'start', by: 'anna',
        fields: [
          { id: 'anonymous', options: ['on', 'off'], answer: 'off' },
          { id: 'role', options: ROLES, answer: 'employee' }
        ]
      },
      { id: 'form', kind: 'dialog', by: 'anna' },
      {
        id: 'split', kind: 'gateway',
        fields: [
          { id: 'toManager', label: 'taskTo', to: 'mcheck', options: ['everybody', 'manager', 'hr'], answer: 'manager' },
          { id: 'toHr', label: 'taskTo', to: 'hcheck', options: ['everybody', 'manager', 'hr'], answer: 'hr' }
        ]
      },
      { id: 'mcheck', kind: 'dialog', by: 'max', role: 'manager' },
      { id: 'hcheck', kind: 'dialog', by: 'hanna', role: 'hr' },
      { id: 'join', kind: 'gateway', fields: [{ id: 'responsible', options: ['everybody', 'system', 'creator'], answer: 'creator' }] },
      { id: 'confirm', kind: 'dialog', by: 'anna', role: 'creator' },
      { id: 'end', kind: 'end' }
    ],
    flow: [['start', 'form'], ['form', 'split'], ['split', 'mcheck'], ['split', 'hcheck'], ['mcheck', 'join'], ['hcheck', 'join'], ['join', 'confirm'], ['confirm', 'end']]
  }
};
