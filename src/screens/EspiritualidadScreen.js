import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';

const EspiritualidadScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('oracion');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { esConsejoActivo } = useAuth();

    useEffect(() => {
        cargarItems();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            cargarItems();
        });
        return unsubscribe;
    }, [navigation]);

    const cargarItems = async () => {
        try {
            const response = await api.get('/espiritualidad');
            if (response.data.success) {
                setItems(response.data.items);
            }
        } catch (error) {
            console.error('Error al cargar espiritualidad:', error);
        } finally {
            setLoading(false);
        }
    };

    const eliminarItem = (id) => {
        Alert.alert(
            'Eliminar',
            '¿Estás seguro de eliminar este contenido?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/espiritualidad/${id}`);
                            cargarItems();
                        } catch (error) {
                            console.error(error);
                            Alert.alert('Error', 'No se pudo eliminar');
                        }
                    }
                }
            ]
        );
    };

    const renderContent = () => {
        const filtered = items.filter(i => i.tipo === activeTab);

        if (loading) {
            return <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />;
        }

        if (filtered.length === 0) {
            return <Text style={styles.emptyText}>No hay contenido disponible en esta sección.</Text>;
        }

        return filtered.map((item) => (
            <View key={item._id} style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.titulo}</Text>
                    {esConsejoActivo && (
                        <View style={styles.actions}>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('CrearEspiritualidad', { item })}
                                style={styles.actionButton}
                            >
                                <Text style={styles.actionIcon}>✏️</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => eliminarItem(item._id)}
                                style={styles.actionButton}
                            >
                                <Text style={styles.actionIcon}>🗑️</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
                <Text style={styles.cardContent}>{item.contenido}</Text>
            </View>
        ));
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.tertiary, COLORS.primary]}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Espíritu</Text>

                    {esConsejoActivo && (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('CrearEspiritualidad')}
                            style={styles.addButton}
                        >
                            <Text style={styles.addIcon}>+</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>

            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'oracion' && styles.activeTab]}
                    onPress={() => setActiveTab('oracion')}
                >
                    <Text style={[styles.tabText, activeTab === 'oracion' && styles.activeTabText]}>
                        Oraciones
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'carisma' && styles.activeTab]}
                    onPress={() => setActiveTab('carisma')}
                >
                    <Text style={[styles.tabText, activeTab === 'carisma' && styles.activeTabText]}>
                        Carisma
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {renderContent()}
                <View style={styles.footerSpace} />
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
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: SPACING.xs,
    },
    backIcon: {
        fontSize: 24,
        color: COLORS.white,
    },
    headerTitle: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.white,
        flex: 1,
        textAlign: 'center',
        marginLeft: -SPACING.xl,
    },
    addButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addIcon: {
        fontSize: 24,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        padding: SPACING.xs,
        margin: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        ...SHADOWS.small,
    },
    tab: {
        flex: 1,
        paddingVertical: SPACING.md,
        alignItems: 'center',
        borderRadius: BORDER_RADIUS.md,
    },
    activeTab: {
        backgroundColor: COLORS.tertiary,
    },
    tabText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.gray,
        fontWeight: '600',
    },
    activeTabText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    content: {
        paddingHorizontal: SPACING.lg,
    },
    card: {
        backgroundColor: COLORS.white,
        padding: SPACING.xl,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.lg,
        ...SHADOWS.medium,
    },
    cardHeader: {
        marginBottom: SPACING.md,
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.primary,
        textAlign: 'center',
    },
    actions: {
        flexDirection: 'row',
        marginTop: SPACING.xs,
        justifyContent: 'center',
    },
    actionButton: {
        padding: SPACING.xs,
        marginHorizontal: SPACING.xs,
    },
    actionIcon: {
        fontSize: 18,
    },
    cardContent: {
        fontSize: FONT_SIZES.md,
        color: COLORS.darkGray,
        lineHeight: 26,
        textAlign: 'justify',
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.gray,
        marginTop: SPACING.xl,
    },
    footerSpace: {
        height: 40,
    },
});

export default EspiritualidadScreen;
