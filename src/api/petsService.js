import axiosClient from './axiosClient';

const BASE = '/api/pets';

export const petsService = {
  async getAll() {
    const { data } = await axiosClient.get(BASE);
    return data;
  },

  async getByOwner(ownerId) {
    const { data } = await axiosClient.get(`${BASE}/${ownerId}/owner`);
    return data;
  },

  async getById(id) {
    const { data } = await axiosClient.get(`${BASE}/${id}`);
    return data;
  },

  async getSpecies() {
    const { data } = await axiosClient.get(`${BASE}/species`);
    return data;
  },

  async create(petData) {
    const { data } = await axiosClient.post(BASE, petData);
    return data;
  },

  async update(id, petData) {
    const { data } = await axiosClient.put(`${BASE}/${id}`, petData);
    return data;
  },

  async remove(id) {
    await axiosClient.delete(`${BASE}/${id}`);
  },
};
