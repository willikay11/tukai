import * as apiService from '@/services/apiService';
import * as imageUtils from '@/utils/images';

import * as experienceService from './experience';

jest.mock('@/services/apiService');
jest.mock('@/utils/images');
jest.mock('@/utils/parseSnakeToCamel', () => ({
  parseSnakeToCamel: (data: any) => data,
}));

const mockAssertValidImageFiles = imageUtils.assertValidImageFiles as jest.MockedFunction<
  typeof imageUtils.assertValidImageFiles
>;

const createMockInstance = () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
});

// Get the mocked versions of api and apiWithToken
const mockApi = createMockInstance();
const mockApiWithToken = jest.fn();

describe('Experience Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAssertValidImageFiles.mockResolvedValue(undefined);
    // Setup the mocked api and apiWithToken from the mocked module
    (apiService.api as any) = mockApi;
    mockApiWithToken.mockResolvedValue(mockApi);
    (apiService.apiWithToken as any) = mockApiWithToken;
  });

  describe('fetchExperiences', () => {
    it('fetches experiences without authentication', async () => {
      const mockData = {
        data: { results: [{ id: 'exp-1', title: 'Experience 1' }], count: 1 },
        status: 200,
      };
      mockApi.get.mockResolvedValue(mockData);

      const result = await experienceService.fetchExperiences({ page: 1, page_size: 10 });

      expect(mockApi.get).toHaveBeenCalledWith('/v1/experiences/', {
        params: { page: 1, page_size: 10 },
      });
      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
      expect(result.data).toEqual(mockData.data);
    });

    it('fetches experiences with authentication when invited flag is true', async () => {
      const mockData = {
        data: { results: [{ id: 'exp-1', title: 'Invited Experience' }], count: 1 },
        status: 200,
      };
      mockApi.get.mockResolvedValue(mockData);

      const result = await experienceService.fetchExperiences({ page: 1, invited: true });

      expect(mockApiWithToken).toHaveBeenCalled();
      expect(mockApi.get).toHaveBeenCalledWith('/v1/experiences/', {
        params: { page: 1, invited: true },
      });
      expect(result.success).toBe(true);
    });

    it('handles error response', async () => {
      const error = {
        response: {
          status: 404,
          data: { message: 'Not found' },
        },
      };
      mockApi.get.mockRejectedValue(error);

      await expect(experienceService.fetchExperiences({})).rejects.toEqual({
        status: 404,
        success: false,
        message: 'Not found',
      });
    });

    it('handles network error with default message', async () => {
      const error = new Error('Network error');
      mockApi.get.mockRejectedValue(error);

      await expect(experienceService.fetchExperiences({})).rejects.toEqual({
        status: 500,
        success: false,
        message: 'An unexpected error occurred',
      });
    });

    it('passes multiple filter parameters', async () => {
      const mockData = { data: { results: [], count: 0 }, status: 200 };
      mockApi.get.mockResolvedValue(mockData);

      await experienceService.fetchExperiences({
        page: 2,
        page_size: 20,
        category: 'cat-123',
        status: 'PUBLISHED',
        search: 'hiking',
      });

      expect(mockApi.get).toHaveBeenCalledWith('/v1/experiences/', {
        params: {
          page: 2,
          page_size: 20,
          category: 'cat-123',
          status: 'PUBLISHED',
          search: 'hiking',
        },
      });
    });
  });

  describe('fetchExperience', () => {
    it('fetches single experience without authentication', async () => {
      const mockData = { data: { id: 'exp-1', title: 'Experience' }, status: 200 };
      mockApi.get.mockResolvedValue(mockData);

      const result = await experienceService.fetchExperience('exp-1');

      expect(mockApi.get).toHaveBeenCalledWith('/v1/experiences/exp-1');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData.data);
    });

    it('fetches single experience with authentication when withAuth is true', async () => {
      const mockData = { data: { id: 'exp-1', title: 'Private Experience' }, status: 200 };
      mockApi.get.mockResolvedValue(mockData);

      const result = await experienceService.fetchExperience('exp-1', true);

      expect(mockApiWithToken).toHaveBeenCalled();
      expect(mockApi.get).toHaveBeenCalledWith('/v1/experiences/exp-1');
      expect(result.success).toBe(true);
    });

    it('handles 404 error when experience not found', async () => {
      const error = {
        response: {
          status: 404,
          data: { message: 'Experience not found' },
        },
      };
      mockApi.get.mockRejectedValue(error);

      await expect(experienceService.fetchExperience('nonexistent')).rejects.toEqual({
        status: 404,
        success: false,
        message: 'Experience not found',
      });
    });
  });

  describe('purchaseExperienceTicket', () => {
    it('purchases ticket with purchaser details', async () => {
      const purchaserData = {
        experience_id: 'exp-1',
        ticket_id: 'ticket-1',
        email: 'user@example.com',
        phone: '+254712345678',
        quantity: 2,
      };

      const mockResponse = {
        data: { order_id: 'order-123', status: 'confirmed' },
        status: 201,
      };
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await experienceService.purchaseExperienceTicket(purchaserData as any);

      expect(mockApi.post).toHaveBeenCalledWith('/v1/experiences/ticket-purchases/', purchaserData);
      expect(result.success).toBe(true);
      expect(result.status).toBe(201);
    });

    it('handles payment error', async () => {
      const error = {
        response: {
          status: 402,
          data: { message: 'Payment declined' },
        },
      };
      mockApi.post.mockRejectedValue(error);

      await expect(experienceService.purchaseExperienceTicket({} as any)).rejects.toEqual({
        status: 402,
        success: false,
        message: 'Payment declined',
        data: { message: 'Payment declined' },
      });
    });

    it('includes error data in response', async () => {
      const errorData = {
        message: 'Ticket already purchased',
        code: 'DUPLICATE_PURCHASE',
      };
      const error = {
        response: {
          status: 409,
          data: errorData,
        },
      };
      mockApi.post.mockRejectedValue(error);

      try {
        await experienceService.purchaseExperienceTicket({} as any);
      } catch (e: any) {
        expect(e.data).toEqual(errorData);
      }
    });
  });

  describe('bookmarkExperience', () => {
    it('bookmarks experience with authentication', async () => {
      const mockResponse = { data: { bookmarked: true }, status: 200 };
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await experienceService.bookmarkExperience('exp-1');

      expect(mockApiWithToken).toHaveBeenCalled();
      expect(mockApi.post).toHaveBeenCalledWith('/v1/experiences/exp-1/bookmark/');
      expect(result.success).toBe(true);
    });

    it('handles bookmark error', async () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      };
      mockApi.post.mockRejectedValue(error);

      await expect(experienceService.bookmarkExperience('exp-1')).rejects.toEqual({
        status: 401,
        success: false,
        message: 'Unauthorized',
      });
    });
  });

  describe('createExperience', () => {
    it('creates experience with form data', async () => {
      const mockResponse = { data: { id: 'exp-new', title: 'New Experience' }, status: 201 };
      mockApi.post.mockResolvedValue(mockResponse);

      const experienceData = {
        title: 'New Experience',
        description: 'Description',
        googleMapPlaceId: 'place-123',
        startDate: '2024-05-01',
        endDate: '2024-05-01',
        recurrence_rule: 'FREQ=WEEKLY',
        categoriesIds: ['cat-1'],
        isPublic: true,
      };

      const result = await experienceService.createExperience(experienceData as any);

      expect(mockApiWithToken).toHaveBeenCalled();
      expect(mockApi.post).toHaveBeenCalledWith('/v2/experiences/', expect.any(FormData), {
        headers: { 'Content-Type': undefined },
      });
      expect(result.success).toBe(true);
    });

    it('handles form data validation error', async () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Invalid experience data' },
        },
      };
      mockApi.post.mockRejectedValue(error);

      const experienceData = {
        title: 'Experience',
        description: 'Description',
        googleMapPlaceId: 'place-123',
        startDate: '2024-05-01',
        endDate: '2024-05-01',
        recurrence_rule: '',
        categoriesIds: ['cat-1'],
      };

      await expect(experienceService.createExperience(experienceData as any)).rejects.toEqual({
        status: 400,
        success: false,
        message: 'Invalid experience data',
      });
    });
  });

  describe('updateExperience', () => {
    it('updates experience with form data', async () => {
      const mockResponse = { data: { id: 'exp-1', title: 'Updated' }, status: 200 };
      mockApi.patch.mockResolvedValue(mockResponse);

      const experienceData = {
        title: 'Updated Experience',
        description: 'Updated description',
        googleMapPlaceId: 'place-123',
        startDate: '2024-05-01',
        endDate: '2024-05-02',
        recurrence_rule: 'FREQ=DAILY',
        categoriesIds: ['cat-1'],
        isPaid: true,
      };

      const result = await experienceService.updateExperience('exp-1', experienceData as any);

      expect(mockApiWithToken).toHaveBeenCalled();
      expect(mockApi.patch).toHaveBeenCalledWith('/v2/experiences/exp-1/', expect.any(FormData), {
        headers: { 'Content-Type': undefined },
      });
      expect(result.success).toBe(true);
    });

    it('includes invited community IDs when provided', async () => {
      const mockResponse = { data: { id: 'exp-1' }, status: 200 };
      mockApi.patch.mockResolvedValue(mockResponse);

      const experienceData = {
        title: 'Experience',
        description: 'Description',
        googleMapPlaceId: 'place-123',
        startDate: '2024-05-01',
        endDate: '2024-05-01',
        recurrence_rule: '',
        categoriesIds: ['cat-1'],
        invitedCommunityIds: ['comm-1', 'comm-2'],
      };

      await experienceService.updateExperience('exp-1', experienceData as any);

      expect(mockApi.patch).toHaveBeenCalled();
    });
  });

  // Photos are no longer part of the create payload — they are posted to their
  // own endpoint afterwards, which is where the file validation now lives.
  describe('addExperiencePhotos', () => {
    it('validates the files, then posts them against the experience', async () => {
      mockApi.post.mockResolvedValue({ data: { id: 'photo-1' }, status: 201 });
      mockAssertValidImageFiles.mockResolvedValue(undefined);
      const photoFile = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' });

      const result = await experienceService.addExperiencePhotos('exp-1', [photoFile]);

      expect(mockAssertValidImageFiles).toHaveBeenCalledWith([photoFile]);
      expect(mockApi.post).toHaveBeenCalledWith('/v1/experiences/photos/', expect.any(FormData), {
        headers: { 'Content-Type': undefined },
      });
      expect(result.success).toBe(true);
    });

    it('rejects without posting when a file is not a valid image', async () => {
      mockAssertValidImageFiles.mockRejectedValue(new Error('Invalid image'));
      const photoFile = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' });

      await expect(
        experienceService.addExperiencePhotos('exp-1', [photoFile]),
      ).rejects.toBeDefined();
      expect(mockApi.post).not.toHaveBeenCalled();
    });
  });

  describe('createExperienceTicket', () => {
    it('creates ticket with authenticated request', async () => {
      const mockResponse = { data: { id: 'ticket-123', quantity: 5 }, status: 201 };
      mockApi.post.mockResolvedValue(mockResponse);

      const ticketData = {
        experience_id: 'exp-1',
        slot: '2024-05-01',
        quantity: 5,
      };

      const result = await experienceService.createExperienceTicket('exp-1', ticketData as any);

      expect(mockApiWithToken).toHaveBeenCalled();
      expect(mockApi.post).toHaveBeenCalledWith('/v2/experiences/exp-1/tickets/', ticketData);
      expect(result.success).toBe(true);
    });

    it('handles ticket creation error', async () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Invalid ticket slot' },
        },
      };
      mockApi.post.mockRejectedValue(error);

      await expect(experienceService.createExperienceTicket('exp-1', {} as any)).rejects.toEqual({
        status: 400,
        success: false,
        message: 'Invalid ticket slot',
      });
    });
  });

  describe('updateExperienceTicket', () => {
    it('patches the ticket under its experience', async () => {
      const mockResponse = { data: { id: 'ticket-1', quantity: 10 }, status: 200 };
      mockApi.patch.mockResolvedValue(mockResponse);

      const ticketData = { quantity: 10 };

      const result = await experienceService.updateExperienceTicket(
        'exp-1',
        'ticket-1',
        ticketData as any,
      );

      expect(mockApiWithToken).toHaveBeenCalled();
      expect(mockApi.patch).toHaveBeenCalledWith(
        '/v2/experiences/exp-1/tickets/ticket-1/',
        ticketData,
      );
      expect(result.success).toBe(true);
    });
  });

  describe('deleteExperienceTicket', () => {
    it('deletes ticket with DELETE request', async () => {
      const mockResponse = { data: { success: true }, status: 204 };
      mockApi.delete.mockResolvedValue(mockResponse);

      const result = await experienceService.deleteExperienceTicket('exp-1', 'ticket-1');

      expect(mockApiWithToken).toHaveBeenCalled();
      expect(mockApi.delete).toHaveBeenCalledWith('/v1/experiences/exp-1/tickets/ticket-1/');
      expect(result.success).toBe(true);
    });

    it('handles delete error', async () => {
      const error = {
        response: {
          status: 404,
          data: { message: 'Ticket not found' },
        },
      };
      mockApi.delete.mockRejectedValue(error);

      await expect(
        experienceService.deleteExperienceTicket('exp-1', 'nonexistent'),
      ).rejects.toEqual({
        status: 404,
        success: false,
        message: 'Ticket not found',
      });
    });
  });

  describe('addGuestToExperience', () => {
    it('adds guest with email', async () => {
      const mockResponse = { data: { guest_email: 'guest@example.com' }, status: 201 };
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await experienceService.addGuestToExperience('exp-1', 'guest@example.com');

      expect(mockApiWithToken).toHaveBeenCalled();
      expect(mockApi.post).toHaveBeenCalledWith('/v1/experiences/exp-1/guests/', {
        email: 'guest@example.com',
      });
      expect(result.success).toBe(true);
    });

    it('handles invalid email error', async () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Invalid email format' },
        },
      };
      mockApi.post.mockRejectedValue(error);

      await expect(
        experienceService.addGuestToExperience('exp-1', 'invalid-email'),
      ).rejects.toEqual({
        status: 400,
        success: false,
        message: 'Invalid email format',
      });
    });
  });

  describe('publishExperience', () => {
    it('publishes experience', async () => {
      const mockResponse = { data: { status: 'PUBLISHED' }, status: 200 };
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await experienceService.publishExperience('exp-1');

      expect(mockApiWithToken).toHaveBeenCalled();
      expect(mockApi.post).toHaveBeenCalledWith('/v1/experiences/exp-1/publish/');
      expect(result.success).toBe(true);
    });

    it('handles publish error when experience incomplete', async () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Experience incomplete - missing required fields' },
        },
      };
      mockApi.post.mockRejectedValue(error);

      await expect(experienceService.publishExperience('exp-1')).rejects.toEqual({
        status: 400,
        success: false,
        message: 'Experience incomplete - missing required fields',
      });
    });

    // The API's real error shape — this used to be swallowed and replaced with
    // "An unexpected error occurred"
    it('surfaces the API detail from the errors array', async () => {
      const error = {
        response: {
          status: 400,
          data: { errors: [{ detail: 'Cannot publish an experience without tickets.' }] },
        },
      };
      mockApi.post.mockRejectedValue(error);

      await expect(experienceService.publishExperience('exp-1')).rejects.toEqual({
        status: 400,
        success: false,
        message: 'Cannot publish an experience without tickets.',
      });
    });
  });

  describe('cancelExperience', () => {
    it('posts to the cancel action, the way publish does', async () => {
      const mockResponse = { data: { status: 'CANCELLED' }, status: 200 };
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await experienceService.cancelExperience('exp-1');

      expect(mockApiWithToken).toHaveBeenCalled();
      expect(mockApi.post).toHaveBeenCalledWith('/v1/experiences/exp-1/cancel/');
      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
    });

    it('surfaces the API detail from the errors array', async () => {
      const error = {
        response: {
          status: 400,
          data: { errors: [{ detail: 'Cannot cancel an experience with sold tickets.' }] },
        },
      };
      mockApi.post.mockRejectedValue(error);

      await expect(experienceService.cancelExperience('exp-1')).rejects.toEqual({
        status: 400,
        success: false,
        message: 'Cannot cancel an experience with sold tickets.',
      });
    });

    it('falls back to a generic message when the error carries no detail', async () => {
      mockApi.post.mockRejectedValue({ message: 'Network Error' });

      await expect(experienceService.cancelExperience('exp-1')).rejects.toEqual({
        status: 500,
        success: false,
        message: 'An unexpected error occurred',
      });
    });
  });
});
