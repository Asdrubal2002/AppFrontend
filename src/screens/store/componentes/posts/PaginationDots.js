import React from 'react';
import { View } from 'react-native';
import tw from 'twrnc';

const PaginationDots = ({ total, currentIndex }) => (
  <View style={tw`flex-row justify-center`}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={[
          tw`w-1 h-1 mx-1 rounded-full mt-2`,
          { backgroundColor: i === currentIndex ? '#3B82F6' : '#ccc' },
        ]}
      />
    ))}
  </View>
);

export default PaginationDots;
