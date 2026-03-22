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
import api from '../config/api';
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

import * as DocumentPicker from 'expo-document-picker';

const CrearCantoScreen = ({ navigation }) => {
    const [titulo, setTitulo] = useState('');
    const [letra, setLetra] = useState('');
    const [categoria, setCategoria] = useState('franciscano');
    const [autor, setAutor] = useState('');
    const [archivo, setArchivo] = useState(null);
    const [loading, setLoading] = useState(false);

    const seleccionarArchivo = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['audio/*', 'application/pdf', 'text/plain'],
                copyToCacheDirectory: true
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setArchivo(result.assets[0]);
            }
        } catch (error) {
            console.error('Error al seleccionar archivo:', error);
            Alert.alert('Error', 'No se pudo seleccionar el archivo');
        }
    };

    const guardarCanto = async () => {
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

            const response = await api.post('/cantos', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                Alert.alert(
                    'Éxito',
                    'Canto agregado correctamente',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            }
        } catch (error) {
            console.error('Error al guardar canto:', error);
            Alert.alert('Error', 'No se pudo guardar el canto');
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
                    <Text style={styles.headerTitle}>Nuevo Canto</Text>
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
                            style={[styles.picker, { color: '#1A1A1A' }]}
                            dropdownIconColor="#424242"
                        >
                            <Picker.Item color="#1A1A1A" label="Franciscano" value="franciscano" />
                            <Picker.Item color="#1A1A1A" label="Mariano" value="mariano" />
                            <Picker.Item color="#1A1A1A" label="Entrada" value="entrada" />
                            <Picker.Item color="#1A1A1A" label="Ofertorio" value="ofertorio" />
                            <Picker.Item color="#1A1A1A" label="Comunión" value="comunion" />
                            <Picker.Item color="#1A1A1A" label="Salida" value="salida" />
                            <Picker.Item color="#1A1A1A" label="Animación" value="animacion" />
                            <Picker.Item color="#1A1A1A" label="Adoración" value="adoracion" />
                            <Picker.Item color="#1A1A1A" label="Otro" value="otro" />
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
                            {archivo ? `📎 ${archivo.name}` : 'Seleccionar Archivo'}
                        </Text>
                    </TouchableOpacity>

                    <Button
                        title="Guardar Canto"
                        onPress={guardarCanto}
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
        marginBottom: SPACING.md,
    },
    fileButtonText: {
        color: COLORS.primary,
        fontSize: FONT_SIZES.md,
    },
    submitButton: {
        marginTop: SPACING.xl,
    },
});

export default CrearCantoScreen;
