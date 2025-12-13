import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Bookmark from './index';

describe('Bookmark Component', () => {
  it('should render with the correct initial state', () => {
    render(
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
    render(
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
    render(
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
    render(
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
