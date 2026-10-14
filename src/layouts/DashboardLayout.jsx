import { useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function DashboardLayout() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="d-flex min-vh-100 bg-light">
      <aside className="vp-sidebar d-flex flex-column justify-content-between">
        <div>
          <span className="vp-logo text-decoration-none mb-4 d-block text-center">
            <i className="bi bi-heart-pulse-fill me-2"></i>VitalPet Admin
          </span>

          <div className="px-2 mb-3">
            <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '11px' }}>Menú Principal</small>
          </div>

          <nav className="nav flex-column gap-1">
            <NavLink to="/dashboard" end className="vp-link">
              <i className="bi bi-speedometer2 me-2"></i> Resumen
            </NavLink>
            <NavLink to="/dashboard/mascotas" className="vp-link">
              <i className="bi bi-heart-pulse me-2"></i> Mascotas
            </NavLink>
            <NavLink to="/dashboard/citas" className="vp-link">
              <i className="bi bi-calendar-check me-2"></i> Citas
            </NavLink>
          </nav>
        </div>

        <div className="px-2 pt-3 border-top">
          <div className="mb-2 px-2">
            <small className="text-muted text-truncate d-block">Admin: <strong>{user?.name}</strong></small>
          </div>
          <button 
            onClick={handleLogout} 
            className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 btn-sm py-2"
          >
            <i className="bi bi-box-arrow-right"></i> Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="vp-contenido flex-grow-1">
        <Outlet />
      </main>
    </div>
  );
}