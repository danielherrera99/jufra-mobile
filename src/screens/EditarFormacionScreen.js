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
import * as DocumentPicker from 'expo-document-picker';
import api from '../config/api';
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const EditarFormacionScreen = ({ navigation, route }) => {
    const { tema } = route.params;
    const [titulo, setTitulo] = useState(tema.titulo);
    const [descripcion, setDescripcion] = useState(tema.descripcion || '');
    const [contenido, setContenido] = useState(tema.contenido);
    const [etiquetas, setEtiquetas] = useState(tema.etiquetas ? tema.etiquetas.join(', ') : '');
    const [archivo, setArchivo] = useState(null);
    const [archivoExistente, setArchivoExistente] = useState(tema.archivoNombre || null);
    const [loading, setLoading] = useState(false);

    const seleccionarArchivo = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/*'],
                copyToCacheDirectory: true
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setArchivo(result.assets[0]);
                setArchivoExistente(null);
            }
        } catch (error) {
            console.error('Error al seleccionar archivo:', error);
            Alert.alert('Error', 'No se pudo seleccionar el archivo');
        }
    };

    const guardarCambios = async () => {
        if (!titulo.trim() || !contenido.trim()) {
            Alert.alert('Error', 'Por favor completa el título y el contenido');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('titulo', titulo);
            formData.append('descripcion', descripcion);
            formData.append('contenido', contenido);

            // Procesar etiquetas
            const etiquetasArray = etiquetas.split(',').map(e => e.trim()).filter(e => e);
            etiquetasArray.forEach(tag => formData.append('etiquetas[]', tag));

            if (archivo) {
                const fileToUpload = {
                    uri: archivo.uri,
                    type: archivo.mimeType || 'application/octet-stream',
                    name: archivo.name
                };
                formData.append('archivo', fileToUpload);
            }

            const response = await api.put(`/formacion/${tema._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                Alert.alert(
                    'Éxito',
                    'Tema actualizado correctamente',
                    [{ text: 'OK', onPress: () => navigation.navigate('DetalleFormacion', { temaId: tema._id }) }]
                );
            }
        } catch (error) {
            console.error('Error al actualizar tema:', error);
            Alert.alert('Error', 'No se pudo actualizar el tema');
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
                    <Text style={styles.headerTitle}>Editar Tema</Text>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content}>
                <View style={styles.formCard}>
                    <Text style={styles.label}>Título del Tema *</Text>
                    <Input
                        placeholder="Ej: Vida de San Francisco"
                        value={titulo}
                        onChangeText={setTitulo}
                    />

                    <Text style={styles.label}>Descripción Breve</Text>
                    <Input
                        placeholder="Resumen corto del tema..."
                        value={descripcion}
                        onChangeText={setDescripcion}
                    />

                    <Text style={styles.label}>Contenido Completo *</Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Escribe aquí todo el contenido del tema de formación..."
                        value={contenido}
                        onChangeText={setContenido}
                        multiline
                        numberOfLines={15}
                        textAlignVertical="top"
                    />

                    <Text style={styles.label}>Etiquetas (separadas por comas)</Text>
                    <Input
                        placeholder="Ej: historia, espiritualidad, valores"
                        value={etiquetas}
                        onChangeText={setEtiquetas}
                    />

                    <Text style={styles.label}>Archivo Adjunto (PDF/Word/Imagen)</Text>
                    <TouchableOpacity
                        style={styles.fileButton}
                        onPress={seleccionarArchivo}
                    >
                        <Text style={styles.fileButtonText}>
                            {archivo ? `📎 ${archivo.name}` : (archivoExistente ? `📎 ${archivoExistente} (Actual)` : 'Seleccionar Archivo')}
                        </Text>
                    </TouchableOpacity>
                    {archivoExistente && !archivo && (
                        <Text style={styles.helpText}>Si no seleccionas un nuevo archivo, se mantendrá el actual.</Text>
                    )}

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
    textArea: {
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.offWhite,
        padding: SPACING.md,
        fontSize: FONT_SIZES.md,
        minHeight: 250,
    },
    fileButton: {
        backgroundColor: COLORS.offWhite,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
        alignItems: 'center',
        marginTop: SPACING.xs,
        marginBottom: SPACING.xs,
    },
    fileButtonText: {
        color: COLORS.primary,
        fontSize: FONT_SIZES.md,
    },
    helpText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.gray,
        marginBottom: SPACING.md,
        fontStyle: 'italic',
    },
    submitButton: {
        marginTop: SPACING.xl,
    },
});

export default EditarFormacionScreen;
