import { apiWithToken } from './apiService';
import {
  createPlanOnServer,
  deletePlanOnServer,
  fetchPlans,
  savePlanOnServer,
  stopFromApi,
  stopToApi,
} from './plans';

jest.mock('./apiService', () => ({ apiWithToken: jest.fn() }));

const api = { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() };

const apiPlan = {
  id: 'srv-1',
  title: 'Saturday out',
  date: '2026-07-04',
  notes: '',
  date_created: '2026-07-01T09:00:00Z',
  stops: [
    {
      id: 's1',
      position: 0,
      place: {
        id: 'pl1',
        slug: 'karura',
        title: 'Karura Forest',
        city: 'Nairobi',
        photo_url: 'https://cdn/karura.webp',
      },
      experience: null,
      title: '',
      start_time: '09:00:00',
      end_time: '10:30:00',
      notes: '',
    },
    {
      id: 's2',
      position: 1,
      place: null,
      experience: {
        id: 'ex1',
        slug: 'jazz',
        title: 'Jazz night',
        start_date: '2026-07-04T17:00:00Z',
        end_date: null,
        status: 'PUBLISHED',
        photo_url: null,
      },
      title: '',
      start_time: null,
      end_time: null,
      notes: '',
    },
    {
      id: 's3',
      position: 2,
      place: null,
      experience: null,
      title: 'Coffee',
      start_time: '12:00:00',
      end_time: null,
      notes: '',
    },
  ],
};

// DEV-376: a person's plans on the server
describe('plans on the server', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiWithToken as jest.Mock).mockResolvedValue(api);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('reads the plans with their stops, as the web draws them', async () => {
    api.get.mockResolvedValue({ data: { results: [apiPlan], next: null } });

    const [plan] = await fetchPlans();

    expect(api.get).toHaveBeenCalledWith('/v1/plans/', { params: { page_size: 100 } });
    expect(plan).toMatchObject({ id: 'srv-1', title: 'Saturday out', date: '2026-07-04' });
    expect(plan.stops[0]).toMatchObject({
      kind: 'place',
      refId: 'pl1',
      title: 'Karura Forest',
      subtitle: 'Nairobi',
      photo: 'https://cdn/karura.webp',
      time: '09:00',
      durationMinutes: 90,
    });
    expect(plan.stops[1]).toMatchObject({
      kind: 'experience',
      refId: 'ex1',
      title: 'Jazz night',
      refDate: '2026-07-04T17:00:00Z',
      durationMinutes: 120,
    });
    expect(plan.stops[1].time).toBeUndefined();
    expect(plan.stops[2]).toMatchObject({ kind: 'custom', title: 'Coffee', durationMinutes: 30 });
  });

  it('sends a stop by what it points at, with its end from its length', () => {
    expect(
      stopToApi({
        id: 'x',
        kind: 'place',
        refId: 'pl1',
        title: 'Karura',
        time: '09:00',
        durationMinutes: 90,
      }),
    ).toEqual({ place_id: 'pl1', title: '', start_time: '09:00', end_time: '10:30' });
    expect(stopToApi({ id: 'y', kind: 'experience', refId: 'ex1', title: 'Jazz' })).toEqual({
      experience_id: 'ex1',
      title: '',
      start_time: null,
      end_time: null,
    });
    expect(stopToApi({ id: 'z', kind: 'custom', title: 'Coffee', time: '12:00' })).toEqual({
      title: 'Coffee',
      start_time: '12:00',
      end_time: '12:30',
    });
  });

  it('leaves out an end that would run past midnight', () => {
    expect(
      stopToApi({ id: 'x', kind: 'custom', title: 'Late', time: '23:30', durationMinutes: 60 }),
    ).toMatchObject({ start_time: '23:30', end_time: null });
  });

  it('reads back what it sends', () => {
    const [, , coffee] = apiPlan.stops;
    const camel = { ...coffee, startTime: '12:00:00', endTime: '12:30:00' } as never;

    expect(stopToApi(stopFromApi(camel))).toEqual({
      title: 'Coffee',
      start_time: '12:00',
      end_time: '12:30',
    });
  });

  it('creates a plan with its day and stops, once per key', async () => {
    api.post.mockResolvedValue({ data: { ...apiPlan, stops: [] } });

    await createPlanOnServer(
      { title: 'Saturday out', date: '2026-07-04T00:00:00', stops: [] },
      'plan_abc',
    );

    expect(api.post).toHaveBeenCalledWith('/v1/plans/', {
      title: 'Saturday out',
      date: '2026-07-04',
      stops: [],
      idempotency_key: 'plan_abc',
    });
  });

  it('saves the whole plan', async () => {
    api.patch.mockResolvedValue({ data: {} });

    await savePlanOnServer({
      id: 'srv-1',
      title: 'Sunday out',
      date: null,
      stops: [{ id: 's', kind: 'custom', title: 'Lunch' }],
      dateCreated: '',
    });

    expect(api.patch).toHaveBeenCalledWith('/v1/plans/srv-1/', {
      title: 'Sunday out',
      date: null,
      stops: [{ title: 'Lunch', start_time: null, end_time: null }],
    });
  });

  it('deletes a plan, and says why when it cannot', async () => {
    api.delete.mockResolvedValue({ status: 204 });
    await deletePlanOnServer('srv-1');
    expect(api.delete).toHaveBeenCalledWith('/v1/plans/srv-1/');

    api.delete.mockRejectedValue({ response: { status: 404, data: { detail: 'Not found.' } } });
    await expect(deletePlanOnServer('gone')).rejects.toThrow('Not found.');
  });
});
