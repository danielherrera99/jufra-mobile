import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import api from '../config/api';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const HomeScreen = ({ navigation }) => {
    const { usuario, logout, esConsejoReal, esConsejoActivo, modoConsejo, toggleModoConsejo } = useAuth();
    const [estadisticas, setEstadisticas] = useState({
        totalHermanos: 0,
        proximosAniversarios: [],
    });
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        cargarEstadisticas();
    }, []);

    const cargarEstadisticas = async () => {
        try {
            // Cargar hermanos
            const hermanos = await api.get('/hermanos');

            // Cargar aniversarios
            const aniversarios = await api.get('/hermanos/aniversarios/proximos');

            setEstadisticas({
                totalHermanos: hermanos.data.count || 0,
                proximosAniversarios: aniversarios.data.aniversarios?.slice(0, 3) || [],
            });
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await cargarEstadisticas();
        setRefreshing(false);
    };

    const menuItems = [
        {
            id: 'perfil',
            titulo: 'Mi Perfil',
            icono: '👤',
            descripcion: 'Mis Datos',
            color: '#607D8B', // Blue Grey
            screen: 'Perfil',
        },
        {
            id: 'hermanos',
            titulo: 'Hermanos',
            icono: '👥',
            descripcion: 'Base de datos',
            color: COLORS.primary,
            screen: 'Hermanos',
        },
        {
            id: 'asistencia',
            titulo: 'Asistencia',
            icono: '✅',
            descripcion: 'Control QR',
            color: COLORS.tertiary,
            screen: 'Asistencia',
        },
        {
            id: 'anuncios',
            titulo: 'Anuncios',
            icono: '📢',
            descripcion: 'Noticias',
            color: COLORS.secondary,
            screen: 'Anuncios',
        },
        {
            id: 'actas',
            titulo: 'Actas',
            icono: '📝',
            descripcion: 'Reuniones',
            color: COLORS.accent,
            screen: 'Actas',
        },
        {
            id: 'formacion',
            titulo: 'Formación',
            icono: '📖',
            descripcion: 'Temas',
            color: '#673AB7', // Deep Purple
            screen: 'Formacion',
        },
        {
            id: 'calendario',
            titulo: 'Calendario',
            icono: '📅',
            descripcion: 'Eventos',
            color: '#009688', // Teal
            screen: 'Calendario',
            screen: 'Calendario',
        },
        {
            id: 'cancionero',
            titulo: 'Cancionero',
            icono: '🎵',
            descripcion: 'Alabanzas',
            color: '#E91E63', // Pink
            screen: 'Cancionero',
        },
        {
            id: 'peticiones',
            titulo: 'Peticiones',
            icono: '🙏',
            descripcion: 'Oración',
            color: '#2196F3', // Blue
            screen: 'Peticiones',
        },
        {
            id: 'documentos',
            titulo: 'Documentos',
            icono: '📜',
            descripcion: 'Regla y CCGG',
            color: '#795548', // Brown
            screen: 'Documentos',
        },
        {
            id: 'consejo',
            titulo: 'El Consejo',
            icono: '🤝',
            descripcion: 'Directorio',
            color: '#FF9800', // Orange
            screen: 'Consejo',
        },
        {
            id: 'espiritualidad',
            titulo: 'Espíritu',
            icono: '🕊️',
            descripcion: 'Oración',
            color: '#607D8B', // Blue Grey
            screen: 'Espiritualidad',
        },
        {
            id: 'galeria',
            titulo: 'Galería',
            icono: '📸',
            descripcion: 'Recuerdos',
            color: '#9C27B0', // Purple
            screen: 'Galeria',
        },
        {
            id: 'servicios',
            titulo: 'Servicio',
            icono: '🤲',
            descripcion: 'Misiones',
            color: '#4CAF50', // Green
            screen: 'Servicios',
        },
        {
            id: 'mensajes',
            titulo: 'Mensajes',
            icono: '💬',
            descripcion: 'Chat Interno',
            color: '#3F51B5', // Indigo
            screen: 'Mensajes',
        },
        {
            id: 'mapa',
            titulo: 'Mapa',
            icono: '🗺️',
            descripcion: 'Ubicaciones',
            color: '#FF5722', // Deep Orange
            screen: 'Mapa',
        },
    ];

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Header con gradiente */}
            <LinearGradient
                colors={[COLORS.primary, COLORS.accent]}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.navigate('Perfil')}>
                        <Text style={styles.greeting}>Paz y Bien 🕊️</Text>
                        <Text style={styles.userName}>{usuario?.nombre} {usuario?.apellido}</Text>
                        <Text style={styles.userRole}>
                            {usuario?.cargo !== 'ninguno' ? usuario?.cargo : usuario?.rol}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                        <Text style={styles.logoutIcon}>🚪</Text>
                    </TouchableOpacity>
                </View>

                {/* Switch Vista Consejo (Solo si es consejo real) */}
                {esConsejoReal && (
                    <View style={styles.switchContainer}>
                        <Text style={styles.switchLabel}>
                            {modoConsejo ? 'Vista Consejo' : 'Vista Hermano'}
                        </Text>
                        <Switch
                            trackColor={{ false: "#767577", true: COLORS.tertiary }}
                            thumbColor={modoConsejo ? COLORS.white : "#f4f3f4"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleModoConsejo}
                            value={modoConsejo}
                        />
                    </View>
                )}
            </LinearGradient>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Estadísticas rápidas (Solo Consejo Activo) */}
                {esConsejoActivo && (
                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>{estadisticas.totalHermanos}</Text>
                            <Text style={styles.statLabel}>Hermanos Activos</Text>
                        </View>
                    </View>
                )}

                {/* Próximos aniversarios */}
                {estadisticas.proximosAniversarios.length > 0 && (
                    <Card title="🎉 Próximos Aniversarios">
                        {estadisticas.proximosAniversarios.map((aniv, index) => (
                            <View key={index} style={styles.aniversarioItem}>
                                <Text style={styles.aniversarioNombre}>
                                    {aniv.hermano?.nombre}
                                </Text>
                                <Text style={styles.aniversarioTipo}>
                                    {aniv.tipo === 'ingreso' ? '📅 Ingreso' : '✝️ Promesa'} - {aniv.años} años
                                </Text>
                            </View>
                        ))}
                    </Card>
                )}

                {/* Menú de módulos */}
                <Text style={styles.sectionTitle}>Módulos</Text>
                <View style={styles.menuGrid}>
                    {menuItems.map((item) => {
                        // Restringir módulos Hermanos y Actas solo al Consejo Activo
                        if ((item.id === 'hermanos' || item.id === 'actas') && !esConsejoActivo) {
                            return null;
                        }

                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.menuItem}
                                onPress={() => navigation.navigate(item.screen)}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={[item.color, item.color + 'CC']}
                                    style={styles.menuGradient}
                                >
                                    <Text style={styles.menuIcon}>{item.icono}</Text>
                                    <Text style={styles.menuTitulo}>{item.titulo}</Text>
                                    <Text style={styles.menuDescripcion}>{item.descripcion}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
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
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: {
        fontSize: FONT_SIZES.md,
        color: COLORS.ivory,
        marginBottom: SPACING.xs,
    },
    userName: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: SPACING.xs,
    },
    userRole: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.gold,
        textTransform: 'capitalize',
    },
    logoutButton: {
        padding: SPACING.sm,
    },
    logoutIcon: {
        fontSize: 28,
    },
    content: {
        flex: 1,
        padding: SPACING.lg,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.lg,
    },
    statCard: {
        flex: 1,
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        marginHorizontal: SPACING.xs,
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    statNumber: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: SPACING.xs,
    },
    statLabel: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.gray,
    },
    aniversarioItem: {
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    aniversarioNombre: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.black,
    },
    aniversarioTipo: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.gray,
        marginTop: SPACING.xs,
    },
    sectionTitle: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: SPACING.md,
    },
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    menuItem: {
        width: '48%',
        marginBottom: SPACING.md,
    },
    menuGradient: {
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        alignItems: 'center',
        ...SHADOWS.large,
    },
    menuIcon: {
        fontSize: 40,
        marginBottom: SPACING.sm,
    },
    menuTitulo: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: SPACING.xs,
    },
    menuDescripcion: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.ivory,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: SPACING.sm,
    },
    switchLabel: {
        color: COLORS.white,
        marginRight: SPACING.sm,
        fontSize: FONT_SIZES.sm,
        fontWeight: 'bold',
    },
});

export default HomeScreen;
