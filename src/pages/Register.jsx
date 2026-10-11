import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { isValidEmail, isValidPhone, passwordsMatch } from '../utils/validaciones';

export default function Register() {
  
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  // Función para actualizar los estados cuando el usuario escribe
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Validamos las weaitas
    if (!isValidEmail(formData.email)) {
      setError('Dominio de correo no permitido.');
      return;
    }
    if (!isValidPhone(formData.phone)) {
      setError('El teléfono debe tener 11 dígitos numéricos.');
      return;
    }
    if (!passwordsMatch(formData.password, formData.confirmPassword)) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    // Hacemos el "Registro"
    const result = register({
      name: formData.name,
      lastName: formData.lastName,
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone,
      password: formData.password
    });

    if (result.success) {
      setSuccessMsg('¡Registro exitoso! Redirigiendo al login...');
      // Aca hacemos como un suspend fun de kotlin para mandar al login desps de 2 segundos
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(result.message);
    }
  };


  return (
    <div className="container mt-5 mb-5">
      <div className="card shadow-sm mx-auto border-0" style={{ maxWidth: '500px', borderRadius: '16px' }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <h4 className="fw-bold text-primary">Crear Cuenta</h4>
            <p className="text-muted small">Únete a VitalPet Connect</p>
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}
          {successMsg && <div className="alert alert-success py-2">{successMsg}</div>}

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-semibold text-secondary">Nombre</label>
                <input type="text" id="name" className="form-control" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-semibold text-secondary">Apellido</label>
                <input type="text" id="lastName" className="form-control" value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Correo Electrónico</label>
              <input type="email" id="email" className="form-control" placeholder="ejemplo@duoc.cl" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Teléfono</label>
              <input type="tel" id="phone" className="form-control" placeholder="+56 9 1234 5678" value={formData.phone} onChange={handleChange} required />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Contraseña</label>
              <input type="password" id="password" className="form-control" value={formData.password} onChange={handleChange} required />
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold text-secondary">Confirmar Contraseña</label>
              <input type="password" id="confirmPassword" className="form-control" value={formData.confirmPassword} onChange={handleChange} required />
            </div>

            <button type="submit" className="btn btn-primary w-100 fw-bold mb-3">
              Registrarse
            </button>
            
            <div className="text-center">
              <span className="small text-muted">¿Ya tienes cuenta? </span>
              <Link to="/login" className="small text-decoration-none fw-bold">Inicia sesión</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}