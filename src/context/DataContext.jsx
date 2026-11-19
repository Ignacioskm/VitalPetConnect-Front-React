import {
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

import { petsService } from "../api/petsService";
import { appointmentsService } from "../api/appointmentsService";

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [pets, setPets] = useState([]);
  const [species, setSpecies] = useState([]);
  const [petsLoading, setPetsLoading] = useState(true);
  const [petsError, setPetsError] = useState("");

  // las citas ahora vienen del ms de citas
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState("");

  const refreshPets = useCallback(async () => {
    setPetsLoading(true);
    setPetsError("");

    try {
      const [petsData, speciesData] = await Promise.all([
        petsService.getAll(),
        petsService.getSpecies(),
      ]);

      setPets(petsData);
      setSpecies(speciesData);
    } catch (error) {
      console.error(error);
      setPetsError(
        error.response?.data?.message ||
        "No se pudo conectar con el backend de mascotas."
      );
    } finally {
      setPetsLoading(false);
    }
  }, []);

  // carga las citas desde el ms de citas
  const refreshAppointments = useCallback(async () => {
    setAppointmentsLoading(true);
    setAppointmentsError("");

    try {
      const data = await appointmentsService.getAll();
      setAppointments(data);
    } catch (error) {
      console.error(error);
      setAppointmentsError(
        error.response?.data?.message ||
        "No se pudo conectar con el backend de citas."
      );
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPets();
    refreshAppointments();
  }, [refreshPets, refreshAppointments]);

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

  // el back le pone el id y el status Pendiente
  // si falla dejo que el error suba para mostrarlo en el componente
  const addAppointment = async (appointment) => {
    const created = await appointmentsService.create(appointment);
    await refreshAppointments();
    return created;
  };

  // el back responde 409 si la transicion de estado no es valida
  const updateAppointmentStatus = async (id, status) => {
    const updated = await appointmentsService.updateStatus(id, status);
    await refreshAppointments();
    return updated;
  };

  return (
    <DataContext.Provider
      value={{
        pets,
        species,
        petsLoading,
        petsError,
        refreshPets,
        addPet,
        updatePet,
        deletePet,
        appointments,
        appointmentsLoading,
        appointmentsError,
        refreshAppointments,
        addAppointment,
        updateAppointmentStatus,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};