/**
 * Walkthrough 3.2 — Writing code.
 * Plays tutorial/process/tutorial/part3/ScriptCode.p.json.
 */
import process from '../../../../tutorial/process/tutorial/part3/ScriptCode.p.json';
import dataClass from '../../../../tutorial/dataclass/tutorial/part3/ScriptCodeData.d.json';
import { tour } from './tour.js';
import { strings } from './text.js';

export default {
  id: '3.2',
  file: 'ScriptCode.p.json',
  path: 'tutorial/process/tutorial/part3/ScriptCode.p.json',
  dataClassPath: 'tutorial/dataclass/tutorial/part3/ScriptCodeData.d.json',
  process,
  dataClass,
  params: { weight: '4', country: 'ch', express: 'false' },
  tour,
  strings
};
