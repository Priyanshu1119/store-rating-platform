import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { homePathFor } from '../utils/roles';

// Sends users to their own dashboard when they open a page meant for another role.
// The backend enforces the same rules, this only keeps the UI tidy.
export default function RoleRoute({ allowedRoles }) {
  const user = useSelector((state) => state.auth.user);

  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to={homePathFor(user.role)} replace />;
  return <Outlet />;
}
