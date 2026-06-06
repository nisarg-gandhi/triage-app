import { fetchWithAuth } from '../utils/fetchWithAuth';

/**
 * Service for AI classification feedback endpoints.
 */
const feedbackService = {
  /**
   * Submit feedback for a ticket's AI classification (agent only).
   * @param {number} ticketId
   * @param {{ is_correct: boolean, correct_category?: string, correct_urgency?: string, feedback_note?: string }} payload
   * @returns {Promise<Object>} The created feedback record
   */
  async submitFeedback(ticketId, payload) {
    try {
      const response = await fetchWithAuth('/feedback/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: ticketId, ...payload }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to submit feedback');
      }
      return await response.json();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  },

  /**
   * Fetch AI accuracy metrics (admin only).
   * @returns {Promise<Object>} AccuracyMetrics
   */
  async getAccuracyMetrics() {
    try {
      const response = await fetchWithAuth('/feedback/metrics');
      if (!response.ok) {
        throw new Error('Failed to fetch accuracy metrics');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching accuracy metrics:', error);
      throw error;
    }
  },

  /**
   * Check whether the current agent has already submitted feedback for a ticket.
   * Returns the existing feedback object, or null.
   * @param {number} ticketId
   * @returns {Promise<Object|null>}
   */
  async getTicketFeedback(ticketId) {
    try {
      const response = await fetchWithAuth(`/feedback/ticket/${ticketId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ticket feedback');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching ticket feedback:', error);
      throw error;
    }
  },
};

export default feedbackService;
