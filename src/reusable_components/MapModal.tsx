import React from 'react';
import { Modal, View, Pressable } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { WebView } from 'react-native-webview';

const MapModal = ({
  visible,
  html,
  onClose,
}: {
  visible: boolean;
  html: string;
  onClose: () => void;
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: '92%',
            height: '85%',
            backgroundColor: '#1f2937',
            borderRadius: 16,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 10,
          }}
        >
          <WebView
            originWhitelist={['*']}
            source={{ html }}
            javaScriptEnabled
            domStorageEnabled
            style={{ flex: 1 }}
          />
        </View>

        <Pressable
          onPress={onClose}
          style={{
            position: 'absolute',
            bottom: 30,
            right: 30,
            backgroundColor: '#374151',
            padding: 12,
            borderRadius: 30,
            zIndex: 20,
            elevation: 10,
          }}
        >
          <Ionicons name="close" size={24} color="#fff" />
        </Pressable>
      </View>
    </Modal>
  );
};

export default MapModal;
