import { useContext } from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { expect, test, afterEach } from 'vitest';
import { DataContext, DataProvider } from '../context/DataContext';

afterEach(() => {
    cleanup();
    localStorage.clear();
});

const TestConsumer = () => {
    const { pets, appointments, addPet, deletePet, addAppointment, updateAppointmentStatus } = useContext(DataContext);

    return (
        <div>
            <span data-testid="pets-count">{pets.length}</span>
            <span data-testid="appointments-count">{appointments.length}</span>

            <button 
                onClick={() => addPet({ name: 'Firulais', species: 'Perro', age: 3, ownerEmail: 'test@duoc.cl' })}
                data-testid="btn-add-pet"
            >
                Agregar Mascota
            </button>

            <button 
                onClick={() => pets.length > 0 && deletePet(pets[0].id)}
                data-testid="btn-delete-pet"
            >
                Eliminar Mascota
            </button>

            <button 
                onClick={() => addAppointment({ petName: 'Firulais', ownerName: 'Test', date: '2026-12-25', time: '10:00', reason: 'Consulta', vet: 'Dr. Smith' })}
                data-testid="btn-add-appointment"
            >
                Agregar Cita
            </button>

            <button 
                onClick={() => appointments.length > 0 && updateAppointmentStatus(appointments[0].id, 'Confirmada')}
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

test('Carga las mascotas y citas iniciales desde la seedData', () => {
    render(
        <DataProvider>
            <TestConsumer />
        </DataProvider>
    );

    expect(Number(screen.getByTestId('pets-count').textContent)).toBeGreaterThan(0);
    expect(Number(screen.getByTestId('appointments-count').textContent)).toBeGreaterThan(0);
});

test('Permite agregar una nueva mascota y luego eliminarla', () => {
    render(
        <DataProvider>
            <TestConsumer />
        </DataProvider>
    );

    const initialCount = Number(screen.getByTestId('pets-count').textContent);

    // Agregar mascota
    fireEvent.click(screen.getByTestId('btn-add-pet'));
    expect(Number(screen.getByTestId('pets-count').textContent)).toBe(initialCount + 1);

    // Eliminar mascota
    fireEvent.click(screen.getByTestId('btn-delete-pet'));
    expect(Number(screen.getByTestId('pets-count').textContent)).toBe(initialCount);
});

test('Permite agregar una cita y cambiar su estado correctamente', () => {
    render(
        <DataProvider>
            <TestConsumer />
        </DataProvider>
    );

    // Agregar cita (por defecto queda en estado Pendiente)
    fireEvent.click(screen.getByTestId('btn-add-appointment'));
    expect(screen.getByTestId('first-appointment-status')).toHaveTextContent('Pendiente');

    // Actualizar estado a Confirmada
    fireEvent.click(screen.getByTestId('btn-update-appointment'));
    expect(screen.getByTestId('first-appointment-status')).toHaveTextContent('Confirmada');
});