/**
 * Walkthrough 3.1 — Mapping values.
 * Plays tutorial/process/tutorial/part3/ScriptMapping.p.json.
 */
import process from '../../../../tutorial/process/tutorial/part3/ScriptMapping.p.json';
import dataClass from '../../../../tutorial/dataclass/tutorial/part3/ScriptMappingData.d.json';
import { tour } from './tour.js';
import { strings } from './text.js';

export default {
  id: '3.1',
  file: 'ScriptMapping.p.json',
  path: 'tutorial/process/tutorial/part3/ScriptMapping.p.json',
  dataClassPath: 'tutorial/dataclass/tutorial/part3/ScriptMappingData.d.json',
  process,
  dataClass,
  params: { customer: 'Muster AG', quantity: '3', unitPrice: '12.5' },
  tour,
  strings
};
