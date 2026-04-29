import * as experienceService from './experience';
import * as apiService from '@/services/apiService';
import * as imageUtils from '@/utils/images';

jest.mock('@/services/apiService');
jest.mock('@/utils/images');
jest.mock('@/utils/parseSnakeToCamel', () => (data: any) => data);

const mockApi = apiService.api as jest.Mocked<typeof apiService.api>;
const mockApiWithToken = apiService.apiWithToken as jest.MockedFunction<
  typeof apiService.apiWithToken
>;
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

describe('Experience Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAssertValidImageFiles.mockResolvedValue(undefined);
  });

  describe('fetchExperiences', () => {
    it('fetches experiences without authentication', async () => {
      const mockData = {
        data: { results: [{ id: 'exp-1', title: 'Experience 1' }], count: 1 },
        status: 200,
      };
      mockApi.get = jest.fn().mockResolvedValue(mockData);

      const result = await experienceService.fetchExperiences({ page: 1, page_size: 10 });

      expect(mockApi.get).toHaveBeenCalledWith('/v1/experiences/', {
        params: { page: 1, page_size: 10 },
      });
      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
      expect(result.data).toEqual(mockData.data);
    });

    it('fetches experiences with authentication when invited flag is true', async () => {
      const mockInstance = { get: jest.fn() };
      mockApiWithToken.mockResolvedValue(mockInstance as any);

      const mockData = {
        data: { results: [{ id: 'exp-1', title: 'Invited Experience' }], count: 1 },
        status: 200,
      };
      mockInstance.get.mockResolvedValue(mockData);

      const result = await experienceService.fetchExperiences({ page: 1, invited: true });

      expect(mockApiWithToken).toHaveBeenCalled();
      expect(mockInstance.get).toHaveBeenCalledWith('/v1/experiences/', {
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
      mockApi.get = jest.fn().mockRejectedValue(error);

      await expect(experienceService.fetchExperiences({})).rejects.toEqual({
        status: 404,
        success: false,
        message: 'Not found',
      });
    });

    it('handles network error with default message', async () => {
      const error = new Error('Network error');
      mockApi.get = jest.fn().mockRejectedValue(error);

      await expect(experienceService.fetchExperiences({})).rejects.toEqual({
        status: 500,
        success: false,
        message: 'An unexpected error occurred',
      });
    });

    it('passes multiple filter parameters', async () => {
      const mockData = { data: { results: [], count: 0 }, status: 200 };
      mockApi.get = jest.fn().mockResolvedValue(mockData);

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
      mockApi.get = jest.fn().mockResolvedValue(mockData);

      const result = await experienceService.fetchExperience('exp-1');

      expect(mockApi.get).toHaveBeenCalledWith('/v1/experiences/exp-1');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData.data);
    });

    it('fetches single experience with authentication when withAuth is true', async () => {
      const mockInstance = { get: jest.fn() };
      mockApiWithToken.mockResolvedValue(mockInstance as any);

      const mockData = { data: { id: 'exp-1', title: 'Private Experience' }, status: 200 };
      mockInstance.get.mockResolvedValue(mockData);

      const result = await experienceService.fetchExperience('exp-1', true);

      expect(mockApiWithToken).toHaveBeenCalled();
      expect(mockInstance.get).toHaveBeenCalledWith('/v1/experiences/exp-1');
      expect(result.success).toBe(true);
    });

    it('handles 404 error when experience not found', async () => {
      const error = {
        response: {
          status: 404,
          data: { message: 'Experience not found' },
        },
      };
      mockApi.get = jest.fn().mockRejectedValue(error);

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
      mockApi.post = jest.fn().mockResolvedValue(mockResponse);

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
      mockApi.post = jest.fn().mockRejectedValue(error);

      await expect(
        experienceService.purchaseExperienceTicket({} as any)
      ).rejects.toEqual({
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
      mockApi.post = jest.fn().mockRejectedValue(error);

      try {
        await experienceService.purchaseExperienceTicket({} as any);
      } catch (e: any) {
        expect(e.data).toEqual(errorData);
      }
    });
  });

  describe('bookmarkExperience', () => {
    it('bookmarks experience with authentication', async () => {
      const mockInstance = { post: jest.fn() };
      mockApiWithToken.mockResolvedValue(mockInstance as any);

      const mockResponse = { data: { bookmarked: true }, status: 200 };
      mockInstance.post.mockResolvedValue(mockResponse);

      const result = await experienceService.bookmarkExperience('exp-1');

      expect(mockApiWithToken).toHaveBeenCalled();
      expect(mockInstance.post).toHaveBeenCalledWith('/v1/experiences/exp-1/bookmark/');
      expect(result.success).toBe(true);
    });

    it('handles bookmark error', async () => {
      const mockInstance = { post: jest.fn() };
      mockApiWithToken.mockResolvedValue(mockInstance as any);

      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      };
      mockInstance.post.mockRejectedValue(error);

      await expect(experienceService.bookmarkExperience('exp-1')).rejects.toEqual({
        status: 401,
        success: false,
        message: 'Unauthorized',
      });
    });
  });

  describe('createExperience', () => {
    it('creates experience with form data', async () => {
      const mockInstance = { post: jest.fn() };
      mockApiWithToken.mockResolvedValue(mockInstance as any);

      const mockResponse = { data: { id: 'exp-new', title: 'New Experience' }, status: 201 };
      mockInstance.post.mockResolvedValue(mockResponse);

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
      expect(mockInstance.post).toHaveBeenCalledWith(
        '/v1/experiences/',
        expect.any(FormData),
        { headers: { 'Content-Type': undefined } }
      );
      expect(result.success).toBe(true);
    });

    it('includes photos in form data when provided', async () => {
      const mockInstance = { post: jest.fn() };
      mockApiWithToken.mockResolvedValue(mockInstance as any);

      const mockResponse = { data: { id: 'exp-new' }, status: 201 };
      mockInstance.post.mockResolvedValue(mockResponse);

      const photoFile = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' });
      mockAssertValidImageFiles.mockResolvedValue(undefined);

      const experienceData = {
        title: 'Experience with Photos',
        description: 'Description',
        googleMapPlaceId: 'place-123',
        startDate: '2024-05-01',
        endDate: '2024-05-01',
        recurrence_rule: '',
        categoriesIds: ['cat-1'],
        newPhotos: [photoFile],
      };

      await experienceService.createExperience(experienceData as any);

      expect(mockAssertValidImageFiles).toHaveBeenCalledWith([photoFile]);
      expect(mockInstance.post).toHaveBeenCalled();
    });

    it('validates images before uploading', async () => {
      const mockInstance = { post: jest.fn() };
      mockApiWithToken.mockResolvedValue(mockInstance as any);

      const photoFile = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' });
      mockAssertValidImageFiles.mockRejectedValue(new Error('Invalid image'));

      const experienceData = {
        title: 'Experience',
        description: 'Description',
        googleMapPlaceId: 'place-123',
        startDate: '2024-05-01',
        endDate: '2024-05-01',
        recurrence_rule: '',
        categoriesIds: ['cat-1'],
        newPhotos: [photoFile],
      };

      await expect(
        experienceService.createExperience(experienceData as any)
      ).rejects.toThrow('Invalid image');
    });

    it('handles form data validation error', async () => {
      const mockInstance = { post: jest.fn() };
      mockApiWithToken.mockResolvedValue(mockInstance as any);

      const error = {
        response: {
          status: 400,
          data: { message: 'Invalid experience data' },
        },
      };
      mockInstance.post.mockRejectedValue(error);

      await expect(
        experienceService.createExperience({} as any)
      ).rejects.toEqual({
        status: 400,
        success: false,
        message: 'Invalid experience data',
      });
    });
  });

  describe('updateExperience', () => {
    it('updates experience with form data', async () => {
      const mockInstance = { patch: jest.fn() };
      mockApiWithToken.mockResolvedValue(mockInstance as any);

      const mockResponse = { data: { id: 'exp-1', title: 'Updated' }, status: 200 };
      mockInstance.patch.mockResolvedValue(mockResponse);

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
      expect(mockInstance.patch).toHaveBeenCalledWith(
        '/v1/experiences/exp-1/',
        expect.any(FormData),
        { headers: { 'Content-Type': undefined } }
      );
      expect(result.success).toBe(true);
    });

    it('includes invited community IDs when provided', async () => {
      const mockInstance = { patch: jest.fn() };
      mockApiWithToken.mockResolvedValue(mockInstance as any);

      const mockResponse = { data: { id: 'exp-1' }, status: 200 };
      mockInstance.patch.mockResolvedValue(mockResponse);

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

      expect(mockInstance.patch).toHaveBeenCalled();
    });
  });

  describe('createExperienceTicket', () => {
    it('creates ticket with authenticated request', async () => {
      const mockInstance = { post: jest.fn() };
      mockApiWithToken.mockResolvedValue(mockInstance as any);

      const mockResponse = { data: { id: 'ticket-123', quantity: 5 }, status: 201 };
      mockInstance.post.mockResolvedValue(mockResponse);

      const ticketData = {
        experience_id: 'exp-1',
        slot: '2024-05-01',
        quantity: 5,
      };

      const result = await experienceService.createExperienceTicket(ticketData as any);

      expect(mockApiWithToken).toHaveBeenCalled();
      expect(mockInstance.post).toHaveBeenCalledWith('/v1/experiences/tickets/', ticketData);
      expect(result.success).toBe(true);
    });

    it('handles ticket creation error', async () => {
      const mockInstance = { post: jest.fn() };
      mockApiWithToken.mockResolvedValue(mockInstance as any);

      const error = {
        response: {
          status: 400,
          data: { message: 'Invalid ticket slot' },
        },
      };
      mockInstance.post.mockRejectedValue(error);

      await expect(
        experienceService.createExperienceTicket({} as any)
      ).rejects.toEqual({
        status: 400,
        success: false,
        message: 'Invalid ticket slot',
      });
    });
  });

  describe('updateExperienceTicket', () => {
    it('updates ticket with PUT request', async () => {
      const mockInstance = { put: jest.fn() };
      mockApiWithToken.mockResolvedValue(mockInstance as any);

      const mockResponse = { data: { id: 'ticket-1', quantity: 10 }, status: 200 };
      mockInstance.put.mockResolvedValue(mockResponse);

      const ticketData = { quantity: 10 };

      const result = await experienceService.updateExperienceTicket('ticket-1', ticketData as any);

      expect(mockApiWithToken).toHaveBeenCalled();
      expect(mockInstance.put).toHaveBeenCalledWith('/v1/experiences/tickets/ticket-1/', ticketData);
      expect(result.success).toBe(true);
    });
  });

  describe('deleteExperienceTicket', () => {
    it('deletes ticket with DELETE request', async () => {
      const mockInstance = { delete: jest.fn() };
      mockApiWithToken.mockResolvedValue(mockInstance as any);

      const mockResponse = { data: { success: true }, status: 204 };
      mockInstance.delete.mockResolvedValue(mockResponse);

      const result = await experienceService.deleteExperienceTicket('ticket-1');

      expect(mockApiWithToken).toHaveBeenCalled();
      expect(mockInstance.delete).toHaveBeenCalledWith('/v1/experiences/tickets/ticket-1/');
      expect(result.success).toBe(true);
    });

    it('handles delete error', async () => {
      const mockInstance = { delete: jest.fn() };
      mockApiWithToken.mockResolvedValue(mockInstance as any);

      const error = {
        response: {
          status: 404,
          data: { message: 'Ticket not found' },
        },
      };
      mockInstance.delete.mockRejectedValue(error);

      await expect(experienceService.deleteExperienceTicket('nonexistent')).rejects.toEqual({
        status: 404,
        success: false,
        message: 'Ticket not found',
      });
    });
  });

  describe('addGuestToExperience', () => {
    it('adds guest with email', async () => {
      const mockInstance = { post: jest.fn() };
      mockApiWithToken.mockResolvedValue(mockInstance as any);

      const mockResponse = { data: { guest_email: 'guest@example.com' }, status: 201 };
      mockInstance.post.mockResolvedValue(mockResponse);

      const result = await experienceService.addGuestToExperience('exp-1', 'guest@example.com');

      expect(mockApiWithToken).toHaveBeenCalled();
      expect(mockInstance.post).toHaveBeenCalledWith('/v1/experiences/exp-1/guests/', {
        email: 'guest@example.com',
      });
      expect(result.success).toBe(true);
    });

    it('handles invalid email error', async () => {
      const mockInstance = { post: jest.fn() };
      mockApiWithToken.mockResolvedValue(mockInstance as any);

      const error = {
        response: {
          status: 400,
          data: { message: 'Invalid email format' },
        },
      };
      mockInstance.post.mockRejectedValue(error);

      await expect(
        experienceService.addGuestToExperience('exp-1', 'invalid-email')
      ).rejects.toEqual({
        status: 400,
        success: false,
        message: 'Invalid email format',
      });
    });
  });

  describe('publishExperience', () => {
    it('publishes experience', async () => {
      const mockInstance = { post: jest.fn() };
      mockApiWithToken.mockResolvedValue(mockInstance as any);

      const mockResponse = { data: { status: 'PUBLISHED' }, status: 200 };
      mockInstance.post.mockResolvedValue(mockResponse);

      const result = await experienceService.publishExperience('exp-1');

      expect(mockApiWithToken).toHaveBeenCalled();
      expect(mockInstance.post).toHaveBeenCalledWith('/v1/experiences/exp-1/publish/');
      expect(result.success).toBe(true);
    });

    it('handles publish error when experience incomplete', async () => {
      const mockInstance = { post: jest.fn() };
      mockApiWithToken.mockResolvedValue(mockInstance as any);

      const error = {
        response: {
          status: 400,
          data: { message: 'Experience incomplete - missing required fields' },
        },
      };
      mockInstance.post.mockRejectedValue(error);

      await expect(experienceService.publishExperience('exp-1')).rejects.toEqual({
        status: 400,
        success: false,
        message: 'Experience incomplete - missing required fields',
      });
    });
  });
});
