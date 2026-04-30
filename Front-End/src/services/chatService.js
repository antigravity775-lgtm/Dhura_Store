import { getApiBaseUrl } from '../utils/apiBaseUrl';

const BASE_URL = getApiBaseUrl();
let csrfTokenCache = null;

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

async function ensureCsrfCookie() {
  if (getCookie('XSRF-TOKEN') || csrfTokenCache) return;
  const res = await fetch(`${BASE_URL}/products?pageNumber=1&pageSize=1`, { credentials: 'include' });
  const headerToken = res.headers.get('x-xsrf-token');
  if (headerToken) csrfTokenCache = headerToken;
}

export const chatService = {
  sendMessage: async (messages) => {
    try {
      await ensureCsrfCookie();
      const csrfToken = getCookie('XSRF-TOKEN') || csrfTokenCache;
      const response = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'x-xsrf-token': csrfToken } : {})
        },
        credentials: 'include',
        body: JSON.stringify({ messages })
      });
      const refreshedToken = response.headers.get('x-xsrf-token');
      if (refreshedToken) csrfTokenCache = refreshedToken;
      
      if (!response.ok) {
        throw new Error('Network Error');
      }

      return await response.json();
    } catch (error) {
      console.error('Chat Service Error:', error);
      throw error;
    }
  }
};
