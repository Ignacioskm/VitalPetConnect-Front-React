import { useContext, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import BookButton from './BookButton';

const linkClass = ({ isActive }) =>
  `nav-link ${isActive ? 'active fw-bold text-primary' : 'text-secondary'}`;

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const close = () => setExpanded(false);

  const handleLogout = () => {
    logout();
    close();
    navigate('/');
  };

  const panelPath = user?.role === 'admin' ? '/dashboard' : '/mis-mascotas';

  return (
    <nav className="navbar navbar-expand-lg bg-white shadow-sm py-3">
      <div className="container">
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2 text-primary fw-bold" onClick={close}>
          <i className="bi bi-heart-pulse-fill fs-4"></i>
          VitalPet Connect
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          aria-controls="navbarContent"
          aria-expanded={expanded}
          aria-label="Abrir menú"
          onClick={() => setExpanded((v) => !v)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse${expanded ? ' show' : ''}`} id="navbarContent">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-lg-4">
            <li className="nav-item">
              <NavLink to="/" end className={linkClass} onClick={close}>Inicio</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/servicios" className={linkClass} onClick={close}>Servicios</NavLink>
            </li>
            {!user && (
              <li className="nav-item">
                <NavLink to="/login" className={linkClass} onClick={close}>Iniciar sesión</NavLink>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2">
            <BookButton className="btn btn-primary px-4 fw-medium">Agendar cita</BookButton>

            {user ? (
              <>
                <Link to={panelPath} className="btn btn-outline-primary px-3" onClick={close} title={user.name}>
                  <i className="bi bi-person-fill me-1"></i>
                  {user.name}
                </Link>
                <button type="button" className="btn btn-outline-secondary" onClick={handleLogout} title="Cerrar sesión">
                  <i className="bi bi-box-arrow-right"></i>
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary px-3" onClick={close} aria-label="Iniciar sesión">
                <i className="bi bi-person-fill"></i>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}