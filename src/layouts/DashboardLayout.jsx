import "./dashboard.css";

// links del menu, el id es el nombre de la pagina que se muestra
const links = [
  { id: "inicio", texto: "Inicio", icono: "bi-speedometer2" },
  { id: "mascotas", texto: "Mascotas", icono: "bi-heart-pulse" },
  { id: "citas", texto: "Citas", icono: "bi-calendar-check" },
];

// marco del panel: menu lateral y a la derecha lo que llega como children
// pagina y cambiarPagina llegan por props desde App
function DashboardLayout({ pagina, cambiarPagina, children }) {
  return (
    <div>
      {/* en celular el menu se va arriba (media query del css) */}
      <aside className="vp-sidebar">
        <p className="vp-logo">
          <i className="bi bi-heart-pulse-fill"></i> VitalPet Connect
        </p>
        <nav>
          {links.map((l) => (
            <button
              key={l.id}
              className={"vp-link " + (pagina === l.id ? "activo" : "")}
              onClick={() => cambiarPagina(l.id)}
            >
              <i className={"bi me-2 " + l.icono}></i>{l.texto}
            </button>
          ))}
        </nav>
      </aside>

      <main className="vp-contenido">{children}</main>
    </div>
  );
}

export default DashboardLayout;
