import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../config/api';
import Input from '../components/Input';
import Button from '../components/Button';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const EditarPerfilScreen = ({ navigation, route }) => {
    const { usuario: usuarioInicial } = route.params;
    const { actualizarUsuario } = useAuth();

    const [formData, setFormData] = useState({
        nombre: usuarioInicial.nombre,
        apellido: usuarioInicial.apellido,
        telefono: usuarioInicial.telefono || '',
        fechaNacimiento: usuarioInicial.fechaNacimiento || '',
        fechaIngreso: usuarioInicial.fechaIngreso || '',
        fechaPromesa: usuarioInicial.fechaPromesa || '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (campo, valor) => {
        setFormData({ ...formData, [campo]: valor });
        if (errors[campo]) setErrors({ ...errors, [campo]: null });
    };

    const validarFormulario = () => {
        const nuevosErrores = {};
        if (!formData.nombre.trim()) nuevosErrores.nombre = 'Requerido';
        if (!formData.apellido.trim()) nuevosErrores.apellido = 'Requerido';

        // Validar formato de fechas si se ingresaron
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (formData.fechaNacimiento && !dateRegex.test(formData.fechaNacimiento.split('T')[0])) {
            nuevosErrores.fechaNacimiento = 'Formato inválido (YYYY-MM-DD)';
        }

        setErrors(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleGuardar = async () => {
        if (!validarFormulario()) return;

        setLoading(true);
        try {
            const response = await api.put('/auth/perfil', formData);

            if (response.data.success) {
                actualizarUsuario(response.data.usuario);
                Alert.alert('Éxito', 'Tu perfil ha sido actualizado', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            }
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            Alert.alert('Error', 'No se pudo actualizar tu información');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>Editar Mi Perfil</Text>
                <Text style={styles.headerSubtitle}>Actualiza tu información personal</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.formCard}>
                    <Input
                        label="Nombre"
                        value={formData.nombre}
                        onChangeText={(v) => handleChange('nombre', v)}
                        error={errors.nombre}
                    />
                    <Input
                        label="Apellido"
                        value={formData.apellido}
                        onChangeText={(v) => handleChange('apellido', v)}
                        error={errors.apellido}
                    />
                    <Input
                        label="Teléfono"
                        value={formData.telefono}
                        onChangeText={(v) => handleChange('telefono', v)}
                        keyboardType="phone-pad"
                        placeholder="Ej: 9991234567"
                    />

                    <View style={styles.divider} />
                    <Text style={styles.sectionTitle}>Fechas Importantes</Text>
                    <Text style={styles.helperText}>Formato: YYYY-MM-DD (Ej: 1990-12-25)</Text>

                    <Input
                        label="Fecha de Nacimiento"
                        value={formData.fechaNacimiento ? formData.fechaNacimiento.split('T')[0] : ''}
                        onChangeText={(v) => handleChange('fechaNacimiento', v)}
                        placeholder="YYYY-MM-DD"
                        error={errors.fechaNacimiento}
                    />

                    <Input
                        label="Fecha de Ingreso a JUFRA"
                        value={formData.fechaIngreso ? formData.fechaIngreso.split('T')[0] : ''}
                        onChangeText={(v) => handleChange('fechaIngreso', v)}
                        placeholder="YYYY-MM-DD"
                    />

                    <Input
                        label="Fecha de Promesa (Si aplica)"
                        value={formData.fechaPromesa ? formData.fechaPromesa.split('T')[0] : ''}
                        onChangeText={(v) => handleChange('fechaPromesa', v)}
                        placeholder="YYYY-MM-DD"
                    />

                    <View style={styles.divider} />
                    <Text style={styles.sectionTitle}>Seguridad</Text>

                    <Input
                        label="Nueva Contraseña (Opcional)"
                        value={formData.password}
                        onChangeText={(v) => handleChange('password', v)}
                        placeholder="Dejar en blanco para mantener actual"
                        secureTextEntry
                        helperText="Mínimo 6 caracteres"
                    />

                    <Button
                        title="Guardar Cambios"
                        onPress={handleGuardar}
                        loading={loading}
                        style={styles.submitButton}
                    />

                    <Button
                        title="Cancelar"
                        onPress={() => navigation.goBack()}
                        variant="outline"
                        style={styles.cancelButton}
                    />
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
        paddingTop: 50,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.lg,
        borderBottomLeftRadius: BORDER_RADIUS.xl,
        borderBottomRightRadius: BORDER_RADIUS.xl,
    },
    headerTitle: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    headerSubtitle: {
        fontSize: FONT_SIZES.md,
        color: COLORS.ivory,
        marginTop: SPACING.xs,
    },
    content: {
        padding: SPACING.lg,
    },
    formCard: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    submitButton: {
        marginTop: SPACING.xl,
    },
    cancelButton: {
        marginTop: SPACING.md,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.lightGray,
        marginVertical: SPACING.md,
    },
    sectionTitle: {
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: SPACING.xs,
    },
    helperText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.gray,
        marginBottom: SPACING.sm,
    },
});

export default EditarPerfilScreen;
