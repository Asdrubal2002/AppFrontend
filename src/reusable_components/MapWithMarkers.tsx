// components/MapWithMarkers.tsx
import React from 'react';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { generateLeafletHTMLWithMarkers } from './generateLeafletHTMLWithMarkers';

type Coord = { latitude: number; longitude: number };

type MarkerItem = {
  name: string;
  slug?: string;
  id?: string;
  latitude: number;
  longitude: number;
  distance?: number;
  type?: 'store' | 'product';
  logo?: string; 
};

type Props = {
  userLocation: Coord;
  markers: MarkerItem[];
};

const MapWithMarkers = ({ userLocation, markers }: Props) => {
  const html = generateLeafletHTMLWithMarkers({ userLocation, markers });
  const navigation = useNavigation();

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html }}
      style={{ flex: 1 }}
      onMessage={(event) => {
        try {
          const message = JSON.parse(event.nativeEvent.data);

          if (message.type === 'markerClick') {
            if (message.markerType === 'store' && message.slug) {
              navigation.navigate('StoreDetail', { slug: message.slug });
            } else if (message.markerType === 'product' && message.id) {
              navigation.navigate('ProductDetail', { productId: message.id });
            } else {
              console.warn('🟡 Faltan datos para navegación:', message);
            }
          }
        } catch (e) {
          console.warn('Mensaje no válido:', e);
        }
      }}

    />
  );
};

export default MapWithMarkers;
