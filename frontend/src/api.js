
import axios from 'axios';
 
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
});
 
// Añadir el token JWT a todas las peticiones automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
 
// Si el servidor devuelve 401, limpiar sesión
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('rol');
      localStorage.removeItem('alumno');
      window.location.reload();
    }
    return Promise.reject(err);
  }
);
 
export default api;