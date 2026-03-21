import React, { useState, useEffect } from 'react';
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

const EditarCantoScreen = ({ navigation, route }) => {
    const { canto } = route.params;
    const [titulo, setTitulo] = useState(canto.titulo);
    const [letra, setLetra] = useState(canto.letra);
    const [categoria, setCategoria] = useState(canto.categoria);
    const [autor, setAutor] = useState(canto.autor || '');
    const [archivo, setArchivo] = useState(null);
    const [archivoExistente, setArchivoExistente] = useState(canto.archivoNombre || null);
    const [loading, setLoading] = useState(false);

    const seleccionarArchivo = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['audio/*', 'application/pdf', 'text/plain'],
                copyToCacheDirectory: true
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setArchivo(result.assets[0]);
                setArchivoExistente(null); // Limpiar archivo existente si se selecciona uno nuevo
            }
        } catch (error) {
            console.error('Error al seleccionar archivo:', error);
            Alert.alert('Error', 'No se pudo seleccionar el archivo');
        }
    };

    const guardarCambios = async () => {
        if (!titulo.trim() || !letra.trim()) {
            Alert.alert('Error', 'Título y letra son requeridos');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('titulo', titulo);
            formData.append('letra', letra);
            formData.append('categoria', categoria);
            formData.append('autor', autor);

            if (archivo) {
                const fileToUpload = {
                    uri: archivo.uri,
                    type: archivo.mimeType || 'application/octet-stream',
                    name: archivo.name
                };
                formData.append('archivo', fileToUpload);
            }

            const response = await api.put(`/cantos/${canto._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                Alert.alert(
                    'Éxito',
                    'Canto actualizado correctamente',
                    [{ text: 'OK', onPress: () => navigation.navigate('DetalleCanto', { canto: response.data.canto }) }]
                );
            }
        } catch (error) {
            console.error('Error al actualizar canto:', error);
            Alert.alert('Error', 'No se pudo actualizar el canto');
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
                    <Text style={styles.headerTitle}>Editar Canto</Text>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content}>
                <View style={styles.formCard}>
                    <Input
                        label="Título del Canto"
                        value={titulo}
                        onChangeText={setTitulo}
                        placeholder="Ej: Hazme un instrumento de tu paz"
                    />

                    <Text style={styles.label}>Categoría</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={categoria}
                            onValueChange={(itemValue) => setCategoria(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Franciscano" value="franciscano" />
                            <Picker.Item label="Mariano" value="mariano" />
                            <Picker.Item label="Entrada" value="entrada" />
                            <Picker.Item label="Ofertorio" value="ofertorio" />
                            <Picker.Item label="Comunión" value="comunion" />
                            <Picker.Item label="Salida" value="salida" />
                            <Picker.Item label="Animación" value="animacion" />
                            <Picker.Item label="Adoración" value="adoracion" />
                            <Picker.Item label="Otro" value="otro" />
                        </Picker>
                    </View>

                    <Input
                        label="Autor (Opcional)"
                        value={autor}
                        onChangeText={setAutor}
                        placeholder="Ej: San Francisco de Asís"
                    />

                    <Text style={styles.label}>Letra</Text>
                    <TextInput
                        style={styles.textArea}
                        value={letra}
                        onChangeText={setLetra}
                        placeholder="Escribe la letra aquí..."
                        multiline
                        numberOfLines={10}
                        textAlignVertical="top"
                    />

                    <Text style={styles.label}>Archivo Adjunto (Audio/PDF)</Text>
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
        minHeight: 200,
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

export default EditarCantoScreen;
