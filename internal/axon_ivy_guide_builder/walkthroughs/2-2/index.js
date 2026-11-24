/**
 * Walkthrough 2.2 — Data classes and process data
 * Plays tutorial/process/tutorial/part2/DataClasses.p.json.
 */
import process from '../../../../tutorial/process/tutorial/part2/DataClasses.p.json';
import dataClass from '../../../../tutorial/dataclass/tutorial/part2/DataClassesData.d.json';
import { tour } from './tour.js';
import { strings } from './text.js';

export default {
  id: '2.2',
  file: 'DataClasses.p.json',
  path: 'tutorial/process/tutorial/part2/DataClasses.p.json',
  dataClassPath: 'tutorial/dataclass/tutorial/part2/DataClassesData.d.json',
  process,
  dataClass,
  // what Run sends when the reader runs the process: the values of the start link
  params: { employeeId: '00731', days: '5' },
  tour,
  strings
};
