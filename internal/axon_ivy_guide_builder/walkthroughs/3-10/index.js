/**
 * Walkthrough 3.10 — Throwing and catching an error
 * Plays tutorial/process/tutorial/part3/BookRoom.p.json, which calls the callable sub process
 * tutorial/process/tutorial/part3/ReserveRoom.p.json.
 */
import process from '../../../../tutorial/process/tutorial/part3/BookRoom.p.json';
import dataClass from '../../../../tutorial/dataclass/tutorial/part3/BookRoomData.d.json';
import subProcess from '../../../../tutorial/process/tutorial/part3/ReserveRoom.p.json';
import subDataClass from '../../../../tutorial/dataclass/tutorial/part3/ReserveRoomData.d.json';
import { tour } from './tour.js';
import { strings } from './text.js';

export default {
  id: '3.10',
  file: 'BookRoom.p.json',
  path: 'tutorial/process/tutorial/part3/BookRoom.p.json',
  dataClassPath: 'tutorial/dataclass/tutorial/part3/BookRoomData.d.json',
  process,
  dataClass,
  // the process the Call Sub calls, with its own data class
  subProcesses: [{ process: subProcess, dataClass: subDataClass, file: 'ReserveRoom.p.json', path: 'tutorial/process/tutorial/part3/ReserveRoom.p.json' }],
  // what Run sends when the reader runs the process: the values of the start link
  params: { room: 'Matterhorn', people: '4' },
  tour,
  strings
};
