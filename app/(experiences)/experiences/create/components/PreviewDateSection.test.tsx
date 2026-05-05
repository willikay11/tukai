import { render, screen } from '@testing-library/react';
import { PreviewDateSection } from './PreviewDateSection';

describe('PreviewDateSection', () => {
  it('renders section title', () => {
    render(<PreviewDateSection mode="single" date={null} startTime={null} endTime={null} />);
    expect(screen.getByText('Date of the Experience')).toBeInTheDocument();
  });

  it('displays "Not selected yet" when date is not provided', () => {
    render(<PreviewDateSection mode="single" date={null} startTime={null} endTime={null} />);
    expect(screen.getByText('Not selected yet')).toBeInTheDocument();
  });

  it('displays formatted date and time when provided', () => {
    render(<PreviewDateSection mode="single" date="2026-05-15" startTime="09:00" endTime="17:00" />);
    expect(screen.getByText('Fri, May 15')).toBeInTheDocument();
    expect(screen.getByText('9:00 AM - 5:00 PM')).toBeInTheDocument();
  });

  it('renders edit button when onEdit is provided', () => {
    const onEdit = jest.fn();
    render(<PreviewDateSection mode="single" date={null} startTime={null} endTime={null} onEdit={onEdit} />);
    const editButton = screen.getByRole('button');
    expect(editButton).toBeInTheDocument();
  });
});
