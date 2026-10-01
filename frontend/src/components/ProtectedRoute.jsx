import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Sends visitors without a session to the login page.
export default function ProtectedRoute() {
  const { token, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!token || !user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}
