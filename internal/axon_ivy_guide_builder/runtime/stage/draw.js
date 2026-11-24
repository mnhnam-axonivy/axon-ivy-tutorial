/**
 * Canvas-2D painters for everything on the process canvas. Every painter expects the context
 * to be scaled so that one unit is one process pixel.
 */
import { theme } from '../theme.js';
import { layoutElement, labelFont } from './layout.js';

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.arcTo(x + w, y, x + w, y + rr, rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.arcTo(x + w, y + h, x + w - rr, y + h, rr);
  ctx.lineTo(x + rr, y + h);
  ctx.arcTo(x, y + h, x, y + h - rr, rr);
  ctx.lineTo(x, y + rr);
  ctx.arcTo(x, y, x + rr, y, rr);
  ctx.closePath();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

/**
 * @typedef {Object} ElementState
 * @property {boolean} [selected]
 * @property {boolean} [hover]
 * @property {number}  [executed]   how often the element ran
 * @property {boolean} [active]     the element the token is on / reached last
 * @property {boolean} [error]
 * @property {boolean} [breakpoint]
 * @property {string[]} [ghostLabel] shown when the element has been removed ("slot")
 */

function strokeColor(el, state) {
  if (state.error) return theme.error;
  if (state.selected) return theme.selection;
  if (state.active) return theme.active;
  if (state.executed) return theme.executed;
  return el.color || theme.elementStroke;
}

function glow(ctx, state) {
  if (state.error) { ctx.shadowColor = theme.error; ctx.shadowBlur = 9; }
  else if (state.active && !state.selected) { ctx.shadowColor = theme.active; ctx.shadowBlur = 9; }
}

function drawLabel(ctx, layout, align, color) {
  ctx.font = labelFont();
  ctx.fillStyle = color || theme.label;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  layout.lines.forEach((text, i) => {
    ctx.fillText(text, layout.textX, layout.textY + theme.lineHeight * (i + 0.5) + 0.5);
  });
}

// ── Icons ────────────────────────────────────────────────────────────────────

function iconBox(ctx, icon, color) {
  roundRect(ctx, icon.x, icon.y, icon.size, icon.size, 4);
  ctx.fillStyle = color;
  ctx.fill();
}

/** Script step: a sheet of paper with braces. */
function scriptIcon(ctx, icon) {
  iconBox(ctx, icon, theme.scriptIconBg);
  const cx = icon.x + icon.size / 2;
  const cy = icon.y + icon.size / 2;
  ctx.strokeStyle = theme.scriptIcon;
  ctx.lineWidth = 1.3;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - 5.5, cy - 8);
  ctx.lineTo(cx + 1.5, cy - 8);
  ctx.lineTo(cx + 5.5, cy - 4);
  ctx.lineTo(cx + 5.5, cy + 8);
  ctx.lineTo(cx - 5.5, cy + 8);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 1.5, cy - 8);
  ctx.lineTo(cx + 1.5, cy - 4);
  ctx.lineTo(cx + 5.5, cy - 4);
  ctx.stroke();
  ctx.font = 'bold 7px ' + theme.font;
  ctx.fillStyle = theme.scriptIcon;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('{ }', cx, cy + 2.5);
}

function genericIcon(ctx, icon) {
  iconBox(ctx, icon, theme.scriptIconBg);
  const cx = icon.x + icon.size / 2;
  const cy = icon.y + icon.size / 2;
  ctx.strokeStyle = theme.scriptIcon;
  ctx.lineWidth = 1.3;
  roundRect(ctx, cx - 7, cy - 6, 14, 12, 2);
  ctx.stroke();
}

/** Call Sub: a box with an arrow going into it. */
function callIcon(ctx, icon) {
  iconBox(ctx, icon, theme.scriptIconBg);
  const cx = icon.x + icon.size / 2;
  const cy = icon.y + icon.size / 2;
  ctx.strokeStyle = theme.scriptIcon;
  ctx.lineWidth = 1.3;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  roundRect(ctx, cx - 2, cy - 6, 9, 12, 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy);
  ctx.lineTo(cx + 2.5, cy);
  ctx.moveTo(cx - 0.5, cy - 3);
  ctx.lineTo(cx + 2.5, cy);
  ctx.lineTo(cx - 0.5, cy + 3);
  ctx.stroke();
}

/** The mark of an Embedded Subprocess or a BPMN activity, by type: what the box stands for. */
function boxIcon(ctx, icon, type) {
  iconBox(ctx, icon, theme.scriptIconBg);
  const cx = icon.x + icon.size / 2;
  const cy = icon.y + icon.size / 2;
  ctx.strokeStyle = theme.scriptIcon;
  ctx.fillStyle = theme.scriptIcon;
  ctx.lineWidth = 1.3;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  switch (type) {
    case 'UserBpmnElement': // a person
      circle(ctx, cx, cy - 3.5, 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy + 7, 6.5, Math.PI * 1.08, Math.PI * 1.92);
      ctx.stroke();
      return;
    case 'ManualBpmnElement': // a hand: four fingers
      for (let i = 0; i < 4; i++) { ctx.moveTo(cx - 4.5 + i * 3, cy - 6 + (i === 0 ? 3 : 0)); ctx.lineTo(cx - 4.5 + i * 3, cy + 2); }
      ctx.moveTo(cx - 6, cy + 2); ctx.quadraticCurveTo(cx, cy + 9, cx + 6, cy + 2);
      ctx.stroke();
      return;
    case 'ScriptBpmnElement': // a page of script
      ctx.moveTo(cx - 5, cy - 7); ctx.lineTo(cx + 5, cy - 7); ctx.lineTo(cx + 5, cy + 7); ctx.lineTo(cx - 5, cy + 7); ctx.closePath();
      ctx.moveTo(cx - 3, cy - 3); ctx.lineTo(cx + 3, cy - 3);
      ctx.moveTo(cx - 3, cy); ctx.lineTo(cx + 3, cy);
      ctx.moveTo(cx - 3, cy + 3); ctx.lineTo(cx + 1, cy + 3);
      ctx.stroke();
      return;
    case 'ReceiveBpmnElement': // an open envelope
    case 'SendBpmnElement': // a closed, filled envelope
      ctx.rect(cx - 7, cy - 5, 14, 10);
      if (type === 'SendBpmnElement') ctx.fill(); else ctx.stroke();
      ctx.beginPath();
      ctx.strokeStyle = type === 'SendBpmnElement' ? theme.scriptIconBg : theme.scriptIcon;
      ctx.moveTo(cx - 7, cy - 5); ctx.lineTo(cx, cy + 1); ctx.lineTo(cx + 7, cy - 5);
      ctx.stroke();
      return;
    case 'RuleBpmnElement': // a table
      ctx.rect(cx - 7, cy - 6, 14, 12);
      ctx.moveTo(cx - 7, cy - 2); ctx.lineTo(cx + 7, cy - 2);
      ctx.moveTo(cx - 7, cy + 2); ctx.lineTo(cx + 7, cy + 2);
      ctx.moveTo(cx - 2, cy - 6); ctx.lineTo(cx - 2, cy + 6);
      ctx.stroke();
      return;
    case 'ServiceBpmnElement': // a gear
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI / 4) * i;
        ctx.moveTo(cx + Math.cos(a) * 4.5, cy + Math.sin(a) * 4.5);
        ctx.lineTo(cx + Math.cos(a) * 7, cy + Math.sin(a) * 7);
      }
      ctx.stroke();
      ctx.beginPath();
      circle(ctx, cx, cy, 4.5);
      ctx.stroke();
      return;
    default: // Embedded Subprocess, Generic: two boxes, one inside the other
      roundRect(ctx, cx - 7, cy - 6, 14, 12, 2);
      ctx.stroke();
      ctx.beginPath();
      roundRect(ctx, cx - 3, cy - 2, 6, 5, 1);
      ctx.stroke();
  }
}

/** The marker of a box that holds a process of its own: a small square with + at the bottom. */
function collapsedMarker(ctx, b, color) {
  const size = 10;
  const x = b.x + b.w / 2 - size / 2;
  const y = b.y + b.h - size - 2;
  ctx.lineWidth = 1;
  ctx.strokeStyle = color;
  ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
  ctx.beginPath();
  ctx.moveTo(x + size / 2, y + 2.5); ctx.lineTo(x + size / 2, y + size - 2.5);
  ctx.moveTo(x + 2.5, y + size / 2); ctx.lineTo(x + size - 2.5, y + size / 2);
  ctx.stroke();
}

/** A flash: the sign of an error event; filled at an Error End, which throws. */
function flash(ctx, color, filled) {
  ctx.save();
  ctx.lineWidth = 1.3;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-4, 4.5);
  ctx.lineTo(-1.2, -3.5);
  ctx.lineTo(1.3, 1.5);
  ctx.lineTo(4, -4.5);
  if (filled) {
    ctx.lineTo(2.2, 3.5);
    ctx.lineTo(-0.6, -1.2);
    ctx.closePath();
    ctx.fill();
  }
  ctx.stroke();
  ctx.restore();
}

// ── Elements ─────────────────────────────────────────────────────────────────

function drawBadge(ctx, x, y, count) {
  const text = String(count);
  ctx.font = 'bold 8.5px ' + theme.font;
  const w = Math.max(16, ctx.measureText(text).width + 9);
  roundRect(ctx, x - w / 2, y - 6, w, 12, 6);
  ctx.fillStyle = theme.elementFill;
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = theme.executed;
  ctx.stroke();
  ctx.fillStyle = theme.active;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y + 0.5);
}

function drawBreakpoint(ctx, x, y) {
  circle(ctx, x, y, 4.5);
  ctx.fillStyle = theme.breakpoint;
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = theme.elementFill;
  ctx.stroke();
}

function drawActivity(ctx, el, layout, state) {
  const b = layout.body;
  ctx.save();
  glow(ctx, state);
  roundRect(ctx, b.x, b.y, b.w, b.h, 5);
  ctx.fillStyle = theme.elementFill;
  ctx.fill();
  ctx.restore();

  const width = state.selected || state.error ? 2 : state.active ? 1.6 : 1;
  roundRect(ctx, b.x + width / 2, b.y + width / 2, b.w - width, b.h - width, 5);
  ctx.lineWidth = width;
  ctx.strokeStyle = strokeColor(el, state);
  ctx.stroke();
  if (state.hover && !state.selected) {
    roundRect(ctx, b.x - 2, b.y - 2, b.w + 4, b.h + 4, 7);
    ctx.lineWidth = 1;
    ctx.strokeStyle = theme.hover;
    ctx.globalAlpha = 0.55;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  if (el.kind === 'script') scriptIcon(ctx, layout.icon);
  else if (el.kind === 'call') callIcon(ctx, layout.icon);
  else if (el.kind === 'embedded') boxIcon(ctx, layout.icon, el.type);
  else genericIcon(ctx, layout.icon);
  drawLabel(ctx, layout, 'left');
  if (el.kind === 'embedded') collapsedMarker(ctx, b, strokeColor(el, state));

  if (state.selected) {
    [[b.x, b.y], [b.x + b.w, b.y], [b.x, b.y + b.h], [b.x + b.w, b.y + b.h]].forEach(([hx, hy]) => {
      circle(ctx, hx, hy, 4);
      ctx.fillStyle = theme.selection;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = theme.handleStroke;
      ctx.stroke();
    });
  }
  if (state.breakpoint) drawBreakpoint(ctx, b.x + 1, b.y + 1);
  if (state.executed) drawBadge(ctx, b.x + b.w - 8, b.y, state.executed);
}

function drawGhost(ctx, el, layout, state) {
  const b = layout.body;
  ctx.save();
  roundRect(ctx, b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1, 5);
  ctx.fillStyle = state.hover || state.selected ? 'rgba(45,102,254,0.16)' : 'rgba(255,255,255,0.04)';
  ctx.fill();
  ctx.setLineDash([5, 4]);
  ctx.lineWidth = state.selected ? 1.6 : 1.2;
  ctx.strokeStyle = state.hover || state.selected ? theme.selection : theme.ghost;
  ctx.stroke();
  ctx.restore();
  const lines = state.ghostLabel || [];
  ctx.font = labelFont(10.5);
  ctx.fillStyle = theme.ghostText;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  lines.forEach((text, i) => ctx.fillText(text, 0, (i - (lines.length - 1) / 2) * 13 + 0.5));
}

/** Arrow with a hooked tail; dir 1 points down (callable start), -1 points up (callable end). */
function drawCallArrow(ctx, color, dir) {
  const s = dir;
  ctx.save();
  ctx.lineWidth = 1.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(-3.4, -6 * s);
  ctx.quadraticCurveTo(0, -6 * s, 0, -2.8 * s);
  ctx.lineTo(0, 6 * s);
  ctx.moveTo(-3.4, 2.6 * s);
  ctx.lineTo(0, 6 * s);
  ctx.lineTo(3.4, 2.6 * s);
  ctx.stroke();
  ctx.restore();
}

function drawEvent(ctx, el, layout, state) {
  const r = el.w / 2;
  const color = strokeColor(el, state);
  const thick = el.kind === 'end';
  const width = thick ? 3.2 : state.selected ? 2 : 1.2;
  ctx.save();
  glow(ctx, state);
  circle(ctx, 0, 0, r - width / 2);
  ctx.fillStyle = theme.elementFill;
  ctx.fill();
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.restore();

  if (el.type === 'CallSubStart' || el.type === 'CallSubEnd') {
    // a callable sub-process: an arrow down into it at the start, back up out of it at the end
    drawCallArrow(ctx, color, el.type === 'CallSubStart' ? 1 : -1);
  }
  if (el.type === 'TaskEndPage') {
    // a sheet of paper: the page the end shows
    ctx.lineWidth = 1.1;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(-4, -5.5);
    ctx.lineTo(1.5, -5.5);
    ctx.lineTo(4, -3);
    ctx.lineTo(4, 5.5);
    ctx.lineTo(-4, 5.5);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-2, -1); ctx.lineTo(2, -1);
    ctx.moveTo(-2, 1.6); ctx.lineTo(2, 1.6);
    ctx.stroke();
  }
  if (el.type === 'ErrorStartEvent' || el.type === 'ErrorEnd') flash(ctx, color, el.type === 'ErrorEnd');
  if (el.kind === 'boundary') {
    // an error boundary: a second ring and a flash
    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
    circle(ctx, 0, 0, r - 3);
    ctx.stroke();
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-3.4, 3.6);
    ctx.lineTo(-1, -3);
    ctx.lineTo(1.2, 1.6);
    ctx.lineTo(3.4, -3.6);
    ctx.stroke();
  }
  if ((state.hover && !state.selected) || state.selected) {
    circle(ctx, 0, 0, r + 3.5);
    ctx.lineWidth = 1;
    ctx.strokeStyle = state.selected ? theme.selection : theme.hover;
    ctx.globalAlpha = state.selected ? 0.9 : 0.55;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  if (layout.lines.length) drawLabel(ctx, layout, 'center');
  if (state.breakpoint) drawBreakpoint(ctx, -r * 0.75, -r * 0.75);
  if (state.executed) drawBadge(ctx, r * 0.92, -r * 0.92, state.executed);
}

function drawGateway(ctx, el, layout, state) {
  const hw = el.w / 2;
  const hh = el.h / 2;
  ctx.beginPath();
  ctx.moveTo(0, -hh);
  ctx.lineTo(hw, 0);
  ctx.lineTo(0, hh);
  ctx.lineTo(-hw, 0);
  ctx.closePath();
  ctx.fillStyle = theme.elementFill;
  ctx.fill();
  ctx.lineWidth = state.selected ? 2 : 1.2;
  ctx.strokeStyle = strokeColor(el, state);
  ctx.stroke();
  ctx.beginPath();
  // an Alternative chooses one way (×); a Split and a Join are parallel (+)
  if (el.kind === 'split' || el.kind === 'join') { ctx.moveTo(0, -7); ctx.lineTo(0, 7); ctx.moveTo(-7, 0); ctx.lineTo(7, 0); }
  else { ctx.moveTo(-5, -5); ctx.lineTo(5, 5); ctx.moveTo(5, -5); ctx.lineTo(-5, 5); }
  ctx.lineWidth = 1.4;
  ctx.stroke();
  if (layout.lines.length) drawLabel(ctx, layout, 'center');
  if (state.executed) drawBadge(ctx, hw * 0.8, -hh * 0.8, state.executed);
}

function drawNote(ctx, el, layout) {
  const b = layout.body;
  ctx.strokeStyle = theme.ghost;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(b.x + 6, b.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineTo(b.x, b.y + b.h);
  ctx.lineTo(b.x + 6, b.y + b.h);
  ctx.stroke();
  drawLabel(ctx, layout, 'left', theme.cardMuted);
}

/** Paints one element with its centre at the origin. */
export function paintElement(ctx, el, state = {}) {
  const layout = layoutElement(el);
  if (el.removed) drawGhost(ctx, el, layout, state);
  else if (el.shape === 'activity') drawActivity(ctx, el, layout, state);
  else if (el.shape === 'event') drawEvent(ctx, el, layout, state);
  else if (el.shape === 'gateway') drawGateway(ctx, el, layout, state);
  else drawNote(ctx, el, layout);
}

// ── Connectors ───────────────────────────────────────────────────────────────

/** @param {{x:number,y:number}[]} points  @param {{executed?:boolean,dashed?:boolean}} state */
export function paintConnector(ctx, points, state = {}) {
  if (points.length < 2) return;
  ctx.save();
  ctx.strokeStyle = state.executed ? theme.executed : theme.connector;
  ctx.globalAlpha = state.dashed ? 0.55 : 1;
  ctx.lineWidth = state.executed ? 1.3 : 1;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  if (state.dashed) ctx.setLineDash([4, 4]);
  ctx.beginPath();
  points.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.stroke();
  ctx.setLineDash([]);
  const end = points[points.length - 1];
  const prev = points[points.length - 2];
  const angle = Math.atan2(end.y - prev.y, end.x - prev.x);
  const size = 6.5;
  ctx.beginPath();
  ctx.moveTo(end.x - size * Math.cos(angle - 0.5), end.y - size * Math.sin(angle - 0.5));
  ctx.lineTo(end.x, end.y);
  ctx.lineTo(end.x - size * Math.cos(angle + 0.5), end.y - size * Math.sin(angle + 0.5));
  ctx.stroke();
  ctx.restore();
}

/** The name of a connector (an exit of an Alternative: "yes", "more than 500"), at the middle of its longest part. */
export function paintConnectorLabel(ctx, points, text) {
  if (!text || points.length < 2) return;
  let best = 1;
  let longest = -1;
  for (let i = 1; i < points.length; i++) {
    const length = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    if (length > longest) { longest = length; best = i; }
  }
  const a = points[best - 1];
  const b = points[best];
  const x = (a.x + b.x) / 2;
  const y = (a.y + b.y) / 2;
  ctx.save();
  ctx.font = labelFont(11);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const lines = String(text).split('\n');
  const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + 8;
  const h = lines.length * 13 + 4;
  // above a horizontal part, to the right of a vertical one
  const horizontal = Math.abs(b.x - a.x) >= Math.abs(b.y - a.y);
  const cx = horizontal ? x : x + w / 2 + 4;
  const cy = horizontal ? y - h / 2 - 3 : y;
  ctx.fillStyle = theme.canvas;
  ctx.globalAlpha = 0.85;
  ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
  ctx.globalAlpha = 1;
  ctx.fillStyle = theme.label;
  lines.forEach((line, i) => ctx.fillText(line, cx, cy + (i - (lines.length - 1) / 2) * 13 + 0.5));
  ctx.restore();
}

// ── Effect cards (the "call the model" round trip) ───────────────────────────

const TONES = {
  system: theme.toneSystem,
  user: theme.toneUser,
  assistant: theme.toneAssistant,
  model: theme.toneModel,
  tool: theme.toneTool,
  error: theme.error,
  neutral: theme.toneNeutral
};

export const toneColor = tone => TONES[tone] || theme.toneNeutral;

function fit(ctx, text, maxWidth) {
  let t = String(text).replace(/\s+/g, ' ').trim();
  if (ctx.measureText(t).width <= maxWidth) return t;
  while (t.length > 1 && ctx.measureText(t + '…').width > maxWidth) t = t.slice(0, -1);
  return t.trimEnd() + '…';
}

/**
 * A small card centred on the origin. `data`:
 *   { w, h, tone, title, subtitle?, tag?, busy? (0..1 spinner phase) }
 */
export function paintCard(ctx, data) {
  const { w, h } = data;
  const color = toneColor(data.tone);
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;
  roundRect(ctx, -w / 2, -h / 2, w, h, 7);
  ctx.fillStyle = theme.card;
  ctx.fill();
  ctx.restore();
  roundRect(ctx, -w / 2 + 0.5, -h / 2 + 0.5, w - 1, h - 1, 7);
  ctx.lineWidth = 1;
  ctx.strokeStyle = color;
  ctx.stroke();

  let x = -w / 2 + 9;
  ctx.textBaseline = 'middle';
  if (data.tag) {
    ctx.font = 'bold 8.5px ' + theme.uiFont;
    const tw = ctx.measureText(data.tag).width + 10;
    roundRect(ctx, x, -7, tw, 14, 7);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.fillStyle = '#16181d';
    ctx.textAlign = 'center';
    ctx.fillText(data.tag, x + tw / 2, 0.5);
    x += tw + 7;
  } else if (data.icon) {
    circle(ctx, x + 9, 0, 9);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.22;
    ctx.fill();
    ctx.globalAlpha = 1;
    // spark: the model
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = (Math.PI / 4) * i;
      ctx.moveTo(x + 9 - Math.cos(a) * 5, -Math.sin(a) * 5);
      ctx.lineTo(x + 9 + Math.cos(a) * 5, Math.sin(a) * 5);
    }
    ctx.stroke();
    x += 25;
  }

  const textWidth = w / 2 - 9 - x;
  ctx.textAlign = 'left';
  if (data.subtitle) {
    ctx.font = '600 11.5px ' + theme.uiFont;
    ctx.fillStyle = theme.cardText;
    ctx.fillText(fit(ctx, data.title, textWidth), x, -6.5);
    ctx.font = '10px ' + theme.uiFont;
    ctx.fillStyle = theme.cardMuted;
    ctx.fillText(fit(ctx, data.subtitle, textWidth), x, 7.5);
  } else {
    ctx.font = (data.tag ? '' : '600 ') + '10.5px ' + theme.uiFont;
    ctx.fillStyle = theme.cardText;
    ctx.fillText(fit(ctx, data.title, textWidth), x, 0.5);
  }
}

/** Soft glowing dot (the token) for the 2D fallback; radius in process pixels. */
export function paintGlow(ctx, radius, color, alpha = 1) {
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
  g.addColorStop(0, color);
  g.addColorStop(0.25, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = g;
  circle(ctx, 0, 0, radius);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#ffffff';
  circle(ctx, 0, 0, radius * 0.16);
  ctx.fill();
  ctx.restore();
}

/** Dotted background grid for the 2D fallback. `view` = visible rectangle in process pixels. */
export function paintGrid(ctx, view, zoom) {
  const step = theme.gridSpacing * (zoom < 0.6 ? 2 : 1);
  if (zoom * step < 5) return;
  const size = Math.max(1, 1 / zoom);
  ctx.fillStyle = theme.gridDot;
  const x0 = Math.floor(view.x / step) * step;
  const y0 = Math.floor(view.y / step) * step;
  for (let x = x0; x < view.x + view.w; x += step) {
    for (let y = y0; y < view.y + view.h; y += step) ctx.fillRect(x - size / 2, y - size / 2, size, size);
  }
}
