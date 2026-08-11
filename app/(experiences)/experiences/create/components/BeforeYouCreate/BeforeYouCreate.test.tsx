import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Experience } from '@/types/experience';

import { BeforeYouCreate } from './index';

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { id: 'u1' } } }),
}));

let mockExperiences: Partial<Experience>[] = [];
let mockIsLoading = false;
const mockUseExperiences = jest.fn();

// Stands in for the API: the hook receives a `search` param and the backend
// returns the narrowed list, so the component itself does no filtering
jest.mock('@/app/shared/hooks/useExperiences', () => ({
  useExperiences: (params: { search?: string }, enabled: boolean) => {
    mockUseExperiences(params, enabled);

    const query = params.search?.toLowerCase();
    const results = query
      ? mockExperiences.filter((experience) => experience.title?.toLowerCase().includes(query))
      : mockExperiences;

    return { data: { data: { results } }, isLoading: mockIsLoading };
  },
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
  jest.clearAllMocks();
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

  it('queries the API scoped to the creator, with no search term initially', () => {
    renderGate();

    expect(mockUseExperiences).toHaveBeenCalledWith(
      { page: 1, page_size: 100, hosted_by: 'u1', search: undefined },
      true,
    );
  });

  it('sends the typed term to the API and renders what it returns', async () => {
    const user = userEvent.setup();
    renderGate();

    await user.type(screen.getByLabelText('Search your experiences by name'), 'karura');

    await waitFor(() =>
      expect(mockUseExperiences).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: 'karura', hosted_by: 'u1' }),
        true,
      ),
    );

    expect(screen.getByText('Karura Forest Walk')).toBeInTheDocument();
    expect(screen.queryByText('Ngong Hills Ridge')).not.toBeInTheDocument();
    expect(screen.getByText('1 Experience')).toBeInTheDocument();
  });

  it('debounces so a request is not issued per keystroke', async () => {
    const user = userEvent.setup();
    renderGate();

    const searchTerms = () =>
      mockUseExperiences.mock.calls
        .map(([params]) => params.search)
        .filter((term: string | undefined) => Boolean(term));

    await user.type(screen.getByLabelText('Search your experiences by name'), 'karura');

    // Mid-typing prefixes must never reach the API
    expect(searchTerms()).not.toContain('kar');
    await waitFor(() => expect(searchTerms()).toContain('karura'));
  });

  it('offers to create the experience when the search matches nothing', async () => {
    const user = userEvent.setup();
    renderGate();

    await user.type(screen.getByLabelText('Search your experiences by name'), 'kilimanjaro');

    await waitFor(() =>
      expect(screen.getByText(/doesn't exist yet — go ahead and create it/)).toBeInTheDocument(),
    );
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
