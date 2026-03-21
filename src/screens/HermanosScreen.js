import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    RefreshControl,
    Image,
    ActivityIndicator,
    Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import Card from '../components/Card';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useFocusEffect } from '@react-navigation/native';

const HermanosScreen = ({ navigation }) => {
    const { usuario } = useAuth();
    const [hermanos, setHermanos] = useState([]);
    const [hermanosFiltrados, setHermanosFiltrados] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('activos');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const esAdmin = usuario && (
        usuario.rol === 'admin' ||
        usuario.rol === 'consejo' ||
        ['coordinador', 'vice-coordinador', 'secretario', 'tesorero', 'formador', 'animador'].includes(usuario.cargo)
    );

    const cargarHermanos = async () => {
        try {
            let url = '/hermanos';
            if (filtroEstado === 'pendientes') {
                url += '?pendientes=true';
            }

            const response = await api.get(url);
            if (response.data.success) {
                setHermanos(response.data.hermanos);
                // Initialize filtered list if search is empty, otherwise filter will handle it
                if (!busqueda.trim()) {
                    setHermanosFiltrados(response.data.hermanos);
                }
            }
        } catch (error) {
            console.error('Error al cargar hermanos:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            cargarHermanos();
        }, [filtroEstado])
    );

    const aprobarHermano = async (id) => {
        try {
            await api.put(`/hermanos/${id}`, { activo: true });
            Alert.alert('Éxito', 'Hermano aprobado correctamente');
            cargarHermanos();
        } catch (error) {
            console.error('Error al aprobar:', error);
            Alert.alert('Error', 'No se pudo aprobar al hermano');
        }
    };

    const rechazarHermano = async (id) => {
        Alert.alert(
            'Rechazar Solicitud',
            '¿Estás seguro? Esto eliminará la solicitud permanentemente.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Rechazar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/hermanos/${id}`);
                            cargarHermanos();
                        } catch (error) {
                            console.error('Error al rechazar:', error);
                            Alert.alert('Error', 'No se pudo rechazar la solicitud');
                        }
                    }
                }
            ]
        );
    };

    useEffect(() => {
        filtrarHermanos();
    }, [busqueda, hermanos]);

    const filtrarHermanos = () => {
        if (!busqueda.trim()) {
            setHermanosFiltrados(hermanos);
            return;
        }

        const textoBusqueda = busqueda.toLowerCase();
        const filtrados = hermanos.filter((hermano) => {
            const nombreCompleto = `${hermano.nombre} ${hermano.apellido}`.toLowerCase();
            const cargo = hermano.cargo ? hermano.cargo.toLowerCase() : '';
            const etapa = hermano.etapaFormacion ? hermano.etapaFormacion.toLowerCase() : '';

            return nombreCompleto.includes(textoBusqueda) ||
                cargo.includes(textoBusqueda) ||
                etapa.includes(textoBusqueda);
        });

        setHermanosFiltrados(filtrados);
    };



    const onRefresh = () => {
        setRefreshing(true);
        cargarHermanos();
    };

    const renderHermano = ({ item }) => {
        const añosEnJufra = item.fechaIngreso
            ? new Date().getFullYear() - new Date(item.fechaIngreso).getFullYear()
            : 0;

        const edad = item.fechaNacimiento
            ? new Date().getFullYear() - new Date(item.fechaNacimiento).getFullYear()
            : null;

        return (
            <TouchableOpacity
                onPress={() => navigation.navigate('DetalleHermano', { hermano: item })}
                activeOpacity={0.8}
            >
                <Card style={styles.hermanoCard}>
                    <View style={styles.hermanoContent}>
                        {/* Avatar */}
                        <View style={styles.avatarContainer}>
                            {item.foto ? (
                                <Image source={{ uri: item.foto }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarText}>
                                        {item.nombre[0]}{item.apellido[0]}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Información */}
                        <View style={styles.hermanoInfo}>
                            <Text style={styles.hermanoNombre}>
                                {item.nombre} {item.apellido}
                            </Text>

                            <View style={styles.badges}>
                                <View style={[styles.badge, styles.badgeEtapa]}>
                                    <Text style={styles.badgeText}>
                                        {item.etapaFormacion.replace('_', ' ')}
                                    </Text>
                                </View>

                                {item.cargo !== 'ninguno' && (
                                    <View style={[styles.badge, styles.badgeCargo]}>
                                        <Text style={styles.badgeText}>
                                            {item.cargo.replace('_', ' ')}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.statsContainer}>
                                {edad !== null && (
                                    <Text style={styles.statText}>
                                        🎂 {edad} años
                                    </Text>
                                )}
                                {añosEnJufra > 0 && (
                                    <Text style={styles.statText}>
                                        🕊️ {añosEnJufra} {añosEnJufra === 1 ? 'año' : 'años'} en JUFRA
                                    </Text>
                                )}
                            </View>
                        </View>

                        {/* Acciones */}
                        {/* Acciones */}
                        {/* Acciones */}
                        <View style={styles.actionsContainer}>
                            {/* Botón Mensaje (Para todos, excepto uno mismo y pendientes) */}
                            {filtroEstado !== 'pendientes' && item._id !== usuario._id && (
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Chat', {
                                        usuarioId: item._id,
                                        nombre: `${item.nombre} ${item.apellido}`
                                    })}
                                    style={[styles.actionButton, { marginRight: 8 }]}
                                >
                                    <Text style={styles.actionIcon}>✉️</Text>
                                </TouchableOpacity>
                            )}

                            {filtroEstado === 'pendientes' ? (
                                <View style={{ flexDirection: 'row' }}>
                                    <TouchableOpacity
                                        onPress={() => aprobarHermano(item._id)}
                                        style={[styles.actionButton, styles.approveButton]}
                                    >
                                        <Text style={styles.actionIcon}>✅</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => rechazarHermano(item._id)}
                                        style={[styles.actionButton, styles.rejectButton]}
                                    >
                                        <Text style={styles.actionIcon}>❌</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                esAdmin && (
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('EditarHermano', { hermano: item })}
                                        style={styles.actionButton}
                                    >
                                        <Text style={styles.actionIcon}>✏️</Text>
                                    </TouchableOpacity>
                                )
                            )}
                        </View>
                    </View>
                </Card>
            </TouchableOpacity>
        );
    };

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
                    <Text style={styles.headerTitle}>Hermanos</Text>
                    <Text style={styles.headerSubtitle}>
                        {hermanosFiltrados.length} {hermanosFiltrados.length === 1 ? 'hermano' : 'hermanos'}
                    </Text>
                </View>
            </LinearGradient>

            {/* Tabs (Solo Admin) */}
            {esAdmin && (
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, filtroEstado === 'activos' && styles.tabActive]}
                        onPress={() => setFiltroEstado('activos')}
                    >
                        <Text style={[styles.tabText, filtroEstado === 'activos' && styles.tabTextActive]}>
                            Activos
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, filtroEstado === 'pendientes' && styles.tabActive]}
                        onPress={() => setFiltroEstado('pendientes')}
                    >
                        <Text style={[styles.tabText, filtroEstado === 'pendientes' && styles.tabTextActive]}>
                            Pendientes
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Buscador */}
            <View style={styles.searchContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar hermano..."
                    value={busqueda}
                    onChangeText={setBusqueda}
                    placeholderTextColor={COLORS.gray}
                />
                {busqueda.length > 0 && (
                    <TouchableOpacity onPress={() => setBusqueda('')}>
                        <Text style={styles.clearIcon}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Lista */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={hermanosFiltrados}
                    renderItem={renderHermano}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                {busqueda ? 'No se encontraron hermanos' : 'No hay hermanos registrados'}
                            </Text>
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        margin: SPACING.lg,
        paddingHorizontal: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        ...SHADOWS.small,
    },
    searchIcon: {
        fontSize: FONT_SIZES.lg,
        marginRight: SPACING.sm,
    },
    searchInput: {
        flex: 1,
        height: 50,
        fontSize: FONT_SIZES.md,
        color: COLORS.black,
    },
    clearIcon: {
        fontSize: FONT_SIZES.lg,
        color: COLORS.gray,
        padding: SPACING.sm,
    },
    listContent: {
        padding: SPACING.lg,
        paddingTop: 0,
    },
    hermanoCard: {
        marginBottom: SPACING.md,
    },
    hermanoContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        marginRight: SPACING.md,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    avatarPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    hermanoInfo: {
        flex: 1,
    },
    hermanoNombre: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.black,
        marginBottom: SPACING.xs,
    },
    badges: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: SPACING.xs,
    },
    badge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
        marginRight: SPACING.xs,
        marginBottom: SPACING.xs,
    },
    badgeEtapa: {
        backgroundColor: COLORS.tertiary,
    },
    badgeCargo: {
        backgroundColor: COLORS.gold,
    },
    badgeText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.white,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    statsContainer: {
        marginTop: SPACING.xs,
    },
    statText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.gray,
        marginBottom: 2,
    },
    chevron: {
        fontSize: 30,
        color: COLORS.gray,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xxl,
    },
    emptyText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.gray,
    },
    editButton: {
        padding: SPACING.sm,
    },
    editIcon: {
        fontSize: 24,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        padding: SPACING.sm,
        marginLeft: SPACING.xs,
    },
    actionIcon: {
        fontSize: 24,
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        backgroundColor: COLORS.cream,
    },
    tab: {
        flex: 1,
        paddingVertical: SPACING.sm,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: COLORS.primary,
    },
    tabText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.gray,
        fontWeight: '600',
    },
    tabTextActive: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    approveButton: {
        backgroundColor: '#E8F5E9',
        borderRadius: 20,
    },
    rejectButton: {
        backgroundColor: '#FFEBEE',
        borderRadius: 20,
    },
});

export default HermanosScreen;
