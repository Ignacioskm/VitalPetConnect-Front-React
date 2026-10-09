import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Login />} /> {/* Asumiendo Home o Login de inicio */}
          <Route path="/login" element={<Login />} />
          
          {/* Rutas Protegidas Cliente */}
          <Route 
            path="/mis-mascotas" 
            element={
              <ProtectedRoute allowedRole="cliente">
                <div className="container mt-5"><h1>Panel de Cliente: Mis Mascotas</h1></div>
              </ProtectedRoute>
            } 
          />

          {/* Rutas Protegidas Admin */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRole="admin">
                <div className="container mt-5"><h1>Panel de Administración</h1></div>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;