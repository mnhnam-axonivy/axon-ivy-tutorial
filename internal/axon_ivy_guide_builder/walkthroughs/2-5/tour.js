/**
 * Walkthrough 2.5 — the chapters. Each starts from the process as the guide ships it; the
 * notes are in text.js (tour.<key>.title / .text). See runtime/ui/tour.js for the director `d`.
 */
const START = 'f0';
const END = 'f1';
const PARAMS = { day: '2026-12-01' };
const field = (id, key) => 'field:' + id + '.' + key;

/** Opens the Request tab of the Start with its Permission section unfolded. */
async function requestTab(d) {
  d.app.state.sections[START + ':permission'] = true;
  await d.open(START, 'request');
}

/** 1 — a Start that HTTP requests may start, and its link. */
async function link(d) {
  await d.open(START, 'request');
  await d.note('startPerHttp', { target: field(START, 'startPerHttp') });
  await d.note('link', { target: field(START, 'link') });
  await d.close();
}

/** 2 — how the start is listed: start list, name, description, category. */
async function listed(d) {
  await d.open(START, 'request');
  await d.note('startList', { target: field(START, 'startList') });
  await d.note('requestName', { target: field(START, 'requestName') });
  await d.note('requestDescription', { target: field(START, 'requestDescription') });
  await d.note('category', { target: field(START, 'category') });
  await d.close();
}

/** 3 — who may start it: anonymous users or not, and the role. */
async function permission(d) {
  await requestTab(d);
  await d.note('anonymousOff', { target: field(START, 'anonymous') });
  await d.note('roles', { target: field(START, 'roles') });
  await d.close();
}

/** 4 — the Process End Page ends the process and shows a page. */
async function endPage(d) {
  await d.run({
    params: PARAMS,
    on: { ['after:' + END]: () => d.note('pageShown', { target: 'page', extra: 600 }) }
  });
  await d.open(END, 'endPage');
  await d.note('pageField', { target: field(END, 'page') });
  await d.note('pageWhere', { target: field(END, 'page') });
  await d.close();
}

/** 5.1 — Anonymous, as a new start has it. */
async function anonymousOn(d) {
  const start = d.app.model.elements.find(e => e.id === START);
  d.app.changeElement(start, e => { e.config.permission = { ...(e.config.permission || {}), anonymous: true }; }, 'permission');
  await requestTab(d);
  await d.note('anonymousDefault', { target: field(START, 'anonymous') });
  await d.note('anonymousRisk', { target: field(START, 'anonymous') });
  await d.close();
  await d.note('anonymousFix');
}

/** 5.2 — a static end page cannot show the data of the case. */
async function dataOnPage(d) {
  await d.run({
    params: PARAMS,
    fast: true,
    on: { ['after:' + END]: () => d.note('pageNoData', { target: 'page', extra: 400 }) }
  });
  await d.note('pageFix');
}

export const tour = {
  chapters: [
    { id: 'link', play: link },
    { id: 'listed', play: listed },
    { id: 'permission', play: permission },
    { id: 'endPage', play: endPage },
    { id: 'mistakes', label: 'mistake', parts: [{ id: 'anonymousOn', play: anonymousOn }, { id: 'dataOnPage', play: dataOnPage }] }
  ]
};
