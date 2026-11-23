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

test('Muestra el estado de carga y el error del listado de mascotas', async () => {
    const authMock = { user: seedUsers[1] };
    const loadingMock = { pets: [], species: [], petsLoading: true, petsError: '', addPet: () => {}, addAppointment: () => {} };

    const { unmount } = render(
        <AuthContext.Provider value={authMock}>
            <DataContext.Provider value={loadingMock}>
                <BrowserRouter><BookButton>Agendar cargando</BookButton></BrowserRouter>
            </DataContext.Provider>
        </AuthContext.Provider>
    );
    await userEvent.click(screen.getByText('Agendar cargando'));
    expect(screen.getByText('Cargando tus mascotas...')).toBeInTheDocument();
    unmount();

    render(
        <AuthContext.Provider value={authMock}>
            <DataContext.Provider value={{ ...loadingMock, petsLoading: false, petsError: 'No se pudieron cargar las mascotas.' }}>
                <BrowserRouter><BookButton>Agendar con error de mascotas</BookButton></BrowserRouter>
            </DataContext.Provider>
        </AuthContext.Provider>
    );
    await userEvent.click(screen.getByText('Agendar con error de mascotas'));
    expect(screen.getByText('No se pudieron cargar las mascotas.')).toBeInTheDocument();
});

test('Valida el formulario de cita antes de llamar al servicio', async () => {
    const authMock = { user: seedUsers[1] };
    const addAppointmentMock = vi.fn();
    const dataMock = {
        pets: [{ id: 2, name: 'Luna', speciesId: 1, active: true, ownerId: 2 }],
        species: [], addPet: () => {}, addAppointment: addAppointmentMock,
    };

    render(
        <AuthContext.Provider value={authMock}>
            <DataContext.Provider value={dataMock}>
                <BrowserRouter><BookButton>Agendar validando</BookButton></BrowserRouter>
            </DataContext.Provider>
        </AuthContext.Provider>
    );
    await userEvent.click(screen.getByText('Agendar validando'));
    await userEvent.click(screen.getByText('Confirmar cita'));

    expect(await screen.findByText('Selecciona una mascota.')).toBeInTheDocument();
    expect(screen.getByText('Selecciona el motivo de la consulta.')).toBeInTheDocument();
    expect(screen.getByText('Selecciona un veterinario.')).toBeInTheDocument();
    expect(screen.getByText('La fecha es obligatoria.')).toBeInTheDocument();
    expect(screen.getByText('Selecciona una hora.')).toBeInTheDocument();
    expect(addAppointmentMock).not.toHaveBeenCalled();
});

test('Confirma la cita y muestra el mensaje de éxito', async () => {
    const addAppointmentMock = vi.fn().mockResolvedValue({ id: 1 });
    const dataMock = {
        pets: [{ id: 2, name: 'Luna', speciesId: 1, active: true, ownerId: 2 }],
        species: [], addPet: () => {}, addAppointment: addAppointmentMock,
    };

    render(
        <AuthContext.Provider value={{ user: seedUsers[1] }}>
            <DataContext.Provider value={dataMock}>
                <BrowserRouter><BookButton>Agendar y confirmar</BookButton></BrowserRouter>
            </DataContext.Provider>
        </AuthContext.Provider>
    );
    await userEvent.click(screen.getByText('Agendar y confirmar'));
    await userEvent.selectOptions(screen.getByLabelText(/Mascota/i), 'Luna');
    await userEvent.selectOptions(screen.getByLabelText(/Motivo de la consulta/i), 'Consulta General');
    await userEvent.selectOptions(screen.getByLabelText(/Veterinario/i), 'Dra. Paula Núñez');
    await userEvent.type(screen.getByLabelText(/Fecha/i), '2026-12-25');
    await userEvent.selectOptions(screen.getByLabelText(/Hora/i), '09:00');
    await userEvent.click(screen.getByText('Confirmar cita'));

    expect(await screen.findByText(/¡Cita solicitada para Luna!/)).toBeInTheDocument();
});

test('Muestra el mensaje genérico si el servicio de citas falla sin mensaje del backend', async () => {
    const dataMock = {
        pets: [{ id: 2, name: 'Luna', speciesId: 1, active: true, ownerId: 2 }],
        species: [],
        addPet: () => {},
        addAppointment: vi.fn().mockRejectedValue(new Error('sin respuesta')),
    };

    render(
        <AuthContext.Provider value={{ user: seedUsers[1] }}>
            <DataContext.Provider value={dataMock}>
                <BrowserRouter><BookButton>Agendar sin backend</BookButton></BrowserRouter>
            </DataContext.Provider>
        </AuthContext.Provider>
    );
    await userEvent.click(screen.getByText('Agendar sin backend'));
    await userEvent.selectOptions(screen.getByLabelText(/Mascota/i), 'Luna');
    await userEvent.selectOptions(screen.getByLabelText(/Motivo de la consulta/i), 'Consulta General');
    await userEvent.selectOptions(screen.getByLabelText(/Veterinario/i), 'Dra. Paula Núñez');
    await userEvent.type(screen.getByLabelText(/Fecha/i), '2026-12-25');
    await userEvent.selectOptions(screen.getByLabelText(/Hora/i), '09:00');
    await userEvent.click(screen.getByText('Confirmar cita'));

    expect(await screen.findByText('No se pudo agendar la cita. Intenta de nuevo.')).toBeInTheDocument();
});

const renderPetForm = (addPet) => {
    const dataMock = {
        pets: [],
        species: [{ id: 1, name: 'PERRO' }],
        addPet,
        addAppointment: () => {},
    };
    render(
        <AuthContext.Provider value={{ user: seedUsers[1] }}>
            <DataContext.Provider value={dataMock}>
                <BrowserRouter><BookButton>Registrar mascota</BookButton></BrowserRouter>
            </DataContext.Provider>
        </AuthContext.Provider>
    );
    return userEvent.click(screen.getByText('Registrar mascota'));
};

test('Valida los campos al registrar una mascota', async () => {
    await renderPetForm(vi.fn());

    await userEvent.click(screen.getByText('Guardar y Continuar'));
    expect(await screen.findByText('Por favor, completa todos los campos de la mascota.')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/^Nombre/), 'Firulais');
    await userEvent.selectOptions(screen.getByLabelText(/^Especie/), '1');
    await userEvent.type(screen.getByLabelText(/^Raza/), 'Quiltro');
    await userEvent.type(screen.getByLabelText(/^Fecha de nacimiento/), '2099-01-01');
    await userEvent.type(screen.getByLabelText(/^Peso/), '12');
    await userEvent.click(screen.getByText('Guardar y Continuar'));
    expect(await screen.findByText('La fecha de nacimiento no puede ser futura.')).toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText(/^Fecha de nacimiento/));
    await userEvent.type(screen.getByLabelText(/^Fecha de nacimiento/), '2020-01-01');
    await userEvent.clear(screen.getByLabelText(/^Peso/));
    await userEvent.type(screen.getByLabelText(/^Peso/), '0');
    await userEvent.click(screen.getByText('Guardar y Continuar'));
    expect(await screen.findByText('Ingresa un peso válido mayor que cero.')).toBeInTheDocument();
});

test('Registra una mascota correctamente y reporta errores del backend', async () => {
    const addPet = vi.fn().mockResolvedValueOnce({ id: 9 });
    await renderPetForm(addPet);

    await userEvent.type(screen.getByLabelText(/^Nombre/), 'Firulais');
    await userEvent.selectOptions(screen.getByLabelText(/^Especie/), '1');
    await userEvent.type(screen.getByLabelText(/^Raza/), 'Quiltro');
    await userEvent.type(screen.getByLabelText(/^Fecha de nacimiento/), '2020-01-01');
    await userEvent.type(screen.getByLabelText(/^Peso/), '12');
    await userEvent.click(screen.getByText('Guardar y Continuar'));

    await waitFor(() => expect(addPet).toHaveBeenCalledWith(expect.objectContaining({ name: 'Firulais', ownerId: 2 })));
    expect(screen.queryByText('Por favor, completa todos los campos de la mascota.')).not.toBeInTheDocument();
});

test('Muestra el mensaje de error al registrar una mascota', async () => {
    const addPet = vi.fn().mockRejectedValue({ response: { data: { message: 'La mascota ya existe' } } });
    await renderPetForm(addPet);

    await userEvent.type(screen.getByLabelText(/^Nombre/), 'Firulais');
    await userEvent.selectOptions(screen.getByLabelText(/^Especie/), '1');
    await userEvent.type(screen.getByLabelText(/^Raza/), 'Quiltro');
    await userEvent.type(screen.getByLabelText(/^Fecha de nacimiento/), '2020-01-01');
    await userEvent.type(screen.getByLabelText(/^Peso/), '12');
    await userEvent.click(screen.getByText('Guardar y Continuar'));

    expect(await screen.findByText('La mascota ya existe')).toBeInTheDocument();
});