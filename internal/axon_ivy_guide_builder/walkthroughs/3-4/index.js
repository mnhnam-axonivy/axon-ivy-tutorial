/**
 * Walkthrough 3.4 — Two paths, one condition
 * Plays tutorial/process/tutorial/part3/TwoPaths.p.json.
 */
import process from '../../../../tutorial/process/tutorial/part3/TwoPaths.p.json';
import dataClass from '../../../../tutorial/dataclass/tutorial/part3/TwoPathsData.d.json';
import { tour } from './tour.js';
import { strings } from './text.js';

export default {
  id: '3.4',
  file: 'TwoPaths.p.json',
  path: 'tutorial/process/tutorial/part3/TwoPaths.p.json',
  dataClassPath: 'tutorial/dataclass/tutorial/part3/TwoPathsData.d.json',
  process,
  dataClass,
  // what Run sends when the reader runs the process: the values of the start link
  params: { employee: 'Anna', amount: '120', urgent: 'false' },
  tour,
  strings
};
