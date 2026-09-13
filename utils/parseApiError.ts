// { errors: [{ detail: "Cannot publish an experience without tickets." }] }
const firstErrorDetail = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') return null;

  const errors = (payload as { errors?: unknown }).errors;
  if (!Array.isArray(errors) || errors.length === 0) return null;

  const detail = (errors[0] as { detail?: unknown })?.detail;
  return typeof detail === 'string' && detail.trim() ? detail : null;
};

/**
 * Parses API errors and returns a user-friendly error message
 */
export const parseApiError = (
  error: unknown,
  defaultMessage: string = 'An error occurred',
): string => {
  if (!error) return defaultMessage;

  // Handle Axios-style errors with response data
  if (typeof error === 'object' && error !== null) {
    const err = error as any;

    // The API's error format is { errors: [{ detail: "..." }, ...] }. It can
    // reach us at three depths: on a raw Axios error, on a service error that
    // preserved the payload as `data`, or spread at the top level. Services
    // flatten Axios errors, so all three have to be checked.
    const detail =
      firstErrorDetail(err.response?.data) ?? firstErrorDetail(err.data) ?? firstErrorDetail(err);

    if (detail) return detail;

    // Django REST framework's single-error shape
    if (typeof err.response?.data?.detail === 'string') return err.response.data.detail;
    if (typeof err.data?.detail === 'string') return err.data.detail;
    if (typeof err.detail === 'string') return err.detail;

    // Axios error with response message
    if (err.response?.data?.message) {
      return err.response.data.message;
    }

    // Standard error message property
    if (err.message) {
      return err.message;
    }

    // Least useful — "Bad Request" tells the user nothing, so it comes last
    if (err.response?.statusText) {
      return err.response.statusText;
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  return defaultMessage;
};
