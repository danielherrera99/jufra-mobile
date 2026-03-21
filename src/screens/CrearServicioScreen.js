import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    TouchableOpacity,
    TextInput,
    Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import api from '../config/api';
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const CrearServicioScreen = ({ navigation, route }) => {
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [lugar, setLugar] = useState('');
    const [cupoMaximo, setCupoMaximo] = useState('');
    const [fecha, setFecha] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [imagen, setImagen] = useState(null);
    const [ubicacion, setUbicacion] = useState(null);

    React.useEffect(() => {
        if (route.params?.pickedLocation) {
            setUbicacion(route.params.pickedLocation);
        }
    }, [route.params?.pickedLocation]);

    const onChangeDate = (event, selectedDate) => {
        const currentDate = selectedDate || fecha;
        setShowDatePicker(Platform.OS === 'ios');
        setFecha(currentDate);
    };

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

    const guardarServicio = async () => {
        if (!titulo.trim() || !descripcion.trim() || !lugar.trim()) {
            Alert.alert('Error', 'Por favor completa los campos requeridos');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('titulo', titulo);
            formData.append('descripcion', descripcion);
            formData.append('lugar', lugar);
            formData.append('fecha', fecha.toISOString());
            formData.append('cupoMaximo', cupoMaximo ? cupoMaximo : '0');

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

            const response = await api.post('/servicios', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                Alert.alert(
                    'Éxito',
                    'Actividad creada correctamente',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            }
        } catch (error) {
            console.error('Error al crear servicio:', error);
            Alert.alert('Error', 'No se pudo guardar la actividad');
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
                    <Text style={styles.headerTitle}>Nueva Actividad</Text>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content}>
                <View style={styles.formCard}>
                    <Input
                        label="Título *"
                        value={titulo}
                        onChangeText={setTitulo}
                        placeholder="Ej: Visita al Asilo"
                    />

                    <Input
                        label="Lugar *"
                        value={lugar}
                        onChangeText={setLugar}
                        placeholder="Ej: Hogar San José"
                    />

                    <TouchableOpacity
                        style={styles.mapButton}
                        onPress={() => navigation.navigate('SeleccionarUbicacion', { returnScreen: 'CrearServicio' })}
                    >
                        <Text style={styles.mapButtonText}>
                            {ubicacion ? '📍 Ubicación Seleccionada' : '🗺️ Seleccionar en Mapa'}
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.label}>Fecha y Hora</Text>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text style={styles.dateText}>
                            {fecha.toLocaleString()}
                        </Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={fecha}
                            mode="datetime"
                            is24Hour={true}
                            display="default"
                            onChange={onChangeDate}
                        />
                    )}

                    <Input
                        label="Cupo Máximo (Opcional)"
                        value={cupoMaximo}
                        onChangeText={setCupoMaximo}
                        placeholder="Ej: 10 (Dejar vacío si es ilimitado)"
                        keyboardType="numeric"
                    />

                    <Text style={styles.label}>Descripción *</Text>
                    <TextInput
                        style={styles.textArea}
                        value={descripcion}
                        onChangeText={setDescripcion}
                        placeholder="Detalles de la actividad, qué llevar, etc..."
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                    />

                    <Text style={styles.label}>Imagen (Opcional)</Text>
                    <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                        {imagen ? (
                            <Image source={{ uri: imagen }} style={styles.previewImage} />
                        ) : (
                            <View style={styles.placeholderContainer}>
                                <Text style={styles.placeholderIcon}>📷</Text>
                                <Text style={styles.placeholderText}>Toca para seleccionar imagen</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <Button
                        title="Publicar Actividad"
                        onPress={guardarServicio}
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
    dateButton: {
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        backgroundColor: COLORS.offWhite,
        marginBottom: SPACING.sm,
    },
    dateText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.black,
    },
    textArea: {
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        backgroundColor: COLORS.offWhite,
        fontSize: FONT_SIZES.md,
        minHeight: 120,
    },
    submitButton: {
        marginTop: SPACING.xl,
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
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        marginBottom: SPACING.md,
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderContainer: {
        alignItems: 'center',
    },
    placeholderIcon: {
        fontSize: 40,
        marginBottom: SPACING.xs,
        color: COLORS.gray,
    },
    placeholderText: {
        color: COLORS.gray,
        fontSize: FONT_SIZES.sm,
    },
});

export default CrearServicioScreen;
