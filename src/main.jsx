import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// bootstrap se importa aca una vez y queda para toda la app
import "bootstrap/dist/css/bootstrap.min.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
