import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    TouchableOpacity,
    TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import api from '../config/api';
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const EditarDocumentoScreen = ({ navigation, route }) => {
    const { documento } = route.params;
    const [titulo, setTitulo] = useState(documento.titulo);
    const [descripcion, setDescripcion] = useState(documento.descripcion || '');
    const [tipo, setTipo] = useState(documento.tipo);
    const [contenido, setContenido] = useState(documento.contenido || '');
    const [archivo, setArchivo] = useState(null);
    const [archivoExistente, setArchivoExistente] = useState(documento.archivoNombre || null);
    const [loading, setLoading] = useState(false);

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*', // Permitir cualquier tipo de archivo
                copyToCacheDirectory: true
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setArchivo(result.assets[0]);
                setArchivoExistente(null); // Limpiar archivo existente si se selecciona uno nuevo
            }
        } catch (error) {
            console.error('Error al seleccionar documento:', error);
            Alert.alert('Error', 'No se pudo seleccionar el archivo');
        }
    };

    const guardarCambios = async () => {
        if (!titulo.trim()) {
            Alert.alert('Error', 'El título es requerido');
            return;
        }

        if (!contenido.trim() && !archivo && !archivoExistente) {
            Alert.alert('Error', 'Debes ingresar contenido de texto o subir un archivo');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('titulo', titulo);
            formData.append('descripcion', descripcion);
            formData.append('tipo', tipo);
            formData.append('contenido', contenido);

            if (archivo) {
                formData.append('archivo', {
                    uri: archivo.uri,
                    name: archivo.name,
                    type: archivo.mimeType || 'application/octet-stream'
                });
            }

            const response = await api.put(`/documentos/${documento._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                Alert.alert(
                    'Éxito',
                    'Documento actualizado correctamente',
                    [{ text: 'OK', onPress: () => navigation.navigate('DetalleDocumento', { documentoId: documento._id }) }]
                );
            }
        } catch (error) {
            console.error('Error al actualizar documento:', error);
            Alert.alert('Error', 'No se pudo actualizar el documento');
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
                    <Text style={styles.headerTitle}>Editar Documento</Text>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content}>
                <View style={styles.formCard}>
                    <Input
                        label="Título *"
                        value={titulo}
                        onChangeText={setTitulo}
                        placeholder="Ej: Regla de la JUFRA"
                    />

                    <Input
                        label="Descripción Corta"
                        value={descripcion}
                        onChangeText={setDescripcion}
                        placeholder="Ej: Aprobada por Pablo VI en 1978"
                    />

                    <Text style={styles.label}>Tipo de Documento</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={tipo}
                            onValueChange={(itemValue) => setTipo(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Regla" value="regla" />
                            <Picker.Item label="Constituciones Generales" value="ccgg" />
                            <Picker.Item label="Estatuto Nacional" value="estatuto" />
                            <Picker.Item label="Material Formativo" value="formacion" />
                            <Picker.Item label="Otro" value="otro" />
                        </Picker>
                    </View>

                    <Text style={styles.label}>Archivo Adjunto</Text>
                    <View style={styles.fileContainer}>
                        {archivo ? (
                            <View style={styles.selectedFile}>
                                <Text style={styles.fileName} numberOfLines={1}>
                                    📄 {archivo.name}
                                </Text>
                                <TouchableOpacity onPress={() => setArchivo(null)}>
                                    <Text style={styles.removeFile}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
                                <Text style={styles.uploadIcon}>📎</Text>
                                <Text style={styles.uploadText}>
                                    {archivoExistente ? `Cambiar archivo (${archivoExistente})` : 'Seleccionar archivo (PDF, DOC, etc.)'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <Text style={styles.label}>Contenido / Notas Adicionales</Text>
                    <TextInput
                        style={styles.textArea}
                        value={contenido}
                        onChangeText={setContenido}
                        placeholder="Escribe aquí el contenido o notas sobre el archivo..."
                        multiline
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
    textArea: {
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        backgroundColor: COLORS.offWhite,
        fontSize: FONT_SIZES.md,
        minHeight: 300,
    },
    submitButton: {
        marginTop: SPACING.xl,
    },
    fileContainer: {
        marginBottom: SPACING.md,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.offWhite,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        height: 60,
    },
    uploadIcon: {
        fontSize: 24,
        marginRight: SPACING.sm,
    },
    uploadText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    selectedFile: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.offWhite,
        borderWidth: 1,
        borderColor: COLORS.success,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
    },
    fileName: {
        flex: 1,
        fontSize: FONT_SIZES.sm,
        color: COLORS.black,
        marginRight: SPACING.sm,
    },
    removeFile: {
        fontSize: FONT_SIZES.lg,
        color: COLORS.error,
        fontWeight: 'bold',
        padding: 4,
    },
});

export default EditarDocumentoScreen;
