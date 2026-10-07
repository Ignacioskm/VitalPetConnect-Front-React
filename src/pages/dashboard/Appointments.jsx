import { useState } from "react";
import { vets } from "../../data/mockData";
import StatusBadge from "../../components/StatusBadge";

const formVacio = { petName: "", date: "", time: "", reason: "", vet: "" };

// devuelve la fecha de hoy en formato aaaa-mm-dd (igual que en la eval 1)
function obtenerFechaHoy() {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return hoy.getFullYear() + "-" + mes + "-" + dia;
}

// pagina de citas: formulario para agendar y tabla con filtro y botones
function Appointments({ citas, setCitas, mascotas }) {
  const [filtro, setFiltro] = useState("Todas");
  const [form, setForm] = useState(formVacio);
  const [errores, setErrores] = useState({});

  function cambiarCampo(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function guardarCita(e) {
    e.preventDefault();

    const nuevosErrores = {};
    let valido = true;

    if (form.petName === "") { nuevosErrores.petName = "Selecciona una mascota."; valido = false; }
    if (form.date === "") {
      nuevosErrores.date = "La fecha es obligatoria."; valido = false;
    } else if (form.date < obtenerFechaHoy()) {
      nuevosErrores.date = "No se puede agendar en una fecha anterior a hoy."; valido = false;
    }
    if (form.time === "") {
      nuevosErrores.time = "La hora es obligatoria."; valido = false;
    } else if (form.time < "09:00" || form.time > "19:00") {
      nuevosErrores.time = "El horario de atencion es de 09:00 a 19:00."; valido = false;
    }
    if (form.reason.trim() === "") { nuevosErrores.reason = "El motivo es obligatorio."; valido = false; }
    if (form.vet === "") { nuevosErrores.vet = "Selecciona un veterinario."; valido = false; }

    setErrores(nuevosErrores);
    if (!valido) return;

    // busco el dueno de la mascota elegida
    let dueno = "";
    for (let i = 0; i < mascotas.length; i++) {
      if (mascotas[i].name === form.petName) {
        dueno = mascotas[i].ownerName;
        break;
      }
    }

    const nueva = { ...form, ownerName: dueno, status: "Pendiente" };
    setCitas([...citas, nueva]);
    setForm(formVacio);
    setFiltro("Todas");
    alert("Cita agendada para " + nueva.petName + ".");
  }

  // cambia el estado de una cita, map devuelve la misma lista pero con esa cita cambiada
  function cambiarEstado(posicion, nuevoEstado) {
    setCitas(citas.map((c, i) => (i === posicion ? { ...c, status: nuevoEstado } : c)));
  }

  return (
    <div>
      <h2 className="vp-titulo">Citas</h2>

      <div className="row g-3">
        <div className="col-12 col-xl-4">
          <form className="vp-caja" onSubmit={guardarCita}>
            <h5>Agendar cita</h5>

            <label className="form-label">Mascota</label>
            <select className="form-select" name="petName" value={form.petName} onChange={cambiarCampo}>
              <option value="">Selecciona</option>
              {mascotas.map((m, i) =>
                m.active ? <option key={i} value={m.name}>{m.name} ({m.ownerName})</option> : null
              )}
            </select>
            {errores.petName && <small className="vp-error">{errores.petName}</small>}

            <label className="form-label mt-2">Fecha</label>
            <input className="form-control" type="date" name="date" value={form.date} onChange={cambiarCampo} />
            {errores.date && <small className="vp-error">{errores.date}</small>}

            <label className="form-label mt-2">Hora</label>
            <input className="form-control" type="time" name="time" value={form.time} onChange={cambiarCampo} />
            {errores.time && <small className="vp-error">{errores.time}</small>}

            <label className="form-label mt-2">Motivo</label>
            <input className="form-control" name="reason" value={form.reason} onChange={cambiarCampo} />
            {errores.reason && <small className="vp-error">{errores.reason}</small>}

            <label className="form-label mt-2">Veterinario</label>
            <select className="form-select" name="vet" value={form.vet} onChange={cambiarCampo}>
              <option value="">Selecciona</option>
              {vets.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
            {errores.vet && <small className="vp-error">{errores.vet}</small>}

            <button type="submit" className="btn btn-primary w-100 mt-3">Agendar</button>
          </form>
        </div>

        <div className="col-12 col-xl-8">
          <section className="vp-caja">
            <select className="form-select w-auto mb-3" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
              <option value="Todas">Todas</option>
              <option value="Pendiente">Pendientes</option>
              <option value="Confirmada">Confirmadas</option>
              <option value="Realizada">Realizadas</option>
              <option value="Cancelada">Canceladas</option>
            </select>

            <div className="table-responsive">
              <table className="table vp-tabla align-middle">
                <thead>
                  <tr>
                    <th>Mascota</th>
                    <th>Dueno</th>
                    <th>Fecha</th>
                    <th>Motivo</th>
                    <th>Veterinario</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {citas.map(function (c, i) {
                    if (filtro !== "Todas" && c.status !== filtro) return null;

                    // los botones cambian segun el estado de la cita
                    let botones = <span className="text-muted">Sin acciones</span>;
                    if (c.status === "Pendiente") {
                      botones = (
                        <>
                          <button className="btn btn-sm btn-success me-1" onClick={() => cambiarEstado(i, "Confirmada")}>Confirmar</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => cambiarEstado(i, "Cancelada")}>Cancelar</button>
                        </>
                      );
                    } else if (c.status === "Confirmada") {
                      botones = (
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => cambiarEstado(i, "Realizada")}>Marcar realizada</button>
                      );
                    }

                    return (
                      <tr key={i}>
                        <td>{c.petName}</td>
                        <td>{c.ownerName}</td>
                        <td>{c.date} {c.time}</td>
                        <td>{c.reason}</td>
                        <td>{c.vet}</td>
                        <td><StatusBadge texto={c.status} /></td>
                        <td>{botones}</td>
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

export default Appointments;
