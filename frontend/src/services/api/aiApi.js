import apiClient from './apiClient';

/**
 * Fetch generic financial insights
 * @returns {Promise<Object>} The insights response
 */
export const getAIInsights = async () => {
    const response = await apiClient.get('/ai/insights');
    return response.data;
};

/**
 * Fetch highly structured financial recommendations
 * @returns {Promise<Object>} The recommendations response
 */
export const getAIRecommendations = async () => {
    const response = await apiClient.get('/ai/recommendations');
    return response.data;
};

/**
 * Send a chat message with history to the AI conversational assistant
 * @param {Array<{role: string, content: string}>} messages - The conversation history
 * @returns {Promise<Object>} The assistant's response
 */
export const sendAIChat = async (messages) => {
    const response = await apiClient.post('/ai/chat', { messages });
    return response.data;
};
