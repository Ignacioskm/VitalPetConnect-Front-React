import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

import Home from './pages/Home';
import Services from './pages/Services';
import Login from './pages/Login';
import Register from './pages/Register';
import MyAccount from './pages/MyAccount';
import DashHome from './pages/dashboard/DashHome';
import Pets from './pages/dashboard/Pets';
import Appointments from './pages/dashboard/Appointments';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            {/* Públicas (con navbar y footer) */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/servicios" element={<Services />} />
            </Route>

            {/* Login y registro sin navbar */}
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />

            {/* Cliente */}
            <Route element={<ProtectedRoute allowedRole="cliente"><PublicLayout /></ProtectedRoute>}>
              <Route path="/mis-mascotas" element={<MyAccount />} />
            </Route>

            {/* Admin */}
            <Route element={<ProtectedRoute allowedRole="admin"><DashboardLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashHome />} />
              <Route path="/dashboard/mascotas" element={<Pets />} />
              <Route path="/dashboard/citas" element={<Appointments />} />
            </Route>
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}