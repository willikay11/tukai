import { ExperienceDateFields, buildExperienceDates } from './experience-dates';

// jest.config.js pins the local zone to Africa/Nairobi (UTC+3)

const blank: ExperienceDateFields = {
  experienceType: 'one-time',
  isRecurring: false,
  date: null,
  startTime: null,
  endTime: null,
  recurrenceStartDate: null,
  timeSlots: [],
  multiDayStartDate: null,
  multiDayStartTime: null,
  multiDayEndDate: null,
  multiDayEndTime: null,
  itineraryStartDate: null,
  itineraryEndDate: null,
};

describe('buildExperienceDates', () => {
  // A bare "2026-07-05T08:00:00" was stored as 08:00 UTC: 11:00 in Nairobi
  it('sends a single-day experience as UTC instants', () => {
    expect(
      buildExperienceDates({ ...blank, date: '2026-07-05', startTime: '08:00', endTime: '10:00' }),
    ).toEqual({
      startDate: '2026-07-05T05:00:00Z',
      endDate: '2026-07-05T07:00:00Z',
      localStartDate: '2026-07-05',
      localEndDate: '2026-07-05',
    });
  });

  it('sends a multi-day experience from its own start and end', () => {
    expect(
      buildExperienceDates({
        ...blank,
        experienceType: 'multi-day',
        multiDayStartDate: '2026-07-05',
        multiDayStartTime: '09:00',
        multiDayEndDate: '2026-07-07',
        multiDayEndTime: '17:00',
      }),
    ).toMatchObject({ startDate: '2026-07-05T06:00:00Z', endDate: '2026-07-07T14:00:00Z' });
  });

  it('sends an itinerary as whole local days', () => {
    expect(
      buildExperienceDates({
        ...blank,
        experienceType: 'itinerary',
        itineraryStartDate: '2026-07-05',
        itineraryEndDate: '2026-07-08',
      }),
    ).toEqual({
      startDate: '2026-07-04T21:00:00Z',
      endDate: '2026-07-08T20:59:59Z',
      localStartDate: '2026-07-05',
      localEndDate: '2026-07-08',
    });
  });

  describe('recurring', () => {
    const recurring = {
      ...blank,
      isRecurring: true,
      recurrenceStartDate: '2026-07-05',
      timeSlots: [
        { startTime: '08:00', endTime: '10:00' },
        { startTime: '14:00', endTime: '16:00' },
      ],
    };

    // The series ends at the rule's UNTIL. A series-long end_date makes each
    // occurrence overlap the next, and the API rejects it with a 400.
    it('sends the first occurrence only, not the whole series', () => {
      expect(buildExperienceDates(recurring)).toMatchObject({
        startDate: '2026-07-05T05:00:00Z',
        endDate: '2026-07-05T07:00:00Z',
      });
    });

    it('ends the next day when the first slot runs past midnight', () => {
      expect(
        buildExperienceDates({
          ...recurring,
          timeSlots: [{ startTime: '22:00', endTime: '01:00' }],
        }),
      ).toMatchObject({ startDate: '2026-07-05T19:00:00Z', endDate: '2026-07-05T22:00:00Z' });
    });

    // The backend places slots on start_date's UTC day, so this must be 4 July
    it('starts a 01:30 first slot on the previous UTC day', () => {
      expect(
        buildExperienceDates({
          ...recurring,
          timeSlots: [{ startTime: '01:30', endTime: '03:00' }],
        }),
      ).toMatchObject({ startDate: '2026-07-04T22:30:00Z' });
    });
  });

  it('asks for dates when they are missing', () => {
    expect(buildExperienceDates(blank)).toEqual({
      error: 'Please set start and end dates before continuing.',
    });
  });

  it('asks for times when a timed experience has none', () => {
    expect(buildExperienceDates({ ...blank, date: '2026-07-05' })).toEqual({
      error: 'Please set a start date, end date, start time and end time before continuing.',
    });
  });
});
