// Badge de estado reutilizable: citas (Pendiente, Confirmada, Realizada, Cancelada)
// y mascotas (Activo / Inactivo). Para mascotas: <StatusBadge status={pet.active ? 'Activo' : 'Inactivo'} />
const STATUS_STYLES = {
  Pendiente: 'bg-warning text-dark',
  Confirmada: 'bg-success',
  Realizada: 'bg-secondary',
  Cancelada: 'bg-danger',
  Activo: 'bg-success',
  Inactivo: 'bg-secondary',
};

export default function StatusBadge({ status }) {
  if (!status) return null;

  const style = STATUS_STYLES[status];
  if (!style) {
    console.warn(`StatusBadge: estado desconocido "${status}"`);
  }

  return <span className={`badge ${style ?? 'bg-dark'}`}>{status}</span>;
}