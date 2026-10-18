import { renderHook, act } from '@testing-library/react';
import { expect, test, afterEach } from 'vitest';
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