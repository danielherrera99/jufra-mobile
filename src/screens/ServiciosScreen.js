import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { API_URL } from '../config/api';

const getSafeImageUrl = (url) => {
    if (!url) return null;
    let safeUrl = String(url).replace('http://localhost:5000', API_URL.replace('/api', '').replace('/api', ''))
                     .replace('http://127.0.0.1:5000', API_URL.replace('/api', '').replace('/api', ''))
                     .replace('http://', 'https://');
    return safeUrl;
};

const ServiciosScreen = ({ navigation }) => {
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const { usuario, esConsejoActivo } = useAuth();

    useEffect(() => {
        cargarServicios();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            cargarServicios();
        });
        return unsubscribe;
    }, [navigation]);

    const cargarServicios = async () => {
        try {
            const response = await api.get('/servicios');
            if (response.data.success) {
                setServicios(response.data.servicios);
            }
        } catch (error) {
            console.error('Error al cargar servicios:', error);
        } finally {
            setLoading(false);
        }
    };

    const participar = async (id) => {
        try {
            const response = await api.put(`/servicios/${id}/participar`);
            if (response.data.success) {
                Alert.alert('Éxito', response.data.message);
                cargarServicios(); // Recargar para actualizar lista
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', error.response?.data?.message || 'No se pudo procesar la solicitud');
        }
    };

    const eliminarServicio = (id) => {
        Alert.alert(
            'Eliminar',
            '¿Estás seguro de eliminar esta actividad?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/servicios/${id}`);
                            cargarServicios();
                        } catch (error) {
                            console.error(error);
                            Alert.alert('Error', 'No se pudo eliminar');
                        }
                    }
                }
            ]
        );
    };

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    const verParticipantes = (servicio) => {
        setSelectedService(servicio);
        setModalVisible(true);
    };

    const renderParticipantesModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Inscritos</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Text style={styles.closeIcon}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {selectedService && (
                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.serviceTitleModal}>{selectedService.titulo}</Text>
                            {selectedService.participantes.length > 0 ? (
                                selectedService.participantes.map((p, index) => (
                                    <View key={index} style={styles.participantItem}>
                                        <Text style={styles.participantName}>
                                            {index + 1}. {p.nombre} {p.apellido}
                                        </Text>
                                        <Text style={styles.participantRole}>
                                            {p.cargo !== 'ninguno' ? p.cargo : p.etapaFormacion.replace('_', ' ')}
                                        </Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.emptyTextModal}>No hay inscritos aún.</Text>
                            )}
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    );

    const renderItem = (item) => {
        const estaInscrito = item.participantes.some(p => p._id === usuario._id);
        const cupoLleno = item.cupoMaximo > 0 && item.participantes.length >= item.cupoMaximo;

        return (
            <View key={item._id} style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.dateBadge}>
                        {format(new Date(item.fecha), "d MMM", { locale: es })}
                    </Text>
                    <View style={styles.headerInfo}>
                        <Text style={styles.title}>{item.titulo}</Text>
                        <Text style={styles.location}>📍 {item.lugar}</Text>
                        {item.ubicacion && item.ubicacion.lat && (
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Mapa', {
                                    focusOn: {
                                        latitude: item.ubicacion.lat,
                                        longitude: item.ubicacion.lng,
                                        title: item.titulo
                                    }
                                })}
                            >
                                <Text style={styles.viewMapLink}>Ver en mapa</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    {esConsejoActivo && (
                        <TouchableOpacity onPress={() => eliminarServicio(item._id)}>
                            <Text style={styles.deleteIcon}>🗑️</Text>
                        </TouchableOpacity>
                    )}
                </View>



                {
                    item.imagen && (
                        <Image
                            source={{ uri: getSafeImageUrl(item.imagen) }}
                            style={styles.serviceImage}
                            resizeMode="cover"
                        />
                    )
                }

                <Text style={styles.description}>{item.descripcion}</Text>

                <View style={styles.footer}>
                    <View style={styles.participantsInfo}>
                        <Text style={styles.participantsText}>
                            👥 {item.participantes.length} {item.cupoMaximo > 0 ? `/ ${item.cupoMaximo}` : ''} inscritos
                        </Text>
                        {esConsejoActivo && (
                            <TouchableOpacity onPress={() => verParticipantes(item)}>
                                <Text style={styles.viewLink}>Ver lista</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            estaInscrito ? styles.leaveButton : styles.joinButton,
                            (!estaInscrito && cupoLleno) && styles.disabledButton
                        ]}
                        onPress={() => participar(item._id)}
                        disabled={!estaInscrito && cupoLleno}
                    >
                        <Text style={[
                            styles.actionButtonText,
                            estaInscrito ? styles.leaveButtonText : styles.joinButtonText
                        ]}>
                            {estaInscrito ? 'Salir' : (cupoLleno ? 'Lleno' : 'Participar')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View >
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
                    <Text style={styles.headerTitle}>Servicio y Misión</Text>

                    {esConsejoActivo && (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('CrearServicio')}
                            style={styles.addButton}
                        >
                            <Text style={styles.addIcon}>+</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>

            <ScrollView style={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
                ) : (
                    servicios.map(renderItem)
                )}

                {!loading && servicios.length === 0 && (
                    <Text style={styles.emptyText}>No hay actividades de servicio programadas.</Text>
                )}
            </ScrollView>

            {renderParticipantesModal()}
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
        marginLeft: -SPACING.xl,
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
    card: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        marginBottom: SPACING.lg,
        ...SHADOWS.medium,
    },
    cardHeader: {
        flexDirection: 'row',
        marginBottom: SPACING.md,
    },
    dateBadge: {
        backgroundColor: COLORS.offWhite,
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        textAlign: 'center',
        fontWeight: 'bold',
        color: COLORS.primary,
        marginRight: SPACING.md,
        height: 40,
        textAlignVertical: 'center',
    },
    headerInfo: {
        flex: 1,
    },
    title: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 2,
    },
    location: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.gray,
    },
    deleteIcon: {
        fontSize: 20,
        marginLeft: SPACING.sm,
    },
    description: {
        fontSize: FONT_SIZES.md,
        color: COLORS.darkGray,
        marginBottom: SPACING.lg,
        lineHeight: 22,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
        paddingTop: SPACING.md,
    },
    participantsInfo: {
        flex: 1,
    },
    participantsText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.gray,
        fontWeight: '600',
    },
    viewLink: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.primary,
        fontWeight: 'bold',
        marginTop: 2,
    },
    actionButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: BORDER_RADIUS.full,
    },
    joinButton: {
        backgroundColor: COLORS.primary,
    },
    leaveButton: {
        backgroundColor: COLORS.offWhite,
        borderWidth: 1,
        borderColor: COLORS.error,
    },
    disabledButton: {
        backgroundColor: COLORS.lightGray,
    },
    actionButtonText: {
        fontWeight: 'bold',
        fontSize: FONT_SIZES.sm,
    },
    joinButtonText: {
        color: COLORS.white,
    },
    leaveButtonText: {
        color: COLORS.error,
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.gray,
        marginTop: SPACING.xl,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        ...SHADOWS.large,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
        paddingBottom: SPACING.sm,
    },
    modalTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    closeIcon: {
        fontSize: 24,
        color: COLORS.gray,
    },
    modalBody: {
        marginBottom: SPACING.md,
    },
    serviceTitleModal: {
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
        marginBottom: SPACING.md,
        color: COLORS.black,
    },
    participantItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.offWhite,
    },
    participantName: {
        fontSize: FONT_SIZES.md,
        color: COLORS.black,
    },
    participantRole: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.gray,
        textTransform: 'capitalize',
    },
    emptyTextModal: {
        textAlign: 'center',
        color: COLORS.gray,
        marginTop: SPACING.md,
    },
    serviceImage: {
        width: '100%',
        height: 150,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.md,
    },
    viewMapLink: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.tertiary,
        fontWeight: 'bold',
        marginTop: 2,
        textDecorationLine: 'underline',
    },
});

export default ServiciosScreen;
