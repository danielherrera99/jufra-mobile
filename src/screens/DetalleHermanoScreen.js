import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Linking,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import Card from '../components/Card';
import Button from '../components/Button';
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

const DetalleHermanoScreen = ({ navigation, route }) => {
    const { hermano } = route.params;

    const formatDate = (dateString) => {
        if (!dateString) return 'No registrada';
        return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es });
    };

    const handleCall = () => {
        if (hermano.telefono) {
            Linking.openURL(`tel:${hermano.telefono}`);
        }
    };

    const handleWhatsApp = () => {
        if (hermano.telefono) {
            Linking.openURL(`https://wa.me/${hermano.telefono.replace(/\D/g, '')}`);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView bounces={false}>
                {/* Header con Foto */}
                <View style={styles.headerContainer}>
                    <LinearGradient
                        colors={[COLORS.primary, COLORS.secondary]}
                        style={styles.headerBackground}
                    />
                    <View style={styles.profileImageContainer}>
                        {hermano.foto ? (
                            <Image source={{ uri: getSafeImageUrl(hermano.foto) }} style={styles.profileImage} />
                        ) : (
                            <View style={[styles.profileImage, styles.placeholderImage]}>
                                <Text style={styles.placeholderText}>
                                    {hermano.nombre[0]}{hermano.apellido[0]}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.contentContainer}>
                    {/* Nombre y Cargo */}
                    <View style={styles.titleSection}>
                        <Text style={styles.name}>{hermano.nombre} {hermano.apellido}</Text>
                        <View style={styles.badgesContainer}>
                            <View style={[styles.badge, styles.badgeEtapa]}>
                                <Text style={styles.badgeText}>
                                    {hermano.etapaFormacion.replace('_', ' ')}
                                </Text>
                            </View>
                            {hermano.cargo !== 'ninguno' && (
                                <View style={[styles.badge, styles.badgeCargo]}>
                                    <Text style={styles.badgeText}>
                                        {hermano.cargo.replace('_', ' ')}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Acciones Rápidas */}
                    <View style={styles.actionsRow}>
                        {hermano.telefono && (
                            <>
                                <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
                                    <View style={[styles.actionIconContainer, { backgroundColor: '#E3F2FD' }]}>
                                        <Text style={styles.actionIcon}>📞</Text>
                                    </View>
                                    <Text style={styles.actionLabel}>Llamar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionButton} onPress={handleWhatsApp}>
                                    <View style={[styles.actionIconContainer, { backgroundColor: '#E8F5E9' }]}>
                                        <Text style={styles.actionIcon}>💬</Text>
                                    </View>
                                    <Text style={styles.actionLabel}>WhatsApp</Text>
                                </TouchableOpacity>
                            </>
                        )}
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => navigation.navigate('Chat', {
                                usuarioId: hermano._id,
                                nombre: `${hermano.nombre} ${hermano.apellido}`
                            })}
                        >
                            <View style={[styles.actionIconContainer, { backgroundColor: '#E0F7FA' }]}>
                                <Text style={styles.actionIcon}>✉️</Text>
                            </View>
                            <Text style={styles.actionLabel}>Mensaje</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Información Personal */}
                    <Card style={styles.infoCard}>
                        <Text style={styles.sectionTitle}>Información Personal</Text>

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Usuario:</Text>
                            <Text style={styles.value}>@{hermano.username}</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Correo:</Text>
                            <Text style={styles.value}>{hermano.email || 'No registrado'}</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Teléfono:</Text>
                            <Text style={styles.value}>{hermano.telefono || 'No registrado'}</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Cumpleaños:</Text>
                            <Text style={styles.value}>{formatDate(hermano.fechaNacimiento)}</Text>
                        </View>
                    </Card>

                    {/* Información JUFRA */}
                    <Card style={styles.infoCard}>
                        <Text style={styles.sectionTitle}>Vida en Fraternidad</Text>

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Fecha de Ingreso:</Text>
                            <Text style={styles.value}>{formatDate(hermano.fechaIngreso)}</Text>
                        </View>

                        {hermano.fechaPromesa && (
                            <>
                                <View style={styles.divider} />
                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>Fecha de Promesa:</Text>
                                    <Text style={styles.value}>{formatDate(hermano.fechaPromesa)}</Text>
                                </View>
                            </>
                        )}

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Estado:</Text>
                            <View style={[styles.statusBadge, hermano.activo ? styles.statusActive : styles.statusInactive]}>
                                <Text style={[styles.statusText, hermano.activo ? styles.textActive : styles.textInactive]}>
                                    {hermano.activo ? 'Activo' : 'Inactivo'}
                                </Text>
                            </View>
                        </View>
                    </Card>

                    <Button
                        title="Volver"
                        onPress={() => navigation.goBack()}
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
    contentContainer: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xl,
    },
    titleSection: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
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
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: SPACING.xl,
    },
    actionButton: {
        alignItems: 'center',
        marginHorizontal: SPACING.lg,
    },
    actionIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    actionIcon: {
        fontSize: 24,
    },
    actionLabel: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.gray,
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
});

export default DetalleHermanoScreen;
