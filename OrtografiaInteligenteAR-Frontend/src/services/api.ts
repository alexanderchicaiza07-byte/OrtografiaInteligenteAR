
import axios from "axios";

// URL del backend según el entorno
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:3045/api",

  withCredentials: true
});

export default api;
