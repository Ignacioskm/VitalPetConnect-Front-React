import axios from "axios";
import { getValidToken, notifyUnauthorized } from "./authStorage";

const usersClient = axios.create({
  baseURL: import.meta.env.VITE_USERS_API_URL || "http://localhost:8082",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

usersClient.interceptors.request.use((config) => {
  const token = getValidToken();
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

usersClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem("vp_authToken")) {
      // Un intento fallido de login no debe cerrar una sesión válida.
      if (!error.config?.url?.endsWith("/api/users/login")) notifyUnauthorized();
    }
    return Promise.reject(error);
  }
);

export const usersService = {
  async getAll() {
    const { data } = await usersClient.get("/api/users");
    return data;
  },

  async login(email, password) {
    const response = await usersClient.post("/api/users/login", {
      email,
      password,
    });
    return response.data;
  },

  async register(userData) {
    const response = await usersClient.post("/api/users/register", userData);
    return response.data;
  },
};
