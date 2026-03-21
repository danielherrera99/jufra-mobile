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
import { Linking } from 'react-native';

const DetalleFormacionScreen = ({ route, navigation }) => {
    const { temaId } = route.params;
    const [tema, setTema] = useState(null);
    const [loading, setLoading] = useState(true);
    const { usuario, esConsejoActivo } = useAuth();

    useEffect(() => {
        cargarTema();
    }, [temaId]); // Recargar si cambia el ID (o al volver de editar)

    // Escuchar el foco para recargar datos si se editó
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            cargarTema();
        });
        return unsubscribe;
    }, [navigation]);

    const cargarTema = async () => {
        try {
            const response = await api.get(`/formacion/${temaId}`);
            if (response.data.success) {
                setTema(response.data.tema);
            }
        } catch (error) {
            console.error('Error al cargar tema:', error);
            Alert.alert('Error', 'No se pudo cargar el detalle del tema');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const abrirArchivo = () => {
        if (tema.archivoUrl) {
            Linking.openURL(tema.archivoUrl);
        }
    };

    const eliminarTema = () => {
        Alert.alert(
            'Eliminar Tema',
            '¿Estás seguro de que deseas eliminar este tema de formación?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/formacion/${temaId}`);
                            Alert.alert('Éxito', 'Tema eliminado correctamente', [
                                { text: 'OK', onPress: () => navigation.goBack() }
                            ]);
                        } catch (error) {
                            console.error('Error al eliminar tema:', error);
                            Alert.alert('Error', 'No se pudo eliminar el tema');
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!tema) return null;

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
                    <Text style={styles.headerTitle}>Tema de Formación</Text>

                    {esConsejoActivo && (
                        <View style={styles.headerActions}>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('EditarFormacion', { tema })}
                                style={styles.actionButton}
                            >
                                <Text style={styles.actionIcon}>✏️</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={eliminarTema}
                                style={styles.actionButton}
                            >
                                <Text style={styles.actionIcon}>🗑️</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </LinearGradient>

            <ScrollView style={styles.content}>
                <View style={styles.card}>
                    <View style={styles.metaInfo}>
                        <View style={styles.dateBadge}>
                            <Text style={styles.dateText}>
                                {format(new Date(tema.fecha), "d 'de' MMMM, yyyy", { locale: es })}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.title}>{tema.titulo}</Text>

                    {tema.descripcion && (
                        <Text style={styles.description}>{tema.descripcion}</Text>
                    )}

                    <View style={styles.divider} />

                    <Text style={styles.body}>
                        {tema.contenido}
                    </Text>

                    {tema.archivoUrl && (
                        <TouchableOpacity style={styles.fileButton} onPress={abrirArchivo}>
                            <Text style={styles.fileButtonText}>
                                📎 Ver Archivo Adjunto ({tema.archivoNombre || 'Descargar'})
                            </Text>
                        </TouchableOpacity>
                    )}

                    {tema.etiquetas && tema.etiquetas.length > 0 && (
                        <View style={styles.tagsContainer}>
                            {tema.etiquetas.map((tag, index) => (
                                <View key={index} style={styles.tag}>
                                    <Text style={styles.tagText}>#{tag}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <View style={styles.footer}>
                        <Text style={styles.authorLabel}>Impartido por:</Text>
                        <Text style={styles.authorName}>
                            {tema.autor?.nombre} {tema.autor?.apellido}
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
        justifyContent: 'flex-start',
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
    title: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: SPACING.sm,
    },
    description: {
        fontSize: FONT_SIZES.md,
        color: COLORS.gray,
        fontStyle: 'italic',
        marginBottom: SPACING.sm,
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
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: SPACING.lg,
    },
    tag: {
        backgroundColor: COLORS.offWhite,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
        marginRight: SPACING.sm,
        marginBottom: SPACING.sm,
    },
    tagText: {
        color: COLORS.primary,
        fontSize: FONT_SIZES.xs,
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
    headerActions: {
        flexDirection: 'row',
        marginLeft: 'auto',
    },
    actionButton: {
        padding: SPACING.xs,
        marginLeft: SPACING.xs,
    },
    actionIcon: {
        fontSize: 20,
        color: COLORS.white,
    },
    fileButton: {
        marginBottom: SPACING.xl,
        backgroundColor: COLORS.offWhite,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.primary,
        alignItems: 'center',
    },
    fileButtonText: {
        color: COLORS.primary,
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
    },
});

export default DetalleFormacionScreen;
