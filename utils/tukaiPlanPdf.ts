import type { TukaiItem, TukaiPlan } from '@/types/tukai';

import { stopEnd, toTwelveHour } from './tukai';

/**
 * A TukAI plan as an A4 PDF, written by hand in the PDF format itself so no
 * library is needed: Helvetica, a deep teal band with "Tukai" and
 * "Itinerary", then each day and its stops, and a footer on every page.
 * Ported from the design's `aiPlanPdf`.
 */

const W = 595;
const H = 842;
const X = 56;
const R = W - 56;
const TX = X + 86;

// Helvetica's advance widths for printable ASCII, to wrap lines
const AW = [
  278,
  278,
  355,
  556,
  556,
  889,
  667,
  191,
  333,
  333,
  389,
  584,
  278,
  333,
  278,
  278,
  ...Array(10).fill(556),
  278,
  278,
  584,
  584,
  584,
  556,
  1015,
  667,
  667,
  722,
  722,
  667,
  611,
  778,
  722,
  278,
  500,
  667,
  556,
  833,
  722,
  778,
  667,
  778,
  722,
  667,
  611,
  722,
  667,
  944,
  667,
  667,
  611,
  278,
  278,
  278,
  469,
  556,
  333,
  556,
  556,
  500,
  556,
  556,
  278,
  556,
  556,
  222,
  222,
  500,
  222,
  833,
  556,
  556,
  556,
  556,
  333,
  500,
  278,
  556,
  500,
  722,
  500,
  500,
  500,
  334,
  260,
  334,
  584,
];
// Characters WinAnsiEncoding places outside Latin-1
const WIN: Record<number, number> = {
  8216: 145,
  8217: 146,
  8220: 147,
  8221: 148,
  8226: 149,
  8230: 133,
  8364: 128,
};
const COLOURS = {
  teal: '0.004 0.2 0.204',
  green: '0.024 0.388 0.286',
  ink: '0.122 0.161 0.216',
  sec: '0.357 0.42 0.4',
  lime: '0.69 0.91 0',
  white: '1 1 1',
  rule: '0.867 0.89 0.875',
};
type Colour = keyof typeof COLOURS;

const clean = (s: unknown) =>
  String(s == null ? '' : s)
    .replace(/[‐-―]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

const textWidth = (s: string, size: number, bold: boolean) => {
  let w = 0;
  for (const ch of s) {
    const c = ch.charCodeAt(0);
    w += c >= 32 && c <= 126 ? AW[c - 32] : 556;
  }
  return ((w * size) / 1000) * (bold ? 1.07 : 1);
};

const escape = (s: string) => {
  let out = '';
  for (const ch of s) {
    let c = ch.codePointAt(0)!;
    if (WIN[c]) c = WIN[c];
    if (c === 40 || c === 41 || c === 92) out += `\\${ch}`;
    else if (c >= 32 && c < 127) out += ch;
    else if (c >= 128 && c < 256) out += `\\${c.toString(8).padStart(3, '0')}`;
    else out += '?';
  }
  return out;
};

const wrap = (s: string, size: number, bold: boolean, max: number) => {
  const lines: string[] = [];
  let line = '';
  clean(s)
    .split(' ')
    .forEach((word) => {
      const next = line ? `${line} ${word}` : word;
      if (line && textWidth(next, size, bold) > max) {
        lines.push(line);
        line = word;
      } else line = next;
    });
  if (line) lines.push(line);
  return lines;
};

export const tukaiPlanPdfName = (plan: TukaiPlan) =>
  `${
    clean(plan.title)
      .replace(/[\\/:*?"<>|]+/g, '')
      .slice(0, 60)
      .trim() || 'Itinerary'
  }.pdf`;

/** The PDF file's contents, all 7-bit ASCII, ready for `btoa`. */
export const buildTukaiPlanPdf = (plan: TukaiPlan, items: Record<string, TukaiItem>): string => {
  const pages: string[][] = [];
  let ops: string[] = [];
  let y = 0;

  const text = (s: string, x: number, yy: number, size: number, bold: boolean, colour: Colour) =>
    ops.push(
      `BT /${bold ? 'F2' : 'F1'} ${size} Tf ${COLOURS[colour]} rg ${x.toFixed(1)} ${yy.toFixed(1)} Td (${escape(s)}) Tj ET`,
    );
  const rect = (x: number, yy: number, w: number, h: number, colour: Colour) =>
    ops.push(
      `${COLOURS[colour]} rg ${x.toFixed(1)} ${yy.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)} re f`,
    );
  const need = (h: number) => {
    if (y - h >= 72) return;
    pages.push(ops);
    ops = [];
    rect(0, H - 8, W, 8, 'teal');
    y = H - 48;
  };
  const line = (
    s: string,
    x: number,
    size: number,
    bold: boolean,
    colour: Colour,
    lineHeight: number,
  ) => {
    y -= lineHeight;
    text(s, x, y, size, bold, colour);
  };

  rect(0, H - 92, W, 92, 'teal');
  text('Tukai', X, H - 54, 22, true, 'white');
  text('Itinerary', R - textWidth('Itinerary', 11, true), H - 52, 11, true, 'lime');
  y = H - 92 - 28;
  wrap(plan.title, 26, true, R - X).forEach((l) => line(l, X, 26, true, 'ink', 32));
  const stops = plan.days.reduce((n, d) => n + d.stops.length, 0);
  line(
    `${plan.days.length} ${plan.days.length === 1 ? 'day' : 'days'} · ${stops} ${stops === 1 ? 'stop' : 'stops'} · Planned with TukAI`,
    X,
    11,
    false,
    'sec',
    22,
  );
  y -= 18;

  plan.days.forEach((day, di) => {
    const titleLines = day.title ? wrap(day.title, 12.5, true, R - X) : [];
    need(64 + titleLines.length * 18);
    rect(X, y - 1, R - X, 0.8, 'rule');
    y -= 8;
    line(`Day ${di + 1}`, X, 15, true, 'green', 22);
    titleLines.forEach((l) => line(l, X, 12.5, true, 'ink', 18));
    y -= 6;

    day.stops.forEach((stop, si) => {
      const item = items[stop.id];
      const name = wrap(item?.title || 'Stop', 12.5, true, R - TX);
      const kind = clean(item ? [item.category, item.area].filter(Boolean).join(' · ') : '');
      const note = stop.note ? wrap(stop.note, 10.5, false, R - TX) : [];
      need(name.length * 17 + (kind ? 15 : 0) + note.length * 15 + 14);
      y -= 17;
      text(
        stop.time ? toTwelveHour(stop.time) : 'Any time',
        X,
        y,
        11,
        true,
        stop.time ? 'ink' : 'sec',
      );
      text(name[0], TX, y, 12.5, true, 'ink');
      const end = stopEnd(day.stops, si);
      if (end) text(`to ${toTwelveHour(end)}`, X, y - 15, 10, false, 'sec');
      name.slice(1).forEach((l) => line(l, TX, 12.5, true, 'ink', 17));
      if (kind) line(kind, TX, 10.5, false, 'sec', 15);
      note.forEach((l) => line(l, TX, 10.5, false, 'ink', 15));
      y -= 12;
    });
    y -= 14;
  });
  pages.push(ops);

  pages.forEach((page, i) => {
    ops = page;
    text('Planned with TukAI on tukai.co. Nothing in this plan is booked.', X, 40, 9, false, 'sec');
    const label = `${i + 1} of ${pages.length}`;
    text(label, R - textWidth(label, 9, false), 40, 9, false, 'sec');
  });

  const objects: string[] = [
    '',
    '<< /Type /Catalog /Pages 2 0 R >>',
    `<< /Type /Pages /Kids [${pages.map((_, i) => `${5 + 2 * i} 0 R`).join(' ')}] /Count ${pages.length} >>`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
  ];
  pages.forEach((page, i) => {
    const stream = page.join('\n');
    objects[5 + 2 * i] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${6 + 2 * i} 0 R >>`;
    objects[6 + 2 * i] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });

  let out = '%PDF-1.4\n';
  const offsets: number[] = [];
  for (let i = 1; i < objects.length; i++) {
    offsets.push(out.length);
    out += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xref = out.length;
  out += `xref\n0 ${objects.length}\n0000000000 65535 f \n${offsets
    .map((o) => `${String(o).padStart(10, '0')} 00000 n \n`)
    .join('')}trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return out;
};
