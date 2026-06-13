import { fetchWithAuth } from '../utils/fetchWithAuth';
import { parseApiError } from '../utils/errorUtils';

/**
 * Service for agent-related API calls.
 */
const agentService = {
  /**
   * Fetch all agents with their category specializations and open ticket count.
   * Used by the admin ticket detail page to populate the assignment dropdown.
   * @returns {Promise<Array>} List of agents: { id, name, email, categories, open_ticket_count }
   */
  async getAgents() {
    try {
      const response = await fetchWithAuth('/agents/');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(parseApiError(errorData) || 'Failed to fetch agents');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching agents:', error);
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please ensure the backend is running.');
      }
      throw error;
    }
  },
};

export default agentService;
