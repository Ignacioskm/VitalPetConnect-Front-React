import { renderHook, act } from '@testing-library/react';
import { expect, test, afterEach, vi } from 'vitest';
import { useLocalStorage } from '../hooks/useLocalStorage';


afterEach(() => {
    localStorage.clear();
});

test('Devuelve el valor inicial si no existe un registro previo en localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'valor-inicial'));
    const [value] = result.current;
    
    expect(value).toBe('valor-inicial');
});

test('Actualiza el valor correctamente y lo persiste en localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'valor-inicial'));
    const [, setValue] = result.current;

    act(() => {
        setValue('nuevo-valor');
    });

    const [value] = result.current;
    expect(value).toBe('nuevo-valor');
    expect(JSON.parse(localStorage.getItem('test-key'))).toBe('nuevo-valor');
});

test('Recupera un valor previo de localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify({ nombre: 'Rocky' }));
    const { result } = renderHook(() => useLocalStorage('test-key', {}));

    expect(result.current[0]).toEqual({ nombre: 'Rocky' });
});

test('Usa el valor inicial y avisa si el JSON guardado es inválido', () => {
    localStorage.setItem('test-key', '{json roto');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useLocalStorage('test-key', 'inicial'));

    expect(result.current[0]).toBe('inicial');
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
});

test('Permite actualizar con una función y tolera errores al guardar', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useLocalStorage('test-key', 1));

    act(() => result.current[1]((prev) => prev + 1));
    expect(result.current[0]).toBe(2);

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('cuota excedida');
    });
    act(() => result.current[1](3));
    expect(result.current[0]).toBe(3);
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
    vi.restoreAllMocks();
});