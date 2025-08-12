// components/BackgroundIcon.tsx
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

const BackgroundIcon = ({ name }: { name: keyof typeof Ionicons.glyphMap }) => (
  <Ionicons
    name={name}
    size={550}
    color="white"
    style={{
      position: 'absolute',
      top: 100,
      left: 60,
      opacity: 0.06,
      zIndex: 0,
    }}
  />
);

export default BackgroundIcon;
