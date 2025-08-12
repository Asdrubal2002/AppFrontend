import axiosInstance from './axiosInstance';
import { saveTokens, clearTokens, saveUsername, saveIsSeller, saveStoreIds, getAccessToken } from '../../utils/authStorage';
import { navigate } from '../../utils/navigation';
import { 
  getMessaging, 
  requestPermission, 
  getToken, 
  isDeviceRegisteredForRemoteMessages, 
  registerDeviceForRemoteMessages,
  onTokenRefresh
} from '@react-native-firebase/messaging';
import { Platform } from 'react-native';


// Función para manejar actualizaciones del token FCM
const setupTokenRefresh = () => {
  const messaging = getMessaging();
  
  onTokenRefresh(messaging, async (newToken) => {
    try {
      const accessToken = await getAccessToken();
      if (accessToken) {
        await axiosInstance.post(
          'auth/tokenFcm/',
          { fcm_token: newToken },
          { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        console.log('🔄 Token FCM actualizado automáticamente');
      }
    } catch (error) {
      console.error('⚠️ Error al actualizar token:', error);
    }
  });
};


// Función para registrar el token FCM en el backend
const registerFCMToken = async (accessToken: string) => {
  try {
    const messaging = getMessaging();
    
    // 1. Registro del dispositivo (iOS)
    if (Platform.OS === 'ios') {
      if (!(await isDeviceRegisteredForRemoteMessages())) {
        await registerDeviceForRemoteMessages();
      }
    }

    // 2. Solicitar permisos (iOS)
    let enabled = true;
    if (Platform.OS === 'ios') {
      const authStatus = await requestPermission();
      enabled = 
        authStatus === messaging.AuthorizationStatus.AUTHORIZED || 
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    }

    if (!enabled) {
      console.log('Permisos de notificación no concedidos');
      return;
    }

    // 3. Obtener el token FCM
    const fcmToken = await getToken(messaging);
    console.log('🔑 FCM Token obtenido:', fcmToken);

    if (!fcmToken) {
      console.log('No se pudo obtener el token FCM');
      return;
    }

    // 4. Enviar al backend
    await axiosInstance.post(
      'auth/tokenFcm/',
      { fcm_token: fcmToken },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      }
    );

    console.log('Token FCM registrado exitosamente');
  } catch (error) {
    console.error('Error registrando token FCM:', error);
  }
};

// Login con almacenamiento seguro de tokens y registro de FCM
export const loginUser = async (credentials: { username: string; password: string }) => {
  try {
    // 1. Limpiar tokens anteriores
    await clearTokens();

    // 2. Hacer el login
    const response = await axiosInstance.post('auth/login/', credentials);
    const { access, refresh, username, is_seller, store_ids } = response.data;
    
    console.log("Access:", access);
    console.log("Refresh:", refresh);

    // 3. Guardar tokens y datos de usuario
    await saveTokens(access, refresh);
    await saveUsername(username);
    await saveIsSeller(is_seller);
    await saveStoreIds(store_ids);

    // 4. Obtener y registrar el token FCM
    await registerFCMToken(access);
    setupTokenRefresh();

    return response.data;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

// Obtener perfil del usuario (opcional, si lo usas)
export const getUserProfile = async () => {
  const response = await axiosInstance.get('auth/profile/');
  return response.data;
};

// Logout en backend
export const logoutUserBackend = async (refresh: string) => {
  await axiosInstance.post('auth/logout/', { refresh });
};