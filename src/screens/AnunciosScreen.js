import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ScrollView,
    Alert,
    Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import Card from '../components/Card';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const AnunciosScreen = ({ navigation }) => {
    const { usuario } = useAuth();
    const [anuncios, setAnuncios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filtroTipo, setFiltroTipo] = useState('todos');

    useEffect(() => {
        cargarAnuncios();
    }, [filtroTipo]);

    const cargarAnuncios = async () => {
        try {
            const params = filtroTipo !== 'todos' ? { tipo: filtroTipo } : {};
            const response = await api.get('/anuncios', { params });

            if (response.data.success) {
                setAnuncios(response.data.anuncios);
            }
        } catch (error) {
            console.error('Error al cargar anuncios:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        cargarAnuncios();
    };

    const getPrioridadColor = (prioridad) => {
        switch (prioridad) {
            case 'alta':
                return COLORS.error;
            case 'normal':
                return COLORS.primary;
            case 'baja':
                return COLORS.gray;
            default:
                return COLORS.primary;
        }
    };

    const getTipoIcon = (tipo) => {
        switch (tipo) {
            case 'urgente':
                return '🚨';
            case 'evento':
                return '📅';
            case 'formacion':
                return '📖';
            case 'apostolado':
                return '🙏';
            default:
                return '📢';
        }
    };

    const eliminarAnuncio = (id) => {
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
                            await api.delete(`/anuncios/${id}`);
                            Alert.alert('Éxito', 'Anuncio eliminado correctamente');
                            cargarAnuncios();
                        } catch (error) {
                            console.error('Error al eliminar anuncio:', error);
                            Alert.alert('Error', 'No se pudo eliminar el anuncio');
                        }
                    }
                }
            ]
        );
    };

    const renderAnuncio = ({ item }) => {
        const fechaPublicacion = item.fechaPublicacion
            ? format(new Date(item.fechaPublicacion), "d 'de' MMMM, yyyy", { locale: es })
            : '';

        return (
            <TouchableOpacity
                onPress={() => navigation.navigate('DetalleAnuncio', { anuncio: item })}
                activeOpacity={0.8}
            >
                <Card style={[styles.anuncioCard, item.destacado && styles.destacado]}>
                    {item.destacado && (
                        <View style={styles.badgeDestacado}>
                            <Text style={styles.badgeText}>⭐ Destacado</Text>
                        </View>
                    )}

                    <View style={styles.anuncioHeader}>
                        <View style={styles.headerTopRow}>
                            <View style={styles.tipoContainer}>
                                <Text style={styles.tipoIcon}>{getTipoIcon(item.tipo)}</Text>
                                <Text style={styles.tipoText}>{item.tipo}</Text>
                            </View>

                            <View style={styles.headerActions}>
                                <View style={[styles.prioridadBadge, { backgroundColor: getPrioridadColor(item.prioridad) }]}>
                                    <Text style={styles.prioridadText}>{item.prioridad}</Text>
                                </View>

                                {/* Acciones (Solo Consejo) */}
                                {usuario && ['coordinador', 'vice-coordinador', 'secretario', 'tesorero', 'formador', 'admin'].includes(usuario.cargo) && (
                                    <View style={{ flexDirection: 'row' }}>
                                        <TouchableOpacity
                                            onPress={() => navigation.navigate('EditarAnuncio', { anuncio: item })}
                                            style={styles.editButton}
                                        >
                                            <Text style={styles.editIcon}>✏️</Text>
                                        </TouchableOpacity>

                                        {usuario.rol === 'admin' && (
                                            <TouchableOpacity
                                                onPress={() => eliminarAnuncio(item._id)}
                                                style={styles.editButton}
                                            >
                                                <Text style={styles.editIcon}>🗑️</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    <Text style={styles.titulo}>{item.titulo}</Text>

                    {item.imagen && (
                        <Image
                            source={{ uri: item.imagen }}
                            style={styles.anuncioImagen}
                            resizeMode="cover"
                        />
                    )}

                    <Text style={styles.contenido} numberOfLines={3}>
                        {item.contenido}
                    </Text>

                    <View style={styles.anuncioFooter}>
                        <View style={styles.autorInfo}>
                            <Text style={styles.autorNombre}>
                                {item.autor?.nombre} {item.autor?.apellido}
                            </Text>
                            {item.autor?.cargo && item.autor.cargo !== 'ninguno' && (
                                <Text style={styles.autorCargo}> • {item.autor.cargo}</Text>
                            )}
                        </View>
                        <Text style={styles.fecha}>{fechaPublicacion}</Text>
                    </View>

                    {item.vistas > 0 && (
                        <Text style={styles.vistas}>👁️ {item.vistas} vistas</Text>
                    )}
                </Card>
            </TouchableOpacity>
        );
    };

    const filtros = [
        { id: 'todos', label: 'Todos', icon: '📋' },
        { id: 'urgente', label: 'Urgentes', icon: '🚨' },
        { id: 'evento', label: 'Eventos', icon: '📅' },
        { id: 'formacion', label: 'Formación', icon: '📖' },
        { id: 'apostolado', label: 'Apostolado', icon: '🙏' },
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={[COLORS.primary, COLORS.accent]}
                style={styles.header}
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Anuncios</Text>
                    <Text style={styles.headerSubtitle}>
                        {anuncios.length} {anuncios.length === 1 ? 'anuncio' : 'anuncios'}
                    </Text>
                </View>
            </LinearGradient>

            {/* Filtros */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filtrosContainer}
                contentContainerStyle={styles.filtrosContent}
            >
                {filtros.map((filtro) => (
                    <TouchableOpacity
                        key={filtro.id}
                        onPress={() => setFiltroTipo(filtro.id)}
                        style={[
                            styles.filtroButton,
                            filtroTipo === filtro.id && styles.filtroButtonActive
                        ]}
                    >
                        <Text style={styles.filtroIcon}>{filtro.icon}</Text>
                        <Text
                            style={[
                                styles.filtroText,
                                filtroTipo === filtro.id && styles.filtroTextActive
                            ]}
                        >
                            {filtro.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Lista de anuncios */}
            <FlatList
                data={anuncios}
                renderItem={renderAnuncio}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📢</Text>
                        <Text style={styles.emptyText}>No hay anuncios disponibles</Text>
                    </View>
                }
            />

            {/* Botón Flotante para Crear Anuncio (Solo Consejo) */}
            {usuario && ['coordinador', 'vice-coordinador', 'secretario', 'tesorero', 'formador', 'admin'].includes(usuario.cargo) && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('CrearAnuncio')}
                    activeOpacity={0.8}
                >
                    <Text style={styles.fabIcon}>+</Text>
                </TouchableOpacity>
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
        alignItems: 'center',
    },
    backButton: {
        marginRight: SPACING.md,
    },
    backButtonText: {
        fontSize: 28,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: SPACING.xs,
    },
    headerSubtitle: {
        fontSize: FONT_SIZES.md,
        color: COLORS.ivory,
    },
    filtrosContainer: {
        maxHeight: 60,
        marginVertical: SPACING.md,
    },
    filtrosContent: {
        paddingHorizontal: SPACING.lg,
    },
    filtroButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        marginRight: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.white,
        ...SHADOWS.small,
    },
    filtroButtonActive: {
        backgroundColor: COLORS.primary,
    },
    filtroIcon: {
        fontSize: FONT_SIZES.md,
        marginRight: SPACING.xs,
    },
    filtroText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.darkGray,
        fontWeight: '600',
    },
    filtroTextActive: {
        color: COLORS.white,
    },
    listContent: {
        padding: SPACING.lg,
        paddingTop: 0,
    },
    anuncioCard: {
        marginBottom: SPACING.md,
        position: 'relative',
    },
    destacado: {
        borderWidth: 2,
        borderColor: COLORS.gold,
    },
    badgeDestacado: {
        position: 'absolute',
        top: -8,
        right: SPACING.md,
        backgroundColor: COLORS.gold,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
        ...SHADOWS.medium,
    },
    badgeText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    anuncioHeader: {
        marginBottom: SPACING.sm,
    },
    headerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tipoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    tipoIcon: {
        fontSize: FONT_SIZES.lg,
        marginRight: SPACING.xs,
    },
    tipoText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.gray,
        textTransform: 'capitalize',
    },
    prioridadBadge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
        marginRight: SPACING.xs,
    },
    editButton: {
        padding: 4,
        marginLeft: SPACING.xs,
    },
    editIcon: {
        fontSize: 18,
    },
    prioridadText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.white,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    titulo: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: SPACING.sm,
    },
    anuncioImagen: {
        width: '100%',
        height: 150,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.md,
    },
    contenido: {
        fontSize: FONT_SIZES.md,
        color: COLORS.darkGray,
        lineHeight: 22,
        marginBottom: SPACING.md,
    },
    anuncioFooter: {
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
        paddingTop: SPACING.sm,
        marginBottom: SPACING.xs,
    },
    autorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    autorNombre: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.primary,
    },
    autorCargo: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.gray,
        textTransform: 'capitalize',
    },
    fecha: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.gray,
    },
    vistas: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.gray,
        textAlign: 'right',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xxl,
    },
    emptyIcon: {
        fontSize: 60,
        marginBottom: SPACING.md,
    },
    emptyText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.gray,
    },
    fab: {
        position: 'absolute',
        bottom: SPACING.xl,
        right: SPACING.xl,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.large,
        elevation: 5,
    },
    fabIcon: {
        fontSize: 32,
        color: COLORS.white,
        fontWeight: 'bold',
        marginTop: -2,
    },
});

export default AnunciosScreen;
