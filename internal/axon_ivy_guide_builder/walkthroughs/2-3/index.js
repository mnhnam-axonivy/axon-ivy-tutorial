/**
 * Walkthrough 2.3 — Starting a process with parameters.
 * Plays tutorial/process/tutorial/part2/StartWithParameters.p.json.
 */
import process from '../../../../tutorial/process/tutorial/part2/StartWithParameters.p.json';
import dataClass from '../../../../tutorial/dataclass/tutorial/part2/StartWithParametersData.d.json';
import { tour } from './tour.js';
import { strings } from './text.js';

export default {
  id: '2.3',
  file: 'StartWithParameters.p.json',
  path: 'tutorial/process/tutorial/part2/StartWithParameters.p.json',
  dataClassPath: 'tutorial/dataclass/tutorial/part2/StartWithParametersData.d.json',
  process,
  dataClass,
  // what Run sends when the reader runs the process: the values of the start link
  params: { room: 'Matterhorn', people: '4' },
  tour,
  strings
};
