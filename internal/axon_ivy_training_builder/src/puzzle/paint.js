/**
 * What the puzzle shows, painted on 2D canvases that three.js then uses as textures
 * (src/puzzle/gl.js): process elements as the tutorial's simulated Designer draws them (the
 * same sizes, colours and icons as the films, src/cast.js), texts, panels, buttons, the chips
 * of a field, the people of the cast, the token's glow.
 *
 * makePainter(dpr) → the painting functions. Each returns an image { canvas, w, h, ax?, ay? }:
 * w × h is its size in stage pixels (the canvas has dpr times as many, so it stays sharp);
 * ax, ay is the point that sits on the sprite's position (its middle unless given).
 */
import { D, P } from '../cast.js';
import { FONT } from '../stage.js';
import { SIZE, shapeOf } from './model.js';

// The puzzle's own colours: a dark workbench around the Designer's canvas, in both page themes.
export const U = {
  bg: '#0f1116', panel: '#1a1c23', panel2: '#23262f', line: '#2e323d', text: '#e9ebf1', muted: '#9aa1b0',
  accent: D.select, accentSoft: '#7aa2ff', good: D.active, goodInk: '#0c1f10', bad: '#ff5d73', badSoft: '#3a1a22', gold: P.gold
};
const LABEL = { size: 12, line: 15, font: 'Arial, "Helvetica Neue", Helvetica, "Hiragino Sans", "Yu Gothic UI", Meiryo, sans-serif' };
// characters a line must not start with (Japanese punctuation, closing brackets)
const NO_START = '、。，．,.!?！？）)」』】〕：；:;ー…々ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶ';

const PERSON = {
  hairLong: 'M-23 -66 Q-28 -100 0 -101 Q28 -100 23 -66 L25 -44 Q14 -46 13 -62 L-13 -62 Q-14 -46 -25 -44 Z',
  shirt: 'M-36 0 V-24 Q-36 -48 -12 -50 H12 Q36 -48 36 -24 V0 Z',
  collar: 'M-8 -50 L0 -40 L8 -50',
  fringeLong: 'M-21 -72 Q-21 -96 0 -96 Q21 -96 21 -72 Q12 -84 -2 -82 Q-14 -81 -21 -72 Z',
  fringe: 'M-21 -74 Q-22 -97 0 -97 Q22 -97 21 -74 Q14 -86 0 -85 Q-14 -86 -21 -74 Z',
  mouth: 'M-6 -61 Q0 -56 6 -61'
};

export function makePainter(dpr = 1) {
  const sheet = (w, h, k = 1) => {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.ceil(w * dpr * k));
    canvas.height = Math.max(1, Math.ceil(h * dpr * k));
    // kept in memory, not on the GPU: these canvases are only ever read, as textures
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.scale(dpr * k, dpr * k);
    return { canvas, ctx, w, h };
  };
  const probe = sheet(1, 1).ctx;
  const fontOf = (size, weight = 400, family = FONT.sans) => `${weight} ${size}px ${family}`;
  const widthOf = (str, font) => {
    probe.font = font;
    return probe.measureText(str).width;
  };
  const rr = (ctx, x, y, w, h, r) => {
    const q = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + q, y);
    ctx.arcTo(x + w, y, x + w, y + h, q);
    ctx.arcTo(x + w, y + h, x, y + h, q);
    ctx.arcTo(x, y + h, x, y, q);
    ctx.arcTo(x, y, x + w, y, q);
    ctx.closePath();
  };

  // ---- text -------------------------------------------------------------------------------
  /** A text as runs: **bold**, `code`, [[id|words]] (the words only). */
  const runsOf = str => {
    const runs = [];
    const re = /\*\*(.+?)\*\*|`([^`]+)`|\[\[[\w-]+(?:\|(.+?))?\]\]/g;
    let last = 0;
    for (let m; (m = re.exec(str)); last = re.lastIndex) {
      if (m.index > last) runs.push({ text: str.slice(last, m.index) });
      if (m[1] != null) runs.push({ text: m[1], bold: true });
      else if (m[2] != null) runs.push({ text: m[2], code: true });
      else if (m[3] != null) runs.push({ text: m[3], bold: true });
    }
    if (last < str.length) runs.push({ text: str.slice(last) });
    return runs;
  };
  /** Pieces a line may break between: words (with the space after them), or single wide characters. */
  const piecesOf = run => {
    const out = [];
    let word = '';
    const flush = () => { if (word) { out.push({ ...run, text: word }); word = ''; } };
    for (const ch of run.text) {
      const wide = ch.charCodeAt(0) > 0x2e80;
      if (wide) {
        if (NO_START.includes(ch) && (word || out.length)) {
          if (word) word += ch;
          else out[out.length - 1] = { ...out[out.length - 1], text: out[out.length - 1].text + ch };
          continue;
        }
        flush();
        out.push({ ...run, text: ch });
      } else if (ch === ' ') {
        word += ch;
        flush();
      } else if (ch === '\n') {
        flush();
        out.push({ ...run, text: '', br: true });
      } else word += ch;
    }
    flush();
    return out;
  };
  /**
   * A text laid out in lines no wider than maxW.
   * o: size, weight, color, family, lineH, align (left, center), rich (false: no markup),
   *    bold (the colour of **bold**), maxLines
   */
  const layout = (str, o = {}) => {
    const size = o.size || 14;
    const weight = o.weight || 500;
    const family = o.family || FONT.sans;
    const maxW = o.maxW || Infinity;
    const fontFor = p => (p.code ? fontOf(size * 0.94, 600, FONT.mono) : fontOf(size, p.bold ? Math.max(700, weight) : weight, family));
    const pieces = (o.rich === false ? [{ text: String(str) }] : runsOf(String(str))).flatMap(piecesOf);
    const lines = [];
    let line = [];
    let used = 0;
    const push = () => {
      // the space at the end of a line does not count
      while (line.length && !line[line.length - 1].text.trim() && !line[line.length - 1].br) line.pop();
      if (line.length) {
        const lastPiece = line[line.length - 1];
        const trimmed = lastPiece.text.replace(/ +$/, '');
        if (trimmed !== lastPiece.text) line[line.length - 1] = { ...lastPiece, text: trimmed, w: widthOf(trimmed, lastPiece.font) };
      }
      lines.push({ pieces: line, w: line.reduce((sum, p) => sum + p.w, 0) });
      line = [];
      used = 0;
    };
    for (const piece of pieces) {
      if (piece.br) { push(); continue; }
      const font = fontFor(piece);
      const w = widthOf(piece.text, font);
      if (line.length && used + widthOf(piece.text.replace(/ +$/, ''), font) > maxW) push();
      if (w > maxW && piece.text.length > 1) {
        // a word wider than the line breaks per character
        let part = '';
        for (const ch of piece.text) {
          if (part && used + widthOf(part + ch, font) > maxW) {
            line.push({ ...piece, text: part, font, w: widthOf(part, font) });
            push();
            part = '';
          }
          part += ch;
        }
        if (part) { const pw = widthOf(part, font); line.push({ ...piece, text: part, font, w: pw }); used += pw; }
        continue;
      }
      line.push({ ...piece, font, w });
      used += w;
    }
    if (line.length || !lines.length) push();
    if (o.maxLines && lines.length > o.maxLines) {
      lines.length = o.maxLines;
      const cut = lines[lines.length - 1];
      const end = cut.pieces[cut.pieces.length - 1];
      if (end) {
        // room for the dots: letters go until they fit
        let text = end.text;
        while (text && cut.w - end.w + widthOf(text + '…', end.font) > maxW) text = text.slice(0, -1);
        const w = widthOf(text + '…', end.font);
        cut.w += w - end.w;
        cut.pieces[cut.pieces.length - 1] = { ...end, text: text + '…', w };
      }
    }
    const lineH = o.lineH || Math.round(size * 1.38);
    return { lines, lineH, size, w: Math.min(maxW, Math.max(1, ...lines.map(l => l.w))), h: lines.length * lineH };
  };
  const drawLayout = (ctx, l, x, y, o = {}) => {
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    l.lines.forEach((line, i) => {
      let cx = o.align === 'center' ? x + ((o.boxW ?? l.w) - line.w) / 2 : x;
      const cy = y + l.lineH * (i + 0.5) + 0.5;
      for (const p of line.pieces) {
        ctx.font = p.font;
        ctx.fillStyle = p.code ? (o.code || U.accentSoft) : p.bold ? (o.bold || o.color || U.text) : (o.color || U.text);
        ctx.fillText(p.text, cx, cy);
        cx += p.w;
      }
    });
  };

  /** A text on its own. o as layout, plus pad. */
  const label = (str, o = {}) => {
    const l = layout(str, o);
    const pad = o.pad || 0;
    const boxW = o.align === 'center' && o.maxW && o.maxW !== Infinity && o.fill ? o.maxW : l.w;
    const s = sheet(Math.ceil(boxW) + pad * 2 + 2, l.h + pad * 2);
    drawLayout(s.ctx, l, pad + 1, pad, { ...o, boxW });
    return { canvas: s.canvas, w: s.w, h: s.h, lines: l.lines.length, ax: o.align === 'center' ? s.w / 2 : 0, ay: 0 };
  };

  // ---- panels, buttons, chips -------------------------------------------------------------
  const panel = (w, h, o = {}) => {
    const s = sheet(w, h);
    const sw = o.sw ?? 1;
    rr(s.ctx, sw / 2, sw / 2, w - sw, h - sw, o.r ?? 14);
    if (o.fill !== false) { s.ctx.fillStyle = o.fill || U.panel; s.ctx.fill(); }
    if (o.stroke !== false) {
      s.ctx.strokeStyle = o.stroke || U.line;
      s.ctx.lineWidth = sw;
      if (o.dash) s.ctx.setLineDash(o.dash);
      s.ctx.stroke();
    }
    return { canvas: s.canvas, w, h, ax: 0, ay: 0 };
  };

  /** A button: kind primary (green), accent (blue), ghost, danger. Its text in the middle. */
  const button = (text, o = {}) => {
    const size = o.size || 15;
    const font = fontOf(size, 700);
    const h = o.h || 42;
    const w = o.w || Math.ceil(widthOf(text, font)) + (o.padX ?? 20) * 2;
    const s = sheet(w, h);
    const kinds = {
      primary: [U.good, U.good, U.goodInk],
      accent: [U.accent, U.accent, '#ffffff'],
      ghost: [U.panel2, U.line, U.text],
      danger: [U.badSoft, U.bad, '#ffd9df']
    };
    const [fill, stroke, ink] = kinds[o.kind || 'ghost'];
    rr(s.ctx, 0.5, 0.5, w - 1, h - 1, o.r ?? 12);
    s.ctx.fillStyle = fill;
    s.ctx.fill();
    s.ctx.strokeStyle = stroke;
    s.ctx.lineWidth = 1;
    s.ctx.stroke();
    s.ctx.font = font;
    s.ctx.fillStyle = ink;
    s.ctx.textAlign = 'center';
    s.ctx.textBaseline = 'middle';
    s.ctx.fillText(text, w / 2, h / 2 + 0.5);
    return { canvas: s.canvas, w, h, ax: 0, ay: 0 };
  };

  /** One option of a field. */
  const chip = (text, o = {}) => {
    const size = o.size || 13;
    const font = fontOf(size, 600);
    const h = o.h || 30;
    const w = Math.ceil(widthOf(text, font)) + 24;
    const s = sheet(w, h);
    rr(s.ctx, 0.75, 0.75, w - 1.5, h - 1.5, 8);
    s.ctx.fillStyle = o.selected ? (o.error ? U.badSoft : U.accent) : U.panel2;
    s.ctx.fill();
    s.ctx.strokeStyle = o.selected ? (o.error ? U.bad : U.accent) : U.line;
    s.ctx.lineWidth = 1.5;
    s.ctx.stroke();
    s.ctx.font = font;
    s.ctx.fillStyle = o.selected ? '#ffffff' : U.text;
    s.ctx.textAlign = 'center';
    s.ctx.textBaseline = 'middle';
    s.ctx.fillText(text, w / 2, h / 2 + 0.5);
    return { canvas: s.canvas, w, h, ax: 0, ay: 0 };
  };

  /** A small pill: a role on a task, a name under a person. */
  const pill = (text, o = {}) => {
    const size = o.size || 12;
    const font = fontOf(size, 700);
    const h = Math.round(size * 1.75);
    const w = Math.ceil(widthOf(text, font)) + h * 0.9;
    const s = sheet(w + 2, h + 2);
    rr(s.ctx, 1, 1, w, h, h / 2);
    s.ctx.fillStyle = o.fill || P.teal;
    s.ctx.fill();
    s.ctx.strokeStyle = o.stroke || P.ink;
    s.ctx.lineWidth = 1.5;
    s.ctx.stroke();
    s.ctx.font = font;
    s.ctx.fillStyle = o.color || P.ink;
    s.ctx.textAlign = 'center';
    s.ctx.textBaseline = 'middle';
    s.ctx.fillText(text, 1 + w / 2, 1 + h / 2 + 0.5);
    return { canvas: s.canvas, w: s.w, h: s.h };
  };

  /** A round mark: '!' (something is wrong here), '×' (remove), '→' (connect from here). */
  const mark = (sign, o = {}) => {
    const d = o.d || 18;
    const s = sheet(d + 4, d + 4);
    const c = s.ctx;
    c.translate(d / 2 + 2, d / 2 + 2);
    c.beginPath();
    c.arc(0, 0, d / 2, 0, Math.PI * 2);
    c.fillStyle = o.fill || U.bad;
    c.fill();
    c.strokeStyle = o.stroke || '#14151a';
    c.lineWidth = 1.5;
    c.stroke();
    c.strokeStyle = o.color || '#ffffff';
    c.fillStyle = o.color || '#ffffff';
    c.lineWidth = Math.max(1.6, d / 10);
    c.lineCap = 'round';
    c.lineJoin = 'round';
    const k = d / 18;
    c.beginPath();
    if (sign === '!') {
      c.moveTo(0, -4.6 * k);
      c.lineTo(0, 1.2 * k);
      c.stroke();
      c.beginPath();
      c.arc(0, 4.6 * k, 1.1 * k, 0, Math.PI * 2);
      c.fill();
    } else if (sign === '×') {
      c.moveTo(-3.4 * k, -3.4 * k);
      c.lineTo(3.4 * k, 3.4 * k);
      c.moveTo(3.4 * k, -3.4 * k);
      c.lineTo(-3.4 * k, 3.4 * k);
      c.stroke();
    } else {
      c.moveTo(-4.4 * k, 0);
      c.lineTo(4.2 * k, 0);
      c.moveTo(1 * k, -3.3 * k);
      c.lineTo(4.4 * k, 0);
      c.lineTo(1 * k, 3.3 * k);
      c.stroke();
    }
    return { canvas: s.canvas, w: s.w, h: s.h };
  };

  // ---- the Designer's elements ------------------------------------------------------------
  /** Wraps a name on spaces; unspaced text breaks per character. */
  const wrapName = (str, max) => layout(str, { size: LABEL.size, weight: 400, family: LABEL.font, maxW: max, rich: false, lineH: LABEL.line });

  const personGlyph = (c, cx, cy, k, color, sw) => {
    c.strokeStyle = color;
    c.lineWidth = sw;
    c.beginPath();
    c.arc(cx, cy - 4.5 * k, 3.4 * k, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    c.moveTo(cx - 7 * k, cy + 7.5 * k);
    c.quadraticCurveTo(cx - 7 * k, cy + 0.8 * k, cx, cy + 0.8 * k);
    c.quadraticCurveTo(cx + 7 * k, cy + 0.8 * k, cx + 7 * k, cy + 7.5 * k);
    c.stroke();
  };
  /** An activity's icon on its light tile, 30 × 30 with its top left at x, y. */
  const tileIcon = (c, kind, x, y) => {
    rr(c, x, y, 30, 30, 4);
    c.fillStyle = D.tile;
    c.fill();
    const cx = x + 15;
    const cy = y + 15;
    c.strokeStyle = D.icon;
    c.lineWidth = 1.3;
    c.lineJoin = 'round';
    if (kind === 'script') {
      c.stroke(new Path2D(`M${cx - 5.5} ${cy - 8} H${cx + 1.5} L${cx + 5.5} ${cy - 4} V${cy + 8} H${cx - 5.5} Z M${cx + 1.5} ${cy - 8} V${cy - 4} H${cx + 5.5}`));
      c.font = fontOf(7, 700, LABEL.font);
      c.fillStyle = D.icon;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('{ }', cx, cy + 3);
    } else if (kind === 'user') personGlyph(c, cx, cy, 1, D.icon, 1.3);
    else if (kind === 'email') {
      rr(c, cx - 8, cy - 5.5, 16, 11, 1.5);
      c.stroke();
      c.beginPath();
      c.moveTo(cx - 8, cy - 5);
      c.lineTo(cx, cy + 1);
      c.lineTo(cx + 8, cy - 5);
      c.stroke();
    } else if (kind === 'dialog') {
      rr(c, cx - 7.5, cy - 6, 15, 12, 2);
      c.stroke();
      c.beginPath();
      c.moveTo(cx - 7.5, cy - 2.2);
      c.lineTo(cx + 7.5, cy - 2.2);
      c.stroke();
    } else {
      rr(c, cx - 7, cy - 6, 14, 12, 2);
      c.stroke();
    }
  };
  const STATE = {
    idle: [D.stroke, 1, false], selected: [D.select, 2, false], target: [U.accentSoft, 2, true],
    error: [U.bad, 1.8, false], active: [D.active, 1.8, true], done: [D.done, 1, false]
  };

  /**
   * A process element. o: state (idle, selected, target, error, active, done), count (how often
   * it ran), k (how much sharper than the stage to paint it: the board's scale).
   */
  const element = (kind, name, o = {}) => {
    const shape = shapeOf(kind);
    const [w, h] = SIZE[shape];
    const [color, sw, glow] = STATE[o.state || 'idle'];
    const M = 12;
    const under = shape === 'activity' || !name ? null : wrapName(name, 118);
    const cw = Math.max(w, under ? under.w : 0) + M * 2;
    const ch = h + (under ? 7 + under.h : 0) + M * 2;
    const s = sheet(cw, ch, o.k || 1);
    const c = s.ctx;
    const ax = cw / 2;
    const ay = M + h / 2;
    c.translate(ax, ay);
    c.lineJoin = 'round';
    const outline = draw => {
      c.save();
      if (glow) { c.shadowColor = color; c.shadowBlur = 7; }
      c.fillStyle = D.fill;
      c.strokeStyle = color;
      draw();
      c.restore();
    };
    let badge;
    if (shape === 'activity') {
      outline(() => {
        rr(c, -w / 2 + 0.5, -h / 2 + 0.5, w - 1, h - 1, 5);
        c.fill();
        c.lineWidth = sw;
        c.stroke();
      });
      tileIcon(c, kind, -w / 2 + 8, -15);
      const text = wrapName(name || '', w - 43 - 4);
      if (text.lines.length > 3) text.lines.length = 3;
      drawLayout(c, text, -w / 2 + 43, -(text.lines.length * LABEL.line) / 2, { color: D.stroke });
      badge = [w / 2 - 8, -h / 2];
    } else if (shape === 'gateway') {
      outline(() => {
        c.beginPath();
        c.moveTo(0, -16);
        c.lineTo(16, 0);
        c.lineTo(0, 16);
        c.lineTo(-16, 0);
        c.closePath();
        c.fill();
        c.lineWidth = Math.max(sw, 1.2);
        c.stroke();
      });
      // a Task Switch Gateway hands work to people; an Alternative chooses one way (×); a Split and a Join are parallel (+)
      if (kind === 'gateway') personGlyph(c, 0, 0.5, 0.62, color, 1.2);
      else {
        c.strokeStyle = color;
        c.lineWidth = 1.4;
        c.beginPath();
        if (kind === 'alternative') {
          c.moveTo(-5, -5);
          c.lineTo(5, 5);
          c.moveTo(5, -5);
          c.lineTo(-5, 5);
        } else {
          c.moveTo(0, -7);
          c.lineTo(0, 7);
          c.moveTo(-7, 0);
          c.lineTo(7, 0);
        }
        c.stroke();
      }
      badge = [12.8, -12.8];
    } else {
      const thick = kind === 'end' ? 3.2 : 1.2;
      const line = Math.max(thick, sw);
      outline(() => {
        c.beginPath();
        c.arc(0, 0, 15 - line / 2, 0, Math.PI * 2);
        c.fill();
        c.lineWidth = line;
        c.stroke();
      });
      if (kind === 'switch') personGlyph(c, 0, 0.5, 0.66, color, 1.2);
      badge = [13.8, -13.8];
    }
    if (under) drawLayout(c, under, -under.w / 2, h / 2 + 7, { color: D.stroke, align: 'center' });
    if (o.count) {
      rr(c, badge[0] - 8, badge[1] - 6, 16, 12, 6);
      c.fillStyle = D.fill;
      c.fill();
      c.strokeStyle = D.done;
      c.lineWidth = 1;
      c.stroke();
      c.font = fontOf(8.5, 700, LABEL.font);
      c.fillStyle = D.active;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(String(o.count), badge[0], badge[1] + 0.5);
    }
    return { canvas: s.canvas, w: cw, h: ch, ax, ay };
  };

  /** The soft shadow an element throws on the board when it is lifted (the run). */
  const shadow = kind => {
    const shape = shapeOf(kind);
    const [w, h] = SIZE[shape];
    const M = 16;
    const s = sheet(w + M * 2, h + M * 2);
    const c = s.ctx;
    c.translate(M + w / 2, M + h / 2);
    c.shadowColor = 'rgba(0,0,0,0.75)';
    c.shadowBlur = 10;
    c.fillStyle = 'rgba(0,0,0,0.55)';
    if (shape === 'activity') { rr(c, -w / 2, -h / 2, w, h, 5); c.fill(); }
    else if (shape === 'gateway') { c.beginPath(); c.moveTo(0, -16); c.lineTo(16, 0); c.lineTo(0, 16); c.lineTo(-16, 0); c.closePath(); c.fill(); }
    else { c.beginPath(); c.arc(0, 0, 15, 0, Math.PI * 2); c.fill(); }
    return { canvas: s.canvas, w: s.w, h: s.h };
  };

  /**
   * One tile of the canvas' dot grid (it repeats): `step` board pixels, painted for a board
   * shown at `scale`, so that a dot is whole screen pixels and stays sharp. The board's scale
   * is chosen so that a tile is a whole number of them (src/puzzle/game.js).
   */
  const dots = (step = 8, scale = 1) => {
    const px = Math.max(4, Math.round(step * scale * dpr));
    const canvas = document.createElement('canvas');
    canvas.width = px;
    canvas.height = px;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const d = Math.max(1, Math.round(scale * dpr));
    ctx.fillStyle = D.dot;
    ctx.fillRect(Math.floor((px - d) / 2), Math.floor((px - d) / 2), d, d);
    return { canvas, w: step, h: step };
  };

  /** The editor's tab bar with the process file's tab, w wide. */
  const tabBar = (w, file) => {
    const h = 26;
    const s = sheet(w, h);
    const c = s.ctx;
    c.fillStyle = D.bar;
    rr(c, 0, 0, w, h + 8, 8);
    c.fill();
    const font = fontOf(12, 400);
    const tabW = Math.min(w, Math.ceil(widthOf(file, font)) + 46);
    c.fillStyle = D.canvas;
    rr(c, 0, 0, tabW, h + 8, 8);
    c.fill();
    // the little process mark, and the file's name
    c.strokeStyle = D.text;
    c.lineWidth = 1;
    c.beginPath();
    c.arc(14, h / 2 - 3, 1.9, 0, Math.PI * 2);
    c.stroke();
    c.stroke(new Path2D(`M14 ${h / 2 - 1} V${h / 2 + 1.6} M11 ${h / 2 + 4.8} L14 ${h / 2 + 1.6} L17 ${h / 2 + 4.8}`));
    c.font = font;
    c.fillStyle = D.text;
    c.textBaseline = 'middle';
    c.fillText(file, 25, h / 2 + 0.5);
    c.fillStyle = D.line;
    c.fillRect(0, h - 1, w, 1);
    return { canvas: s.canvas, w, h, ax: 0, ay: 0 };
  };

  // ---- the run ----------------------------------------------------------------------------
  /** The token: the tutorial's green glow with a white core. */
  const token = () => {
    const r = 15;
    const s = sheet(r * 2, r * 2, 2);
    const c = s.ctx;
    const g = c.createRadialGradient(r, r, 0, r, r, r);
    g.addColorStop(0, D.active);
    g.addColorStop(0.25, D.active);
    g.addColorStop(1, 'rgba(93,195,106,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, r * 2, r * 2);
    c.beginPath();
    c.arc(r, r, 2.3, 0, Math.PI * 2);
    c.fillStyle = '#ffffff';
    c.fill();
    return { canvas: s.canvas, w: r * 2, h: r * 2 };
  };

  /** A round dot for the confetti (tinted by the points' colours). */
  const dot = () => {
    const s = sheet(16, 16, 2);
    s.ctx.beginPath();
    s.ctx.arc(8, 8, 7, 0, Math.PI * 2);
    s.ctx.fillStyle = '#ffffff';
    s.ctx.fill();
    return { canvas: s.canvas, w: 16, h: 16 };
  };

  /**
   * One of the cast, as in the films: head and shoulders, the name under it. `who` is the
   * person's look ({ shirt, hair, long, skin }) or 'system' for the engine's robot. The image
   * stands on its feet: ax, ay is the middle of its bottom edge.
   */
  const person = (who, name, o = {}) => {
    const k = o.k || 0.5;
    const nameImg = name ? pill(name, { fill: P.cream, size: 12 }) : null;
    const bodyW = 84 * k;
    const bodyH = (who === 'system' ? 118 : 106) * k;
    const w = Math.max(bodyW, nameImg ? nameImg.w : 0) + 4;
    const h = bodyH + (nameImg ? nameImg.h + 2 : 0) + 2;
    const s = sheet(w, h, 2);
    const c = s.ctx;
    c.save();
    c.translate(w / 2, bodyH);
    c.scale(k, k);
    c.lineJoin = 'round';
    c.lineCap = 'round';
    const shape = (d, fill, sw = 3) => {
      const p = new Path2D(d);
      if (fill) { c.fillStyle = fill; c.fill(p); }
      c.strokeStyle = P.ink;
      c.lineWidth = sw;
      c.stroke(p);
    };
    const ball = (x, y, r, fill, sw = 3) => {
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fillStyle = fill;
      c.fill();
      if (sw) { c.strokeStyle = P.ink; c.lineWidth = sw; c.stroke(); }
    };
    if (who === 'system') {
      shape('M-34 0 V-34 Q-34 -46 -22 -46 H22 Q34 -46 34 -34 V0 Z', P.sky);
      ball(0, -24, 9, P.cream, 2.5);
      shape('M0 -30 V-18 M-6 -24 H6', null, 2.5);
      shape('M0 -52 V-104', null);
      rr(c, -26, -94, 52, 42, 10);
      c.fillStyle = P.cream;
      c.fill();
      c.strokeStyle = P.ink;
      c.lineWidth = 3;
      c.stroke();
      c.fillStyle = P.ink;
      rr(c, -15, -80, 9, 9, 2);
      c.fill();
      rr(c, 6, -80, 9, 9, 2);
      c.fill();
      shape('M-8 -62 H8', null, 2.5);
      ball(0, -108, 6, P.gold, 2.5);
    } else {
      const look = who || {};
      if (look.long) shape(PERSON.hairLong, look.hair || P.hair);
      shape(PERSON.shirt, look.shirt || P.blue);
      shape(PERSON.collar, null, 2.5);
      ball(0, -72, 21, look.skin || P.skin);
      shape(look.long ? PERSON.fringeLong : PERSON.fringe, look.hair || P.hair);
      ball(-7, -70, 2.4, P.ink, 0);
      ball(7, -70, 2.4, P.ink, 0);
      shape(PERSON.mouth, null, 2.2);
    }
    c.restore();
    if (nameImg) c.drawImage(nameImg.canvas, (w - nameImg.w) / 2, bodyH + 2, nameImg.w, nameImg.h);
    return { canvas: s.canvas, w, h, ax: w / 2, ay: h };
  };

  return { layout, label, panel, button, chip, pill, mark, element, shadow, dots, tabBar, token, dot, person, widthOf, fontOf };
}
