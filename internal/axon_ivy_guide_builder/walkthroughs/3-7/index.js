/**
 * Walkthrough 3.7 — Two paths at the same time
 * Plays tutorial/process/tutorial/part3/ParallelChecks.p.json.
 */
import process from '../../../../tutorial/process/tutorial/part3/ParallelChecks.p.json';
import dataClass from '../../../../tutorial/dataclass/tutorial/part3/ParallelChecksData.d.json';
import { tour } from './tour.js';
import { strings } from './text.js';

export default {
  id: '3.7',
  file: 'ParallelChecks.p.json',
  path: 'tutorial/process/tutorial/part3/ParallelChecks.p.json',
  dataClassPath: 'tutorial/dataclass/tutorial/part3/ParallelChecksData.d.json',
  process,
  dataClass,
  // what Run sends when the reader runs the process: the values of the start link
  params: { name: 'Anna Meier' },
  tour,
  strings
};
