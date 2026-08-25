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
import EventoCard from '../components/EventoCard';

const CalendarioScreen = ({ navigation, route }) => {
    const { usuario } = useAuth();
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const listRef = React.useRef(null);

    const esAdmin = usuario && (
        usuario.rol === 'admin' ||
        usuario.rol === 'consejo' ||
        ['coordinador', 'vice-coordinador', 'secretario', 'tesorero', 'formador', 'animador'].includes(usuario.cargo)
    );

    useEffect(() => {
        cargarEventos();
    }, []);

    const cargarEventos = async () => {
        try {
            const response = await api.get('/eventos', { params: { visibilidad: 'app' } });
            if (response.data.success) {
                const fetchedEventos = response.data.eventos;
                setEventos(fetchedEventos);
                
                // Si venimos del mapa buscando un ID específico
                if (route.params?.id) {
                    setTimeout(() => {
                        const index = fetchedEventos.findIndex(e => e._id === route.params.id);
                        if (index !== -1 && listRef.current) {
                            listRef.current.scrollToIndex({ index, animated: true, viewPosition: 0 });
                        }
                    }, 500);
                }
            }
        } catch (error) {
            console.error('Error al cargar eventos:', error);
            Alert.alert('Error', 'No se pudieron cargar los eventos');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
    const onRefresh = () => {
        setRefreshing(true);
        cargarEventos();
    };

    const eliminarEvento = (id) => {
        Alert.alert(
            "Eliminar Evento",
            "¿Estás seguro de que deseas eliminar este evento?",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Eliminar", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const response = await api.delete(`/eventos/${id}`);
                            if (response.data.success) {
                                Alert.alert("Éxito", "Evento eliminado correctamente");
                                cargarEventos();
                            }
                        } catch (error) {
                            console.error("Error al eliminar evento:", error);
                            Alert.alert("Error", "No se pudo eliminar el evento");
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <EventoCard
            evento={item}
            esAdmin={esAdmin}
            navigation={navigation}
            onEliminar={() => eliminarEvento(item._id)}
        />
    );

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
                        <Text style={styles.headerTitle}>Calendario</Text>
                        <Text style={styles.headerSubtitle}>Próximos Eventos</Text>
                    </View>
                </View>
                {esAdmin && (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('CrearEvento')}
                    >
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                )}
            </LinearGradient>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                ref={listRef}
                data={eventos}
                renderItem={({ item }) => renderItem({ item })}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.list}
                onScrollToIndexFailed={(info) => {
                    setTimeout(() => {
                        listRef.current?.scrollToIndex({ index: info.index, animated: true });
                    }, 500);
                }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>📅</Text>
                            <Text style={styles.emptyText}>No hay eventos próximos</Text>
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
    },
});

export default CalendarioScreen;
