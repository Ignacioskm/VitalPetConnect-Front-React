import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { DataContext } from "../context/DataContext";
import StatusBadge from "../components/StatusBadge";
import { species } from "../data/mockData";
import FormField from "../components/FormField";

export default function MyAccount() {
  const { user } = useContext(AuthContext);
  const { pets, appointments, addPet, updateAppointmentStatus } = useContext(DataContext);

  const correo = user ? user.email : "";

  // Estado para mostrar u ocultar el formulario de nueva mascota en el panel
  const [showAddPet, setShowAddPet] = useState(false);
  const [newPet, setNewPet] = useState({ name: "", species: "", breed: "", age: "" });
  const [petError, setPetError] = useState("");
  const [petSuccess, setPetSuccess] = useState("");

  const handlePetChange = (e) => {
    setNewPet({ ...newPet, [e.target.id]: e.target.value });
  };

  const handleSavePet = (e) => {
    e.preventDefault();
    if (!newPet.name || !newPet.species || !newPet.age) {
      setPetError("Completa los campos obligatorios.");
      return;
    }

    addPet({
      name: newPet.name.trim(),
      species: newPet.species,
      breed: newPet.breed.trim() || "Sin especificar",
      age: Number(newPet.age),
      ownerName: user.name,
      ownerEmail: user.email,
    });

    setPetSuccess("¡Mascota registrada con éxito!");
    setNewPet({ name: "", species: "", breed: "", age: "" });
    setPetError("");
    setTimeout(() => {
      setPetSuccess("");
      setShowAddPet(false);
    }, 1500);
  };

  return (
    <div className="container mt-5 mb-5">
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <div>
          <h2 className="vp-titulo">Hola, {user ? user.name : ""}</h2>
          <p className="text-secondary mb-0">Panel de control y gestión de tus mascotas y citas.</p>
        </div>
      </div>

      <section className="vp-caja mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0"><i className="bi bi-heart-pulse me-2 text-primary"></i>Mis Mascotas</h5>
          <button 
            className="btn btn-sm btn-outline-primary fw-medium"
            onClick={() => setShowAddPet(!showAddPet)}
          >
            <i className={`bi ${showAddPet ? 'bi-x-lg' : 'bi-plus-lg'} me-1`}></i>
            {showAddPet ? 'Cancelar' : 'Registrar Mascota'}
          </button>
        </div>

        {showAddPet && (
          <div className="card bg-light border-0 p-3 mb-4 rounded-3">
            <h6 className="fw-bold text-primary mb-3">Agregar nueva mascota</h6>
            {petError && <div className="alert alert-danger py-1 small">{petError}</div>}
            {petSuccess && <div className="alert alert-success py-1 small">{petSuccess}</div>}
            
            <form onSubmit={handleSavePet}>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <FormField id="name" label="Nombre" value={newPet.name} onChange={handlePetChange} required placeholder="Ej: Toby" />
                </div>
                <div className="col-md-4 mb-3">
                  <FormField id="species" label="Especie" as="select" value={newPet.species} onChange={handlePetChange} options={species} required />
                </div>
                <div className="col-md-4 mb-3">
                  <FormField id="breed" label="Raza" value={newPet.breed} onChange={handlePetChange} placeholder="Ej: Quiltro" />
                </div>
              </div>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <FormField id="age" label="Edad" type="number" value={newPet.age} onChange={handlePetChange} required placeholder="Ej: 2" />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-sm px-4 fw-bold">Guardar Mascota</button>
            </form>
          </div>
        )}

        <div className="table-responsive">
          <table className="table vp-tabla align-middle">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Especie</th>
                <th>Raza</th>
                <th>Edad</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {pets.filter(m => m.ownerEmail === correo).length === 0 ? (
                <tr><td colSpan="5" className="text-center text-muted py-3">No tienes mascotas registradas.</td></tr>
              ) : (
                pets.map((m, i) => {
                  if (m.ownerEmail !== correo) return null;
                  return (
                    <tr key={i}>
                      <td className="fw-medium">{m.name}</td>
                      <td>{m.species}</td>
                      <td>{m.breed}</td>
                      <td>{m.age} años</td>
                      <td><StatusBadge status={m.active ? "Activo" : "Inactivo"} /></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Sección de Citas */}
      <section className="vp-caja">
        <h5 className="mb-3"><i className="bi bi-calendar-check me-2 text-primary"></i>Mis Citas</h5>
        <div className="table-responsive">
          <table className="table vp-tabla align-middle">
            <thead>
              <tr>
                <th>Mascota</th>
                <th>Fecha y Hora</th>
                <th>Motivo</th>
                <th>Veterinario</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {appointments.filter(c => c.ownerEmail === correo).length === 0 ? (
                <tr><td colSpan="6" className="text-center text-muted py-3">No tienes citas agendadas.</td></tr>
              ) : (
                appointments.map((c, i) => {
                  if (c.ownerEmail !== correo) return null;
                  return (
                    <tr key={i}>
                      <td className="fw-medium">{c.petName}</td>
                      <td>{c.date} - {c.time}</td>
                      <td>{c.reason}</td>
                      <td>{c.vet}</td>
                      <td><StatusBadge status={c.status} /></td>
                      <td>
                        {(c.status === "Pendiente" || c.status === "Confirmada") ? (
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => updateAppointmentStatus(c.id, "Cancelada")}
                          >
                            Cancelar
                          </button>
                        ) : (
                          <span className="text-muted small">Sin acciones</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}