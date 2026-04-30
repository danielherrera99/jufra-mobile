import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import * as Notifications from 'expo-notifications';
import Card from './Card';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants/theme';
import { API_URL } from '../config/api';

const getSafeImageUrl = (url) => {
    if (!url) return null;
    let safeUrl = String(url).replace('http://localhost:5000', API_URL.replace('/api', '').replace('/api', ''))
                     .replace('http://127.0.0.1:5000', API_URL.replace('/api', '').replace('/api', ''))
                     .replace('http://', 'https://');
    return safeUrl;
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

const EventoCard = ({ evento, esAdmin, navigation, onEliminar }) => {
    const item = evento;
    return (
        <Card style={[styles.card, { borderLeftColor: getColorEvento(item.tipo), borderLeftWidth: 5 }]}>
            <View style={styles.cardContent}>
                <View style={styles.dateContainer}>
                    <Text style={styles.dayNumber}>{typeof item.fecha === 'string' ? format(parseISO(item.fecha.split('T')[0]), 'd') : format(new Date(item.fecha), 'd')}</Text>
                    <Text style={styles.monthName}>{typeof item.fecha === 'string' ? format(parseISO(item.fecha.split('T')[0]), 'MMM', { locale: es }).toUpperCase() : format(new Date(item.fecha), 'MMM', { locale: es }).toUpperCase()}</Text>
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
                                        onPress={onEliminar}
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
};

const styles = StyleSheet.create({
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

export default EventoCard;
