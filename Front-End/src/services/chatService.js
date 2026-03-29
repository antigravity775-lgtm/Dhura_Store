import api from './api';

export const chatService = {
  sendMessage: async (messages) => {
    try {
      // Assuming api.js abstracts axios or fetch and prepends the base URL
      const response = await api.post('/chat', { messages });
      return response.data;
    } catch (error) {
      console.error('Chat Service Error:', error);
      throw error;
    }
  }
};
