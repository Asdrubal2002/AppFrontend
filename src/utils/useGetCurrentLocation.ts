import { useState } from 'react';
import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

type Options = {
  onSuccess: (coords: { latitude: number; longitude: number }) => void;
  permissionMessage?: string;
};

export const useGetCurrentLocation = () => {
  const [isLocating, setIsLocating] = useState(false);

  const handleLocationError = (error: Geolocation.GeoError) => {
    setIsLocating(false);

    switch (error.code) {
      case 1: // PERMISSION_DENIED
        Alert.alert(
          'Permiso denegado',
          'No se puede obtener ubicación sin permiso. Ve a Configuración > Aplicaciones > [Tu App] > Permisos y activa la ubicación.'
        );
        break;

      case 2: // POSITION_UNAVAILABLE
        Alert.alert(
          'Ubicación no disponible',
          'No pudimos acceder a tu ubicación. Asegúrate de que el GPS esté encendido y que estés en un lugar abierto. Si el problema persiste, reinicia tu dispositivo.'
        );
        break;

      case 3: // TIMEOUT
        Alert.alert(
          'Tiempo agotado',
          'El intento de obtener tu ubicación tardó demasiado. Intenta nuevamente desde un lugar con buena señal, con el GPS encendido y sin modo ahorro de batería.'
        );
        break;

      default:
        Alert.alert('Error desconocido', error.message);
        break;
    }
  };

  const requestLocation = async ({ onSuccess, permissionMessage }: Options) => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permiso de ubicación',
            message:
              permissionMessage ||
              'Necesitamos acceder a tu ubicación para continuar.',
            buttonNeutral: 'Preguntar luego',
            buttonNegative: 'Cancelar',
            buttonPositive: 'Aceptar',
          }
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permiso denegado', 'No se puede acceder a la ubicación sin permiso.');
          return;
        }
      }

      setIsLocating(true);

      Geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          onSuccess({ latitude, longitude });
          setIsLocating(false);
        },
        handleLocationError,
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 10000,
        }
      );
    } catch (err) {
      setIsLocating(false);
      console.warn(err);
      Alert.alert('Error inesperado', 'Ocurrió un problema al intentar obtener tu ubicación.');
    }
  };

  return { requestLocation, isLocating };
};