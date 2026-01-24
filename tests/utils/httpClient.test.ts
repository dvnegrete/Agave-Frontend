import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { httpClient } from '../../src/utils/httpClient';

describe('HttpClient', () => {
  const baseURL = 'http://localhost:3000';

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('GET requests', () => {
    it('should make a GET request successfully', async () => {
      const mockData = { id: 1, name: 'Test' };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockData,
      });

      const result = await httpClient.get('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        `${baseURL}/test`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should handle GET request errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'Resource not found' }),
      });

      await expect(httpClient.get('/not-found')).rejects.toThrow(
        'Resource not found'
      );
    });
  });

  describe('POST requests', () => {
    it('should make a POST request with JSON body', async () => {
      const postData = { name: 'Test', value: 123 };
      const mockResponse = { id: 1, ...postData };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 201,
        statusText: 'Created',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse,
      });

      const result = await httpClient.post('/test', postData);

      expect(global.fetch).toHaveBeenCalledWith(
        `${baseURL}/test`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(postData),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle FormData in POST requests', async () => {
      const formData = new FormData();
      formData.append('file', new Blob(['test']), 'test.txt');

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true }),
      });

      await httpClient.post('/upload', formData);

      const callArgs = (global.fetch as any).mock.calls[0];
      expect(callArgs[1].body).toBeInstanceOf(FormData);
      // Content-Type debe ser undefined para FormData (el browser lo setea)
      expect(callArgs[1].headers['Content-Type']).toBeUndefined();
    });
  });

  describe('PUT requests', () => {
    it('should make a PUT request successfully', async () => {
      const updateData = { name: 'Updated' };
      const mockResponse = { id: 1, ...updateData };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse,
      });

      const result = await httpClient.put('/test/1', updateData);

      expect(global.fetch).toHaveBeenCalledWith(
        `${baseURL}/test/1`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('DELETE requests', () => {
    it('should make a DELETE request successfully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 204,
        statusText: 'No Content',
        headers: new Headers(),
        json: async () => ({}),
      });

      const result = await httpClient.delete('/test/1');

      expect(global.fetch).toHaveBeenCalledWith(
        `${baseURL}/test/1`,
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('PATCH requests', () => {
    it('should make a PATCH request successfully', async () => {
      const patchData = { status: 'active' };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ id: 1, ...patchData }),
      });

      await httpClient.patch('/test/1', patchData);

      expect(global.fetch).toHaveBeenCalledWith(
        `${baseURL}/test/1`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(patchData),
        })
      );
    });
  });

  describe('AbortController support', () => {
    it('should support AbortSignal', async () => {
      const abortController = new AbortController();

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({}),
      });

      await httpClient.get('/test', { signal: abortController.signal });

      expect(global.fetch).toHaveBeenCalledWith(
        `${baseURL}/test`,
        expect.objectContaining({
          signal: abortController.signal,
        })
      );
    });
  });

  describe('Error handling', () => {
    it('should throw error when response is not ok', async () => {
      const errorMessage = 'Bad Request';

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: errorMessage }),
      });

      await expect(httpClient.get('/test')).rejects.toThrow(errorMessage);
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(httpClient.get('/test')).rejects.toThrow('Network error');
    });

    it('should handle non-JSON responses', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'text/html' }),
      });

      const result = await httpClient.get('/test');
      expect(result).toEqual({});
    });
  });
});
