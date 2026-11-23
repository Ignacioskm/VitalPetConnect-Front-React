import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { expect, test, afterEach, beforeEach, vi } from 'vitest';
import { AuthContext, AuthProvider } from '../context/AuthContext';
import { seedUsers } from '../data/mockData';
import { createValidToken, setAuthSession } from './testUtils';
import { TOKEN_KEY, USER_KEY } from '../api/authStorage';
import React from 'react';

// El login real llama a un microservicio que no existe durante los tests.
vi.mock('../api/usersService', () => ({
    usersService: {
        login: vi.fn(),
        register: vi.fn(),
        getAll: vi.fn(),
    },
}));

import { usersService } from '../api/usersService';

beforeEach(() => {
    const cliente = seedUsers[1];
    usersService.login.mockResolvedValue({
        token: createValidToken({ sub: cliente.id }),
        id: cliente.id,
        name: cliente.name,
        email: cliente.email,
        role: cliente.role,
        phone: '',
    });
    usersService.register.mockResolvedValue({ id: 99 });
    usersService.getAll.mockResolvedValue([]);
});

afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.clearAllMocks();
});

// Componente auxiliar para consumir el contexto dentro de las pruebas
const TestConsumer = () => {
    const { user, login, logout, register, updateProfile } = React.useContext(AuthContext);
    const [result, setResult] = React.useState('');
    const run = async (promise) => setResult(JSON.stringify(await promise));

    return (
        <div>
            <span data-testid="user-name">{user ? user.name : 'Sin sesión'}</span>
            <span data-testid="result">{result}</span>
            
            <button 
                onClick={() => login(seedUsers[1].email, seedUsers[1].password)}
                data-testid="btn-login"
            >
                Login
            </button>

            <button onClick={() => run(login('fail@duoc.cl', 'mal'))} data-testid="btn-login-fail">
                Login fallido
            </button>

            <button onClick={() => run(login('role@duoc.cl', '123'))} data-testid="btn-login-role">
                Login rol inválido
            </button>

            <button onClick={() => run(login('expired@duoc.cl', '123'))} data-testid="btn-login-expired">
                Login token vencido
            </button>

            <button onClick={() => run(login('incomplete@duoc.cl', '123'))} data-testid="btn-login-incomplete">
                Login incompleto
            </button>

            <button onClick={logout} data-testid="btn-logout">
                Logout
            </button>

            <button 
                onClick={() => register({ email: 'nuevo@duoc.cl', password: '123', name: 'Nuevo Usuario' })}
                data-testid="btn-register"
            >
                Register
            </button>

            <button onClick={() => run(register({ email: 'mal@duoc.cl', password: '123', name: 'Mal' }))} data-testid="btn-register-fail">
                Register fallido
            </button>

            <button 
                onClick={() => updateProfile('Nombre Actualizado', '+56900000000')}
                data-testid="btn-update"
            >
                Update
            </button>

            <button onClick={() => updateProfile('Sin sesión', '')} data-testid="btn-update-no-session">
                Update sin sesión
            </button>
        </div>
    );
};


test('Logeo por defecto, tiene que ser null', () => {
    render(
        <AuthProvider>
            <TestConsumer />
        </AuthProvider>
    );

    expect(screen.getByTestId('user-name')).toHaveTextContent('Sin sesión');
});

test('Permite iniciar sesión correctamente con credenciales válidas', async () => {
    render(
        <AuthProvider>
            <TestConsumer />
        </AuthProvider>
    );

    // Hacemos click en el botón de login simulado
    fireEvent.click(screen.getByTestId('btn-login'));

    // Esperamos que el nombre del usuario se muestre en pantalla
    await waitFor(() => expect(screen.getByTestId('user-name')).toHaveTextContent(seedUsers[1].name));
});

test('Permite cerrar sesión (logout) correctamente', async () => {
    render(
        <AuthProvider>
            <TestConsumer />
        </AuthProvider>
    );

    // Primero iniciamos sesión
    fireEvent.click(screen.getByTestId('btn-login'));
    await waitFor(() => expect(screen.getByTestId('user-name')).toHaveTextContent(seedUsers[1].name));

    // Luego cerramos sesión
    fireEvent.click(screen.getByTestId('btn-logout'));
    expect(screen.getByTestId('user-name')).toHaveTextContent('Sin sesión');
});

test('Permite registrar un nuevo usuario con éxito', async () => {
    render(
        <AuthProvider>
            <TestConsumer />
        </AuthProvider>
    );

    // Registramos un usuario nuevo
    fireEvent.click(screen.getByTestId('btn-register'));

    // Verificamos que el registro no rompa y mantenga el flujo limpio
    await waitFor(() => expect(usersService.register).toHaveBeenCalledTimes(1));
    expect(screen.getByTestId('user-name')).toHaveTextContent('Sin sesión');
});

test('Permite actualizar el perfil del usuario autenticado', async () => {
    render(
        <AuthProvider>
            <TestConsumer />
        </AuthProvider>
    );

    // Iniciamos sesión primero para tener un usuario activo
    fireEvent.click(screen.getByTestId('btn-login'));
    await waitFor(() => expect(screen.getByTestId('user-name')).toHaveTextContent(seedUsers[1].name));

    // Actualizamos el perfil
    fireEvent.click(screen.getByTestId('btn-update'));

    // Verificamos que el nombre en sesión cambie al instante
    expect(screen.getByTestId('user-name')).toHaveTextContent('Nombre Actualizado');
});

test('Muestra los distintos mensajes de error del login', async () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>);

    usersService.login.mockRejectedValueOnce({ response: { data: { message: 'Credenciales inválidas' } } });
    fireEvent.click(screen.getByTestId('btn-login-fail'));
    await waitFor(() => expect(screen.getByTestId('result')).toHaveTextContent('Credenciales inválidas'));
    expect(screen.getByTestId('user-name')).toHaveTextContent('Sin sesión');

    usersService.login.mockRejectedValueOnce({ response: { data: 'Servidor caído' } });
    fireEvent.click(screen.getByTestId('btn-login-fail'));
    await waitFor(() => expect(screen.getByTestId('result')).toHaveTextContent('Servidor caído'));

    usersService.login.mockRejectedValueOnce(new Error('sin respuesta'));
    fireEvent.click(screen.getByTestId('btn-login-fail'));
    await waitFor(() => expect(screen.getByTestId('result')).toHaveTextContent('Correo o contraseña incorrectos.'));
});

test('Rechaza respuestas de login incompletas, con token vencido o con rol desconocido', async () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>);

    usersService.login.mockResolvedValueOnce({ token: createValidToken() });
    fireEvent.click(screen.getByTestId('btn-login-incomplete'));
    await waitFor(() => expect(screen.getByTestId('result')).toHaveTextContent('Respuesta de autenticacion incompleta.'));

    usersService.login.mockResolvedValueOnce({
        token: 'token.vencido.falso', id: 2, name: 'Ignacio', email: 'ig@duoc.cl', role: 'cliente',
    });
    fireEvent.click(screen.getByTestId('btn-login-expired'));
    await waitFor(() => expect(screen.getByTestId('result')).toHaveTextContent('token invalido o vencido'));

    usersService.login.mockResolvedValueOnce({
        token: createValidToken(), id: 2, name: 'Ignacio', email: 'ig@duoc.cl', role: 'otro',
    });
    fireEvent.click(screen.getByTestId('btn-login-role'));
    await waitFor(() => expect(screen.getByTestId('result')).toHaveTextContent('Respuesta de autenticacion incompleta.'));
    expect(screen.getByTestId('user-name')).toHaveTextContent('Sin sesión');
});

test('Maneja el error al registrar y el update de perfil sin sesión', async () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>);

    usersService.register.mockRejectedValueOnce({ response: { data: { message: 'El correo ya existe' } } });
    fireEvent.click(screen.getByTestId('btn-register-fail'));
    await waitFor(() => expect(screen.getByTestId('result')).toHaveTextContent('El correo ya existe'));

    fireEvent.click(screen.getByTestId('btn-update-no-session'));
    expect(screen.getByTestId('user-name')).toHaveTextContent('Sin sesión');
});

test('Restaura la sesión guardada y la limpia si el usuario no es válido', () => {
    setAuthSession(seedUsers[0]);
    const { unmount } = render(<AuthProvider><TestConsumer /></AuthProvider>);
    expect(screen.getByTestId('user-name')).toHaveTextContent('Admin');
    unmount();

    localStorage.setItem(TOKEN_KEY, createValidToken());
    localStorage.setItem(USER_KEY, JSON.stringify({ id: 9, role: 'invalido' }));
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    expect(screen.getByTestId('user-name')).toHaveTextContent('Sin sesión');
    expect(localStorage.getItem(USER_KEY)).toBeNull();
});

test('Reacciona a los eventos de sesión expirada y de otra pestaña', async () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>);

    fireEvent.click(screen.getByTestId('btn-login'));
    await waitFor(() => expect(screen.getByTestId('user-name')).toHaveTextContent(seedUsers[1].name));

    fireEvent(window, new Event('vp:unauthorized'));
    expect(screen.getByTestId('user-name')).toHaveTextContent('Sin sesión');

    const otro = { ...seedUsers[0], name: 'Admin desde otra pestaña' };
    localStorage.setItem(TOKEN_KEY, createValidToken());
    localStorage.setItem(USER_KEY, JSON.stringify(otro));
    fireEvent(window, new StorageEvent('storage', { key: USER_KEY }));
    await waitFor(() => expect(screen.getByTestId('user-name')).toHaveTextContent('Admin desde otra pestaña'));
});
