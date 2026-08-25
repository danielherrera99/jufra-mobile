import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    TouchableOpacity,
    Platform,
    Image,
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
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const CrearEventoScreen = ({ navigation, route }) => {
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
    const [loading, setLoading] = useState(false);
    const [ubicacion, setUbicacion] = useState(null);

    React.useEffect(() => {
        if (route.params?.pickedLocation) {
            setUbicacion(route.params.pickedLocation);
        }
    }, [route.params?.pickedLocation]);

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
            setImagen(result.assets[0].uri);
        }
    };

    const guardarEvento = async () => {
        if (!titulo.trim()) {
            Alert.alert('Error', 'El título es requerido');
            return;
        }

        setLoading(true);
        console.log('--- Iniciando creación de evento ---');
        try {
            // Combinar fecha y hora
            const fechaEvento = new Date(fecha);
            fechaEvento.setHours(hora.getHours());
            fechaEvento.setMinutes(hora.getMinutes());

            const horaString = format(hora, 'HH:mm');

            const formData = new FormData();
            formData.append('titulo', titulo.trim());
            formData.append('descripcion', descripcion.trim());
            formData.append('lugar', lugar.trim());
            formData.append('tipo', tipo);
            formData.append('fecha', fechaEvento.toISOString());
            formData.append('hora', horaString);
            formData.append('visibilidad', visibilidad);
            formData.append('publicar_web', publicarWeb ? 'true' : 'false');

            if (ubicacion) {
                console.log('Agregando ubicación:', ubicacion);
                formData.append('lat', ubicacion.latitude.toString());
                formData.append('lng', ubicacion.longitude.toString());
            }

            if (imagen) {
                console.log('Procesando imagen:', imagen);
                const filename = imagen.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';
                
                formData.append('imagen', {
                    uri: imagen,
                    name: filename,
                    type: type,
                });
            }

            console.log('Enviando FormData a API...');
            const response = await api.post('/eventos', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json'
                },
            });

            if (response.data.success) {
                Alert.alert(
                    'Éxito',
                    'Evento creado correctamente',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            }
        } catch (error) {
            console.error('Error detallado al crear evento:', error);
            if (error.response) {
                console.error('Respuesta del servidor:', error.response.data);
                console.error('Status:', error.response.status);
            }
            Alert.alert('Error', 'No se pudo guardar el evento: ' + (error.response?.data?.message || 'Error de conexión'));
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
                    <Text style={styles.headerTitle}>Nuevo Evento</Text>
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
                            style={[styles.picker, { color: '#1A1A1A' }]}
                            dropdownIconColor="#424242"
                        >
                            <Picker.Item color="#1A1A1A" label="Reunión" value="reunion" />
                            <Picker.Item color="#1A1A1A" label="Misa" value="misa" />
                            <Picker.Item color="#1A1A1A" label="Formación" value="formacion" />
                            <Picker.Item color="#1A1A1A" label="Retiro" value="retiro" />
                            <Picker.Item color="#1A1A1A" label="Fraternidad" value="fraternidad" />
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

                    <TouchableOpacity
                        style={styles.mapButton}
                        onPress={() => navigation.navigate('SeleccionarUbicacion', { returnScreen: 'CrearEvento' })}
                    >
                        <Text style={styles.mapButtonText}>
                            {ubicacion ? '📍 Ubicación Seleccionada' : '🗺️ Seleccionar en Mapa'}
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.label}>Descripción (Opcional)</Text>
                    <Input
                        placeholder="Detalles adicionales..."
                        value={descripcion}
                        onChangeText={setDescripcion}
                        multiline
                        numberOfLines={3}
                    />

                    <Text style={styles.label}>Imagen (Opcional)</Text>
                    <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
                        {imagen ? (
                            <Image source={{ uri: imagen }} style={styles.previewImage} />
                        ) : (
                            <View style={styles.uploadPlaceholder}>
                                <Text style={styles.uploadIcon}>📷</Text>
                                <Text style={styles.uploadText}>Toca para seleccionar imagen</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <Button
                        title="Guardar Evento"
                        onPress={guardarEvento}
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
});

export default CrearEventoScreen;
