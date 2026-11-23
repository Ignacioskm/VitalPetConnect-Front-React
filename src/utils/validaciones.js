// Validacion de formato. El backend determina si existe la cuenta.
// No limitar los correos a dominios de prueba como @duoc.cl.
export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());

export const isValidPhone = (phone) => {
  const digits = String(phone).replace(/\D/g, '');
  return digits.length === 9 && digits.startsWith('9');
};

export const passwordsMatch = (password, confirmPassword) => password === confirmPassword;
