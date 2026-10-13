import { useContext, useState } from "react";
import { DataContext } from "../../context/DataContext";
import StatusBadge from "../../components/StatusBadge";

// pagina de inicio del panel, la misma de la eval 1 pero en react
// los datos ya no llegan por props, los saco del DataContext
export default function DashHome() {
  // del context saco las listas de mascotas y citas
  const { pets, appointments } = useContext(DataContext);

  // estado del filtro de la tabla, parte mostrando todas
  const [filtro, setFiltro] = useState("Todas");

  // cuento las mascotas activas y las citas pendientes y confirmadas
  let activas = 0;
  for (let i = 0; i < pets.length; i++) {
    if (pets[i].active === true) activas++;
  }

  let pendientes = 0;
  let confirmadas = 0;
  for (let i = 0; i < appointments.length; i++) {
    if (appointments[i].status === "Pendiente") pendientes++;
    if (appointments[i].status === "Confirmada") confirmadas++;
  }

  return (
    <div>
      <h2 className="vp-titulo">Panel de administracion</h2>

      {/* las 4 tarjetas del resumen */}
      <section className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="vp-tarjeta d-flex justify-content-between align-items-center">
            <div>
              <p className="vp-etiqueta">Mascotas</p>
              <p className="vp-numero">{pets.length}</p>
            </div>
            <div className="vp-icono"><i className="bi bi-heart-pulse"></i></div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="vp-tarjeta d-flex justify-content-between align-items-center">
            <div>
              <p className="vp-etiqueta">Fichas activas</p>
              <p className="vp-numero">{activas}</p>
            </div>
            <div className="vp-icono azul"><i className="bi bi-clipboard2-pulse"></i></div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="vp-tarjeta d-flex justify-content-between align-items-center">
            <div>
              <p className="vp-etiqueta">Citas pendientes</p>
              <p className="vp-numero">{pendientes}</p>
            </div>
            <div className="vp-icono amarillo"><i className="bi bi-hourglass-split"></i></div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="vp-tarjeta d-flex justify-content-between align-items-center">
            <div>
              <p className="vp-etiqueta">Citas confirmadas</p>
              <p className="vp-numero">{confirmadas}</p>
            </div>
            <div className="vp-icono rojo"><i className="bi bi-calendar-check"></i></div>
          </div>
        </div>
      </section>

      <section className="vp-caja">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <h5 className="mb-0">Proximas citas</h5>

          {/* al cambiar el select cambia el estado y se vuelve a pintar la tabla */}
          <select
            className="form-select form-select-sm w-auto"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          >
            <option value="Todas">Todas</option>
            <option value="Pendiente">Pendientes</option>
            <option value="Confirmada">Confirmadas</option>
            <option value="Realizada">Realizadas</option>
            <option value="Cancelada">Canceladas</option>
          </select>
        </div>

        <div className="table-responsive">
          <table className="table vp-tabla align-middle">
            <thead>
              <tr>
                <th>Mascota</th>
                <th>Dueno</th>
                <th>Fecha</th>
                <th>Veterinario</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(function (c, i) {
                // si no calza con el filtro no se muestra
                if (filtro !== "Todas" && c.status !== filtro) return null;
                return (
                  <tr key={i}>
                    <td>{c.petName}</td>
                    <td>{c.ownerName}</td>
                    <td>{c.date} {c.time}</td>
                    <td>{c.vet}</td>
                    <td><StatusBadge status={c.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
