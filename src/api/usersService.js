import axios from "axios";

const usersClient = axios.create({
  baseURL: import.meta.env.VITE_USERS_API_URL || "http://localhost:8082",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const usersService = {
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