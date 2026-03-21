import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ChatScreen = ({ route, navigation }) => {
    const { usuarioId, nombre } = route.params;
    const { usuario } = useAuth();
    const [mensajes, setMensajes] = useState([]);
    const [nuevoMensaje, setNuevoMensaje] = useState('');
    const [loading, setLoading] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const flatListRef = useRef(null);

    useEffect(() => {
        cargarMensajes();

        // Polling para nuevos mensajes
        const interval = setInterval(cargarMensajes, 3000);
        return () => clearInterval(interval);
    }, []);

    const cargarMensajes = async () => {
        try {
            const response = await api.get(`/mensajes/${usuarioId}`);
            if (response.data.success) {
                // Solo actualizar si hay cambios para evitar re-renders innecesarios
                // En una app real usaríamos sockets o compararíamos IDs
                setMensajes(response.data.mensajes);
            }
        } catch (error) {
            console.error('Error al cargar mensajes:', error);
        } finally {
            setLoading(false);
        }
    };

    const enviarMensaje = async () => {
        if (!nuevoMensaje.trim()) return;

        setEnviando(true);
        try {
            const response = await api.post('/mensajes', {
                destinatarioId: usuarioId,
                contenido: nuevoMensaje.trim()
            });

            if (response.data.success) {
                setNuevoMensaje('');
                setMensajes([...mensajes, response.data.mensaje]);
                setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
            }
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
        } finally {
            setEnviando(false);
        }
    };

    const renderItem = ({ item }) => {
        // Asegurar comparación correcta de IDs (convertir a string)
        const remitenteId = item.remitente?._id || item.remitente;
        const miId = usuario?._id;
        const esMio = remitenteId?.toString() === miId?.toString();

        return (
            <View style={{ width: '100%', alignItems: esMio ? 'flex-end' : 'flex-start', marginBottom: 4 }}>
                <View style={[
                    styles.messageBubble,
                    esMio ? styles.myMessage : styles.theirMessage
                ]}>
                    <Text style={[
                        styles.messageText,
                        esMio ? styles.myMessageText : styles.theirMessageText
                    ]}>
                        {item.contenido}
                    </Text>
                    <Text style={[
                        styles.messageTime,
                        esMio ? styles.myMessageTime : styles.theirMessageTime
                    ]}>
                        {format(new Date(item.createdAt), 'HH:mm')}
                    </Text>
                </View>
            </View>
        );
    };

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
                    <Text style={styles.headerTitle}>{nombre}</Text>
                </View>
            </LinearGradient>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={mensajes}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.list}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                />
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={[styles.inputContainer, { paddingBottom: Platform.OS === 'ios' ? 30 : 25 }]}>
                    <TextInput
                        style={styles.input}
                        placeholder="Escribe un mensaje..."
                        value={nuevoMensaje}
                        onChangeText={setNuevoMensaje}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !nuevoMensaje.trim() && styles.sendButtonDisabled]}
                        onPress={enviarMensaje}
                        disabled={!nuevoMensaje.trim() || enviando}
                    >
                        <Text style={styles.sendIcon}>➤</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        paddingTop: 50,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.lg,
        borderBottomLeftRadius: BORDER_RADIUS.xl,
        borderBottomRightRadius: BORDER_RADIUS.xl,
        ...SHADOWS.medium,
        zIndex: 10,
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
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    loader: {
        marginTop: 20,
    },
    list: {
        padding: SPACING.md,
        paddingBottom: 20,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        ...SHADOWS.small,
    },
    myMessage: {
        backgroundColor: COLORS.primary,
        borderBottomRightRadius: 2,
    },
    theirMessage: {
        backgroundColor: COLORS.white,
        borderBottomLeftRadius: 2,
    },
    messageText: {
        fontSize: FONT_SIZES.md,
    },
    myMessageText: {
        color: COLORS.white,
    },
    theirMessageText: {
        color: COLORS.black,
    },
    messageTime: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    myMessageTime: {
        color: 'rgba(255, 255, 255, 0.7)',
    },
    theirMessageTime: {
        color: COLORS.gray,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: SPACING.md,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: '#F0F0F0',
        borderRadius: 20,
        paddingHorizontal: SPACING.md,
        paddingVertical: 8,
        marginRight: SPACING.sm,
        fontSize: FONT_SIZES.md,
        maxHeight: 100,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: COLORS.gray,
    },
    sendIcon: {
        color: COLORS.white,
        fontSize: 18,
        marginLeft: 2, // Ajuste visual
    },
});

export default ChatScreen;
