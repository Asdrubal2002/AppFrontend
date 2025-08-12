// components/AuthPrompt.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../theme';

const AuthPrompt = ({ title, message, icon = 'sparkles', buttonLabel = 'Iniciar sesión' }) => {
  const navigation = useNavigation();

  return (
    <View style={tw`my-5 mx-4 p-4 items-center`}>
      <View style={tw`flex-row items-center mb-2`}>
        <Ionicons name={icon} size={18} color={COLORS.BlueSkyWord} style={tw`mr-1`} />
        <Text style={tw`text-[${COLORS.BlueSkyWord}] font-medium text-center text-sm`}>
          {title}
        </Text>
      </View>

      <Text style={tw`text-gray-300 text-xs text-center mb-3`}>
        {message}
      </Text>

      <TouchableOpacity
        onPress={() =>
          navigation.navigate('Tabs', {
            screen: 'Perfil',
            params: { screen: 'Login' },
          })
        }
        style={tw`bg-[${COLORS.BlueWord}] px-5 py-2 rounded-full shadow-sm`}
        activeOpacity={0.7}
      >
        <Text style={tw`text-white font-medium text-sm`}>{buttonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AuthPrompt;
