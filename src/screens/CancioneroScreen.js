import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import Card from '../components/Card';

const CancioneroScreen = ({ navigation }) => {
    const { usuario } = useAuth();
    const [cantos, setCantos] = useState([]);
    const [filteredCantos, setFilteredCantos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('todos');

    const puedeAgregar = usuario && (
        usuario.rol === 'admin' ||
        usuario.rol === 'consejo' ||
        ['coordinador', 'vice-coordinador', 'formador', 'animador', 'secretario', 'tesorero'].includes(usuario.cargo)
    );

    const categorias = [
        { id: 'todos', label: 'Todos' },
        { id: 'franciscano', label: 'Franciscanos' },
        { id: 'mariano', label: 'Marianos' },
        { id: 'entrada', label: 'Entrada' },
        { id: 'animacion', label: 'Animación' },
        { id: 'adoracion', label: 'Adoración' },
    ];

    useEffect(() => {
        cargarCantos();
    }, []);

    useEffect(() => {
        filtrarCantos();
    }, [search, selectedCategory, cantos]);

    const cargarCantos = async () => {
        try {
            const response = await api.get('/cantos');
            if (response.data.success) {
                setCantos(response.data.cantos);
            }
        } catch (error) {
            console.error('Error al cargar cantos:', error);
            Alert.alert('Error', 'No se pudieron cargar los cantos');
        } finally {
            setLoading(false);
        }
    };

    const filtrarCantos = () => {
        let resultado = cantos;

        if (selectedCategory !== 'todos') {
            resultado = resultado.filter(c => c.categoria === selectedCategory);
        }

        if (search) {
            const searchLower = search.toLowerCase();
            resultado = resultado.filter(c =>
                c.titulo.toLowerCase().includes(searchLower) ||
                c.letra.toLowerCase().includes(searchLower)
            );
        }

        setFilteredCantos(resultado);
    };

    const getIconoCategoria = (categoria) => {
        switch (categoria) {
            case 'franciscano': return '🕊️';
            case 'mariano': return '🌹';
            case 'animacion': return '🎸';
            case 'adoracion': return '🙏';
            default: return '🎵';
        }
    };

    const eliminarCanto = (id) => {
        Alert.alert(
            'Eliminar Canto',
            '¿Estás seguro de que deseas eliminar este canto?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/cantos/${id}`);
                            Alert.alert('Éxito', 'Canto eliminado correctamente');
                            cargarCantos();
                        } catch (error) {
                            console.error('Error al eliminar canto:', error);
                            Alert.alert('Error', 'No se pudo eliminar el canto');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('DetalleCanto', { cantoId: item._id })}
            activeOpacity={0.8}
        >
            <Card style={styles.card}>
                <View style={styles.cardContent}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.iconText}>{getIconoCategoria(item.categoria)}</Text>
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>{item.titulo}</Text>
                        <Text style={styles.category}>{item.categoria.toUpperCase()}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {/* Botón Eliminar (Solo Admin/Consejo/Formador/Animador) */}
                        {puedeAgregar && (
                            <TouchableOpacity
                                onPress={() => eliminarCanto(item._id)}
                                style={styles.deleteButton}
                            >
                                <Text style={styles.deleteIcon}>🗑️</Text>
                            </TouchableOpacity>
                        )}
                        <Text style={styles.arrow}>→</Text>
                    </View>
                </View>
            </Card>
        </TouchableOpacity>
    );

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
                        <Text style={styles.headerTitle}>Cancionero</Text>
                        <Text style={styles.headerSubtitle}>Alabanza y Adoración</Text>
                    </View>
                </View>
                {puedeAgregar && (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('CrearCanto')}
                    >
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                )}
            </LinearGradient>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar canto..."
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            <View style={styles.categoriesContainer}>
                <FlatList
                    data={categorias}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.categoryChip,
                                selectedCategory === item.id && styles.categoryChipSelected
                            ]}
                            onPress={() => setSelectedCategory(item.id)}
                        >
                            <Text style={[
                                styles.categoryText,
                                selectedCategory === item.id && styles.categoryTextSelected
                            ]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.categoriesList}
                />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={filteredCantos}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>🎵</Text>
                            <Text style={styles.emptyText}>No se encontraron cantos</Text>
                        </View>
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
    searchContainer: {
        padding: SPACING.md,
        backgroundColor: COLORS.white,
        margin: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        ...SHADOWS.small,
    },
    searchInput: {
        fontSize: FONT_SIZES.md,
        color: COLORS.black,
    },
    categoriesContainer: {
        height: 50,
    },
    categoriesList: {
        paddingHorizontal: SPACING.md,
        alignItems: 'center',
    },
    categoryChip: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        marginRight: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    categoryChipSelected: {
        backgroundColor: COLORS.primary,
    },
    categoryText: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    categoryTextSelected: {
        color: COLORS.white,
    },
    list: {
        padding: SPACING.lg,
    },
    card: {
        marginBottom: SPACING.sm,
        padding: SPACING.md,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.offWhite,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    iconText: {
        fontSize: 20,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    category: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.gray,
    },
    arrow: {
        fontSize: FONT_SIZES.lg,
        color: COLORS.gray,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyIcon: {
        fontSize: 50,
        marginBottom: SPACING.md,
        opacity: 0.5,
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.gray,
        fontSize: FONT_SIZES.md,
    },
    deleteButton: {
        padding: SPACING.xs,
        marginRight: SPACING.xs,
    },
    deleteIcon: {
        fontSize: 20,
    },
});

export default CancioneroScreen;
