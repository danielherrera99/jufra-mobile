import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import { WebView } from 'react-native-webview';
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
    const webviewRef = useRef(null);

    const getValidCoordinate = (ubicacion) => {
        if (!ubicacion || ubicacion.lat == null || ubicacion.lng == null) return null;
        const lat = parseFloat(ubicacion.lat);
        const lng = parseFloat(ubicacion.lng);
        if (isNaN(lat) || isNaN(lng)) return null;
        return { lat, lng };
    };

    useEffect(() => {
        (async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setErrorMsg('Permiso de ubicación denegado. Actívalo para centrar el mapa.');
                    setInitialRegion({ latitude: -12.04318, longitude: -77.02824 }); // Lima Central fallback
                    return;
                }

                const currentLoc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                
                const coords = currentLoc.coords;
                setLocation(coords);

                if (route.params?.focusOn) {
                    const focusLat = parseFloat(route.params.focusOn.latitude);
                    const focusLng = parseFloat(route.params.focusOn.longitude);
                    if (!isNaN(focusLat) && !isNaN(focusLng)) {
                        setInitialRegion({ latitude: focusLat, longitude: focusLng });
                    } else {
                        setInitialRegion({ latitude: coords.latitude, longitude: coords.longitude });
                    }
                } else {
                    setInitialRegion({ latitude: coords.latitude, longitude: coords.longitude });
                }
            } catch (error) {
                console.error('Error al obtener ubicación:', error);
                setErrorMsg('No se pudo obtener tu ubicación actual.');
                setInitialRegion({ latitude: -12.04318, longitude: -77.02824 }); // Lima Central fallback
            } finally {
                cargarDatos();
            }
        })();
    }, [route.params?.focusOn]);

    const cargarDatos = async () => {
        try {
            const [eventosRes, anunciosRes, serviciosRes] = await Promise.all([
                api.get('/eventos', { params: { visibilidad: 'app' } }),
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

    const generarHTML = () => {
        if (!initialRegion) return '';

        // Marcadores de OpenStreetMap (Leaflet)
        let markersScript = '';

        // Marcador del usuario
        if (location) {
            markersScript += `
                var userIcon = L.divIcon({className: 'user-marker', html: '📍', iconSize: [30, 30]});
                var userMarker = L.marker([${location.latitude}, ${location.longitude}], {icon: userIcon}).addTo(map);
                userMarker.bindPopup("<b>Tu Ubicación</b>");
            `;
        }

        // Eventos
        eventos.forEach((evento) => {
            const coord = getValidCoordinate(evento.ubicacion);
            if (coord) {
                 markersScript += `
                     var iconEvento = L.divIcon({className: 'user-marker', html: '📅', iconSize: [25, 25]});
                     var m = L.marker([${coord.lat}, ${coord.lng}], {icon: iconEvento}).addTo(map);
                     m.bindPopup("<b>${evento.titulo.replace(/'/g, "\\'")}</b><br>${(evento.lugar || '').replace(/'/g, "\\'")}");
                 `;
            }
        });

        // Anuncios
        anuncios.forEach((anuncio) => {
            const coord = getValidCoordinate(anuncio.ubicacion);
            if (coord) {
                 markersScript += `
                     var iconAnuncio = L.divIcon({className: 'user-marker', html: '📢', iconSize: [25, 25]});
                     var m = L.marker([${coord.lat}, ${coord.lng}], {icon: iconAnuncio}).addTo(map);
                     m.bindPopup("<b>${anuncio.titulo.replace(/'/g, "\\'")}</b><br>${(anuncio.tipo || '').replace(/'/g, "\\'")}");
                 `;
            }
        });

        // Servicios
        servicios.forEach((servicio) => {
            const coord = getValidCoordinate(servicio.ubicacion);
            if (coord) {
                 markersScript += `
                     var iconServicio = L.divIcon({className: 'user-marker', html: '🤲', iconSize: [25, 25]});
                     var m = L.marker([${coord.lat}, ${coord.lng}], {icon: iconServicio}).addTo(map);
                     m.bindPopup("<b>${servicio.titulo.replace(/'/g, "\\'")}</b><br>${(servicio.lugar || '').replace(/'/g, "\\'")}");
                 `;
            }
        });

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <style>
                body { margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, sans-serif; }
                #map { height: 100vh; width: 100vw; }
                .user-marker {
                    font-size: 24px;
                    text-align: center;
                    line-height: 24px;
                    background: white;
                    border-radius: 50%;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script>
                var map = L.map('map').setView([${initialRegion.latitude}, ${initialRegion.longitude}], 14);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '&copy; OpenStreetMap JUFRA'
                }).addTo(map);

                ${markersScript}

                function verDetalles(tipo, id) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({tipo, id}));
                }
            </script>
        </body>
        </html>
        `;
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
                    <Text style={styles.loadingText}>Cargando mapa interactivo...</Text>
                </View>
            ) : (
                <View style={styles.mapContainer}>
                    {initialRegion ? (
                        <WebView
                            ref={webviewRef}
                            source={{ html: generarHTML() }}
                            style={styles.map}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            scrollEnabled={false}
                            originWhitelist={['*']}
                            onMessage={(event) => {
                                try {
                                    const { tipo, id } = JSON.parse(event.nativeEvent.data);
                                    if (tipo === 'anuncio') navigation.navigate('DetalleAnuncio', { id });
                                    else if (tipo === 'evento') navigation.navigate('Calendario', { id }); // Redirige a calendario
                                    else if (tipo === 'servicio') navigation.navigate('Servicios', { focusOn: id });
                                } catch (e) {
                                    console.error("Error al procesar mensaje de WebView", e);
                                }
                            }}
                            userAgent="Mozilla/5.0 (Linux; Android 10; Mobile) JUFRA-App/1.0"
                            headers={{
                                'Referer': 'https://jufra-app.com'
                            }}
                        />
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
    container: { flex: 1, backgroundColor: COLORS.cream },
    header: {
        paddingTop: 50, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.lg,
        borderBottomLeftRadius: BORDER_RADIUS.xl, borderBottomRightRadius: BORDER_RADIUS.xl, zIndex: 10
    },
    headerContent: { flexDirection: 'row', alignItems: 'center' },
    backButton: { marginRight: SPACING.md },
    backIcon: { fontSize: 24, color: COLORS.white },
    headerTitle: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: COLORS.white },
    mapContainer: { flex: 1, overflow: 'hidden' },
    map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: SPACING.md, color: COLORS.gray },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
    errorText: { color: COLORS.error, textAlign: 'center', fontSize: FONT_SIZES.md }
});

export default MapaScreen;
