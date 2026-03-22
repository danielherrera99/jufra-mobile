import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';

const SeleccionarUbicacionScreen = ({ navigation, route }) => {
    const [location, setLocation] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const webviewRef = useRef(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocation({ latitude: -12.04318, longitude: -77.02824 }); // Lima Central fallback
                setLoading(false);
                return;
            }

            let loc = await Location.getCurrentPositionAsync({});
            setLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude
            });
            setLoading(false);
        })();
    }, []);

    const handleMessage = (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data && data.lat && data.lng) {
                // Leaflet coords
                setSelectedLocation({
                    latitude: data.lat,
                    longitude: data.lng
                });
            }
        } catch (e) {
            console.error("Error al parsear coordenadas del mapa", e);
        }
    };

    const handleConfirm = () => {
        if (selectedLocation) {
            const screenName = route.params?.returnScreen || 'CrearEvento';
            navigation.navigate(screenName, {
                pickedLocation: selectedLocation,
                merge: true
            });
        }
    };

    const generarHTML = () => {
        if (!location) return '';

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <style>
                body { margin: 0; padding: 0; background-color: #f5f5f5; }
                #map { height: 100vh; width: 100vw; }
                .focus-marker { font-size: 30px; text-align: center; line-height: 30px; }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script>
                var map = L.map('map').setView([${location.latitude}, ${location.longitude}], 15);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '&copy; OpenStreetMap JUFRA'
                }).addTo(map);

                var iconPin = L.divIcon({className: 'focus-marker', html: '📍', iconSize: [30, 30]});
                var currentMarker = null;

                map.on('click', function(e) {
                    if (currentMarker) map.removeLayer(currentMarker);
                    currentMarker = L.marker(e.latlng, {icon: iconPin}).addTo(map);
                    
                    // Enviar coordenadas seleccionadas de vuelta a React Native
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        lat: e.latlng.lat,
                        lng: e.latlng.lng
                    }));
                });
            </script>
        </body>
        </html>
        `;
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <>
                    {location && (
                        <WebView
                            ref={webviewRef}
                            source={{ html: generarHTML() }}
                            style={styles.map}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            onMessage={handleMessage}
                            originWhitelist={['*']}
                        />
                    )}

                    <View style={styles.footer}>
                        <Text style={styles.instruction}>
                            {selectedLocation 
                                ? "¡Ubicación lista! Confirma abajo."
                                : "Toca cualquier parte del mapa para marcar"}
                        </Text>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                !selectedLocation && styles.buttonDisabled
                            ]}
                            onPress={handleConfirm}
                            disabled={!selectedLocation}
                        >
                            <Text style={styles.buttonText}>Confirmar Ubicación</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.closeIcon}>✕</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
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
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        padding: SPACING.lg,
        borderTopLeftRadius: BORDER_RADIUS.xl,
        borderTopRightRadius: BORDER_RADIUS.xl,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    instruction: {
        textAlign: 'center',
        marginBottom: SPACING.md,
        color: COLORS.gray,
        fontSize: FONT_SIZES.sm,
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: COLORS.lightGray,
    },
    buttonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: FONT_SIZES.md,
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        backgroundColor: COLORS.white,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    closeIcon: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.black,
    },
});

export default SeleccionarUbicacionScreen;
