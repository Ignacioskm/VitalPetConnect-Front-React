// Contexto para el login registro y logout de usuarios, para poder usarlo en cualquier componente.

import { createContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { seedUsers } from '../data/mockData';


export const AuthContext = createContext();

export const AuthProvider = ({children}) => {

    //Utilizamos el hook personalizado para ver si ya existe la sesión si no null nomás
    const [user, setUser] = useLocalStorage('vp_userSession', null)

    //Esto es para poder crear nuevos usuarios
    const [userList, setUserList] = userLocalStorage('vp_usersList', seedUsers)

    const login = (email,password) => {

        //Se busca si el usuario existe en la mockdata
        const userFound = seedUsers.find(
            (u) => u.email === email && u.password === password
        );

        if (userFound) {
            //Guardamos al usuarion SIN LA PW POR SEGURIDAD
            const sessionData ={
                id: userFound.id,
                name: userFound.name,
                email: userFound.email,
                role: userFound.role
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
            role: 'cliente'
        };

        setUserList([...userList, userAdd]);
        return { success: true};
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value ={{ user,login,logout}}>
            {children}
        </AuthContext.Provider>
    );

};