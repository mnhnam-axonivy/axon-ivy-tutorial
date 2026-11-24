/**
 * Walkthrough 3.8 — Calling a sub process
 * Plays tutorial/process/tutorial/part3/OrderWithShipping.p.json, which calls the callable sub
 * process tutorial/process/tutorial/part3/ShippingCost.p.json.
 */
import process from '../../../../tutorial/process/tutorial/part3/OrderWithShipping.p.json';
import dataClass from '../../../../tutorial/dataclass/tutorial/part3/OrderWithShippingData.d.json';
import subProcess from '../../../../tutorial/process/tutorial/part3/ShippingCost.p.json';
import subDataClass from '../../../../tutorial/dataclass/tutorial/part3/ShippingCostData.d.json';
import { tour } from './tour.js';
import { strings } from './text.js';

export default {
  id: '3.8',
  file: 'OrderWithShipping.p.json',
  path: 'tutorial/process/tutorial/part3/OrderWithShipping.p.json',
  dataClassPath: 'tutorial/dataclass/tutorial/part3/OrderWithShippingData.d.json',
  process,
  dataClass,
  // the process the Call Sub calls, with its own data class
  subProcesses: [{ process: subProcess, dataClass: subDataClass, file: 'ShippingCost.p.json', path: 'tutorial/process/tutorial/part3/ShippingCost.p.json' }],
  // what Run sends when the reader runs the process: the values of the start link
  params: { item: 'Lamp', weight: '4', country: 'DE' },
  tour,
  strings
};
