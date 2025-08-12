// src/api/axiosInstance.ts
import axios from 'axios';
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from '../../utils/authStorage';
import { navigate } from '../../utils/navigation';
import { clearBiometricData } from '../../utils/logout';
import { API_BASE_URL } from '../../constants';

const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
  timeout: 50000,
});

// Interceptor de solicitud, agrega token si existe
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta: intenta refrescar token si expira
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el error es por token vencido
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = await getRefreshToken();

        if (refresh) {
          const response = await axiosInstance.post('/auth/refresh/', {
            refresh,
          });

          const { access, refresh: newRefresh } = response.data;
          await saveTokens(access, newRefresh || refresh);

          // Reintenta la solicitud original
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        await clearTokens();
        //await clearBiometricData(); // limpia aquí también
        navigate('Perfil', { screen: 'Login' });
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
