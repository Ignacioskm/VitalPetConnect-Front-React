import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { expect, test, vi } from 'vitest';
import Navbar from '../components/Navbar'
import { AuthContext } from '../context/AuthContext'
import { DataContext } from '../context/DataContext'
import { seedUsers } from '../data/mockData'

test('Muestra el nombre del usuario, opciones de perfil y permite cerrar sesión', async () => {
    const usuarioPrueba = seedUsers[1]; 
    const logoutMock = vi.fn(); 

    const authMock = {
        user: usuarioPrueba,
        logout: logoutMock,
    };

    // Esto es para cubrir todos los requerimientos del bookbutton
    const dataMock = {
        pets: [],
        appointments: [],
        addPet: () => {},
        addAppointment: () => {},
        updateAppointmentStatus: () => {},
    };

    render(
      <AuthContext.Provider value={authMock}>
        <DataContext.Provider value={dataMock}>
          <BrowserRouter>
            <Navbar />
          </BrowserRouter>
        </DataContext.Provider>
      </AuthContext.Provider>
    );

    // Vemos si aparece el nombre del chato en el panel
    expect(screen.getByText(usuarioPrueba.name)).toBeInTheDocument();

    //  Se simula el click en el boton
    const botonLogout = screen.getByTitle('Cerrar sesión');
    await userEvent.click(botonLogout);

    // Vemos si la función logout que va en el boton se ejecutó al menos una vez
    expect(logoutMock).toHaveBeenCalledTimes(1);
});

test('Muestra el enlace de Iniciar Sesión cuando el usuario no está autenticado', () => {

    const authMock = {
        user: null,
        logout: () => {},
    };

    const dataMock = {
        pets: [],
        appointments: [],
        addPet: () => {},
        addAppointment: () => {},
        updateAppointmentStatus: () => {},
    };

    render(
        <AuthContext.Provider value = {authMock}>
            <DataContext.Provider value = {dataMock}>
                <BrowserRouter>
                    <Navbar/>
                </BrowserRouter>
            </DataContext.Provider>
        </AuthContext.Provider>
    );

    //Aca buscamos si aparecio el vitalpet connect ya que es uno de los componentes que siempre esta visible en el navbar
    //independiente de quien este logeado es como una prueba para ver si el componente se renderizó
    const brandElements = screen.getAllByText('VitalPet Connect');
    expect(brandElements.length).toBeGreaterThan(0);

    const loginLinks = screen.getAllByText('Iniciar sesión');
    expect(loginLinks.length).toBeGreaterThan(0);
});

test('Redirige al dashboard si el usuario es un ADMIN', () => {
    const adminUser = seedUsers[0];

    const authMock = {
        user: adminUser,
        logout: () => {}
    }

    const dataMock = {
        pets: [],
        appointments: [],
        addPet: () => {},
        addAppointment: () => {},
        updateAppointmentStatus: () => {},
    };

    render(
      <AuthContext.Provider value={authMock}>
        <DataContext.Provider value={dataMock}>
          <BrowserRouter>
            <Navbar />
          </BrowserRouter>
        </DataContext.Provider>
      </AuthContext.Provider>
    );

    const panelLink = screen.getByTitle(adminUser.name);
    expect(panelLink).toHaveAttribute('href', '/dashboard')
});

test('Permite abrir y cerrar el menu de navegación en la vista de celular', async () => {
    const authMock = {
        user: null,
        logout: () => {},
    };

    const dataMock = {
        pets: [],
        appointments: [],
        addPet: () => {},
        addAppointment: () => {},
        updateAppointmentStatus: () => {},
    };

    render(
      <AuthContext.Provider value={authMock}>
        <DataContext.Provider value={dataMock}>
          <BrowserRouter>
            <Navbar />
          </BrowserRouter>
        </DataContext.Provider>
      </AuthContext.Provider>
    );

    // Buscamos el botón por la etiqueta
    const togglerButton = screen.getAllByRole('button', { name: 'Abrir menú' })[0];
    
    // click abrir
    await userEvent.click(togglerButton);
    expect(togglerButton).toHaveAttribute('aria-expanded', 'true');

    // click cerrar
    await userEvent.click(togglerButton);
    expect(togglerButton).toHaveAttribute('aria-expanded', 'false');
});