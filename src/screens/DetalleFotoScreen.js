import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    Alert,
    ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode } from 'expo-av';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const DetalleFotoScreen = ({ route, navigation }) => {
    const { item } = route.params;
    const { usuario, esConsejoActivo } = useAuth();

    const eliminarItem = () => {
        Alert.alert(
            'Eliminar',
            '¿Estás seguro de que deseas eliminar este archivo de la galería?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/galeria/${item._id}`);
                            Alert.alert('Éxito', 'Eliminado correctamente', [
                                { text: 'OK', onPress: () => navigation.goBack() }
                            ]);
                        } catch (error) {
                            console.error(error);
                            Alert.alert('Error', 'No se pudo eliminar');
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.closeButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>

            {esConsejoActivo && (
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('EditarFoto', { item })}
                    >
                        <Text style={styles.actionIcon}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={eliminarItem}
                    >
                        <Text style={styles.actionIcon}>🗑️</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.mediaContainer}>
                {item.tipoArchivo === 'video' ? (
                    <Video
                        style={styles.media}
                        source={{ uri: item.archivoUrl }}
                        useNativeControls
                        resizeMode={ResizeMode.CONTAIN}
                        isLooping
                    />
                ) : (
                    <Image
                        source={{ uri: item.archivoUrl }}
                        style={styles.media}
                        resizeMode="contain"
                    />
                )}
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.title}>{item.titulo}</Text>
                {item.descripcion && (
                    <Text style={styles.description}>{item.descripcion}</Text>
                )}
                <Text style={styles.date}>
                    Subido por {item.subidoPor?.nombre} el {new Date(item.fecha).toLocaleDateString()}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
        padding: 10,
    },
    closeIcon: {
        color: 'white',
        fontSize: 30,
        fontWeight: 'bold',
    },
    actions: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        flexDirection: 'row',
    },
    actionButton: {
        padding: 10,
        marginLeft: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
    },
    actionIcon: {
        fontSize: 20,
        color: 'white',
    },
    mediaContainer: {
        width: width,
        height: height * 0.7,
        justifyContent: 'center',
        alignItems: 'center',
    },
    media: {
        width: '100%',
        height: '100%',
    },
    infoContainer: {
        padding: SPACING.lg,
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    title: {
        color: 'white',
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        marginBottom: SPACING.xs,
    },
    description: {
        color: 'white',
        fontSize: FONT_SIZES.md,
        marginBottom: SPACING.sm,
    },
    date: {
        color: COLORS.lightGray,
        fontSize: FONT_SIZES.xs,
    },
});

export default DetalleFotoScreen;
