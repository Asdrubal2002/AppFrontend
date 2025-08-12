import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';

const ElegantButton = ({ title, icon, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={tw`bg-gray-700 w-[48%] py-4 rounded-2xl flex-row items-center justify-center shadow-md border border-gray-500`}
    activeOpacity={0.8}
  >
    <Ionicons name={icon} size={24} color="#4B5563" style={tw`mr-3`} />
    <Text
      style={tw`text-gray-200 font-semibold text-base flex-shrink`}
      numberOfLines={2}
      adjustsFontSizeToFit
    >
      {title}
    </Text>
  </TouchableOpacity>
);

export default ElegantButton;
