import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { ItineraryDayFormValue } from '@/types/itinerary';

import { ItineraryDaysStep } from './index';

// The pill pulls in the place picker and the activity services, none of which
// this step's delete wiring depends on
jest.mock('../ItineraryDayPill', () => ({
  ItineraryDayPill: ({ day, onDelete, isDeleting, isDeleteDisabled }: any) => (
    <button
      type="button"
      onClick={onDelete}
      disabled={isDeleting || isDeleteDisabled}
      data-testid={`delete-${day.id}`}
    >
      {`Delete Day ${day.dayNumber}`}
    </button>
  ),
}));

const makeDay = (id: string, dayNumber: number, apiId: string): ItineraryDayFormValue => ({
  id,
  apiId,
  dayNumber,
  title: `Day ${dayNumber}`,
  description: 'Description',
  activities: [
    {
      id: `activity-${id}`,
      activityApiId: `activity-api-${id}`,
      title: 'Activity',
      description: '',
      placeId: null,
      placeName: null,
      placeImageUrl: null,
      placeCity: null,
      locationId: null,
      startTime: null,
      endTime: null,
    },
  ],
});

const renderStep = (props: Partial<React.ComponentProps<typeof ItineraryDaysStep>> = {}) => {
  const days = [makeDay('local-1', 1, 'api-1'), makeDay('local-2', 2, 'api-2')];

  const defaultProps = {
    experienceId: 'experience-1',
    days,
    itineraryStartDate: '2026-05-15',
    onChange: jest.fn(),
    onSaveContinue: jest.fn(),
    onCancel: jest.fn(),
    isSaving: false,
  };

  return {
    ...defaultProps,
    ...props,
    ...render(<ItineraryDaysStep {...defaultProps} {...props} />),
  };
};

describe('ItineraryDaysStep — day deletion', () => {
  it('delegates deletion to onDeleteDay using the day id', async () => {
    const onDeleteDay = jest.fn().mockResolvedValue(true);
    const onChange = jest.fn();
    renderStep({ onDeleteDay, onChange });

    fireEvent.click(screen.getByTestId('delete-local-2'));

    await waitFor(() => expect(onDeleteDay).toHaveBeenCalledWith('local-2'));
    // The handler owns the form-state update once the API confirms
    expect(onChange).not.toHaveBeenCalled();
  });

  it('disables the other delete buttons while a delete is in flight', async () => {
    let resolveDelete: (value: boolean) => void = () => {};
    const onDeleteDay = jest.fn(
      () =>
        new Promise<boolean>((resolve) => {
          resolveDelete = resolve;
        }),
    );
    renderStep({ onDeleteDay });

    fireEvent.click(screen.getByTestId('delete-local-1'));

    await waitFor(() => expect(screen.getByTestId('delete-local-2')).toBeDisabled());
    expect(screen.getByTestId('delete-local-1')).toBeDisabled();

    resolveDelete(true);
    await waitFor(() => expect(screen.getByTestId('delete-local-2')).not.toBeDisabled());
  });

  it('ignores a second delete while one is already in flight', async () => {
    const onDeleteDay = jest.fn(() => new Promise<boolean>(() => {}));
    renderStep({ onDeleteDay });

    fireEvent.click(screen.getByTestId('delete-local-1'));
    fireEvent.click(screen.getByTestId('delete-local-2'));

    await waitFor(() => expect(onDeleteDay).toHaveBeenCalledTimes(1));
  });

  it('removes and renumbers a never-persisted day without calling the API', async () => {
    const onDeleteDay = jest.fn().mockResolvedValue(true);
    const onChange = jest.fn();
    const days = [
      makeDay('local-1', 1, 'api-1'),
      { ...makeDay('local-2', 2, 'api-2'), apiId: undefined as unknown as string },
    ];
    renderStep({ days, onDeleteDay, onChange });

    fireEvent.click(screen.getByTestId('delete-local-2'));

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'local-1', dayNumber: 1 }),
    ]);
    expect(onDeleteDay).not.toHaveBeenCalled();
  });

  it('refuses to drop a persisted day when no onDeleteDay handler is wired', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const onChange = jest.fn();
    renderStep({ onChange });

    fireEvent.click(screen.getByTestId('delete-local-1'));

    // Removing it locally would orphan the row server-side
    expect(onChange).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
