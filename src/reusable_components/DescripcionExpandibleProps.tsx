import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';

interface DescripcionExpandibleProps {
  description: string;
}

const DescripcionExpandible: React.FC<DescripcionExpandibleProps> = ({ description }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = description.length > 100;

  return (
    <View style={tw`relative mb-4`}>
      <Text
        style={tw`text-white text-sm mt-2`}
        numberOfLines={expanded ? undefined : 3}
      >
        {description}
      </Text>

      {/* Sombra falsa en modo contraído */}
      {!expanded && isLong && (
        <View
          style={tw`absolute bottom-6 left-0 right-0 h-6 bg-black opacity-30`}
          pointerEvents="none"
        />
      )}

      {isLong && (
        <TouchableOpacity onPress={() => setExpanded(!expanded)}>
          <Text style={tw`text-blue-400 text-sm mt-1`}>
            {expanded ? 'Ver menos' : 'Ver más'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default DescripcionExpandible;
