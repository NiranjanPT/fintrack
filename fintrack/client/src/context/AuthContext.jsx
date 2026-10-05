// Experiment 8 - Context API: authentication state shared by the whole app
// Experiment 7 - useReducer manages the auth state transitions
import { createContext, useCallback, useEffect, useMemo, useReducer } from 'react';
import authService from '../services/authService';
import { TOKEN_KEY } from '../services/api';

export const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: localStorage.getItem(TOKEN_KEY),
  isAuthenticated: false,
  loading: true, // true while we check a saved token on page load
};

export function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_SUCCESS':
      return {
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      return { user: null, token: null, isAuthenticated: false, loading: false };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    dispatch({ type: 'LOGOUT' });
  }, []);

  // On first load: if a token is saved, ask the backend who the user is (GET /api/auth/me)
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      dispatch({ type: 'LOGOUT' });
      return;
    }
    authService
      .getMe()
      .then((user) => dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } }))
      .catch(() => logout());
  }, [logout]);

  // The Axios interceptor fires this event when the API returns 401
  useEffect(() => {
    const handleForcedLogout = () => dispatch({ type: 'LOGOUT' });
    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, []);

  const saveSession = useCallback(({ user, token }) => {
    localStorage.setItem(TOKEN_KEY, token);
    dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
  }, []);

  const login = useCallback(
    async (email, password) => {
      const data = await authService.login({ email, password });
      saveSession(data);
      return data.user;
    },
    [saveSession]
  );

  const register = useCallback(
    async (name, email, password) => {
      const data = await authService.register({ name, email, password });
      saveSession(data);
      return data.user;
    },
    [saveSession]
  );

  const value = useMemo(
    () => ({ ...state, login, register, logout }),
    [state, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
