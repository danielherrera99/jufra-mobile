import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import Card from '../components/Card';

const DocumentosScreen = ({ navigation }) => {
    const { usuario, esConsejoActivo } = useAuth();
    const [documentos, setDocumentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        cargarDocumentos();
    }, []);

    const cargarDocumentos = async () => {
        try {
            const response = await api.get('/documentos');
            if (response.data.success) {
                setDocumentos(response.data.documentos);
            }
        } catch (error) {
            console.error('Error al cargar documentos:', error);
            Alert.alert('Error', 'No se pudieron cargar los documentos');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        cargarDocumentos();
    };

    const getIconoTipo = (tipo) => {
        switch (tipo) {
            case 'regla': return '📜';
            case 'ccgg': return '⚖️';
            case 'estatuto': return '🏛️';
            case 'formacion': return '📚';
            default: return '📄';
        }
    };

    const getNombreTipo = (tipo) => {
        switch (tipo) {
            case 'regla': return 'Regla JUFRA';
            case 'ccgg': return 'Const. Generales';
            case 'estatuto': return 'Estatuto Nacional';
            case 'formacion': return 'Material Formativo';
            default: return 'Documento';
        }
    };

    const eliminarDocumento = (id) => {
        Alert.alert(
            'Eliminar Documento',
            '¿Estás seguro de que deseas eliminar este documento?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/documentos/${id}`);
                            Alert.alert('Éxito', 'Documento eliminado correctamente');
                            cargarDocumentos();
                        } catch (error) {
                            console.error('Error al eliminar documento:', error);
                            Alert.alert('Error', 'No se pudo eliminar el documento');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('DetalleDocumento', { documentoId: item._id })}
            activeOpacity={0.8}
        >
            <Card style={styles.card}>
                <View style={styles.cardContent}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.iconText}>{getIconoTipo(item.tipo)}</Text>
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>{item.titulo}</Text>
                        <Text style={styles.type}>{getNombreTipo(item.tipo)}</Text>
                        {item.descripcion && (
                            <Text style={styles.description} numberOfLines={2}>
                                {item.descripcion}
                            </Text>
                        )}
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {/* Botón Eliminar (Solo Consejo Activo) */}
                        {esConsejoActivo && (
                            <TouchableOpacity
                                onPress={() => eliminarDocumento(item._id)}
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
                        <Text style={styles.headerTitle}>Documentos</Text>
                        <Text style={styles.headerSubtitle}>Biblioteca Oficial</Text>
                    </View>
                </View>
                {esConsejoActivo && (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('CrearDocumento')}
                    >
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                )}
            </LinearGradient>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={documentos}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>📂</Text>
                            <Text style={styles.emptyText}>No hay documentos disponibles</Text>
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
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.offWhite,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    iconText: {
        fontSize: 24,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 2,
    },
    type: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.primary,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    description: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.gray,
    },
    arrow: {
        fontSize: FONT_SIZES.lg,
        color: COLORS.gray,
        marginLeft: SPACING.sm,
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

export default DocumentosScreen;
