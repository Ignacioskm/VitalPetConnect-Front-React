import { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getValidToken } from '../api/authStorage';

export default function ProtectedRoute({ children, allowedRole }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user || !getValidToken()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'admin' ? '/dashboard' : '/mis-mascotas'} replace />;
  }
  return children ?? <Outlet />;
}
