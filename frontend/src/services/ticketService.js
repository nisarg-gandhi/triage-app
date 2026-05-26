import { fetchWithAuth } from '../utils/fetchWithAuth';
const API_BASE_URL = 'http://localhost:8000';

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
      const response = await fetchWithAuth(`${API_BASE_URL}/tickets/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to create ticket');
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
      const response = await fetchWithAuth(`${API_BASE_URL}/tickets/${id}`);
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
      const response = await fetchWithAuth(`${API_BASE_URL}/tickets/${id}/status`, {
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
      const url = `${API_BASE_URL}/tickets/${queryString ? `?${queryString}` : ''}`;
      
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
      const response = await fetchWithAuth(`${API_BASE_URL}/tickets/needs-review`);
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
  }
};

export default ticketService;
