import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import api from '../config/api';

const MapaScreen = ({ navigation, route }) => {
    const [location, setLocation] = useState(null);
    const [eventos, setEventos] = useState([]);
    const [anuncios, setAnuncios] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);
    const [initialRegion, setInitialRegion] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setErrorMsg('Permiso de ubicación denegado. Actívalo para ver el mapa.');
                    setLoading(false);
                    return;
                }

                const currentLoc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                
                const coords = currentLoc.coords;
                setLocation(coords);

                if (route.params?.focusOn) {
                    setInitialRegion({
                        latitude: route.params.focusOn.latitude,
                        longitude: route.params.focusOn.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    });
                } else {
                    setInitialRegion({
                        latitude: coords.latitude,
                        longitude: coords.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    });
                }
            } catch (error) {
                console.error('Error al obtener ubicación:', error);
                setErrorMsg('No se pudo obtener tu ubicación actual.');
            } finally {
                cargarDatos();
            }
        })();
    }, [route.params?.focusOn]);

    const cargarDatos = async () => {
        try {
            const [eventosRes, anunciosRes, serviciosRes] = await Promise.all([
                api.get('/eventos'),
                api.get('/anuncios'),
                api.get('/servicios')
            ]);

            if (eventosRes.data.success) {
                setEventos(eventosRes.data.eventos);
            }
            if (anunciosRes.data.success) {
                setAnuncios(anunciosRes.data.anuncios);
            }
            if (serviciosRes.data.success) {
                setServicios(serviciosRes.data.servicios);
            }
        } catch (error) {
            console.error('Error al cargar datos del mapa:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.secondary, COLORS.primary]}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Mapa de Actividades</Text>
                </View>
            </LinearGradient>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Obteniendo ubicación...</Text>
                </View>
            ) : (
                <View style={styles.mapContainer}>
                    {initialRegion ? (
                        <MapView
                            style={styles.map}
                            provider={PROVIDER_GOOGLE}
                            initialRegion={initialRegion}
                            showsUserLocation={true}
                            showsMyLocationButton={true}
                        >
                            {/* Marcador de usuario */}
                            {location && (
                                <Marker
                                    coordinate={{
                                        latitude: location.latitude,
                                        longitude: location.longitude,
                                    }}
                                    title="Tu Ubicación"
                                    description="Estás aquí"
                                    pinColor={COLORS.primary}
                                />
                            )}

                            {/* Marcadores de eventos */}
                            {eventos.map((evento) => {
                                if (evento.ubicacion && evento.ubicacion.lat && evento.ubicacion.lng) {
                                    return (
                                        <Marker
                                            key={`evento-${evento._id}`}
                                            coordinate={{
                                                latitude: evento.ubicacion.lat,
                                                longitude: evento.ubicacion.lng,
                                            }}
                                            title={`📅 ${evento.titulo}`}
                                            description={evento.lugar}
                                            pinColor={COLORS.secondary}
                                            onCalloutPress={() => navigation.navigate('Calendario')}
                                        />
                                    );
                                }
                                return null;
                            })}

                            {/* Marcadores de anuncios */}
                            {anuncios.map((anuncio) => {
                                if (anuncio.ubicacion && anuncio.ubicacion.lat && anuncio.ubicacion.lng) {
                                    return (
                                        <Marker
                                            key={`anuncio-${anuncio._id}`}
                                            coordinate={{
                                                latitude: anuncio.ubicacion.lat,
                                                longitude: anuncio.ubicacion.lng,
                                            }}
                                            title={`📢 ${anuncio.titulo}`}
                                            description={anuncio.tipo}
                                            pinColor={COLORS.tertiary}
                                            onCalloutPress={() => navigation.navigate('DetalleAnuncio', { anuncio })}
                                        />
                                    );
                                }
                                return null;
                            })}

                            {/* Marcadores de servicios */}
                            {servicios.map((servicio) => {
                                if (servicio.ubicacion && servicio.ubicacion.lat && servicio.ubicacion.lng) {
                                    return (
                                        <Marker
                                            key={`servicio-${servicio._id}`}
                                            coordinate={{
                                                latitude: servicio.ubicacion.lat,
                                                longitude: servicio.ubicacion.lng,
                                            }}
                                            title={`🤲 ${servicio.titulo}`}
                                            description={servicio.lugar}
                                            pinColor={'#4CAF50'} // Green for service
                                            onCalloutPress={() => navigation.navigate('Servicios')}
                                        />
                                    );
                                }
                                return null;
                            })}
                        </MapView>
                    ) : (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{errorMsg || 'No se pudo cargar el mapa'}</Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.cream,
    },
    header: {
        paddingTop: 50,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.lg,
        borderBottomLeftRadius: BORDER_RADIUS.xl,
        borderBottomRightRadius: BORDER_RADIUS.xl,
        zIndex: 10,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: SPACING.md,
    },
    backIcon: {
        fontSize: 24,
        color: COLORS.white,
    },
    headerTitle: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    mapContainer: {
        flex: 1,
        overflow: 'hidden',
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: SPACING.md,
        color: COLORS.gray,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    errorText: {
        color: COLORS.error,
        textAlign: 'center',
        fontSize: FONT_SIZES.md,
    },
});

export default MapaScreen;
