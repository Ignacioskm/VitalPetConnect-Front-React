import { useContext } from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { expect, test, afterEach, beforeEach, vi } from 'vitest';
import { DataContext, DataProvider } from '../context/DataContext';
import { petsService } from '../api/petsService';
import { appointmentsService } from '../api/appointmentsService';

// no queremos pegarle al backend de verdad en los tests
vi.mock('../api/petsService', () => ({
    petsService: {
        getAll: vi.fn(),
        getSpecies: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        remove: vi.fn(),
    },
}));

vi.mock('../api/appointmentsService', () => ({
    appointmentsService: {
        getAll: vi.fn(),
        create: vi.fn(),
        updateStatus: vi.fn(),
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
    petsService.getSpecies.mockResolvedValue([{ id: 1, name: 'PERRO' }]);
    appointmentsService.getAll.mockResolvedValue([citaBase]);
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

const TestConsumer = () => {
    const { pets, appointments, appointmentsError, addAppointment, updateAppointmentStatus } = useContext(DataContext);

    return (
        <div>
            <span data-testid="pets-count">{pets.length}</span>
            <span data-testid="appointments-count">{appointments.length}</span>
            <span data-testid="appointments-error">{appointmentsError}</span>

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

const renderProvider = () =>
    render(
        <DataProvider>
            <TestConsumer />
        </DataProvider>
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
