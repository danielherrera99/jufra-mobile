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

const CrearAnuncioScreen = ({ navigation, route }) => {
    const [titulo, setTitulo] = useState('');
    const [contenido, setContenido] = useState('');
    const [tipo, setTipo] = useState('general');
    const [prioridad, setPrioridad] = useState('normal');
    const [destinatarios, setDestinatarios] = useState('todos');
    const [imagen, setImagen] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [ubicacion, setUbicacion] = useState(null);

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

    const handleCrear = async () => {
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

            if (imagen) {
                const filename = imagen.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                formData.append('imagen', {
                    uri: imagen,
                    name: filename,
                    type,
                });
            }

            const response = await api.post('/anuncios', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                Alert.alert('Éxito', 'Anuncio publicado correctamente', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            }
        } catch (error) {
            console.error('Error al crear anuncio:', error);
            Alert.alert('Error', 'No se pudo publicar el anuncio');
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
                <Text style={styles.headerTitle}>Nuevo Anuncio</Text>
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
                        onPress={() => navigation.navigate('SeleccionarUbicacion', { returnScreen: 'CrearAnuncio' })}
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
                                <Text style={styles.imagePlaceholderText}>📷 Toca para seleccionar imagen</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.label}>Tipo de Anuncio</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            style={{ color: '#1A1A1A' }}
                            dropdownIconColor="#424242"
                            selectedValue={tipo}
                            onValueChange={(itemValue) => setTipo(itemValue)}
                        >
                            <Picker.Item color="#1A1A1A" label="📢 General" value="general" />
                            <Picker.Item color="#1A1A1A" label="🚨 Urgente" value="urgente" />
                            <Picker.Item color="#1A1A1A" label="📅 Evento" value="evento" />
                            <Picker.Item color="#1A1A1A" label="📖 Formación" value="formacion" />
                            <Picker.Item color="#1A1A1A" label="🙏 Apostolado" value="apostolado" />
                        </Picker>
                    </View>

                    <Text style={styles.label}>Prioridad</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            style={{ color: '#1A1A1A' }}
                            dropdownIconColor="#424242"
                            selectedValue={prioridad}
                            onValueChange={(itemValue) => setPrioridad(itemValue)}
                        >
                            <Picker.Item color="#1A1A1A" label="Normal" value="normal" />
                            <Picker.Item color="#1A1A1A" label="Alta" value="alta" />
                            <Picker.Item color="#1A1A1A" label="Baja" value="baja" />
                        </Picker>
                    </View>

                    <Text style={styles.label}>Destinatarios</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            style={{ color: '#1A1A1A' }}
                            dropdownIconColor="#424242"
                            selectedValue={destinatarios}
                            onValueChange={(itemValue) => setDestinatarios(itemValue)}
                        >
                            <Picker.Item color="#1A1A1A" label="Todos" value="todos" />
                            <Picker.Item color="#1A1A1A" label="Consejo" value="consejo" />
                            <Picker.Item color="#1A1A1A" label="Formación" value="formacion" />
                            <Picker.Item color="#1A1A1A" label="Promesados" value="promesados" />
                        </Picker>
                    </View>

                    <Button
                        title="Publicar Anuncio"
                        onPress={handleCrear}
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

export default CrearAnuncioScreen;
