import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Image,
    TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import api from '../config/api';
import Input from '../components/Input';
import Button from '../components/Button';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants/theme';

const EditarAnuncioScreen = ({ navigation, route }) => {
    const { anuncio } = route.params;
    const [titulo, setTitulo] = useState(anuncio.titulo);
    const [contenido, setContenido] = useState(anuncio.contenido);
    const [tipo, setTipo] = useState(anuncio.tipo);
    const [prioridad, setPrioridad] = useState(anuncio.prioridad);
    const [destinatarios, setDestinatarios] = useState(anuncio.destinatarios);
    const [imagen, setImagen] = useState(anuncio.imagen);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [ubicacion, setUbicacion] = useState(
        anuncio.ubicacion && anuncio.ubicacion.lat
            ? { latitude: anuncio.ubicacion.lat, longitude: anuncio.ubicacion.lng }
            : null
    );

    React.useEffect(() => {
        if (route.params?.pickedLocation) {
            setUbicacion(route.params.pickedLocation);
        }
    }, [route.params?.pickedLocation]);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Necesitamos permiso para acceder a tu galería.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImagen(result.assets[0].uri);
        }
    };

    const validarFormulario = () => {
        const nuevosErrores = {};

        if (!titulo.trim()) {
            nuevosErrores.titulo = 'El título es requerido';
        }

        if (!contenido.trim()) {
            nuevosErrores.contenido = 'El contenido es requerido';
        }

        setErrors(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleGuardar = async () => {
        if (!validarFormulario()) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('titulo', titulo);
            formData.append('contenido', contenido);
            formData.append('tipo', tipo);
            formData.append('prioridad', prioridad);
            formData.append('destinatarios', destinatarios);

            if (ubicacion) {
                formData.append('lat', ubicacion.latitude.toString());
                formData.append('lng', ubicacion.longitude.toString());
            }

            if (imagen && imagen !== anuncio.imagen) {
                const filename = imagen.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                formData.append('imagen', {
                    uri: imagen,
                    name: filename,
                    type,
                });
            }

            const response = await api.put(`/anuncios/${anuncio._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                Alert.alert('Éxito', 'Anuncio actualizado correctamente', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            }
        } catch (error) {
            console.error('Error al actualizar anuncio:', error);
            Alert.alert('Error', 'No se pudo actualizar el anuncio');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <LinearGradient
                colors={[COLORS.secondary, COLORS.primary]}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>Editar Anuncio</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.formCard}>
                    <Input
                        label="Título"
                        value={titulo}
                        onChangeText={setTitulo}
                        placeholder="Ej: Reunión de Consejo"
                        error={errors.titulo}
                    />

                    <Input
                        label="Contenido"
                        value={contenido}
                        onChangeText={setContenido}
                        placeholder="Escribe el detalle del anuncio..."
                        multiline
                        numberOfLines={4}
                        error={errors.contenido}
                        style={{ height: 100, textAlignVertical: 'top' }}
                    />

                    <TouchableOpacity
                        style={styles.mapButton}
                        onPress={() => navigation.navigate('SeleccionarUbicacion', { returnScreen: 'EditarAnuncio' })}
                    >
                        <Text style={styles.mapButtonText}>
                            {ubicacion ? '📍 Ubicación Seleccionada' : '🗺️ Seleccionar en Mapa'}
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.label}>Imagen (Opcional)</Text>
                    <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                        {imagen ? (
                            <Image source={{ uri: imagen }} style={styles.imagePreview} />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Text style={styles.imagePlaceholderText}>📷 Toca para cambiar imagen</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.label}>Tipo de Anuncio</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={tipo}
                            onValueChange={(itemValue) => setTipo(itemValue)}
                        >
                            <Picker.Item label="📢 General" value="general" />
                            <Picker.Item label="🚨 Urgente" value="urgente" />
                            <Picker.Item label="📅 Evento" value="evento" />
                            <Picker.Item label="📖 Formación" value="formacion" />
                            <Picker.Item label="🙏 Apostolado" value="apostolado" />
                        </Picker>
                    </View>

                    <Text style={styles.label}>Prioridad</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={prioridad}
                            onValueChange={(itemValue) => setPrioridad(itemValue)}
                        >
                            <Picker.Item label="Normal" value="normal" />
                            <Picker.Item label="Alta" value="alta" />
                            <Picker.Item label="Baja" value="baja" />
                        </Picker>
                    </View>

                    <Text style={styles.label}>Destinatarios</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={destinatarios}
                            onValueChange={(itemValue) => setDestinatarios(itemValue)}
                        >
                            <Picker.Item label="Todos" value="todos" />
                            <Picker.Item label="Consejo" value="consejo" />
                            <Picker.Item label="Formación" value="formacion" />
                            <Picker.Item label="Promesados" value="promesados" />
                        </Picker>
                    </View>

                    <Button
                        title="Guardar Cambios"
                        onPress={handleGuardar}
                        loading={loading}
                        style={styles.submitButton}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
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
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    label: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.darkGray,
        marginBottom: SPACING.xs,
        marginTop: SPACING.md,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.sm,
        backgroundColor: COLORS.offWhite,
    },
    submitButton: {
        marginTop: SPACING.xl,
        backgroundColor: COLORS.secondary,
    },
    mapButton: {
        backgroundColor: COLORS.tertiary,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        marginTop: SPACING.sm,
        marginBottom: SPACING.md,
    },
    mapButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: FONT_SIZES.md,
    },
    imagePicker: {
        height: 200,
        backgroundColor: COLORS.offWhite,
        borderRadius: BORDER_RADIUS.md,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderStyle: 'dashed',
        marginBottom: SPACING.md,
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        alignItems: 'center',
    },
    imagePlaceholderText: {
        color: COLORS.gray,
        marginTop: SPACING.sm,
    },
});

export default EditarAnuncioScreen;
