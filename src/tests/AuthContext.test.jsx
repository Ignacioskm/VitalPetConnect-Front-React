import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { expect, test, afterEach, beforeEach } from 'vitest';
import { AuthContext, AuthProvider } from '../context/AuthContext';
import { seedUsers } from '../data/mockData';
import React from 'react';


afterEach(() => {
    cleanup();
    localStorage.clear();
});

// Componente auxiliar para consumir el contexto dentro de las pruebas
const TestConsumer = () => {
    const { user, login, logout, register, updateProfile } = React.useContext(AuthContext);

    return (
        <div>
            <span data-testid="user-name">{user ? user.name : 'Sin sesión'}</span>
            
            <button 
                onClick={() => login(seedUsers[1].email, seedUsers[1].password)}
                data-testid="btn-login"
            >
                Login
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

            <button 
                onClick={() => updateProfile('Nombre Actualizado', '+56900000000')}
                data-testid="btn-update"
            >
                Update
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

test('Permite iniciar sesión correctamente con credenciales válidas', () => {
    render(
        <AuthProvider>
            <TestConsumer />
        </AuthProvider>
    );

    // Hacemos click en el botón de login simulado
    fireEvent.click(screen.getByTestId('btn-login'));

    // Esperamos que el nombre del usuario se muestre en pantalla
    expect(screen.getByTestId('user-name')).toHaveTextContent(seedUsers[1].name);
});

test('Permite cerrar sesión (logout) correctamente', () => {
    render(
        <AuthProvider>
            <TestConsumer />
        </AuthProvider>
    );

    // Primero iniciamos sesión
    fireEvent.click(screen.getByTestId('btn-login'));
    expect(screen.getByTestId('user-name')).toHaveTextContent(seedUsers[1].name);

    // Luego cerramos sesión
    fireEvent.click(screen.getByTestId('btn-logout'));
    expect(screen.getByTestId('user-name')).toHaveTextContent('Sin sesión');
});

test('Permite registrar un nuevo usuario con éxito', () => {
    render(
        <AuthProvider>
            <TestConsumer />
        </AuthProvider>
    );

    // Registramos un usuario nuevo
    fireEvent.click(screen.getByTestId('btn-register'));

    // Verificamos que el registro no rompa y mantenga el flujo limpio
    expect(screen.getByTestId('user-name')).toHaveTextContent('Sin sesión');
});

test('Permite actualizar el perfil del usuario autenticado', () => {
    render(
        <AuthProvider>
            <TestConsumer />
        </AuthProvider>
    );

    // Iniciamos sesión primero para tener un usuario activo
    fireEvent.click(screen.getByTestId('btn-login'));
    expect(screen.getByTestId('user-name')).toHaveTextContent(seedUsers[1].name);

    // Actualizamos el perfil
    fireEvent.click(screen.getByTestId('btn-update'));

    // Verificamos que el nombre en sesión cambie al instante
    expect(screen.getByTestId('user-name')).toHaveTextContent('Nombre Actualizado');
});