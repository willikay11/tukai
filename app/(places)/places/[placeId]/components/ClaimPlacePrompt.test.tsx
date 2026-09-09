import React from 'react';

import { render, screen } from '@testing-library/react';

import { ClaimPlacePrompt } from './ClaimPlacePrompt';

describe('ClaimPlacePrompt', () => {
  beforeEach(() => render(<ClaimPlacePrompt placeId="p1" placeName="Kraftory Biergarten" />));

  it('says whose place it is talking about', () => {
    expect(screen.getByText('Claim Kraftory Biergarten')).toBeInTheDocument();
  });

  // "Claim" alone reads as claiming a reward, so the sheet names the audience
  // and what it unlocks
  it('names who it is for and what it unlocks', () => {
    expect(screen.getByText(/If you own or manage it/)).toBeInTheDocument();
    expect(screen.getByText('Take reservations')).toBeInTheDocument();
    expect(screen.getByText('Manage it from Creator Studio')).toBeInTheDocument();
    expect(screen.getByText('Own it as a community')).toBeInTheDocument();
  });

  // What the form will ask for, said before they start it
  it('says what a claim requires', () => {
    expect(screen.getByText(/published community you run/)).toBeInTheDocument();
    expect(screen.getByText(/reviewed before it goes live/)).toBeInTheDocument();
  });

  it('leads to the claim flow for this place', () => {
    expect(screen.getByRole('link', { name: 'Start claim' })).toHaveAttribute(
      'href',
      '/places/claim?placeId=p1',
    );
  });
});
