import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import Card from '../components/Card';
import Button from '../components/Button';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { API_URL } from '../config/api';

const getSafeImageUrl = (url) => {
    if (!url) return null;
    let safeUrl = String(url).replace('http://localhost:5000', API_URL.replace('/api', '').replace('/api', ''))
                     .replace('http://127.0.0.1:5000', API_URL.replace('/api', '').replace('/api', ''))
                     .replace('http://', 'https://');
    return safeUrl;
};

const AsistenciaScreen = ({ navigation }) => {
    const { usuario, esConsejoReal } = useAuth();
    const [estadisticas, setEstadisticas] = useState(null);
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const esConsejo = esConsejoReal;

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const userId = usuario.id || usuario._id;
            // Cargar estadísticas personales
            const statsRes = await api.get(`/asistencia/estadisticas/${userId}`);
            if (statsRes.data.success) {
                setEstadisticas(statsRes.data.estadisticas);
            }

            // Cargar historial personal
            const historialRes = await api.get('/asistencia', { params: { usuario: userId } });
            if (historialRes.data.success) {
                setHistorial(historialRes.data.asistencias);
            }
        } catch (error) {
            console.error('Error al cargar asistencia:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        cargarDatos();
    };

    const renderMemberView = () => (
        <View>
            {/* Tarjeta de QR */}
            <Card style={styles.qrCard}>
                <Text style={styles.qrTitle}>Mi Código de Asistencia</Text>
                <View style={styles.qrContainer}>
                    {usuario.codigoQR ? (
                        <Image
                            source={{ uri: getSafeImageUrl(usuario.codigoQR) }}
                            style={styles.qrImage}
                            resizeMode="contain"
                        />
                    ) : (
                        <Text style={styles.noQrText}>No hay código QR disponible</Text>
                    )}
                </View>
                <Text style={styles.qrInstructions}>
                    Muestra este código al secretario para registrar tu asistencia.
                </Text>
            </Card>

            {/* Estadísticas */}
            {estadisticas && (
                <View style={styles.statsRow}>
                    <Card style={styles.statCard}>
                        <Text style={styles.statNumber}>{estadisticas.totalAsistencias}</Text>
                        <Text style={styles.statLabel}>Asistencias</Text>
                    </Card>
                    <Card style={styles.statCard}>
                        <Text style={styles.statNumber}>{estadisticas.porcentajeAsistencia}%</Text>
                        <Text style={styles.statLabel}>Porcentaje</Text>
                    </Card>
                </View>
            )}

            {/* Historial Reciente */}
            <Text style={styles.sectionTitle}>Historial Reciente ({historial ? historial.length : 0})</Text>
            {!historial || historial.length === 0 ? (
                <Text style={styles.emptyText}>No hay registros recientes.</Text>
            ) : (
                historial.map((item, index) => {
                    const fecha = item.fecha ? new Date(item.fecha) : new Date();
                    const creado = item.createdAt ? new Date(item.createdAt) : new Date();

                    return (
                        <Card key={item._id || index} style={styles.historyCard}>
                            <View style={styles.historyRow}>
                                <View>
                                    <Text style={styles.historyType}>
                                        {item.tipoReunion ? (item.tipoReunion.charAt(0).toUpperCase() + item.tipoReunion.slice(1)) : 'Reunión'}
                                    </Text>
                                    <Text style={styles.historyDate}>
                                        {format(fecha, "d 'de' MMMM", { locale: es })} • {format(creado, "HH:mm", { locale: es })}
                                    </Text>
                                </View>
                                <View style={[
                                    styles.statusBadge, 
                                    item.estado === 'presente' ? styles.presente : 
                                    item.estado === 'falta' ? styles.ausente : 
                                    item.estado === 'permiso' ? styles.permiso : 
                                    styles.tardanza
                                ]}>
                                    <Text style={styles.statusText}>
                                        {item.estado ? (item.estado.charAt(0).toUpperCase() + item.estado.slice(1)) : (item.presente ? 'Presente' : 'Falta')}
                                    </Text>
                                </View>
                            </View>
                        </Card>
                    );
                })
            )}
        </View>
    );

    const renderCouncilView = () => (
        <View>
            <Card style={styles.adminCard}>
                <Text style={styles.adminTitle}>Panel de Control</Text>
                <Text style={styles.adminSubtitle}>Gestión de Asistencias</Text>

                <Button
                    title="Escanear Código QR"
                    onPress={() => navigation.navigate('EscanearQR')}
                    style={styles.actionButton}
                    icon={<Text>📸</Text>}
                />

                <Button
                    title="Registro Manual"
                    onPress={() => navigation.navigate('RegistroAsistenciaManual')}
                    variant="outline"
                    style={styles.actionButton}
                    icon={<Text>📝</Text>}
                />
                <Button
                    title="Ver Reportes"
                    onPress={() => navigation.navigate('ReporteAsistencia')}
                    variant="outline"
                    style={styles.actionButton}
                    icon={<Text>📊</Text>}
                />
            </Card>

            {/* Reutilizamos la vista de miembro para que el consejo también vea su propia asistencia */}
            <Text style={styles.sectionTitle}>Mi Asistencia Personal</Text>
            {renderMemberView()}
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.tertiary, COLORS.primary]}
                style={styles.header}
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Asistencia</Text>
                    <Text style={styles.headerSubtitle}>Control y Registro</Text>
                </View>
            </LinearGradient>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {esConsejo ? renderCouncilView() : renderMemberView()}
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
    },
    headerSubtitle: {
        fontSize: FONT_SIZES.md,
        color: COLORS.ivory,
    },
    content: {
        padding: SPACING.lg,
    },
    qrCard: {
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    qrTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: SPACING.md,
    },
    qrContainer: {
        width: 200,
        height: 200,
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.sm,
        marginBottom: SPACING.md,
        ...SHADOWS.medium,
    },
    qrImage: {
        width: '100%',
        height: '100%',
    },
    noQrText: {
        textAlign: 'center',
        color: COLORS.gray,
        marginTop: 80,
    },
    qrInstructions: {
        textAlign: 'center',
        color: COLORS.gray,
        fontSize: FONT_SIZES.sm,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.lg,
    },
    statCard: {
        flex: 0.48,
        alignItems: 'center',
        padding: SPACING.md,
    },
    statNumber: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    statLabel: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.gray,
    },
    sectionTitle: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: SPACING.md,
        marginTop: SPACING.sm,
    },
    historyCard: {
        marginBottom: SPACING.sm,
        padding: SPACING.md,
    },
    historyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    historyType: {
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    historyDate: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.gray,
    },
    statusBadge: {
        paddingHorizontal: SPACING.md,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.xl,
    },
    presente: {
        backgroundColor: '#E8F5E9', // Light green
    },
    ausente: {
        backgroundColor: '#FFEBEE', // Light red
    },
    statusText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.black,
    },
    permiso: {
        backgroundColor: '#FFF9C4', // Light yellow
    },
    tardanza: {
        backgroundColor: '#FFE0B2', // Light orange
    },
    adminCard: {
        marginBottom: SPACING.xl,
        backgroundColor: COLORS.white,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.tertiary,
    },
    adminTitle: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    adminSubtitle: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.gray,
        marginBottom: SPACING.lg,
    },
    actionButton: {
        marginBottom: SPACING.md,
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.gray,
        marginTop: SPACING.lg,
        fontStyle: 'italic',
    },
});

export default AsistenciaScreen;
