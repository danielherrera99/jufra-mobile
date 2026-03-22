import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { format, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';
import * as Notifications from 'expo-notifications';
import { API_URL } from '../config/api';

const getSafeImageUrl = (url) => {
    if (!url) return null;
    let safeUrl = String(url).replace('http://localhost:5000', API_URL.replace('/api', '').replace('/api', ''))
                     .replace('http://127.0.0.1:5000', API_URL.replace('/api', '').replace('/api', ''))
                     .replace('http://', 'https://');
    return safeUrl;
};

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const CalendarioScreen = ({ navigation }) => {
    const { usuario } = useAuth();
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

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
            const response = await api.get('/eventos');
            if (response.data.success) {
                setEventos(response.data.eventos);
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

    const getIconoEvento = (tipo) => {
        switch (tipo) {
            case 'reunion': return '🤝';
            case 'misa': return '⛪';
            case 'formacion': return '📖';
            case 'retiro': return '🔥';
            case 'fraternidad': return '🎉';
            default: return '📅';
        }
    };

    const getColorEvento = (tipo) => {
        switch (tipo) {
            case 'reunion': return COLORS.primary;
            case 'misa': return '#D32F2F'; // Rojo
            case 'formacion': return '#7B1FA2'; // Morado
            case 'retiro': return '#F57C00'; // Naranja
            case 'fraternidad': return '#388E3C'; // Verde
            default: return COLORS.secondary;
        }
    };

    const formatearFecha = (fecha) => {
        const date = new Date(fecha);
        if (isToday(date)) return 'Hoy';
        if (isTomorrow(date)) return 'Mañana';
        return format(date, "EEEE d 'de' MMMM", { locale: es });
    };

    const eliminarEvento = (id) => {
        Alert.alert(
            'Eliminar Evento',
            '¿Estás seguro de que deseas eliminar este evento?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/eventos/${id}`);
                            Alert.alert('Éxito', 'Evento eliminado correctamente');
                            cargarEventos();
                        } catch (error) {
                            console.error('Error al eliminar evento:', error);
                            Alert.alert('Error', 'No se pudo eliminar el evento');
                        }
                    }
                }
            ]
        );
    };

    const programarRecordatorio = async (evento) => {
        try {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permiso denegado', 'No podemos enviar notificaciones sin tu permiso');
                return;
            }

            const fechaEvento = new Date(evento.fecha);
            if (evento.hora) {
                const [horas, minutos] = evento.hora.split(':');
                fechaEvento.setHours(parseInt(horas), parseInt(minutos));
            }

            // Programar para 1 hora antes
            const trigger = new Date(fechaEvento.getTime() - 60 * 60 * 1000);

            if (trigger <= new Date()) {
                Alert.alert('Aviso', 'Este evento ya pasó o es muy pronto para programar un recordatorio de 1 hora.');
                return;
            }

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: `Recordatorio: ${evento.titulo}`,
                    body: `Tu evento comienza en 1 hora en ${evento.lugar || 'el lugar asignado'}.`,
                    data: { eventoId: evento._id },
                },
                trigger,
            });

            Alert.alert('Recordatorio Programado', 'Te avisaremos 1 hora antes del evento.');
        } catch (error) {
            console.error('Error al programar notificación:', error);
            Alert.alert('Error', 'No se pudo programar el recordatorio');
        }
    };

    const renderItem = ({ item }) => (
        <Card style={[styles.card, { borderLeftColor: getColorEvento(item.tipo), borderLeftWidth: 5 }]}>
            <View style={styles.cardContent}>
                <View style={styles.dateContainer}>
                    <Text style={styles.dayNumber}>{format(new Date(item.fecha), 'd')}</Text>
                    <Text style={styles.monthName}>{format(new Date(item.fecha), 'MMM', { locale: es }).toUpperCase()}</Text>
                </View>

                <View style={styles.infoContainer}>
                    <View style={styles.headerRow}>
                        <Text style={styles.tipoBadge}>{getIconoEvento(item.tipo)} {item.tipo.toUpperCase()}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.timeText}>{item.hora || 'Todo el día'}</Text>

                            {/* Botones Admin/Consejo */}
                            {esAdmin && (
                                <View style={styles.adminButtons}>
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('EditarEvento', { eventoId: item._id })}
                                        style={styles.actionButton}
                                    >
                                        <Text style={styles.actionIcon}>✎</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => eliminarEvento(item._id)}
                                        style={styles.actionButton}
                                    >
                                        <Text style={styles.actionIcon}>🗑️</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>

                    <Text style={styles.title}>{item.titulo}</Text>

                    {item.lugar && (
                        <Text style={styles.location}>📍 {item.lugar}</Text>
                    )}

                    {item.descripcion && (
                        <Text style={styles.description}>{item.descripcion}</Text>
                    )}

                    {item.imagenUrl && (
                        <Image
                            source={{ uri: getSafeImageUrl(item.imagenUrl) }}
                            style={styles.eventImage}
                            resizeMode="cover"
                        />
                    )}

                    <View style={styles.actionsRow}>
                        <TouchableOpacity
                            style={styles.reminderButton}
                            onPress={() => programarRecordatorio(item)}
                        >
                            <Text style={styles.reminderText}>🔔 Recordarme</Text>
                        </TouchableOpacity>

                        {item.ubicacion && item.ubicacion.lat && (
                            <TouchableOpacity
                                style={styles.mapLinkButton}
                                onPress={() => navigation.navigate('Mapa', {
                                    focusOn: {
                                        latitude: item.ubicacion.lat,
                                        longitude: item.ubicacion.lng,
                                        title: item.titulo
                                    }
                                })}
                            >
                                <Text style={styles.mapLinkText}>📍 Ver en Mapa</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Card>
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
                    data={eventos}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.list}
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
    card: {
        marginBottom: SPACING.md,
        padding: 0,
        overflow: 'hidden',
    },
    cardContent: {
        flexDirection: 'row',
    },
    dateContainer: {
        backgroundColor: COLORS.offWhite,
        padding: SPACING.md,
        alignItems: 'center',
        justifyContent: 'center',
        width: 70,
        borderRightWidth: 1,
        borderRightColor: COLORS.lightGray,
    },
    dayNumber: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    monthName: {
        fontSize: FONT_SIZES.xs,
        fontWeight: 'bold',
        color: COLORS.gray,
    },
    infoContainer: {
        flex: 1,
        padding: SPACING.md,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    tipoBadge: {
        fontSize: FONT_SIZES.xs,
        fontWeight: 'bold',
        color: COLORS.darkGray,
    },
    timeText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.gray,
    },
    title: {
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 4,
    },
    location: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.darkGray,
        marginBottom: 4,
    },
    description: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.gray,
        fontStyle: 'italic',
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
    deleteButton: {
        padding: 4,
        marginLeft: SPACING.sm,
    },
    deleteIcon: {
        fontSize: 18,
    },
    reminderButton: {
        marginTop: 8,
        backgroundColor: COLORS.offWhite,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    reminderText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    eventImage: {
        width: '100%',
        height: 150,
        borderRadius: BORDER_RADIUS.md,
        marginVertical: SPACING.sm,
    },
    adminButtons: {
        flexDirection: 'row',
        marginLeft: SPACING.sm,
    },
    actionButton: {
        padding: 4,
        marginLeft: 4,
    },
    actionIcon: {
        fontSize: 18,
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 10,
    },
    mapLinkButton: {
        backgroundColor: COLORS.tertiary,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.tertiary,
    },
    mapLinkText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.white,
        fontWeight: 'bold',
    },
});

export default CalendarioScreen;
