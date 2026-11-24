/**
 * Lays a tree out as branches side by side, in levels, with a boss after each level.
 *
 *   buildTree({ id, branches, levels, root, skills, bosses, … }) → the tree src/skilltree.js draws
 *
 *   branches  [{ id, emoji, color }]         one column each, left to right
 *   levels    how many levels there are (their names are texts: ui.level1, ui.level2, …)
 *   root      { id, emoji, answer }          the one skill everything starts from
 *   skills    [{ id, emoji, branch, level, answer, requires? }]
 *             in the order they are learned inside their branch
 *   bosses    [{ id, emoji, level, answer }] one per level
 *
 * What a skill needs is worked out from where it is: the first skill of a branch needs the
 * root (level 1) or the boss of the level before; every other skill needs the one above it in
 * its branch; a boss needs the last skill of every branch of its level. A skill can add more
 * with `requires`. Every node gets its place on the map (col, row; span for the root and the
 * bosses, which sit across all columns) and the map gets a heading row per level.
 */
export function buildTree(def) {
  const { branches, levels, root, skills, bosses } = def;
  const colOf = new Map(branches.map((b, i) => [b.id, i]));
  const colors = Object.fromEntries(branches.map(b => [b.id, b.color]));
  colors.root = def.rootColor || 'var(--c-violet)';
  colors.boss = def.bossColor || 'var(--c-violet)';

  const nodes = [];
  const headings = [];
  let row = 0;
  nodes.push({ ...root, branch: 'root', level: 0, col: 0, row: row++, span: true, requires: [] });
  let gate = root.id; // what the first skill of each branch needs
  for (let level = 1; level <= levels; level++) {
    headings.push({ level, row: row++ });
    const top = row;
    let depth = 0;
    const last = [];
    for (const branch of branches) {
      const mine = skills.filter(s => s.branch === branch.id && s.level === level);
      mine.forEach((s, i) => {
        nodes.push({ ...s, col: colOf.get(branch.id), row: top + i, requires: [...new Set([i ? mine[i - 1].id : gate, ...(s.requires || [])])] });
      });
      depth = Math.max(depth, mine.length);
      if (mine.length) last.push(mine[mine.length - 1].id);
    }
    row = top + depth;
    const boss = bosses.find(b => b.level === level);
    if (boss) {
      nodes.push({ ...boss, branch: 'boss', col: 0, row: row++, span: true, requires: last });
      gate = boss.id;
    }
  }
  // a skill may only need skills that come before it on the map
  nodes.sort((a, b) => a.row - b.row || a.col - b.col);
  return { ...def, nodes, headings, rows: row, colors };
}
