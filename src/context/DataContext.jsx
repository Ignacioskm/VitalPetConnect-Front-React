//Mascotas y citas
import { createContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { seedPets, seedAppointments } from '../data/mockData';

export const DataContext = createContext();

const nextId = (list, base = 0) => list.reduce((max,item) => Math.max(max,item.id), base) + 1

export const DataProvieder = ({children}) => {

    const [pets, setPets] = useLocalStorage('vp_pets', seedPets);
    const [appointments, setAppointments] = useLocalStorage('vp_appointments', seedAppointments);

    const addPet = (pet) =>
        setPets((prev) => [...prev, {...pet, id: nextId(prev), active: true}]);

    const deletePet = (id) => setPets ((prev) => prev.filter((p) => p.id !== id));

    const addAppointment = (appointment) => 
        setAppointments((prev) => [
            ...prev,
            {...appointment, id: nextId(prev,100), status: 'Pendiente'},
        ]);

    const updateAppointmentStatus = (id, status) =>
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));

    return (
    <DataContext.Provider
      value={{ pets, appointments, addPet, deletePet, addAppointment, updateAppointmentStatus }}
    >
      {children}
    </DataContext.Provider>
  );
};