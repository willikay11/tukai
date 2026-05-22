import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { CommunitySelector } from './CommunitySelector';

// Mock the Select component
jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => {
    return (
      <div data-testid="select-root">
        {React.Children.map(children, (child) =>
          React.cloneElement(child as React.ReactElement, { value, onValueChange }),
        )}
      </div>
    );
  },
  SelectTrigger: ({ children, value, onValueChange, ...props }: any) => (
    <button data-testid="select-trigger" {...props}>
      {children}
    </button>
  ),
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children, value, onValueChange }: any) => (
    <div data-testid="select-content">
      {React.Children.map(children, (child) =>
        React.cloneElement(child as React.ReactElement, { value, onValueChange }),
      )}
    </div>
  ),
  SelectItem: ({ children, value: itemValue, ...props }: any) => (
    <button data-testid={`select-item-${itemValue}`} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children }: any) => <div>{children}</div>,
  PopoverContent: ({ children }: any) => <div>{children}</div>,
}));

const mockCommunities = [
  { id: '1', name: 'Community 1', imageUrl: 'https://via.placeholder.com/32' },
  { id: '2', name: 'Community 2', imageUrl: 'https://via.placeholder.com/32' },
];

describe('CommunitySelector', () => {
  it('renders with placeholder when no value selected', () => {
    const mockOnChange = jest.fn();
    render(<CommunitySelector value={null} options={mockCommunities} onChange={mockOnChange} />);

    expect(screen.getByText('Select a community')).toBeInTheDocument();
  });

  it('displays selected community', () => {
    const mockOnChange = jest.fn();
    const selected = mockCommunities[0];

    const { container } = render(
      <CommunitySelector value={selected} options={mockCommunities} onChange={mockOnChange} />,
    );

    // Check that the community name is displayed
    const communityNames = screen.getAllByText(selected.name);
    expect(communityNames.length).toBeGreaterThan(0);
  });

  it('displays error message when provided', () => {
    const mockOnChange = jest.fn();
    const errorMessage = 'Community is required';

    render(
      <CommunitySelector
        value={null}
        options={mockCommunities}
        onChange={mockOnChange}
        error={errorMessage}
      />,
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('renders label and info icon', () => {
    const mockOnChange = jest.fn();

    render(<CommunitySelector value={null} options={mockCommunities} onChange={mockOnChange} />);

    expect(screen.getByText('Select host community')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Information about community selection' }),
    ).toBeInTheDocument();
  });

  it('renders the Select component', () => {
    const mockOnChange = jest.fn();

    render(<CommunitySelector value={null} options={mockCommunities} onChange={mockOnChange} />);

    expect(screen.getByTestId('select-root')).toBeInTheDocument();
  });
});
