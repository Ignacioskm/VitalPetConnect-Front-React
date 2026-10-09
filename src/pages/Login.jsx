import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { isValidEmail } from '../utils/validaciones';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError('Dominio de correo no permitido.');
      return;
    }

    // Intentar login con el AuthContext
    const result = login(email, password);

    if (result.success) {
      // Redirigir según el rol
      if (result.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/mis-mascotas');
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-sm mx-auto border-0" style={{ maxWidth: '400px', borderRadius: '16px' }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <h4 className="fw-bold text-primary">VitalPet Connect</h4>
            <p className="text-muted small">Iniciar Sesión</p>
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleSubmit} data-testid="login-form">
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Correo Electrónico</label>
              <input 
                type="email" 
                className="form-control" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="ejemplo@duoc.cl"
                required 
                data-testid="email-input"
              />
            </div>
            <div className="mb-4">
              <label className="form-label small fw-semibold text-secondary">Contraseña</label>
              <input 
                type="password" 
                className="form-control" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 fw-bold">
              Ingresar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}