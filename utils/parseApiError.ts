/**
 * Parses API errors and returns a user-friendly error message
 */
export const parseApiError = (error: unknown, defaultMessage: string = 'An error occurred'): string => {
  if (!error) return defaultMessage;

  // Handle Axios-style errors with response data
  if (typeof error === 'object' && error !== null) {
    const err = error as any;

    // Axios error with response
    if (err.response?.data?.message) {
      return err.response.data.message;
    }

    // Axios error with generic message
    if (err.response?.statusText) {
      return err.response.statusText;
    }

    // Standard error message property
    if (err.message) {
      return err.message;
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  return defaultMessage;
};
