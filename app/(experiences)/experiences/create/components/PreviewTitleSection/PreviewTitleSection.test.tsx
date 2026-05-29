import { render, screen } from '@testing-library/react';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: any) => <span>{iconName}</span>,
}));

import { PreviewTitleSection } from './index';

describe('PreviewTitleSection', () => {
  describe('Rendering', () => {
    it('renders the component', () => {
      const { container } = render(<PreviewTitleSection title="Test Title" />);
      expect(container).toBeInTheDocument();
    });

    it('displays the title text', () => {
      render(<PreviewTitleSection title="Amazing Adventure" />);
      expect(screen.getByText('Amazing Adventure')).toBeInTheDocument();
    });

    it('displays edit icon when onEdit provided', () => {
      const onEdit = jest.fn();
      render(
        <PreviewTitleSection title="Test Title" onEdit={onEdit} />
      );
      expect(screen.getByText('Edit02Icon')).toBeInTheDocument();
    });

    it('does not display edit icon when onEdit not provided', () => {
      render(<PreviewTitleSection title="Test Title" />);
      expect(screen.queryByText('Edit02Icon')).not.toBeInTheDocument();
    });
  });

  describe('Title Display', () => {
    it('renders long titles', () => {
      const longTitle = 'This is a very long experience title that goes on and on';
      render(<PreviewTitleSection title={longTitle} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('renders titles with special characters', () => {
      const titleWithSpecialChars = 'Experience & Adventure - The Best!';
      render(<PreviewTitleSection title={titleWithSpecialChars} />);
      expect(screen.getByText(titleWithSpecialChars)).toBeInTheDocument();
    });

    it('renders empty title', () => {
      const { container } = render(<PreviewTitleSection title="" />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Edit Functionality', () => {
    it('calls onEdit when edit button clicked', () => {
      const onEdit = jest.fn();
      render(
        <PreviewTitleSection title="Test Title" onEdit={onEdit} />
      );
      const editButton = screen.getByText('Edit02Icon').closest('button');
      editButton?.click();
      expect(onEdit).toHaveBeenCalled();
    });

    it('does not call onEdit when edit button not present', () => {
      const onEdit = jest.fn();
      render(<PreviewTitleSection title="Test Title" />);
      expect(onEdit).not.toHaveBeenCalled();
    });
  });
});
