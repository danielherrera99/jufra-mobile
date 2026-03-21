import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const MensajesScreen = ({ navigation }) => {
    const { usuario } = useAuth();
    const [conversaciones, setConversaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        cargarConversaciones();

        // Polling para actualizar lista
        const interval = setInterval(cargarConversaciones, 10000);
        return () => clearInterval(interval);
    }, []);

    const cargarConversaciones = async () => {
        try {
            const response = await api.get('/mensajes/conversaciones');
            if (response.data.success) {
                setConversaciones(response.data.conversaciones);
            }
        } catch (error) {
            console.error('Error al cargar conversaciones:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const renderItem = ({ item }) => {
        const { usuario: otroUsuario, ultimoMensaje } = item;
        // Asegurar comparación correcta de IDs
        const remitenteId = ultimoMensaje.remitente?._id || ultimoMensaje.remitente;
        const miId = usuario?._id;
        const esMio = remitenteId?.toString() === miId?.toString();

        const noLeido = !esMio && !ultimoMensaje.leido;

        return (
            <TouchableOpacity
                style={[styles.card, noLeido && styles.cardUnread]}
                onPress={() => navigation.navigate('Chat', { usuarioId: otroUsuario._id, nombre: `${otroUsuario.nombre} ${otroUsuario.apellido}` })}
            >
                <View style={styles.avatarContainer}>
                    {otroUsuario.foto ? (
                        <Image source={{ uri: otroUsuario.foto }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarInitial}>{otroUsuario.nombre.charAt(0)}</Text>
                        </View>
                    )}
                </View>
                <View style={styles.contentContainer}>
                    <View style={styles.headerRow}>
                        <Text style={[styles.name, noLeido && styles.nameUnread]}>
                            {otroUsuario.nombre} {otroUsuario.apellido}
                        </Text>
                        <Text style={styles.time}>
                            {format(new Date(ultimoMensaje.createdAt), 'HH:mm', { locale: es })}
                        </Text>
                    </View>
                    <Text style={[styles.message, noLeido && styles.messageUnread]} numberOfLines={1}>
                        {esMio ? 'Tú: ' : ''}{ultimoMensaje.contenido}
                    </Text>
                </View>
                {noLeido && <View style={styles.unreadDot} />}
            </TouchableOpacity>
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
                    <Text style={styles.headerTitle}>Mensajes</Text>
                </View>
            </LinearGradient>

            <FlatList
                data={conversaciones}
                renderItem={renderItem}
                keyExtractor={(item) => item.usuario._id}
                contentContainerStyle={styles.list}
                refreshing={refreshing}
                onRefresh={() => {
                    setRefreshing(true);
                    cargarConversaciones();
                }}
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No tienes mensajes aún.</Text>
                            <Text style={styles.emptySubtext}>Busca un hermano para iniciar un chat.</Text>
                            <TouchableOpacity
                                style={styles.newChatButton}
                                onPress={() => navigation.navigate('Hermanos')}
                            >
                                <Text style={styles.newChatButtonText}>Iniciar Chat</Text>
                            </TouchableOpacity>
                        </View>
                    )
                }
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('Hermanos')}
            >
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>
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
    list: {
        padding: SPACING.md,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.sm,
        alignItems: 'center',
        ...SHADOWS.small,
    },
    cardUnread: {
        backgroundColor: '#E3F2FD',
    },
    avatarContainer: {
        marginRight: SPACING.md,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        color: COLORS.white,
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
    },
    contentContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    name: {
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    nameUnread: {
        color: COLORS.primary,
    },
    time: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.gray,
    },
    message: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.darkGray,
    },
    messageUnread: {
        fontWeight: 'bold',
        color: COLORS.black,
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
        marginLeft: SPACING.sm,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
        padding: SPACING.lg,
    },
    emptyText: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.darkGray,
        marginBottom: SPACING.sm,
    },
    emptySubtext: {
        fontSize: FONT_SIZES.md,
        color: COLORS.gray,
        textAlign: 'center',
        marginBottom: SPACING.xl,
    },
    newChatButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
    },
    newChatButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    fabIcon: {
        fontSize: 30,
        color: COLORS.white,
        marginTop: -2,
    },
});

export default MensajesScreen;
