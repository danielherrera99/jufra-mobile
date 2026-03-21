import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { PanResponder, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';

const AuthContext = createContext({});

const INACTIVITY_TIME = 5 * 60 * 1000; // 5 minutos de inactividad

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [token, setToken] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    // Timer para inactividad
    const timerRef = useRef(null);

    const resetTimer = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (token) {
            timerRef.current = setTimeout(() => {
                console.log("Cerrando sesión por inactividad...");
                logout();
            }, INACTIVITY_TIME);
        }
    };

    // PanResponder para detectar toques en cualquier parte de la app
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponderCapture: () => {
                resetTimer();
                return false;
            },
            onMoveShouldSetPanResponderCapture: () => {
                resetTimer();
                return false;
            },
        })
    ).current;

    useEffect(() => {
        if (token) {
            resetTimer();
        } else {
            if (timerRef.current) clearTimeout(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [token]);

    // Cargar usuario al iniciar la app
    useEffect(() => {
        cargarUsuario();
    }, []);

    const cargarUsuario = async () => {
        try {
            const tokenGuardado = await AsyncStorage.getItem('token');
            const usuarioGuardado = await AsyncStorage.getItem('usuario');

            if (tokenGuardado && usuarioGuardado) {
                setToken(tokenGuardado);
                setUsuario(JSON.parse(usuarioGuardado));
            }
        } catch (error) {
            console.error('Error al cargar usuario:', error);
        } finally {
            setCargando(false);
        }
    };

    const login = async (username, password) => {
        try {
            setError(null);
            const response = await api.post('/auth/login', { username, password });

            if (response.data.success) {
                const { token, usuario } = response.data;

                // Guardar en AsyncStorage
                await AsyncStorage.setItem('token', token);
                await AsyncStorage.setItem('usuario', JSON.stringify(usuario));

                // Actualizar estado
                setToken(token);
                setUsuario(usuario);

                return { success: true };
            }
        } catch (error) {
            const mensaje = error.response?.data?.message || 'Error al iniciar sesión';
            setError(mensaje);
            return { success: false, message: mensaje };
        }
    };

    const registro = async (datos) => {
        try {
            setError(null);
            const response = await api.post('/auth/registro', datos);

            if (response.data.success) {
                // Ya no hacemos login automático
                return { success: true, message: response.data.message };
            }
        } catch (error) {
            const mensaje = error.response?.data?.message || 'Error al registrarse';
            setError(mensaje);
            return { success: false, message: mensaje };
        }
    };

    const logout = async () => {
        try {
            if (timerRef.current) clearTimeout(timerRef.current);
            // Limpiar AsyncStorage
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('usuario');

            // Limpiar estado
            setToken(null);
            setUsuario(null);
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const actualizarUsuario = async (datosActualizados) => {
        try {
            const usuarioActualizado = { ...usuario, ...datosActualizados };
            await AsyncStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
            setUsuario(usuarioActualizado);
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
        }
    };

    const [modoConsejo, setModoConsejo] = useState(true);

    const esConsejoReal = usuario && (
        usuario.rol === 'admin' ||
        usuario.rol === 'consejo' ||
        ['coordinador', 'vice-coordinador', 'secretario', 'tesorero', 'formador', 'animador'].includes(usuario.cargo)
    );

    const esConsejoActivo = esConsejoReal && modoConsejo;

    const toggleModoConsejo = () => {
        setModoConsejo(prev => !prev);
    };

    const value = {
        usuario,
        token,
        cargando,
        error,
        login,
        registro,
        logout,
        actualizarUsuario,
        estaAutenticado: !!token,
        esConsejoReal,
        esConsejoActivo,
        modoConsejo,
        toggleModoConsejo
    };

    return (
        <AuthContext.Provider value={value}>
            <View style={{ flex: 1 }} {...panResponder.panHandlers}>
                {children}
            </View>
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
};

export default AuthContext;
