import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { PanResponder, View, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';
import { registerForPushNotificationsAsync } from '../utils/notifications';

const AuthContext = createContext({});

const INACTIVITY_TIME = 3 * 60 * 1000; // 3 minutos de inactividad

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [token, setToken] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [recordarSesion, setRecordarSesion] = useState(false);

    // Timer para inactividad
    const timerRef = useRef(null);
    const appState = useRef(AppState.currentState);
    const lastActiveTime = useRef(Date.now());

    const resetTimer = () => {
        lastActiveTime.current = Date.now();
        if (timerRef.current) clearTimeout(timerRef.current);
        if (token && !recordarSesion) {
            timerRef.current = setTimeout(() => {
                console.log("Cerrando sesión por inactividad en foreground...");
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

        const subscription = AppState.addEventListener('change', nextAppState => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                const timeElapsed = Date.now() - lastActiveTime.current;
                if (token && !recordarSesion && timeElapsed >= INACTIVITY_TIME) {
                    console.log("Cerrando sesión por inactividad al regresar del background...");
                    logout();
                } else {
                    resetTimer();
                }
            } else if (nextAppState.match(/inactive|background/)) {
                lastActiveTime.current = Date.now();
            }
            appState.current = nextAppState;
        });

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            subscription.remove();
        };
    }, [token, recordarSesion]);

    // Cargar usuario al iniciar la app
    useEffect(() => {
        cargarUsuario();
    }, []);

    const cargarUsuario = async () => {
        try {
            const tokenGuardado = await AsyncStorage.getItem('token');
            const usuarioGuardado = await AsyncStorage.getItem('usuario');
            const recordar = await AsyncStorage.getItem('recordarSesion');

            if (tokenGuardado && usuarioGuardado) {
                setToken(tokenGuardado);
                setUsuario(JSON.parse(usuarioGuardado));
                if (recordar === 'true') {
                    setRecordarSesion(true);
                }

                // Validate and update push token on startup silently
                registerForPushNotificationsAsync().then(pushToken => {
                    if (pushToken) {
                        api.put('/auth/perfil', { expoPushToken: pushToken }, {
                            headers: { Authorization: `Bearer ${tokenGuardado}` }
                        }).catch(e => console.log('Error updating push token on startup:', e));
                    }
                });
            }
        } catch (error) {
            console.error('Error al cargar usuario:', error);
        } finally {
            setCargando(false);
        }
    };

    const login = async (username, password, rememberMe = false) => {
        try {
            setError(null);
            const response = await api.post('/auth/login', { username, password });

            if (response.data.success) {
                const { token, usuario } = response.data;

                // Guardar en AsyncStorage
                await AsyncStorage.setItem('token', token);
                await AsyncStorage.setItem('usuario', JSON.stringify(usuario));
                if (rememberMe) {
                    await AsyncStorage.setItem('recordarSesion', 'true');
                    setRecordarSesion(true);
                } else {
                    await AsyncStorage.removeItem('recordarSesion');
                    setRecordarSesion(false);
                }

                // Actualizar estado
                setToken(token);
                setUsuario(usuario);

                // Setup push notifications
                const pushToken = await registerForPushNotificationsAsync();
                if (pushToken) {
                    try {
                        await api.put('/auth/perfil', { expoPushToken: pushToken }, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                    } catch (e) {
                        console.log('Error saving push token on login:', e);
                    }
                }

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
            await AsyncStorage.removeItem('recordarSesion');

            // Limpiar estado
            setToken(null);
            setUsuario(null);
            setRecordarSesion(false);
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
