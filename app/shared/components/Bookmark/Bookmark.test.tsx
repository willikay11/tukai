import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import { AuthDialogProvider } from '@/context/AuthDialogContext';

import { Bookmark } from './index';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(<AuthDialogProvider>{component}</AuthDialogProvider>);
};

describe('Bookmark Component', () => {
  it('should render with the correct initial state', () => {
    renderWithProvider(
      <Bookmark
        userId={'8129381931983'}
        bookmarked={false}
        onBookmark={jest.fn()}
        onUnbookmark={jest.fn()}
        className="text-gray-500"
      />,
    );
    const icon = screen.getByTestId('Bookmark02Icon');
    expect(icon).toHaveClass('text-gray-500');
  });

  it('should call onBookmark when not bookmarked and clicked', () => {
    const onBookmark = jest.fn();
    renderWithProvider(
      <Bookmark
        userId={'8129381931983'}
        bookmarked={false}
        onBookmark={onBookmark}
        onUnbookmark={jest.fn()}
      />,
    );
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(onBookmark).toHaveBeenCalled();
  });

  it('should call onUnbookmark when bookmarked and clicked', () => {
    const onUnbookmark = jest.fn();
    renderWithProvider(
      <Bookmark
        userId={'8129381931983'}
        bookmarked={true}
        onBookmark={jest.fn()}
        onUnbookmark={onUnbookmark}
      />,
    );
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(onUnbookmark).toHaveBeenCalled();
  });

  it('should toggle the icon variant on click', () => {
    renderWithProvider(
      <Bookmark
        userId={'8129381931983'}
        bookmarked={false}
        onBookmark={jest.fn()}
        onUnbookmark={jest.fn()}
      />,
    );
    const button = screen.getByRole('button');
    expect(screen.getByTestId('Bookmark02Icon')).toHaveClass('text-gray-500');
    fireEvent.click(button);
    expect(screen.getByTestId('Bookmark02Icon')).toHaveClass('text-red-500');
  });
});

describe('Bookmark basket mode', () => {
  const basketProps = {
    userId: '8129381931983',
    onBookmark: jest.fn(),
    onUnbookmark: jest.fn(),
    icon: 'basket' as const,
  };

  it('shows the add icon on a dark container before being added', () => {
    renderWithProvider(<Bookmark {...basketProps} bookmarked={false} className="text-white" />);

    const icon = screen.getByTestId('ShoppingBasketAdd02Icon');
    expect(icon).toHaveClass('text-white');
    expect(screen.queryByTestId('ShoppingBasketDone02Icon')).not.toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveClass('bg-black/40');
  });

  it('switches to the lime done icon on a white container once added', () => {
    renderWithProvider(<Bookmark {...basketProps} bookmarked={false} className="text-white" />);

    fireEvent.click(screen.getByRole('button'));

    const icon = screen.getByTestId('ShoppingBasketDone02Icon');
    expect(icon).toHaveClass('text-lime');
    expect(screen.queryByTestId('ShoppingBasketAdd02Icon')).not.toBeInTheDocument();

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-white');
    expect(button).not.toHaveClass('bg-black/40');
  });

  it('renders the done state straight away for an already-added experience', () => {
    renderWithProvider(<Bookmark {...basketProps} bookmarked={true} className="text-white" />);

    expect(screen.getByTestId('ShoppingBasketDone02Icon')).toHaveClass('text-lime');
    expect(screen.getByRole('button')).toHaveClass('bg-white');
  });

  it('leaves the default bookmark treatment untouched', () => {
    renderWithProvider(
      <Bookmark
        userId="8129381931983"
        bookmarked={false}
        onBookmark={jest.fn()}
        onUnbookmark={jest.fn()}
      />,
    );

    expect(screen.getByTestId('Bookmark02Icon')).toBeInTheDocument();
    expect(screen.queryByTestId('ShoppingBasketAdd02Icon')).not.toBeInTheDocument();
    expect(screen.getByRole('button')).not.toHaveClass('bg-black/40');
  });
});
