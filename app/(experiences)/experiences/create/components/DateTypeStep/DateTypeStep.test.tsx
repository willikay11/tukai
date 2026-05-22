import React from 'react';

import { render, screen } from '@testing-library/react';

import { type DateTypeFormData, DateTypeStep } from './DateTypeStep';

const mockCommunities = [
  { id: '1', name: 'Community 1', imageUrl: 'https://via.placeholder.com/32' },
  { id: '2', name: 'Community 2', imageUrl: 'https://via.placeholder.com/32' },
];

const mockFormData: DateTypeFormData = {
  community: null,
  experiencePricing: 'paid',
  experienceType: 'one-time',
  isRecurring: false,
  date: null,
  startTime: null,
  endTime: null,
};

describe('DateTypeStep', () => {
  it('renders the step title', () => {
    const mockOnChange = jest.fn();

    render(
      <DateTypeStep
        formData={mockFormData}
        communityOptions={mockCommunities}
        onChange={mockOnChange}
        errors={{}}
      />,
    );

    expect(screen.getByText('Add date and type of the experience')).toBeInTheDocument();
  });

  it('renders CommunitySelector', () => {
    const mockOnChange = jest.fn();

    render(
      <DateTypeStep
        formData={mockFormData}
        communityOptions={mockCommunities}
        onChange={mockOnChange}
        errors={{}}
      />,
    );

    expect(screen.getByText('Select host community')).toBeInTheDocument();
  });

  it('renders ExperienceTypePicker', () => {
    const mockOnChange = jest.fn();

    render(
      <DateTypeStep
        formData={mockFormData}
        communityOptions={mockCommunities}
        onChange={mockOnChange}
        errors={{}}
      />,
    );

    expect(screen.getByText('Is this a free or a paid Experience?')).toBeInTheDocument();
  });

  it('renders ExperienceTypeRadio', () => {
    const mockOnChange = jest.fn();

    render(
      <DateTypeStep
        formData={mockFormData}
        communityOptions={mockCommunities}
        onChange={mockOnChange}
        errors={{}}
      />,
    );

    expect(screen.getByText('Experience Type')).toBeInTheDocument();
  });

  it('renders date picker', () => {
    const mockOnChange = jest.fn();

    render(
      <DateTypeStep
        formData={mockFormData}
        communityOptions={mockCommunities}
        onChange={mockOnChange}
        errors={{}}
      />,
    );

    expect(screen.getByText('Select Experience date(s)')).toBeInTheDocument();
  });

  it('renders start and end time pickers', () => {
    const mockOnChange = jest.fn();

    render(
      <DateTypeStep
        formData={mockFormData}
        communityOptions={mockCommunities}
        onChange={mockOnChange}
        errors={{}}
      />,
    );

    expect(screen.getByText('Start Time')).toBeInTheDocument();
    expect(screen.getByText('End Time')).toBeInTheDocument();
  });

  it('displays error messages', () => {
    const mockOnChange = jest.fn();
    const errors = {
      community: 'Community is required',
      date: 'Date is required',
    };

    render(
      <DateTypeStep
        formData={mockFormData}
        communityOptions={mockCommunities}
        onChange={mockOnChange}
        errors={errors}
      />,
    );

    expect(screen.getByText('Community is required')).toBeInTheDocument();
    expect(screen.getByText('Date is required')).toBeInTheDocument();
  });
});
