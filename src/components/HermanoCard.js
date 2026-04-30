import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Card from './Card';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants/theme';
import { API_URL } from '../config/api';

const getSafeImageUrl = (url) => {
    if (!url) return null;
    let safeUrl = String(url).replace('http://localhost:5000', API_URL.replace('/api', '').replace('/api', ''))
                     .replace('http://127.0.0.1:5000', API_URL.replace('/api', '').replace('/api', ''))
                     .replace('http://', 'https://');
    return safeUrl;
};

const HermanoCard = ({ hermano, usuario, esAdmin, filtroEstado, navigation, onAprobar, onRechazar }) => {
    const item = hermano;
    
    const añosEnJufra = item.fechaIngreso
        ? new Date().getFullYear() - new Date(item.fechaIngreso).getFullYear()
        : 0;

    const edad = item.fechaNacimiento
        ? new Date().getFullYear() - new Date(item.fechaNacimiento).getFullYear()
        : null;

    return (
        <TouchableOpacity
            onPress={() => navigation.navigate('DetalleHermano', { hermano: item })}
            activeOpacity={0.8}
        >
            <Card style={styles.hermanoCard}>
                <View style={styles.hermanoContent}>
                    {/* Avatar */}
                    <View style={styles.avatarContainer}>
                        {item.foto ? (
                            <Image source={{ uri: getSafeImageUrl(item.foto) }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>
                                    {item.nombre[0]}{item.apellido[0]}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Información */}
                    <View style={styles.hermanoInfo}>
                        <Text style={styles.hermanoNombre}>
                            {item.nombre} {item.apellido}
                        </Text>

                        <View style={styles.badges}>
                            <View style={[styles.badge, styles.badgeEtapa]}>
                                <Text style={styles.badgeText}>
                                    {item.etapaFormacion.replace('_', ' ')}
                                </Text>
                            </View>

                            {item.cargo !== 'ninguno' && (
                                <View style={[styles.badge, styles.badgeCargo]}>
                                    <Text style={styles.badgeText}>
                                        {item.cargo.replace('_', ' ')}
                                    </Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.statsContainer}>
                            {edad !== null && (
                                <Text style={styles.statText}>
                                    🎂 {edad} años
                                </Text>
                            )}
                            {añosEnJufra > 0 && (
                                <Text style={styles.statText}>
                                    🕊️ {añosEnJufra} {añosEnJufra === 1 ? 'año' : 'años'} en JUFRA
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Acciones */}
                    <View style={styles.actionsContainer}>
                        {/* Botón Mensaje (Para todos, excepto uno mismo y pendientes) */}
                        {filtroEstado !== 'pendientes' && item._id !== usuario._id && (
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Chat', {
                                    usuarioId: item._id,
                                    nombre: `${item.nombre} ${item.apellido}`
                                })}
                                style={[styles.actionButton, { marginRight: 8 }]}
                            >
                                <Text style={styles.actionIcon}>✉️</Text>
                            </TouchableOpacity>
                        )}

                        {filtroEstado === 'pendientes' ? (
                            <View style={{ flexDirection: 'row' }}>
                                <TouchableOpacity
                                    onPress={onAprobar}
                                    style={[styles.actionButton, styles.approveButton]}
                                >
                                    <Text style={styles.actionIcon}>✅</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={onRechazar}
                                    style={[styles.actionButton, styles.rejectButton]}
                                >
                                    <Text style={styles.actionIcon}>❌</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            esAdmin && (
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('EditarHermano', { hermano: item })}
                                    style={styles.actionButton}
                                >
                                    <Text style={styles.actionIcon}>✏️</Text>
                                </TouchableOpacity>
                            )
                        )}
                    </View>
                </View>
            </Card>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    hermanoCard: {
        marginBottom: SPACING.md,
    },
    hermanoContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        marginRight: SPACING.md,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    avatarPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    hermanoInfo: {
        flex: 1,
    },
    hermanoNombre: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.black,
        marginBottom: SPACING.xs,
    },
    badges: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: SPACING.xs,
    },
    badge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
        marginRight: SPACING.xs,
        marginBottom: SPACING.xs,
    },
    badgeEtapa: {
        backgroundColor: COLORS.tertiary,
    },
    badgeCargo: {
        backgroundColor: COLORS.gold,
    },
    badgeText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.white,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    statsContainer: {
        marginTop: SPACING.xs,
    },
    statText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.gray,
        marginBottom: 2,
    },
    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        padding: SPACING.sm,
        marginLeft: SPACING.xs,
    },
    actionIcon: {
        fontSize: 24,
    },
    approveButton: {
        backgroundColor: '#E8F5E9',
        borderRadius: 20,
    },
    rejectButton: {
        backgroundColor: '#FFEBEE',
        borderRadius: 20,
    },
});

export default HermanoCard;
