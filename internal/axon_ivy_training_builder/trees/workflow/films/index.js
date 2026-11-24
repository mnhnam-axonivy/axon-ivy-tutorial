/** Every film of the Workflow tree, by the id of its skill. */
import { films as core } from './core.js';
import { films as task1 } from './task1.js';
import { films as task2 } from './task2.js';
import { films as task3 } from './task3.js';
import { films as case1 } from './case1.js';
import { films as case2 } from './case2.js';
import { films as case3 } from './case3.js';
import { films as user1 } from './user1.js';
import { films as user2 } from './user2.js';
import { films as user3 } from './user3.js';
import { films as role1 } from './role1.js';
import { films as role2 } from './role2.js';
import { films as role3 } from './role3.js';
import { films as dialog } from './dialog.js';
import { films as flow } from './flow.js';
import { films as mail } from './mail.js';

export const films = { ...core, ...task1, ...task2, ...task3, ...case1, ...case2, ...case3, ...user1, ...user2, ...user3, ...role1, ...role2, ...role3, ...dialog, ...flow, ...mail };
