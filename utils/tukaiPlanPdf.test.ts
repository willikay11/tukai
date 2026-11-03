import type { TukaiPlan } from '@/types/tukai';

import { buildTukaiPlanPdf, tukaiPlanPdfName } from './tukaiPlanPdf';

const plan: TukaiPlan = {
  title: 'A slow Saturday: Nairobi (city)',
  tip: '',
  days: [
    {
      title: 'Galleries',
      stops: [{ id: 'p1', time: '10:00', end: '', note: 'Quiet – before noon' }],
    },
  ],
};

describe('buildTukaiPlanPdf', () => {
  it('writes a PDF in 7-bit ASCII, with the footer and the escaped title', () => {
    const pdf = buildTukaiPlanPdf(plan, {});
    expect(pdf.startsWith('%PDF-1.4')).toBe(true);
    expect(pdf.trimEnd().endsWith('%%EOF')).toBe(true);
    // eslint-disable-next-line no-control-regex
    expect(/^[\x00-\x7F]*$/.test(pdf)).toBe(true);
    expect(pdf).toContain('Nothing in this plan is booked.');
    expect(pdf).toContain('\\(city\\)');
    expect(pdf).toContain('1 of 1');
  });

  it('names the file after the plan, without characters a file name cannot hold', () => {
    expect(tukaiPlanPdfName(plan)).toBe('A slow Saturday Nairobi (city).pdf');
    expect(tukaiPlanPdfName({ ...plan, title: '' })).toBe('Itinerary.pdf');
  });
});
