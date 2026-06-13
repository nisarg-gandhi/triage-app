import { fetchWithAuth } from '../utils/fetchWithAuth';
import { parseApiError } from '../utils/errorUtils';


/**
 * Service to handle API calls related to tickets
 */
const ticketService = {
  /**
   * Submit a new ticket to the backend
   * @param {Object} ticketData - The ticket data (customer_name, customer_email, subject, message)
   * @returns {Promise<Object>} The created ticket
   */
  async createTicket(ticketData) {
    try {
      const response = await fetchWithAuth('/tickets/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(parseApiError(errorData) || 'Failed to create ticket');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating ticket:', error);
      // fetch throws a TypeError with message "Failed to fetch" if the server is offline or unreachable
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please ensure the backend is running.');
      }
      throw error;
    }
  },

  /**
   * Fetch a single ticket by ID
   * @param {number|string} id - Ticket ID
   * @returns {Promise<Object>} The ticket
   */
  async getTicket(id) {
    try {
      const response = await fetchWithAuth(`/tickets/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ticket');
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ticket ${id}:`, error);
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please ensure the backend is running.');
      }
      throw error;
    }
  },

  /**
   * Update ticket status
   * @param {number|string} id - Ticket ID
   * @param {string} status - New status
   * @returns {Promise<Object>} The updated ticket
   */
  async updateTicketStatus(id, status) {
    try {
      const response = await fetchWithAuth(`/tickets/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update ticket status');
      }
      return await response.json();
    } catch (error) {
      console.error(`Error updating ticket ${id} status:`, error);
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please ensure the backend is running.');
      }
      throw error;
    }
  },

  /**
   * Assign an agent to a ticket (admin only)
   * @param {number|string} ticketId - Ticket ID
   * @param {number} agentId - Agent user ID
   * @param {string} reason - Assignment reason: "ai_suggested" | "manual" | "reassigned"
   * @returns {Promise<Object>} The updated ticket
   */
  async assignAgent(ticketId, agentId, reason) {
    try {
      const response = await fetchWithAuth(`/tickets/${ticketId}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agent_id: agentId, reason }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(parseApiError(errorData) || 'Failed to assign agent');
      }
      return await response.json();
    } catch (error) {
      console.error(`Error assigning agent to ticket ${ticketId}:`, error);
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please ensure the backend is running.');
      }
      throw error;
    }
  },

  /**
   * Fetch all tickets
   * @param {Object} filters - Optional filters { search, status, category, urgency }
   * @returns {Promise<Array>} List of tickets
   */
  async getTickets(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.urgency) queryParams.append('urgency', filters.urgency);
      
      const queryString = queryParams.toString();
      const url = `/tickets/${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetchWithAuth(url);
      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching tickets:', error);
      // fetch throws a TypeError with message "Failed to fetch" if the server is offline or unreachable
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please ensure the backend is running.');
      }
      throw error;
    }
  },

  /**
   * Fetch tickets that need review
   * @returns {Promise<Array>} List of tickets needing review
   */
  async getNeedsReviewTickets() {
    try {
      const response = await fetchWithAuth('/tickets/needs-review');
      if (!response.ok) {
        throw new Error('Failed to fetch tickets needing review');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching needs review tickets:', error);
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please ensure the backend is running.');
      }
      throw error;
    }
  },

  /**
   * Fetch tickets assigned to the currently logged-in agent (My Queue)
   * @returns {Promise<Array>} List of assigned open/in_progress tickets
   */
  async getMyQueue() {
    try {
      const response = await fetchWithAuth('/tickets/my-queue');
      if (!response.ok) {
        throw new Error('Failed to fetch queue');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching my queue:', error);
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please ensure the backend is running.');
      }
      throw error;
    }
  },

  /**
   * Submit a public support ticket — no authentication required.
   * @param {{ name: string, email: string, subject: string, message: string }} payload
   * @returns {Promise<{ ticket_id: number, status: string, message: string }>}
   */
  async submitPublicTicket(payload) {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiBase}/tickets/public`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.status === 429) {
      throw new Error('Too many submissions. Please try again later.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(parseApiError(errorData) || 'Failed to submit ticket. Please try again.');
    }

    return await response.json();
  },
};

export default ticketService;

