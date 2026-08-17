import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    SectionList,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import api, { API_URL } from '../config/api';
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
    const [fechaInicio, setFechaInicio] = useState(null);
    const [fechaFin, setFechaFin] = useState(null);
    const [showPicker, setShowPicker] = useState({ show: false, mode: 'inicio' });
    const { usuario, esConsejoActivo } = useAuth();
    const [expandedSections, setExpandedSections] = useState({});

    useEffect(() => {
        cargarReporte();
    }, [filtroTipo, fechaInicio, fechaFin]);

    const cargarReporte = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filtroTipo !== 'todos') params.tipoReunion = filtroTipo;
            if (fechaInicio) params.fechaInicio = fechaInicio.toISOString();
            if (fechaFin) params.fechaFin = fechaFin.toISOString();

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

            let queryParams = [];
            if (fechaInicio) queryParams.push(`fechaInicio=${fechaInicio.toISOString()}`);
            if (fechaFin) queryParams.push(`fechaFin=${fechaFin.toISOString()}`);
            const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
            const exportUrl = `${API_URL}/asistencia/exportar${queryString}`;

            if (Platform.OS === 'web') {
                const response = await fetch(exportUrl, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('No se pudo descargar el archivo del servidor web.');
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'asistencias.xlsx';
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } else {
                const directory = FileSystem.documentDirectory || FileSystem.cacheDirectory || 'file:///data/user/0/host.exp.exponent/cache/';
                if (!directory) {
                    throw new Error('Carpeta de sistema inalcanzable (directory is null)');
                }
                const fileUri = directory + 'asistencias_' + Date.now() + '.xlsx';

                const downloadRes = await downloadAsync(
                    exportUrl,
                    fileUri,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );

                if (downloadRes.status === 200) {
                    if (await Sharing.isAvailableAsync()) {
                        await Sharing.shareAsync(downloadRes.uri, {
                            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                            dialogTitle: 'Compartir Reporte',
                            UTI: 'com.microsoft.excel.xlsx'
                        });
                    } else {
                        Alert.alert('Error', 'Compartir no está disponible en este dispositivo');
                    }
                } else {
                    throw new Error(`Error del servidor: Status ${downloadRes.status}`);
                }
            }
        } catch (error) {
            console.error('Error exportando:', error);
            Alert.alert('Error de Exportación', error.message || 'Error desconocido al descargar');
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => {
        const fechaRegistro = new Date(item.createdAt);
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
                        {item.metodoRegistro === 'qr' ? '📸 QR' : '📝 Manual'}
                    </Text>
                </View>
            </View>
        );
    };

    // Agrupar asistencias por fecha
    const agruparPorFecha = () => {
        const grupos = {};
        asistencias.forEach(item => {
            const fechaStr = format(new Date(item.fecha), "EEEE, d 'de' MMMM yyyy", { locale: es });
            if (!grupos[fechaStr]) {
                grupos[fechaStr] = [];
            }
            grupos[fechaStr].push(item);
        });

        return Object.keys(grupos).map(fecha => ({
            title: fecha.charAt(0).toUpperCase() + fecha.slice(1),
            data: grupos[fecha]
        }));
    };

    const seccionesOriginales = agruparPorFecha();
    const secciones = seccionesOriginales.map(sec => ({
        ...sec,
        data: expandedSections[sec.title] ? sec.data : []
    }));

    const toggleSection = (title) => {
        setExpandedSections(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
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
                    <View>
                        <Text style={styles.headerTitle}>Calendario</Text>
                        <Text style={styles.headerSubtitle}>Próximos Eventos</Text>
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
                        dropdownIconColor="#000000"
                    >
                        <Picker.Item label="Todos" value="todos" color="#000000" />
                        <Picker.Item label="Semanal" value="semanal" color="#000000" />
                        <Picker.Item label="Consejo" value="consejo" color="#000000" />
                        <Picker.Item label="Formación" value="formacion" color="#000000" />
                        <Picker.Item label="Apostolado" value="apostolado" color="#000000" />
                    </Picker>
                </View>

                <View style={styles.dateFiltros}>
                    <TouchableOpacity 
                        style={styles.dateButton}
                        onPress={() => setShowPicker({ show: true, mode: 'inicio' })}
                    >
                        <Text style={styles.dateButtonText}>
                            {fechaInicio ? format(fechaInicio, "dd/MM/yyyy") : "Fecha Inicio"}
                        </Text>
                    </TouchableOpacity>
                    <Text style={{ marginHorizontal: 10 }}>-</Text>
                    <TouchableOpacity 
                        style={styles.dateButton}
                        onPress={() => setShowPicker({ show: true, mode: 'fin' })}
                    >
                        <Text style={styles.dateButtonText}>
                            {fechaFin ? format(fechaFin, "dd/MM/yyyy") : "Fecha Fin"}
                        </Text>
                    </TouchableOpacity>
                    {(fechaInicio || fechaFin) && (
                        <TouchableOpacity 
                            style={styles.clearDateButton}
                            onPress={() => {
                                setFechaInicio(null);
                                setFechaFin(null);
                            }}
                        >
                            <Text style={styles.clearDateText}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {showPicker.show && (
                <DateTimePicker
                    value={
                        showPicker.mode === 'inicio' 
                            ? (fechaInicio || new Date()) 
                            : (fechaFin || new Date())
                    }
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShowPicker({ show: false, mode: 'inicio' });
                        if (event.type === 'set' && selectedDate) {
                            if (showPicker.mode === 'inicio') {
                                setFechaInicio(selectedDate);
                            } else {
                                setFechaFin(selectedDate);
                            }
                        }
                    }}
                />
            )}

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : (
                <SectionList
                    sections={secciones}
                    renderItem={renderItem}
                    renderSectionHeader={({ section: { title } }) => (
                        <TouchableOpacity 
                            style={styles.sectionHeader}
                            onPress={() => toggleSection(title)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.sectionHeaderText}>📅 {title}</Text>
                            <Text style={styles.sectionHeaderIcon}>
                                {expandedSections[title] ? '▼' : '▶'}
                            </Text>
                        </TouchableOpacity>
                    )}
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
    dateFiltros: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.md,
    },
    dateButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.sm,
        alignItems: 'center',
        backgroundColor: COLORS.offWhite,
    },
    dateButtonText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.darkGray,
    },
    clearDateButton: {
        marginLeft: 10,
        padding: 5,
        backgroundColor: COLORS.gray,
        borderRadius: 15,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    clearDateText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 12,
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
    sectionHeader: {
        backgroundColor: COLORS.cream,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.xs,
        marginTop: SPACING.md,
        marginBottom: SPACING.sm,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    sectionHeaderText: {
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    sectionHeaderIcon: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.gray,
    },
});

export default ReporteAsistenciaScreen;
