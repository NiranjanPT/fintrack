import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Loading from './Loading';

// Login/Register pages: redirect to the dashboard if the user is already logged in
export default function GuestRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Loading fullScreen message="Loading..." />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}
