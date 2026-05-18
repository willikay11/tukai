import { render, screen } from '@testing-library/react';
import { PreviewLocationSection } from './PreviewLocationSection';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: any) => <span>{iconName}</span>,
}));

describe('PreviewLocationSection', () => {
  it('renders section title', () => {
    render(<PreviewLocationSection location={null} />);
    expect(screen.getByText('Experience Location')).toBeInTheDocument();
  });

  it('displays "Not set yet" when location is not provided', () => {
    render(<PreviewLocationSection location={null} />);
    expect(screen.getByText('Not set yet')).toBeInTheDocument();
  });

  it('displays location when provided', () => {
    render(<PreviewLocationSection location="Nairobi, Kenya" />);
    expect(screen.getByText('Nairobi, Kenya')).toBeInTheDocument();
  });

  it('renders edit button when onEdit is provided', () => {
    const onEdit = jest.fn();
    render(<PreviewLocationSection location={null} onEdit={onEdit} />);
    const editButton = screen.getByRole('button');
    expect(editButton).toBeInTheDocument();
  });
});
