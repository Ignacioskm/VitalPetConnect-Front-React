import { createContext, useEffect, useState } from 'react';
import { usersService } from '../api/usersService';
import { clearSession, getValidToken, TOKEN_KEY, USER_KEY } from '../api/authStorage';

export const AuthContext = createContext();

function normalizeRole(role) {
  const value = String(role || '').toUpperCase();
  if (value === 'ADMIN') return 'admin';
  if (value === 'CLIENT' || value === 'CLIENTE') return 'cliente';
  return null;
}

function storedSession() {
  if (!getValidToken()) {
    clearSession();
    return null;
  }
  try {
    const user = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    if (!user?.id || !['admin', 'cliente'].includes(user.role)) {
      clearSession();
      return null;
    }
    return user;
  } catch {
    clearSession();
    return null;
  }
}

function errorMessage(error, fallback) {
  const data = error?.response?.data;
  if (typeof data === 'string' && data.trim()) return data;
  return data?.message || fallback;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(storedSession);

  useEffect(() => {
    const clearOnUnauthorized = () => setUser(null);
    const handleOtherTab = (event) => {
      if (event.key === TOKEN_KEY || event.key === USER_KEY) {
        setUser(storedSession());
      }
    };
    window.addEventListener('vp:unauthorized', clearOnUnauthorized);
    window.addEventListener('storage', handleOtherTab);
    return () => {
      window.removeEventListener('vp:unauthorized', clearOnUnauthorized);
      window.removeEventListener('storage', handleOtherTab);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const result = await usersService.login(email.trim().toLowerCase(), password);
      const role = normalizeRole(result.role);
      if (!result.token || !role || !result.id) {
        return { success: false, message: 'Respuesta de autenticacion incompleta.' };
      }
      // Verificar expiracion antes de activar la sesion.
      localStorage.setItem(TOKEN_KEY, result.token);
      if (!getValidToken()) {
        clearSession();
        return { success: false, message: 'El servidor devolvio un token invalido o vencido.' };
      }
      const session = {
        id: Number(result.id),
        name: result.name,
        email: result.email,
        role,
        phone: result.phone || '',
      };
      localStorage.setItem(USER_KEY, JSON.stringify(session));
      setUser(session);
      return { success: true, role };
    } catch (error) {
      return { success: false, message: errorMessage(error, 'Correo o contraseña incorrectos.') };
    }
  };

  const register = async (newUser) => {
    try {
      const name = `${newUser.name.trim()} ${newUser.lastName?.trim() || ''}`.trim();
      await usersService.register({ name, email: newUser.email.trim().toLowerCase(), password: newUser.password });
      return { success: true };
    } catch (error) {
      return { success: false, message: errorMessage(error, 'No se pudo registrar el usuario.') };
    }
  };

  const updateProfile = (newName, newPhone) => {
    // Solo actualiza la visualizacion local; NO persiste en ms-users.
    setUser((current) => {
      if (!current) return null;
      const changed = { ...current, name: newName, phone: newPhone };
      localStorage.setItem(USER_KEY, JSON.stringify(changed));
      return changed;
    });
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
