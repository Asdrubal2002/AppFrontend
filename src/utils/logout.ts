
import { logoutUserBackend } from '../api/auth/authApi';
import { clearTokens, getRefreshToken } from './authStorage';
import { QueryClient } from '@tanstack/react-query';
import * as Keychain from 'react-native-keychain';
import ReactNativeBiometrics from 'react-native-biometrics';
import { Alert } from 'react-native';

const rnBiometrics = new ReactNativeBiometrics();



export const logoutUser = async (queryClient, navigation) => {
  const refresh = await getRefreshToken();

  // Verificamos si existe el refresh token antes de llamar al backend
  if (refresh) {
    try {
      await logoutUserBackend(refresh);
    } catch (e) {
      console.warn('No se pudo cerrar sesión desde el backend', e);
      // Aquí podrías también mostrar un mensaje si lo deseas
    }
  } else {
    console.warn('No hay refresh token para cerrar sesión');
  }

  await clearTokens();
  //await clearBiometricData();

  Alert.alert('Sesión finalizada', 'Tu sesión se cerró correctamente.');

  queryClient.clear();

  navigation.reset({
    index: 0,
    routes: [{ name: 'Tabs', params: { screen: 'Tiendas' } }],
  });
};





export const clearBiometricData = async () => {
  try {
    // Elimina credencial específica (si usas un servicio fijo como 'ruvlo-biometric-login')
    await Keychain.resetGenericPassword({ service: 'ruvlo-biometric-login' });

    // Elimina TODAS las credenciales registradas (modo nuclear)
    const services = await Keychain.getAllGenericPasswordServices();
    await Promise.all(
      services.map(service =>
        Keychain.resetGenericPassword({ service })
      )
    );

    // Elimina las claves biométricas (RSA keypair)
    const deleted = await rnBiometrics.deleteKeys();
    console.log('✅ Credenciales biométricas eliminadas');

    return { success: true, keysDeleted: deleted.keysDeleted };
  } catch (error) {
    console.error('❌ Error limpiando datos biométricos:', error);
    return { success: false, keysDeleted: false };
  }
};

