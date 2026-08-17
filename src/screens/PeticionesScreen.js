import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Card from '../components/Card';

const PeticionesScreen = ({ navigation }) => {
    const { usuario } = useAuth();
    const [peticiones, setPeticiones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        cargarPeticiones();
    }, []);

    const cargarPeticiones = async () => {
        try {
            const response = await api.get('/peticiones');
            if (response.data.success) {
                setPeticiones(response.data.peticiones);
            }
        } catch (error) {
            console.error('Error al cargar peticiones:', error);
            Alert.alert('Error', 'No se pudieron cargar las peticiones');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        cargarPeticiones();
    };

    const handleOrar = async (id) => {
        try {
            // Actualización optimista
            const updatedPeticiones = peticiones.map(p => {
                if (p._id === id) {
                    const yaOro = p.oraciones.some(o => o.usuario === usuario._id);
                    let nuevasOraciones;
                    if (yaOro) {
                        nuevasOraciones = p.oraciones.filter(o => o.usuario !== usuario._id);
                    } else {
                        nuevasOraciones = [{ usuario: usuario._id }, ...p.oraciones];
                    }
                    return { ...p, oraciones: nuevasOraciones };
                }
                return p;
            });
            setPeticiones(updatedPeticiones);

            await api.put(`/peticiones/${id}/orar`);
        } catch (error) {
            console.error('Error al registrar oración:', error);
            // Revertir en caso de error (podrías implementar esto si es crítico)
        }
    };

    const eliminarPeticion = (id) => {
        Alert.alert(
            'Eliminar Petición',
            '¿Estás seguro de que deseas eliminar esta petición?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/peticiones/${id}`);
                            Alert.alert('Éxito', 'Petición eliminada correctamente');
                            cargarPeticiones();
                        } catch (error) {
                            console.error('Error al eliminar petición:', error);
                            Alert.alert('Error', 'No se pudo eliminar la petición');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => {
        const oraciones = item.oraciones || [];
        const yaOro = usuario && oraciones.some(o => o.usuario === usuario._id);
        const esAutor = usuario && item.autor?._id === usuario._id;
        const esAdminOCousejo = usuario && ['admin', 'consejo'].includes(usuario.rol);

        return (
            <Card style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {item.anonimo ? '?' : item.autor?.nombre?.charAt(0) || '?'}
                        </Text>
                    </View>
                    <View style={styles.headerText}>
                        <Text style={styles.author}>
                            {item.anonimo ? 'Hermano(a) Anónimo' : `${item.autor?.nombre} ${item.autor?.apellido}`}
                        </Text>
                        <Text style={styles.date}>
                            {item.createdAt ? (() => {
                                try {
                                    return formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: es });
                                } catch (e) {
                                    return 'Recientemente';
                                }
                            })() : ''}
                        </Text>
                    </View>

                    {/* Botón Eliminar (Autor o Admin/Consejo) */}
                    {(esAutor || esAdminOCousejo) && (
                        <TouchableOpacity
                            onPress={() => eliminarPeticion(item._id)}
                            style={styles.deleteButton}
                        >
                            <Text style={styles.deleteIcon}>🗑️</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <Text style={styles.content}>{item.contenido}</Text>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.prayButton, yaOro && styles.prayButtonActive]}
                        onPress={() => handleOrar(item._id)}
                    >
                        <Text style={styles.prayIcon}>🙏</Text>
                        <Text style={[styles.prayText, yaOro && styles.prayTextActive]}>
                            {yaOro ? 'Orando' : 'Orar'} ({oraciones.length})
                        </Text>
                    </TouchableOpacity>
                </View>
            </Card>
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
                    <View>
                        <Text style={styles.headerTitle}>Peticiones</Text>
                        <Text style={styles.headerSubtitle}>Unidos en Oración</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('CrearPeticion')}
                >
                    <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
            </LinearGradient>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={peticiones}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>🙏</Text>
                            <Text style={styles.emptyText}>No hay peticiones recientes</Text>
                            <Text style={styles.emptySubText}>Sé el primero en pedir oración</Text>
                        </View>
                    }
                />
            )}
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    headerSubtitle: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.ivory,
    },
    addButton: {
        backgroundColor: COLORS.white,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    addButtonText: {
        fontSize: 24,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    list: {
        padding: SPACING.lg,
    },
    card: {
        marginBottom: SPACING.md,
        padding: SPACING.md,
    },
    cardHeader: {
        flexDirection: 'row',
        marginBottom: SPACING.md,
        alignItems: 'center',
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    avatarText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: FONT_SIZES.md,
    },
    headerText: {
        flex: 1,
    },
    author: {
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    date: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.gray,
    },
    content: {
        fontSize: FONT_SIZES.md,
        color: COLORS.darkGray,
        lineHeight: 24,
        marginBottom: SPACING.md,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
        paddingTop: SPACING.sm,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    prayButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 15,
        backgroundColor: COLORS.offWhite,
    },
    prayButtonActive: {
        backgroundColor: COLORS.primary + '20', // Opacidad 20%
    },
    prayIcon: {
        marginRight: 4,
        fontSize: 16,
    },
    prayText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.gray,
        fontWeight: '600',
    },
    prayTextActive: {
        color: COLORS.primary,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyIcon: {
        fontSize: 50,
        marginBottom: SPACING.md,
        opacity: 0.5,
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.gray,
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
    },
    emptySubText: {
        textAlign: 'center',
        color: COLORS.gray,
        fontSize: FONT_SIZES.sm,
        marginTop: 4,
    },
    deleteButton: {
        padding: SPACING.xs,
        marginLeft: SPACING.sm,
    },
    deleteIcon: {
        fontSize: 20,
    },
});

export default PeticionesScreen;
