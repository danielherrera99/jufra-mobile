import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import api from '../config/api';
import Button from '../components/Button';
import Input from '../components/Input';

const ComunicacionScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [hermanos, setHermanos] = useState([]);
    const [cargandoHermanos, setCargandoHermanos] = useState(true);

    const [formData, setFormData] = useState({
        filtro: 'todos',
        asunto: '',
        mensaje: '',
        correoManual: '',
        usuarioId: ''
    });

    useEffect(() => {
        cargarHermanos();
    }, []);

    const cargarHermanos = async () => {
        try {
            const response = await api.get('/hermanos?todos=true');
            if (response.data.success) {
                // Filtramos solo los que tienen correo para la lista individual
                setHermanos(response.data.hermanos.filter(h => h.email));
            }
        } catch (error) {
            console.error('Error al cargar hermanos:', error);
        } finally {
            setCargandoHermanos(false);
        }
    };

    const handleSubmit = async () => {
        if (formData.filtro === 'manual' && !formData.correoManual) {
            Alert.alert('Atención', 'Por favor escribe el correo de destino.');
            return;
        }
        if (formData.filtro === 'individual' && !formData.usuarioId) {
            Alert.alert('Atención', 'Por favor selecciona un hermano.');
            return;
        }
        if (!formData.asunto || !formData.mensaje) {
            Alert.alert('Atención', 'Por favor completa el asunto y el mensaje.');
            return;
        }

        Alert.alert(
            'Confirmar envío',
            '¿Estás seguro de que deseas enviar este comunicado oficial?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Enviar Correo',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const response = await api.post('/hermanos/comunicacion/masivo', formData);
                            if (response.data.success) {
                                Alert.alert('¡Éxito!', response.data.message);
                                setFormData({ filtro: 'todos', asunto: '', mensaje: '', correoManual: '', usuarioId: '' });
                                navigation.goBack();
                            }
                        } catch (err) {
                            const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
                            Alert.alert('Error al enviar comunicado', errorMsg);
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.header}>
                <LinearGradient
                    colors={[COLORS.primary, COLORS.secondary]}
                    style={styles.headerGradient}
                >
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Centro de Comunicación</Text>
                        <Text style={styles.headerSubtitle}>Envía correos oficiales</Text>
                    </View>
                </LinearGradient>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <Text style={styles.label}>Tipo de Envío:</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={formData.filtro}
                            onValueChange={(itemValue) => setFormData({ ...formData, filtro: itemValue })}
                            style={styles.picker}
                        >
                            <Picker.Item label="Todos los Hermanos Activos" value="todos" />
                            <Picker.Item label="🎯 Un solo hermano específico" value="individual" />
                            <Picker.Item label="✍️ Escribir correo manualmente (Externo)" value="manual" />
                            <Picker.Item label="Solo Administradores" value="admin" />
                            <Picker.Item label="Solo Miembros del Consejo" value="consejo" />
                            <Picker.Item label="Solo Miembros Base" value="miembro" />
                            <Picker.Item label="Aspirantes" value="aspirante" />
                            <Picker.Item label="Iniciados" value="iniciado" />
                            <Picker.Item label="En Formación" value="en_formacion" />
                            <Picker.Item label="Promesados" value="promesado" />
                        </Picker>
                    </View>

                    {formData.filtro === 'individual' && (
                        <View style={styles.conditionalField}>
                            <Text style={styles.label}>Seleccionar Hermano:</Text>
                            {cargandoHermanos ? (
                                <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 10 }} />
                            ) : (
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={formData.usuarioId}
                                        onValueChange={(itemValue) => setFormData({ ...formData, usuarioId: itemValue })}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="-- Elige un hermano --" value="" />
                                        {hermanos.map(h => (
                                            <Picker.Item key={h._id} label={`${h.nombre} ${h.apellido}`} value={h._id} />
                                        ))}
                                    </Picker>
                                </View>
                            )}
                        </View>
                    )}

                    {formData.filtro === 'manual' && (
                        <View style={styles.conditionalField}>
                            <Input
                                label="Correo Electrónico de Destino:"
                                placeholder="ejemplo@correo.com"
                                value={formData.correoManual}
                                onChangeText={(text) => setFormData({ ...formData, correoManual: text })}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    )}

                    <View style={{ marginTop: SPACING.md }}>
                        <Input
                            label="Asunto del Correo:"
                            placeholder="Ej: Invitación a Reunión Extraordinaria"
                            value={formData.asunto}
                            onChangeText={(text) => setFormData({ ...formData, asunto: text })}
                        />
                    </View>

                    <View style={{ marginTop: SPACING.md }}>
                        <Text style={styles.label}>Mensaje:</Text>
                        <Input
                            placeholder="Escribe aquí el contenido del mensaje..."
                            value={formData.mensaje}
                            onChangeText={(text) => setFormData({ ...formData, mensaje: text })}
                            multiline
                            numberOfLines={10}
                            style={styles.textArea}
                        />
                    </View>

                    <Button
                        title="🚀 Enviar Correo"
                        onPress={handleSubmit}
                        loading={loading}
                        style={styles.submitButton}
                    />
                </View>

                <View style={styles.tipBox}>
                    <Text style={styles.tipText}>
                        <Text style={{ fontWeight: 'bold' }}>Sugerencia:</Text> Puedes usar esta herramienta para enviar invitaciones personalizadas a personas que aún no descargan la app usando la opción "Escribir correo manualmente".
                    </Text>
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
        backgroundColor: COLORS.cream,
    },
    headerGradient: {
        paddingTop: 60,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.lg,
        borderBottomLeftRadius: BORDER_RADIUS.xl,
        borderBottomRightRadius: BORDER_RADIUS.xl,
        ...SHADOWS.medium,
    },
    headerContent: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: SPACING.xs,
    },
    headerSubtitle: {
        fontSize: FONT_SIZES.md,
        color: COLORS.ivory,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: SPACING.lg,
        paddingBottom: SPACING.xxl,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        ...SHADOWS.medium,
    },
    label: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.darkGray,
        marginBottom: SPACING.xs,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: '#FAFAFA',
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        width: '100%',
    },
    conditionalField: {
        marginTop: SPACING.md,
    },
    textArea: {
        height: 150,
        textAlignVertical: 'top',
    },
    submitButton: {
        marginTop: SPACING.xl,
    },
    tipBox: {
        marginTop: SPACING.lg,
        padding: SPACING.md,
        backgroundColor: '#E0F7FA',
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: '#B2EBF2',
    },
    tipText: {
        color: '#006064',
        fontSize: FONT_SIZES.sm,
        lineHeight: 20,
    },
});

export default ComunicacionScreen;
