import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import api from '../config/api';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import * as FileSystem from 'expo-file-system';
// Attempt to use legacy for downloadAsync if available, otherwise fallback
let downloadAsync = FileSystem.downloadAsync;
try {
    const LegacyFileSystem = require('expo-file-system/legacy');
    if (LegacyFileSystem.downloadAsync) {
        downloadAsync = LegacyFileSystem.downloadAsync;
    }
} catch (e) {
    console.log('Legacy file system not found, using standard');
}

import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

const ReporteAsistenciaScreen = ({ navigation }) => {
    const [asistencias, setAsistencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroTipo, setFiltroTipo] = useState('todos');
    const { usuario, esConsejoActivo } = useAuth();

    useEffect(() => {
        cargarReporte();
    }, [filtroTipo]);

    const cargarReporte = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filtroTipo !== 'todos') params.tipoReunion = filtroTipo;

            const response = await api.get('/asistencia', { params });

            if (response.data.success) {
                setAsistencias(response.data.asistencias);
            }
        } catch (error) {
            console.error('Error al cargar reporte:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportarExcel = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');

            // Use cacheDirectory which is more reliable for temporary files
            const directory = FileSystem.cacheDirectory;
            if (!directory) {
                throw new Error('No se pudo acceder al directorio temporal');
            }

            const fileUri = directory + 'asistencias.xlsx';

            // Usar la URL base configurada en api.js
            const baseUrl = api.defaults.baseURL;

            const downloadRes = await downloadAsync(
                `${baseUrl}/asistencia/exportar`,
                fileUri,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (downloadRes.status === 200) {
                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(downloadRes.uri, {
                        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        dialogTitle: 'Compartir Reporte de Asistencia',
                        UTI: 'com.microsoft.excel.xlsx'
                    });
                } else {
                    Alert.alert('Error', 'Compartir no está disponible en este dispositivo');
                }
            } else {
                Alert.alert('Error', 'No se pudo descargar el archivo. Verifica tu conexión.');
            }
        } catch (error) {
            console.error('Error exportando:', error);
            Alert.alert('Error', 'Falló la exportación del archivo: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => {
        const fechaRegistro = new Date(item.createdAt);
        const fechaReunion = new Date(item.fecha);

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.nombre}>
                        {item.usuario ? `${item.usuario.nombre} ${item.usuario.apellido}` : `👤 ${item.nombreInvitado}`}
                    </Text>
                    <View style={[styles.badge, item.presente ? styles.presente : styles.ausente]}>
                        <Text style={styles.badgeText}>
                            {item.presente ? 'Presente' : 'Ausente'}
                        </Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Reunión:</Text>
                    <Text style={styles.value}>
                        {item.tipoReunion.charAt(0).toUpperCase() + item.tipoReunion.slice(1)}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Fecha Reunión:</Text>
                    <Text style={styles.value}>
                        {format(fechaReunion, "d MMM yyyy", { locale: es })}
                    </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.registroInfo}>
                    <Text style={styles.registroLabel}>Registrado el:</Text>
                    <Text style={styles.registroValue}>
                        {format(fechaRegistro, "d MMM yyyy 'a las' HH:mm:ss", { locale: es })}
                    </Text>
                </View>

                <View style={styles.registroInfo}>
                    <Text style={styles.registroLabel}>Método:</Text>
                    <Text style={styles.registroValue}>
                        {item.metodoRegistro === 'qr' ? '📸 Escáner QR' : '📝 Manual'}
                    </Text>
                </View>

                {item.registradoPor && (
                    <View style={styles.registroInfo}>
                        <Text style={styles.registroLabel}>Por:</Text>
                        <Text style={styles.registroValue}>
                            {item.registradoPor.nombre} {item.registradoPor.apellido}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Reporte de Asistencia</Text>
                        <Text style={styles.headerSubtitle}>Historial detallado</Text>
                    </View>

                    {esConsejoActivo && (
                        <TouchableOpacity onPress={exportarExcel} style={styles.exportButton}>
                            <Text style={styles.exportIcon}>📊</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>

            <View style={styles.filtros}>
                <Text style={styles.filtroLabel}>Filtrar por Tipo:</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={filtroTipo}
                        onValueChange={(v) => setFiltroTipo(v)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Todos" value="todos" />
                        <Picker.Item label="Semanal" value="semanal" />
                        <Picker.Item label="Consejo" value="consejo" />
                        <Picker.Item label="Formación" value="formacion" />
                        <Picker.Item label="Apostolado" value="apostolado" />
                    </Picker>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={asistencias}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No hay registros encontrados</Text>
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
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: SPACING.xs,
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
        fontSize: FONT_SIZES.md,
        color: COLORS.ivory,
    },
    exportButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
    },
    exportIcon: {
        fontSize: 20,
    },
    filtros: {
        padding: SPACING.md,
        backgroundColor: COLORS.white,
        ...SHADOWS.small,
    },
    filtroLabel: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.darkGray,
        marginBottom: SPACING.xs,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.offWhite,
    },
    picker: {
        height: 50,
    },
    list: {
        padding: SPACING.md,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        ...SHADOWS.small,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    nombre: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    badge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.sm,
    },
    presente: {
        backgroundColor: '#E8F5E9',
    },
    ausente: {
        backgroundColor: '#FFEBEE',
    },
    badgeText: {
        fontSize: FONT_SIZES.xs,
        fontWeight: 'bold',
        color: COLORS.darkGray,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    label: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.gray,
    },
    value: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.black,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.lightGray,
        marginVertical: SPACING.sm,
    },
    registroInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    registroLabel: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.gray,
    },
    registroValue: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.darkGray,
        fontWeight: '600',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: COLORS.gray,
    },
});

export default ReporteAsistenciaScreen;
