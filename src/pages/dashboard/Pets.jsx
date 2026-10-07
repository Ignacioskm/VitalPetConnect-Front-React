import { useState } from "react";
import { species } from "../../data/mockData";
import { isValidEmail } from "../../utils/validaciones";
import StatusBadge from "../../components/StatusBadge";

// formulario vacio, se usa al partir y para limpiar despues de guardar
const formVacio = { name: "", species: "", breed: "", age: "", ownerName: "", ownerEmail: "" };

// pagina de mascotas: formulario para registrar y tabla con buscador
// la lista y la funcion para cambiarla llegan por props desde App
function Pets({ mascotas, setMascotas }) {
  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState(formVacio);
  const [errores, setErrores] = useState({});

  // un solo manejador para todos los inputs, usa el name de cada input
  function cambiarCampo(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function guardarMascota(e) {
    e.preventDefault(); // para que no se recargue la pagina

    const nuevosErrores = {};
    let valido = true;

    if (form.name.trim() === "") { nuevosErrores.name = "El nombre es obligatorio."; valido = false; }
    if (form.species === "") { nuevosErrores.species = "Selecciona una especie."; valido = false; }
    if (form.age === "" || Number(form.age) < 0 || Number(form.age) > 30) {
      nuevosErrores.age = "Ingresa una edad entre 0 y 30."; valido = false;
    }
    if (form.ownerName.trim() === "") { nuevosErrores.ownerName = "El nombre del dueno es obligatorio."; valido = false; }
    if (!isValidEmail(form.ownerEmail)) {
      nuevosErrores.ownerEmail = "Solo correos @gmail.com, @duocuc.cl o @profesor.duoc.cl."; valido = false;
    }

    setErrores(nuevosErrores);
    if (!valido) return;

    // busco el id mas grande para que el nuevo sea +1
    let ultimoId = 0;
    for (let i = 0; i < mascotas.length; i++) {
      if (mascotas[i].id > ultimoId) ultimoId = mascotas[i].id;
    }

    let raza = form.breed.trim();
    if (raza === "") raza = "Sin especificar";

    const nueva = { ...form, id: ultimoId + 1, breed: raza, age: Number(form.age), active: true };

    // no uso push, creo una lista nueva con la mascota al final (asi react se entera del cambio)
    setMascotas([...mascotas, nueva]);
    setForm(formVacio);
    alert("Mascota registrada correctamente.");
  }

  function eliminarMascota(posicion) {
    if (!confirm("Seguro que quieres eliminar esta mascota?")) return;
    // filter deja todas menos la de esa posicion
    setMascotas(mascotas.filter((m, i) => i !== posicion));
  }

  return (
    <div>
      <h2 className="vp-titulo">Mascotas</h2>

      <div className="row g-3">
        {/* en pc el formulario va a la izquierda y la tabla a la derecha, en celular uno abajo del otro */}
        <div className="col-12 col-xl-4">
          <form className="vp-caja" onSubmit={guardarMascota}>
            <h5>Registrar mascota</h5>

            <label className="form-label">Nombre</label>
            <input className="form-control" name="name" value={form.name} onChange={cambiarCampo} />
            {errores.name && <small className="vp-error">{errores.name}</small>}

            <label className="form-label mt-2">Especie</label>
            <select className="form-select" name="species" value={form.species} onChange={cambiarCampo}>
              <option value="">Selecciona</option>
              {species.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {errores.species && <small className="vp-error">{errores.species}</small>}

            <label className="form-label mt-2">Raza (opcional)</label>
            <input className="form-control" name="breed" value={form.breed} onChange={cambiarCampo} />

            <label className="form-label mt-2">Edad</label>
            <input className="form-control" type="number" name="age" value={form.age} onChange={cambiarCampo} />
            {errores.age && <small className="vp-error">{errores.age}</small>}

            <label className="form-label mt-2">Dueno</label>
            <input className="form-control" name="ownerName" value={form.ownerName} onChange={cambiarCampo} />
            {errores.ownerName && <small className="vp-error">{errores.ownerName}</small>}

            <label className="form-label mt-2">Correo del dueno</label>
            <input className="form-control" name="ownerEmail" value={form.ownerEmail} onChange={cambiarCampo} />
            {errores.ownerEmail && <small className="vp-error">{errores.ownerEmail}</small>}

            <button type="submit" className="btn btn-primary w-100 mt-3">Guardar</button>
          </form>
        </div>

        <div className="col-12 col-xl-8">
          <section className="vp-caja">
            <input
              className="form-control mb-3"
              placeholder="Buscar por nombre o dueno..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />

            <div className="table-responsive">
              <table className="table vp-tabla align-middle">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Especie</th>
                    <th>Raza</th>
                    <th>Edad</th>
                    <th>Dueno</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {mascotas.map(function (m, i) {
                    // si hay busqueda y no calza ni el nombre ni el dueno, no se muestra
                    const texto = busqueda.toLowerCase();
                    if (!m.name.toLowerCase().includes(texto) && !m.ownerName.toLowerCase().includes(texto)) {
                      return null;
                    }
                    return (
                      <tr key={i}>
                        <td>{m.name}</td>
                        <td>{m.species}</td>
                        <td>{m.breed}</td>
                        <td>{m.age}</td>
                        <td>{m.ownerName}</td>
                        <td><StatusBadge texto={m.active ? "Activo" : "Inactivo"} /></td>
                        <td>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => eliminarMascota(i)}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Pets;
