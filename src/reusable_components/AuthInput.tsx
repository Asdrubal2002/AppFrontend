// components/AuthInput.tsx
import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import tw from 'twrnc';

interface AuthInputProps extends TextInputProps {
  label?: string;
}

const AuthInput = ({ label, ...props }: AuthInputProps) => (
  <View>
    {label && <Text style={tw`text-white mb-1 font-light`}>{label}</Text>}
    <TextInput
      placeholderTextColor="#9CA3AF"
      style={tw`bg-gray-800 rounded-xl px-4 py-3 mb-4 text-gray-100`}
      {...props}
    />
  </View>
);

export default AuthInput;
