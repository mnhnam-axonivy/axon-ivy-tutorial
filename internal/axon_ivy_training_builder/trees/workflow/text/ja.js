/** The Workflow tree's texts in ja: the page, the films' shared labels, every skill, and the puzzles. */
import { ui, film, nodes as core } from './core.ja.js';
import task1 from './task1.ja.js';
import task2 from './task2.ja.js';
import task3 from './task3.ja.js';
import case1 from './case1.ja.js';
import case2 from './case2.ja.js';
import case3 from './case3.ja.js';
import user1 from './user1.ja.js';
import user2 from './user2.ja.js';
import user3 from './user3.ja.js';
import role1 from './role1.ja.js';
import role2 from './role2.ja.js';
import role3 from './role3.ja.js';
import dialog from './dialog.ja.js';
import flow from './flow.ja.js';
import mail from './mail.ja.js';
import { puzzle, puzzles } from './puzzles.ja.js';

export default { ui, film, nodes: { ...core, ...task1, ...task2, ...task3, ...case1, ...case2, ...case3, ...user1, ...user2, ...user3, ...role1, ...role2, ...role3, ...dialog, ...flow, ...mail }, puzzle, puzzles };
