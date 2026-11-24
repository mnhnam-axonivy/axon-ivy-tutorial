/**
 * The Workflow tree: how Axon Ivy gives work to people, in four branches (Task, Case, User,
 * Role) and three levels. Its skills (nodes.js), their films (films/), the bosses' puzzles
 * (puzzles.js) and texts in English and Japanese (text/); src/layout.js puts them on the map.
 */
import { buildTree } from '../../src/layout.js';
import { LEVELS, branches, root, skills, bosses } from './nodes.js';
import { films } from './films/index.js';
import { puzzles, cast } from './puzzles.js';
import en from './text/en.js';
import ja from './text/ja.js';

export default buildTree({
  id: 'workflow',
  branches,
  levels: LEVELS,
  root,
  skills: skills.filter(s => s.level <= LEVELS),
  bosses: bosses.filter(b => b.level <= LEVELS),
  films,
  puzzles: Object.fromEntries(Object.entries(puzzles).filter(([id]) => bosses.some(b => b.id === id && b.level <= LEVELS))),
  cast,
  texts: { en, ja }
});
