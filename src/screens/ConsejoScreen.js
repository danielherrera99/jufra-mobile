import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../config/api';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

import { useAuth } from '../context/AuthContext';

const ConsejoScreen = ({ navigation }) => {
    const [miembros, setMiembros] = useState([]);
    const [loading, setLoading] = useState(true);
    const { esConsejoActivo } = useAuth();

    useEffect(() => {
        cargarConsejo();
    }, []);

    // ... (cargarConsejo and contactar remain same)

    const cargarConsejo = async () => {
        try {
            const response = await api.get('/hermanos');
            if (response.data.success) {
                // Filtrar solo los que tienen cargo
                const consejo = response.data.hermanos.filter(h =>
                    h.cargo && h.cargo !== 'ninguno'
                );

                // Ordenar por jerarquía (opcional, pero recomendado)
                const ordenCargos = {
                    'coordinador': 1,
                    'vice-coordinador': 2,
                    'secretario': 3,
                    'tesorero': 4,
                    'formador': 5,
                    'animador': 6
                };

                consejo.sort((a, b) => (ordenCargos[a.cargo] || 99) - (ordenCargos[b.cargo] || 99));

                setMiembros(consejo);
            }
        } catch (error) {
            console.error('Error al cargar consejo:', error);
        } finally {
            setLoading(false);
        }
    };

    const contactar = (telefono) => {
        if (telefono) {
            Linking.openURL(`whatsapp://send?phone=${telefono}`);
        }
    };

    const renderMiembro = (miembro) => (
        <View key={miembro._id} style={styles.card}>
            <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                    {miembro.nombre.charAt(0)}{miembro.apellido.charAt(0)}
                </Text>
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.cargo}>{miembro.cargo.toUpperCase()}</Text>
                <Text style={styles.nombre}>{miembro.nombre} {miembro.apellido}</Text>
                <View style={styles.contactButtonsRow}>
                    {miembro.telefono && (
                        <>
                            <TouchableOpacity
                                style={[styles.contactButton, { marginRight: 8 }]}
                                onPress={() => Linking.openURL(`tel:${miembro.telefono}`)}
                            >
                                <Text style={styles.contactButtonText}>📞</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.contactButton, { marginRight: 8 }]}
                                onPress={() => Linking.openURL(`https://wa.me/${miembro.telefono.replace(/\D/g, '')}`)}
                            >
                                <Text style={styles.contactButtonText}>💬</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    <TouchableOpacity
                        style={styles.contactButton}
                        onPress={() => navigation.navigate('Chat', {
                            usuarioId: miembro._id,
                            nombre: `${miembro.nombre} ${miembro.apellido}`
                        })}
                    >
                        <Text style={styles.contactButtonText}>✉️</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {esConsejoActivo && (
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => navigation.navigate('EditarHermano', { hermano: miembro })}
                >
                    <Text style={styles.editIcon}>✏️</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>El Consejo</Text>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content}>
                <Text style={styles.introText}>
                    Hermanos al servicio de la fraternidad. Contáctalos para cualquier duda o necesidad.
                </Text>

                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.primary} />
                ) : (
                    miembros.map(renderMiembro)
                )}

                {!loading && miembros.length === 0 && (
                    <Text style={styles.emptyText}>No hay miembros del consejo registrados aún.</Text>
                )}
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
    introText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.darkGray,
        marginBottom: SPACING.xl,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    card: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.md,
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    avatarText: {
        color: COLORS.white,
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
    },
    infoContainer: {
        flex: 1,
    },
    cargo: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.primary,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    nombre: {
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: SPACING.xs,
    },
    contactButtonsRow: {
        flexDirection: 'row',
        marginTop: 4,
    },
    contactButton: {
        backgroundColor: COLORS.offWhite,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contactButtonText: {
        fontSize: 16,
        color: COLORS.darkGray,
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.gray,
        marginTop: SPACING.xl,
    },
    editButton: {
        padding: SPACING.xs,
        marginLeft: SPACING.sm,
    },
    editIcon: {
        fontSize: 20,
        color: COLORS.primary,
    },
});

export default ConsejoScreen;
