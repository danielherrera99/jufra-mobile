import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const AsistenteIAScreen = ({ navigation }) => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: '¡Paz y bien! Soy tu Asistente Seráfico. ¿En qué te puedo ayudar hoy? Puedes pedirme que redacte comunicados, genere oraciones o resuma actas.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [isConfiguring, setIsConfiguring] = useState(true);
    const scrollViewRef = useRef();

    useEffect(() => {
        loadApiKey();
    }, []);

    const loadApiKey = async () => {
        try {
            const savedKey = await AsyncStorage.getItem('gemini_api_key');
            // Nota: En móvil, es mejor no usar process.env a menos que se configure babel-plugin-transform-inline-environment-variables
            // Dependemos de AsyncStorage aquí
            if (savedKey) {
                setApiKey(savedKey);
                setIsConfiguring(false);
            }
        } catch (error) {
            console.error('Error cargando la API key:', error);
        }
    };

    const handleSaveKey = async () => {
        if (apiKey.trim()) {
            await AsyncStorage.setItem('gemini_api_key', apiKey.trim());
            setIsConfiguring(false);
        }
    };

    const clearKey = async () => {
        await AsyncStorage.removeItem('gemini_api_key');
        setApiKey('');
        setIsConfiguring(true);
    };

    const handleSend = async (textToSend = input) => {
        if (!textToSend.trim() || !apiKey) return;

        const userMessage = textToSend.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Actualizado a la versión estable actual

            const systemInstruction = `Eres un asistente virtual llamado "Asistente Seráfico" para la Juventud Franciscana (JUFRA) de Pomalca, con sede en la Parroquia María del Perpetuo Socorro. Tu tono debe ser amable, franciscano (saludando siempre con "Paz y bien" si es la primera interacción o si amerita), y dispuesto a ayudar. Estás ayudando a los líderes (el consejo) a redactar correos, actas, oraciones o resolver dudas.`;
            const prompt = `${systemInstruction}\n\nUsuario: ${userMessage}`;
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            setMessages(prev => [...prev, { role: 'assistant', content: text }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { 
                role: 'system', 
                content: `Error de conexión: ${error.message}. Si la clave es inválida, puedes usar el botón de arriba a la derecha para cambiarla.` 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickAction = (action) => {
        let prompt = '';
        if (action === 'comunicado') {
            prompt = 'Ayúdame a redactar un comunicado corto invitando a los hermanos a una reunión extraordinaria este fin de semana.';
        } else if (action === 'oracion') {
            prompt = 'Genera una breve oración franciscana para iniciar nuestra próxima reunión del consejo.';
        } else if (action === 'acta') {
            prompt = 'Dame una plantilla estructurada para redactar el acta de una asamblea electiva.';
        }
        handleSend(prompt);
    };

    if (isConfiguring) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Configurar Asistente</Text>
                </View>
                <ScrollView contentContainerStyle={styles.configContainer}>
                    <Text style={styles.configIcon}>🔑</Text>
                    <Text style={styles.configTitle}>API Key Requerida</Text>
                    <Text style={styles.configText}>
                        Para usar la inteligencia artificial de Gemini, necesitas ingresar tu API Key. Esta se guardará solo en tu dispositivo.
                    </Text>
                    <TextInput
                        style={styles.configInput}
                        value={apiKey}
                        onChangeText={setApiKey}
                        placeholder="AIzaSy..."
                        secureTextEntry
                        autoCapitalize="none"
                    />
                    <TouchableOpacity style={styles.primaryButton} onPress={handleSaveKey}>
                        <Text style={styles.primaryButtonText}>Guardar y Comenzar</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>🤖 Asistente IA</Text>
                <TouchableOpacity onPress={clearKey} style={styles.settingsButton}>
                    <Text style={styles.settingsIcon}>⚙️</Text>
                </TouchableOpacity>
            </View>

            <ScrollView 
                style={styles.chatContainer}
                ref={scrollViewRef}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
                {messages.length === 1 && (
                    <View style={styles.quickActionsContainer}>
                        <TouchableOpacity style={styles.quickAction} onPress={() => handleQuickAction('comunicado')}>
                            <Text style={styles.quickActionIcon}>📢</Text>
                            <Text style={styles.quickActionTitle}>Comunicado</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickAction} onPress={() => handleQuickAction('oracion')}>
                            <Text style={styles.quickActionIcon}>🙏</Text>
                            <Text style={styles.quickActionTitle}>Oración</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickAction} onPress={() => handleQuickAction('acta')}>
                            <Text style={styles.quickActionIcon}>📝</Text>
                            <Text style={styles.quickActionTitle}>Acta</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {messages.map((msg, index) => (
                    <View 
                        key={index} 
                        style={[
                            styles.messageWrapper, 
                            msg.role === 'user' ? styles.messageWrapperUser : styles.messageWrapperAssistant
                        ]}
                    >
                        {msg.role !== 'user' && (
                            <Text style={styles.messageAvatar}>{msg.role === 'system' ? '⚠️' : '🤖'}</Text>
                        )}
                        <View style={[
                            styles.messageBubble,
                            msg.role === 'user' ? styles.messageBubbleUser :
                            msg.role === 'system' ? styles.messageBubbleSystem : styles.messageBubbleAssistant
                        ]}>
                            <Text style={[
                                styles.messageText,
                                msg.role === 'user' ? styles.messageTextUser :
                                msg.role === 'system' ? styles.messageTextSystem : styles.messageTextAssistant
                            ]}>
                                {msg.content}
                            </Text>
                        </View>
                    </View>
                ))}

                {isLoading && (
                    <View style={[styles.messageWrapper, styles.messageWrapperAssistant]}>
                        <Text style={styles.messageAvatar}>🤖</Text>
                        <View style={[styles.messageBubble, styles.messageBubbleAssistant]}>
                            <ActivityIndicator size="small" color={COLORS.primary} />
                        </View>
                    </View>
                )}
            </ScrollView>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={input}
                    onChangeText={setInput}
                    placeholder="Escribe tu mensaje..."
                    multiline
                    editable={!isLoading}
                />
                <TouchableOpacity 
                    style={[styles.sendButton, (!input.trim() || isLoading) && styles.sendButtonDisabled]}
                    onPress={() => handleSend(input)}
                    disabled={!input.trim() || isLoading}
                >
                    <Text style={styles.sendButtonText}>➤</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
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
        flex: 1,
    },
    settingsButton: {
        padding: SPACING.sm,
    },
    settingsIcon: {
        fontSize: 20,
    },
    configContainer: {
        padding: SPACING.xl,
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1,
    },
    configIcon: {
        fontSize: 60,
        marginBottom: SPACING.md,
    },
    configTitle: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: SPACING.md,
    },
    configText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.gray,
        textAlign: 'center',
        marginBottom: SPACING.xl,
        lineHeight: 22,
    },
    configInput: {
        width: '100%',
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        fontSize: FONT_SIZES.md,
        marginBottom: SPACING.lg,
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        width: '100%',
        alignItems: 'center',
    },
    primaryButtonText: {
        color: COLORS.white,
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
    },
    chatContainer: {
        flex: 1,
        padding: SPACING.md,
    },
    quickActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.lg,
    },
    quickAction: {
        flex: 1,
        backgroundColor: COLORS.white,
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        marginHorizontal: 4,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    quickActionIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    quickActionTitle: {
        fontSize: FONT_SIZES.xs,
        fontWeight: 'bold',
        color: COLORS.darkGray,
    },
    messageWrapper: {
        flexDirection: 'row',
        marginBottom: SPACING.md,
        maxWidth: '85%',
    },
    messageWrapperUser: {
        alignSelf: 'flex-end',
    },
    messageWrapperAssistant: {
        alignSelf: 'flex-start',
    },
    messageAvatar: {
        fontSize: 20,
        marginRight: 8,
        marginTop: 4,
    },
    messageBubble: {
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
    },
    messageBubbleUser: {
        backgroundColor: COLORS.primary,
        borderTopRightRadius: 4,
    },
    messageBubbleAssistant: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 4,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    messageBubbleSystem: {
        backgroundColor: '#FEF2F2',
        borderTopLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#FCA5A5',
    },
    messageText: {
        fontSize: FONT_SIZES.md,
        lineHeight: 22,
    },
    messageTextUser: {
        color: COLORS.white,
    },
    messageTextAssistant: {
        color: COLORS.darkGray,
    },
    messageTextSystem: {
        color: '#991B1B',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: SPACING.md,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
        alignItems: 'flex-end',
    },
    input: {
        flex: 1,
        backgroundColor: COLORS.cream,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: 20,
        paddingHorizontal: SPACING.md,
        paddingTop: 10,
        paddingBottom: 10,
        minHeight: 40,
        maxHeight: 100,
        fontSize: FONT_SIZES.md,
    },
    sendButton: {
        backgroundColor: COLORS.primary,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: SPACING.sm,
        marginBottom: 2,
    },
    sendButtonDisabled: {
        backgroundColor: COLORS.lightGray,
    },
    sendButtonText: {
        color: COLORS.white,
        fontSize: 18,
    }
});

export default AsistenteIAScreen;
