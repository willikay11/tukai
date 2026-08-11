import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Experience } from '@/types/experience';

import { BeforeYouCreate } from './index';

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { id: 'u1' } } }),
}));

let mockExperiences: Partial<Experience>[] = [];
let mockIsLoading = false;
jest.mock('@/app/shared/hooks/useExperiences', () => ({
  useExperiences: () => ({
    data: { data: { results: mockExperiences } },
    isLoading: mockIsLoading,
  }),
}));

// HostingCard pulls in next/image and the status badge; the gate's own
// behaviour is the list, the filter and the two entry points
jest.mock('@/app/(experiences)/experiences/components/HostingCard', () => ({
  HostingCard: ({ experience }: { experience: Experience }) => <div>{experience.title}</div>,
}));

const experiences = [
  { id: '1', title: 'Ngong Hills Ridge' },
  { id: '2', title: 'Karura Forest Walk' },
  { id: '3', title: 'Lake Naivasha Boat Ride' },
] as Partial<Experience>[];

const renderGate = (props: Partial<React.ComponentProps<typeof BeforeYouCreate>> = {}) =>
  render(<BeforeYouCreate onCreateNew={jest.fn()} onStartFromScratch={jest.fn()} {...props} />);

beforeEach(() => {
  mockExperiences = experiences;
  mockIsLoading = false;
});

describe('BeforeYouCreate', () => {
  it('lists every experience the creator has made with a count', () => {
    renderGate();

    expect(screen.getByText('3 Experiences')).toBeInTheDocument();
    expect(screen.getByText('Ngong Hills Ridge')).toBeInTheDocument();
    expect(screen.getByText('Lake Naivasha Boat Ride')).toBeInTheDocument();
  });

  it('filters the list by name as the user types', async () => {
    const user = userEvent.setup();
    renderGate();

    await user.type(screen.getByLabelText('Search your experiences by name'), 'karura');

    expect(screen.getByText('Karura Forest Walk')).toBeInTheDocument();
    expect(screen.queryByText('Ngong Hills Ridge')).not.toBeInTheDocument();
    expect(screen.getByText('1 Experience')).toBeInTheDocument();
  });

  it('offers to create the experience when the search matches nothing', async () => {
    const user = userEvent.setup();
    renderGate();

    await user.type(screen.getByLabelText('Search your experiences by name'), 'kilimanjaro');

    expect(screen.getByText(/doesn't exist yet — go ahead and create it/)).toBeInTheDocument();
  });

  it('shows an empty state when the creator has nothing yet', () => {
    mockExperiences = [];
    renderGate();

    expect(screen.getByText("You haven't created any experiences yet.")).toBeInTheDocument();
  });

  it('proceeds from both entry points', async () => {
    const user = userEvent.setup();
    const onCreateNew = jest.fn();
    const onStartFromScratch = jest.fn();
    renderGate({ onCreateNew, onStartFromScratch });

    await user.click(screen.getByRole('button', { name: /create new experience/i }));
    expect(onCreateNew).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /start from scratch/i }));
    expect(onStartFromScratch).toHaveBeenCalled();
  });

  it('shows skeletons while loading', () => {
    mockIsLoading = true;
    renderGate();

    expect(screen.queryByText('Ngong Hills Ridge')).not.toBeInTheDocument();
  });
});
