import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

let Notifications;
const isExpoGo = Constants.appOwnership === 'expo' || Constants.executionEnvironment === 'storeClient';

if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (e) {
    console.log('Failed to load expo-notifications');
  }
}

export async function registerForPushNotificationsAsync() {
  let token;
  
  if (isExpoGo || !Notifications) {
    console.log('Push notifications are not supported in Expo Go in SDK 53+');
    return null;
  }

  try {
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
         try {
             token = (await Notifications.getExpoPushTokenAsync()).data;
         } catch (err) {
             console.log('Error fallback push token:', err);
         }
      }
    }
  } catch (globalError) {
    console.log('Push notifications error ignored:', globalError);
  }

  return token;
}
