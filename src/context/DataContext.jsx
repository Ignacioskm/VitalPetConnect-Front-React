import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from './AuthContext';
import { petsService } from '../api/petsService';
import { appointmentsService } from '../api/appointmentsService';
import { usersService } from '../api/usersService';

export const DataContext = createContext();

export function DataProvider({ children }) {
  const { user } = useContext(AuthContext) ?? {};
  const userId = user?.id;
  const role = user?.role;
  const generation = useRef(0);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [pets, setPets] = useState([]);
  const [species, setSpecies] = useState([]);
  const [petsLoading, setPetsLoading] = useState(false);
  const [petsError, setPetsError] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState('');

  const refreshUsers = useCallback(async () => {
    const currentGeneration = generation.current;
    if (!userId || role !== 'admin') {
      setUsers([]);
      setUsersLoading(false);
      setUsersError('');
      return;
    }
    setUsersLoading(true);
    setUsersError('');
    try {
      const data = await usersService.getAll();
      if (generation.current === currentGeneration) {
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      if (generation.current === currentGeneration) {
        setUsers([]);
        setUsersError(error.response?.data?.message || 'No se pudo cargar el listado real de usuarios.');
      }
    } finally {
      if (generation.current === currentGeneration) setUsersLoading(false);
    }
  }, [userId, role]);

  const refreshPets = useCallback(async () => {
    const currentGeneration = generation.current;
    if (!userId) {
      setPets([]);
      setPetsLoading(false);
      setPetsError('');
      return;
    }
    setPetsLoading(true);
    setPetsError('');
    try {
      const data = role === 'admin'
        ? await petsService.getAll()
        : await petsService.getByOwner(userId);
      if (generation.current === currentGeneration) setPets(data);
    } catch (error) {
      if (generation.current === currentGeneration) {
        setPets([]);
        setPetsError(error.response?.data?.message || 'No se pudieron cargar las mascotas.');
      }
    } finally {
      if (generation.current === currentGeneration) setPetsLoading(false);
    }
  }, [userId, role]);

  const refreshAppointments = useCallback(async () => {
    const currentGeneration = generation.current;
    if (!userId) {
      setAppointments([]);
      setAppointmentsLoading(false);
      setAppointmentsError('');
      return;
    }
    setAppointmentsLoading(true);
    setAppointmentsError('');
    try {
      const data = role === 'admin'
        ? await appointmentsService.getAll()
        : await appointmentsService.getByOwner(userId);
      if (generation.current === currentGeneration) setAppointments(data);
    } catch (error) {
      if (generation.current === currentGeneration) {
        setAppointments([]);
        setAppointmentsError(error.response?.data?.message || 'No se pudieron cargar las citas.');
      }
    } finally {
      if (generation.current === currentGeneration) setAppointmentsLoading(false);
    }
  }, [userId, role]);

  useEffect(() => {
    generation.current += 1;
    setPets([]);
    setAppointments([]);
    setUsers([]);
    setPetsError('');
    setAppointmentsError('');
    // Catalogo publico, funciona incluso sin iniciar sesion.
    petsService.getSpecies()
      .then(setSpecies)
      .catch(() => setSpecies([]));
    refreshPets();
    refreshAppointments();
    refreshUsers();
  }, [refreshPets, refreshAppointments, refreshUsers]);

  const addPet = async (pet) => {
    const created = await petsService.create(pet);
    await refreshPets();
    return created;
  };

  const updatePet = async (id, pet) => {
    const updated = await petsService.update(id, pet);
    await refreshPets();
    return updated;
  };

  const deletePet = async (id) => {
    await petsService.remove(id);
    await refreshPets();
  };

  const addAppointment = async (appointment) => {
    const created = await appointmentsService.create(appointment);
    await refreshAppointments();
    return created;
  };

  const updateAppointmentStatus = async (id, status) => {
    const updated = await appointmentsService.updateStatus(id, status);
    await refreshAppointments();
    return updated;
  };

  return (
    <DataContext.Provider value={{
      users, usersLoading, usersError, refreshUsers,
      pets, species, petsLoading, petsError, refreshPets, addPet, updatePet, deletePet,
      appointments, appointmentsLoading, appointmentsError,
      refreshAppointments, addAppointment, updateAppointmentStatus,
    }}>
      {children}
    </DataContext.Provider>
  );
}
