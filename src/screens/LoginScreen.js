import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants/theme';

const LoginScreen = ({ navigation }) => {
    const { login, error } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validarFormulario = () => {
        const nuevosErrores = {};

        if (!username.trim()) {
            nuevosErrores.username = 'El usuario es requerido';
        }

        if (!password) {
            nuevosErrores.password = 'La contraseña es requerida';
        } else if (password.length < 6) {
            nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        setErrors(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleLogin = async () => {
        if (!validarFormulario()) return;

        setLoading(true);
        const resultado = await login(username.trim(), password);
        setLoading(false);

        if (!resultado.success) {
            Alert.alert('Error', resultado.message || 'Error al iniciar sesión');
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
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Logo y Título */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../../assets/logojufra.png')}
                                style={styles.logoImage}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.title}>JUFRA POMALCA</Text>
                        <Text style={styles.subtitle}>Juventud Franciscana</Text>
                        <Text style={styles.motto}>"Paz y Bien"</Text>
                    </View>

                    {/* Formulario */}
                    <View style={styles.formContainer}>
                        <Input
                            label="Usuario"
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Ej: francisco"
                            autoCapitalize="none"
                            error={errors.username}
                            icon={<Text style={styles.inputIcon}>👤</Text>}
                        />

                        <Input
                            label="Contraseña"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="••••••••"
                            secureTextEntry
                            error={errors.password}
                            icon={<Text style={styles.inputIcon}>🔒</Text>}
                        />

                        <Button
                            title="Iniciar Sesión"
                            onPress={handleLogin}
                            loading={loading}
                            variant="secondary"
                            style={styles.loginButton}
                        />

                        <Button
                            title="Crear Cuenta"
                            onPress={() => navigation.navigate('Registro')}
                            variant="outline"
                            style={styles.registerButton}
                        />
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Desarrollado por consejo local JUFRA POMALCA
                        </Text>
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
        justifyContent: 'center',
        padding: SPACING.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    logoContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    logoImage: {
        width: 100,
        height: 100,
    },
    title: {
        fontSize: FONT_SIZES.xxxl,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: FONT_SIZES.lg,
        color: COLORS.ivory,
        marginBottom: SPACING.xs,
    },
    motto: {
        fontSize: FONT_SIZES.md,
        color: COLORS.gold,
        fontStyle: 'italic',
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
    loginButton: {
        marginTop: SPACING.md,
    },
    registerButton: {
        marginTop: SPACING.sm,
        backgroundColor: 'transparent',
    },
    footer: {
        marginTop: SPACING.xl,
        alignItems: 'center',
    },
    footerText: {
        color: COLORS.ivory,
        fontSize: FONT_SIZES.sm,
    },
});

export default LoginScreen;
