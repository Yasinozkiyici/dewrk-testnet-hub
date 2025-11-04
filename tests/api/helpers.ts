/**
 * API Test Helpers
 * 
 * Bu dosya API testleri için yardımcı fonksiyonlar içerir.
 */

import { NextRequest } from 'next/server';
import { vi } from 'vitest';

export interface MockResponse<T = any> {
  data: T | null;
  error: Error | null;
}

/**
 * Mock Supabase client factory
 */
export function createMockSupabaseClient(mockResponse: MockResponse = { data: [], error: null }) {
  return {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve(mockResponse)),
            then: vi.fn((callback: any) => Promise.resolve(callback(mockResponse)))
          })),
          then: vi.fn((callback: any) => Promise.resolve(callback(mockResponse)))
        })),
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve(mockResponse)),
          then: vi.fn((callback: any) => Promise.resolve(callback(mockResponse)))
        })),
        single: vi.fn(() => Promise.resolve(mockResponse)),
        then: vi.fn((callback: any) => Promise.resolve(callback(mockResponse)))
      })),
      insert: vi.fn(() => Promise.resolve(mockResponse)),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve(mockResponse))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve(mockResponse))
      })),
      rpc: vi.fn(() => Promise.resolve(mockResponse))
    }))
  };
}

/**
 * Create mock NextRequest
 */
export function createMockRequest(url: string, options?: Partial<NextRequest>): NextRequest {
  const request = new NextRequest(url, {
    method: 'GET',
    ...options
  });
  return request;
}

/**
 * Assert API response structure
 */
export function expectApiResponse(
  response: Response,
  expectedStatus: number = 200,
  options: { allowError?: boolean } = {}
) {
  const { allowError = false } = options;
  expect(response.status).toBe(expectedStatus);
  return response.json().then((data) => {
    if (expectedStatus >= 200 && expectedStatus < 300 && !allowError) {
      expect(data).not.toHaveProperty('error');
    } else {
      expect(data).toHaveProperty('error');
    }
    return data;
  });
}

/**
 * Assert error response
 */
export function expectErrorResponse(response: Response, expectedStatus: number, errorMessage?: string) {
  expect(response.status).toBe(expectedStatus);
  return response.json().then((data) => {
    expect(data).toHaveProperty('error');
    if (errorMessage) {
      expect(data.error).toContain(errorMessage);
    }
    return data;
  });
}
