const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const chatService = {
  sendMessage: async (messages) => {
    try {
      const response = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
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
