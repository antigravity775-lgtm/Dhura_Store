import { getApiBaseUrl } from '../utils/apiBaseUrl';

const BASE_URL = getApiBaseUrl();

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

async function ensureCsrfCookie() {
  if (getCookie('XSRF-TOKEN')) return;
  await fetch(`${BASE_URL}/products?pageNumber=1&pageSize=1`, { credentials: 'include' });
}

export const chatService = {
  sendMessage: async (messages) => {
    try {
      await ensureCsrfCookie();
      const csrfToken = getCookie('XSRF-TOKEN');
      const response = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'x-xsrf-token': csrfToken } : {})
        },
        credentials: 'include',
        body: JSON.stringify({ messages })
      });
      
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
