import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    TextInput,
    TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import api from '../config/api';
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const CrearActaScreen = ({ navigation }) => {
    const [titulo, setTitulo] = useState('');
    const [tipoReunion, setTipoReunion] = useState('consejo');
    const [contenido, setContenido] = useState('');
    const [loading, setLoading] = useState(false);

    const guardarActa = async () => {
        if (!titulo.trim() || !contenido.trim()) {
            Alert.alert('Error', 'Por favor completa todos los campos requeridos');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/actas', {
                titulo,
                tipoReunion,
                contenido,
                fecha: new Date()
            });

            if (response.data.success) {
                Alert.alert(
                    'Éxito',
                    'Acta creada correctamente',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            }
        } catch (error) {
            console.error('Error al crear acta:', error);
            Alert.alert('Error', 'No se pudo guardar el acta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.accent, COLORS.primary]}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Nueva Acta</Text>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content}>
                <View style={styles.formCard}>
                    <Text style={styles.label}>Título de la Reunión *</Text>
                    <Input
                        placeholder="Ej: Reunión de Consejo Ordinaria"
                        value={titulo}
                        onChangeText={setTitulo}
                    />

                    <Text style={styles.label}>Tipo de Reunión</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            style={{ color: '#1A1A1A' }}
                            dropdownIconColor="#424242"
                            selectedValue={tipoReunion}
                            onValueChange={(v) => setTipoReunion(v)}
                        >
                            <Picker.Item color="#1A1A1A" label="Consejo" value="consejo" />
                            <Picker.Item color="#1A1A1A" label="Fraternidad" value="fraternidad" />
                            <Picker.Item color="#1A1A1A" label="Formación" value="formacion" />
                            <Picker.Item color="#1A1A1A" label="Extraordinaria" value="extraordinaria" />
                        </Picker>
                    </View>

                    <Text style={styles.label}>Contenido del Acta *</Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Escribe aquí los puntos tratados, acuerdos y desarrollo de la reunión..."
                        value={contenido}
                        onChangeText={setContenido}
                        multiline
                        numberOfLines={10}
                        textAlignVertical="top"
                    />

                    <Button
                        title="Guardar Acta"
                        onPress={guardarActa}
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
    },
    textArea: {
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.offWhite,
        padding: SPACING.md,
        fontSize: FONT_SIZES.md,
        minHeight: 200,
    },
    submitButton: {
        marginTop: SPACING.xl,
    },
});

export default CrearActaScreen;
