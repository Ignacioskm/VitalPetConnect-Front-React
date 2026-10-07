import { useState } from "react";
import StatusBadge from "../../components/StatusBadge";
import TarjetaResumen from "../../components/TarjetaResumen";

// pagina de inicio del panel, la misma de la eval 1 pero en react
// las listas de mascotas y citas llegan por props desde App
function DashHome({ mascotas, citas }) {
  // estado del filtro de la tabla, parte mostrando todas
  const [filtro, setFiltro] = useState("Todas");

  // contamos las mascotas activas y las citas pendientes y confirmadas
  let activas = 0;
  for (let i = 0; i < mascotas.length; i++) {
    if (mascotas[i].active === true) activas++;
  }

  let pendientes = 0;
  let confirmadas = 0;
  for (let i = 0; i < citas.length; i++) {
    if (citas[i].status === "Pendiente") pendientes++;
    if (citas[i].status === "Confirmada") confirmadas++;
  }

  return (
    <div>
      <h2 className="vp-titulo">Panel de administracion</h2>

      {/* uso el mismo componente 4 veces y solo cambio las props */}
      <section className="row g-3 mb-4">
        <TarjetaResumen titulo="Mascotas" numero={mascotas.length} icono="bi-heart-pulse" />
        <TarjetaResumen titulo="Fichas activas" numero={activas} icono="bi-clipboard2-pulse" color="azul" />
        <TarjetaResumen titulo="Citas pendientes" numero={pendientes} icono="bi-hourglass-split" color="amarillo" />
        <TarjetaResumen titulo="Citas confirmadas" numero={confirmadas} icono="bi-calendar-check" color="rojo" />
      </section>

      <section className="vp-caja">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <h5 className="mb-0">Proximas citas</h5>

          {/* al cambiar el select cambia el estado y se vuelve a pintar la tabla */}
          <select className="form-select form-select-sm w-auto" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="Todas">Todas</option>
            <option value="Pendiente">Pendientes</option>
            <option value="Confirmada">Confirmadas</option>
            <option value="Realizada">Realizadas</option>
            <option value="Cancelada">Canceladas</option>
          </select>
        </div>

        {/* table-responsive para que en el celular la tabla se mueva de lado */}
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
              {citas.map(function (c, i) {
                // si no calza con el filtro no se muestra
                if (filtro !== "Todas" && c.status !== filtro) return null;
                return (
                  <tr key={i}>
                    <td>{c.petName}</td>
                    <td>{c.ownerName}</td>
                    <td>{c.date} {c.time}</td>
                    <td>{c.vet}</td>
                    <td><StatusBadge texto={c.status} /></td>
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

export default DashHome;
