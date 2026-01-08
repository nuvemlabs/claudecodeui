import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authenticatedFetch, api } from './api.js';

// Mock fetch globally
global.fetch = vi.fn();

// Mock localStorage
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

// Mock import.meta.env
vi.stubEnv('VITE_IS_PLATFORM', 'false');

describe('API Utils', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    // Reset fetch mock
    global.fetch.mockReset();
    // Reset localStorage mock
    global.localStorage.getItem.mockReturnValue(null);
  });

  describe('authenticatedFetch', () => {
    it('should include authorization header when token exists', async () => {
      const mockResponse = { ok: true, json: async () => ({ data: 'test' }) };
      global.fetch.mockResolvedValueOnce(mockResponse);
      global.localStorage.getItem.mockReturnValue('test-token');

      await authenticatedFetch('/api/test');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should not include authorization header when no token', async () => {
      const mockResponse = { ok: true, json: async () => ({ data: 'test' }) };
      global.fetch.mockResolvedValueOnce(mockResponse);

      await authenticatedFetch('/api/test');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );

      // Check that Authorization header is not present
      const callArgs = global.fetch.mock.calls[0];
      expect(callArgs[1].headers).not.toHaveProperty('Authorization');
    });

    it('should not set Content-Type for FormData', async () => {
      const mockResponse = { ok: true, json: async () => ({ data: 'test' }) };
      global.fetch.mockResolvedValueOnce(mockResponse);

      const formData = new FormData();
      await authenticatedFetch('/api/upload', { body: formData });

      // Check that Content-Type is not set for FormData
      const callArgs = global.fetch.mock.calls[0];
      expect(callArgs[1].headers).not.toHaveProperty('Content-Type');
    });

    it('should merge custom headers', async () => {
      const mockResponse = { ok: true, json: async () => ({ data: 'test' }) };
      global.fetch.mockResolvedValueOnce(mockResponse);

      await authenticatedFetch('/api/test', {
        headers: { 'X-Custom-Header': 'custom-value' }
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Custom-Header': 'custom-value'
          })
        })
      );
    });
  });

  describe('API endpoints', () => {
    describe('auth endpoints', () => {
      it('should support login', async () => {
        const mockResponse = { ok: true, json: async () => ({ token: 'test-token' }) };
        global.fetch.mockResolvedValueOnce(mockResponse);

        await api.auth.login('testuser', 'password');

        expect(global.fetch).toHaveBeenCalledWith(
          '/api/auth/login',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'testuser', password: 'password' })
          })
        );
      });

      it('should support register', async () => {
        const mockResponse = { ok: true, json: async () => ({ token: 'test-token' }) };
        global.fetch.mockResolvedValueOnce(mockResponse);

        await api.auth.register('newuser', 'password');

        expect(global.fetch).toHaveBeenCalledWith(
          '/api/auth/register',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'newuser', password: 'password' })
          })
        );
      });

      it('should support status check', async () => {
        const mockResponse = { ok: true, json: async () => ({ authenticated: true }) };
        global.fetch.mockResolvedValueOnce(mockResponse);

        await api.auth.status();

        expect(global.fetch).toHaveBeenCalledWith('/api/auth/status');
      });

      it('should support logout', async () => {
        const mockResponse = { ok: true, json: async () => ({ success: true }) };
        global.fetch.mockResolvedValueOnce(mockResponse);
        global.localStorage.getItem.mockReturnValue('test-token');

        await api.auth.logout();

        expect(global.fetch).toHaveBeenCalledWith(
          '/api/auth/logout',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Authorization': 'Bearer test-token'
            })
          })
        );
      });
    });

    describe('protected endpoints', () => {
      beforeEach(() => {
        global.localStorage.getItem.mockReturnValue('test-token');
      });

      it('should fetch projects with authentication', async () => {
        const mockResponse = { ok: true, json: async () => ({ projects: [] }) };
        global.fetch.mockResolvedValueOnce(mockResponse);

        await api.projects();

        expect(global.fetch).toHaveBeenCalledWith(
          '/api/projects',
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': 'Bearer test-token'
            })
          })
        );
      });

      it('should fetch sessions with query parameters', async () => {
        const mockResponse = { ok: true, json: async () => ({ sessions: [] }) };
        global.fetch.mockResolvedValueOnce(mockResponse);

        await api.sessions('test-project', 10, 5);

        expect(global.fetch).toHaveBeenCalledWith(
          '/api/projects/test-project/sessions?limit=10&offset=5',
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': 'Bearer test-token'
            })
          })
        );
      });
    });
  });
});