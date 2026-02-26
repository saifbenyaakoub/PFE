import axios from "axios";
import toast from "react-hot-toast";

const apiClient = axios.create({
    baseURL: "http://localhost:3001/api",
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => {
        // Extract the standard 'data' envelope from the backend ApiResponse
        if (response.data && response.data.success) {
            return response.data.data;
        }
        return response.data;
    },
    (error) => {
        // Handle global errors here
        const message = error.response?.data?.message || error.message || "An unexpected error occurred.";

        if (error.response?.status === 401) {
            // Clear token and redirect to login if unauthorized
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/sign-in";
        }

        toast.error(message);
        return Promise.reject(error);
    }
);

export default apiClient;
