import { render, screen, cleanup } from '@testing-library/react';
import { expect, test, afterEach, vi } from 'vitest';
import StatusBadge from '../components/StatusBadge';

afterEach(() => {
    cleanup();
});

test('Renderiza correctamente un estado conocido con su clase de estilo', () => {
    render(<StatusBadge status="Pendiente" />);
    
    const badge = screen.getByText('Pendiente');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('badge bg-warning text-dark');
});

test('No renderiza nada si no se le pasa ningún estado', () => {
    const { container } = render(<StatusBadge status="" />);
    expect(container.firstChild).toBeNull();
});

test('Maneja un estado desconocido usando el estilo por defecto y tira una advertencia', () => {
    // Espiamos console.warn para que la advertencia no ensucie la consola al ejecutar los tests
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(<StatusBadge status="Desconocido" />);

    const badge = screen.getByText('Desconocido');
    expect(badge).toBeInTheDocument();
  
    expect(badge).toHaveClass('badge bg-dark');
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);

    consoleWarnSpy.mockRestore();
});