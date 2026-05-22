import { render, screen } from '@testing-library/react';

import { MeetingDetailsInput } from './MeetingDetailsInput';

jest.mock('@/app/shared/hooks/usePlaces', () => ({
  useGoogleMapsAutocomplete: jest.fn(() => ({
    data: { data: [] },
    isFetching: false,
  })),
}));

jest.mock('@/app/shared/components/LocationPicker', () => ({
  LocationAutocompleteField: ({ value, placeholder }: any) => (
    <input placeholder={placeholder} value={value} />
  ),
}));

jest.mock('@/components/ui/time-picker', () => ({
  TimePicker: ({ value, placeholder }: any) => (
    <input type="time" value={value} placeholder={placeholder} />
  ),
}));

describe('MeetingDetailsInput', () => {
  it('renders meeting point input', () => {
    render(
      <MeetingDetailsInput
        meetingPoint=""
        meetingTime={null}
        onMeetingPointChange={() => {}}
        onMeetingTimeChange={() => {}}
      />,
    );
    expect(screen.getByPlaceholderText('Meeting/Pick-up Point')).toBeInTheDocument();
  });

  it('renders meeting time picker', () => {
    render(
      <MeetingDetailsInput
        meetingPoint=""
        meetingTime={null}
        onMeetingPointChange={() => {}}
        onMeetingTimeChange={() => {}}
      />,
    );
    expect(screen.getByText('Meeting Time')).toBeInTheDocument();
  });

  it('displays current meeting point value', () => {
    render(
      <MeetingDetailsInput
        meetingPoint="Central Park"
        meetingTime={null}
        onMeetingPointChange={() => {}}
        onMeetingTimeChange={() => {}}
      />,
    );
    const input = screen.getByDisplayValue('Central Park');
    expect(input).toBeInTheDocument();
  });
});
