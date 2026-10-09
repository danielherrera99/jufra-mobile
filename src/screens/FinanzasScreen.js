import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Card from '../components/Card';
import { Picker } from '@react-native-picker/picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

const FinanzasScreen = ({ navigation }) => {
    const { usuario } = useAuth();
    const [finanzas, setFinanzas] = useState([]);
    const [resumen, setResumen] = useState({ ingresosTotales: 0, egresosTotales: 0, saldo: 0 });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    // Form state
    const [tipo, setTipo] = useState('ingreso');
    const [monto, setMonto] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [categoria, setCategoria] = useState('otros');

    const isAdminOrTesorero = usuario && (usuario.rol === 'admin' || usuario.cargo === 'tesorero' || usuario.cargo === 'coordinador');

    useEffect(() => {
        cargarFinanzas();
    }, []);

    const cargarFinanzas = async () => {
        try {
            const response = await api.get('/finanzas');
            if (response.data.success) {
                setFinanzas(response.data.data);
                setResumen(response.data.resumen);
            }
        } catch (error) {
            console.error('Error al cargar finanzas:', error);
            Alert.alert('Error', 'No se pudieron cargar los registros financieros');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        cargarFinanzas();
    };

    const handleCreate = async () => {
        if (!monto || !descripcion) {
            Alert.alert('Error', 'Por favor completa los campos obligatorios');
            return;
        }
        try {
            await api.post('/finanzas', {
                tipo,
                monto: parseFloat(monto),
                descripcion,
                categoria,
                fecha: new Date().toISOString().split('T')[0]
            });
            Alert.alert('Éxito', 'Registro guardado correctamente');
            setModalVisible(false);
            setMonto('');
            setDescripcion('');
            cargarFinanzas();
        } catch (error) {
            console.error('Error al crear finanza:', error);
            Alert.alert('Error', 'No se pudo guardar el registro');
        }
    };

    const eliminarRegistro = (id) => {
        Alert.alert(
            'Eliminar Registro',
            '¿Seguro que deseas eliminar este registro? Alterará el saldo general.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/finanzas/${id}`);
                            Alert.alert('Éxito', 'Registro eliminado');
                            cargarFinanzas();
                        } catch (error) {
                            console.error('Error al eliminar:', error);
                            Alert.alert('Error', 'No se pudo eliminar el registro');
                        }
                    }
                }
            ]
        );
    };

    const exportarExcel = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const fileUri = FileSystem.documentDirectory + 'Finanzas_JUFRA.xlsx';
            
            const result = await FileSystem.downloadAsync(
                `${API_URL}/finanzas/exportar/excel`,
                fileUri,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (result.status === 200) {
                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(result.uri, {
                        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        dialogTitle: 'Descargar Finanzas',
                        UTI: 'com.microsoft.excel.xls'
                    });
                } else {
                    Alert.alert('Info', 'La opción de compartir no está disponible.');
                }
            } else {
                Alert.alert('Error', 'Hubo un problema al descargar el archivo.');
            }
        } catch (error) {
            console.error('Error al exportar:', error);
            Alert.alert('Error', 'No se pudo exportar el archivo');
        }
    };

    const renderItem = ({ item }) => (
        <Card style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.dateContainer}>
                    <Text style={styles.day}>{format(new Date(item.fecha), 'dd')}</Text>
                    <Text style={styles.month}>{format(new Date(item.fecha), 'MMM', { locale: es }).toUpperCase()}</Text>
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.title}>{item.descripcion}</Text>
                    <View style={styles.badgeContainer}>
                        <View style={[styles.badge, { backgroundColor: item.tipo === 'ingreso' ? '#4CAF50' : '#F44336' }]}>
                            <Text style={styles.badgeText}>{item.tipo.toUpperCase()}</Text>
                        </View>
                        <Text style={styles.categoriaText}>{item.categoria}</Text>
                    </View>
                </View>
                <View style={styles.montoContainer}>
                    <Text style={[styles.montoText, { color: item.tipo === 'ingreso' ? '#4CAF50' : '#F44336' }]}>
                        {item.tipo === 'ingreso' ? '+' : '-'} S/ {parseFloat(item.monto).toFixed(2)}
                    </Text>
                </View>
            </View>
            {isAdminOrTesorero && (
                <TouchableOpacity onPress={() => eliminarRegistro(item._id)} style={styles.deleteBtn}>
                    <Text style={styles.deleteBtnText}>Eliminar</Text>
                </TouchableOpacity>
            )}
        </Card>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Cargando registros...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tesorería</Text>
                {isAdminOrTesorero && (
                    <TouchableOpacity onPress={exportarExcel} style={styles.exportButton}>
                        <Text style={styles.exportButtonText}>📊 Excel</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.resumenContainer}>
                <View style={[styles.resumenCard, { borderLeftColor: '#4CAF50', borderLeftWidth: 4 }]}>
                    <Text style={styles.resumenLabel}>Ingresos</Text>
                    <Text style={[styles.resumenValue, { color: '#4CAF50' }]}>S/ {resumen.ingresosTotales.toFixed(2)}</Text>
                </View>
                <View style={[styles.resumenCard, { borderLeftColor: '#F44336', borderLeftWidth: 4 }]}>
                    <Text style={styles.resumenLabel}>Egresos</Text>
                    <Text style={[styles.resumenValue, { color: '#F44336' }]}>S/ {resumen.egresosTotales.toFixed(2)}</Text>
                </View>
            </View>
            <View style={styles.saldoContainer}>
                <Text style={styles.saldoLabel}>Saldo Actual</Text>
                <Text style={styles.saldoValue}>S/ {resumen.saldo.toFixed(2)}</Text>
            </View>

            <FlatList
                data={finanzas}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                onRefresh={onRefresh}
                refreshing={refreshing}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No hay registros financieros</Text>
                    </View>
                }
            />

            {isAdminOrTesorero && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.fabIcon}>+</Text>
                </TouchableOpacity>
            )}

            {/* Modal Crear */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Nuevo Registro</Text>
                        
                        <Text style={styles.label}>Tipo</Text>
                        <View style={styles.pickerContainer}>
                            <Picker selectedValue={tipo} onValueChange={(itemValue) => setTipo(itemValue)}>
                                <Picker.Item label="Ingreso (+)" value="ingreso" />
                                <Picker.Item label="Egreso (-)" value="egreso" />
                            </Picker>
                        </View>

                        <Text style={styles.label}>Monto (S/)</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={monto}
                            onChangeText={setMonto}
                            placeholder="Ej: 50.00"
                        />

                        <Text style={styles.label}>Descripción</Text>
                        <TextInput
                            style={styles.input}
                            value={descripcion}
                            onChangeText={setDescripcion}
                            placeholder="Ej: Ofrenda, compra de materiales..."
                        />

                        <Text style={styles.label}>Categoría</Text>
                        <View style={styles.pickerContainer}>
                            <Picker selectedValue={categoria} onValueChange={(itemValue) => setCategoria(itemValue)}>
                                <Picker.Item label="Diezmo / Aporte" value="diezmo" />
                                <Picker.Item label="Donación" value="donacion" />
                                <Picker.Item label="Actividad Pro-fondos" value="actividad" />
                                <Picker.Item label="Compras" value="compras" />
                                <Picker.Item label="Servicios" value="servicios" />
                                <Picker.Item label="Otros" value="otros" />
                            </Picker>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}>
                                <Text style={styles.btnCancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btnSave} onPress={handleCreate}>
                                <Text style={styles.btnSaveText}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.cream },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.cream },
    header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, paddingTop: SPACING.xl, backgroundColor: COLORS.primary },
    backButton: { padding: SPACING.sm },
    backButtonText: { color: COLORS.white, fontSize: FONT_SIZES.xl },
    headerTitle: { color: COLORS.white, fontSize: FONT_SIZES.lg, fontWeight: 'bold', marginLeft: SPACING.sm, flex: 1 },
    exportButton: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: BORDER_RADIUS.sm, borderColor: COLORS.white, borderWidth: 1 },
    exportButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: FONT_SIZES.sm },
    loadingText: { marginTop: SPACING.md, color: COLORS.gray, fontSize: FONT_SIZES.md },
    resumenContainer: { flexDirection: 'row', justifyContent: 'space-between', padding: SPACING.md },
    resumenCard: { flex: 1, backgroundColor: COLORS.white, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, marginHorizontal: 4, ...SHADOWS.small },
    resumenLabel: { fontSize: FONT_SIZES.xs, color: COLORS.gray, marginBottom: 4 },
    resumenValue: { fontSize: FONT_SIZES.lg, fontWeight: 'bold' },
    saldoContainer: { backgroundColor: COLORS.primary, padding: SPACING.md, marginHorizontal: SPACING.md, borderRadius: BORDER_RADIUS.md, alignItems: 'center', ...SHADOWS.medium },
    saldoLabel: { color: 'rgba(255,255,255,0.8)', fontSize: FONT_SIZES.sm, marginBottom: 4 },
    saldoValue: { color: COLORS.white, fontSize: 28, fontWeight: 'bold' },
    listContainer: { padding: SPACING.md, paddingBottom: 100 },
    card: { padding: SPACING.sm, marginBottom: SPACING.md },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    dateContainer: { alignItems: 'center', justifyContent: 'center', width: 50, height: 50, backgroundColor: COLORS.lightGray, borderRadius: BORDER_RADIUS.md, marginRight: SPACING.md },
    day: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.primary },
    month: { fontSize: FONT_SIZES.xs, color: COLORS.gray, marginTop: -2 },
    headerText: { flex: 1 },
    title: { fontSize: FONT_SIZES.md, fontWeight: 'bold', color: COLORS.darkGray, marginBottom: 4 },
    badgeContainer: { flexDirection: 'row', alignItems: 'center' },
    badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginRight: 8 },
    badgeText: { color: COLORS.white, fontSize: 10, fontWeight: 'bold' },
    categoriaText: { fontSize: 12, color: COLORS.gray },
    montoContainer: { marginLeft: SPACING.sm, alignItems: 'flex-end' },
    montoText: { fontSize: FONT_SIZES.md, fontWeight: 'bold' },
    deleteBtn: { marginTop: SPACING.sm, alignSelf: 'flex-end' },
    deleteBtnText: { color: '#F44336', fontSize: FONT_SIZES.xs },
    emptyContainer: { alignItems: 'center', padding: SPACING.xl, marginTop: SPACING.xl },
    emptyText: { fontSize: FONT_SIZES.md, color: COLORS.gray, textAlign: 'center' },
    fab: { position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', ...SHADOWS.medium },
    fabIcon: { fontSize: 32, color: COLORS.white, marginTop: -2 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '90%', backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, ...SHADOWS.large },
    modalTitle: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.darkGray, marginBottom: SPACING.md, textAlign: 'center' },
    label: { fontSize: FONT_SIZES.sm, color: COLORS.gray, marginBottom: 4, marginTop: SPACING.sm },
    input: { borderWidth: 1, borderColor: '#DDD', borderRadius: BORDER_RADIUS.md, padding: SPACING.sm, fontSize: FONT_SIZES.md, backgroundColor: '#F9F9F9' },
    pickerContainer: { borderWidth: 1, borderColor: '#DDD', borderRadius: BORDER_RADIUS.md, backgroundColor: '#F9F9F9', overflow: 'hidden' },
    modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.xl },
    btnCancel: { padding: SPACING.md, borderRadius: BORDER_RADIUS.md, flex: 1, marginRight: 8, alignItems: 'center', backgroundColor: COLORS.lightGray },
    btnCancelText: { color: COLORS.darkGray, fontWeight: 'bold' },
    btnSave: { padding: SPACING.md, borderRadius: BORDER_RADIUS.md, flex: 1, marginLeft: 8, alignItems: 'center', backgroundColor: COLORS.primary },
    btnSaveText: { color: COLORS.white, fontWeight: 'bold' }
});

export default FinanzasScreen;
