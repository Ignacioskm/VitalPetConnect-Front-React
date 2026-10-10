//Validaciones funciones etc

//Definimos los dominios que teniamos antes
export const ALLOWED_DOMAINS = ["@admin.cl", "@gmail.com", "@duocuc.cl", "@profesor.duoc.cl","@duoc.cl"];

//Validamos si termina en un dominio permitido
export const isValidEmail = (email) => {
  return ALLOWED_DOMAINS.some((domain) => email.trim().toLowerCase().endsWith(domain));
}

//Validamos el telefono con el regex
export const isValidPhone = (phone) => phone.replace(/\D/g, "").length === 11;

//Validamos que la pw sean iguales
export const passwordsMatch = (password, confirmPassword) => password === confirmPassword;

