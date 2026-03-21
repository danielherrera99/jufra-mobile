import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    TouchableOpacity,
    TextInput,
    Switch
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../config/api';
import Button from '../components/Button';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const CrearPeticionScreen = ({ navigation }) => {
    const [contenido, setContenido] = useState('');
    const [anonimo, setAnonimo] = useState(false);
    const [loading, setLoading] = useState(false);

    const guardarPeticion = async () => {
        if (!contenido.trim()) {
            Alert.alert('Error', 'Debes escribir tu petición');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/peticiones', {
                contenido,
                anonimo
            });

            if (response.data.success) {
                Alert.alert(
                    'Éxito',
                    'Tu petición ha sido compartida',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            }
        } catch (error) {
            console.error('Error al guardar petición:', error);
            Alert.alert('Error', 'No se pudo guardar la petición');
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
                    <Text style={styles.headerTitle}>Nueva Petición</Text>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content}>
                <View style={styles.formCard}>
                    <Text style={styles.label}>¿Por qué deseas que oremos?</Text>
                    <TextInput
                        style={styles.textArea}
                        value={contenido}
                        onChangeText={setContenido}
                        placeholder="Escribe tu petición aquí..."
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                    />

                    <View style={styles.switchContainer}>
                        <Text style={styles.switchLabel}>Publicar como anónimo</Text>
                        <Switch
                            trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                            thumbColor={COLORS.white}
                            onValueChange={setAnonimo}
                            value={anonimo}
                        />
                    </View>
                    <Text style={styles.helpText}>
                        {anonimo
                            ? "Tu nombre no aparecerá junto a la petición."
                            : "Tu nombre aparecerá para que los hermanos sepan por quién orar."
                        }
                    </Text>

                    <Button
                        title="Pedir Oración"
                        onPress={guardarPeticion}
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
        marginBottom: SPACING.sm,
    },
    textArea: {
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        backgroundColor: COLORS.offWhite,
        fontSize: FONT_SIZES.md,
        minHeight: 150,
        marginBottom: SPACING.lg,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    switchLabel: {
        fontSize: FONT_SIZES.md,
        color: COLORS.black,
    },
    helpText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.gray,
        marginBottom: SPACING.lg,
    },
    submitButton: {
        marginTop: SPACING.sm,
    },
});

export default CrearPeticionScreen;
