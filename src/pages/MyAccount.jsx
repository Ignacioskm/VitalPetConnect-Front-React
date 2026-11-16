import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { DataContext } from "../context/DataContext";
import StatusBadge from "../components/StatusBadge";

const emptyPet = {
  name: "",
  speciesId: "",
  breed: "",
  birthDate: "",
  weight: "",
};

const speciesLabels = {
  DOG: "Perro",
  CAT: "Gato",
  BIRD: "Ave",
  OTHER: "Otro",
};

export default function MyAccount() {
  const { user } = useContext(AuthContext);

  const {
    pets,
    species,
    petsLoading,
    petsError,
    addPet,
    appointments,
    updateAppointmentStatus,
  } = useContext(DataContext);

  const [showAddPet, setShowAddPet] = useState(false);
  const [newPet, setNewPet] = useState(emptyPet);
  const [petError, setPetError] = useState("");
  const [petSuccess, setPetSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const myPets = pets.filter(
    (pet) =>
      Number(pet.ownerId) === Number(user?.id) &&
      pet.active
  );

  const myAppointments = appointments.filter(
    (appointment) => appointment.ownerEmail === user?.email
  );

  const getSpeciesName = (speciesId) => {
    const item = species.find(
      (s) => Number(s.id) === Number(speciesId)
    );

    return (
      speciesLabels[item?.name?.toUpperCase()] ??
      item?.name ??
      "Desconocida"
    );
  };

  const handlePetChange = (e) => {
    const { name, value } = e.target;
    setNewPet((prev) => ({ ...prev, [name]: value }));
  };

  const handleSavePet = async (e) => {
    e.preventDefault();
    setPetError("");
    setPetSuccess("");

    if (!user?.id) {
      setPetError("Debes iniciar sesión.");
      return;
    }

    if (
      !newPet.name.trim() ||
      !newPet.speciesId ||
      !newPet.breed.trim() ||
      !newPet.birthDate ||
      newPet.weight === "" ||
      Number(newPet.weight) <= 0
    ) {
      setPetError("Completa todos los campos.");
      return;
    }

    setSaving(true);

    try {
      await addPet({
        name: newPet.name.trim(),
        speciesId: Number(newPet.speciesId),
        breed: newPet.breed.trim(),
        birthDate: newPet.birthDate,
        weight: Number(newPet.weight),
        ownerId: Number(user.id),
      });

      setNewPet(emptyPet);
      setPetSuccess("Mascota registrada correctamente.");
      setShowAddPet(false);
    } catch (error) {
      setPetError(
        error.response?.data?.message ||
        "No se pudo registrar la mascota."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mt-5 mb-5">
      <h2 className="vp-titulo">
        Hola, {user?.name ?? ""}
      </h2>

      <p className="text-secondary">
        Panel de control de tus mascotas y citas.
      </p>

      <section className="vp-caja mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>Mis Mascotas</h5>

          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => {
              setShowAddPet(!showAddPet);
              setPetError("");
              setPetSuccess("");
            }}
          >
            {showAddPet ? "Cancelar" : "Registrar Mascota"}
          </button>
        </div>

        {petSuccess && (
          <div className="alert alert-success">
            {petSuccess}
          </div>
        )}

        {petsError && (
          <div className="alert alert-danger">
            {petsError}
          </div>
        )}

        {showAddPet && (
          <form
            onSubmit={handleSavePet}
            className="card bg-light border-0 p-3 mb-4"
          >
            <h6>Agregar nueva mascota</h6>

            {petError && (
              <div className="alert alert-danger">
                {petError}
              </div>
            )}

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Nombre</label>
                <input
                  className="form-control"
                  name="name"
                  value={newPet.name}
                  onChange={handlePetChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Especie</label>
                <select
                  className="form-select"
                  name="speciesId"
                  value={newPet.speciesId}
                  onChange={handlePetChange}
                  required
                >
                  <option value="">Seleccionar especie</option>
                  {species.map((s) => (
                    <option key={s.id} value={s.id}>
                      {getSpeciesName(s.id)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Raza</label>
                <input
                  className="form-control"
                  name="breed"
                  value={newPet.breed}
                  onChange={handlePetChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Fecha de nacimiento
                </label>
                <input
                  className="form-control"
                  type="date"
                  name="birthDate"
                  value={newPet.birthDate}
                  onChange={handlePetChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Peso (kg)</label>
                <input
                  className="form-control"
                  type="number"
                  min="0.01"
                  step="0.01"
                  name="weight"
                  value={newPet.weight}
                  onChange={handlePetChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary mt-3"
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar mascota"}
            </button>
          </form>
        )}

        {petsLoading ? (
          <p>Cargando mascotas...</p>
        ) : (
          <div className="table-responsive">
            <table className="table vp-tabla align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Especie</th>
                  <th>Raza</th>
                  <th>Nacimiento</th>
                  <th>Peso</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {myPets.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      No tienes mascotas registradas.
                    </td>
                  </tr>
                ) : (
                  myPets.map((pet) => (
                    <tr key={pet.id}>
                      <td>{pet.id}</td>
                      <td>{pet.name}</td>
                      <td>{getSpeciesName(pet.speciesId)}</td>
                      <td>{pet.breed}</td>
                      <td>{pet.birthDate}</td>
                      <td>{pet.weight} kg</td>
                      <td>
                        <StatusBadge
                          status={
                            pet.active ? "Activo" : "Inactivo"
                          }
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="vp-caja">
        <h5 className="mb-3">Mis Citas</h5>

        <div className="table-responsive">
          <table className="table vp-tabla align-middle">
            <thead>
              <tr>
                <th>Mascota</th>
                <th>Fecha y hora</th>
                <th>Motivo</th>
                <th>Veterinario</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {myAppointments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    No tienes citas agendadas.
                  </td>
                </tr>
              ) : (
                myAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{appointment.petName}</td>
                    <td>
                      {appointment.date} - {appointment.time}
                    </td>
                    <td>{appointment.reason}</td>
                    <td>{appointment.vet}</td>
                    <td>
                      <StatusBadge status={appointment.status} />
                    </td>
                    <td>
                      {["Pendiente", "Confirmada"].includes(
                        appointment.status
                      ) ? (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() =>
                            updateAppointmentStatus(
                              appointment.id,
                              "Cancelada"
                            )
                          }
                        >
                          Cancelar
                        </button>
                      ) : (
                        <span className="text-muted">
                          Sin acciones
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
