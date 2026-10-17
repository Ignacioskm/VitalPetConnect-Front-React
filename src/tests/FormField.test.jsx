import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, afterEach, vi } from 'vitest';
import FormField from '../components/FormField';

afterEach(() => {
    cleanup();
});

test('Renderiza un input de texto normal con etiqueta y indicador requerido', () => {
    render(
        <FormField 
            id="nombre" 
            label="Nombre de mascota" 
            placeholder="Ej: Rocky" 
            required={true} 
        />
    );

    expect(screen.getByText('Nombre de mascota')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument(); // Asterisco rojo de requerido
    expect(screen.getByPlaceholderText('Ej: Rocky')).toBeInTheDocument();
});

test('Renderiza un select con opciones de texto y objetos, permitiendo seleccionar un valor', async () => {
    const handleChange = vi.fn(); 
    const opcionesMixtas = ['Perro', { value: '2', label: 'Gato' }];

    render(
        <FormField 
            id="especie" 
            label="Especie" 
            as="select" 
            options={opcionesMixtas} 
            onChange={handleChange}
        />
    );

    const selectElement = screen.getByLabelId ? screen.getByLabelText('Especie') : screen.getByRole('combobox');
    await userEvent.selectOptions(selectElement, 'Gato');

    expect(handleChange).toHaveBeenCalled();
});

test('Muestra el mensaje de error y aplica la clase invalid cuando hay un error', () => {
    render(
        <FormField 
            id="email" 
            label="Correo" 
            error="El correo no es válido" 
        />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('is-invalid');
    expect(screen.getByText('El correo no es válido')).toBeInTheDocument();
});

test('Renderiza un textarea y un texto de ayuda cuando no hay errores', () => {
    render(
        <FormField 
            id="descripcion" 
            label="Comentarios" 
            as="textarea" 
            help="Escribe detalles adicionales opcionales." 
        />
    );

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText('Escribe detalles adicionales opcionales.')).toBeInTheDocument();
});