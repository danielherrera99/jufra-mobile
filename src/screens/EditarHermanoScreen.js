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
import { Picker } from '@react-native-picker/picker';
import api from '../config/api';
import Input from '../components/Input';
import Button from '../components/Button';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants/theme';

const EditarHermanoScreen = ({ navigation, route }) => {
    const { hermano } = route.params;
    const [formData, setFormData] = useState({
        nombre: hermano.nombre,
        apellido: hermano.apellido,
        telefono: hermano.telefono || '',
        rol: hermano.rol,
        cargo: hermano.cargo,
        etapaFormacion: hermano.etapaFormacion,
        username: hermano.username || '',
        email: hermano.email || '',
        password: '',
        fechaNacimiento: hermano.fechaNacimiento || '',
        fechaIngreso: hermano.fechaIngreso || '',
        activo: hermano.activo,
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
        setErrors(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleGuardar = async () => {
        if (!validarFormulario()) return;

        setLoading(true);
        try {
            const response = await api.put(`/hermanos/${hermano._id}`, formData);

            if (response.data.success) {
                Alert.alert('Éxito', 'Hermano actualizado correctamente', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            }
        } catch (error) {
            console.error('Error al actualizar hermano:', error);
            Alert.alert('Error', 'No se pudo actualizar la información');
        } finally {
            setLoading(false);
        }
    };

    const handleEliminar = () => {
        Alert.alert(
            'Eliminar Hermano',
            '¿Deseas eliminar a este hermano?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Sí',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const response = await api.delete(`/hermanos/${hermano._id}`);
                            if (response.data.success) {
                                Alert.alert('Éxito', 'Hermano eliminado correctamente', [
                                    { text: 'OK', onPress: () => navigation.navigate('Hermanos') }
                                ]);
                            }
                        } catch (error) {
                            console.error('Error al eliminar hermano:', error);
                            Alert.alert('Error', 'No se pudo eliminar al hermano');
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
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>Editar Hermano</Text>
                <Text style={styles.headerSubtitle}>{hermano.nombre} {hermano.apellido}</Text>
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
                    />

                    <View style={styles.divider} />
                    <Text style={styles.sectionTitle}>Fechas Importantes</Text>

                    <Text style={styles.label}>Fecha de Nacimiento (YYYY-MM-DD)</Text>
                    <Input
                        value={formData.fechaNacimiento ? formData.fechaNacimiento.split('T')[0] : ''}
                        onChangeText={(v) => handleChange('fechaNacimiento', v)}
                        placeholder="Ej: 1990-10-04"
                    />

                    <Text style={styles.label}>Fecha de Ingreso (YYYY-MM-DD)</Text>
                    <Input
                        value={formData.fechaIngreso ? formData.fechaIngreso.split('T')[0] : ''}
                        onChangeText={(v) => handleChange('fechaIngreso', v)}
                        placeholder="Ej: 2023-05-15"
                    />

                    <View style={styles.divider} />
                    <Text style={styles.sectionTitle}>Credenciales de Acceso</Text>

                    <Input
                        label="Usuario"
                        value={formData.username}
                        onChangeText={(v) => handleChange('username', v)}
                        autoCapitalize="none"
                        error={errors.username}
                    />

                    <Input
                        label="Correo Electrónico"
                        value={formData.email}
                        onChangeText={(v) => handleChange('email', v)}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholder="Ej: correo@gmail.com"
                    />

                    <Input
                        label="Nueva Contraseña (Opcional)"
                        value={formData.password}
                        onChangeText={(v) => handleChange('password', v)}
                        placeholder="Dejar en blanco para mantener actual"
                        secureTextEntry
                    />
                    <View style={styles.divider} />

                    <Text style={styles.label}>Rol en el Sistema</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={formData.rol}
                            onValueChange={(v) => handleChange('rol', v)}
                            style={{ color: COLORS.black }}
                        >
                            <Picker.Item label="Miembro" value="miembro" color={COLORS.black} />
                            <Picker.Item label="Consejo" value="consejo" color={COLORS.black} />
                            <Picker.Item label="Admin" value="admin" color={COLORS.black} />
                        </Picker>
                    </View>

                    <Text style={styles.label}>Cargo en la Fraternidad</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={formData.cargo}
                            onValueChange={(v) => handleChange('cargo', v)}
                            style={{ color: COLORS.black }}
                        >
                            <Picker.Item label="Ninguno" value="ninguno" color={COLORS.black} />
                            <Picker.Item label="Coordinador" value="coordinador" color={COLORS.black} />
                            <Picker.Item label="Vice-Coordinador" value="vice-coordinador" color={COLORS.black} />
                            <Picker.Item label="Secretario" value="secretario" color={COLORS.black} />
                            <Picker.Item label="Tesorero" value="tesorero" color={COLORS.black} />
                            <Picker.Item label="Formador" value="formador" color={COLORS.black} />
                            <Picker.Item label="Animador" value="animador" color={COLORS.black} />
                        </Picker>
                    </View>

                    <Text style={styles.label}>Etapa de Formación</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={formData.etapaFormacion}
                            onValueChange={(v) => handleChange('etapaFormacion', v)}
                            style={{ color: COLORS.black }}
                        >
                            <Picker.Item label="Aspirante" value="aspirante" color={COLORS.black} />
                            <Picker.Item label="Iniciado" value="iniciado" color={COLORS.black} />
                            <Picker.Item label="En Formación" value="en_formacion" color={COLORS.black} />
                            <Picker.Item label="Promesado" value="promesado" color={COLORS.black} />
                        </Picker>
                    </View>

                    <Text style={styles.label}>Estado de la Cuenta</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={formData.activo}
                            onValueChange={(v) => handleChange('activo', v)}
                            style={{ color: COLORS.black }}
                        >
                            <Picker.Item label="🟢 Activo" value={true} color={COLORS.black} />
                            <Picker.Item label="🔴 Inactivo (Sin Acceso)" value={false} color={COLORS.black} />
                        </Picker>
                    </View>

                    <Button
                        title="Guardar Cambios"
                        onPress={handleGuardar}
                        loading={loading}
                        style={styles.submitButton}
                    />

                    <Button
                        title="Eliminar Hermano"
                        onPress={handleEliminar}
                        loading={loading}
                        variant="outline"
                        style={styles.deleteButton}
                        textStyle={styles.deleteButtonText}
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
    label: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.darkGray,
        marginBottom: SPACING.xs,
        marginTop: SPACING.md,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.sm,
        backgroundColor: COLORS.offWhite,
    },
    submitButton: {
        marginTop: SPACING.xl,
    },
    deleteButton: {
        marginTop: SPACING.md,
        borderColor: COLORS.error,
        borderWidth: 1,
    },
    deleteButtonText: {
        color: COLORS.error,
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
        marginBottom: SPACING.sm,
    },
});

export default EditarHermanoScreen;
