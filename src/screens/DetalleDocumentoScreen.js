import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api, { API_URL } from '../config/api';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const DetalleDocumentoScreen = ({ navigation, route }) => {
    const { documentoId } = route.params;
    const [documento, setDocumento] = useState(null);
    const [loading, setLoading] = useState(true);
    const { usuario, esConsejoActivo } = useAuth();

    useEffect(() => {
        cargarDocumento();
    }, [documentoId]);

    // Escuchar el foco para recargar datos si se editó
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            cargarDocumento();
        });
        return unsubscribe;
    }, [navigation]);

    const cargarDocumento = async () => {
        try {
            const response = await api.get(`/documentos/${documentoId}`);
            if (response.data.success) {
                setDocumento(response.data.documento);
            }
        } catch (error) {
            console.error('Error al cargar documento:', error);
            Alert.alert('Error', 'No se pudo cargar el documento');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const abrirArchivo = async () => {
        if (!documento?.archivoUrl) return;

        // Construir URL completa (API_URL termina en /api, lo removemos para obtener la raíz)
        const baseUrl = API_URL.replace('/api', '');
        const fullUrl = `${baseUrl}${documento.archivoUrl}`;

        try {
            const supported = await Linking.canOpenURL(fullUrl);
            if (supported) {
                await Linking.openURL(fullUrl);
            } else {
                Alert.alert('Error', 'No se puede abrir este archivo');
            }
        } catch (error) {
            console.error('Error al abrir archivo:', error);
            Alert.alert('Error', 'Ocurrió un error al intentar abrir el archivo');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!documento) return null;

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
                        <Text style={styles.headerTitle} numberOfLines={1}>{documento.titulo}</Text>
                        <Text style={styles.headerSubtitle}>{documento.tipo.toUpperCase()}</Text>
                    </View>

                    {esConsejoActivo && (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('EditarDocumento', { documento })}
                            style={styles.editButton}
                        >
                            <Text style={styles.editIcon}>✏️</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.paper}>
                    {documento.descripcion && (
                        <View style={styles.descriptionContainer}>
                            <Text style={styles.descriptionLabel}>Descripción:</Text>
                            <Text style={styles.descriptionText}>{documento.descripcion}</Text>
                        </View>
                    )}

                    {documento.archivoUrl && (
                        <TouchableOpacity style={styles.downloadButton} onPress={abrirArchivo}>
                            <Text style={styles.downloadIcon}>📎</Text>
                            <Text style={styles.downloadText}>
                                Ver Archivo Adjunto ({documento.archivoNombre || 'Documento'})
                            </Text>
                        </TouchableOpacity>
                    )}

                    <View style={styles.divider} />

                    <Text style={styles.contentBody}>{documento.contenido}</Text>
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
    },
    backButton: {
        marginRight: SPACING.md,
    },
    backIcon: {
        fontSize: 24,
        color: COLORS.white,
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    headerSubtitle: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.ivory,
    },
    content: {
        padding: SPACING.lg,
    },
    paper: {
        backgroundColor: COLORS.white,
        padding: SPACING.xl,
        borderRadius: BORDER_RADIUS.lg,
        ...SHADOWS.medium,
        minHeight: 500,
    },
    descriptionContainer: {
        backgroundColor: COLORS.offWhite,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.md,
    },
    descriptionLabel: {
        fontSize: FONT_SIZES.xs,
        fontWeight: 'bold',
        color: COLORS.darkGray,
        marginBottom: 4,
    },
    descriptionText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.gray,
        fontStyle: 'italic',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.lightGray,
        marginVertical: SPACING.md,
    },
    contentBody: {
        fontSize: FONT_SIZES.md,
        color: COLORS.black,
        lineHeight: 26,
        textAlign: 'justify',
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.offWhite,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.primary,
        marginBottom: SPACING.md,
    },
    downloadIcon: {
        fontSize: 20,
        marginRight: SPACING.sm,
    },
    downloadText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.primary,
        fontWeight: 'bold',
        flex: 1,
    },
    editButton: {
        padding: SPACING.xs,
        marginLeft: SPACING.sm,
    },
    editIcon: {
        fontSize: 20,
        color: COLORS.white,
    },
});

export default DetalleDocumentoScreen;
