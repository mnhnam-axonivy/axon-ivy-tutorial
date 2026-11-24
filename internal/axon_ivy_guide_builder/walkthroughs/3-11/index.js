/**
 * Walkthrough 3.11 — One handler for the whole process
 * Plays tutorial/process/tutorial/part3/ImportOrders.p.json.
 */
import process from '../../../../tutorial/process/tutorial/part3/ImportOrders.p.json';
import dataClass from '../../../../tutorial/dataclass/tutorial/part3/ImportOrdersData.d.json';
import { tour } from './tour.js';
import { strings } from './text.js';

export default {
  id: '3.11',
  file: 'ImportOrders.p.json',
  path: 'tutorial/process/tutorial/part3/ImportOrders.p.json',
  dataClassPath: 'tutorial/dataclass/tutorial/part3/ImportOrdersData.d.json',
  process,
  dataClass,
  // what Run sends when the reader runs the process: the values of the start link
  params: { lines: '120' },
  tour,
  strings
};
