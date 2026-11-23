import { useContext, useState } from "react";
import { DataContext } from "../../context/DataContext";
import StatusBadge from "../../components/StatusBadge";

const emptyForm = {
  name: "",
  speciesId: "",
  breed: "",
  birthDate: "",
  weight: "",
  ownerId: "",
};

export default function Pets() {
  const {
    pets,
    users,
    usersLoading,
    usersError,
    species,
    petsLoading,
    petsError,
    addPet,
    deletePet,
  } = useContext(DataContext);

  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const getOwner = (ownerId) => {
    if (ownerId == null) return "Sin propietario";

    const owner = users.find(
      (u) => Number(u.id) === Number(ownerId)
    );

    return owner ? owner.name : `Usuario #${ownerId}`;
  };

  const getSpecies = (speciesId) => {
    const item = species.find(
      (s) => Number(s.id) === Number(speciesId)
    );

    const labels = {
      DOG: "Perro",
      CAT: "Gato",
      BIRD: "Ave",
      OTHER: "Otro",
    };

    return labels[item?.name?.toUpperCase()] ?? item?.name ?? "—";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !form.name.trim() ||
      !form.breed.trim() ||
      !form.speciesId ||
      !form.birthDate ||
      form.weight === "" ||
      Number(form.weight) <= 0
    ) {
      setError("Completa los campos obligatorios.");
      return;
    }

    if (usersError || usersLoading || users.length === 0) {
      setError("No se puede registrar una mascota sin el listado real de propietarios.");
      return;
    }
    if (!form.ownerId || !users.some((u) => Number(u.id) === Number(form.ownerId) && String(u.role).toUpperCase() === "CLIENT")) {
      setError("Selecciona un propietario CLIENT válido.");
      return;
    }

    setSaving(true);

    try {
      await addPet({
        name: form.name.trim(),
        speciesId: Number(form.speciesId),
        breed: form.breed.trim(),
        birthDate: form.birthDate,
        weight: Number(form.weight),
        ownerId: Number(form.ownerId),
      });

      setForm(emptyForm);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "No se pudo registrar la mascota."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Desactivar esta mascota?")) return;

    try {
      await deletePet(id);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "No se pudo desactivar la mascota."
      );
    }
  };

  const filteredPets = pets.filter((pet) => {
    const text = search.toLowerCase();

    return (
      pet.name.toLowerCase().includes(text) ||
      getOwner(pet.ownerId).toLowerCase().includes(text)
    );
  });

  return (
    <div>
      <h2 className="vp-titulo">Mascotas</h2>

      <div className="row g-3">
        <div className="col-12 col-xl-4">
          <form className="vp-caja" onSubmit={handleSubmit}>
            <h5>Registrar mascota</h5>

            {error && (
              <div className="alert alert-danger">{error}</div>
            )}

            <label className="form-label">Nombre</label>
            <input
              className="form-control"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <label className="form-label mt-2">Especie</label>
            <select
              className="form-select"
              name="speciesId"
              value={form.speciesId}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona una especie</option>
              {species.map((s) => (
                <option key={s.id} value={s.id}>
                  {getSpecies(s.id)}
                </option>
              ))}
            </select>

            <label className="form-label mt-2">Raza</label>
            <input
              className="form-control"
              name="breed"
              value={form.breed}
              onChange={handleChange}
              required
            />

            <label className="form-label mt-2">
              Fecha de nacimiento
            </label>
            <input
              className="form-control"
              type="date"
              name="birthDate"
              max={new Date().toLocaleDateString("en-CA")}
              value={form.birthDate}
              onChange={handleChange}
              required
            />

            <label className="form-label mt-2">
              Peso (kg)
            </label>
            <input
              className="form-control"
              type="number"
              min="0.01"
              step="0.01"
              name="weight"
              value={form.weight}
              onChange={handleChange}
              required
            />

            <label className="form-label mt-2">
              Propietario
            </label>
            <select
              className="form-select"
              name="ownerId"
              value={form.ownerId}
              onChange={handleChange}
            >
              <option value="">Selecciona un propietario</option>
              {users
                .filter((u) => String(u.role).toUpperCase() === "CLIENT")
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} (ID: {u.id})
                  </option>
                ))}
            </select>

            {usersLoading && <p className="text-muted small">Cargando propietarios...</p>}
            {usersError && <div className="alert alert-warning">{usersError}</div>}

            <button
              className="btn btn-primary w-100 mt-3"
              disabled={saving || usersLoading || Boolean(usersError)}
            >
              {saving ? "Guardando..." : "Guardar mascota"}
            </button>
          </form>
        </div>

        <div className="col-12 col-xl-8">
          <section className="vp-caja">
            <input
              className="form-control mb-3"
              placeholder="Buscar por mascota o propietario..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {petsLoading && <p>Cargando mascotas...</p>}
            {petsError && (
              <div className="alert alert-danger">
                {petsError}
              </div>
            )}

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
                    <th>Propietario</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPets.map((pet) => (
                    <tr key={pet.id}>
                      <td>{pet.id}</td>
                      <td>{pet.name}</td>
                      <td>{getSpecies(pet.speciesId)}</td>
                      <td>{pet.breed}</td>
                      <td>{pet.birthDate}</td>
                      <td>{pet.weight} kg</td>
                      <td>{getOwner(pet.ownerId)}</td>
                      <td>
                        <StatusBadge
                          status={pet.active ? "Activo" : "Inactivo"}
                        />
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(pet.id)}
                        >
                          Desactivar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!petsLoading && filteredPets.length === 0 && (
                    <tr>
                      <td colSpan="9" className="text-center">
                        No hay mascotas registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
