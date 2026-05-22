import { render, screen } from '@testing-library/react';

import { PreviewCategoriesSection } from './PreviewCategoriesSection';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: any) => <span>{iconName}</span>,
}));

describe('PreviewCategoriesSection', () => {
  it('renders section title', () => {
    render(<PreviewCategoriesSection categories={[]} />);
    expect(screen.getByText('Categories')).toBeInTheDocument();
  });

  it('displays "Not set yet" when categories are empty', () => {
    render(<PreviewCategoriesSection categories={[]} />);
    expect(screen.getByText('Not set yet')).toBeInTheDocument();
  });

  it('displays categories as pills when provided', () => {
    const categories = ['Adventure', 'Outdoor', 'Hiking'];
    render(<PreviewCategoriesSection categories={categories} />);
    categories.forEach((category) => {
      expect(screen.getByText(category)).toBeInTheDocument();
    });
  });

  it('renders edit button when onEdit is provided', () => {
    const onEdit = jest.fn();
    render(<PreviewCategoriesSection categories={[]} onEdit={onEdit} />);
    const editButton = screen.getByRole('button');
    expect(editButton).toBeInTheDocument();
  });
});
