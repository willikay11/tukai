import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { fetchExperience } from '@/services/experience';

import ReserveExperiencePage from './page';

// Mock dependencies
jest.mock('@/services/experience', () => ({
  fetchExperience: jest.fn(),
}));

jest.mock('../../components/reserve', () => {
  return function MockReserve({ experience }: { experience: { id: string; title: string } }) {
    return (
      <div data-testid="reserve-component">
        <h2>{experience.title}</h2>
        <p>Experience ID: {experience.id}</p>
      </div>
    );
  };
});

const mockExperienceData = {
  id: '456',
  title: 'Concert Experience',
  description: 'Amazing concert experience',
  startDate: '2024-03-25T19:00:00Z',
  endDate: '2024-03-25T23:00:00Z',
  currency: 'GHS',
  isPaid: true,
  tickets: [
    {
      id: 't1',
      name: 'General Admission',
      price: 50,
      availableQuantity: 100,
    },
    {
      id: 't2',
      name: 'VIP',
      price: 150,
      availableQuantity: 20,
    },
  ],
  photos: [{ id: '1', photo: 'https://example.com/photo1.jpg', isCover: true }],
};

describe('ReserveExperiencePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render nothing when experience data is not available', async () => {
    (fetchExperience as jest.Mock).mockResolvedValue({
      data: null,
    });

    const { container } = render(await ReserveExperiencePage({ params: { experienceId: '456' } }));

    expect(container).toBeEmptyDOMElement();
  });

  it('should fetch experience data with correct experienceId', async () => {
    (fetchExperience as jest.Mock).mockResolvedValue({
      data: mockExperienceData,
    });

    render(await ReserveExperiencePage({ params: { experienceId: '456' } }));

    expect(fetchExperience).toHaveBeenCalledWith('456');
  });

  it('should render the Reserve component with experience data', async () => {
    (fetchExperience as jest.Mock).mockResolvedValue({
      data: mockExperienceData,
    });

    render(await ReserveExperiencePage({ params: { experienceId: '456' } }));

    const reserveComponent = screen.getByTestId('reserve-component');
    expect(reserveComponent).toBeInTheDocument();
    expect(screen.getByText('Concert Experience')).toBeInTheDocument();
    expect(screen.getByText('Experience ID: 456')).toBeInTheDocument();
  });

  it('should render main container with correct grid layout', async () => {
    (fetchExperience as jest.Mock).mockResolvedValue({
      data: mockExperienceData,
    });

    render(await ReserveExperiencePage({ params: { experienceId: '456' } }));

    const main = screen.getByRole('main');
    expect(main).toHaveClass('grid', 'grid-cols-12', 'gap-4');
  });

  it('should have correct responsive column classes', async () => {
    (fetchExperience as jest.Mock).mockResolvedValue({
      data: mockExperienceData,
    });

    render(await ReserveExperiencePage({ params: { experienceId: '456' } }));

    const main = screen.getByRole('main');
    const contentDiv = main.querySelector('div');

    expect(contentDiv).toHaveClass(
      'col-span-12',
      'mx-4',
      'mt-4',
      'md:col-span-10',
      'md:col-start-2',
      'md:mx-0',
      'lg:col-span-6',
      'lg:col-start-4',
      'lg:mx-0',
      '2xl:col-span-4',
      '2xl:col-start-5',
      '2xl:mx-0',
    );
  });

  it('should handle API errors gracefully', async () => {
    (fetchExperience as jest.Mock).mockRejectedValue(new Error('API Error'));

    await expect(ReserveExperiencePage({ params: { experienceId: '456' } })).rejects.toThrow(
      'API Error',
    );
  });

  it('should pass the complete experience object to Reserve component', async () => {
    (fetchExperience as jest.Mock).mockResolvedValue({
      data: mockExperienceData,
    });

    render(await ReserveExperiencePage({ params: { experienceId: '456' } }));

    // Verify Reserve component is called with experience data
    expect(screen.getByTestId('reserve-component')).toBeInTheDocument();
  });
});
