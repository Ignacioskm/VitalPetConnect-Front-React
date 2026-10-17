import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { expect, test, afterEach } from 'vitest';
import ProtectedRoute from '../components/ProtectedRoute';
import { AuthContext } from '../context/AuthContext';
import { seedUsers } from '../data/mockData';

afterEach(() => {
    cleanup();
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