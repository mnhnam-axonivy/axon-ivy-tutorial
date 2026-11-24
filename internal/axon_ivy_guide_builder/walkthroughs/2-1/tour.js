/**
 * Walkthrough 2.1 — the chapters. Each starts from the process as the guide ships it; the
 * notes are in text.js (tour.<key>.title / .text). See runtime/ui/tour.js for the director `d`.
 */
const START = 'f0';
const PRICE = 'f3';
const CONFIRM = 'f5';
const END = 'f1';
const PARAMS = { amount: '80' };
const field = (id, key) => 'field:' + id + '.' + key;

/** 1 — starts, activities, ends, and the connectors the token follows. */
async function elements(d) {
  await d.note('start', { target: 'el:' + START });
  await d.note('activity', { target: 'el:' + PRICE });
  await d.note('processEnd', { target: 'el:' + END });
  await d.run({
    params: PARAMS,
    on: { ['enter:' + CONFIRM]: () => d.note('token', { target: 'el:' + CONFIRM }) }
  });
}

/** 2 — the inscription view shows one element; its tabs depend on the type. */
async function inscription(d) {
  await d.open(PRICE, 'general');
  await d.note('inscription', { target: field(PRICE, 'tabs') });
  await d.open(START, 'general');
  await d.note('otherTabs', { target: field(START, 'tabs') });
  await d.close();
}

/** 3 — the General tab: name, description, means and documents, tags. */
async function general(d) {
  await d.open(PRICE, 'general');
  await d.note('name', { target: field(PRICE, 'name') });
  d.focus(field(PRICE, 'name'));
  await d.wait(300);
  await d.edit(PRICE + '.name', 'Add the shipping cost');
  await d.note('nameCanvas', { target: 'el:' + PRICE });
  await d.note('description', { target: field(PRICE, 'description') });
  await d.close();
  await d.tooltip(PRICE);
  await d.note('tooltip', { target: 'tooltip' });
  await d.tooltip(null);
  await d.open(PRICE, 'general');
  await d.note('docs', { target: field(PRICE, 'docs') });
  await d.note('tags', { target: field(PRICE, 'tags') });
  await d.close();
}

/** 4 — the process itself, and the four kinds of process. */
async function kinds(d) {
  await d.open('process', 'general');
  await d.note('processItself', { target: field('process', 'tabs') });
  await d.note('displayName', { target: field('process', 'displayName') });
  await d.open('process', 'processData');
  await d.note('dataClass', { target: field('process', 'dataClass') });
  await d.open('process', 'permissions');
  await d.note('viewer', { target: field('process', 'viewer') });
  await d.close();
  await d.note('kinds');
  await d.note('otherKinds');
}

/** 5.1 — an element without a name. */
async function noName(d) {
  await d.open(CONFIRM, 'general');
  d.focus(field(CONFIRM, 'name'));
  await d.wait(300);
  await d.edit(CONFIRM + '.name', '');
  await d.note('noNameCanvas', { target: 'el:' + CONFIRM });
  await d.close();
  await d.note('noNameFix');
}

/** 5.2 — changing the data class of a process. */
async function dataClassChange(d) {
  await d.open('process', 'processData');
  await d.note('changeWarning', { target: field('process', 'dataClassMessage'), extra: 800 });
  await d.close();
  await d.note('changeFix');
}

export const tour = {
  chapters: [
    { id: 'elements', play: elements },
    { id: 'inscription', play: inscription },
    { id: 'general', play: general },
    { id: 'kinds', play: kinds },
    { id: 'mistakes', label: 'mistake', parts: [{ id: 'noName', play: noName }, { id: 'dataClassChange', play: dataClassChange }] }
  ]
};
