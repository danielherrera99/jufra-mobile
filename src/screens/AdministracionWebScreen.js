import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const AdministracionWebScreen = ({ navigation }) => {
    const { usuario } = useAuth();
    
    const menuItems = [
        {
            id: 'solicitudes',
            titulo: 'Solicitudes Web',
            icono: '🙋',
            descripcion: 'Prospectos de la página web',
            color: '#E91E63',
            screen: 'Solicitudes',
        },
        {
            id: 'comunicacion',
            titulo: 'Comunicación',
            icono: '📧',
            descripcion: 'Correos Oficiales y Contacto',
            color: '#00BCD4',
            screen: 'Comunicacion',
        },
        {
            id: 'redesSociales',
            titulo: 'Redes Sociales',
            icono: '📱',
            descripcion: 'Métricas e Impacto Digital',
            color: '#8B5CF6',
            screen: 'RedesSociales',
        }
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Administración Web</Text>
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

export default AdministracionWebScreen;
