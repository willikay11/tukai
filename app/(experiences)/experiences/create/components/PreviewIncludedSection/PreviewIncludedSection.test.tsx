import { render, screen } from '@testing-library/react';

import { PreviewIncludedSection } from './PreviewIncludedSection';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: any) => <span>{iconName}</span>,
}));

describe('PreviewIncludedSection', () => {
  it('renders section title', () => {
    render(<PreviewIncludedSection items={[]} />);
    expect(screen.getByText("What's Included")).toBeInTheDocument();
  });

  it('displays "Not set yet" when items are empty', () => {
    render(<PreviewIncludedSection items={[]} />);
    expect(screen.getByText('Not set yet')).toBeInTheDocument();
  });

  it('displays list items when provided', () => {
    const items = ['Item 1', 'Item 2', 'Item 3'];
    render(<PreviewIncludedSection items={items} />);
    items.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  it('renders edit button when onEdit is provided', () => {
    const onEdit = jest.fn();
    render(<PreviewIncludedSection items={[]} onEdit={onEdit} />);
    const editButton = screen.getByRole('button');
    expect(editButton).toBeInTheDocument();
  });
});
