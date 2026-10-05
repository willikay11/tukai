import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { CardGrid } from './CardGrid';

jest.mock('next/link', () => {
  function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  }
  MockLink.displayName = 'MockLink';
  return MockLink;
});
jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

const items = (count: number) => Array.from({ length: count }, (_, index) => `item-${index}`);

const renderGrid = (list: string[], pageSize = 5, emptyLine?: string) =>
  render(
    <CardGrid
      title="Places with experiences"
      subtitle="Each one shows what is happening inside"
      items={list}
      pageSize={pageSize}
      getKey={(item) => item}
      renderItem={(item) => <span>{item}</span>}
      emptyLine={emptyLine}
    />,
  );

describe('CardGrid', () => {
  it('carries the heading and the line under it', () => {
    renderGrid(items(3));

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Places with experiences');
    expect(screen.getByText('Each one shows what is happening inside')).toBeInTheDocument();
  });

  it('shows one page at a time', () => {
    renderGrid(items(8));

    expect(screen.getByText('item-0')).toBeInTheDocument();
    expect(screen.getByText('item-4')).toBeInTheDocument();
    expect(screen.queryByText('item-5')).not.toBeInTheDocument();
  });

  it('pages on the header arrows', () => {
    renderGrid(items(8));

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(screen.getByText('item-5')).toBeInTheDocument();
    expect(screen.queryByText('item-0')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /previous/i }));

    expect(screen.getByText('item-0')).toBeInTheDocument();
  });

  it('greys the back arrow on the first page and the next one on the last', () => {
    renderGrid(items(8));

    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  // Arrows that could never do anything are noise, so they are left out
  // rather than drawn and greyed
  it('shows no arrows at all when everything fits on one page', () => {
    renderGrid(items(3));

    expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
  });

  it('says the empty line instead of an empty grid', () => {
    renderGrid([], 5, 'Nothing is scheduled at places right now.');

    expect(screen.getByText('Nothing is scheduled at places right now.')).toBeInTheDocument();
  });
});
