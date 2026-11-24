import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const AdministracionFraternidadScreen = ({ navigation }) => {
    const { usuario } = useAuth();
    
    // Solo administradores pueden ver el inventario
    const esAdmin = ['admin', 'superadmin', 'admin_nacional'].includes(usuario?.rol);
    
    const menuItems = [
        {
            id: 'hermanos',
            titulo: 'Hermanos',
            icono: '👥',
            descripcion: 'Base de datos',
            color: COLORS.primary,
            screen: 'Hermanos',
        },
        {
            id: 'actas',
            titulo: 'Actas',
            icono: '📋', 
            descripcion: 'Reuniones',
            color: '#795548', // Marrón
            screen: 'Actas',
        },
        {
            id: 'finanzas',
            titulo: 'Finanzas',
            icono: '💰',
            descripcion: 'Tesorería',
            color: '#4CAF50',
            screen: 'Finanzas',
        },
        ...(esAdmin ? [{
            id: 'inventario',
            titulo: 'Inventario',
            icono: '📦',
            descripcion: 'Equipos y Préstamos',
            color: '#D97706',
            screen: 'Inventario',
        }] : [])
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Admin. Fraternidad</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.menuGrid}>
                    {menuItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.menuItem, { backgroundColor: item.color + '1A', borderColor: item.color }]}
                            onPress={() => navigation.navigate(item.screen)}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                                <Text style={styles.iconText}>{item.icono}</Text>
                            </View>
                            <Text style={styles.itemTitle}>{item.titulo}</Text>
                            <Text style={styles.itemDescription}>{item.descripcion}</Text>
                        </TouchableOpacity>
                    ))}
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
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: SPACING.md,
    },
    menuItem: {
        width: '48%',
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.md,
        alignItems: 'center',
        borderWidth: 1,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    iconText: {
        fontSize: 24,
    },
    itemTitle: {
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
        color: COLORS.darkGray,
        marginBottom: 4,
        textAlign: 'center',
    },
    itemDescription: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.gray,
        textAlign: 'center',
    }
});

export default AdministracionFraternidadScreen;
