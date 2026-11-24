/**
 * Preview of the guide without an Axon Ivy engine.
 *
 * It serves the real AxonIvyGuide.xhtml of the tutorial project, with its scripts, after
 * resolving the few JSF bits the engine would render: the scripts, the session language, the
 * element documents from the CMS and the CMS labels.
 *
 *   npm run preview              →  http://127.0.0.1:4320/
 *   …/?lang=ja                   start with the Japanese session language
 *   …/#/walkthrough/2.3          open a walkthrough at once
 */
import http from 'node:http';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseYaml } from '../runtime/model/yaml.js';

const here = dirname(fileURLToPath(import.meta.url));
const tutorial = resolve(here, '../../../tutorial');
const resources = join(tutorial, 'webContent/resources');
const cms = join(tutorial, 'cms');
const TYPES = { '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.html': 'text/html; charset=utf-8' };

const escapeHtml = text => String(text).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const read = file => readFileSync(file, 'utf8');

/** What GuideBean.getDocuments() returns: every file of cms/Files/Elements, by name and language. */
function documents() {
  const dir = join(cms, 'Files', 'Elements');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).map(file => /^(.+)_(\w\w)\.md$/.exec(file)).filter(Boolean)
    .map(m => ({ name: m[1], lang: m[2], text: read(join(dir, m[0])) }));
}

const labels = {};
function cmsLabel(path, lang) {
  if (!labels[lang]) labels[lang] = parseYaml(read(join(cms, 'cms_' + lang + '.yaml'))).value;
  let node = labels[lang];
  for (const key of path.split('/').filter(Boolean)) node = node && typeof node === 'object' ? node[key] : undefined;
  return typeof node === 'string' ? node : path.split('/').pop();
}

function guidePage(query) {
  const lang = query.get('lang') === 'ja' || query.get('lang') === 'jp' ? 'ja' : 'en';
  const xhtml = read(join(tutorial, 'dialog/tutorial/AxonIvyGuide/AxonIvyGuide.xhtml'));
  const open = '<ui:define name="content">';
  let body = xhtml.slice(xhtml.indexOf(open) + open.length, xhtml.lastIndexOf('</ui:define>'));
  const docs = documents().map(d => '<div data-doc="' + escapeHtml(d.name) + '" data-lang="' + d.lang + '">' + escapeHtml(d.text) + '</div>').join('\n');
  body = body
    .replace(/<h:outputScript\s+library="js"\s+name="([^"]+)"\s*\/>/g, '<script src="/resources/js/$1"></script>')
    .replace(/<ui:repeat value="#\{guideBean\.documents\}"[\s\S]*?<\/ui:repeat>/, docs)
    .replace(/#\{guideBean\.sessionLang\}/g, lang)
    .replace(/#\{ivy\.cms\.co\('([^']+)'\)\}/g, (m, key) => escapeHtml(cmsLabel(key, lang)));
  const leftover = body.match(/#\{[^}]*\}|<\/?(?:h|p|ui|f):[\w-]+/);
  if (leftover) console.warn('[preview] not resolved: ' + leftover[0]);
  return '<!DOCTYPE html>\n<html lang="' + lang + '"><head><meta charset="utf-8" />' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>' + escapeHtml(cmsLabel('/Dialogs/tutorial/AxonIvyGuide/PageTitle', lang)) + ' (preview)</title>' +
    // rough stand-in for the Freya theme the engine puts around the dialog
    '<style>body{margin:0;background:#f8f9fa;font:14px "Segoe UI",system-ui,sans-serif}#content{padding:24px 32px}</style></head>' +
    '<body class="body-hd"><div id="content" class="container frame full-width">' + body + '</div></body></html>';
}

function send(res, status, type, content) {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(content);
}

function handle(req, res) {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (url.pathname === '/') return send(res, 200, TYPES['.html'], guidePage(url.searchParams));
    if (url.pathname === '/favicon.ico') return send(res, 204, 'image/x-icon', '');
    if (url.pathname.startsWith('/resources/')) {
      const file = join(resources, normalize(decodeURIComponent(url.pathname.slice('/resources/'.length))));
      // inside that folder only (with the separator, so a sibling folder with a similar name does not count)
      if (file.startsWith(resources + sep) && existsSync(file)) return send(res, 200, TYPES[extname(file)] || 'application/octet-stream', readFileSync(file));
    }
    return send(res, 404, 'text/plain', 'Not found');
  } catch (e) {
    console.error(e);
    return send(res, 500, 'text/plain', 'Internal error');
  }
}

/** Starts the preview server; resolves with { url, close }. Port 0 picks a free port. */
export function start(port = 4320) {
  return new Promise((resolveStart, reject) => {
    const server = http.createServer(handle);
    server.on('error', reject);
    server.listen(port, '127.0.0.1', () => {
      resolveStart({ url: 'http://127.0.0.1:' + server.address().port + '/', close: () => new Promise(done => server.close(done)) });
    });
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { url } = await start(Number(process.env.PORT) || 4320);
  console.log('Axon Ivy Guide preview: ' + url);
}
