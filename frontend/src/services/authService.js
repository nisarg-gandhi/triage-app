import { fetchWithAuth } from '../utils/fetchWithAuth';
import { parseApiError } from '../utils/errorUtils';

export const authService = {
  login: async (email, password) => {
    const response = await fetchWithAuth('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(parseApiError(errorData) || 'Login failed');
    }

    return await response.json();
  },

  register: async (name, email, password) => {
    const response = await fetchWithAuth('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(parseApiError(errorData) || 'Registration failed');
    }

    return await response.json();
  },

  getMe: async (token) => {
    const response = await fetchWithAuth('/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    return await response.json();
  }
};
