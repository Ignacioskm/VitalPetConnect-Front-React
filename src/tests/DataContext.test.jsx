import { useContext } from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { expect, test, afterEach, beforeEach, vi } from 'vitest';
import { DataContext, DataProvider } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import { petsService } from '../api/petsService';
import { appointmentsService } from '../api/appointmentsService';
import { usersService } from '../api/usersService';
import { seedUsers } from '../data/mockData';

// no queremos pegarle al backend de verdad en los tests
vi.mock('../api/petsService', () => ({
    petsService: {
        getAll: vi.fn(),
        getByOwner: vi.fn(),
        getSpecies: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        remove: vi.fn(),
    },
}));

vi.mock('../api/appointmentsService', () => ({
    appointmentsService: {
        getAll: vi.fn(),
        getByOwner: vi.fn(),
        create: vi.fn(),
        updateStatus: vi.fn(),
    },
}));

vi.mock('../api/usersService', () => ({
    usersService: {
        getAll: vi.fn(),
    },
}));

const citaBase = {
    id: 1,
    petId: 1,
    petName: 'Rocky',
    ownerId: 2,
    ownerName: 'Camila Rojas',
    ownerEmail: 'camila@mail.com',
    date: '2026-12-25',
    time: '10:00',
    reason: 'Control',
    vet: 'Dra. Paula Nunez',
    status: 'Pendiente',
};

beforeEach(() => {
    petsService.getAll.mockResolvedValue([{ id: 1, name: 'Rocky', active: true }]);
    petsService.getByOwner.mockResolvedValue([{ id: 1, name: 'Rocky', active: true }]);
    petsService.getSpecies.mockResolvedValue([{ id: 1, name: 'PERRO' }]);
    appointmentsService.getAll.mockResolvedValue([citaBase]);
    appointmentsService.getByOwner.mockResolvedValue([citaBase]);
    usersService.getAll.mockResolvedValue([]);
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

const TestConsumer = () => {
    const {
        users, usersError, refreshUsers,
        pets, species, petsError, addPet, updatePet, deletePet, refreshPets,
        appointments, appointmentsError, refreshAppointments, addAppointment, updateAppointmentStatus,
    } = useContext(DataContext);

    return (
        <div>
            <span data-testid="users-count">{users.length}</span>
            <span data-testid="users-error">{usersError}</span>
            <span data-testid="species-count">{species.length}</span>
            <span data-testid="pets-count">{pets.length}</span>
            <span data-testid="pets-error">{petsError}</span>
            <span data-testid="appointments-count">{appointments.length}</span>
            <span data-testid="appointments-error">{appointmentsError}</span>

            <button onClick={refreshUsers} data-testid="btn-refresh-users">Recargar usuarios</button>
            <button onClick={refreshPets} data-testid="btn-refresh-pets">Recargar mascotas</button>
            <button onClick={refreshAppointments} data-testid="btn-refresh-appointments">Recargar citas</button>
            <button onClick={() => addPet({ name: 'Nueva' }).catch(() => {})} data-testid="btn-add-pet">Agregar Mascota</button>
            <button onClick={() => updatePet(1, { name: 'Editada' }).catch(() => {})} data-testid="btn-update-pet">Editar Mascota</button>
            <button onClick={() => deletePet(1).catch(() => {})} data-testid="btn-delete-pet">Borrar Mascota</button>

            <button
                onClick={() => addAppointment({ petId: 1, petName: 'Rocky', ownerId: 2, date: '2026-12-25', time: '10:00', reason: 'Control', vet: 'Dr. Smith' }).catch(() => {})}
                data-testid="btn-add-appointment"
            >
                Agregar Cita
            </button>

            <button
                onClick={() => updateAppointmentStatus(1, 'Confirmada').catch(() => {})}
                data-testid="btn-update-appointment"
            >
                Actualizar Cita
            </button>

            <span data-testid="first-appointment-status">
                {appointments.length > 0 ? appointments[0].status : 'Sin citas'}
            </span>
        </div>
    );
};

const renderProvider = (user = seedUsers[0]) =>
    render(
        // DataProvider necesita el contexto de autenticación para saber si es admin o cliente.
        <AuthContext.Provider value={{ user }}>
            <DataProvider>
                <TestConsumer />
            </DataProvider>
        </AuthContext.Provider>
    );

test('Carga las mascotas y las citas desde los servicios al iniciar', async () => {
    renderProvider();

    await waitFor(() => {
        expect(screen.getByTestId('pets-count')).toHaveTextContent('1');
        expect(screen.getByTestId('appointments-count')).toHaveTextContent('1');
    });
});

test('Agregar una cita llama al servicio y vuelve a cargar la lista', async () => {
    appointmentsService.create.mockResolvedValue({ ...citaBase, id: 2 });
    renderProvider();
    await waitFor(() => expect(appointmentsService.getAll).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByTestId('btn-add-appointment'));

    await waitFor(() => {
        expect(appointmentsService.create).toHaveBeenCalledTimes(1);
        expect(appointmentsService.getAll).toHaveBeenCalledTimes(2);
    });
});

test('Cambiar el estado de una cita llama al servicio y refleja el nuevo estado', async () => {
    appointmentsService.updateStatus.mockImplementation(async () => {
        // despues del cambio el back devuelve la cita confirmada
        appointmentsService.getAll.mockResolvedValue([{ ...citaBase, status: 'Confirmada' }]);
        return { ...citaBase, status: 'Confirmada' };
    });
    renderProvider();
    await waitFor(() => expect(screen.getByTestId('first-appointment-status')).toHaveTextContent('Pendiente'));

    fireEvent.click(screen.getByTestId('btn-update-appointment'));

    await waitFor(() => {
        expect(appointmentsService.updateStatus).toHaveBeenCalledWith(1, 'Confirmada');
        expect(screen.getByTestId('first-appointment-status')).toHaveTextContent('Confirmada');
    });
});

test('Si el backend de citas no responde se guarda el mensaje de error', async () => {
    appointmentsService.getAll.mockRejectedValue({ response: { data: { message: 'Servicio caido' } } });
    vi.spyOn(console, 'error').mockImplementation(() => {});

    renderProvider();

    await waitFor(() => {
        expect(screen.getByTestId('appointments-error')).toHaveTextContent('Servicio caido');
    });
});

test('Un cliente carga mascotas y citas por su dueño, no como administrador', async () => {
    renderProvider(seedUsers[1]);

    await waitFor(() => {
        expect(petsService.getByOwner).toHaveBeenCalledWith(seedUsers[1].id);
        expect(appointmentsService.getByOwner).toHaveBeenCalledWith(seedUsers[1].id);
        expect(screen.getByTestId('pets-count')).toHaveTextContent('1');
        expect(screen.getByTestId('species-count')).toHaveTextContent('1');
    });
    expect(petsService.getAll).not.toHaveBeenCalled();
    expect(usersService.getAll).not.toHaveBeenCalled();
});

test('Permite crear, editar y eliminar mascotas refrescando el listado', async () => {
    petsService.create.mockResolvedValue({ id: 3 });
    petsService.update.mockResolvedValue({ id: 1 });
    petsService.remove.mockResolvedValue({});
    renderProvider();
    await waitFor(() => expect(petsService.getAll).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByTestId('btn-add-pet'));
    await waitFor(() => expect(petsService.create).toHaveBeenCalledWith({ name: 'Nueva' }));

    fireEvent.click(screen.getByTestId('btn-update-pet'));
    await waitFor(() => expect(petsService.update).toHaveBeenCalledWith(1, { name: 'Editada' }));

    fireEvent.click(screen.getByTestId('btn-delete-pet'));
    await waitFor(() => expect(petsService.remove).toHaveBeenCalledWith(1));
    expect(petsService.getAll.mock.calls.length).toBeGreaterThanOrEqual(4);
});

test('Guarda los errores de mascotas, usuarios y especies', async () => {
    petsService.getAll.mockRejectedValue({ response: { data: { message: 'Sin mascotas' } } });
    usersService.getAll.mockRejectedValue({ response: { data: { message: 'Sin usuarios' } } });
    petsService.getSpecies.mockRejectedValue(new Error('sin catálogo'));
    renderProvider();

    await waitFor(() => {
        expect(screen.getByTestId('pets-error')).toHaveTextContent('Sin mascotas');
        expect(screen.getByTestId('users-error')).toHaveTextContent('Sin usuarios');
        expect(screen.getByTestId('species-count')).toHaveTextContent('0');
    });
});

test('Sin usuario autenticado deja los listados vacíos', async () => {
    renderProvider(null);

    await waitFor(() => {
        expect(screen.getByTestId('pets-count')).toHaveTextContent('0');
        expect(screen.getByTestId('appointments-count')).toHaveTextContent('0');
        expect(screen.getByTestId('users-count')).toHaveTextContent('0');
    });
    expect(petsService.getAll).not.toHaveBeenCalled();
    expect(appointmentsService.getAll).not.toHaveBeenCalled();
});

test('Mantiene la interfaz estable si falla el alta de una cita', async () => {
    appointmentsService.create.mockRejectedValue(new Error('sin servicio'));
    renderProvider(null);
    await waitFor(() => expect(screen.getByTestId('appointments-count')).toHaveTextContent('0'));

    fireEvent.click(screen.getByTestId('btn-add-appointment'));
    await waitFor(() => expect(appointmentsService.create).toHaveBeenCalledTimes(1));
    expect(screen.getByTestId('appointments-count')).toHaveTextContent('0');
});
