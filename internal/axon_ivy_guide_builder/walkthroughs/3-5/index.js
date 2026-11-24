/**
 * Walkthrough 3.5 — Several conditions
 * Plays tutorial/process/tutorial/part3/SeveralConditions.p.json.
 */
import process from '../../../../tutorial/process/tutorial/part3/SeveralConditions.p.json';
import dataClass from '../../../../tutorial/dataclass/tutorial/part3/SeveralConditionsData.d.json';
import { tour } from './tour.js';
import { strings } from './text.js';

export default {
  id: '3.5',
  file: 'SeveralConditions.p.json',
  path: 'tutorial/process/tutorial/part3/SeveralConditions.p.json',
  dataClassPath: 'tutorial/dataclass/tutorial/part3/SeveralConditionsData.d.json',
  process,
  dataClass,
  // what Run sends when the reader runs the process: the values of the start link
  params: { weight: '12' },
  tour,
  strings
};
