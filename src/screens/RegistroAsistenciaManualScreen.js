import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import api from '../config/api';
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const RegistroAsistenciaManualScreen = ({ navigation }) => {
    const [hermanos, setHermanos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [procesando, setProcesando] = useState(false);
    const [tipoReunion, setTipoReunion] = useState('semanal');
    const [estadoAsistencia, setEstadoAsistencia] = useState('presente');
    const [seleccionados, setSeleccionados] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [invitados, setInvitados] = useState([]);
    const [nombreInvitado, setNombreInvitado] = useState('');

    useEffect(() => {
        cargarHermanos();
    }, []);

    const cargarHermanos = async () => {
        try {
            const response = await api.get('/hermanos?todos=true');
            if (response.data.success) {
                setHermanos(response.data.hermanos.filter(h => h.activo));
            }
        } catch (error) {
            console.error('Error al cargar hermanos:', error);
            Alert.alert('Error', 'No se pudieron cargar los hermanos');
        } finally {
            setLoading(false);
        }
    };

    const toggleSeleccion = (id) => {
        if (seleccionados.includes(id)) {
            setSeleccionados(seleccionados.filter((item) => item !== id));
        } else {
            setSeleccionados([...seleccionados, id]);
        }
    };

    const agregarInvitado = () => {
        if (!nombreInvitado.trim()) return;
        setInvitados([...invitados, { id: Date.now().toString(), nombre: nombreInvitado.trim() }]);
        setNombreInvitado('');
    };

    const removerInvitado = (id) => {
        setInvitados(invitados.filter(inv => inv.id !== id));
    };

    const registrarAsistencia = async () => {
        if (seleccionados.length === 0 && invitados.length === 0) {
            Alert.alert('Atención', 'Selecciona al menos un hermano o agrega un invitado');
            return;
        }

        setProcesando(true);
        try {
            const listado = [
                ...seleccionados.map(id => ({ usuarioId: id, estado: estadoAsistencia })),
                ...invitados.map(inv => ({ nombreInvitado: inv.nombre, estado: 'presente' }))
            ];

            const response = await api.post('/asistencia/lote', {
                fecha: new Date(),
                tipoReunion,
                asistencias: listado
            });

            if (response.data.success) {
                Alert.alert(
                    '¡Éxito!',
                    'Asistencia registrada correctamente.',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            }
        } catch (error) {
            console.error('Error al registrar asistencia:', error);
            Alert.alert('Error', error.response?.data?.message || 'No se pudo registrar la asistencia');
        } finally {
            setProcesando(false);
        }
    };

    const hermanosFiltrados = hermanos.filter(h =>
        `${h.nombre} ${h.apellido}`.toLowerCase().includes(busqueda.toLowerCase())
    );

    const renderItem = ({ item }) => {
        const isSelected = seleccionados.includes(item._id);
        return (
            <TouchableOpacity
                style={[styles.itemCard, isSelected && styles.itemSelected]}
                onPress={() => toggleSeleccion(item._id)}
                activeOpacity={0.7}
            >
                <View style={styles.itemContent}>
                    <Text style={[styles.itemName, isSelected && styles.textSelected]}>
                        {item.nombre} {item.apellido}
                    </Text>
                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.tertiary, COLORS.primary]}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>Registro Manual</Text>
                <Text style={styles.headerSubtitle}>Selecciona los asistentes</Text>
            </LinearGradient>

            <View style={styles.controls}>
                <Text style={styles.label}>Tipo de Reunión:</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={tipoReunion}
                        onValueChange={(v) => setTipoReunion(v)}
                    >
                        <Picker.Item label="Semanal" value="semanal" />
                        <Picker.Item label="Consejo" value="consejo" />
                        <Picker.Item label="Formación" value="formacion" />
                        <Picker.Item label="Apostolado" value="apostolado" />
                        <Picker.Item label="Especial" value="especial" />
                    </Picker>
                </View>

                <Input
                    placeholder="Buscar hermano..."
                    value={busqueda}
                    onChangeText={setBusqueda}
                    icon={<Text>🔍</Text>}
                />

                <Text style={styles.label}>Invitados (Sin cuenta):</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                        <Input
                            placeholder="Nombre del invitado..."
                            value={nombreInvitado}
                            onChangeText={setNombreInvitado}
                        />
                    </View>
                    <TouchableOpacity 
                        onPress={agregarInvitado}
                        style={{ background: COLORS.secondary, paddingHorizontal: 15, borderRadius: BORDER_RADIUS.md, height: 50, justifyContent: 'center' }}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>Añadir</Text>
                    </TouchableOpacity>
                </View>

                {invitados.length > 0 && (
                    <View style={styles.guestsList}>
                        {invitados.map(inv => (
                            <View key={inv.id} style={styles.guestBadge}>
                                <Text style={styles.guestBadgeText}>{inv.nombre}</Text>
                                <TouchableOpacity onPress={() => removerInvitado(inv.id)}>
                                    <Text style={{ color: COLORS.error, marginLeft: 8, fontWeight: 'bold' }}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={hermanosFiltrados}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron hermanos</Text>}
                />
            )}

            <View style={styles.footer}>
                <Text style={styles.summaryText}>
                    {seleccionados.length} hermanos + {invitados.length} invitados
                </Text>
                <Button
                    title={procesando ? "Registrando..." : `Registrar ${estadoAsistencia.charAt(0).toUpperCase() + estadoAsistencia.slice(1)}`}
                    onPress={registrarAsistencia}
                    loading={procesando}
                    disabled={seleccionados.length === 0 && invitados.length === 0}
                    variant={estadoAsistencia === 'presente' ? 'primary' : 'outline'}
                />
            </View>
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
    headerTitle: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    headerSubtitle: {
        fontSize: FONT_SIZES.md,
        color: COLORS.ivory,
    },
    controls: {
        padding: SPACING.lg,
        backgroundColor: COLORS.white,
        ...SHADOWS.small,
    },
    label: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.darkGray,
        marginBottom: SPACING.xs,
        marginTop: SPACING.sm,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.sm,
        backgroundColor: COLORS.offWhite,
    },
    list: {
        padding: SPACING.lg,
    },
    itemCard: {
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: 'transparent',
        ...SHADOWS.small,
    },
    itemSelected: {
        borderColor: COLORS.primary,
        backgroundColor: '#E8F5E9',
    },
    itemContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemName: {
        fontSize: FONT_SIZES.md,
        color: COLORS.black,
    },
    textSelected: {
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.gray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    checkmark: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.gray,
        marginTop: 20,
    },
    footer: {
        padding: SPACING.lg,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
    },
    summaryText: {
        textAlign: 'center',
        marginBottom: SPACING.sm,
        color: COLORS.darkGray,
        fontWeight: '600',
    },
    guestsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 10,
    },
    guestBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3E5F5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#CE93D8',
    },
    guestBadgeText: {
        fontSize: 12,
        color: '#7B1FA2',
        fontWeight: '600',
    },
});

export default RegistroAsistenciaManualScreen;
