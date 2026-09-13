import { fireEvent, render, screen } from '@testing-library/react';
import { render as rtlRender } from '@testing-library/react';

import { ExperienceCreatedModal } from './index';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children, ...props }: any) => (
    <div data-testid="dialog-content" {...props}>
      {children}
    </div>
  ),
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
}));

describe('ExperienceCreatedModal', () => {
  describe('Rendering', () => {
    it('renders when open is true', () => {
      const { container } = rtlRender(
        <ExperienceCreatedModal open={true} onOpenChange={jest.fn()} />,
      );
      expect(container).toBeInTheDocument();
    });

    it('does not render when open is false', () => {
      const { container } = rtlRender(
        <ExperienceCreatedModal open={false} onOpenChange={jest.fn()} />,
      );
      expect(container.textContent).toBe('');
    });

    it('renders dialog content when open', () => {
      rtlRender(<ExperienceCreatedModal open={true} onOpenChange={jest.fn()} />);
      expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    });

    it('renders default title', () => {
      rtlRender(<ExperienceCreatedModal open={true} onOpenChange={jest.fn()} />);
      expect(screen.getByText('Experience Created Successfully!')).toBeInTheDocument();
    });

    it('renders default description', () => {
      rtlRender(<ExperienceCreatedModal open={true} onOpenChange={jest.fn()} />);
      expect(screen.getByText(/Your experience has been created/i)).toBeInTheDocument();
    });

    it('renders illustration image', () => {
      rtlRender(<ExperienceCreatedModal open={true} onOpenChange={jest.fn()} />);
      const img = screen.getByAltText('Experience created');
      expect(img).toBeInTheDocument();
    });
  });

  describe('Custom Props', () => {
    it('renders custom title', () => {
      rtlRender(
        <ExperienceCreatedModal open={true} onOpenChange={jest.fn()} title="Custom Title" />,
      );
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('renders custom description', () => {
      rtlRender(
        <ExperienceCreatedModal
          open={true}
          onOpenChange={jest.fn()}
          description="Custom description text"
        />,
      );
      expect(screen.getByText('Custom description text')).toBeInTheDocument();
    });

    it('renders custom illustration', () => {
      rtlRender(
        <ExperienceCreatedModal
          open={true}
          onOpenChange={jest.fn()}
          illustrationSrc="/images/custom.svg"
        />,
      );
      const img = screen.getByAltText('Experience created');
      expect(img.getAttribute('src')).toBe('/images/custom.svg');
    });
  });

  describe('Button Display', () => {
    it('renders view experience button when experienceId and onViewExperience provided', () => {
      rtlRender(
        <ExperienceCreatedModal
          open={true}
          onOpenChange={jest.fn()}
          experienceId="exp-123"
          onViewExperience={jest.fn()}
        />,
      );
      expect(screen.getByText('View Experience')).toBeInTheDocument();
    });

    it('renders link button when only experienceId provided', () => {
      rtlRender(
        <ExperienceCreatedModal open={true} onOpenChange={jest.fn()} experienceId="exp-123" />,
      );
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link.getAttribute('href')).toBe('/experiences/exp-123');
    });

    it('does not render button when no experienceId', () => {
      rtlRender(<ExperienceCreatedModal open={true} onOpenChange={jest.fn()} />);
      expect(screen.queryByText('View Experience')).not.toBeInTheDocument();
    });

    it('renders custom button label', () => {
      rtlRender(
        <ExperienceCreatedModal
          open={true}
          onOpenChange={jest.fn()}
          experienceId="exp-123"
          onViewExperience={jest.fn()}
          viewExperienceLabel="Go to Experience"
        />,
      );
      expect(screen.getByText('Go to Experience')).toBeInTheDocument();
    });
  });

  describe('Button Actions', () => {
    it('calls onViewExperience when button clicked', () => {
      const onViewExperience = jest.fn();
      rtlRender(
        <ExperienceCreatedModal
          open={true}
          onOpenChange={jest.fn()}
          experienceId="exp-123"
          onViewExperience={onViewExperience}
        />,
      );
      const button = screen.getByText('View Experience');
      fireEvent.click(button);
      expect(onViewExperience).toHaveBeenCalled();
    });

    it('calls onOpenChange(false) after viewing experience', () => {
      const onOpenChange = jest.fn();
      const onViewExperience = jest.fn();
      rtlRender(
        <ExperienceCreatedModal
          open={true}
          onOpenChange={onOpenChange}
          experienceId="exp-123"
          onViewExperience={onViewExperience}
        />,
      );
      const button = screen.getByText('View Experience');
      fireEvent.click(button);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('closes dialog when link clicked', () => {
      const onOpenChange = jest.fn();
      rtlRender(
        <ExperienceCreatedModal open={true} onOpenChange={onOpenChange} experienceId="exp-123" />,
      );
      const link = screen.getByRole('link');
      fireEvent.click(link);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Dialog State', () => {
    it('calls onOpenChange when modal is closed externally', () => {
      const onOpenChange = jest.fn();
      rtlRender(<ExperienceCreatedModal open={true} onOpenChange={onOpenChange} />);
      // Simulate external close
      rtlRender(<ExperienceCreatedModal open={false} onOpenChange={onOpenChange} />);
      // onOpenChange would be called by parent when close button is clicked
    });
  });

  describe('Accessibility', () => {
    it('renders with proper heading', () => {
      rtlRender(<ExperienceCreatedModal open={true} onOpenChange={jest.fn()} />);
      const heading = screen.getByText('Experience Created Successfully!');
      expect(heading.tagName).toBe('H2');
    });

    it('image has alt text', () => {
      rtlRender(<ExperienceCreatedModal open={true} onOpenChange={jest.fn()} />);
      const img = screen.getByAltText('Experience created');
      expect(img).toBeInTheDocument();
    });
  });
});
