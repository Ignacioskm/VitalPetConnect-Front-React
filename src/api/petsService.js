import axiosClient from "./axiosClient";

const BASE = "/api/pets";

export const petsService = {
    async getAll() {
        const response = await axiosClient.get(BASE);
        return response.data;
    },

    async getById(id) {
        const response = await axiosClient.get(`${BASE}/${id}`);
        return response.data;
    },

    async getSpecies() {
        const response = await axiosClient.get(`${BASE}/species`);
        return response.data;
    },

    async create(petData){
        const response = await axiosClient.post(BASE,petData)
        return response.data;
    },

    async update(id, petData) {
    const response = await axiosClient.put(`${BASE}/${id}`, petData);
    return response.data;
  },

    async remove(id) {
    await axiosClient.delete(`${BASE}/${id}`);
  },

};