import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { Experience } from '@/types/experience';

import { ExperienceDrawerFooter } from './ExperienceDrawerFooter';

jest.mock('@/context/PlanContext', () => ({
  usePlans: () => ({ plans: [], createPlan: jest.fn(), addStop: jest.fn(), setPlanDate: jest.fn() }),
}));
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast: jest.fn() }) }));
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));

const experience = (overrides: Partial<Experience> = {}) =>
  ({
    id: 'e1',
    title: 'Pottery for beginners',
    startDate: '2026-10-03T10:00:00Z',
    endDate: '2026-10-03T12:00:00Z',
    isPaid: true,
    priceStartsFrom: { amount: 1800, currency: 'KES' },
    location: { city: 'Nairobi' },
    photos: [],
    ...overrides,
  }) as unknown as Experience;

describe('ExperienceDrawerFooter', () => {
  it('sends the reader to the experience page to book', () => {
    render(<ExperienceDrawerFooter experience={experience()} />);

    expect(screen.getByRole('link', { name: /Make reservation/ })).toHaveAttribute(
      'href',
      '/experiences/e1',
    );
  });

  it('shows the price and when it runs', () => {
    render(<ExperienceDrawerFooter experience={experience()} />);

    expect(screen.getByText('KES 1,800/person')).toBeInTheDocument();
    expect(
      screen.getByText(/Sat 3 Oct, \d{1,2}:\d{2} [AP]M - \d{1,2}:\d{2} [AP]M/),
    ).toBeInTheDocument();
  });

  // Planning is not booking, so it is not gated behind the push to the full
  // page the way ticket holding and booking are (ED-11)
  it('opens Plan this without leaving the drawer', () => {
    render(<ExperienceDrawerFooter experience={experience()} />);

    expect(screen.queryByText('Nairobi')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /plan this/i }));

    expect(screen.getByText('Pottery for beginners')).toBeInTheDocument();
    expect(screen.getByText('Nairobi')).toBeInTheDocument();
  });
});
