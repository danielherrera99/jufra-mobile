import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../config/api';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const EditarFotoScreen = ({ navigation, route }) => {
    const { item } = route.params;
    const [titulo, setTitulo] = useState(item.titulo);
    const [descripcion, setDescripcion] = useState(item.descripcion || '');
    const [loading, setLoading] = useState(false);

    const guardar = async () => {
        if (!titulo.trim()) {
            Alert.alert('Error', 'El título es obligatorio');
            return;
        }

        setLoading(true);
        try {
            await api.put(`/galeria/${item._id}`, {
                titulo,
                descripcion
            });
            Alert.alert('Éxito', 'Información actualizada', [
                { text: 'OK', onPress: () => navigation.navigate('Galeria') } // Go back to gallery to refresh, or handle refresh in detail
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudo actualizar');
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
                    <Text style={styles.headerTitle}>Editar Foto/Video</Text>
                </View>
            </LinearGradient>

            <View style={styles.content}>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Título</Text>
                    <TextInput
                        style={styles.input}
                        value={titulo}
                        onChangeText={setTitulo}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Descripción</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={descripcion}
                        onChangeText={setDescripcion}
                        multiline
                        numberOfLines={4}
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
                        <Text style={styles.submitButtonText}>Guardar Cambios</Text>
                    )}
                </TouchableOpacity>
            </View>
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
    textArea: {
        minHeight: 100,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        marginTop: SPACING.md,
        ...SHADOWS.medium,
    },
    submitButtonText: {
        color: COLORS.white,
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
    },
});

export default EditarFotoScreen;
