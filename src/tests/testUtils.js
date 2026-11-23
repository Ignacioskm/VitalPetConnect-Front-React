import { TOKEN_KEY, USER_KEY } from '../api/authStorage';

// JWT falso pero válido para las pruebas: authStorage solo valida el claim `exp`.
export function createValidToken(claims = {}) {
  const encode = (value) => btoa(JSON.stringify(value))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const header = encode({ alg: 'HS256', typ: 'JWT' });
  const payload = encode({
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...claims,
  });

  return `${header}.${payload}.signature`;
}

export function setAuthSession(user) {
  localStorage.setItem(TOKEN_KEY, createValidToken({ sub: user.id }));
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function resetStorage() {
  localStorage.clear();
}
