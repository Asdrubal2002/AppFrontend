import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import tw from 'twrnc';

const FullScreenLoader = () => (
  <View style={tw`flex-1 justify-center items-center`}>
    <ActivityIndicator size="large" color="#ffffff" />
  </View>
);

export default FullScreenLoader;
