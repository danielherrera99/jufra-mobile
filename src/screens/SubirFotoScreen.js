import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    TouchableOpacity,
    Image,
    TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import api from '../config/api';
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const SubirFotoScreen = ({ navigation, route }) => {
    const { origen, id } = route.params || {};
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [archivo, setArchivo] = useState(null);
    const [loading, setLoading] = useState(false);

    const isPerfil = origen === 'perfil';

    const pickImage = async () => {
        // Pedir permisos
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para subir fotos.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, // Solo imágenes para perfil
            allowsEditing: true,
            aspect: isPerfil ? [1, 1] : [4, 3], // Cuadrado para perfil
            quality: 0.8,
        });

        if (!result.canceled) {
            setArchivo(result.assets[0]);
        }
    };

    const subirArchivo = async () => {
        if (!isPerfil && !titulo.trim()) {
            Alert.alert('Error', 'El título es requerido');
            return;
        }

        if (!archivo) {
            Alert.alert('Error', 'Debes seleccionar una imagen');
            return;
        }

        setLoading(true);
        try {
            // Determinar URL y método
            let url = '/galeria';

            if (isPerfil) {
                url = '/auth/foto';
            }

            // Preparar formData
            const formData = new FormData();

            // Nombre del campo según el endpoint
            const fieldName = isPerfil ? 'foto' : 'archivo';

            // Determinar tipo de archivo
            const fileType = 'image/jpeg';
            const fileName = archivo.uri.split('/').pop();

            formData.append(fieldName, {
                uri: archivo.uri,
                name: fileName,
                type: fileType,
            });

            if (!isPerfil) {
                formData.append('titulo', titulo);
                formData.append('descripcion', descripcion);
            }

            const response = await api.post(url, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.success) {
                if (isPerfil) {
                    Alert.alert('Éxito', 'Foto de perfil actualizada', [
                        { text: 'OK', onPress: () => navigation.goBack() }
                    ]);
                } else {
                    Alert.alert('Éxito', 'Archivo subido correctamente', [
                        { text: 'OK', onPress: () => navigation.goBack() }
                    ]);
                }
            }
        } catch (error) {
            console.error('Error al subir archivo:', error);
            Alert.alert('Error', 'No se pudo subir el archivo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.primary, COLORS.tertiary]}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{isPerfil ? 'Cambiar Foto de Perfil' : 'Subir a Galería'}</Text>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content}>
                <View style={styles.formCard}>
                    {!isPerfil && (
                        <>
                            <Input
                                label="Título *"
                                value={titulo}
                                onChangeText={setTitulo}
                                placeholder="Ej: Retiro de Cuaresma 2024"
                            />

                            <Input
                                label="Descripción"
                                value={descripcion}
                                onChangeText={setDescripcion}
                                placeholder="Breve descripción del momento..."
                            />
                        </>
                    )}

                    <Text style={styles.label}>{isPerfil ? 'Seleccionar Nueva Foto' : 'Imagen o Video *'}</Text>
                    <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
                        {archivo ? (
                            <Image source={{ uri: archivo.uri }} style={styles.previewImage} />
                        ) : (
                            <View style={styles.uploadPlaceholder}>
                                <Text style={styles.uploadIcon}>📷</Text>
                                <Text style={styles.uploadText}>Toca para seleccionar</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <Button
                        title={isPerfil ? "Guardar Foto" : "Subir Archivo"}
                        onPress={subirArchivo}
                        loading={loading}
                        style={styles.submitButton}
                    />
                </View>
            </ScrollView>
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
    content: {
        padding: SPACING.lg,
    },
    formCard: {
        backgroundColor: COLORS.white,
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        ...SHADOWS.medium,
        marginBottom: SPACING.xl,
    },
    label: {
        fontSize: FONT_SIZES.sm,
        fontWeight: 'bold',
        color: COLORS.darkGray,
        marginBottom: SPACING.xs,
        marginTop: SPACING.md,
    },
    uploadArea: {
        height: 200,
        backgroundColor: COLORS.offWhite,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        marginTop: SPACING.xs,
    },
    uploadPlaceholder: {
        alignItems: 'center',
    },
    uploadIcon: {
        fontSize: 40,
        marginBottom: SPACING.sm,
        color: COLORS.gray,
    },
    uploadText: {
        color: COLORS.gray,
        fontSize: FONT_SIZES.sm,
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    submitButton: {
        marginTop: SPACING.xl,
    },
});

export default SubirFotoScreen;
