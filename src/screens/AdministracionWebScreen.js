import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const POMALCA_ID = '00000000-6a0f-b53a-d327-e42a6db2faf7';

const AdministracionWebScreen = ({ navigation }) => {
    const { usuario } = useAuth();

    const isPomalca = (usuario?.fraternidadId === POMALCA_ID) || 
      (!usuario?.fraternidadId) ||
      (usuario?.fraternidadNombre && usuario.fraternidadNombre.toUpperCase().includes('POMALCA'));
    
    const menuItems = [
        ...(isPomalca ? [
            {
                id: 'solicitudes',
                titulo: 'Solicitudes Web',
                icono: '🙋',
                descripcion: 'Prospectos de la página web',
                color: '#E91E63',
                screen: 'Solicitudes',
            },
            {
                id: 'redesSociales',
                titulo: 'Impacto Digital',
                icono: '📱', 
                descripcion: 'Métricas de Redes',
                color: '#1DA1F2', // Twitter Blue / Redes
                screen: 'RedesSociales',
            },
            {
                id: 'registrosMascotas',
                titulo: 'Mascotas',
                icono: '🐶',
                descripcion: 'Bendición de Mascotas',
                color: '#FF9800',
                screen: 'RegistrosMascotasAdmin',
            }
        ] : [
            {
                id: 'miPortalWeb',
                titulo: 'Mi Portal Web',
                icono: '🌐',
                descripcion: 'Ver y compartir portal de mi sede',
                color: '#EA580C',
                action: () => {
                    const slug = (usuario?.fraternidadNombre || 'fraternidad')
                        .toLowerCase()
                        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '');
                    const url = `https://jufrapomalca.vercel.app/f/${slug}`;
                    Linking.openURL(url).catch(() => {
                        Alert.alert('Error', 'No se pudo abrir el navegador');
                    });
                }
            }
        ]),
        {
            id: 'comunicacion',
            titulo: 'Comunicación',
            icono: '📧',
            descripcion: 'Correos Oficiales y Contacto',
            color: '#00BCD4',
            screen: 'Comunicacion',
        },
        {
            id: 'asistenteIA',
            titulo: 'Asistente IA',
            icono: '🤖', 
            descripcion: 'Inteligencia Artificial',
            color: '#009688', // Teal
            screen: 'AsistenteIA',
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
                            onPress={() => item.action ? item.action() : navigation.navigate(item.screen)}
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
