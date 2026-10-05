// Aca debería ir todo lo de usuarios, mascotas , citas, servicios, veterinarios como estaba en el otro proyecto.
export const seedUsers = [
  { id: 1, name: "Admin", lastName: "VitalPet", email: "admin@admin.cl", password: "admin123", role: "admin" },
  { id: 2, name: "Ignacio", lastName: "Muñoz", email: "ig.munoz@duoc.cl", password: "1234", role: "cliente" },
  { id: 3, name: "Camila", lastName: "Rojas", email: "camila.rojas@gmail.com", password: "1234", role: "cliente" },
  { id: 4, name: "Felipe", lastName: "Muñoz", email: "felipe.muñoz@duoc.cl", password: "1234", role: "cliente" }
];

export const seedPets = [
  { id: 1, name: "Rocky", species: "Perro", breed: "Labrador", age: 4, ownerName: "Camila Rojas", ownerEmail: "camila.rojas@gmail.com", active: true },
  { id: 3, name: "Luna", species: "Perro", breed: "Quiltro", age: 7, ownerName: "Ignacio Muñoz", ownerEmail: "ig.munoz@duoc.cl", active: true },
  { id: 3, name: "Nala", species: "Perro", breed: "Quiltro", age: 3, ownerName: "Camila Rojas", ownerEmail: "camila.rojas@gmail.com", active: true },
  { id: 3, name: "Mango", species: "Gato", breed: "Quiltro", age: 9, ownerName: "Felipe Muñoz", ownerEmail: "felipe.muñoz@duoc.cl", active: true },
  { id: 3, name: "Pocha", species: "Perro", breed: "Maltés", age: 10, ownerName: "Ignacio Muñoz", ownerEmail: "ig.munoz@duoc.cl", active: true },
  { id: 3, name: "Monona", species: "Perro", breed: "Cocker Spaniel", age: 4, ownerName: "Camila Rojas", ownerEmail: "camila.rojas@gmail.com", active: true },
  { id: 3, name: "Roxy", species: "Perro", breed: "Quiltro", age: 5, ownerName: "Felipe Muñoz", ownerEmail: "felipe.muñoz@duoc.cl", active: true }
];

export const seedAppointments = [
    { id: 101, petName: "Rocky", ownerName: "Camila Rojas", ownerEmail: "camila.rojas@gmail.com",
        date: "2026-10-20", time: "09:30", reason: "Vacuna antirrábica", vet: "Dra. Paula Núñez", status: "Pendiente" },
    { id: 101, petName: "Luna", ownerName: "Camila Rojas", ownerEmail: "camila.rojas@gmail.com",
        date: "2026-10-20", time: "09:30", reason: "Vacuna antirrábica", vet: "Dr. Luis Carrasco", status: "Confirmada" },
    { id: 101, petName: "Nala", ownerName: "Camila Rojas", ownerEmail: "camila.rojas@gmail.com",
        date: "2026-10-20", time: "09:30", reason: "Vacuna antirrábica", vet: "Dra. Antonia Bravo", status: "Cancelada" },
    { id: 101, petName: "Mango", ownerName: "Felipe Muñoz", ownerEmail: "felipe.muñoz@duoc.cl",
        date: "2026-10-20", time: "09:30", reason: "Vacuna antirrábica", vet: "Dra. Paula Núñez", status: "Realizada" }
];

export const services = [
    {id: 1, title: "Consulta General", price: 15000, image: "/images/consulta-general.jpg",
        description: "Evaluación física completa para asegurar el bienestar óptimo de tu paciente. Incluye revisión de signos vitales, peso y asesoramiento preventivo. Ideal para detectar problemas de salud tempranos y mantener a tu mascota en su mejor estado."},
    {id: 2, title: "Vacunación", price: 12000, image: "/images/servicio-vacunacion.jpg", 
        description: "Esquema de inmunización estructurado (anual o para cachorros) diseñado para proteger a tu compañero contra las enfermedades virales y bacterianas más comunes. Incluye vacunas esenciales como la antirrábica, parvovirus, moquillo y leptospirosis, garantizando la salud y longevidad de tu mascota."},
    {id: 3, title: "Urgencia", price: 35000, image: "/images/urgencia.jpg", 
        description: "Atención médica inmediata y prioritaria para situaciones críticas. Contamos con el equipo necesario para estabilización rápida y manejo de dolor en momentos vitales. Nuestro objetivo es brindar soporte urgente y salvar vidas, asegurando que tu mascota reciba la atención que necesita sin demora."},
    {id: 4, title: "Cirugía Menor", price: 80000, image: "/images/cirugia-menor.webp", 
        description: "Procedimientos quirúrgicos ambulatorios de baja complejidad (como suturas o extirpación de bultos pequeños), realizados con anestesia segura y monitoreo constante. Nuestro equipo garantiza una recuperación rápida y sin complicaciones, priorizando la comodidad y bienestar de tu mascota durante todo el proceso."},
    {id: 5, title: "Ecografía", price: 30000, image: "/images/servicio-ecografia.webp", 
        description: "Diagnóstico por imagen rápido, seguro y no invasivo. Permite evaluar órganos internos en tiempo real, siendo ideal para seguimiento de gestación o detección de anomalías. Nuestro equipo de especialistas interpreta los resultados para ofrecer un plan de tratamiento adecuado y personalizado."},
    {id: 6, title: "Examen de Sangre", price: 25000, image: "/images/servicio-examen-sangre.webp", 
        description: "Análisis de laboratorio clínico preciso para evaluar el estado general de salud,revisar el funcionamiento de los órganos y detectar patologías de forma temprana. Incluye hemograma completo, perfil bioquímico y pruebas específicas según la necesidad de tu mascota, asegurando un diagnóstico confiable y oportuno."},
    {id: 7, title: "Peluquería Canina", price: 20000, image: "/images/servicio-peliqueria.jpg", 
        description: "Servicio Integral de estética e higiene. Incluye baño con productos especializados, corte de pelo según la raza, limpieza de oídos y recorte de uñas para su máxima comodidad. Nuestro objetivo es mantener a tu mascota limpia, saludable y con un aspecto impecable, garantizando su bienestar y felicidad."}
];



export const vets = ["Dra. Paula Núñez", "Dr. Luis Carrasco", "Dra. Antonia Bravo"];
export const species = ["Perro", "Gato", "Ave", "Conejo", "Otro"];
export const APPOINTMENT_STATUSES = ["Pendiente", "Confirmada", "Realizada", "Cancelada"];