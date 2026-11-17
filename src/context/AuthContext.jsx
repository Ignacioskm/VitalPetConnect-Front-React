import { createContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { usersService } from '../api/usersService';

export const AuthContext = createContext();

// el rol que viene del backend cambia a su valor correspondiente (CLIENT = cliente, ADMIN = admin)
const normalizeRole = (role) => {
  if (!role) return 'cliente';
  const upper = role.toUpperCase();
  if (upper === 'CLIENT' || upper === 'CLIENTE') return 'cliente';
  if (upper === 'ADMIN') return 'admin';
  return role.toLowerCase();
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useLocalStorage('vp_userSession', null);

  const login = async (email, password) => {
    try {
      const userData = await usersService.login(email, password);
      const normalizedRole = normalizeRole(userData.role);

      const sessionData = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: normalizedRole,
        phone: userData.phone || '',
      };

      setUser(sessionData);
      return { success: true, role: normalizedRole };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data || 'Correo o contraseña incorrectos.',
      };
    }
  };

  const register = async (newUser) => {
    try {
      // se une nombre y apellido porque en el backend solo tiene name
      const fullName = `${newUser.name.trim()} ${newUser.lastName?.trim() || ''}`.trim();

      await usersService.register({
        name: fullName,
        email: newUser.email,
        password: newUser.password,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data || 'Error al registrar usuario. El correo ya existe.',
      };
    }
  };

  const updateProfile = (newName, newPhone) => {
    if (!user) return;
    const nuevaSesion = { ...user, name: newName, phone: newPhone };
    setUser(nuevaSesion);
    localStorage.setItem('vp_userSession', JSON.stringify(nuevaSesion));
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};