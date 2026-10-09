// Ruta protegida, si el usuario no está logueado lo redirige al login.

import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRole }) {
  const { user } = useContext(AuthContext);

  // Si no hay usuario logueado, arafue (al login)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si requiere un rol específico (ej: admin) y el usuario no lo tiene, lo mandamos a su inicio
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}