import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Share,
    Alert,
    ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { Linking } from 'react-native';

const DetalleCantoScreen = ({ navigation, route }) => {
    const { cantoId } = route.params;
    const [canto, setCanto] = useState(null);
    const [loading, setLoading] = useState(true);
    const { usuario, esConsejoActivo } = useAuth();

    useEffect(() => {
        cargarCanto();
    }, [cantoId]);

    // Escuchar el foco para recargar datos si se editó
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            cargarCanto();
        });
        return unsubscribe;
    }, [navigation]);

    const cargarCanto = async () => {
        try {
            const response = await api.get(`/cantos/${cantoId}`);
            if (response.data.success) {
                setCanto(response.data.canto);
            }
        } catch (error) {
            console.error('Error al cargar canto:', error);
            Alert.alert('Error', 'No se pudo cargar el detalle del canto');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const compartirCanto = async () => {
        try {
            await Share.share({
                message: `${canto.titulo}\n\n${canto.letra}\n\nCompartido desde App JUFRA Pomalca`,
            });
        } catch (error) {
            console.error(error.message);
        }
    };

    const abrirArchivo = () => {
        if (canto.archivoUrl) {
            Linking.openURL(canto.archivoUrl);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!canto) return null;

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
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>{canto.titulo}</Text>
                        <Text style={styles.headerSubtitle}>{canto.categoria.toUpperCase()}</Text>
                    </View>
                    <View style={styles.headerActions}>
                        {esConsejoActivo && (
                            <TouchableOpacity
                                onPress={() => navigation.navigate('EditarCanto', { canto })}
                                style={styles.actionButton}
                            >
                                <Text style={styles.actionIcon}>✏️</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={compartirCanto} style={styles.actionButton}>
                            <Text style={styles.actionIcon}>📤</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.paper}>
                    <Text style={styles.lyrics}>{canto.letra}</Text>

                    {canto.autor && (
                        <Text style={styles.author}>Autor: {canto.autor}</Text>
                    )}

                    {canto.archivoUrl && (
                        <TouchableOpacity style={styles.fileButton} onPress={abrirArchivo}>
                            <Text style={styles.fileButtonText}>
                                📎 Ver Archivo Adjunto ({canto.archivoNombre || 'Descargar'})
                            </Text>
                        </TouchableOpacity>
                    )}
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
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.white,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.ivory,
        marginTop: 2,
    },
    content: {
        padding: SPACING.lg,
    },
    paper: {
        backgroundColor: COLORS.white,
        padding: SPACING.xl,
        borderRadius: BORDER_RADIUS.lg,
        ...SHADOWS.medium,
        minHeight: 400,
    },
    lyrics: {
        fontSize: FONT_SIZES.md,
        color: COLORS.black,
        lineHeight: 28,
        textAlign: 'center',
        whiteSpace: 'pre-wrap', // Para respetar saltos de línea
    },
    author: {
        marginTop: SPACING.xl,
        fontSize: FONT_SIZES.sm,
        color: COLORS.gray,
        fontStyle: 'italic',
        textAlign: 'right',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
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
        marginTop: SPACING.xl,
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

export default DetalleCantoScreen;
