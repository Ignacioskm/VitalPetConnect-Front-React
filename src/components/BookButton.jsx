import { useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';

import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { services, vets } from '../data/mockData';
import FormField from './FormField';

// Horarios disponibles: 09:00 hasta 18:30
const TIME_SLOTS = Array.from({ length: 20 }, (_, i) => {
  const hour = String(9 + Math.floor(i / 2)).padStart(2, '0');
  return `${hour}:${i % 2 ? '30' : '00'}`;
});

// Fecha actual en formato YYYY-MM-DD
const todayISO = () => {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
};

// Formulario para agendar citas
const EMPTY_FORM = {
  petId: '',
  reason: '',
  date: '',
  time: '',
  vet: '',
};

// Formulario para registrar mascotas
// Campos iguales a los del backend
const EMPTY_PET = {
  name: '',
  speciesId: '',
  breed: '',
  birthDate: '',
  weight: '',
};

// Traducción visual de las especies
const SPECIES_LABELS = {
  DOG: 'Perro',
  CAT: 'Gato',
  BIRD: 'Ave',
  OTHER: 'Otro',
};

export default function BookButton({
  children = 'Agendar cita',
  className = 'btn btn-primary',
  service = '',
}) {
  // Usuario autenticado
  const { user } = useContext(AuthContext);

  // Datos del backend y funciones del contexto
  const {
    pets,
    species,
    petsLoading,
    petsError,
    addPet,
    addAppointment,
  } = useContext(DataContext);

  // Estados del modal
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const [confirmedPetName, setConfirmedPetName] = useState('');

  // Estados del registro de mascotas
  const [newPet, setNewPet] = useState(EMPTY_PET);
  const [petError, setPetError] = useState('');
  const [savingPet, setSavingPet] = useState(false);

  // Mascotas activas del usuario actual
  // Ahora se filtran por ownerId, no por ownerEmail
  const myPets = user
    ? pets.filter(
        (pet) =>
          Number(pet.ownerId) === Number(user.id) &&
          pet.active
      )
    : [];

  // Especies recuperadas desde GET /api/pets/species
  const speciesOptions = species.map((item) => ({
    value: String(item.id),
    label:
      SPECIES_LABELS[item.name.toUpperCase()] ?? item.name,
  }));

  // Abrir modal
  const openModal = () => {
    setForm({
      ...EMPTY_FORM,
      reason: service,
    });

    setNewPet(EMPTY_PET);
    setErrors({});
    setPetError('');
    setDone(false);
    setConfirmedPetName('');
    setOpen(true);
  };

  // Cerrar modal
  const closeModal = () => {
    if (savingPet) return;
    setOpen(false);
  };

  // Bloquear el scroll y permitir cerrar con Escape
  useEffect(() => {
    if (!open) return;

    document.body.classList.add('modal-open');

    const onKey = (e) => {
      if (e.key === 'Escape' && !savingPet) {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', onKey);

    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', onKey);
    };
  }, [open, savingPet]);

  // Cambios del formulario de citas
  const handleChange = (e) => {
    const { id, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [id]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [id]: '',
    }));
  };

  // Cambios del formulario de mascotas
  const handlePetChange = (e) => {
    const { id, value } = e.target;

    setNewPet((prev) => ({
      ...prev,
      [id]: value,
    }));

    setPetError('');
  };

  // Registrar mascota utilizando Axios y Spring Boot
  const handleSavePet = async (e) => {
    e.preventDefault();
    setPetError('');

    if (!user?.id) {
      setPetError('Debes iniciar sesión.');
      return;
    }

    if (
      !newPet.name.trim() ||
      !newPet.speciesId ||
      !newPet.breed.trim() ||
      !newPet.birthDate ||
      newPet.weight === ''
    ) {
      setPetError(
        'Por favor, completa todos los campos de la mascota.'
      );
      return;
    }

    if (newPet.birthDate > todayISO()) {
      setPetError(
        'La fecha de nacimiento no puede ser futura.'
      );
      return;
    }

    if (
      !Number.isFinite(Number(newPet.weight)) ||
      Number(newPet.weight) <= 0
    ) {
      setPetError('Ingresa un peso válido mayor que cero.');
      return;
    }

    setSavingPet(true);

    try {
      // DTO exacto que espera el backend
      const petData = {
        name: newPet.name.trim(),
        breed: newPet.breed.trim(),
        birthDate: newPet.birthDate,
        weight: Number(newPet.weight),
        speciesId: Number(newPet.speciesId),
        ownerId: Number(user.id),
      };

      // POST /api/pets
      // addPet refresca automáticamente el listado
      const createdPet = await addPet(petData);

      // Dejamos seleccionada la mascota recién creada
      setForm((prev) => ({
        ...prev,
        petId: String(createdPet.id),
      }));

      setNewPet(EMPTY_PET);
      setPetError('');
    } catch (error) {
      console.error('Error al registrar mascota:', error);

      setPetError(
        error.response?.data?.message ||
        'No se pudo registrar la mascota. Intenta nuevamente.'
      );
    } finally {
      setSavingPet(false);
    }
  };

  // Validar formulario de reserva
  const validate = () => {
    const err = {};

    if (!form.petId) {
      err.petId = 'Selecciona una mascota.';
    } else if (
      !myPets.some(
        (pet) => Number(pet.id) === Number(form.petId)
      )
    ) {
      err.petId = 'La mascota seleccionada no está disponible.';
    }

    if (!form.reason) {
      err.reason = 'Selecciona el motivo de la consulta.';
    }

    if (!form.vet) {
      err.vet = 'Selecciona un veterinario.';
    }

    if (!form.date) {
      err.date = 'La fecha es obligatoria.';
    } else if (form.date < todayISO()) {
      err.date = 'No puedes agendar en una fecha pasada.';
    }

    if (!form.time) {
      err.time = 'Selecciona una hora.';
    }

    if (
      form.date === todayISO() &&
      form.time &&
      form.time <=
        new Date().toTimeString().slice(0, 5)
    ) {
      err.time = 'Selecciona una hora futura.';
    }

    return err;
  };

  // Agendar cita (todavía con localStorage)
  const handleSubmit = (e) => {
    e.preventDefault();

    const err = validate();
    setErrors(err);

    if (Object.keys(err).length > 0) {
      return;
    }

    const selectedPet = myPets.find(
      (pet) => Number(pet.id) === Number(form.petId)
    );

    if (!selectedPet) {
      setErrors({
        petId: 'No se encontró la mascota seleccionada.',
      });
      return;
    }

    // Se conserva petName para las otras pantallas
    // y se agrega petId para una futura integración
    addAppointment({
      petId: selectedPet.id,
      petName: selectedPet.name,
      ownerId: Number(user.id),
      ownerName: user.name,
      ownerEmail: user.email,
      date: form.date,
      time: form.time,
      reason: form.reason,
      vet: form.vet,
    });

    setConfirmedPetName(selectedPet.name);
    setDone(true);
  };

  // Contenido del modal
  const renderBody = () => {
    // Usuario no autenticado
    if (!user) {
      return (
        <div className="text-center py-3">
          <p className="text-secondary">
            Debes iniciar sesión para agendar una cita.
          </p>

          <Link
            to="/login"
            className="btn btn-primary"
            onClick={closeModal}
          >
            Iniciar sesión
          </Link>
        </div>
      );
    }

    // Reserva realizada correctamente
    if (done) {
      return (
        <div className="text-center py-3">
          <i className="bi bi-check-circle-fill text-success fs-1" />

          <p className="fw-semibold mt-2 mb-1">
            ¡Cita solicitada para {confirmedPetName}!
          </p>

          <p className="text-secondary small">
            Quedó en estado Pendiente hasta que la clínica
            la confirme.
          </p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={closeModal}
          >
            Cerrar
          </button>
        </div>
      );
    }

    // Esperar a que carguen las mascotas desde Spring Boot
    if (petsLoading) {
      return (
        <div className="text-center py-4">
          <div
            className="spinner-border text-primary"
            role="status"
          >
            <span className="visually-hidden">
              Cargando...
            </span>
          </div>

          <p className="text-secondary mt-3">
            Cargando tus mascotas...
          </p>
        </div>
      );
    }

    // Error al consultar el backend
    if (petsError) {
      return (
        <div className="alert alert-danger">
          {petsError}
        </div>
      );
    }

    // Si no tiene mascotas, mostrar registro
    if (myPets.length === 0) {
      return (
        <form onSubmit={handleSavePet} noValidate>
          <div className="text-center mb-3">
            <h6 className="fw-bold text-primary">
              ¡Registra a tu compañero!
            </h6>

            <p className="text-secondary small">
              No tienes mascotas registradas.
              Agrega una rápidamente para poder agendar
              tu cita.
            </p>
          </div>

          {petError && (
            <div className="alert alert-danger py-2 small">
              {petError}
            </div>
          )}

          <FormField
            id="name"
            label="Nombre"
            value={newPet.name}
            onChange={handlePetChange}
            placeholder="Ej: Firulais"
            required
          />

          <div className="row">
            <div className="col-md-6">
              <FormField
                id="speciesId"
                label="Especie"
                as="select"
                value={newPet.speciesId}
                onChange={handlePetChange}
                options={speciesOptions}
                placeholder="Selecciona una especie..."
                required
              />
            </div>

            <div className="col-md-6">
              <FormField
                id="breed"
                label="Raza"
                value={newPet.breed}
                onChange={handlePetChange}
                placeholder="Ej: Labrador"
                required
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <FormField
                id="birthDate"
                label="Fecha de nacimiento"
                type="date"
                max={todayISO()}
                value={newPet.birthDate}
                onChange={handlePetChange}
                required
              />
            </div>

            <div className="col-md-6">
              <FormField
                id="weight"
                label="Peso (kg)"
                type="number"
                min="0.01"
                step="0.01"
                value={newPet.weight}
                onChange={handlePetChange}
                placeholder="Ej: 12.5"
                required
              />
            </div>
          </div>

          <div className="d-grid gap-2 mt-2">
            <button
              type="submit"
              className="btn btn-success fw-bold py-2"
              disabled={savingPet || species.length === 0}
            >
              {savingPet
                ? 'Guardando mascota...'
                : 'Guardar y Continuar'}
            </button>

            <button
              type="button"
              className="btn btn-light fw-medium py-2"
              onClick={closeModal}
              disabled={savingPet}
            >
              Cancelar
            </button>
          </div>
        </form>
      );
    }

    // Formulario para reservar una cita
    return (
      <form onSubmit={handleSubmit} noValidate>
        <FormField
          id="petId"
          label="Mascota"
          as="select"
          value={form.petId}
          onChange={handleChange}
          error={errors.petId}
          options={myPets.map((pet) => ({
            value: String(pet.id),
            label: pet.name,
          }))}
          placeholder="Selecciona una mascota..."
          required
        />

        <FormField
          id="reason"
          label="Motivo de la consulta"
          as="select"
          value={form.reason}
          onChange={handleChange}
          error={errors.reason}
          options={services.map((item) => ({
            value: item.title,
            label: `${item.title} - $${item.price.toLocaleString(
              'es-CL'
            )}`,
          }))}
          placeholder="Selecciona un motivo..."
          required
        />

        <FormField
          id="vet"
          label="Veterinario"
          as="select"
          value={form.vet}
          onChange={handleChange}
          error={errors.vet}
          options={vets}
          placeholder="Selecciona un especialista..."
          required
        />

        <div className="row">
          <div className="col-7">
            <FormField
              id="date"
              label="Fecha"
              type="date"
              min={todayISO()}
              value={form.date}
              onChange={handleChange}
              error={errors.date}
              required
            />
          </div>

          <div className="col-5">
            <FormField
              id="time"
              label="Hora"
              as="select"
              value={form.time}
              onChange={handleChange}
              error={errors.time}
              options={TIME_SLOTS}
              placeholder="Hora..."
              required
            />
          </div>
        </div>

        <div className="d-grid gap-2">
          <button
            type="submit"
            className="btn btn-primary fw-medium py-2"
          >
            Confirmar cita
          </button>

          <button
            type="button"
            className="btn btn-light fw-medium py-2"
            onClick={closeModal}
          >
            Cancelar
          </button>
        </div>
      </form>
    );
  };

  // Botón + modal
  return (
    <>
      <button
        type="button"
        className={className}
        onClick={openModal}
      >
        {children}
      </button>

      {open &&
        createPortal(
          <>
            <div
              className="modal fade show d-block"
              tabIndex="-1"
              role="dialog"
              aria-modal="true"
              aria-labelledby="bookModalLabel"
              onClick={closeModal}
            >
              <div
                className="modal-dialog modal-dialog-centered"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-content rounded-4 border-0 shadow">
                  <div className="modal-header border-bottom-0 pb-0">
                    <h1
                      className="modal-title fs-4 fw-bold text-dark"
                      id="bookModalLabel"
                    >
                      Agendar nueva cita
                    </h1>

                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Cerrar"
                      onClick={closeModal}
                      disabled={savingPet}
                    />
                  </div>

                  <div className="modal-body">
                    {renderBody()}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-backdrop fade show" />
          </>,
          document.body
        )}
    </>
  );
}
