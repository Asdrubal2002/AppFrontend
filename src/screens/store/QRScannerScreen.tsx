// QRScannerScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, PermissionsAndroid, Platform, Text } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { useNavigation } from '@react-navigation/native';

export default function QRScannerScreen() {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState(false);

  // Función para pedir permiso
  async function requestCameraPermission() {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Permiso para usar la cámara',
          message: 'Necesitamos tu permiso para escanear códigos QR',
          buttonPositive: 'Aceptar',
        }
      );
      setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
    } else {
      setHasPermission(true);
    }
  }

  // Pedir permiso al montar el componente
  useEffect(() => {
    requestCameraPermission();
  }, []);

  const onRead = (e) => {
    const scannedUrl = e.data;

    try {
      // Extraer solo el slug desde la URL
      const urlParts = scannedUrl.split('/');
      const slug = urlParts[urlParts.length - 2]; // El penúltimo segmento
      navigation.navigate('StoreDetail', { slug });
    } catch (error) {
      console.error('Error leyendo slug del QR:', error);
    }
  };


  return (
    <View style={styles.container}>
      {hasPermission ? (
        <QRCodeScanner
          onRead={onRead}
          reactivate={true}
          reactivateTimeout={2000}
          showMarker={true}
          markerStyle={styles.marker}
          cameraStyle={styles.camera}
          topContent={
            <View style={styles.topContent}>
              <Text style={styles.instruction}>Alinea el código QR dentro del marco</Text>
            </View>
          }

        />
      ) : (
        <Text style={styles.text}>Solicitando permiso para la cámara...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { height: '100%' },
  marker: { borderColor: '#FFF', borderRadius: 10 },
  text: { color: '#000', textAlign: 'center', marginTop: 20 },
  // Nuevo estilo para el texto de instrucción
  topContent: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  instruction: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
});
