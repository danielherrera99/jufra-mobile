import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    TouchableOpacity,
    Platform,
    Image,
    ActivityIndicator,
    Switch
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import api from '../config/api';
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const EditarEventoScreen = ({ navigation, route }) => {
    const { eventoId } = route.params;
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [lugar, setLugar] = useState('');
    const [tipo, setTipo] = useState('reunion');
    const [fecha, setFecha] = useState(new Date());
    const [hora, setHora] = useState(new Date());
    const [visibilidad, setVisibilidad] = useState('todos');
    const [publicarWeb, setPublicarWeb] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [imagen, setImagen] = useState(null);
    const [imagenActual, setImagenActual] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        cargarEvento();
    }, []);

    const cargarEvento = async () => {
        try {
            // Como no tenemos un endpoint GET /eventos/:id específico en la lista que vi,
            // asumiré que existe o que puedo filtrar de la lista.
            // Pero lo ideal es tener GET /eventos/:id.
            // Si no existe, tendré que usar la lista y buscar.
            // Revisando routes/eventos.js, NO VI un GET /:id.
            // Voy a asumir que puedo pasarlo por params o que debo implementarlo.
            // ESPERA: routes/eventos.js NO TIENE GET /:id.
            // Sin embargo, puedo obtener la lista y filtrar en el cliente si es necesario,
            // o mejor, agregar el endpoint GET /:id al backend.
            // Por ahora, para no complicar, voy a asumir que el objeto evento completo se pasa por params
            // O voy a agregar el endpoint GET /:id al backend.

            // Voy a agregar GET /:id al backend en el siguiente paso si falla.
            // Pero primero intentemos obtenerlo.

            // REVISIÓN: routes/eventos.js solo tiene GET / (lista).
            // Voy a agregar GET /:id al backend.

            // Por ahora, simularé que paso los datos por params si es posible, 
            // pero la mejor práctica es volver a cargar.

            // Voy a implementar GET /:id en el backend.
            const response = await api.get(`/eventos`, { params: { visibilidad: 'app' } }); // Temporalmente traer todos y buscar
            if (response.data.success) {
                const eventoEncontrado = response.data.eventos.find(e => e._id === eventoId);
                if (eventoEncontrado) {
                    setTitulo(eventoEncontrado.titulo);
                    setDescripcion(eventoEncontrado.descripcion || '');
                    setLugar(eventoEncontrado.lugar || '');
                    setTipo(eventoEncontrado.tipo);
                    setFecha(new Date(eventoEncontrado.fecha));
                    setVisibilidad(eventoEncontrado.visibilidad || 'todos');
                    setPublicarWeb(eventoEncontrado.publicar_web || false);

                    if (eventoEncontrado.hora) {
                        const [h, m] = eventoEncontrado.hora.split(':');
                        const dateHora = new Date();
                        dateHora.setHours(h);
                        dateHora.setMinutes(m);
                        setHora(dateHora);
                    }

                    setImagenActual(eventoEncontrado.imagenUrl);
                } else {
                    Alert.alert('Error', 'Evento no encontrado');
                    navigation.goBack();
                }
            }
        } catch (error) {
            console.error('Error al cargar evento:', error);
            Alert.alert('Error', 'No se pudo cargar la información del evento');
            navigation.goBack();
        } finally {
            setFetching(false);
        }
    };

    const onDateChange = (event, selectedDate) => {
        if (event.type === 'dismissed') {
            setShowDatePicker(false);
            return;
        }
        const currentDate = selectedDate || fecha;
        setShowDatePicker(Platform.OS === 'ios');
        setFecha(currentDate);
    };

    const onTimeChange = (event, selectedTime) => {
        if (event.type === 'dismissed') {
            setShowTimePicker(false);
            return;
        }
        const currentTime = selectedTime || hora;
        setShowTimePicker(Platform.OS === 'ios');
        setHora(currentTime);
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para subir imágenes.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImagen(result.assets[0]);
        }
    };

    const guardarCambios = async () => {
        if (!titulo.trim()) {
            Alert.alert('Error', 'El título es requerido');
            return;
        }

        setLoading(true);
        try {
            const fechaEvento = new Date(fecha);
            fechaEvento.setHours(hora.getHours());
            fechaEvento.setMinutes(hora.getMinutes());

            const horaString = format(hora, 'HH:mm');

            const formData = new FormData();
            formData.append('titulo', titulo);
            formData.append('descripcion', descripcion);
            formData.append('lugar', lugar);
            formData.append('tipo', tipo);
            formData.append('fecha', fechaEvento.toISOString());
            formData.append('hora', horaString);
            formData.append('visibilidad', visibilidad);
            formData.append('publicar_web', publicarWeb ? 'true' : 'false');

            if (imagen) {
                const fileName = imagen.uri.split('/').pop();
                const fileType = 'image/jpeg';
                formData.append('imagen', {
                    uri: imagen.uri,
                    name: fileName,
                    type: fileType,
                });
            }

            const response = await api.put(`/eventos/${eventoId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.success) {
                Alert.alert(
                    'Éxito',
                    'Evento actualizado correctamente',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            }
        } catch (error) {
            console.error('Error al actualizar evento:', error);
            Alert.alert('Error', 'No se pudo actualizar el evento');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

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
                    <Text style={styles.headerTitle}>Editar Evento</Text>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content}>
                <View style={styles.formCard}>
                    <Text style={styles.label}>Título del Evento *</Text>
                    <Input
                        placeholder="Ej: Reunión Semanal"
                        value={titulo}
                        onChangeText={setTitulo}
                    />

                    <Text style={styles.label}>Tipo de Evento</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={tipo}
                            onValueChange={(itemValue) => setTipo(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Reunión" value="reunion" />
                            <Picker.Item label="Misa" value="misa" />
                            <Picker.Item label="Formación" value="formacion" />
                            <Picker.Item label="Retiro" value="retiro" />
                            <Picker.Item label="Fraternidad" value="fraternidad" />
                            <Picker.Item color="#1A1A1A" label="Otro" value="otro" />
                        </Picker>
                    </View>

                    <Text style={styles.label}>📍 Visibilidad</Text>
                    <View style={[styles.pickerContainer, { borderColor: COLORS.primary, borderWidth: 2 }]}>
                        <Picker
                            selectedValue={visibilidad}
                            onValueChange={(itemValue) => setVisibilidad(itemValue)}
                            style={[styles.picker, { color: '#1A1A1A' }]}
                            dropdownIconColor="#424242"
                        >
                            <Picker.Item color="#1A1A1A" label="🔄 Ambos (App y Web)" value="todos" />
                            <Picker.Item color="#1A1A1A" label="📱 Solo App (Interno)" value="app" />
                            <Picker.Item color="#1A1A1A" label="🌐 Solo Web (Público)" value="web" />
                        </Picker>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 15, paddingHorizontal: 5 }}>
                        <Switch
                            trackColor={{ false: '#767577', true: COLORS.primary }}
                            thumbColor={publicarWeb ? '#fff' : '#f4f3f4'}
                            onValueChange={setPublicarWeb}
                            value={publicarWeb}
                        />
                        <Text style={[styles.label, { marginBottom: 0, marginLeft: 10, flex: 1 }]}>
                            🌐 Publicar en Web (Aparecerá en "Próximos Encuentros")
                        </Text>
                    </View>

                    <Text style={styles.label}>Fecha</Text>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text style={styles.dateText}>
                            {format(fecha, "EEEE d 'de' MMMM, yyyy", { locale: es })}
                        </Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={fecha}
                            mode="date"
                            display="default"
                            onChange={onDateChange}
                        />
                    )}

                    <Text style={styles.label}>Hora</Text>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowTimePicker(true)}
                    >
                        <Text style={styles.dateText}>
                            {format(hora, 'HH:mm')}
                        </Text>
                    </TouchableOpacity>
                    {showTimePicker && (
                        <DateTimePicker
                            value={hora}
                            mode="time"
                            display="default"
                            onChange={onTimeChange}
                        />
                    )}

                    <Text style={styles.label}>Lugar</Text>
                    <Input
                        placeholder="Ej: Parroquia San Francisco"
                        value={lugar}
                        onChangeText={setLugar}
                    />

                    <Text style={styles.label}>Descripción (Opcional)</Text>
                    <Input
                        placeholder="Detalles adicionales..."
                        value={descripcion}
                        onChangeText={setDescripcion}
                        multiline
                        numberOfLines={3}
                    />

                    <Text style={styles.label}>Imagen</Text>
                    {imagenActual && !imagen && (
                        <View style={styles.currentImageContainer}>
                            <Image source={{ uri: imagenActual }} style={styles.currentImage} />
                            <Text style={styles.currentImageText}>Imagen actual</Text>
                        </View>
                    )}

                    <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
                        {imagen ? (
                            <Image source={{ uri: imagen.uri }} style={styles.previewImage} />
                        ) : (
                            <View style={styles.uploadPlaceholder}>
                                <Text style={styles.uploadIcon}>📷</Text>
                                <Text style={styles.uploadText}>
                                    {imagenActual ? 'Cambiar imagen' : 'Seleccionar imagen'}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <Button
                        title="Guardar Cambios"
                        onPress={guardarCambios}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    pickerContainer: {
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.offWhite,
        marginBottom: SPACING.sm,
    },
    picker: {
        height: 50,
    },
    dateButton: {
        padding: SPACING.md,
        backgroundColor: COLORS.offWhite,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    dateText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.black,
    },
    uploadArea: {
        height: 150,
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
        fontSize: 30,
        marginBottom: SPACING.xs,
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
    currentImageContainer: {
        marginBottom: SPACING.sm,
        alignItems: 'center',
    },
    currentImage: {
        width: '100%',
        height: 150,
        borderRadius: BORDER_RADIUS.md,
        resizeMode: 'cover',
    },
    currentImageText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.gray,
        marginTop: 4,
    },
    submitButton: {
        marginTop: SPACING.xl,
    },
});

export default EditarEventoScreen;
