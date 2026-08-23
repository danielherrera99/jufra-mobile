import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Switch,
    Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import api, { API_URL } from '../config/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const getSafeImageUrl = (url) => {
    if (!url) return null;
    let safeUrl = String(url).replace('http://localhost:5000', API_URL.replace('/api', '').replace('/api', ''))
                     .replace('http://127.0.0.1:5000', API_URL.replace('/api', '').replace('/api', ''))
                     .replace('http://', 'https://');
    return safeUrl;
};
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const HomeScreen = ({ navigation }) => {
    const { usuario, logout, esConsejoReal, esConsejoActivo, modoConsejo, toggleModoConsejo } = useAuth();
    const [estadisticas, setEstadisticas] = useState({
        totalHermanos: 0,
        proximosAniversarios: [],
    });
    const [refreshing, setRefreshing] = useState(false);
    const [serverStatus, setServerStatus] = useState('connecting');

    useEffect(() => {
        cargarEstadisticas();
    }, []);

    const cargarEstadisticas = async () => {
        setServerStatus('connecting');
        try {
            // Cargar hermanos
            const hermanos = await api.get('/hermanos');

            // Cargar aniversarios
            const aniversarios = await api.get('/hermanos/aniversarios/proximos');

            setEstadisticas({
                totalHermanos: hermanos.data.count || 0,
                proximosAniversarios: aniversarios.data.aniversarios?.slice(0, 3) || [],
            });
            setServerStatus('online');
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
            setServerStatus('offline');
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await cargarEstadisticas();
        setRefreshing(false);
    };

    const menuItems = [
        {
            id: 'misRecursos',
            titulo: 'Mis Recursos',
            icono: '🎒',
            descripcion: 'Perfil y Herramientas',
            color: '#607D8B', // Blue Grey
            screen: 'MisRecursos',
        },
        {
            id: 'administracionFraternidad',
            titulo: 'Admin. Frat.',
            icono: '🛡️',
            descripcion: 'Hermanos y Actas',
            color: COLORS.primary,
            screen: 'AdministracionFraternidad',
        },

        {
            id: 'novedades',
            titulo: 'Novedades y Agenda',
            icono: '📆',
            descripcion: 'Noticias y Eventos',
            color: '#FF9800', // Naranja
            screen: 'Novedades',
        },

        {
            id: 'vidaEspiritual',
            titulo: 'Vida Espiritual',
            icono: '🕊️',
            descripcion: 'Oración y Formación',
            color: '#673AB7', // Morado
            screen: 'VidaEspiritual',
        },
        {
            id: 'administracionWeb',
            titulo: 'Admin. Web',
            icono: '🌐',
            descripcion: 'Web y Correos',
            color: '#E91E63', // Pink
            screen: 'AdministracionWeb',
        },

        {
            id: 'vidaFraterna',
            titulo: 'Vida Fraterna',
            icono: '🤝',
            descripcion: 'Comunidad y Misión',
            color: '#3F51B5', // Indigo
            screen: 'VidaFraterna',
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
                    <TouchableOpacity onPress={() => navigation.navigate('Perfil')} style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                        <View style={styles.profileImageSmallContainer}>
                            {usuario?.foto ? (
                                <Image source={{ uri: getSafeImageUrl(usuario.foto) }} style={styles.profileImageSmall} />
                            ) : (
                                <View style={[styles.profileImageSmall, styles.placeholderImageSmall]}>
                                    <Text style={styles.placeholderTextSmall}>
                                        {usuario?.nombre?.[0]}{usuario?.apellido?.[0]}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <View style={{ marginLeft: 12 }}>
                            <Text style={styles.greeting}>Paz y Bien 🕊️</Text>
                            <Text style={styles.userName}>{usuario?.nombre} {usuario?.apellido}</Text>
                            <Text style={styles.userRole}>
                                {usuario?.cargo !== 'ninguno' ? usuario?.cargo : usuario?.rol}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                        <Text style={styles.logoutIcon}>🚪</Text>
                    </TouchableOpacity>
                </View>

                {/* Switch Vista Consejo (Solo si es consejo real) */}
                {esConsejoReal && (
                    <View style={styles.switchContainer}>
                        <Text style={styles.currentDateText}>
                            {format(new Date(), "EEEE, d 'de' MMMM", { locale: es }).replace(/^\w/, (c) => c.toUpperCase())}
                        </Text>
                        <View style={styles.switchInner}>
                            <Text style={styles.switchLabel}>
                                {modoConsejo ? 'Vista Consejo' : 'Vista Hermano'}
                            </Text>
                            <Switch
                                trackColor={{ false: "rgba(255,255,255,0.4)", true: COLORS.tertiary }}
                                thumbColor={COLORS.white}
                                ios_backgroundColor="rgba(255,255,255,0.4)"
                                onValueChange={toggleModoConsejo}
                                value={modoConsejo}
                            />
                        </View>
                    </View>
                )}
            </LinearGradient>

            {/* Server Status Indicator */}
            {serverStatus !== 'online' && (
                <View style={[styles.serverStatusBanner, serverStatus === 'connecting' ? styles.statusConnecting : styles.statusOffline]}>
                    <Text style={styles.serverStatusText}>
                        {serverStatus === 'connecting' ? '⏳ Conectando al servidor...' : '🔴 Servidor en reposo. Desliza hacia abajo para despertar.'}
                    </Text>
                </View>
            )}

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Estadísticas rápidas (Solo Consejo Activo) */}


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
                        // Restringir módulos Admin Fraternidad y Admin Web solo al Consejo Activo
                        if ((item.id === 'administracionFraternidad' || item.id === 'administracionWeb') && !esConsejoActivo) {
                            return null;
                        }

                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.menuItem}
                                onPress={() => navigation.navigate(item.screen)}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.menuShadowLayer, { backgroundColor: item.color }]}>
                                    <View style={styles.menuInnerCard}>
                                        <View style={[styles.menuIconContainer, { backgroundColor: item.color + '15' }]}>
                                            <Text style={styles.menuIcon}>{item.icono}</Text>
                                        </View>
                                        
                                        <View style={styles.menuTextContainer}>
                                            <Text style={styles.menuTitulo}>{item.titulo}</Text>
                                            <Text style={styles.menuDescripcion}>{item.descripcion}</Text>
                                        </View>
                                        
                                        <Text style={styles.menuArrow}>›</Text>
                                    </View>
                                </View>
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
        fontSize: FONT_SIZES.lg,
        color: COLORS.ivory,
        marginBottom: 2,
    },
    userName: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 2,
    },
    userRole: {
        fontSize: FONT_SIZES.md,
        color: 'rgba(255, 255, 255, 0.85)',
        textTransform: 'capitalize',
    },
    profileImageSmallContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
        overflow: 'hidden',
    },
    profileImageSmall: {
        width: '100%',
        height: '100%',
    },
    placeholderImageSmall: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderTextSmall: {
        fontSize: 18,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    serverStatusBanner: {
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusConnecting: {
        backgroundColor: '#FFF3E0', // Light Orange
    },
    statusOffline: {
        backgroundColor: '#FFEBEE', // Light Red
    },
    serverStatusText: {
        fontSize: FONT_SIZES.xs,
        fontWeight: 'bold',
        color: COLORS.darkGray,
    },
    logoutButton: {
        padding: SPACING.sm,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: BORDER_RADIUS.full || 50,
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutIcon: {
        fontSize: 22,
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
        flexDirection: 'column',
    },
    menuItem: {
        width: '100%',
        marginBottom: SPACING.md,
    },
    menuShadowLayer: {
        borderRadius: BORDER_RADIUS.lg,
        paddingLeft: 5,
        paddingBottom: 5,
        ...SHADOWS.medium,
    },
    menuInnerCard: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIconContainer: {
        width: 55,
        height: 55,
        borderRadius: BORDER_RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    menuIcon: {
        fontSize: 28,
    },
    menuTextContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    menuTitulo: {
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
        color: COLORS.darkGray,
        marginBottom: 2,
    },
    menuDescripcion: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.gray,
    },
    menuArrow: {
        fontSize: 32,
        color: COLORS.gray,
        marginLeft: SPACING.sm,
        paddingBottom: 4,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: SPACING.md,
    },
    switchInner: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    currentDateText: {
        color: COLORS.ivory,
        fontSize: FONT_SIZES.sm,
        fontWeight: '500',
    },
    switchLabel: {
        color: COLORS.white,
        marginRight: SPACING.sm,
        fontSize: FONT_SIZES.sm,
        fontWeight: 'bold',
    },
});

export default HomeScreen;
