const API_BASE_URL = 'http://localhost:8000';

export const analyticsService = {
  getOverview: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/overview`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics overview');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics overview:', error);
      throw error;
    }
  },

  getCharts: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/charts`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics charts');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics charts:', error);
      throw error;
    }
  },
};
