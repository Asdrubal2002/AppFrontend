import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import tw from 'twrnc';

const MenuButton = ({ onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={tw`bg-blue-600 px-6 py-3 rounded-full shadow-md`}
      activeOpacity={0.8}
    >
      <Text style={tw`text-white font-semibold text-base`}>Abrir menú</Text>
    </TouchableOpacity>
  );
};

export default MenuButton;
