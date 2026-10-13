import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { DataContext } from "../context/DataContext";
import StatusBadge from "../components/StatusBadge";

// pagina "Mi cuenta": la vista del cliente
// el cliente ve SOLO sus mascotas y sus citas, no el panel del admin
export default function MyAccount() {
  // el usuario logueado sale del AuthContext (ya no uso el select "ver como")
  const { user } = useContext(AuthContext);
  // las mascotas y citas salen del DataContext
  const { pets, appointments } = useContext(DataContext);

  // filtro por el correo del usuario, porque el nombre de la sesion es solo
  // el nombre ("Camila") y en las mascotas el dueno es el nombre completo
  const correo = user ? user.email : "";

  return (
    <div className="container mt-5">
      <h2 className="vp-titulo">Hola {user ? user.name : ""}</h2>
      <p>Aqui puedes ver tus mascotas y tus citas.</p>

      <section className="vp-caja mb-4">
        <h5>Mis mascotas</h5>
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
              {pets.map(function (m, i) {
                // si la mascota no es de este cliente, no se muestra
                if (m.ownerEmail !== correo) return null;
                return (
                  <tr key={i}>
                    <td>{m.name}</td>
                    <td>{m.species}</td>
                    <td>{m.breed}</td>
                    <td>{m.age}</td>
                    <td><StatusBadge status={m.active ? "Activo" : "Inactivo"} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="vp-caja">
        <h5>Mis citas</h5>
        <div className="table-responsive">
          <table className="table vp-tabla align-middle">
            <thead>
              <tr>
                <th>Mascota</th>
                <th>Fecha</th>
                <th>Motivo</th>
                <th>Veterinario</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(function (c, i) {
                // igual que las mascotas, solo las citas de este cliente
                if (c.ownerEmail !== correo) return null;
                return (
                  <tr key={i}>
                    <td>{c.petName}</td>
                    <td>{c.date} {c.time}</td>
                    <td>{c.reason}</td>
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
