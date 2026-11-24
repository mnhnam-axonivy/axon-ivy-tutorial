/**
 * Preview of the training page without an Axon Ivy engine.
 *
 * It serves the real AxonIvyTraining.xhtml of the training project, with its script, after
 * resolving the few JSF bits the engine would render: the script, the session language and
 * the CMS labels.
 *
 *   npm run preview              →  http://127.0.0.1:4330/
 *   …/?lang=ja                   with the Japanese session language
 *   …/#task                      open a skill at once
 */
import http from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const training = resolve(here, '../../../training');
const resources = join(training, 'webContent/resources');
const TYPES = { '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.html': 'text/html; charset=utf-8' };

const escapeHtml = text => String(text).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const read = file => readFileSync(file, 'utf8');

/** A CMS label from cms_<lang>.yaml (nested maps of strings, indented by two spaces). */
function cmsLabel(path, lang) {
  const lines = read(join(training, 'cms', 'cms_' + lang + '.yaml')).split(/\r?\n/);
  const keys = path.split('/').filter(Boolean);
  let depth = 0;
  for (const line of lines) {
    const m = /^( *)([^:#]+):\s*(.*)$/.exec(line);
    if (!m || m[1].length !== depth * 2 || m[2].trim() !== keys[depth]) continue;
    if (depth === keys.length - 1) return m[3].trim();
    depth++;
  }
  return keys[keys.length - 1];
}

function trainingPage(query) {
  const lang = query.get('lang') === 'ja' ? 'ja' : 'en';
  const xhtml = read(join(training, 'dialog/training/AxonIvyTraining/AxonIvyTraining.xhtml'));
  const open = '<ui:define name="content">';
  let body = xhtml.slice(xhtml.indexOf(open) + open.length, xhtml.lastIndexOf('</ui:define>'));
  body = body
    .replace(/<h:outputScript\s+library="js"\s+name="([^"]+)"\s*\/>/g, '<script src="/resources/js/$1"></script>')
    .replace(/#\{ivy\.session\.contentLocale\.language\}/g, lang);
  const leftover = body.match(/#\{[^}]*\}|<\/?(?:h|p|ui|f):[\w-]+/);
  if (leftover) console.warn('[preview] not resolved: ' + leftover[0]);
  const title = escapeHtml(cmsLabel('/Dialogs/training/AxonIvyTraining/PageTitle', lang));
  return '<!DOCTYPE html>\n<html lang="' + lang + '"><head><meta charset="utf-8" />' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>' + title + ' (preview)</title>' +
    // rough stand-in for the Freya theme the engine puts around the dialog
    '<style>body{margin:0;background:#f8f9fa;font:14px "Segoe UI",system-ui,sans-serif}#content{padding:16px}</style></head>' +
    '<body class="body-hd"><div id="content" class="container frame full-width">' + body + '</div></body></html>';
}

function send(res, status, type, content) {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(content);
}

function handle(req, res) {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (url.pathname === '/') return send(res, 200, TYPES['.html'], trainingPage(url.searchParams));
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
export function start(port = 4330) {
  return new Promise((resolveStart, reject) => {
    const server = http.createServer(handle);
    server.on('error', reject);
    server.listen(port, '127.0.0.1', () => {
      resolveStart({ url: 'http://127.0.0.1:' + server.address().port + '/', close: () => new Promise(done => server.close(done)) });
    });
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { url } = await start(Number(process.env.PORT) || 4330);
  console.log('Axon Ivy Training preview: ' + url);
}
