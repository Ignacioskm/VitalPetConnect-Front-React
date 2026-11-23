import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { expect, test, afterEach, beforeEach } from 'vitest';
import ProtectedRoute from '../components/ProtectedRoute';
import { AuthContext } from '../context/AuthContext';
import { seedUsers } from '../data/mockData';
import { createValidToken } from './testUtils';
import { TOKEN_KEY } from '../api/authStorage';

beforeEach(() => {
    // ProtectedRoute también exige un JWT vigente en localStorage.
    localStorage.setItem(TOKEN_KEY, createValidToken());
});

afterEach(() => {
    cleanup();
    localStorage.clear();
});

test('Redirige a /login si el usuario no está autenticado', () => {
    const authMock = { user: null };

    render(
        <MemoryRouter initialEntries={['/admin-panel']}>
            <AuthContext.Provider value={authMock}>
                <Routes>
                    <Route path="/login" element={<div>Página de Login</div>} />
                    <Route element={<ProtectedRoute allowedRole="admin" />}>
                        <Route path="/admin-panel" element={<div>Panel Secreto</div>} />
                    </Route>
                </Routes>
            </AuthContext.Provider>
        </MemoryRouter>
    );

    // Debe redirigir al login y no mostrar el panel secreto
    expect(screen.getByText('Página de Login')).toBeInTheDocument();
    expect(screen.queryByText('Panel Secreto')).not.toBeInTheDocument();
});

test('Redirige al usuario a su propio panel si su rol no coincide con el permitido', () => {
    const clienteUser = seedUsers[1]; // Usuario con rol cliente
    const authMock = { user: clienteUser };

    render(
        <MemoryRouter initialEntries={['/admin-panel']}>
            <AuthContext.Provider value={authMock}>
                <Routes>
                    <Route path="/mis-mascotas" element={<div>Mi Panel de Cliente</div>} />
                    <Route element={<ProtectedRoute allowedRole="admin" />}>
                        <Route path="/admin-panel" element={<div>Panel de Admin</div>} />
                    </Route>
                </Routes>
            </AuthContext.Provider>
        </MemoryRouter>
    );

    // Como intenta entrar a admin lo tira a mis mascotas
    expect(screen.getByText('Mi Panel de Cliente')).toBeInTheDocument();
    expect(screen.queryByText('Panel de Admin')).not.toBeInTheDocument();
});

test('Permite el acceso y renderiza los componentes hijos si el usuario tiene el rol correcto', () => {
    const adminUser = seedUsers[0]; //Usuario con rol de administrador
    const authMock = { user: adminUser };

    render(
        <MemoryRouter initialEntries={['/admin-panel']}>
            <AuthContext.Provider value={authMock}>
                <Routes>
                    <Route element={<ProtectedRoute allowedRole="admin" />}>
                        <Route path="/admin-panel" element={<div>Panel de Admin Exitoso</div>} />
                    </Route>
                </Routes>
            </AuthContext.Provider>
        </MemoryRouter>
    );

    // Al ser admin entra bien a panel admin
    expect(screen.getByText('Panel de Admin Exitoso')).toBeInTheDocument();
});

test('Envía al administrador a /dashboard si intenta entrar a una ruta de cliente', () => {
    render(
        <MemoryRouter initialEntries={['/mis-mascotas']}>
            <AuthContext.Provider value={{ user: seedUsers[0] }}>
                <Routes>
                    <Route path="/dashboard" element={<div>Panel de Admin</div>} />
                    <Route element={<ProtectedRoute allowedRole="cliente" />}>
                        <Route path="/mis-mascotas" element={<div>Mi Panel</div>} />
                    </Route>
                </Routes>
            </AuthContext.Provider>
        </MemoryRouter>
    );

    expect(screen.getByText('Panel de Admin')).toBeInTheDocument();
    expect(screen.queryByText('Mi Panel')).not.toBeInTheDocument();
});

test('Redirige al login si falta el token aunque haya usuario en contexto', () => {
    localStorage.removeItem(TOKEN_KEY);
    render(
        <MemoryRouter initialEntries={['/admin-panel']}>
            <AuthContext.Provider value={{ user: seedUsers[0] }}>
                <Routes>
                    <Route path="/login" element={<div>Página de Login</div>} />
                    <Route element={<ProtectedRoute allowedRole="admin" />}>
                        <Route path="/admin-panel" element={<div>Panel Secreto</div>} />
                    </Route>
                </Routes>
            </AuthContext.Provider>
        </MemoryRouter>
    );

    expect(screen.getByText('Página de Login')).toBeInTheDocument();
});