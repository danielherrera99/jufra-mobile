import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
    ActivityIndicator,
    RefreshControl,
    Linking,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIAS = [
    { id: 'todos', label: 'Todos', icon: '📦' },
    { id: 'musica', label: 'Música', icon: '🎸' },
    { id: 'campamento', label: 'Campamento', icon: '🏕️' },
    { id: 'biblioteca', label: 'Biblioteca', icon: '📚' },
    { id: 'liturgia', label: 'Liturgia', icon: '✝️' },
    { id: 'otros', label: 'Otros', icon: '📦' },
];

const InventarioScreen = ({ navigation }) => {
    const { usuario } = useAuth();
    const esAdmin = ['admin', 'superadmin', 'admin_nacional'].includes(usuario?.rol);

    const [articulos, setArticulos] = useState([]);
    const [stats, setStats] = useState({ total: 0, disponibles: 0, prestados: 0, atrasados: 0 });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filtros
    const [categoriaFilter, setCategoriaFilter] = useState('todos');
    const [searchTerm, setSearchTerm] = useState('');

    // Hermanos para selector de préstamos
    const [hermanos, setHermanos] = useState([]);

    // Modal Crear/Editar Artículo
    const [isArticuloModalOpen, setIsArticuloModalOpen] = useState(false);
    const [editingArticulo, setEditingArticulo] = useState(null);
    const [formNombre, setFormNombre] = useState('');
    const [formCategoria, setFormCategoria] = useState('musica');
    const [formCodigo, setFormCodigo] = useState('');
    const [formUbicacion, setFormUbicacion] = useState('');
    const [formDescripcion, setFormDescripcion] = useState('');
    const [formEstado, setFormEstado] = useState('disponible');

    // Modal Préstamo
    const [isPrestarModalOpen, setIsPrestarModalOpen] = useState(false);
    const [articuloAPrestar, setArticuloAPrestar] = useState(null);
    const [prestarUsuarioId, setPrestarUsuarioId] = useState('');
    const [prestarNombreManual, setPrestarNombreManual] = useState('');
    const [prestarTelefono, setPrestarTelefono] = useState('');
    const [prestarDias, setPrestarDias] = useState('7');
    const [prestarObs, setPrestarObs] = useState('');

    // Modal Devolución
    const [isDevolverModalOpen, setIsDevolverModalOpen] = useState(false);
    const [articuloADevolver, setArticuloADevolver] = useState(null);
    const [obsDevolucion, setObsDevolucion] = useState('');

    const fetchData = async () => {
        try {
            const [invRes, herRes] = await Promise.all([
                api.get('/inventario'),
                api.get('/hermanos?todos=true')
            ]);
            setArticulos(invRes.data.articulos || []);
            setStats(invRes.data.stats || { total: 0, disponibles: 0, prestados: 0, atrasados: 0 });
            setHermanos(herRes.data.hermanos || []);
        } catch (error) {
            console.error('Error al cargar inventario:', error);
            Alert.alert('Error', 'No se pudo cargar el inventario.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (!esAdmin) {
            Alert.alert('Acceso Restringido', 'Este módulo está reservado exclusivamente para administradores.');
            navigation.goBack();
            return;
        }
        fetchData();
    }, [esAdmin]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    // Filtrar artículos
    const articulosFiltrados = useMemo(() => {
        return articulos.filter(item => {
            if (categoriaFilter !== 'todos' && item.categoria !== categoriaFilter) return false;
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                const mNombre = item.nombre?.toLowerCase().includes(term);
                const mCodigo = item.codigo?.toLowerCase().includes(term);
                const mUbicacion = item.ubicacion?.toLowerCase().includes(term);
                const mPersona = item.prestamoActivo?.nombre_persona?.toLowerCase().includes(term);
                return mNombre || mCodigo || mUbicacion || mPersona;
            }
            return true;
        });
    }, [articulos, categoriaFilter, searchTerm]);

    // Guardar artículo
    const handleSaveArticulo = async () => {
        if (!formNombre.trim()) {
            Alert.alert('Atención', 'Por favor ingresa el nombre del artículo.');
            return;
        }

        try {
            const payload = {
                nombre: formNombre.trim(),
                categoria: formCategoria,
                codigo: formCodigo.trim(),
                ubicacion: formUbicacion.trim(),
                descripcion: formDescripcion.trim(),
                estado: formEstado
            };

            if (editingArticulo) {
                await api.put(`/inventario/${editingArticulo.id || editingArticulo._id}`, payload);
                Alert.alert('Éxito', 'Artículo actualizado correctamente.');
            } else {
                await api.post('/inventario', payload);
                Alert.alert('Éxito', 'Artículo registrado en el inventario.');
            }
            setIsArticuloModalOpen(false);
            fetchData();
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Error al guardar.');
        }
    };

    // Prestar
    const handlePrestar = async () => {
        if (!prestarUsuarioId && !prestarNombreManual.trim()) {
            Alert.alert('Atención', 'Debes seleccionar un hermano o escribir su nombre.');
            return;
        }

        try {
            const d = new Date();
            d.setDate(d.getDate() + parseInt(prestarDias || '7'));
            const fechaDevolucionEsperada = d.toISOString().split('T')[0];

            let hermanoSeleccionado = null;
            if (prestarUsuarioId) {
                hermanoSeleccionado = hermanos.find(h => (h.id === prestarUsuarioId || h._id === prestarUsuarioId));
            }

            const payload = {
                usuarioId: prestarUsuarioId || null,
                nombrePersona: hermanoSeleccionado ? `${hermanoSeleccionado.nombre} ${hermanoSeleccionado.apellido}` : prestarNombreManual.trim(),
                telefonoContacto: prestarTelefono || (hermanoSeleccionado ? (hermanoSeleccionado.telefono || hermanoSeleccionado.contactoEmergencia) : ''),
                fechaDevolucionEsperada,
                observacionesPrestamo: prestarObs.trim()
            };

            await api.post(`/inventario/${articuloAPrestar.id || articuloAPrestar._id}/prestar`, payload);
            Alert.alert('Préstamo Registrado', `El artículo quedó a cargo de ${payload.nombrePersona}.`);
            setIsPrestarModalOpen(false);
            fetchData();
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Error al registrar préstamo.');
        }
    };

    // Devolver
    const handleDevolver = async () => {
        try {
            await api.post(`/inventario/${articuloADevolver.id || articuloADevolver._id}/devolver`, {
                observacionesDevolucion: obsDevolucion.trim()
            });
            Alert.alert('Devolución Confirmada', 'El artículo vuelve a estar disponible.');
            setIsDevolverModalOpen(false);
            fetchData();
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Error al registrar devolución.');
        }
    };

    // Recordatorio WhatsApp
    const handleWhatsApp = (item) => {
        const prestamo = item.prestamoActivo;
        if (!prestamo) return;
        const nombre = prestamo.usuario?.nombre || prestamo.nombre_persona || 'Hermano';
        const tel = (prestamo.usuario?.telefono || prestamo.telefono_contacto || '').replace(/\D/g, '');
        const msg = `¡Paz y Bien, querido hermano ${nombre}! 🕊️ Te recordamos amablemente sobre la devolución de "${item.nombre}" que tienes en préstamo de la JUFRA. ¡Muchas gracias por cuidarlo!`;
        const url = tel ? `https://wa.me/51${tel}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
        Linking.openURL(url);
    };

    const openEditModal = (item) => {
        setEditingArticulo(item);
        setFormNombre(item.nombre || '');
        setFormCategoria(item.categoria || 'musica');
        setFormCodigo(item.codigo || '');
        setFormUbicacion(item.ubicacion || '');
        setFormDescripcion(item.descripcion || '');
        setFormEstado(item.estado || 'disponible');
        setIsArticuloModalOpen(true);
    };

    const openNewModal = () => {
        setEditingArticulo(null);
        setFormNombre('');
        setFormCategoria('musica');
        setFormCodigo('');
        setFormUbicacion('');
        setFormDescripcion('');
        setFormEstado('disponible');
        setIsArticuloModalOpen(true);
    };

    const renderItem = ({ item }) => {
        const esPrestado = item.estado === 'prestado';
        const prestamo = item.prestamoActivo;
        const hoy = new Date().toISOString().split('T')[0];
        const atrasado = esPrestado && prestamo?.fecha_devolucion_esperada && prestamo.fecha_devolucion_esperada < hoy;

        return (
            <View style={[styles.card, { borderLeftColor: atrasado ? COLORS.error : esPrestado ? COLORS.warning : COLORS.success }]}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardCodigo}>{item.codigo || 'SIN CÓDIGO'}</Text>
                    <View style={[styles.statusBadge, {
                        backgroundColor: atrasado ? '#FDE8E8' : esPrestado ? '#FEF08A' : '#DCFCE7'
                    }]}>
                        <Text style={[styles.statusText, {
                            color: atrasado ? COLORS.error : esPrestado ? '#854D0E' : '#15803D'
                        }]}>
                            {atrasado ? '⚠️ VENCIDO' : esPrestado ? '🤝 PRESTADO' : '✅ DISPONIBLE'}
                        </Text>
                    </View>
                </View>

                <Text style={styles.cardTitulo}>{item.nombre}</Text>

                <View style={styles.cardDetalles}>
                    <Text style={styles.cardDetalleText}>
                        🏷️ {CATEGORIAS.find(c => c.id === item.categoria)?.label || item.categoria}
                    </Text>
                    {item.ubicacion ? (
                        <Text style={styles.cardDetalleText}>📍 {item.ubicacion}</Text>
                    ) : null}
                </View>

                {esPrestado && prestamo && (
                    <View style={[styles.prestamoBox, { backgroundColor: atrasado ? '#FFF1F2' : '#FEFCE8' }]}>
                        <Text style={styles.prestamoNombre}>
                            En manos de: {prestamo.usuario ? `${prestamo.usuario.nombre} ${prestamo.usuario.apellido}` : prestamo.nombre_persona}
                        </Text>
                        {prestamo.fecha_devolucion_esperada ? (
                            <Text style={[styles.prestamoFecha, { color: atrasado ? COLORS.error : '#713F12' }]}>
                                Devolver: {new Date(prestamo.fecha_devolucion_esperada).toLocaleDateString('es-ES')}
                            </Text>
                        ) : null}
                    </View>
                )}

                <View style={styles.cardFooter}>
                    {!esPrestado ? (
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: COLORS.accent }]}
                            onPress={() => {
                                setArticuloAPrestar(item);
                                setPrestarUsuarioId('');
                                setPrestarNombreManual('');
                                setPrestarTelefono('');
                                setPrestarDias('7');
                                setPrestarObs('');
                                setIsPrestarModalOpen(true);
                            }}
                        >
                            <Text style={styles.actionBtnText}>🤝 Prestar</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: COLORS.success }]}
                                onPress={() => {
                                    setArticuloADevolver(item);
                                    setObsDevolucion('');
                                    setIsDevolverModalOpen(true);
                                }}
                            >
                                <Text style={styles.actionBtnText}>📥 Devolver</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: '#25D366' }]}
                                onPress={() => handleWhatsApp(item)}
                            >
                                <Text style={styles.actionBtnText}>💬 WhatsApp</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <TouchableOpacity onPress={() => openEditModal(item)} style={styles.editBtn}>
                        <Text style={{ fontSize: 16 }}>✏️</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                    <Text style={styles.headerTitle}>📦 Inventario y Préstamos</Text>
                    <Text style={styles.headerSubtitle}>Solo Administradores</Text>
                </View>
                <TouchableOpacity onPress={openNewModal} style={styles.addButton}>
                    <Text style={styles.addButtonText}>➕</Text>
                </TouchableOpacity>
            </View>

            {/* Métricas rápidas */}
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{stats.total}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={[styles.statValue, { color: COLORS.success }]}>{stats.disponibles}</Text>
                    <Text style={styles.statLabel}>Disponibles</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={[styles.statValue, { color: COLORS.warning }]}>{stats.prestados}</Text>
                    <Text style={styles.statLabel}>Prestados</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={[styles.statValue, { color: stats.atrasados > 0 ? COLORS.error : COLORS.gray }]}>
                        {stats.atrasados}
                    </Text>
                    <Text style={styles.statLabel}>Vencidos</Text>
                </View>
            </View>

            {/* Buscador */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="🔍 Buscar por nombre, código o persona..."
                    placeholderTextColor={COLORS.gray}
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
            </View>

            {/* Categorías (Horizontal) */}
            <View style={{ height: 44, marginBottom: 8 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
                    {CATEGORIAS.map(cat => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[styles.categoryChip, categoriaFilter === cat.id && styles.categoryChipActive]}
                            onPress={() => setCategoriaFilter(cat.id)}
                        >
                            <Text style={[styles.categoryChipText, categoriaFilter === cat.id && styles.categoryChipTextActive]}>
                                {cat.icon} {cat.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Lista de Artículos */}
            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={articulosFiltrados}
                    keyExtractor={item => item.id || item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={{ fontSize: 40, marginBottom: 10 }}>📦</Text>
                            <Text style={styles.emptyText}>No hay artículos registrados.</Text>
                        </View>
                    }
                />
            )}

            {/* MODAL: Crear/Editar */}
            <Modal visible={isArticuloModalOpen} animationType="slide" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{editingArticulo ? 'Editar Artículo' : 'Nuevo Artículo'}</Text>
                        <ScrollView style={{ maxHeight: 400 }}>
                            <Text style={styles.inputLabel}>Nombre del bien *</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Ej: Guitarra acústica, Carpa 4 personas..."
                                placeholderTextColor="#999"
                                value={formNombre}
                                onChangeText={setFormNombre}
                            />

                            <Text style={styles.inputLabel}>Código</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Ej: EQ-001, LIB-05"
                                placeholderTextColor="#999"
                                value={formCodigo}
                                onChangeText={setFormCodigo}
                            />

                            <Text style={styles.inputLabel}>Ubicación</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Ej: Salón Parroquial, Sacristía..."
                                placeholderTextColor="#999"
                                value={formUbicacion}
                                onChangeText={setFormUbicacion}
                            />

                            <Text style={styles.inputLabel}>Descripción</Text>
                            <TextInput
                                style={[styles.modalInput, { height: 70 }]}
                                placeholder="Notas o estado físico..."
                                placeholderTextColor="#999"
                                multiline
                                value={formDescripcion}
                                onChangeText={setFormDescripcion}
                            />
                        </ScrollView>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsArticuloModalOpen(false)}>
                                <Text style={styles.cancelBtnText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveArticulo}>
                                <Text style={styles.saveBtnText}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* MODAL: Prestar */}
            <Modal visible={isPrestarModalOpen} animationType="slide" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>🤝 Registrar Préstamo</Text>
                        <Text style={{ color: COLORS.gray, marginBottom: 12 }}>
                            {articuloAPrestar?.nombre}
                        </Text>

                        <ScrollView style={{ maxHeight: 380 }}>
                            <Text style={styles.inputLabel}>Hermano responsable</Text>
                            {/* Selector rápido de hermanos */}
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                                {hermanos.filter(h => h.activo).slice(0, 10).map(h => (
                                    <TouchableOpacity
                                        key={h.id || h._id}
                                        style={[
                                            styles.hermanoChip,
                                            prestarUsuarioId === (h.id || h._id) && styles.hermanoChipActive
                                        ]}
                                        onPress={() => {
                                            setPrestarUsuarioId(h.id || h._id);
                                            setPrestarNombreManual('');
                                            setPrestarTelefono(h.telefono || h.contactoEmergencia || '');
                                        }}
                                    >
                                        <Text style={[
                                            styles.hermanoChipText,
                                            prestarUsuarioId === (h.id || h._id) && styles.hermanoChipTextActive
                                        ]}>
                                            {h.nombre} {h.apellido?.[0]}.
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={styles.inputLabel}>O escribir nombre externo:</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Nombre completo del solicitante..."
                                placeholderTextColor="#999"
                                value={prestarNombreManual}
                                onChangeText={t => {
                                    setPrestarNombreManual(t);
                                    if (t) setPrestarUsuarioId('');
                                }}
                            />

                            <Text style={styles.inputLabel}>Teléfono / WhatsApp</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Ej: 987654321"
                                placeholderTextColor="#999"
                                keyboardType="phone-pad"
                                value={prestarTelefono}
                                onChangeText={setPrestarTelefono}
                            />

                            <Text style={styles.inputLabel}>Préstamo por cuántos días:</Text>
                            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                                {['3', '7', '14', '30'].map(dias => (
                                    <TouchableOpacity
                                        key={dias}
                                        style={[styles.diasChip, prestarDias === dias && styles.diasChipActive]}
                                        onPress={() => setPrestarDias(dias)}
                                    >
                                        <Text style={[styles.diasChipText, prestarDias === dias && styles.diasChipTextActive]}>
                                            {dias} días
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsPrestarModalOpen(false)}>
                                <Text style={styles.cancelBtnText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={handlePrestar}>
                                <Text style={styles.saveBtnText}>Confirmar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* MODAL: Devolver */}
            <Modal visible={isDevolverModalOpen} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>📥 Registrar Devolución</Text>
                        <Text style={{ color: COLORS.gray, marginBottom: 12 }}>
                            {articuloADevolver?.nombre}
                        </Text>

                        <Text style={styles.inputLabel}>Observaciones de recepción (opcional)</Text>
                        <TextInput
                            style={[styles.modalInput, { height: 70 }]}
                            placeholder="Ej: Devuelto en perfectas condiciones..."
                            placeholderTextColor="#999"
                            multiline
                            value={obsDevolucion}
                            onChangeText={setObsDevolucion}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsDevolverModalOpen(false)}>
                                <Text style={styles.cancelBtnText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: COLORS.success }]} onPress={handleDevolver}>
                                <Text style={styles.saveBtnText}>Marcar Devuelto</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.cream,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.xl,
        paddingBottom: SPACING.md,
        backgroundColor: COLORS.primary,
    },
    backButton: {
        padding: SPACING.sm,
    },
    backButtonText: {
        color: COLORS.white,
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
    },
    headerTitle: {
        color: COLORS.white,
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: FONT_SIZES.xs,
    },
    addButton: {
        padding: SPACING.sm,
        backgroundColor: COLORS.accent,
        borderRadius: BORDER_RADIUS.md,
    },
    addButtonText: {
        fontSize: 16,
    },
    statsRow: {
        flexDirection: 'row',
        padding: SPACING.sm,
        gap: 8,
    },
    statCard: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.sm,
        alignItems: 'center',
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    statValue: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.darkGray,
    },
    statLabel: {
        fontSize: 10,
        color: COLORS.gray,
        marginTop: 2,
    },
    searchContainer: {
        paddingHorizontal: SPACING.sm,
        marginBottom: 8,
    },
    searchInput: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.md,
        paddingVertical: 8,
        fontSize: FONT_SIZES.sm,
        color: COLORS.darkGray,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    categoriesContainer: {
        paddingHorizontal: SPACING.sm,
        gap: 6,
    },
    categoryChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        height: 32,
        justifyContent: 'center',
    },
    categoryChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    categoryChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.gray,
    },
    categoryChipTextActive: {
        color: COLORS.white,
    },
    listContent: {
        padding: SPACING.sm,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        marginBottom: 10,
        borderLeftWidth: 4,
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    cardCodigo: {
        fontSize: 11,
        fontWeight: 'bold',
        color: COLORS.gray,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    cardTitulo: {
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
        color: COLORS.darkGray,
        marginBottom: 4,
    },
    cardDetalles: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 8,
    },
    cardDetalleText: {
        fontSize: 12,
        color: COLORS.gray,
    },
    prestamoBox: {
        padding: 8,
        borderRadius: 6,
        marginBottom: 8,
    },
    prestamoNombre: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.darkGray,
    },
    prestamoFecha: {
        fontSize: 11,
        marginTop: 2,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
    },
    actionBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    actionBtnText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    editBtn: {
        padding: 6,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptyText: {
        color: COLORS.gray,
        fontSize: FONT_SIZES.md,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.md,
    },
    modalContainer: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        width: '100%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 4,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.darkGray,
        marginBottom: 4,
        marginTop: 8,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: BORDER_RADIUS.sm,
        padding: 8,
        fontSize: FONT_SIZES.sm,
        color: COLORS.darkGray,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        marginTop: 16,
    },
    cancelBtn: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: BORDER_RADIUS.sm,
        backgroundColor: COLORS.lightGray,
    },
    cancelBtnText: {
        color: COLORS.darkGray,
        fontWeight: '600',
    },
    saveBtn: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: BORDER_RADIUS.sm,
        backgroundColor: COLORS.primary,
    },
    saveBtnText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    hermanoChip: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: COLORS.cream,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        marginRight: 6,
    },
    hermanoChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    hermanoChipText: {
        fontSize: 12,
        color: COLORS.darkGray,
    },
    hermanoChipTextActive: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    diasChip: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 6,
        backgroundColor: COLORS.cream,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    diasChipActive: {
        backgroundColor: COLORS.accent,
        borderColor: COLORS.accent,
    },
    diasChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.darkGray,
    },
    diasChipTextActive: {
        color: COLORS.white,
    },
});

export default InventarioScreen;
