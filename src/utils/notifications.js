import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    try {
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId || '114bd9cc-ffdc-4ccc-96d8-2221f4a275d8';
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: projectId
      })).data;
      console.log('Expo Push Token (primary):', token);
    } catch (error) {
       console.log('Error primary getExpoPushTokenAsync:', error);
       // fallback for older Expo setups missing projectId logic
       try {
           token = (await Notifications.getExpoPushTokenAsync()).data;
           console.log('Expo Push Token (fallback):', token);
       } catch (err) {
           console.log('Error fallback push token:', err);
       }
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}
