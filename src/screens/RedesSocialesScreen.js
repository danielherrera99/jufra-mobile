import React, { useState, useEffect, useMemo } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TouchableOpacity, 
    ActivityIndicator, Modal, Image, Linking, Dimensions, Alert 
} from 'react-native';
import { LineChart, StackedBarChart } from "react-native-chart-kit";
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import api, { API_URL } from '../config/api';

const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    let baseUrl = API_URL.replace('/api', '');
    return `${baseUrl}${url}`;
};

const RedesSocialesScreen = ({ navigation }) => {
    const [metricas, setMetricas] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [modalVisible, setModalVisible] = useState(false);
    const [plataformaActiva, setPlataformaActiva] = useState(null);
    const [posts, setPosts] = useState([]);
    const [topPosts, setTopPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(false);

    useEffect(() => {
        const fetchMetricas = async () => {
            try {
                const res = await api.get('/metricas-sociales');
                const topRes = await api.get('/metricas-sociales/top').catch(() => ({ data: { data: [] } }));
                if (res.data?.data) {
                    setMetricas(res.data.data);
                }
                if (topRes.data?.data) {
                    setTopPosts(topRes.data.data);
                }
            } catch (error) {
                console.error('Error fetching metricas:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMetricas();
    }, []);

    const chartDataObj = useMemo(() => {
        if (!metricas || Object.keys(metricas).length === 0) return [];
        
        const dataByDate = {};
        
        Object.keys(metricas).forEach(plataforma => {
            if (!metricas[plataforma]) return;
            metricas[plataforma].forEach(m => {
                if (!m.fecha) return;
                const dateLabel = m.fecha.length >= 10 ? `${m.fecha.substring(8, 10)}/${m.fecha.substring(5, 7)}` : m.fecha;
                const timestamp = new Date(m.fecha).getTime();
                
                if (!dataByDate[dateLabel]) {
                    dataByDate[dateLabel] = { name: dateLabel, timestamp };
                }
                dataByDate[dateLabel][`${plataforma}_seguidores`] = m.seguidores || 0;
                dataByDate[dateLabel][`${plataforma}_alcance`] = m.alcance || 0;
                dataByDate[dateLabel][`${plataforma}_interacciones`] = m.interacciones || 0;
            });
        });
        
        // Take last 6 days for mobile screen size
        return Object.values(dataByDate).sort((a, b) => a.timestamp - b.timestamp).slice(-6);
    }, [metricas]);

    const openPostsModal = async (plataforma) => {
        setPlataformaActiva(plataforma);
        setPosts([]);
        setLoadingPosts(true);
        setModalVisible(true);
        
        try {
            const res = await api.get(`/metricas-sociales/publicaciones/${plataforma}`);
            if (res.data?.success) {
                setPosts(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoadingPosts(false);
        }
    };

    const getLatestMetric = (platform) => {
        if (metricas && metricas[platform] && metricas[platform].length > 0) {
            return metricas[platform][metricas[platform].length - 1];
        }
        return { seguidores: 0, interacciones: 0, alcance: 0 };
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
    };

    const screenWidth = Dimensions.get("window").width;

    const renderCard = (plataforma, titulo, color, icon, metric, label2, label3) => {
        const data = getLatestMetric(plataforma);
        
        return (
            <TouchableOpacity 
                style={[styles.card, { borderLeftColor: color, borderLeftWidth: 5, flexDirection: 'row', alignItems: 'center' }]}
                onPress={() => openPostsModal(plataforma)}
            >
                <Text style={styles.cardIcon}>{icon}</Text>
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{titulo}</Text>
                    <Text style={[styles.cardNumber, { color }]}>{data.seguidores}</Text>
                    <Text style={styles.cardSubtext}>
                        {label2}: {data.interacciones} | {label3}: {data.alcance}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Impacto Digital</Text>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Cargando métricas...</Text>
                </View>
            ) : (
                <ScrollView style={styles.content}>
                    {renderCard('tiktok', 'TIKTOK (SEGUIDORES)', '#000000', '🎵', 'seguidores', '❤ Me gusta', '📹 Videos')}
                    {renderCard('instagram', 'INSTAGRAM (SEGUIDORES)', '#E1306C', '📸', 'seguidores', '📷 Posts', 'Alcance')}
                    {renderCard('youtube', 'YOUTUBE (SUSCRIPTORES)', '#EF4444', '🔴', 'seguidores', '📹 Videos', '👁️ Vistas')}
                    {renderCard('facebook', 'FACEBOOK (SEGUIDORES)', '#3B82F6', '📘', 'seguidores', 'Alcance', 'Interacciones')}
                    
                    {/* Tarjeta Web - Solo informativa */}
                    <View style={[styles.card, { borderLeftColor: '#22C55E', borderLeftWidth: 5, marginBottom: SPACING.xl }]}>
                        <Text style={styles.cardIcon}>🌐</Text>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle}>VISITAS WEB (30 DÍAS)</Text>
                            <Text style={[styles.cardNumber, { color: '#22C55E' }]}>
                                {metricas?.web?.length > 0 ? metricas.web[metricas.web.length - 1].alcance : 0}
                            </Text>
                        </View>
                    </View>

                    {chartDataObj.length > 1 && (
                        <View style={{ marginBottom: 40 }}>
                            <Text style={styles.sectionTitle}>📈 Evolución de Seguidores</Text>
                            <View style={styles.chartContainer}>
                                <LineChart
                                    data={{
                                        labels: chartDataObj.map(d => d.name),
                                        datasets: [
                                            { data: chartDataObj.map(d => d.facebook_seguidores || 0), color: () => '#3B82F6', name: 'Facebook' },
                                            { data: chartDataObj.map(d => d.instagram_seguidores || 0), color: () => '#E1306C', name: 'Instagram' },
                                            { data: chartDataObj.map(d => d.tiktok_seguidores || 0), color: () => '#000000', name: 'TikTok' },
                                            { data: chartDataObj.map(d => d.youtube_seguidores || 0), color: () => '#EF4444', name: 'YouTube' }
                                        ],
                                        legend: ["FB", "IG", "TK", "YT"]
                                    }}
                                    width={screenWidth - SPACING.lg * 2}
                                    height={220}
                                    onDataPointClick={({ value, dataset, index }) => {
                                        Alert.alert(dataset.name || 'Dato', `Fecha: ${chartDataObj[index]?.name || ''}\nSeguidores: ${value}`);
                                    }}
                                    chartConfig={{
                                        backgroundColor: COLORS.white,
                                        backgroundGradientFrom: COLORS.white,
                                        backgroundGradientTo: COLORS.white,
                                        decimalPlaces: 0,
                                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                        style: { borderRadius: 16 }
                                    }}
                                    bezier
                                    style={{ marginVertical: 8, borderRadius: 16 }}
                                />
                            </View>

                            <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>📊 Alcance y Vistas</Text>
                            <View style={styles.chartContainer}>
                                <StackedBarChart
                                    data={{
                                        labels: chartDataObj.map(d => d.name),
                                        legend: ["FB", "Web", "YT"],
                                        data: chartDataObj.map(d => [d.facebook_alcance || 0, d.web_alcance || 0, d.youtube_alcance || 0]),
                                        barColors: ["#3B82F6", "#22C55E", "#EF4444"]
                                    }}
                                    width={screenWidth - SPACING.lg * 2}
                                    height={220}
                                    chartConfig={{
                                        backgroundColor: COLORS.white,
                                        backgroundGradientFrom: COLORS.white,
                                        backgroundGradientTo: COLORS.white,
                                        decimalPlaces: 0,
                                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                    }}
                                    style={{ marginVertical: 8, borderRadius: 16 }}
                                />
                            </View>

                            <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>❤️ Evolución de Interacciones</Text>
                            <View style={styles.chartContainer}>
                                <LineChart
                                    data={{
                                        labels: chartDataObj.map(d => d.name),
                                        datasets: [
                                            { data: chartDataObj.map(d => d.facebook_interacciones || 0), color: () => '#3B82F6', name: 'Facebook' },
                                            { data: chartDataObj.map(d => d.instagram_interacciones || 0), color: () => '#E1306C', name: 'Instagram' },
                                            { data: chartDataObj.map(d => d.tiktok_interacciones || 0), color: () => '#000000', name: 'TikTok' },
                                            { data: chartDataObj.map(d => d.youtube_interacciones || 0), color: () => '#EF4444', name: 'YouTube' }
                                        ],
                                        legend: ["FB", "IG", "TK", "YT"]
                                    }}
                                    width={screenWidth - SPACING.lg * 2}
                                    height={220}
                                    onDataPointClick={({ value, dataset, index }) => {
                                        Alert.alert(dataset.name || 'Dato', `Fecha: ${chartDataObj[index]?.name || ''}\nInteracciones: ${value}`);
                                    }}
                                    chartConfig={{
                                        backgroundColor: COLORS.white,
                                        backgroundGradientFrom: COLORS.white,
                                        backgroundGradientTo: COLORS.white,
                                        decimalPlaces: 0,
                                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                        style: { borderRadius: 16 }
                                    }}
                                    bezier
                                    style={{ marginVertical: 8, borderRadius: 16 }}
                                />
                            </View>
                        </View>
                    )}
                </ScrollView>
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Posts de {plataformaActiva}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text style={styles.closeButton}>❌</Text>
                            </TouchableOpacity>
                        </View>

                        {loadingPosts ? (
                            <View style={styles.centerContainer}>
                                <ActivityIndicator size="large" color={COLORS.primary} />
                                <Text style={styles.loadingText}>Cargando publicaciones...</Text>
                            </View>
                        ) : posts.length === 0 ? (
                            <View style={styles.centerContainer}>
                                <Text style={styles.loadingText}>No hay publicaciones guardadas.</Text>
                            </View>
                        ) : (
                            <ScrollView style={styles.postsList}>
                                {posts.map(post => (
                                    <View key={post.post_id} style={styles.postItem}>
                                        {post.imagen_url ? (
                                            <Image source={{ uri: getImageUrl(post.imagen_url) }} style={styles.postImage} />
                                        ) : (
                                            <View style={styles.noImagePlaceholder}><Text style={{ color: COLORS.gray }}>Sin Imagen</Text></View>
                                        )}
                                        <Text style={styles.postTitle} numberOfLines={3}>{post.titulo}</Text>
                                        <Text style={styles.postDate}>{formatDate(post.fecha_publicacion)}</Text>
                                        <View style={styles.postStats}>
                                            <Text style={styles.statText}>👁️ {post.vistas}</Text>
                                            <Text style={styles.statText}>👍 {post.likes}</Text>
                                            <Text style={styles.statText}>💬 {post.comentarios}</Text>
                                        </View>
                                        <TouchableOpacity 
                                            style={styles.openBtn}
                                            onPress={() => Linking.openURL(post.url)}
                                        >
                                            <Text style={styles.openBtnText}>Ver Original</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        )}
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
        padding: SPACING.md,
        paddingTop: SPACING.xl,
        backgroundColor: COLORS.primary,
    },
    backButton: {
        padding: SPACING.sm,
    },
    backButtonText: {
        color: COLORS.white,
        fontSize: FONT_SIZES.xl,
    },
    headerTitle: {
        color: COLORS.white,
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        marginLeft: SPACING.sm,
    },
    content: {
        flex: 1,
        padding: SPACING.lg,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 50,
    },
    loadingText: {
        marginTop: 10,
        color: COLORS.gray,
    },
    sectionTitle: {
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: SPACING.md,
        marginLeft: 4,
    },
    chartContainer: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.md,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardIcon: {
        fontSize: 40,
        marginRight: SPACING.md,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.gray,
        marginBottom: 5,
    },
    cardNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    cardSubtext: {
        fontSize: 12,
        color: COLORS.gray,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '80%',
        padding: SPACING.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        paddingBottom: SPACING.sm,
    },
    modalTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.primary,
        textTransform: 'capitalize',
    },
    closeButton: {
        fontSize: 20,
    },
    postsList: {
        flex: 1,
    },
    postItem: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    postImage: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginBottom: SPACING.sm,
    },
    noImagePlaceholder: {
        width: '100%',
        height: 150,
        backgroundColor: '#E5E7EB',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    postTitle: {
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
        color: COLORS.darkGray,
        marginBottom: 4,
    },
    postDate: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.gray,
        marginBottom: SPACING.sm,
    },
    postStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },
    statText: {
        color: COLORS.darkGray,
        fontSize: FONT_SIZES.sm,
    },
    openBtn: {
        backgroundColor: COLORS.primary,
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
    },
    openBtnText: {
        color: COLORS.white,
        fontWeight: 'bold',
    }
});

export default RedesSocialesScreen;
