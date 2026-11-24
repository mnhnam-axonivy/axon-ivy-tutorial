/**
 * Walkthrough 2.5 — Who may start it and how it is listed
 * Plays tutorial/process/tutorial/part2/StartList.p.json.
 */
import process from '../../../../tutorial/process/tutorial/part2/StartList.p.json';
import dataClass from '../../../../tutorial/dataclass/tutorial/part2/StartListData.d.json';
import parkingBooked from '../../../../tutorial/webContent/view/tutorial/part2/parking-booked.html';
import { tour } from './tour.js';
import { strings } from './text.js';

export default {
  id: '2.5',
  file: 'StartList.p.json',
  path: 'tutorial/process/tutorial/part2/StartList.p.json',
  dataClassPath: 'tutorial/dataclass/tutorial/part2/StartListData.d.json',
  process,
  dataClass,
  // what Run sends when the reader runs the process: the values of the start link
  params: { day: '2026-12-01' },
  // the end page of the Process End Page, shown as it is
  pages: { 'view/tutorial/part2/parking-booked.html': parkingBooked },
  tour,
  strings
};
