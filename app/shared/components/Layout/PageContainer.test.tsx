import React from 'react';

import { render, screen } from '@testing-library/react';

import { PageContainer } from './PageContainer';

const column = () => screen.getByRole('main').firstElementChild;

describe('PageContainer', () => {
  it('lays the page out on the shared 12-column grid', () => {
    render(<PageContainer>content</PageContainer>);

    expect(screen.getByRole('main')).toHaveClass('grid', 'grid-cols-12');
  });

  it('gives browse pages the wide column', () => {
    render(<PageContainer>content</PageContainer>);

    expect(column()).toHaveClass('md:col-span-10', 'md:col-start-2');
  });

  // Detail pages are reading pages, so they sit one column narrower each side
  it('insets detail pages by an extra column on both sides', () => {
    render(<PageContainer variant="detail">content</PageContainer>);

    expect(column()).toHaveClass('md:col-span-8', 'md:col-start-3');
    expect(column()).not.toHaveClass('md:col-span-10');
  });

  it('keeps the inset at every breakpoint', () => {
    render(<PageContainer variant="detail">content</PageContainer>);

    // browse: 8/start-3 and 6/start-4 — detail steps in one column further
    expect(column()).toHaveClass(
      '3xl:col-span-6',
      '3xl:col-start-4',
      '4xl:col-span-4',
      '4xl:col-start-5',
    );
  });

  it('still spans the full width on mobile', () => {
    render(<PageContainer variant="detail">content</PageContainer>);

    expect(column()).toHaveClass('col-span-12');
  });

  it('passes per-page spacing through', () => {
    render(<PageContainer className="py-6">content</PageContainer>);

    expect(column()).toHaveClass('py-6');
  });
});
