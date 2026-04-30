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
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants/theme';
import api from '../config/api';

const RecuperarPasswordScreen = ({ navigation }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Estados para los inputs
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [codigo, setCodigo] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSolicitarCodigo = async () => {
        if (!usernameOrEmail.trim()) {
            Alert.alert('Error', 'Por favor ingresa tu usuario o correo electrónico.');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/auth/recuperar-password', { usernameOrEmail: usernameOrEmail.trim() });
            if (res.data.success) {
                Alert.alert('Éxito', 'Se ha enviado un código de seguridad a tu correo electrónico.');
                setStep(2);
            }
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'No se pudo enviar el código. Verifica que el usuario exista y tenga un correo.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerificarCodigo = async () => {
        if (!codigo.trim() || codigo.length !== 6) {
            Alert.alert('Error', 'Por favor ingresa el código de 6 dígitos.');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/auth/verificar-codigo', { 
                usernameOrEmail: usernameOrEmail.trim(), 
                codigo: codigo.trim() 
            });
            if (res.data.success) {
                setStep(3);
            }
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Código inválido o expirado.');
        } finally {
            setLoading(false);
        }
    };

    const handleRestablecerPassword = async () => {
        if (newPassword.length < 6) {
            Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres.');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden.');
            return;
        }

        setLoading(true);
        try {
            const res = await api.put('/auth/reset-password', { 
                usernameOrEmail: usernameOrEmail.trim(), 
                codigo: codigo.trim(),
                newPassword 
            });
            if (res.data.success) {
                Alert.alert('¡Éxito!', 'Tu contraseña ha sido restablecida. Ya puedes iniciar sesión.', [
                    { text: 'OK', onPress: () => navigation.navigate('Login') }
                ]);
            }
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Error al restablecer la contraseña.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <StatusBar style="light" />
            <LinearGradient
                colors={[COLORS.primary, COLORS.accent, COLORS.tertiary]}
                style={styles.gradient}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.backButtonText}>← Volver al Login</Text>
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={styles.title}>Recuperar Contraseña</Text>
                        <Text style={styles.subtitle}>
                            {step === 1 && 'Ingresa tu usuario o correo para enviarte un código de seguridad.'}
                            {step === 2 && 'Ingresa el código de 6 dígitos que enviamos a tu correo electrónico.'}
                            {step === 3 && 'Crea tu nueva contraseña segura.'}
                        </Text>
                    </View>

                    <View style={styles.formContainer}>
                        {step === 1 && (
                            <>
                                <Input
                                    label="Usuario o Correo Electrónico"
                                    value={usernameOrEmail}
                                    onChangeText={setUsernameOrEmail}
                                    placeholder="Ej: francisco o correo@gmail.com"
                                    autoCapitalize="none"
                                    icon={<Text style={styles.inputIcon}>📧</Text>}
                                />
                                <Button
                                    title="Enviar Código"
                                    onPress={handleSolicitarCodigo}
                                    loading={loading}
                                    style={styles.submitButton}
                                />
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <Input
                                    label="Código de Seguridad"
                                    value={codigo}
                                    onChangeText={setCodigo}
                                    placeholder="123456"
                                    keyboardType="numeric"
                                    maxLength={6}
                                    icon={<Text style={styles.inputIcon}>🔑</Text>}
                                />
                                <Button
                                    title="Verificar Código"
                                    onPress={handleVerificarCodigo}
                                    loading={loading}
                                    style={styles.submitButton}
                                />
                                <TouchableOpacity onPress={() => setStep(1)} style={styles.secondaryButton}>
                                    <Text style={styles.secondaryButtonText}>Reenviar código</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {step === 3 && (
                            <>
                                <Input
                                    label="Nueva Contraseña"
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    placeholder="••••••••"
                                    secureTextEntry
                                    icon={<Text style={styles.inputIcon}>🔒</Text>}
                                />
                                <Input
                                    label="Confirmar Contraseña"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="••••••••"
                                    secureTextEntry
                                    icon={<Text style={styles.inputIcon}>✔️</Text>}
                                />
                                <Button
                                    title="Restablecer Contraseña"
                                    onPress={handleRestablecerPassword}
                                    loading={loading}
                                    style={styles.submitButton}
                                />
                            </>
                        )}
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
        paddingTop: 60,
    },
    backButton: {
        marginBottom: SPACING.lg,
    },
    backButtonText: {
        color: COLORS.white,
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
    },
    header: {
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: FONT_SIZES.md,
        color: COLORS.ivory,
        lineHeight: 24,
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
    submitButton: {
        marginTop: SPACING.md,
    },
    secondaryButton: {
        marginTop: SPACING.lg,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: COLORS.primary,
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
    }
});

export default RecuperarPasswordScreen;
