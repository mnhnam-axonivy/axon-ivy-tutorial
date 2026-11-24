/**
 * What the films of the Workflow tree share. The same people play in every film: Anna asks for
 * leave, Max is her manager, Lea is another manager, Hanna, Ben and Chloé work in HR (they are
 * the test users of the training project too: config/users.yaml). A film is a few scenes, one
 * per subtitle; a scene starts at its beat and its moves are timed from there.
 */
import { P } from '../../../src/cast.js';

export const WHO = {
  anna: { shirt: P.red, hair: P.hair2, long: true },
  max: { shirt: P.blue, hair: P.hair },
  hanna: { shirt: P.teal, hair: P.hair3, long: true },
  ben: { shirt: P.gold, hair: P.hair },
  chloe: { shirt: P.violet, hair: P.hair, long: true },
  lea: { shirt: P.pink, hair: P.hair2, long: true },
  developer: { shirt: P.muted, hair: P.hair },
  guest: { shirt: P.soft, hair: P.muted, skin: P.soft }
};
export const FILL = { open: P.sky, inProgress: P.gold, done: P.greenLight, delayed: P.soft, destroyed: P.muted, high: P.red, normal: P.sky, low: P.soft };

/** A person of the cast; the name stays 16 px whatever the scale. `name` replaces the cast's name. */
export const who = (k, parent, id, x, y, s = 1, name) => k.C.person(parent, x, y, { ...WHO[id], name: name ?? k.f(id), s, nameSize: 16 / s });

/** A task card's chip to the given state or priority (a tick when done). */
export const chip = (k, card, key, at) => {
  k.tl.set(card.chip, { text: k.f(key), fill: FILL[key] }, at);
  k.C.pulse(card.chip, at, 1.2, 0.4);
  if (key === 'done') k.tl.to(card.tick, { o: 1 }, at, 0.2, 'linear');
};

/** Start times of the scenes: the first, then each after the length of the one before. */
export const beats = (start, ...lengths) => lengths.reduce((all, len) => [...all, all[all.length - 1] + len], [start]);

/** A group to fade a whole scene in or out with. */
export const scene = (k, props = { o: 1 }) => k.C.group(k.root, 0, 0, props);
