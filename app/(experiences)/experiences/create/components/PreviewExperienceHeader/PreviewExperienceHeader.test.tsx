import { render, screen } from '@testing-library/react';

import { PreviewExperienceHeader } from './PreviewExperienceHeader';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: any) => <span>{iconName}</span>,
}));

describe('PreviewExperienceHeader', () => {
  it('renders section title', () => {
    render(<PreviewExperienceHeader photo={null} title="" description="" />);
    expect(screen.getByText('Experience Title & Photo')).toBeInTheDocument();
  });

  it('displays "Not set yet" when photo and title are not provided', () => {
    render(<PreviewExperienceHeader photo={null} title="" description="" />);
    expect(screen.getByText('Not set yet')).toBeInTheDocument();
  });

  it('displays title and description when provided', () => {
    render(
      <PreviewExperienceHeader
        photo="https://example.com/image.jpg"
        title="Test Experience"
        description="This is a test experience"
      />,
    );
    expect(screen.getByText('Test Experience')).toBeInTheDocument();
    expect(screen.getByText('This is a test experience')).toBeInTheDocument();
  });

  it('renders edit button when onEdit is provided', () => {
    const onEdit = jest.fn();
    render(<PreviewExperienceHeader photo={null} title="" description="" onEdit={onEdit} />);
    const editButton = screen.getByRole('button');
    expect(editButton).toBeInTheDocument();
  });
});
