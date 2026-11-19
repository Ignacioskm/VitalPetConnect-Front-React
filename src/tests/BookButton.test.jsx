import { render , screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { expect, test, afterEach, vi } from 'vitest';
import BookButton from '../components/BookButton';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { seedUsers } from '../data/mockData';

afterEach(() => {
    cleanup();
});

test('Muestra el mensaje de inicio sesión al abrir el modal si el usuario no está registrado', async () => {

    //Simulamos el usuario nulo
    const authMock = { user:null };
    const dataMock = {
        pets: [],
        species: [],
        addPet: () => {},
        addAppointment: () => {}
    };

    //Renderizamos
    render(
        <AuthContext.Provider value={authMock}>
            <DataContext.Provider value={dataMock}>
                <BrowserRouter>
                    <BookButton>Agendar cita</BookButton>
                </BrowserRouter>
            </DataContext.Provider>
        </AuthContext.Provider>
    );

    //Simular el click del modal
    await userEvent.click(screen.getByText('Agendar cita'));

    // Verificar que pida el inicio
    expect(screen.getByText('Debes iniciar sesión para agendar una cita.')).toBeInTheDocument();
});

test('Muestra el formulario para registrar mascota si el usuario logueado no tiene mascotas', async () => {
    
    const usuarioPrueba = seedUsers[1]; 
    const authMock = { user: usuarioPrueba };
    const dataMock = { pets: [], species: [], addPet: () => {}, addAppointment: () => {} };

    render(
        <AuthContext.Provider value={authMock}>
            <DataContext.Provider value={dataMock}>
                <BrowserRouter>
                    <BookButton>Agendar sin mascotas</BookButton>
                </BrowserRouter>
            </DataContext.Provider>
        </AuthContext.Provider>
    );

    const boton = screen.getByText('Agendar sin mascotas');
    await userEvent.click(boton)

    expect(screen.getByText('¡Registra a tu compañero!')).toBeInTheDocument();
});

test('Permite llenar el formulario y agendar una cita si el usuario tiene mascotas activas', async () => {

    const usuarioPrueba = seedUsers[1];
    const authMock = { user: usuarioPrueba };
    const mockPets = [
        { id: 2, name: 'Luna', speciesId: 1, active: true, ownerId: 2 }
    ];

    const addAppointmentMock = vi.fn(); //Aca sapeamos si hay una cita
    const dataMock = { 
        pets: mockPets, 
        species: [],
        addPet: () => {}, 
        addAppointment: addAppointmentMock 
    };

    render(
        <AuthContext.Provider value={authMock}>
            <DataContext.Provider value={dataMock}>
                <BrowserRouter>
                    <BookButton>Agendar con mascota</BookButton>
                </BrowserRouter>
            </DataContext.Provider>
        </AuthContext.Provider>
    );

    // Simulamos todos los pasos desde hacer click en el boton, seleccionar las opciones , la fecha/hora y confirmar el botón de la cita
    const boton = screen.getByText('Agendar con mascota');
    await userEvent.click(boton);

    await userEvent.selectOptions(screen.getByLabelText(/Mascota/i), 'Luna');
    await userEvent.selectOptions(screen.getByLabelText(/Motivo de la consulta/i), 'Consulta General');
    await userEvent.selectOptions(screen.getByLabelText(/Veterinario/i), 'Dra. Paula Núñez');

    await userEvent.type(screen.getByLabelText(/Fecha/i), '2026-12-25');
    await userEvent.selectOptions(screen.getByLabelText(/Hora/i), '09:00');

    await userEvent.click(screen.getByText('Confirmar cita'));

    // Aca esperamos que la función fuese llamada con los ids que espera el ms de citas
    await waitFor(() => expect(addAppointmentMock).toHaveBeenCalledTimes(1));
    expect(addAppointmentMock).toHaveBeenCalledWith(
        expect.objectContaining({ petId: 2, ownerId: 2, ownerEmail: 'ig.munoz@duoc.cl' })
    );
});

test('Muestra el mensaje del backend si no se pudo agendar la cita', async () => {

    const usuarioPrueba = seedUsers[1];
    const authMock = { user: usuarioPrueba };
    const mockPets = [
        { id: 2, name: 'Luna', speciesId: 1, active: true, ownerId: 2 }
    ];

    // el back rechaza la cita, igual que cuando el horario no corresponde
    const addAppointmentMock = vi.fn().mockRejectedValue({
        response: { data: { message: 'El horario de atencion es de 09:00 a 19:00.' } }
    });
    const dataMock = {
        pets: mockPets,
        species: [],
        addPet: () => {},
        addAppointment: addAppointmentMock
    };

    render(
        <AuthContext.Provider value={authMock}>
            <DataContext.Provider value={dataMock}>
                <BrowserRouter>
                    <BookButton>Agendar con error</BookButton>
                </BrowserRouter>
            </DataContext.Provider>
        </AuthContext.Provider>
    );

    await userEvent.click(screen.getByText('Agendar con error'));

    await userEvent.selectOptions(screen.getByLabelText(/Mascota/i), 'Luna');
    await userEvent.selectOptions(screen.getByLabelText(/Motivo de la consulta/i), 'Consulta General');
    await userEvent.selectOptions(screen.getByLabelText(/Veterinario/i), 'Dra. Paula Núñez');

    await userEvent.type(screen.getByLabelText(/Fecha/i), '2026-12-25');
    await userEvent.selectOptions(screen.getByLabelText(/Hora/i), '09:00');

    await userEvent.click(screen.getByText('Confirmar cita'));

    expect(await screen.findByText('El horario de atencion es de 09:00 a 19:00.')).toBeInTheDocument();
});