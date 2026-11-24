/**
 * Walkthrough 2.4 — A first Script Step: run it and read the log
 * Plays tutorial/process/tutorial/part2/FirstScript.p.json.
 */
import process from '../../../../tutorial/process/tutorial/part2/FirstScript.p.json';
import dataClass from '../../../../tutorial/dataclass/tutorial/part2/FirstScriptData.d.json';
import { tour } from './tour.js';
import { strings } from './text.js';

export default {
  id: '2.4',
  file: 'FirstScript.p.json',
  path: 'tutorial/process/tutorial/part2/FirstScript.p.json',
  dataClassPath: 'tutorial/dataclass/tutorial/part2/FirstScriptData.d.json',
  process,
  dataClass,
  // what Run sends when the reader runs the process: the values of the start link
  params: { name: 'Anna' },
  tour,
  strings
};
