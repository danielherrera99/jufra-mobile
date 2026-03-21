import React from 'react';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

// Ignorar error de notificaciones push en Expo Go (SDK 53+)
// Ya que solo usamos notificaciones locales
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  'The action \'NAVIGATE\' with payload' // También ignorar advertencias de navegación si las hay
]);

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
