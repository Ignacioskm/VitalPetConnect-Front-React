import {
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

import { useLocalStorage } from "../hooks/useLocalStorage";
import { seedAppointments } from "../data/mockData";
import { petsService } from "../api/petsService";

export const DataContext = createContext();

const nextId = (list, base = 0) =>
  list.reduce((max, item) => Math.max(max, item.id), base) + 1;

export const DataProvider = ({ children }) => {
  const [pets, setPets] = useState([]);
  const [species, setSpecies] = useState([]);
  const [petsLoading, setPetsLoading] = useState(true);
  const [petsError, setPetsError] = useState("");

  // Las citas siguen siendo simuladas.
  const [appointments, setAppointments] = useLocalStorage(
    "vp_appointments",
    seedAppointments
  );

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

  useEffect(() => {
    refreshPets();
  }, [refreshPets]);

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

  const addAppointment = (appointment) => {
    setAppointments((prev) => [
      ...prev,
      {
        ...appointment,
        id: nextId(prev, 100),
        status: "Pendiente",
      },
    ]);
  };

  const updateAppointmentStatus = (id, status) => {
    setAppointments((prev) =>
      prev.map((appointment) =>
        appointment.id === id
          ? { ...appointment, status }
          : appointment
      )
    );
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
        addAppointment,
        updateAppointmentStatus,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};