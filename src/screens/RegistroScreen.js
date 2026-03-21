import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants/theme';

const RegistroScreen = ({ navigation }) => {
    const { registro } = useAuth();
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        username: '',
        password: '',
        confirmarPassword: '',
        telefono: '',
        fechaNacimiento: new Date(),
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (campo, valor) => {
        setFormData({ ...formData, [campo]: valor });
        // Limpiar error del campo al escribir
        if (errors[campo]) {
            setErrors({ ...errors, [campo]: null });
        }
    };

    const onChangeDate = (event, selectedDate) => {
        const currentDate = selectedDate || formData.fechaNacimiento;
        setShowDatePicker(Platform.OS === 'ios');
        setFormData({ ...formData, fechaNacimiento: currentDate });
    };

    const validarFormulario = () => {
        const nuevosErrores = {};

        if (!formData.nombre.trim()) {
            nuevosErrores.nombre = 'El nombre es requerido';
        }

        if (!formData.apellido.trim()) {
            nuevosErrores.apellido = 'El apellido es requerido';
        }

        if (!formData.username.trim()) {
            nuevosErrores.username = 'El usuario es requerido';
        } else if (formData.username.length < 4) {
            nuevosErrores.username = 'El usuario debe tener al menos 4 caracteres';
        }

        if (!formData.telefono || !formData.telefono.trim()) {
            nuevosErrores.telefono = 'El teléfono es requerido';
        }

        if (!formData.password) {
            nuevosErrores.password = 'La contraseña es requerida';
        } else if (formData.password.length < 6) {
            nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        if (formData.password !== formData.confirmarPassword) {
            nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden';
        }

        setErrors(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleRegistro = async () => {
        if (!validarFormulario()) return;

        setLoading(true);
        const { confirmarPassword, ...datosRegistro } = formData;
        datosRegistro.username = datosRegistro.username.trim();

        // Formatear fecha para enviar solo YYYY-MM-DD o ISO string
        datosRegistro.fechaNacimiento = datosRegistro.fechaNacimiento.toISOString();

        const resultado = await registro(datosRegistro);
        setLoading(false);

        if (!resultado.success) {
            Alert.alert('Error', resultado.message || 'Error al registrarse');
        } else {
            Alert.alert(
                'Solicitud Enviada',
                resultado.message || 'Tu cuenta está pendiente de aprobación por el Consejo.',
                [{ text: 'Entendido', onPress: () => navigation.navigate('Login') }]
            );
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <StatusBar style="light" />
            <LinearGradient
                colors={[COLORS.tertiary, COLORS.primary, COLORS.accent]}
                style={styles.gradient}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Crear Cuenta</Text>
                        <Text style={styles.subtitle}>Únete a la fraternidad JUFRA</Text>
                    </View>

                    {/* Formulario */}
                    <View style={styles.formContainer}>
                        <Input
                            label="Nombres"
                            value={formData.nombre}
                            onChangeText={(valor) => handleChange('nombre', valor)}
                            placeholder="Tus nombres"
                            error={errors.nombre}
                            icon={<Text style={styles.inputIcon}>👤</Text>}
                        />

                        <Input
                            label="Apellidos"
                            value={formData.apellido}
                            onChangeText={(valor) => handleChange('apellido', valor)}
                            placeholder="Tus apellidos"
                            error={errors.apellido}
                            icon={<Text style={styles.inputIcon}>👤</Text>}
                        />

                        <View style={styles.dateContainer}>
                            <Text style={styles.dateLabel}>Fecha de Nacimiento</Text>
                            <TouchableOpacity
                                onPress={() => setShowDatePicker(true)}
                                style={styles.dateButton}
                            >
                                <Text style={styles.dateText}>
                                    {formData.fechaNacimiento.toLocaleDateString()}
                                </Text>
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    testID="dateTimePicker"
                                    value={formData.fechaNacimiento}
                                    mode="date"
                                    display="default"
                                    onChange={onChangeDate}
                                    maximumDate={new Date()}
                                />
                            )}
                        </View>

                        <Input
                            label="Teléfono"
                            value={formData.telefono}
                            onChangeText={(valor) => handleChange('telefono', valor)}
                            placeholder="+1234567890"
                            keyboardType="phone-pad"
                            error={errors.telefono}
                            icon={<Text style={styles.inputIcon}>📱</Text>}
                        />

                        <Input
                            label="Usuario"
                            value={formData.username}
                            onChangeText={(valor) => handleChange('username', valor)}
                            placeholder="Elige un usuario"
                            autoCapitalize="none"
                            error={errors.username}
                            icon={<Text style={styles.inputIcon}>👤</Text>}
                        />

                        <Input
                            label="Contraseña"
                            value={formData.password}
                            onChangeText={(valor) => handleChange('password', valor)}
                            placeholder="••••••••"
                            secureTextEntry
                            error={errors.password}
                            icon={<Text style={styles.inputIcon}>🔒</Text>}
                        />

                        <Input
                            label="Confirmar Contraseña"
                            value={formData.confirmarPassword}
                            onChangeText={(valor) => handleChange('confirmarPassword', valor)}
                            placeholder="••••••••"
                            secureTextEntry
                            error={errors.confirmarPassword}
                            icon={<Text style={styles.inputIcon}>🔒</Text>}
                        />

                        <Button
                            title="Registrarse"
                            onPress={handleRegistro}
                            loading={loading}
                            variant="secondary"
                            style={styles.registerButton}
                        />

                        <Button
                            title="Ya tengo cuenta"
                            onPress={() => navigation.goBack()}
                            variant="outline"
                            style={styles.loginButton}
                        />
                    </View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: SPACING.lg,
        paddingTop: SPACING.xxl,
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: FONT_SIZES.xxxl,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: FONT_SIZES.md,
        color: COLORS.ivory,
    },
    formContainer: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    inputIcon: {
        fontSize: FONT_SIZES.lg,
    },
    registerButton: {
        marginTop: SPACING.md,
    },
    loginButton: {
        marginTop: SPACING.sm,
        backgroundColor: 'transparent',
    },
    dateContainer: {
        marginBottom: SPACING.md,
    },
    dateLabel: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.darkGray,
        marginBottom: SPACING.xs,
        marginLeft: SPACING.xs,
    },
    dateButton: {
        backgroundColor: COLORS.offWhite,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    dateText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.black,
    },
});

export default RegistroScreen;
