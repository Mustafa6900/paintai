import { REPLICATE_API_TOKEN } from '@/config/env';

const API_BASE_URL = 'https://api.replicate.com/v1';

interface ApiRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    'Authorization': `Token ${REPLICATE_API_TOKEN}`,
    'Content-Type': 'application/json',
    ...options.headers
  };

  try {
    const response = await fetch(url, {
      method: options.method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `API isteği başarısız: ${response.status} - ${errorData.error || response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`API hatası (${endpoint}):`, error);
    throw error;
  }
} 