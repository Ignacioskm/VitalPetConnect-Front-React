// Sesion local del prototipo. El backend valida cada JWT en cada solicitud.
export const TOKEN_KEY = 'vp_authToken';
export const USER_KEY = 'vp_userSession';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function tokenExpired(token) {
  if (!token || typeof token !== 'string') return true;
  try {
    const payload = token.split('.')[1];
    if (!payload) return true;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(atob(base64));
    return typeof claims.exp !== 'number' || claims.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export function getValidToken() {
  const token = getToken();
  return tokenExpired(token) ? null : token;
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function notifyUnauthorized() {
  clearSession();
  window.dispatchEvent(new Event('vp:unauthorized'));
}
