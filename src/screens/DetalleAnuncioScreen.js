import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '../config/api';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const DetalleAnuncioScreen = ({ route, navigation }) => {
    const { anuncio } = route.params;
    const { usuario, esConsejoActivo } = useAuth();

    // Si pasamos el objeto completo, no necesitamos cargar, pero si queremos refrescar o si venimos de una notificación solo con ID, podríamos necesitar cargar.
    // Por ahora asumimos que pasamos el objeto completo desde AnunciosScreen.

    const getPrioridadColor = (prioridad) => {
        switch (prioridad) {
            case 'alta': return COLORS.error;
            case 'normal': return COLORS.primary;
            case 'baja': return COLORS.gray;
            default: return COLORS.primary;
        }
    };

    const getTipoIcon = (tipo) => {
        switch (tipo) {
            case 'urgente': return '🚨';
            case 'evento': return '📅';
            case 'formacion': return '📖';
            case 'apostolado': return '🙏';
            default: return '📢';
        }
    };

    const eliminarAnuncio = () => {
        Alert.alert(
            'Eliminar Anuncio',
            '¿Estás seguro de que deseas eliminar este anuncio?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/anuncios/${anuncio._id}`);
                            Alert.alert('Éxito', 'Anuncio eliminado correctamente', [
                                { text: 'OK', onPress: () => navigation.goBack() }
                            ]);
                        } catch (error) {
                            console.error('Error al eliminar anuncio:', error);
                            Alert.alert('Error', 'No se pudo eliminar el anuncio');
                        }
                    }
                }
            ]
        );
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
                    <Text style={styles.headerTitle}>Detalle del Anuncio</Text>

                    {esConsejoActivo && (
                        <View style={styles.headerActions}>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('EditarAnuncio', { anuncio })}
                                style={styles.actionButton}
                            >
                                <Text style={styles.actionIcon}>✏️</Text>
                            </TouchableOpacity>
                            {usuario.rol === 'admin' && (
                                <TouchableOpacity
                                    onPress={eliminarAnuncio}
                                    style={styles.actionButton}
                                >
                                    <Text style={styles.actionIcon}>🗑️</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <View style={styles.metaHeader}>
                        <View style={styles.tipoBadge}>
                            <Text style={styles.tipoIcon}>{getTipoIcon(anuncio.tipo)}</Text>
                            <Text style={styles.tipoText}>{anuncio.tipo.toUpperCase()}</Text>
                        </View>
                        <View style={[styles.prioridadBadge, { backgroundColor: getPrioridadColor(anuncio.prioridad) }]}>
                            <Text style={styles.prioridadText}>{anuncio.prioridad.toUpperCase()}</Text>
                        </View>
                    </View>

                    <Text style={styles.title}>{anuncio.titulo}</Text>

                    {anuncio.imagen && (
                        <Image
                            source={{ uri: anuncio.imagen }}
                            style={styles.imagenDetalle}
                            resizeMode="cover"
                        />
                    )}

                    {anuncio.ubicacion && anuncio.ubicacion.lat && (
                        <TouchableOpacity
                            style={styles.mapButton}
                            onPress={() => navigation.navigate('Mapa', {
                                focusOn: {
                                    latitude: anuncio.ubicacion.lat,
                                    longitude: anuncio.ubicacion.lng,
                                    title: anuncio.titulo
                                }
                            })}
                        >
                            <Text style={styles.mapButtonText}>📍 Ver ubicación en Mapa</Text>
                        </TouchableOpacity>
                    )}

                    <View style={styles.divider} />

                    <Text style={styles.body}>{anuncio.contenido}</Text>

                    <View style={styles.footer}>
                        <Text style={styles.date}>
                            Publicado el {format(new Date(anuncio.fechaPublicacion), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                        </Text>
                        <Text style={styles.author}>
                            Por: {anuncio.autor?.nombre} {anuncio.autor?.apellido}
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
        justifyContent: 'space-between',
    },
    backButton: {
        padding: SPACING.xs,
    },
    backIcon: {
        fontSize: 24,
        color: COLORS.white,
    },
    headerTitle: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.white,
        flex: 1,
        textAlign: 'center',
        marginLeft: -SPACING.xl,
    },
    headerActions: {
        flexDirection: 'row',
    },
    actionButton: {
        padding: SPACING.xs,
        marginLeft: SPACING.xs,
    },
    actionIcon: {
        fontSize: 20,
        color: COLORS.white,
    },
    content: {
        padding: SPACING.lg,
    },
    card: {
        backgroundColor: COLORS.white,
        padding: SPACING.xl,
        borderRadius: BORDER_RADIUS.lg,
        ...SHADOWS.medium,
        minHeight: 300,
    },
    metaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },
    tipoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.offWhite,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.full,
    },
    tipoIcon: {
        marginRight: SPACING.xs,
    },
    tipoText: {
        fontSize: FONT_SIZES.xs,
        fontWeight: 'bold',
        color: COLORS.darkGray,
    },
    prioridadBadge: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.full,
    },
    prioridadText: {
        fontSize: FONT_SIZES.xs,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    title: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: SPACING.md,
    },
    imagenDetalle: {
        width: '100%',
        height: 250,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.md,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.lightGray,
        marginBottom: SPACING.md,
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
    date: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.gray,
        marginBottom: SPACING.xs,
    },
    author: {
        fontSize: FONT_SIZES.sm,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    mapButton: {
        backgroundColor: COLORS.tertiary,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    mapButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: FONT_SIZES.md,
    },
});

export default DetalleAnuncioScreen;
