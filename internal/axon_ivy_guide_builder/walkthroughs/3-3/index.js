/**
 * Walkthrough 3.3 — Mapping first, then code.
 * Plays tutorial/process/tutorial/part3/MappingThenCode.p.json.
 */
import process from '../../../../tutorial/process/tutorial/part3/MappingThenCode.p.json';
import dataClass from '../../../../tutorial/dataclass/tutorial/part3/MappingThenCodeData.d.json';
import { tour } from './tour.js';
import { strings } from './text.js';

export default {
  id: '3.3',
  file: 'MappingThenCode.p.json',
  path: 'tutorial/process/tutorial/part3/MappingThenCode.p.json',
  dataClassPath: 'tutorial/dataclass/tutorial/part3/MappingThenCodeData.d.json',
  process,
  dataClass,
  params: { customer: 'Muster AG', total: '1500' },
  tour,
  strings
};
