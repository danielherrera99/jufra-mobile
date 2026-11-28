import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    RefreshControl,
    Alert,
    Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { API_URL } from '../config/api';

const getSafeImageUrl = (url) => {
    if (!url) return null;
    let safeUrl = String(url).replace('http://localhost:5000', API_URL.replace('/api', '').replace('/api', ''))
                     .replace('http://127.0.0.1:5000', API_URL.replace('/api', '').replace('/api', ''))
                     .replace('http://', 'https://');
    return safeUrl;
};

const PerfilScreen = ({ navigation }) => {
    const { usuario, actualizarUsuario } = useAuth();
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [perfilData, setPerfilData] = useState(usuario);
    const [walletLoading, setWalletLoading] = useState(false);

    const handleGoogleWallet = async () => {
        setWalletLoading(true);
        try {
            const response = await api.get('/auth/wallet-pass');
            if (response.data?.isConfigured && response.data?.saveUrl) {
                Linking.openURL(response.data.saveUrl).catch(() => {
                    Alert.alert('Google Wallet', 'No se pudo abrir el enlace en Google Wallet.');
                });
            } else {
                Alert.alert(
                    '📱 Google Wallet Pass (JUFRA)',
                    `¡Paz y Bien, hermano(a) ${perfilData?.nombre || ''}!\n\nTu carnet digital con TAU franciscana, QR de asistencia y geofencing para tu parroquia está configurado.\n\nPara activarlo en vivo en la app Google Wallet, el administrador nacional debe configurar las credenciales de Google Cloud en el servidor.`,
                    [{ text: 'Entendido' }]
                );
            }
        } catch (err) {
            Alert.alert('Google Wallet', 'No se pudo conectar con el servicio de credenciales en este momento.');
        } finally {
            setWalletLoading(false);
        }
    };

    const cargarPerfil = async () => {
        try {
            const response = await api.get('/auth/perfil');
            if (response.data.success) {
                setPerfilData(response.data.usuario);
                // Actualizar contexto si es necesario
                actualizarUsuario(response.data.usuario);
            }
        } catch (error) {
            console.error('Error al cargar perfil:', error);
        } finally {
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            cargarPerfil();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        cargarPerfil();
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No registrada';
        return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es });
    };

    return (
        <View style={styles.container}>
            <ScrollView
                bounces={true}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header con Foto */}
                <View style={styles.headerContainer}>
                    <LinearGradient
                        colors={[COLORS.primary, COLORS.secondary]}
                        style={styles.headerBackground}
                    />
                    <View style={styles.profileImageContainer}>
                        {perfilData?.foto ? (
                            <Image source={{ uri: getSafeImageUrl(perfilData.foto) }} style={styles.profileImage} />
                        ) : (
                            <View style={[styles.profileImage, styles.placeholderImage]}>
                                <Text style={styles.placeholderText}>
                                    {perfilData?.nombre?.[0]}{perfilData?.apellido?.[0]}
                                </Text>
                            </View>
                        )}
                        <TouchableOpacity
                            style={styles.editPhotoButton}
                            onPress={() => navigation.navigate('SubirFoto', {
                                origen: 'perfil',
                                id: perfilData._id
                            })}
                        >
                            <Text style={styles.editPhotoIcon}>📷</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.contentContainer}>
                    {/* Nombre y Cargo */}
                    <View style={styles.titleSection}>
                        <Text style={styles.name}>{perfilData?.nombre} {perfilData?.apellido}</Text>
                        <View style={styles.badgesContainer}>
                            <View style={[styles.badge, styles.badgeEtapa]}>
                                <Text style={styles.badgeText}>
                                    {perfilData?.etapaFormacion?.replace('_', ' ')}
                                </Text>
                            </View>
                            {perfilData?.cargo !== 'ninguno' && (
                                <View style={[styles.badge, styles.badgeCargo]}>
                                    <Text style={styles.badgeText}>
                                        {perfilData?.cargo?.replace('_', ' ')}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Botón Editar */}
                    <Button
                        title="Editar Mi Información"
                        onPress={() => navigation.navigate('EditarPerfil', { usuario: perfilData })}
                        style={styles.editButton}
                        icon={<Text style={{ fontSize: 18, marginRight: 8 }}>✏️</Text>}
                    />

                    {/* Información Personal */}
                    <Card style={styles.infoCard}>
                        <Text style={styles.sectionTitle}>Información Personal</Text>

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Usuario:</Text>
                            <Text style={styles.value}>@{perfilData?.username}</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Correo:</Text>
                            <Text style={styles.value}>{perfilData?.email || 'No registrado'}</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Teléfono:</Text>
                            <Text style={styles.value}>{perfilData?.telefono || 'No registrado'}</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Cumpleaños:</Text>
                            <Text style={styles.value}>{formatDate(perfilData?.fechaNacimiento)}</Text>
                        </View>
                    </Card>

                    {/* Información JUFRA */}
                    <Card style={styles.infoCard}>
                        <Text style={styles.sectionTitle}>Vida en Fraternidad</Text>

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Fraternidad:</Text>
                            <Text style={[styles.value, { fontWeight: 'bold', color: COLORS.primary }]}>
                                📍 {perfilData?.fraternidadNombre || 'JUFRA Pomalca'}
                            </Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Fecha de Ingreso:</Text>
                            <Text style={styles.value}>{formatDate(perfilData?.fechaIngreso)}</Text>
                        </View>

                        {perfilData?.fechaPromesa && (
                            <>
                                <View style={styles.divider} />
                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>Fecha de Promesa:</Text>
                                    <Text style={styles.value}>{formatDate(perfilData?.fechaPromesa)}</Text>
                                </View>
                            </>
                        )}

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Estado:</Text>
                            <View style={[styles.statusBadge, perfilData?.activo ? styles.statusActive : styles.statusInactive]}>
                                <Text style={[styles.statusText, perfilData?.activo ? styles.textActive : styles.textInactive]}>
                                    {perfilData?.activo ? 'Activo' : 'Inactivo'}
                                </Text>
                            </View>
                        </View>
                    </Card>

                    <TouchableOpacity
                        style={styles.walletButton}
                        onPress={handleGoogleWallet}
                        disabled={walletLoading}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.walletIcon}>💳</Text>
                        <Text style={styles.walletText}>
                            {walletLoading ? 'Generando pase...' : 'Añadir a Google Wallet'}
                        </Text>
                    </TouchableOpacity>

                    <Button
                        title="Volver al Inicio"
                        onPress={() => navigation.navigate('Home')}
                        variant="outline"
                        style={styles.backButton}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.cream,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 60,
    },
    headerBackground: {
        width: '100%',
        height: 150,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    profileImageContainer: {
        position: 'absolute',
        bottom: -50,
        ...SHADOWS.medium,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: COLORS.white,
    },
    placeholderImage: {
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 40,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    editPhotoButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.secondary,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    editPhotoIcon: {
        fontSize: 16,
    },
    contentContainer: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xl,
    },
    titleSection: {
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    name: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: SPACING.sm,
        textAlign: 'center',
    },
    badgesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    badge: {
        paddingHorizontal: SPACING.md,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.xl,
        marginHorizontal: 4,
    },
    badgeEtapa: {
        backgroundColor: COLORS.tertiary,
    },
    badgeCargo: {
        backgroundColor: COLORS.gold,
    },
    badgeText: {
        color: COLORS.white,
        fontSize: FONT_SIZES.xs,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    editButton: {
        marginBottom: SPACING.lg,
    },
    infoCard: {
        marginBottom: SPACING.lg,
        padding: SPACING.lg,
    },
    sectionTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: SPACING.md,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.xs,
    },
    label: {
        fontSize: FONT_SIZES.md,
        color: COLORS.gray,
    },
    value: {
        fontSize: FONT_SIZES.md,
        color: COLORS.black,
        fontWeight: '500',
        flex: 1,
        textAlign: 'right',
        marginLeft: SPACING.md,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.lightGray,
        marginVertical: SPACING.sm,
    },
    statusBadge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusActive: {
        backgroundColor: '#E8F5E9',
    },
    statusInactive: {
        backgroundColor: '#FFEBEE',
    },
    statusText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: 'bold',
    },
    textActive: {
        color: '#2E7D32',
    },
    textInactive: {
        color: '#C62828',
    },
    backButton: {
        marginTop: SPACING.md,
    },
    walletButton: {
        backgroundColor: '#1E293B',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: BORDER_RADIUS.xl,
        marginTop: SPACING.sm,
        marginBottom: SPACING.xs,
        gap: 8,
        ...SHADOWS.small,
    },
    walletIcon: {
        fontSize: 18,
    },
    walletText: {
        color: '#FFFFFF',
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
    },
});

export default PerfilScreen;
