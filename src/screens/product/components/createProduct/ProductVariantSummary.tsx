import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { ProductPayload } from '../types';

interface Props {
  formData: ProductPayload;
  mainVariantIndex: number | null;
  setMainVariantIndex: (index: number) => void;
  handleRemoveVariant: (index: number) => void;
}

export const ProductVariantSummary = ({
  formData,
  mainVariantIndex,
  setMainVariantIndex,
  handleRemoveVariant,
}: Props) => {
  return (
    <View style={tw`mb-6`}>
      <Text style={tw`text-white text-lg font-bold mb-4`}>
        Variantes del producto
      </Text>
      {formData.variants?.map((variant, i) => (
        <View key={i} style={tw`bg-gray-800 p-4 rounded-2xl mb-4 shadow-md`}>
          <Text style={tw`text-yellow-400 font-semibold mb-2`}>
            {formData.name} –{' '}
            {Object.entries(variant.options)
              .map(([k, v]) => `${k}: ${v}`)
              .join(' | ')}
          </Text>
          <Text style={tw`text-white mb-1`}>
            <Text style={tw`font-bold`}>Precio de esta opción:</Text>{' '}
            ${variant.price && variant.price > 0 ? variant.price : formData.price}
          </Text>
          <Text style={tw`text-white mb-3`}>
            <Text style={tw`font-bold`}>Unidades disponibles:</Text>
            {variant.stock}
          </Text>

          <View style={tw`flex-row justify-between`}>
            <TouchableOpacity
              onPress={() => setMainVariantIndex(i)}
              style={tw`flex-1 mr-2 ${mainVariantIndex === i ? 'bg-green-600' : 'bg-blue-600'} p-3 rounded-full`}
            >
              <Text style={tw`text-white text-center font-bold`}>
                {mainVariantIndex === i
                  ? '✓ Mostrado como precio del producto'
                  : 'Mostrar este precio como principal'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleRemoveVariant(i)}
              style={tw`flex-1 bg-red-600 p-3 rounded-full`}
            >
              <Text style={tw`text-white text-center font-bold`}>
                Eliminar esta opción
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
};
