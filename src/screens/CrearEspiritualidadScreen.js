import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import api from '../config/api';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const CrearEspiritualidadScreen = ({ navigation, route }) => {
    const itemEditar = route.params?.item;
    const isEditing = !!itemEditar;

    const [titulo, setTitulo] = useState(itemEditar?.titulo || '');
    const [contenido, setContenido] = useState(itemEditar?.contenido || '');
    const [tipo, setTipo] = useState(itemEditar?.tipo || 'oracion');
    const [loading, setLoading] = useState(false);

    const guardar = async () => {
        if (!titulo.trim() || !contenido.trim()) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }

        setLoading(true);
        try {
            const data = { titulo, contenido, tipo };

            if (isEditing) {
                await api.put(`/espiritualidad/${itemEditar._id}`, data);
                Alert.alert('Éxito', 'Contenido actualizado correctamente');
            } else {
                await api.post('/espiritualidad', data);
                Alert.alert('Éxito', 'Contenido creado correctamente');
            }
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudo guardar el contenido');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.tertiary, COLORS.primary]}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {isEditing ? 'Editar Contenido' : 'Nuevo Contenido'}
                    </Text>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content}>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Tipo</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={tipo}
                            onValueChange={(v) => setTipo(v)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Oración" value="oracion" />
                            <Picker.Item label="Carisma" value="carisma" />
                        </Picker>
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Título</Text>
                    <TextInput
                        style={styles.input}
                        value={titulo}
                        onChangeText={setTitulo}
                        placeholder="Ej: Oración por la Paz"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Contenido</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={contenido}
                        onChangeText={setContenido}
                        placeholder="Escribe el contenido aquí..."
                        multiline
                        numberOfLines={10}
                        textAlignVertical="top"
                    />
                </View>

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={guardar}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <Text style={styles.submitButtonText}>
                            {isEditing ? 'Actualizar' : 'Crear'}
                        </Text>
                    )}
                </TouchableOpacity>
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
    formGroup: {
        marginBottom: SPACING.lg,
    },
    label: {
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: SPACING.xs,
    },
    input: {
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        fontSize: FONT_SIZES.md,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    pickerContainer: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    picker: {
        height: 50,
    },
    textArea: {
        minHeight: 200,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        marginTop: SPACING.md,
        marginBottom: SPACING.xl,
        ...SHADOWS.medium,
    },
    submitButtonText: {
        color: COLORS.white,
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
    },
});

export default CrearEspiritualidadScreen;
