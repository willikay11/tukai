import React from 'react';

import { render, screen } from '@testing-library/react';

import { PageContainer } from './PageContainer';

const column = () => screen.getByRole('main').firstElementChild;

describe('PageContainer', () => {
  // The handoff's page edge: 1360px, centred, 24px each side at every width
  it('centres the page in a 1360px column with a 24px edge', () => {
    render(<PageContainer>content</PageContainer>);

    expect(screen.getByRole('main')).toHaveClass('mx-auto', 'max-w-[1360px]', 'px-6');
  });

  it('keeps a 12-column grid inside it', () => {
    render(<PageContainer>content</PageContainer>);

    expect(screen.getByRole('main')).toHaveClass('grid', 'grid-cols-12');
  });

  it('gives browse pages the whole content width', () => {
    render(<PageContainer>content</PageContainer>);

    expect(column()).toHaveClass('col-span-12');
    expect(column()).not.toHaveClass('md:col-span-8');
  });

  // Detail pages are reading pages, so they sit two columns in each side
  it('insets detail pages from a tablet up', () => {
    render(<PageContainer variant="detail">content</PageContainer>);

    expect(column()).toHaveClass('md:col-span-8', 'md:col-start-3');
  });

  it('still spans the full width on a phone', () => {
    render(<PageContainer variant="detail">content</PageContainer>);

    expect(column()).toHaveClass('col-span-12');
  });

  it('passes per-page spacing through', () => {
    render(<PageContainer className="py-6">content</PageContainer>);

    expect(column()).toHaveClass('py-6');
  });
});
