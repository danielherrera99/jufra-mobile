import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Función para obtener la URL base
const getBaseUrl = () => {
    // Apuntando al servidor de producción en Render
    return 'https://api-jufra.onrender.com/api';
};

export const API_URL = getBaseUrl();

// Crear instancia de axios
const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token inválido o expirado
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('usuario');
            // Aquí podrías redirigir al login
        }
        return Promise.reject(error);
    }
);

export default api;
