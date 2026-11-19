import { apiWithToken } from '@/services/apiService';
import { DEFAULT_DURATION, Plan, PlanStop, minutesOf } from '@/types/plan';
import { parseApiError } from '@/utils/parseApiError';
import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';

/**
 * A person's plans on the server (DEV-376): /v1/plans/. Private to their
 * owner. Sending `stops` replaces the whole ordered list.
 */

type ApiStop = {
  id: string;
  position: number;
  place: {
    id: string;
    slug: string;
    title: string;
    city: string | null;
    photoUrl: string | null;
  } | null;
  experience: {
    id: string;
    slug: string;
    title: string;
    startDate: string | null;
    endDate: string | null;
    status: string;
    photoUrl: string | null;
  } | null;
  title: string;
  startTime: string | null;
  endTime: string | null;
  notes: string;
};

type ApiPlan = {
  id: string;
  title: string;
  date: string | null;
  notes: string;
  stops: ApiStop[];
  dateCreated: string;
};

const hhmm = (time: string | null): string | undefined =>
  time && /^\d{2}:\d{2}/.test(time) ? time.slice(0, 5) : undefined;

const clock = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/** A stop as the web draws it: what it points at, and its time and length. */
export const stopFromApi = (stop: ApiStop): PlanStop => {
  const kind = stop.place ? 'place' : stop.experience ? 'experience' : 'custom';
  const start = minutesOf(hhmm(stop.startTime));
  const end = minutesOf(hhmm(stop.endTime));
  return {
    id: stop.id,
    kind,
    ...(stop.place || stop.experience ? { refId: (stop.place ?? stop.experience)!.id } : {}),
    title: stop.title || stop.place?.title || stop.experience?.title || 'Stop',
    ...(stop.place?.city ? { subtitle: stop.place.city } : {}),
    photo: stop.place?.photoUrl ?? stop.experience?.photoUrl ?? null,
    ...(hhmm(stop.startTime) ? { time: hhmm(stop.startTime) } : {}),
    durationMinutes:
      start !== null && end !== null && end > start ? end - start : DEFAULT_DURATION[kind],
    ...(stop.experience ? { refDate: stop.experience.startDate } : {}),
  };
};

export const planFromApi = (plan: ApiPlan): Plan => ({
  id: plan.id,
  title: plan.title,
  date: plan.date,
  stops: (plan.stops ?? []).map(stopFromApi),
  dateCreated: plan.dateCreated,
});

/**
 * A stop as the API takes it. A place or experience goes by its id; a typed
 * stop by its title. The end time comes from the stop's length, left out
 * when it would run past midnight.
 */
export const stopToApi = (stop: PlanStop) => {
  const start = minutesOf(stop.time);
  const end = start === null ? null : start + (stop.durationMinutes ?? DEFAULT_DURATION[stop.kind]);
  return {
    ...(stop.kind === 'place' && stop.refId ? { place_id: stop.refId } : {}),
    ...(stop.kind === 'experience' && stop.refId ? { experience_id: stop.refId } : {}),
    title: stop.kind === 'custom' || !stop.refId ? stop.title.slice(0, 120) : '',
    start_time: start === null ? null : clock(start),
    end_time: end === null || end >= 1440 ? null : clock(end),
  };
};

const fail = (error: any, fallback: string): never => {
  console.error('Plans:', error.response?.data || error.message);
  throw new Error(parseApiError(error.response?.data, fallback));
};

export async function fetchPlans(): Promise<Plan[]> {
  try {
    const api = await apiWithToken();
    const response = await api.get('/v1/plans/', { params: { page_size: 100 } });
    const data = parseSnakeToCamel(response.data);
    const results: ApiPlan[] = Array.isArray(data) ? data : (data?.results ?? []);
    return results.map(planFromApi);
  } catch (error) {
    return fail(error, 'Your plans could not be loaded');
  }
}

/**
 * Creates a plan. `idempotencyKey` makes a repeat return the first plan, so a
 * retried request, or a browser plan moved over twice, isn't saved twice.
 */
export async function createPlanOnServer(
  plan: Pick<Plan, 'title' | 'date' | 'stops'>,
  idempotencyKey?: string,
): Promise<Plan> {
  try {
    const api = await apiWithToken();
    const response = await api.post('/v1/plans/', {
      title: plan.title.slice(0, 120),
      date: plan.date ? plan.date.slice(0, 10) : null,
      stops: plan.stops.map(stopToApi),
      ...(idempotencyKey ? { idempotency_key: idempotencyKey } : {}),
    });
    return planFromApi(parseSnakeToCamel(response.data));
  } catch (error) {
    return fail(error, 'The plan could not be created');
  }
}

/** Saves a plan's title, day and its whole list of stops. */
export async function savePlanOnServer(plan: Plan): Promise<void> {
  try {
    const api = await apiWithToken();
    await api.patch(`/v1/plans/${plan.id}/`, {
      title: plan.title.slice(0, 120),
      date: plan.date ? plan.date.slice(0, 10) : null,
      stops: plan.stops.map(stopToApi),
    });
  } catch (error) {
    fail(error, 'The plan could not be saved');
  }
}

export async function deletePlanOnServer(planId: string): Promise<void> {
  try {
    const api = await apiWithToken();
    await api.delete(`/v1/plans/${planId}/`);
  } catch (error) {
    fail(error, 'The plan could not be deleted');
  }
}
