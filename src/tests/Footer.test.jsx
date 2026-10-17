import { render, screen, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { expect, test, afterEach } from 'vitest';
import Footer from '../components/Footer';

afterEach(() => {
    cleanup();
});

test('Renderiza correctamente la información principal, contacto y año actual en el Footer', () => {
    render(
        <BrowserRouter>
            <Footer />
        </BrowserRouter>
    );

    // Validamos el nombre y el eslogan
    expect(screen.getByText('VitalPet Connect')).toBeInTheDocument();
    expect(screen.getByText(/Brindando excelencia en atención clínica/i)).toBeInTheDocument();

    // Los datos de contacto
    expect(screen.getByText(/Av. Libertad 123, Viña del Mar/i)).toBeInTheDocument();
    expect(screen.getByText('+56 9 1234 5678')).toBeInTheDocument();
    expect(screen.getByText('contacto@vitalpet.cl')).toBeInTheDocument();

    // y los derechos de autor con la fecha
    const anioActual = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${anioActual} VitalPet Connect`, 'i'))).toBeInTheDocument();
});