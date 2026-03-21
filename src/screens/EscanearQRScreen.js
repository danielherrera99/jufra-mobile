import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, Button, Alert, TouchableOpacity } from 'react-native';
import { CameraView, Camera } from "expo-camera";
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';

export default function EscanearQRScreen({ navigation }) {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const { usuario } = useAuth();
    const [loading, setLoading] = useState(false);
    const [tipoReunion, setTipoReunion] = useState('semanal');

    // Use a ref to lock scanning immediately, independent of state updates
    const isProcessing = useRef(false);

    useEffect(() => {
        const getPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
        };
        getPermissions();
    }, []);

    const handleBarCodeScanned = async ({ type, data }) => {
        if (scanned || isProcessing.current) return;

        isProcessing.current = true;
        setScanned(true);
        setLoading(true);

        try {
            const response = await api.post('/asistencia/qr', {
                qrData: data,
                tipoReunion: tipoReunion
            });

            if (response.data.success) {
                Alert.alert(
                    '¡Asistencia Registrada!',
                    response.data.message,
                    [{
                        text: 'OK',
                        onPress: () => {
                            // Add a small delay before allowing next scan
                            setTimeout(() => {
                                setScanned(false);
                                isProcessing.current = false;
                            }, 2000);
                        }
                    }]
                );
            }
        } catch (error) {
            console.error(error);
            const mensaje = error.response?.data?.message || 'Error al registrar asistencia';
            Alert.alert('Error', mensaje, [{
                text: 'OK',
                onPress: () => {
                    setTimeout(() => {
                        setScanned(false);
                        isProcessing.current = false;
                    }, 2000);
                }
            }]);
        } finally {
            setLoading(false);
            // Note: isProcessing.current remains true until the Alert is closed
        }
    };

    if (hasPermission === null) {
        return <View style={styles.container}><Text>Solicitando permiso de cámara...</Text></View>;
    }
    if (hasPermission === false) {
        return <View style={styles.container}><Text>No hay acceso a la cámara</Text></View>;
    }

    return (
        <View style={styles.container}>
            <CameraView
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
                style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.topOverlay}>
                <Text style={styles.label}>Tipo de Reunión:</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={tipoReunion}
                        onValueChange={(v) => setTipoReunion(v)}
                        style={styles.picker}
                        dropdownIconColor={COLORS.black}
                    >
                        <Picker.Item label="Semanal" value="semanal" />
                        <Picker.Item label="Consejo" value="consejo" />
                        <Picker.Item label="Formación" value="formacion" />
                        <Picker.Item label="Apostolado" value="apostolado" />
                        <Picker.Item label="Especial" value="especial" />
                    </Picker>
                </View>
            </View>

            <View style={styles.overlay}>
                <View style={styles.scanArea} />
                <Text style={styles.instructionText}>
                    Apunta al código QR del hermano
                </Text>
            </View>

            <TouchableOpacity
                style={styles.closeButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.closeText}>Cerrar</Text>
            </TouchableOpacity>

            {scanned && loading && (
                <View style={styles.loadingOverlay}>
                    <Text style={styles.loadingText}>Registrando...</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: 'black',
    },
    topOverlay: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
    },
    label: {
        color: COLORS.white,
        fontWeight: 'bold',
        marginBottom: SPACING.xs,
    },
    pickerContainer: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: BORDER_RADIUS.sm,
    },
    picker: {
        height: 50,
        color: COLORS.black,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanArea: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: COLORS.secondary,
        backgroundColor: 'transparent',
        borderRadius: BORDER_RADIUS.lg,
    },
    instructionText: {
        color: COLORS.white,
        fontSize: FONT_SIZES.md,
        marginTop: SPACING.xl,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
    },
    closeButton: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
        backgroundColor: COLORS.error,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.xl,
        zIndex: 10,
    },
    closeText: {
        color: COLORS.white,
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },
    loadingText: {
        color: COLORS.white,
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
    }
});
