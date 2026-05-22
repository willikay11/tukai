import { render, screen } from '@testing-library/react';

import { PreviewExcludedSection } from './PreviewExcludedSection';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: any) => <span>{iconName}</span>,
}));

describe('PreviewExcludedSection', () => {
  it('renders section title', () => {
    render(<PreviewExcludedSection items={[]} />);
    expect(screen.getByText("What's Not Included")).toBeInTheDocument();
  });

  it('displays "Not set yet" when items are empty', () => {
    render(<PreviewExcludedSection items={[]} />);
    expect(screen.getByText('Not set yet')).toBeInTheDocument();
  });

  it('displays list items when provided', () => {
    const items = ['Excluded 1', 'Excluded 2'];
    render(<PreviewExcludedSection items={items} />);
    items.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  it('renders edit button when onEdit is provided', () => {
    const onEdit = jest.fn();
    render(<PreviewExcludedSection items={[]} onEdit={onEdit} />);
    const editButton = screen.getByRole('button');
    expect(editButton).toBeInTheDocument();
  });
});
