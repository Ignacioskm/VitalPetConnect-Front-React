// Botón + modal para reservar cita (modal controlado con estado, no necesita JS de Bootstrap).
// Uso: <BookButton className="btn btn-primary">Agendar cita</BookButton>
//      <BookButton service="Vacunación" className="...">Agendar cita</BookButton>
import { useContext, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { services } from '../data/mockData';
import FormField from './FormField';


// 09:00, 09:30 ... 18:30
const TIME_SLOTS = Array.from({ length: 20 }, (_, i) => {
  const hour = String(9 + Math.floor(i / 2)).padStart(2, '0');
  return `${hour}:${i % 2 ? '30' : '00'}`;
});

const todayISO = () => {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

const EMPTY_FORM = { petName: '', reason: '', date: '', time: '' };

export default function BookButton({ children = 'Agendar cita', className = 'btn btn-primary', service = '' }) {
  const { user } = useContext(AuthContext);
  const { pets, addAppointment } = useContext(DataContext);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);

  // Solo las mascotas activas del usuario logueado
  const myPets = user ? pets.filter((p) => p.ownerEmail === user.email && p.active) : [];

  const openModal = () => {
    setForm({ ...EMPTY_FORM, reason: service });
    setErrors({});
    setDone(false);
    setOpen(true);
  };
  const closeModal = () => setOpen(false);

  // Bloquea el scroll del fondo y cierra con Escape
  useEffect(() => {
    if (!open) return;
    document.body.classList.add('modal-open');
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));

  const validate = () => {
    const err = {};
    if (!form.petName) err.petName = 'Selecciona una mascota.';
    if (!form.reason) err.reason = 'Selecciona el motivo de la consulta.';
    if (!form.date) err.date = 'La fecha es obligatoria.';
    else if (form.date < todayISO()) err.date = 'No puedes agendar en una fecha pasada.';
    if (!form.time) err.time = 'Selecciona una hora.';
    return err;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length > 0) return;

    addAppointment({
      petName: form.petName,
      ownerName: `${user.name}`,
      ownerEmail: user.email,
      date: form.date,
      time: form.time,
      reason: form.reason,
      vet: 'Por asignar',
    });
    setDone(true);
  };

  const renderBody = () => {
    if (!user) {
      return (
        <div className="text-center py-3">
          <p className="text-secondary">Debes iniciar sesión para agendar una cita.</p>
          <Link to="/login" className="btn btn-primary" onClick={closeModal}>
            Iniciar sesión
          </Link>
        </div>
      );
    }

    if (done) {
      return (
        <div className="text-center py-3">
          <i className="bi bi-check-circle-fill text-success fs-1"></i>
          <p className="fw-semibold mt-2 mb-1">¡Cita solicitada para {form.petName}!</p>
          <p className="text-secondary small">Quedó en estado Pendiente hasta que la clínica la confirme.</p>
          <button type="button" className="btn btn-primary" onClick={closeModal}>
            Cerrar
          </button>
        </div>
      );
    }

    if (myPets.length === 0) {
      return (
        <p className="text-secondary text-center py-3">
          No tienes mascotas registradas. Contacta a la clínica para registrar a tu mascota.
        </p>
      );
    }

    return (
      <form onSubmit={handleSubmit} noValidate>
        <FormField
          id="petName"
          label="Mascota"
          as="select"
          value={form.petName}
          onChange={handleChange}
          error={errors.petName}
          options={myPets.map((p) => p.name)}
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
          options={services.map((s) => ({
            value: s.title,
            label: `${s.title} - $${s.price.toLocaleString('es-CL')}`,
          }))}
          placeholder="Selecciona un motivo..."
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
          <button type="submit" className="btn btn-primary fw-medium py-2">Confirmar cita</button>
          <button type="button" className="btn btn-light fw-medium py-2" onClick={closeModal}>Cancelar</button>
        </div>
      </form>
    );
  };

  return (
    <>
      <button type="button" className={className} onClick={openModal}>
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
              <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content rounded-4 border-0 shadow">
                  <div className="modal-header border-bottom-0 pb-0">
                    <h1 className="modal-title fs-4 fw-bold text-dark" id="bookModalLabel">
                      Agendar nueva cita
                    </h1>
                    <button type="button" className="btn-close" aria-label="Cerrar" onClick={closeModal} />
                  </div>
                  <div className="modal-body">{renderBody()}</div>
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