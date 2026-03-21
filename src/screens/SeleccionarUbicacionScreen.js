import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';

const SeleccionarUbicacionScreen = ({ navigation, route }) => {
    const [location, setLocation] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLoading(false);
                return;
            }

            let loc = await Location.getCurrentPositionAsync({});
            setLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            });
            setLoading(false);
        })();
    }, []);

    const handleMapPress = (e) => {
        setSelectedLocation(e.nativeEvent.coordinate);
    };

    const handleConfirm = () => {
        if (selectedLocation) {
            // Regresar a la pantalla anterior con las coordenadas
            // Identificar a qué pantalla regresar (Crear o Editar)
            const screenName = route.params?.returnScreen || 'CrearEvento';
            navigation.navigate(screenName, {
                pickedLocation: selectedLocation,
                merge: true
            });
        }
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <>
                    <MapView
                        style={styles.map}
                        provider={PROVIDER_GOOGLE}
                        initialRegion={location}
                        onPress={handleMapPress}
                        showsUserLocation={true}
                    >
                        {selectedLocation && (
                            <Marker coordinate={selectedLocation} />
                        )}
                    </MapView>

                    <View style={styles.footer}>
                        <Text style={styles.instruction}>
                            Toca en el mapa para seleccionar la ubicación
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
