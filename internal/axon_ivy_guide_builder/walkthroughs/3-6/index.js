/**
 * Walkthrough 3.6 — Coming back together, and loops
 * Plays tutorial/process/tutorial/part3/MergeAndLoop.p.json.
 */
import process from '../../../../tutorial/process/tutorial/part3/MergeAndLoop.p.json';
import dataClass from '../../../../tutorial/dataclass/tutorial/part3/MergeAndLoopData.d.json';
import { tour } from './tour.js';
import { strings } from './text.js';

export default {
  id: '3.6',
  file: 'MergeAndLoop.p.json',
  path: 'tutorial/process/tutorial/part3/MergeAndLoop.p.json',
  dataClassPath: 'tutorial/dataclass/tutorial/part3/MergeAndLoopData.d.json',
  process,
  dataClass,
  // what Run sends when the reader runs the process: the values of the start link
  params: { invoice: 'INV-17', paidAfter: '2' },
  tour,
  strings
};
