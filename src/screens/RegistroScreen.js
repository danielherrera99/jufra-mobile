import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    TouchableOpacity,
    Linking
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
        email: '',
        username: '',
        password: '',
        confirmarPassword: '',
        telefono: '',
        fechaNacimiento: new Date(),
        contactoEmergencia: '',
        nombreContactoEmergencia: '',
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

        if (!formData.email.trim()) {
            nuevosErrores.email = 'El correo es requerido para recuperar la contraseña';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            nuevosErrores.email = 'Ingresa un correo electrónico válido';
        }

        if (!formData.username.trim()) {
            nuevosErrores.username = 'El usuario es requerido';
        } else if (formData.username.length < 4) {
            nuevosErrores.username = 'El usuario debe tener al menos 4 caracteres';
        }

        if (!formData.telefono || !formData.telefono.trim()) {
            nuevosErrores.telefono = 'El teléfono es requerido';
        }

        // Contactos de emergencia ahora son opcionales
        // if (!formData.nombreContactoEmergencia || !formData.nombreContactoEmergencia.trim()) {
        //     nuevosErrores.nombreContactoEmergencia = 'Nombre del contacto de emergencia requerido';
        // }

        // if (!formData.contactoEmergencia || !formData.contactoEmergencia.trim()) {
        //     nuevosErrores.contactoEmergencia = 'Número de emergencia requerido';
        // }

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

    const handleWhatsAppHelp = () => {
        const message = `Hola hermano, tengo un problema en la App, por favor me ayudas`;
        const url = `whatsapp://send?phone=51981574685&text=${encodeURIComponent(message)}`;
        
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                Linking.openURL(`https://wa.me/51981574685?text=${encodeURIComponent(message)}`);
            }
        });
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
                        <Text style={styles.sectionTitle}>Información Personal</Text>
                        <View style={styles.divider} />

                        <View style={styles.row}>
                            <View style={styles.col}>
                                <Input
                                    label="Nombres"
                                    value={formData.nombre}
                                    onChangeText={(valor) => handleChange('nombre', valor)}
                                    placeholder="Nombres"
                                    error={errors.nombre}
                                    icon={<Text style={styles.inputIcon}>👤</Text>}
                                />
                            </View>
                            <View style={styles.col}>
                                <Input
                                    label="Apellidos"
                                    value={formData.apellido}
                                    onChangeText={(valor) => handleChange('apellido', valor)}
                                    placeholder="Apellidos"
                                    error={errors.apellido}
                                    icon={<Text style={styles.inputIcon}>👤</Text>}
                                />
                            </View>
                        </View>

                        <Input
                            label="Correo Electrónico"
                            value={formData.email}
                            onChangeText={(valor) => handleChange('email', valor)}
                            placeholder="ejemplo@gmail.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            error={errors.email}
                            icon={<Text style={styles.inputIcon}>📧</Text>}
                        />

                        <View style={styles.dateContainer}>
                            <Text style={styles.dateLabel}>Fecha de Nacimiento</Text>
                            <TouchableOpacity
                                onPress={() => setShowDatePicker(true)}
                                style={styles.dateButton}
                            >
                                <Text style={styles.inputIcon}>📅</Text>
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
                            placeholder="+51 999 999 999"
                            keyboardType="phone-pad"
                            error={errors.telefono}
                            icon={<Text style={styles.inputIcon}>📱</Text>}
                        />

                        <Input
                            label="Contacto de Emergencia (Opcional)"
                            value={formData.nombreContactoEmergencia}
                            onChangeText={(valor) => handleChange('nombreContactoEmergencia', valor)}
                            placeholder="Ej: Mamá / Papá"
                            error={errors.nombreContactoEmergencia}
                            icon={<Text style={styles.inputIcon}>👤</Text>}
                        />

                        <Input
                            label="Número de Emergencia (Opcional)"
                            value={formData.contactoEmergencia}
                            onChangeText={(valor) => handleChange('contactoEmergencia', valor)}
                            placeholder="+51 999 999 999"
                            keyboardType="phone-pad"
                            error={errors.contactoEmergencia}
                            icon={<Text style={styles.inputIcon}>📱</Text>}
                        />

                        <Text style={[styles.sectionTitle, { marginTop: SPACING.md }]}>Información de la Cuenta</Text>
                        <View style={styles.divider} />

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

                        <View style={styles.helpDivider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>¿Problemas con el registro?</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <TouchableOpacity 
                            style={styles.whatsappButton} 
                            onPress={handleWhatsAppHelp}
                        >
                            <Text style={styles.whatsappIcon}>💬</Text>
                            <Text style={styles.whatsappText}>Ayuda por WhatsApp</Text>
                        </TouchableOpacity>
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
    sectionTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: SPACING.xs,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.lightGray,
        marginBottom: SPACING.md,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: SPACING.md,
    },
    col: {
        flex: 1,
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
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.offWhite,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    dateText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.black,
        marginLeft: SPACING.sm,
    },
    helpDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.xl,
        marginBottom: SPACING.md,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    dividerText: {
        paddingHorizontal: 10,
        color: COLORS.darkGray,
        fontSize: FONT_SIZES.sm,
    },
    whatsappButton: {
        flexDirection: 'row',
        backgroundColor: '#25D366',
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    whatsappIcon: {
        fontSize: 20,
        marginRight: 10,
    },
    whatsappText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: FONT_SIZES.md,
    }
});

export default RegistroScreen;
