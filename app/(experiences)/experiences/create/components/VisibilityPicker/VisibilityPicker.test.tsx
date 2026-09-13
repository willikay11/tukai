import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { VisibilityPicker } from './index';

jest.mock('@/components/ui/pillRadioGroup', () => ({
  PillRadioGroup: ({ options, value, onChange }: any) => (
    <div>
      {options.map((option: any) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          data-selected={value === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  ),
}));

describe('VisibilityPicker', () => {
  describe('Rendering', () => {
    it('renders the component', () => {
      const onChange = jest.fn();
      const { container } = render(<VisibilityPicker value="public" onChange={onChange} />);
      expect(container).toBeInTheDocument();
    });

    it('renders the label', () => {
      const onChange = jest.fn();
      render(<VisibilityPicker value="public" onChange={onChange} />);
      expect(screen.getByText(/Experience visibility/i)).toBeInTheDocument();
    });

    it('renders public option', () => {
      const onChange = jest.fn();
      render(<VisibilityPicker value="public" onChange={onChange} />);
      expect(screen.getByText(/Public \(Everyone\)/)).toBeInTheDocument();
    });

    it('renders private option', () => {
      const onChange = jest.fn();
      render(<VisibilityPicker value="public" onChange={onChange} />);
      expect(screen.getByText(/Private \(Only invited people\)/)).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('selects public option when value is public', () => {
      const onChange = jest.fn();
      render(<VisibilityPicker value="public" onChange={onChange} />);
      const publicButton = screen.getByText(/Public \(Everyone\)/);
      expect(publicButton.getAttribute('data-selected')).toBe('true');
    });

    it('selects private option when value is private', () => {
      const onChange = jest.fn();
      render(<VisibilityPicker value="private" onChange={onChange} />);
      const privateButton = screen.getByText(/Private \(Only invited people\)/);
      expect(privateButton.getAttribute('data-selected')).toBe('true');
    });

    it('does not select public when value is private', () => {
      const onChange = jest.fn();
      render(<VisibilityPicker value="private" onChange={onChange} />);
      const publicButton = screen.getByText(/Public \(Everyone\)/);
      expect(publicButton.getAttribute('data-selected')).toBe('false');
    });
  });

  describe('User Interactions', () => {
    it('calls onChange when public option is clicked', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<VisibilityPicker value="private" onChange={onChange} />);
      const publicButton = screen.getByText(/Public \(Everyone\)/);

      await user.click(publicButton);

      expect(onChange).toHaveBeenCalledWith('public');
    });

    it('calls onChange when private option is clicked', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<VisibilityPicker value="public" onChange={onChange} />);
      const privateButton = screen.getByText(/Private \(Only invited people\)/);

      await user.click(privateButton);

      expect(onChange).toHaveBeenCalledWith('private');
    });

    it('can switch from public to private', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      const { rerender } = render(<VisibilityPicker value="public" onChange={onChange} />);

      const privateButton = screen.getByText(/Private \(Only invited people\)/);
      await user.click(privateButton);
      expect(onChange).toHaveBeenCalledWith('private');

      rerender(<VisibilityPicker value="private" onChange={onChange} />);
      expect(privateButton.getAttribute('data-selected')).toBe('true');
    });

    it('can switch from private to public', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      const { rerender } = render(<VisibilityPicker value="private" onChange={onChange} />);

      const publicButton = screen.getByText(/Public \(Everyone\)/);
      await user.click(publicButton);
      expect(onChange).toHaveBeenCalledWith('public');

      rerender(<VisibilityPicker value="public" onChange={onChange} />);
      expect(publicButton.getAttribute('data-selected')).toBe('true');
    });
  });

  describe('Prop Updates', () => {
    it('updates selection when value prop changes', () => {
      const onChange = jest.fn();
      const { rerender } = render(<VisibilityPicker value="public" onChange={onChange} />);
      const publicButton = screen.getByText(/Public \(Everyone\)/);
      expect(publicButton.getAttribute('data-selected')).toBe('true');

      rerender(<VisibilityPicker value="private" onChange={onChange} />);
      const privateButton = screen.getByText(/Private \(Only invited people\)/);
      expect(privateButton.getAttribute('data-selected')).toBe('true');
    });

    it('maintains state through multiple rerenders', () => {
      const onChange = jest.fn();
      const { rerender } = render(<VisibilityPicker value="public" onChange={onChange} />);

      rerender(<VisibilityPicker value="public" onChange={onChange} />);
      rerender(<VisibilityPicker value="public" onChange={onChange} />);

      const publicButton = screen.getByText(/Public \(Everyone\)/);
      expect(publicButton.getAttribute('data-selected')).toBe('true');
    });
  });

  describe('Accessibility', () => {
    it('has accessible label', () => {
      const onChange = jest.fn();
      render(<VisibilityPicker value="public" onChange={onChange} />);
      const label = screen.getByText(/Experience visibility/i);
      expect(label).toBeInTheDocument();
      expect(label.className).toContain('font-medium');
    });

    it('buttons are focusable', async () => {
      const onChange = jest.fn();
      render(<VisibilityPicker value="public" onChange={onChange} />);
      const publicButton = screen.getByText(/Public \(Everyone\)/);

      publicButton.focus();
      expect(document.activeElement).toBe(publicButton);
    });
  });
});
