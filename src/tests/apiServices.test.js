import { beforeEach, afterEach, expect, test, vi } from 'vitest';

// Un único cliente simulado para los tres axios.create() del proyecto.
vi.mock('axios', () => {
  const client = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return { default: { create: vi.fn(() => client) } };
});

import axios from 'axios';
import { petsService } from '../api/petsService';
import { appointmentsService } from '../api/appointmentsService';
import { usersService } from '../api/usersService';
import { createValidToken } from './testUtils';
import { TOKEN_KEY, USER_KEY } from '../api/authStorage';

const client = axios.create({});

// Los interceptors se registran al importar los clientes, antes de los tests.
const requestHandlers = client.interceptors.request.use.mock.calls.map((call) => call[0]);
const responseFulfilled = client.interceptors.response.use.mock.calls.map((call) => call[0]);
const responseHandlers = client.interceptors.response.use.mock.calls.map((call) => call[1]);

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

test('petsService expone todas las operaciones contra el cliente HTTP', async () => {
  client.get.mockResolvedValue({ data: [{ id: 1 }] });
  client.post.mockResolvedValue({ data: { id: 2 } });
  client.put.mockResolvedValue({ data: { id: 3 } });
  client.delete.mockResolvedValue({});

  await expect(petsService.getAll()).resolves.toEqual([{ id: 1 }]);
  expect(client.get).toHaveBeenCalledWith('/api/pets');

  await petsService.getByOwner(7);
  expect(client.get).toHaveBeenCalledWith('/api/pets/7/owner');

  await petsService.getById(5);
  expect(client.get).toHaveBeenCalledWith('/api/pets/5');

  await petsService.getSpecies();
  expect(client.get).toHaveBeenCalledWith('/api/pets/species');

  await petsService.create({ name: 'Luna' });
  expect(client.post).toHaveBeenCalledWith('/api/pets', { name: 'Luna' });

  await petsService.update(5, { name: 'Luna' });
  expect(client.put).toHaveBeenCalledWith('/api/pets/5', { name: 'Luna' });

  await petsService.remove(5);
  expect(client.delete).toHaveBeenCalledWith('/api/pets/5');
});

test('appointmentsService expone todas las operaciones contra el cliente HTTP', async () => {
  client.get.mockResolvedValue({ data: [{ id: 1 }] });
  client.post.mockResolvedValue({ data: { id: 2 } });
  client.put.mockResolvedValue({ data: { id: 2, status: 'Confirmada' } });
  client.delete.mockResolvedValue({});

  await expect(appointmentsService.getAll()).resolves.toEqual([{ id: 1 }]);
  expect(client.get).toHaveBeenCalledWith('/api/appointments');

  await appointmentsService.getByOwner(2);
  expect(client.get).toHaveBeenCalledWith('/api/appointments/2/owner');

  await appointmentsService.create({ petId: 2 });
  expect(client.post).toHaveBeenCalledWith('/api/appointments', { petId: 2 });

  await appointmentsService.updateStatus(2, 'Confirmada');
  expect(client.put).toHaveBeenCalledWith('/api/appointments/2/status', { status: 'Confirmada' });

  await appointmentsService.remove(2);
  expect(client.delete).toHaveBeenCalledWith('/api/appointments/2');
});

test('usersService consulta el microservicio de usuarios', async () => {
  client.get.mockResolvedValue({ data: [{ id: 1 }] });
  client.post.mockResolvedValue({ data: { token: 'abc', id: 1 } });

  await expect(usersService.getAll()).resolves.toEqual([{ id: 1 }]);
  expect(client.get).toHaveBeenCalledWith('/api/users');

  await expect(usersService.login('admin@admin.cl', 'admin123')).resolves.toEqual({ token: 'abc', id: 1 });
  expect(client.post).toHaveBeenCalledWith('/api/users/login', {
    email: 'admin@admin.cl',
    password: 'admin123',
  });

  await usersService.register({ name: 'Nuevo' });
  expect(client.post).toHaveBeenCalledWith('/api/users/register', { name: 'Nuevo' });
});

test('los interceptors de request agregan el Bearer solo si el token es válido', () => {
  expect(requestHandlers.length).toBeGreaterThan(0);

  requestHandlers.forEach((handler) => {
    const withoutToken = { headers: { set: vi.fn() } };
    expect(handler(withoutToken)).toBe(withoutToken);
    expect(withoutToken.headers.set).not.toHaveBeenCalled();

    const token = createValidToken();
    localStorage.setItem(TOKEN_KEY, token);
    const withToken = { headers: { set: vi.fn() } };
    handler(withToken);
    expect(withToken.headers.set).toHaveBeenCalledWith('Authorization', `Bearer ${token}`);
    localStorage.clear();
  });
});

test('los interceptors de response avisan de 401 y rechazan cualquier error', async () => {
  expect(responseHandlers.length).toBeGreaterThan(0);
  const eventSpy = vi.fn();
  window.addEventListener('vp:unauthorized', eventSpy);
  let login401PreservedSession = 0;

  responseFulfilled.forEach((onFulfilled) => {
    const response = { status: 200 };
    expect(onFulfilled(response)).toBe(response);
  });

  for (const handler of responseHandlers) {
    const networkError = { response: { status: 500 }, config: { url: '/api/pets' } };
    await expect(handler(networkError)).rejects.toBe(networkError);
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();

    localStorage.setItem(TOKEN_KEY, createValidToken());
    localStorage.setItem(USER_KEY, '{}');
    const unauthorized = { response: { status: 401 }, config: { url: '/api/pets' } };
    await expect(handler(unauthorized)).rejects.toBe(unauthorized);
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(eventSpy).toHaveBeenCalled();

    // Un 401 en /api/users/login no debe cerrar una sesión válida.
    localStorage.setItem(TOKEN_KEY, createValidToken());
    const eventsBefore = eventSpy.mock.calls.length;
    const loginError = { response: { status: 401 }, config: { url: '/api/users/login' } };
    await expect(handler(loginError)).rejects.toBe(loginError);
    if (eventSpy.mock.calls.length === eventsBefore) login401PreservedSession += 1;
    localStorage.clear();
  }

  expect(login401PreservedSession).toBeGreaterThan(0);
  window.removeEventListener('vp:unauthorized', eventSpy);
});
