// components/HeaderBar.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';

const HeaderBar = ({ title = 'Título' }) => {
  const navigation = useNavigation();

  return (
    <View style={tw`flex-row items-center px-4 py-3 bg-gray-900`}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={tw`mr-4`}>
        <Ionicons name="arrow-back" size={30} color="white" />
      </TouchableOpacity>
      <Text style={tw`text-white text-lg font-semibold`}>{title}</Text>
    </View>
  );
};

export default HeaderBar;
