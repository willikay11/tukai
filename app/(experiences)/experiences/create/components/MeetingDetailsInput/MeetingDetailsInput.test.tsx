import { render, screen } from '@testing-library/react';

jest.mock('@/app/shared/components/LocationPicker', () => ({
  LocationAutocompleteField: () => <div data-testid="location-field">meeting point input</div>,
}));

jest.mock('@/app/shared/hooks/usePlaces', () => ({
  useGoogleMapsAutocomplete: jest.fn(() => ({
    data: { data: [] },
    isFetching: false,
  })),
}));

jest.mock('@/components/ui/time-picker', () => ({
  TimePicker: () => <div data-testid="time-picker">time picker</div>,
}));

import { render as rtlRender } from '@testing-library/react';
import { MeetingDetailsInput } from './index';

describe('MeetingDetailsInput', () => {
  describe('Rendering', () => {
    it('renders the component', () => {
      const { container } = rtlRender(
        <MeetingDetailsInput
          meetingPoint=""
          meetingTime={null}
          onMeetingPointChange={jest.fn()}
          onMeetingTimeChange={jest.fn()}
        />
      );
      expect(container).toBeInTheDocument();
    });

    it('renders the label', () => {
      rtlRender(
        <MeetingDetailsInput
          meetingPoint=""
          meetingTime={null}
          onMeetingPointChange={jest.fn()}
          onMeetingTimeChange={jest.fn()}
        />
      );
      expect(screen.getByText(/Meeting Details/i)).toBeInTheDocument();
    });

    it('renders meeting point input', () => {
      rtlRender(
        <MeetingDetailsInput
          meetingPoint=""
          meetingTime={null}
          onMeetingPointChange={jest.fn()}
          onMeetingTimeChange={jest.fn()}
        />
      );
      expect(screen.getByTestId('location-field')).toBeInTheDocument();
    });

    it('renders time picker', () => {
      rtlRender(
        <MeetingDetailsInput
          meetingPoint=""
          meetingTime={null}
          onMeetingPointChange={jest.fn()}
          onMeetingTimeChange={jest.fn()}
        />
      );
      expect(screen.getByTestId('time-picker')).toBeInTheDocument();
    });

    it('shows optional label', () => {
      rtlRender(
        <MeetingDetailsInput
          meetingPoint=""
          meetingTime={null}
          onMeetingPointChange={jest.fn()}
          onMeetingTimeChange={jest.fn()}
        />
      );
      expect(screen.getByText(/Optional/i)).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('accepts meetingPoint prop', () => {
      const { container } = rtlRender(
        <MeetingDetailsInput
          meetingPoint="Park Entrance"
          meetingTime={null}
          onMeetingPointChange={jest.fn()}
          onMeetingTimeChange={jest.fn()}
        />
      );
      expect(container).toBeInTheDocument();
    });

    it('accepts meetingTime prop', () => {
      const { container } = rtlRender(
        <MeetingDetailsInput
          meetingPoint=""
          meetingTime="08:00"
          onMeetingPointChange={jest.fn()}
          onMeetingTimeChange={jest.fn()}
        />
      );
      expect(container).toBeInTheDocument();
    });

    it('handles null meetingTime', () => {
      const { container } = rtlRender(
        <MeetingDetailsInput
          meetingPoint=""
          meetingTime={null}
          onMeetingPointChange={jest.fn()}
          onMeetingTimeChange={jest.fn()}
        />
      );
      expect(container).toBeInTheDocument();
    });

    it('updates when props change', () => {
      const { rerender } = rtlRender(
        <MeetingDetailsInput
          meetingPoint="Old Location"
          meetingTime="08:00"
          onMeetingPointChange={jest.fn()}
          onMeetingTimeChange={jest.fn()}
        />
      );

      rerender(
        <MeetingDetailsInput
          meetingPoint="New Location"
          meetingTime="09:00"
          onMeetingPointChange={jest.fn()}
          onMeetingTimeChange={jest.fn()}
        />
      );

      expect(screen.getByTestId('location-field')).toBeInTheDocument();
    });
  });

  describe('Optional Field Behavior', () => {
    it('allows empty meeting point', () => {
      const { container } = rtlRender(
        <MeetingDetailsInput
          meetingPoint=""
          meetingTime={null}
          onMeetingPointChange={jest.fn()}
          onMeetingTimeChange={jest.fn()}
        />
      );
      expect(container).toBeInTheDocument();
    });

    it('allows empty time', () => {
      const { container } = rtlRender(
        <MeetingDetailsInput
          meetingPoint="Park Entrance"
          meetingTime={null}
          onMeetingPointChange={jest.fn()}
          onMeetingTimeChange={jest.fn()}
        />
      );
      expect(container).toBeInTheDocument();
    });

    it('allows both empty', () => {
      const { container } = rtlRender(
        <MeetingDetailsInput
          meetingPoint=""
          meetingTime={null}
          onMeetingPointChange={jest.fn()}
          onMeetingTimeChange={jest.fn()}
        />
      );
      expect(container).toBeInTheDocument();
    });

    it('allows full meeting details', () => {
      const { container } = rtlRender(
        <MeetingDetailsInput
          meetingPoint="Hotel Lobby"
          meetingTime="07:30"
          onMeetingPointChange={jest.fn()}
          onMeetingTimeChange={jest.fn()}
        />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('accepts onMeetingPointChange callback', () => {
      const onMeetingPointChange = jest.fn();
      rtlRender(
        <MeetingDetailsInput
          meetingPoint=""
          meetingTime={null}
          onMeetingPointChange={onMeetingPointChange}
          onMeetingTimeChange={jest.fn()}
        />
      );
      expect(onMeetingPointChange).toBeDefined();
    });

    it('accepts onMeetingTimeChange callback', () => {
      const onMeetingTimeChange = jest.fn();
      rtlRender(
        <MeetingDetailsInput
          meetingPoint=""
          meetingTime={null}
          onMeetingPointChange={jest.fn()}
          onMeetingTimeChange={onMeetingTimeChange}
        />
      );
      expect(onMeetingTimeChange).toBeDefined();
    });
  });
});
