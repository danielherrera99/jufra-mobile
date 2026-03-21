import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Card from '../components/Card';

const FormacionScreen = ({ navigation }) => {
    const { usuario, esConsejoActivo } = useAuth();
    const [temas, setTemas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        cargarTemas();
    }, []);

    const cargarTemas = async () => {
        try {
            const response = await api.get('/formacion');
            if (response.data.success) {
                setTemas(response.data.temas);
            }
        } catch (error) {
            console.error('Error al cargar temas:', error);
            Alert.alert('Error', 'No se pudieron cargar los temas de formación');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        cargarTemas();
    };

    const eliminarTema = (id) => {
        Alert.alert(
            'Eliminar Tema',
            '¿Estás seguro de que deseas eliminar este tema de formación?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/formacion/${id}`);
                            Alert.alert('Éxito', 'Tema eliminado correctamente');
                            cargarTemas();
                        } catch (error) {
                            console.error('Error al eliminar tema:', error);
                            Alert.alert('Error', 'No se pudo eliminar el tema');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('DetalleFormacion', { temaId: item._id })}
            activeOpacity={0.8}
        >
            <Card style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.iconContainer}>
                        <Image
                            source={require('../../assets/logojufra.png')}
                            style={styles.iconImage}
                            resizeMode="contain"
                        />
                    </View>
                    <View style={styles.headerText}>
                        <Text style={styles.title}>{item.titulo}</Text>
                        <Text style={styles.date}>
                            {format(new Date(item.fecha), "d 'de' MMMM, yyyy", { locale: es })}
                        </Text>
                    </View>

                    {/* Botón Eliminar (Solo Consejo Activo) */}
                    {esConsejoActivo && (
                        <TouchableOpacity
                            onPress={() => eliminarTema(item._id)}
                            style={styles.deleteButton}
                        >
                            <Text style={styles.deleteIcon}>🗑️</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {item.descripcion && (
                    <Text style={styles.description} numberOfLines={2}>
                        {item.descripcion}
                    </Text>
                )}

                <View style={styles.footer}>
                    <Text style={styles.author}>Por: {item.autor?.nombre} {item.autor?.apellido}</Text>
                    <Text style={styles.readMore}>Leer tema →</Text>
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
                        <Text style={styles.headerTitle}>Formación</Text>
                        <Text style={styles.headerSubtitle}>Crecimiento Franciscano</Text>
                    </View>
                </View>
                {esConsejoActivo && (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('CrearFormacion')}
                    >
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                )}
            </LinearGradient>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={temas}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.list}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>📚</Text>
                            <Text style={styles.emptyText}>No hay temas de formación aún</Text>
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
    iconImage: {
        width: 30,
        height: 30,
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 2,
    },
    date: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.gray,
    },
    description: {
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
        marginLeft: SPACING.sm,
    },
    deleteIcon: {
        fontSize: 20,
    },
});

export default FormacionScreen;
