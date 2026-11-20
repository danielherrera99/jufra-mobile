import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Card from '../components/Card';

const ActasScreen = ({ navigation }) => {
    const { usuario, esConsejoReal } = useAuth();
    const [actas, setActas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const esConsejo = esConsejoReal;

    useEffect(() => {
        cargarActas();
    }, []);

    const cargarActas = async () => {
        try {
            const response = await api.get('/actas');
            if (response.data.success) {
                setActas(response.data.actas);
            }
        } catch (error) {
            console.error('Error al cargar actas:', error);
            Alert.alert('Error', 'No se pudieron cargar las actas');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        cargarActas();
    };

    const eliminarActa = (id) => {
        Alert.alert(
            'Eliminar Acta',
            '¿Estás seguro de que deseas eliminar esta acta?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/actas/${id}`);
                            Alert.alert('Éxito', 'Acta eliminada correctamente');
                            cargarActas();
                        } catch (error) {
                            console.error('Error al eliminar acta:', error);
                            Alert.alert('Error', 'No se pudo eliminar el acta');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('DetalleActa', { actaId: item._id })}
            activeOpacity={0.8}
        >
            <Card style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.dateContainer}>
                        <Text style={styles.day}>{format(new Date(item.fecha), 'dd')}</Text>
                        <Text style={styles.month}>{format(new Date(item.fecha), 'MMM', { locale: es }).toUpperCase()}</Text>
                    </View>
                    <View style={styles.headerText}>
                        <Text style={styles.title}>{item.titulo}</Text>
                        <View style={styles.badgeContainer}>
                            <View style={[styles.badge, { backgroundColor: getBadgeColor(item.tipoReunion) }]}>
                                <Text style={styles.badgeText}>{item.tipoReunion}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Botón Eliminar (Solo Admin) */}
                    {usuario?.rol === 'admin' && (
                        <TouchableOpacity
                            onPress={() => eliminarActa(item._id)}
                            style={styles.deleteButton}
                        >
                            <Text style={styles.deleteIcon}>🗑️</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <Text style={styles.preview} numberOfLines={2}>
                    {item.contenido}
                </Text>
                <View style={styles.footer}>
                    <Text style={styles.author}>Por: {item.creadoPor?.nombre} {item.creadoPor?.apellido}</Text>
                    <Text style={styles.readMore}>Leer más →</Text>
                </View>
            </Card>
        </TouchableOpacity>
    );

    const getBadgeColor = (tipo) => {
        switch (tipo) {
            case 'consejo': return COLORS.secondary;
            case 'fraternidad': return COLORS.primary;
            case 'formacion': return COLORS.accent;
            default: return COLORS.gray;
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.accent, COLORS.primary]}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Actas</Text>
                        <Text style={styles.headerSubtitle}>Registro de Reuniones</Text>
                    </View>
                </View>
                {esConsejo && (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('CrearActa')}
                    >
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                )}
            </LinearGradient>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={actas}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.list}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No hay actas registradas</Text>
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
        marginBottom: SPACING.sm,
    },
    dateContainer: {
        backgroundColor: COLORS.offWhite,
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
        minWidth: 50,
    },
    day: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    month: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.gray,
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 4,
    },
    badgeContainer: {
        flexDirection: 'row',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.sm,
    },
    badgeText: {
        color: COLORS.white,
        fontSize: FONT_SIZES.xs,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    preview: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.darkGray,
        marginBottom: SPACING.md,
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
        paddingTop: SPACING.sm,
    },
    author: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.gray,
        fontStyle: 'italic',
    },
    readMore: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.gray,
        marginTop: 20,
    },
    deleteButton: {
        padding: SPACING.xs,
        marginLeft: SPACING.sm,
    },
    deleteIcon: {
        fontSize: 20,
    },
});

export default ActasScreen;
