import { useState, useEffect } from "react";
import { seedPets, seedAppointments } from "./data/mockData";
import DashboardLayout from "./layouts/DashboardLayout";
import DashHome from "./pages/dashboard/DashHome";
import Pets from "./pages/dashboard/Pets";
import Appointments from "./pages/dashboard/Appointments";

function App() {
  // las listas estan aca arriba para que las 3 paginas usen las mismas
  // asi si registro una mascota aparece en el inicio y en el formulario de citas
  const [mascotas, setMascotas] = useState(seedPets);
  const [citas, setCitas] = useState(seedAppointments);

  // que pagina del panel se muestra
  const [pagina, setPagina] = useState("inicio");

  // cada vez que cambia la pagina cambio el titulo de la pestana
  useEffect(() => {
    document.title = "VitalPet | " + pagina;
  }, [pagina]);

  return (
    <DashboardLayout pagina={pagina} cambiarPagina={setPagina}>
      {pagina === "inicio" && <DashHome mascotas={mascotas} citas={citas} />}
      {pagina === "mascotas" && <Pets mascotas={mascotas} setMascotas={setMascotas} />}
      {pagina === "citas" && <Appointments citas={citas} setCitas={setCitas} mascotas={mascotas} />}
    </DashboardLayout>
  );
}

export default App;
