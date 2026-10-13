// Contexto para el login registro y logout de usuarios, para poder usarlo en cualquier componente.

import { createContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { seedUsers } from '../data/mockData';


export const AuthContext = createContext();

export const AuthProvider = ({children}) => {

    //Utilizamos el hook personalizado para ver si ya existe la sesión si no null nomás
    const [user, setUser] = useLocalStorage('vp_userSession', null)

    //Esto es para poder crear nuevos usuarios
    const [userList, setUserList] = useLocalStorage('vp_usersList', seedUsers)

    const login = (email,password) => {

        //Se busca si el usuario existe en la mockdata
        const userFound = userList.find(
            (u) => u.email === email && u.password === password
        );

        if (userFound) {
            //Guardamos al usuarion SIN LA PW POR SEGURIDAD
            const sessionData ={
                id: userFound.id,
                name: userFound.name,
                email: userFound.email,
                role: userFound.role,
                phone: userFound.phone
            };
            setUser(sessionData);
            return { success: true, role: userFound.role};
        }

        return { success: false, message: "Correo o contraseña incorrectos."}
    };

    const register = (newUser) => {

        //Verificamos por correo si ya existe
        const exists = userList.find((u) => u.email === newUser.email);
        if(exists){
            return {success: false, message: "Este correo ya está registrado."};
        }

        const userAdd = {
            ...newUser,
            id: Date.now(), //Acá es como para simular una id nomás con la fecha actual hay que cambiarlo.
            role: 'cliente',
            phone: newUser.phone || '' //guarda el telefono si se ingreso, sino queda vacio
        };

        setUserList([...userList, userAdd]);
        return { success: true};
    };

        const updateProfile = (newName, newPhone) => {
            if (!user) return;

            // preparamos la informacion exacta 
            const nuevaSesion = { ...user, name: newName, phone: newPhone };
            const nuevaLista = userList.map((u) => 
                u.email === user.email ? { ...u, name: newName, phone: newPhone } : u
            );

            // actualizamos la interfaz para que el Navbar cambie al instante
            setUser(nuevaSesion);
            setUserList(nuevaLista);

            // aseguramos el guardado nativo en el navegador al mismo tiempo
            localStorage.setItem('vp_userSession', JSON.stringify(nuevaSesion));
            localStorage.setItem('vp_usersList', JSON.stringify(nuevaLista));
        };
            const logout = () => {
                setUser(null);
            };

    return (
        <AuthContext.Provider value ={{ user, login, logout, register, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );

};