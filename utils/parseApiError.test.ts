import { parseApiError } from './parseApiError';

const API_ERROR = { errors: [{ detail: 'Cannot publish an experience without tickets.' }] };
const DETAIL = 'Cannot publish an experience without tickets.';

describe('parseApiError', () => {
  describe('the API error shape, at every depth it reaches us', () => {
    it('reads it off a raw Axios error', () => {
      expect(parseApiError({ response: { data: API_ERROR } })).toBe(DETAIL);
    });

    it('reads it off a service error that preserved the payload as data', () => {
      expect(parseApiError({ status: 400, success: false, data: API_ERROR })).toBe(DETAIL);
    });

    it('reads it off a payload spread at the top level', () => {
      expect(parseApiError(API_ERROR)).toBe(DETAIL);
    });

    it('prefers the detail over a generic message on the same error', () => {
      const error = {
        message: 'An unexpected error occurred',
        response: { data: API_ERROR },
      };

      expect(parseApiError(error)).toBe(DETAIL);
    });

    it('prefers the detail over statusText', () => {
      expect(parseApiError({ response: { data: API_ERROR, statusText: 'Bad Request' } })).toBe(
        DETAIL,
      );
    });
  });

  describe('other shapes', () => {
    it('handles the DRF single-detail shape', () => {
      expect(parseApiError({ response: { data: { detail: 'Not found.' } } })).toBe('Not found.');
    });

    it('handles a response message', () => {
      expect(parseApiError({ response: { data: { message: 'Too many requests' } } })).toBe(
        'Too many requests',
      );
    });

    it('falls back to a plain Error message', () => {
      expect(parseApiError(new Error('Network down'))).toBe('Network down');
    });

    it('passes strings through', () => {
      expect(parseApiError('Something broke')).toBe('Something broke');
    });
  });

  describe('falls back safely', () => {
    it('uses the default for null, undefined and empty payloads', () => {
      expect(parseApiError(null, 'fallback')).toBe('fallback');
      expect(parseApiError(undefined, 'fallback')).toBe('fallback');
      expect(parseApiError({}, 'fallback')).toBe('fallback');
    });

    it('uses the default when errors is empty or malformed', () => {
      expect(parseApiError({ errors: [] }, 'fallback')).toBe('fallback');
      expect(parseApiError({ errors: [{}] }, 'fallback')).toBe('fallback');
      expect(parseApiError({ errors: 'nope' }, 'fallback')).toBe('fallback');
    });

    it('ignores a blank detail rather than showing an empty message', () => {
      expect(parseApiError({ errors: [{ detail: '   ' }] }, 'fallback')).toBe('fallback');
    });

    it('still reports statusText when nothing better exists', () => {
      expect(parseApiError({ response: { statusText: 'Bad Gateway' } })).toBe('Bad Gateway');
    });
  });
});
