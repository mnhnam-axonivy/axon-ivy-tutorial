/**
 * Walkthrough 2.1 — A process and its elements
 * Plays tutorial/process/tutorial/part2/ProcessElements.p.json.
 */
import process from '../../../../tutorial/process/tutorial/part2/ProcessElements.p.json';
import dataClass from '../../../../tutorial/dataclass/tutorial/part2/ProcessElementsData.d.json';
import { tour } from './tour.js';
import { strings } from './text.js';

export default {
  id: '2.1',
  file: 'ProcessElements.p.json',
  path: 'tutorial/process/tutorial/part2/ProcessElements.p.json',
  dataClassPath: 'tutorial/dataclass/tutorial/part2/ProcessElementsData.d.json',
  process,
  dataClass,
  // what Run sends when the reader runs the process: the values of the start link
  params: { amount: '80' },
  tour,
  strings
};
