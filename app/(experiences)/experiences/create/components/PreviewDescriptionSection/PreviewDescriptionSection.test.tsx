import { render, screen } from '@testing-library/react';

import { PreviewDescriptionSection } from './index';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: any) => <span>{iconName}</span>,
}));

describe('PreviewDescriptionSection', () => {
  describe('Rendering', () => {
    it('renders the component', () => {
      const { container } = render(
        <PreviewDescriptionSection description="<p>Test Description</p>" />,
      );
      expect(container).toBeInTheDocument();
    });

    it('displays the description text', () => {
      render(<PreviewDescriptionSection description="<p>A wonderful experience awaits</p>" />);
      expect(screen.getByText('A wonderful experience awaits')).toBeInTheDocument();
    });

    it('displays edit icon when onEdit provided', () => {
      const onEdit = jest.fn();
      render(<PreviewDescriptionSection description="<p>Test</p>" onEdit={onEdit} />);
      expect(screen.getByText('Edit02Icon')).toBeInTheDocument();
    });

    it('does not display edit icon when onEdit not provided', () => {
      render(<PreviewDescriptionSection description="<p>Test</p>" />);
      expect(screen.queryByText('Edit02Icon')).not.toBeInTheDocument();
    });
  });

  describe('HTML Description Display', () => {
    it('renders HTML formatted description', () => {
      render(<PreviewDescriptionSection description="<p>First line</p><p>Second line</p>" />);
      expect(screen.getByText('First line')).toBeInTheDocument();
      expect(screen.getByText('Second line')).toBeInTheDocument();
    });

    it('renders description with list items', () => {
      render(<PreviewDescriptionSection description="<ul><li>Item 1</li><li>Item 2</li></ul>" />);
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('renders description with bold text', () => {
      render(<PreviewDescriptionSection description="<p>This is <strong>important</strong></p>" />);
      expect(screen.getByText('This is')).toBeInTheDocument();
      expect(screen.getByText('important')).toBeInTheDocument();
    });

    it('renders empty description', () => {
      const { container } = render(<PreviewDescriptionSection description="" />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Edit Functionality', () => {
    it('calls onEdit when edit button clicked', () => {
      const onEdit = jest.fn();
      render(<PreviewDescriptionSection description="<p>Test</p>" onEdit={onEdit} />);
      const editButton = screen.getByText('Edit02Icon').closest('button');
      editButton?.click();
      expect(onEdit).toHaveBeenCalled();
    });
  });
});
