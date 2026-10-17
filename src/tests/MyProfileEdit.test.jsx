import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, afterEach, vi } from 'vitest';
import MyProfileEdit from '../components/MyProfileEdit';
import { AuthContext } from '../context/AuthContext';
import { seedUsers } from '../data/mockData';

afterEach(() => {
    cleanup();
});

test('No renderiza nada si el usuario no está autenticado', () => {
    const authMock = { user: null, updateProfile: () => {} };

    const { container } = render(
        <AuthContext.Provider value={authMock}>
            <MyProfileEdit />
        </AuthContext.Provider>
    );

    expect(container.firstChild).toBeNull();
});

test('Abre el modal al hacer clic en el botón de configuración y muestra los datos actuales', async () => {
    const usuarioPrueba = seedUsers[1]; 
    const authMock = { user: usuarioPrueba, updateProfile: () => {} };

    render(
        <AuthContext.Provider value={authMock}>
            <MyProfileEdit />
        </AuthContext.Provider>
    );

    // Hacemos clic en el botón pa editar el perfil
    const botonEditar = screen.getByTitle('Editar Perfil');
    await userEvent.click(botonEditar);

    // Verificamos que el modal se abrió y los campos tienen los valores del usuario
    expect(screen.getByText('Editar Perfil')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre de perfil/i)).toHaveValue(usuarioPrueba.name);
    expect(screen.getByLabelText(/Número de Teléfono/i)).toHaveValue(usuarioPrueba.phone || '');
});

test('Permite modificar los campos, enviar el formulario y muestra el mensaje de éxito', async () => {
    const usuarioPrueba = seedUsers[1];
    const updateProfileMock = vi.fn();
    const authMock = { user: usuarioPrueba, updateProfile: updateProfileMock };

    render(
        <AuthContext.Provider value={authMock}>
            <MyProfileEdit />
        </AuthContext.Provider>
    );

    // Abrir el modal
    await userEvent.click(screen.getByTitle('Editar Perfil'));

    // Modificar nombre y teléfono
    const inputNombre = screen.getByLabelText(/Nombre de perfil/i);
    const inputTelefono = screen.getByLabelText(/Número de Teléfono/i);

    await userEvent.clear(inputNombre);
    await userEvent.type(inputNombre, 'Ignacio Actualizado');

    await userEvent.clear(inputTelefono);
    await userEvent.type(inputTelefono, '+56987654321');

    // Hacer clic en guardar cambios
    await userEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

    // Validar que la función updateProfile se ejecutó con los datos nuevos
    expect(updateProfileMock).toHaveBeenCalledWith('Ignacio Actualizado', '+56987654321');

    // Validar que aparece el aviso de éxito
    expect(screen.getByText('¡Perfil actualizado con éxito!')).toBeInTheDocument();
});