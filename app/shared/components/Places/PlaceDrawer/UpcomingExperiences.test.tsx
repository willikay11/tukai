import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { Experience } from '@/types/experience';

import { UpcomingExperiences } from './UpcomingExperiences';

const useExperiences = jest.fn();

jest.mock('@/app/shared/hooks/useExperiences', () => ({
  useExperiences: (...args: unknown[]) => useExperiences(...args),
}));
jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: () => <span />,
}));
jest.mock('@/app/(experiences)/components/ExperienceCard', () => ({
  ExperienceCard: ({ experience }: { experience: Experience }) => (
    <a href={`/experiences/${experience.id}`}>{experience.title}</a>
  ),
}));

const experienceOn = (id: string, date: Date): Experience =>
  ({
    id,
    title: id,
    startDate: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 10).toISOString(),
  }) as unknown as Experience;

const givenExperiences = (results: Experience[]) =>
  useExperiences.mockReturnValue({ data: { data: { results } }, isLoading: false });

describe('UpcomingExperiences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('names the place under the heading', () => {
    givenExperiences([]);

    render(<UpcomingExperiences placeId="p1" placeTitle="Kazuri Beads" />);

    expect(screen.getByRole('heading', { name: 'Upcoming experiences' })).toBeInTheDocument();
    expect(screen.getByText('Upcoming experiences at Kazuri Beads')).toBeInTheDocument();
  });

  it('names the day in the empty copy', () => {
    givenExperiences([]);

    render(<UpcomingExperiences placeId="p1" placeTitle="Kazuri Beads" />);

    expect(
      screen.getByText(/Nothing on at Kazuri Beads on .+ Try another day\./),
    ).toBeInTheDocument();
  });

  it('disables the back arrow on the current week', () => {
    givenExperiences([]);

    render(<UpcomingExperiences placeId="p1" placeTitle="Kazuri Beads" />);

    expect(screen.getByRole('button', { name: 'Previous week' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next week' })).toBeEnabled();
  });

  it('stops the forward arrow twelve weeks ahead', () => {
    givenExperiences([]);

    render(<UpcomingExperiences placeId="p1" placeTitle="Kazuri Beads" />);

    const next = screen.getByRole('button', { name: 'Next week' });
    for (let step = 0; step < 12; step += 1) fireEvent.click(next);

    expect(next).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Previous week' })).toBeEnabled();
  });

  it('shows the experiences on the selected day', () => {
    const today = new Date();
    givenExperiences([experienceOn('today-show', today)]);

    render(<UpcomingExperiences placeId="p1" placeTitle="Kazuri Beads" />);

    expect(screen.getByText('today-show')).toBeInTheDocument();
  });
});
