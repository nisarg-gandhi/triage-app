import { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { resetSessionExpired } from '../utils/fetchWithAuth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Keep a stable ref to navigate so the event listener never goes stale.
  const navigateRef = useRef(navigate);
  useEffect(() => { navigateRef.current = navigate; }, [navigate]);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authService.getMe(token);
          setUser(userData);
        } catch (error) {
          console.error("Auth init failed:", error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Handle 401 responses emitted by fetchWithAuth.
  // Note: do NOT reset the sessionExpired flag here — dispatchEvent() is synchronous,
  // so resetting inside this handler would clear the flag before other concurrent 401
  // promise resolutions have a chance to check it, causing duplicate toasts.
  const handleSessionExpired = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);

    // Show toast notification.
    window.dispatchEvent(
      new CustomEvent('toast:show', {
        detail: { message: 'Session expired — please sign in again', type: 'error' },
      })
    );

    navigateRef.current('/login', { replace: true });
  }, []);

  useEffect(() => {
    window.addEventListener('session:expired', handleSessionExpired);
    return () => window.removeEventListener('session:expired', handleSessionExpired);
  }, [handleSessionExpired]);

  // Returns the userData so callers can redirect based on role.
  const login = async (email, password) => {
    const { access_token } = await authService.login(email, password);
    localStorage.setItem('token', access_token);
    const userData = await authService.getMe(access_token);
    setUser(userData);
    resetSessionExpired(); // Safe to accept 401 events again after a successful login.
    return userData;
  };

  const register = async (name, email, password) => {
    await authService.register(name, email, password);
    return await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

