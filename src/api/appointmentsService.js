import appointmentsClient from "./appointmentsClient";

const BASE = "/api/appointments";

export const appointmentsService = {
    async getAll() {
        const response = await appointmentsClient.get(BASE);
        return response.data;
    },

    async getByOwner(ownerId) {
        const response = await appointmentsClient.get(`${BASE}/${ownerId}/owner`);
        return response.data;
    },

    async create(appointmentData) {
        const response = await appointmentsClient.post(BASE, appointmentData);
        return response.data;
    },

    // el back valida las transiciones y responde 409 si no corresponde
    async updateStatus(id, status) {
        const response = await appointmentsClient.put(`${BASE}/${id}/status`, { status });
        return response.data;
    },

    async remove(id) {
        await appointmentsClient.delete(`${BASE}/${id}`);
    },
};
