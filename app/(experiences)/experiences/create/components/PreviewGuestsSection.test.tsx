import { render, screen } from '@testing-library/react';
import { PreviewGuestsSection } from './PreviewGuestsSection';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: any) => <span>{iconName}</span>,
}));

describe('PreviewGuestsSection', () => {
  const mockGuests = [
    { id: '1', name: 'Alice Johnson', email: 'alice@example.com', avatarUrl: null },
    { id: '2', name: 'Bob Smith', email: 'bob@example.com', avatarUrl: 'https://example.com/bob.jpg' },
  ];

  it('renders guest count in title', () => {
    render(<PreviewGuestsSection guests={mockGuests} />);
    expect(screen.getByText('Guests (2)')).toBeInTheDocument();
  });

  it('renders "No guests invited yet" when empty', () => {
    render(<PreviewGuestsSection guests={[]} />);
    expect(screen.getByText('No guests invited yet')).toBeInTheDocument();
  });

  it('renders initials for guests without avatar', () => {
    render(<PreviewGuestsSection guests={[mockGuests[0]]} />);
    expect(screen.getByText('AJ')).toBeInTheDocument();
  });

  it('renders avatar image when available', () => {
    render(<PreviewGuestsSection guests={[mockGuests[1]]} />);
    const img = screen.getByAltText('Bob Smith') as HTMLImageElement;
    expect(img).toHaveAttribute('src', 'https://example.com/bob.jpg');
  });

  it('shows overflow badge when guests exceed 8', () => {
    const manyGuests = Array.from({ length: 10 }, (_, i) => ({
      id: `${i}`,
      name: `Guest ${i}`,
      email: `guest${i}@example.com`,
      avatarUrl: null,
    }));

    render(<PreviewGuestsSection guests={manyGuests} />);
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('calls onEdit when edit button clicked', () => {
    const onEdit = jest.fn();
    render(<PreviewGuestsSection guests={mockGuests} onEdit={onEdit} />);

    const editButton = screen.getByRole('button');
    editButton.click();

    expect(onEdit).toHaveBeenCalled();
  });

  it('shows guest names as tooltips', () => {
    render(<PreviewGuestsSection guests={[mockGuests[0]]} />);
    const avatar = screen.getByTitle('Alice Johnson');
    expect(avatar).toBeInTheDocument();
  });
});
