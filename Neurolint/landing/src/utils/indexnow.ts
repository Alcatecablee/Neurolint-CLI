/**
 * Copyright (c) 2025 NeuroLint
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Bing IndexNow API integration
 * Notifies search engines of URL changes in real-time
 * https://www.indexnow.org/
 */

interface IndexNowRequest {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

interface IndexNowResponse {
  success: boolean;
  status: number;
  message?: string;
}

/**
 * Submit URLs to Bing IndexNow API
 * @param urls - Array of URLs to submit
 * @param host - Your domain (e.g., example.com)
 * @param apiKey - Your IndexNow API key
 * @param keyLocation - URL to your IndexNow key file
 */
export async function submitToIndexNow(
  urls: string[],
  host: string,
  apiKey: string,
  keyLocation: string
): Promise<IndexNowResponse> {
  if (!apiKey || !host) {
    console.warn('IndexNow: API key or host not configured');
    return { success: false, status: 400, message: 'Missing configuration' };
  }

  if (urls.length === 0) {
    return { success: false, status: 400, message: 'No URLs provided' };
  }

  const request: IndexNowRequest = {
    host,
    key: apiKey,
    keyLocation,
    urlList: urls.slice(0, 10000), // API limit is 10,000 URLs per request
  };

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(request),
    });

    const status = response.status;
    let message = '';

    switch (status) {
      case 200:
        message = 'URLs submitted successfully';
        break;
      case 400:
        message = 'Invalid format';
        break;
      case 403:
        message = 'Invalid API key or key file not found';
        break;
      case 422:
        message = 'URLs do not belong to the host or key mismatch';
        break;
      case 429:
        message = 'Too many requests (rate limited)';
        break;
      default:
        message = `HTTP ${status}`;
    }

    return {
      success: status === 200,
      status,
      message,
    };
  } catch (error) {
    console.error('IndexNow submission failed:', error);
    return {
      success: false,
      status: 0,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Submit a single URL to IndexNow
 */
export async function submitUrlToIndexNow(
  url: string,
  host: string,
  apiKey: string,
  keyLocation: string
): Promise<IndexNowResponse> {
  return submitToIndexNow([url], host, apiKey, keyLocation);
}

/**
 * Get IndexNow configuration from environment
 */
export function getIndexNowConfig() {
  const apiKey = import.meta.env['VITE_INDEXNOW_KEY'];
  const host = import.meta.env['VITE_INDEXNOW_HOST'];
  const keyLocation = import.meta.env['VITE_INDEXNOW_KEY_LOCATION'];

  return {
    apiKey: apiKey || '',
    host: host || '',
    keyLocation: keyLocation || '',
    isConfigured: !!(apiKey && host && keyLocation),
  };
}
