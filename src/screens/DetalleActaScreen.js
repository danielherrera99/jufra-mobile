import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '../config/api';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

import { useAuth } from '../context/AuthContext';

const DetalleActaScreen = ({ route, navigation }) => {
    const { actaId } = route.params;
    const { usuario, esConsejoReal } = useAuth();
    const [acta, setActa] = useState(null);
    const [loading, setLoading] = useState(true);

    const esConsejo = esConsejoReal;

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            cargarActa();
        });
        return unsubscribe;
    }, [navigation]);

    const cargarActa = async () => {
        try {
            const response = await api.get(`/actas/${actaId}`);
            if (response.data.success) {
                setActa(response.data.acta);
            }
        } catch (error) {
            console.error('Error al cargar acta:', error);
            Alert.alert('Error', 'No se pudo cargar el detalle del acta');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!acta) return null;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.accent, COLORS.primary]}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Detalle del Acta</Text>
                </View>
                {esConsejo && (
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.navigate('EditarActa', { actaId: acta._id })}
                    >
                        <Text style={styles.editButtonText}>✎</Text>
                    </TouchableOpacity>
                )}
            </LinearGradient>

            <ScrollView style={styles.content}>
                <View style={styles.card}>
                    <View style={styles.metaInfo}>
                        <View style={styles.dateBadge}>
                            <Text style={styles.dateText}>
                                {format(new Date(acta.fecha), "d 'de' MMMM, yyyy", { locale: es })}
                            </Text>
                        </View>
                        <View style={[styles.typeBadge, { backgroundColor: COLORS.secondary }]}>
                            <Text style={styles.typeText}>{acta.tipoReunion}</Text>
                        </View>
                    </View>

                    <Text style={styles.title}>{acta.titulo}</Text>

                    <View style={styles.divider} />

                    <Text style={styles.body}>
                        {acta.contenido}
                    </Text>

                    <View style={styles.footer}>
                        <Text style={styles.authorLabel}>Registrado por:</Text>
                        <Text style={styles.authorName}>
                            {acta.creadoPor?.nombre} {acta.creadoPor?.apellido}
                        </Text>
                    </View>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    editButton: {
        backgroundColor: COLORS.white,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
        position: 'absolute',
        right: SPACING.lg,
        top: 50,
    },
    editButtonText: {
        fontSize: 24,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    content: {
        padding: SPACING.lg,
    },
    card: {
        backgroundColor: COLORS.white,
        padding: SPACING.xl,
        borderRadius: BORDER_RADIUS.lg,
        ...SHADOWS.medium,
        marginBottom: SPACING.xl,
    },
    metaInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },
    dateBadge: {
        backgroundColor: COLORS.offWhite,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.md,
    },
    dateText: {
        color: COLORS.darkGray,
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
    },
    typeBadge: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.md,
    },
    typeText: {
        color: COLORS.white,
        fontSize: FONT_SIZES.sm,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    title: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: SPACING.md,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.lightGray,
        marginVertical: SPACING.md,
    },
    body: {
        fontSize: FONT_SIZES.md,
        color: COLORS.darkGray,
        lineHeight: 24,
        marginBottom: SPACING.xl,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
        paddingTop: SPACING.md,
    },
    authorLabel: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.gray,
        marginBottom: 2,
    },
    authorName: {
        fontSize: FONT_SIZES.sm,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
});

export default DetalleActaScreen;
