import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_WIDTH = (width - (SPACING.lg * 2) - SPACING.md) / COLUMN_COUNT;

const GaleriaScreen = ({ navigation }) => {
    const [galeria, setGaleria] = useState([]);
    const [loading, setLoading] = useState(true);
    const { usuario, esConsejoActivo } = useAuth();

    useEffect(() => {
        cargarGaleria();
    }, []);

    // Recargar al volver de subir foto
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            cargarGaleria();
        });
        return unsubscribe;
    }, [navigation]);

    const cargarGaleria = async () => {
        try {
            const response = await api.get('/galeria');
            if (response.data.success) {
                setGaleria(response.data.galeria);
            }
        } catch (error) {
            console.error('Error al cargar galería:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = (item) => (
        <TouchableOpacity
            key={item._id}
            style={styles.itemContainer}
            onPress={() => navigation.navigate('DetalleFoto', { item })}
        >
            <Image
                source={{ uri: item.archivoUrl }}
                style={styles.thumbnail}
                resizeMode="cover"
            />
            {item.tipoArchivo === 'video' && (
                <View style={styles.videoBadge}>
                    <Text style={styles.videoIcon}>▶️</Text>
                </View>
            )}
            <View style={styles.itemInfo}>
                <Text style={styles.itemTitle} numberOfLines={1}>{item.titulo}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.primary, COLORS.tertiary]}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Galería</Text>

                    {esConsejoActivo && (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('SubirFoto')}
                            style={styles.addButton}
                        >
                            <Text style={styles.addIcon}>+</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
                ) : (
                    <View style={styles.grid}>
                        {galeria.map(renderItem)}
                    </View>
                )}

                {!loading && galeria.length === 0 && (
                    <Text style={styles.emptyText}>No hay fotos ni videos aún.</Text>
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
        marginLeft: -SPACING.xl, // Compensar botón add
    },
    addButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addIcon: {
        fontSize: 24,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    content: {
        padding: SPACING.lg,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    itemContainer: {
        width: ITEM_WIDTH,
        marginBottom: SPACING.md,
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.md,
        overflow: 'hidden',
        ...SHADOWS.small,
    },
    thumbnail: {
        width: '100%',
        height: ITEM_WIDTH, // Cuadrado
    },
    videoBadge: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 12,
        padding: 4,
    },
    videoIcon: {
        fontSize: 12,
        color: COLORS.white,
    },
    itemInfo: {
        padding: SPACING.sm,
    },
    itemTitle: {
        fontSize: FONT_SIZES.xs,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.gray,
        marginTop: SPACING.xl,
    },
});

export default GaleriaScreen;
