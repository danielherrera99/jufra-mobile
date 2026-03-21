import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    TextInput,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import api from '../config/api';
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const EditarActaScreen = ({ navigation, route }) => {
    const { actaId } = route.params;
    const [titulo, setTitulo] = useState('');
    const [tipoReunion, setTipoReunion] = useState('consejo');
    const [contenido, setContenido] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        cargarActa();
    }, []);

    const cargarActa = async () => {
        try {
            const response = await api.get(`/actas/${actaId}`);
            if (response.data.success) {
                const { acta } = response.data;
                setTitulo(acta.titulo);
                setTipoReunion(acta.tipoReunion);
                setContenido(acta.contenido);
            }
        } catch (error) {
            console.error('Error al cargar acta:', error);
            Alert.alert('Error', 'No se pudo cargar la información del acta');
            navigation.goBack();
        } finally {
            setFetching(false);
        }
    };

    const guardarCambios = async () => {
        if (!titulo.trim() || !contenido.trim()) {
            Alert.alert('Error', 'Por favor completa todos los campos requeridos');
            return;
        }

        setLoading(true);
        try {
            const response = await api.put(`/actas/${actaId}`, {
                titulo,
                tipoReunion,
                contenido
            });

            if (response.data.success) {
                Alert.alert(
                    'Éxito',
                    'Acta actualizada correctamente',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            }
        } catch (error) {
            console.error('Error al actualizar acta:', error);
            Alert.alert('Error', 'No se pudo actualizar el acta');
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
                colors={[COLORS.accent, COLORS.primary]}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Editar Acta</Text>
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
                            selectedValue={tipoReunion}
                            onValueChange={(v) => setTipoReunion(v)}
                        >
                            <Picker.Item label="Consejo" value="consejo" />
                            <Picker.Item label="Fraternidad" value="fraternidad" />
                            <Picker.Item label="Formación" value="formacion" />
                            <Picker.Item label="Extraordinaria" value="extraordinaria" />
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

export default EditarActaScreen;
