import axios from "axios";

// cliente aparte para el ms de citas (puerto 8084), el de mascotas usa axiosClient
const appointmentsClient = axios.create({
    baseURL: import.meta.env.VITE_APPOINTMENTS_API_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

export default appointmentsClient;
