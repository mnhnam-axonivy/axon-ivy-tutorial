/**
 * Walkthrough 3.9 — Folding part of a process into a box
 * Plays tutorial/process/tutorial/part3/FoldedSteps.p.json.
 */
import process from '../../../../tutorial/process/tutorial/part3/FoldedSteps.p.json';
import dataClass from '../../../../tutorial/dataclass/tutorial/part3/FoldedStepsData.d.json';
import { tour } from './tour.js';
import { strings } from './text.js';

export default {
  id: '3.9',
  file: 'FoldedSteps.p.json',
  path: 'tutorial/process/tutorial/part3/FoldedSteps.p.json',
  dataClassPath: 'tutorial/dataclass/tutorial/part3/FoldedStepsData.d.json',
  process,
  dataClass,
  // what Run sends when the reader runs the process: the values of the start link
  params: { item: 'chairs', quantity: '6' },
  tour,
  strings
};
