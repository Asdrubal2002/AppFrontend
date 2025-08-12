import React from 'react';
import { Modal, TouchableOpacity, View, Text, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';

const SCREEN_WIDTH = Dimensions.get('window').width;

const SlideLeftModal = ({ visible, onClose, buttons, onNavigate }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      {/* Fondo oscuro que cierra el modal al tocar */}
      <TouchableOpacity
        style={tw`flex-1 bg-black bg-opacity-40`}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Panel blanco deslizable desde la izquierda */}
      <View
        style={[
          tw`bg-white h-full`,
          {
            width: SCREEN_WIDTH * 0.7,
            position: 'absolute',
            left: 0,
            top: 0,
            padding: 16,
            shadowColor: '#000',
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 10,
          },
        ]}
      >
        {buttons.map((btn, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              onClose();
              onNavigate(btn.screen);
            }}
            style={tw`flex-row items-center py-4 border-b border-gray-200`}
            activeOpacity={0.7}
          >
            <Ionicons
              name={btn.icon}
              size={24}
              color="#4B5563"
              style={tw`mr-3`}
            />
            <Text
              style={tw`text-gray-700 font-semibold text-base flex-shrink`}
              numberOfLines={2}
              adjustsFontSizeToFit
            >
              {btn.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  );
};

export default SlideLeftModal;
