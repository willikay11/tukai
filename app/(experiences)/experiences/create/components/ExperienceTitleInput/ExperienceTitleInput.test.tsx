import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ExperienceTitleInput } from './index';

describe('ExperienceTitleInput', () => {
  describe('Rendering', () => {
    it('renders the component', () => {
      const onChange = jest.fn();
      const { container } = render(
        <ExperienceTitleInput value="" onChange={onChange} />
      );
      expect(container).toBeInTheDocument();
    });

    it('renders the label', () => {
      const onChange = jest.fn();
      render(<ExperienceTitleInput value="" onChange={onChange} />);
      expect(screen.getByLabelText('Experience Title')).toBeInTheDocument();
    });

    it('renders input with placeholder', () => {
      const onChange = jest.fn();
      render(<ExperienceTitleInput value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Enter experience title');
      expect(input).toBeInTheDocument();
    });

    it('displays error message when error is provided', () => {
      const onChange = jest.fn();
      render(
        <ExperienceTitleInput
          value=""
          onChange={onChange}
          error="Title is required"
        />
      );
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });

    it('does not display error message when no error', () => {
      const onChange = jest.fn();
      render(<ExperienceTitleInput value="" onChange={onChange} />);
      expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
    });
  });

  describe('Input Value', () => {
    it('displays the current value in the input', () => {
      const onChange = jest.fn();
      render(
        <ExperienceTitleInput
          value="Amazing Adventure"
          onChange={onChange}
        />
      );
      const input = screen.getByDisplayValue('Amazing Adventure');
      expect(input).toBeInTheDocument();
    });

    it('updates input value when prop changes', () => {
      const onChange = jest.fn();
      const { rerender } = render(
        <ExperienceTitleInput value="Old Title" onChange={onChange} />
      );
      expect(screen.getByDisplayValue('Old Title')).toBeInTheDocument();

      rerender(
        <ExperienceTitleInput value="New Title" onChange={onChange} />
      );
      expect(screen.getByDisplayValue('New Title')).toBeInTheDocument();
    });

    it('handles empty value', () => {
      const onChange = jest.fn();
      render(<ExperienceTitleInput value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Enter experience title') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('handles very long titles', () => {
      const longTitle = 'A'.repeat(200);
      const onChange = jest.fn();
      render(
        <ExperienceTitleInput value={longTitle} onChange={onChange} />
      );
      expect(screen.getByDisplayValue(longTitle)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('triggers onChange on input change', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<ExperienceTitleInput value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Enter experience title');

      await user.type(input, 'Test', { delay: 1 });

      expect(onChange).toHaveBeenCalled();
    });

    it('input is editable', () => {
      const onChange = jest.fn();
      render(<ExperienceTitleInput value="Initial" onChange={onChange} />);
      const input = screen.getByDisplayValue('Initial') as HTMLInputElement;
      
      expect(input.readOnly).toBe(false);
    });
  });

  describe('Error State', () => {
    it('applies red border when error exists', () => {
      const onChange = jest.fn();
      const { container } = render(
        <ExperienceTitleInput
          value=""
          onChange={onChange}
          error="Title is required"
        />
      );
      const input = container.querySelector('input');
      expect(input?.className).toContain('border-red-500');
    });

    it('removes error styling when error is cleared', () => {
      const onChange = jest.fn();
      const { container, rerender } = render(
        <ExperienceTitleInput
          value=""
          onChange={onChange}
          error="Error"
        />
      );

      let input = container.querySelector('input');
      expect(input?.className).toContain('border-red-500');

      rerender(
        <ExperienceTitleInput value="" onChange={onChange} />
      );

      input = container.querySelector('input');
      expect(input?.className).not.toContain('border-red-500');
    });
  });

  describe('Accessibility', () => {
    it('has proper label association', () => {
      const onChange = jest.fn();
      render(<ExperienceTitleInput value="" onChange={onChange} />);
      const label = screen.getByText('Experience Title');
      const input = screen.getByPlaceholderText('Enter experience title');

      expect(label.getAttribute('for')).toBe('experience-title');
      expect(input.id).toBe('experience-title');
    });

    it('input is focusable', () => {
      const onChange = jest.fn();
      render(<ExperienceTitleInput value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Enter experience title');

      input.focus();
      expect(document.activeElement).toBe(input);
    });
  });
});
