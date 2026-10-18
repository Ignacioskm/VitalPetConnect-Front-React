# 🐾 VitalPet Connect — Frontend (React)

Plataforma web para una clínica veterinaria: permite a los clientes registrar a sus mascotas y agendar citas, y a la administración gestionar mascotas y citas desde un panel.

> **Estado del proyecto:** solo frontend. Los datos se simulan con *mock data* y se persisten en `localStorage`. Aún no existe backend ni base de datos.

Este repositorio es la **migración a React + Bootstrap** de una versión anterior hecha solo con HTML, CSS y JavaScript.

---

## ✨ Funcionalidades

### Sitio público
- **Inicio**: hero con llamado a la acción para agendar cita y video de presentación de la clínica.
- **Servicios**: catálogo de 7 servicios (consulta general, vacunación, urgencia, cirugía menor, ecografía, examen de sangre y peluquería canina) con imagen, descripción y precio en CLP.
- **Agendamiento de citas** (modal reutilizable `BookButton`), disponible desde el navbar, el inicio y cada servicio:
  - Si no hay sesión, invita a iniciar sesión.
  - Si el usuario no tiene mascotas, permite registrar una al momento.
  - Selección de mascota, motivo (precargado según el servicio), veterinario, fecha (no permite fechas pasadas) y hora (bloques de 30 min entre 09:00 y 18:30).
  - Las citas nuevas quedan en estado **Pendiente**.
- **Registro e inicio de sesión** con validación de correo, teléfono y contraseñas.
- **Edición de perfil** (nombre y teléfono) desde el navbar.

### Panel del cliente (`/mis-mascotas`)
- Ver y registrar sus mascotas.
- Ver sus citas y cancelar las que estén Pendientes o Confirmadas.

### Panel de administración (`/dashboard`)
- **Resumen**: tarjetas con total de mascotas, fichas activas, citas pendientes y confirmadas, más tabla de citas con filtro por estado.
- **Mascotas**: registrar, buscar por nombre o dueño y eliminar.
- **Citas**: agendar, filtrar por estado y cambiar su estado (Confirmar → Marcar realizada / Cancelar).

---

## 🛠️ Stack tecnológico

| Área | Tecnología |
|---|---|
| UI | [React 19](https://react.dev/) |
| Build / dev server | [Vite](https://vite.dev/) |
| Estilos | [Bootstrap 5](https://getbootstrap.com/) + [Bootstrap Icons](https://icons.getbootstrap.com/) + CSS propio (`index.css`) |
| Routing | [React Router DOM 7](https://reactrouter.com/) |
| Estado global | Context API (`AuthContext`, `DataContext`) |
| Persistencia | `localStorage` mediante el hook `useLocalStorage` |
| Testing | [Vitest](https://vitest.dev/) + Testing Library + jsdom |
| Linter | [Oxlint](https://oxc.rs/docs/guide/usage/linter) |

---

## 🚀 Puesta en marcha

### Requisitos
- Node.js (versión LTS reciente) y npm.

### Instalación

```bash
git clone https://github.com/Ignacioskm/VitalPetConnect-Front-React.git
cd VitalPetConnect-Front-React
npm install
npm run dev
```

La app quedará disponible en la URL que indique Vite (por defecto `http://localhost:5173`).

### Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Levanta el servidor de desarrollo con HMR |
| `npm run build` | Genera el build de producción en `dist/` |
| `npm run preview` | Sirve localmente el build de producción |
| `npm run lint` | Ejecuta Oxlint |
| `npm test` | Ejecuta los tests con Vitest |

---

## 🔐 Usuarios de prueba

Los usuarios iniciales viven en `src/data/mockData.js` (solo para desarrollo):

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@admin.cl` | `admin123` |
| Cliente | `ig.munoz@duoc.cl` | `1234` |
| Cliente | `camila.rojas@gmail.com` | `1234` |
| Cliente | `felipe.munoz@duoc.cl` | `1234` |

También puedes crear una cuenta nueva desde `/registro` (siempre se crea con rol `cliente`).

**Dominios de correo permitidos:** `@admin.cl`, `@gmail.com`, `@duocuc.cl`, `@profesor.duoc.cl`, `@duoc.cl`.

Para reiniciar los datos de prueba, borra las claves `vp_*` del `localStorage` del navegador (`vp_userSession`, `vp_usersList`, `vp_pets`, `vp_appointments`).

---

## 🗺️ Rutas

| Ruta | Acceso | Descripción |
|---|---|---|
| `/` | Público | Inicio |
| `/servicios` | Público | Catálogo de servicios |
| `/login` | Público | Inicio de sesión |
| `/registro` | Público | Registro de cliente |
| `/mis-mascotas` | Rol `cliente` | Panel del cliente |
| `/dashboard` | Rol `admin` | Resumen del panel admin |
| `/dashboard/mascotas` | Rol `admin` | Gestión de mascotas |
| `/dashboard/citas` | Rol `admin` | Gestión de citas |

`ProtectedRoute` redirige a `/login` si no hay sesión, y envía al usuario a su propio panel si intenta entrar a una ruta de otro rol.

---

## 📁 Estructura del proyecto

```
public/
  images/               # Imágenes de servicios y banner
src/
  components/           # BookButton, Navbar, Footer, FormField, StatusBadge,
                        # MyProfileEdit, ProtectedRoute
  context/              # AuthContext (sesión/usuarios) y DataContext (mascotas/citas)
  data/mockData.js      # Usuarios, mascotas, citas, servicios y veterinarios de ejemplo
  hooks/                # useLocalStorage
  layouts/              # PublicLayout y DashboardLayout
  pages/
    dashboard/          # DashHome, Pets, Appointments (admin)
    Home, Services, Login, Register, MyAccount
  tests/                # Tests unitarios y de componentes (Vitest)
  utils/validaciones.js # Validación de correo, teléfono y contraseñas
  App.jsx               # Definición de rutas y providers
  main.jsx              # Punto de entrada
  index.css             # Estilos personalizados sobre Bootstrap
```

---

## 🧪 Testing

```bash
npm test
```

Los tests cubren los contextos (`AuthContext`, `DataContext`), el hook `useLocalStorage` y los componentes `BookButton`, `Navbar`, `Footer`, `FormField`, `MyProfileEdit`, `ProtectedRoute` y `StatusBadge`.

---

## 🔄 Migración desde HTML/CSS/JS

- Las vistas HTML se convirtieron en componentes y páginas React con layouts reutilizables.
- El manejo manual del DOM se reemplazó por estado de React (`useState`) y Context API.
- Los datos que antes estaban en el JS plano ahora se centralizan en `mockData.js` y se persisten con `localStorage`.
- Se reutilizó Bootstrap para el diseño responsivo, más estilos propios con el prefijo `vp-`.
- Se agregaron rutas protegidas por rol, formularios reutilizables y tests automatizados.

---

## ⚠️ Limitaciones actuales

- No hay backend: **las contraseñas se guardan en texto plano en `localStorage`**. Es aceptable solo como simulación, no para producción.
- Los IDs se generan en el cliente (`Date.now()` / máximo + 1).
- No se valida la disponibilidad de horarios ni choques entre citas.
- Algunas páginas del panel admin usan `alert()` / `confirm()` nativos.

## 🧭 Próximos pasos

- [ ] Conectar con un backend / API REST y base de datos.
- [ ] Autenticación real (hash de contraseñas, tokens/sesiones).
- [ ] Validar disponibilidad de horarios y veterinarios.
- [ ] Reemplazar `alert()` / `confirm()` por modales o toasts.
- [ ] Reemplazar enlaces de redes sociales del footer por los reales.
- [ ] Despliegue (Vercel, Netlify, etc.).

---

## 👤 Autor

Proyecto desarrollado por [Ignacioskm](https://github.com/Ignacioskm).
