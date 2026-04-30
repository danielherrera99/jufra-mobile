import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    RefreshControl,
    ActivityIndicator,
    Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import HermanoCard from '../components/HermanoCard';
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

    const renderHermano = ({ item }) => (
        <HermanoCard
            hermano={item}
            usuario={usuario}
            esAdmin={esAdmin}
            filtroEstado={filtroEstado}
            navigation={navigation}
            onAprobar={() => aprobarHermano(item._id)}
            onRechazar={() => rechazarHermano(item._id)}
        />
    );

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
});

export default HermanosScreen;
