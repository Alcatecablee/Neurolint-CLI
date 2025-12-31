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

import { useEffect } from 'react';
import { submitToIndexNow, submitUrlToIndexNow, getIndexNowConfig } from '@/utils/indexnow';

/**
 * Hook to automatically notify IndexNow when the page changes
 * Usage: useIndexNow() in your main app component
 */
export function useIndexNow() {
  useEffect(() => {
    const config = getIndexNowConfig();

    if (!config.isConfigured) {
      return;
    }

    const currentUrl = window.location.href;

    const notifyIndexNow = async () => {
      const result = await submitUrlToIndexNow(
        currentUrl,
        config.host,
        config.apiKey,
        config.keyLocation
      );

      if (result.success) {
        console.debug(`[IndexNow] URL notified: ${currentUrl}`);
      } else {
        console.debug(`[IndexNow] Notification failed: ${result.message}`);
      }
    };

    notifyIndexNow();
  }, []);
}

/**
 * Hook for manual URL submission
 * Returns a function to submit URLs to IndexNow
 */
export function useIndexNowSubmit() {
  const submit = async (urls: string | string[]) => {
    const config = getIndexNowConfig();

    if (!config.isConfigured) {
      console.warn('IndexNow not configured');
      return { success: false, status: 0, message: 'IndexNow not configured' };
    }

    const urlList = Array.isArray(urls) ? urls : [urls];

    if (urlList.length === 0) {
      return { success: false, status: 400, message: 'No URLs provided' };
    }

    if (urlList.length === 1) {
      return submitUrlToIndexNow(
        urlList[0],
        config.host,
        config.apiKey,
        config.keyLocation
      );
    }

    return submitToIndexNow(
      urlList,
      config.host,
      config.apiKey,
      config.keyLocation
    );
  };

  const config = getIndexNowConfig();
  return { submit, isConfigured: config.isConfigured };
}
