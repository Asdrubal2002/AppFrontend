import React, { useEffect } from 'react';
import { View, Alert, PermissionsAndroid, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import { QueryClientProvider } from '@tanstack/react-query';
import tw from 'twrnc';

import AppNavigator from './src/navigation/AppNavigator';
import queryClient from './src/api/queryClient';
import { navigationRef } from './src/utils/navigation';
import { LocationProvider } from './src/utils/contexts/LocationContext';

import {
  getMessaging,
  requestPermission,
  getToken,
  onMessage,
  isDeviceRegisteredForRemoteMessages,
  registerDeviceForRemoteMessages,
} from '@react-native-firebase/messaging';

enableScreens();

function App(): React.JSX.Element {
  useEffect(() => {
    const setupFirebase = async () => {
      try {
        const messaging = getMessaging();

        if (Platform.OS === 'android' && Platform.Version >= 33) {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
        }

        const permissionStatus = await requestPermission(messaging);
        const enabled = permissionStatus === 1 || permissionStatus === 2;

        if (enabled) {
          console.log('✅ Permisos concedidos');

          const isRegistered = await isDeviceRegisteredForRemoteMessages(messaging);
          if (!isRegistered) {
            await registerDeviceForRemoteMessages(messaging);
          }

          const token = await getToken(messaging);
          console.log('🔑 Token:', token);
        }

        const unsubscribe = onMessage(messaging, (remoteMessage) => {
          Alert.alert(
            remoteMessage.notification?.title || 'Nueva notificación',
            remoteMessage.notification?.body
          );
        });

        return unsubscribe;

      } catch (error) {
        console.error('🔥 Error FCM:', error);
        Alert.alert('Error', 'No se pudo configurar las notificaciones');
      }
    };

    setupFirebase();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <View style={tw`flex-1`}>
          <LocationProvider>
            <NavigationContainer theme={DarkTheme} ref={navigationRef}>
              <AppNavigator />
            </NavigationContainer>
          </LocationProvider>
        </View>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default App;
