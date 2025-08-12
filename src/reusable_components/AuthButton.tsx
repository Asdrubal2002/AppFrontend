// components/AuthButton.tsx
import React, { ReactNode } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import tw from 'twrnc';
import { COLORS } from '../../theme';

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  buttonStyle?: object;
  icon?: ReactNode;
}

const AuthButton = ({ title, onPress, disabled, buttonStyle, icon }: Props) => (
  <TouchableOpacity
    style={[
      tw`py-3 rounded-xl mb-4 flex-row items-center justify-center ${disabled ? 'opacity-50' : ''}`,
      { backgroundColor: COLORS.BlueWord },
      buttonStyle,
    ]}
    onPress={onPress}
    disabled={disabled}
  >
    {icon && <View style={tw`mr-2`}>{icon}</View>}
    <Text style={tw`text-white text-center text-base `}>{title}</Text>
  </TouchableOpacity>
);


export default AuthButton;
