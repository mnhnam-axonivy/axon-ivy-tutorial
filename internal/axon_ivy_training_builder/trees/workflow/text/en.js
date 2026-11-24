/** The Workflow tree's texts in en: the page, the films' shared labels, every skill, and the puzzles. */
import { ui, film, nodes as core } from './core.en.js';
import task1 from './task1.en.js';
import task2 from './task2.en.js';
import task3 from './task3.en.js';
import case1 from './case1.en.js';
import case2 from './case2.en.js';
import case3 from './case3.en.js';
import user1 from './user1.en.js';
import user2 from './user2.en.js';
import user3 from './user3.en.js';
import role1 from './role1.en.js';
import role2 from './role2.en.js';
import role3 from './role3.en.js';
import dialog from './dialog.en.js';
import flow from './flow.en.js';
import mail from './mail.en.js';
import { puzzle, puzzles } from './puzzles.en.js';

export default { ui, film, nodes: { ...core, ...task1, ...task2, ...task3, ...case1, ...case2, ...case3, ...user1, ...user2, ...user3, ...role1, ...role2, ...role3, ...dialog, ...flow, ...mail }, puzzle, puzzles };
