// Si no hay sesión → login. Si el rol no corresponde → a su propio panel.
import { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRole }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    // Guardamos de dónde venía para volver ahí después del login
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRole && user.role !== allowedRole) {
    const home = user.role === 'admin' ? '/dashboard' : '/mis-mascotas';
    return <Navigate to={home} replace />;
  }

  // Funciona envolviendo hijos directos o como layout route
  return children ?? <Outlet />;
}