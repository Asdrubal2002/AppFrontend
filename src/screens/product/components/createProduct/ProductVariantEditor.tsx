import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { ProductPayload } from '../types';

interface Props {
  formData: ProductPayload;
  setFormData: React.Dispatch<React.SetStateAction<ProductPayload>>;
  hasDifferentPrices: boolean | null;
  stockByVariant: boolean | null;
}

export const ProductVariantEditor = ({ formData, setFormData,  hasDifferentPrices,
  stockByVariant, }: Props) => {
  return (
    <View style={tw`mb-4`}>
      <Text style={tw`text-white font-bold mb-2`}>Variantes:</Text>

      {formData.variants?.map((variant, i) => (
        <View key={i} style={tw`bg-gray-800 p-3 rounded-xl mb-2`}>
          {/* Etiqueta de variante y botón eliminar */}
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <Text style={tw`text-yellow-400 flex-1`}>
              {Object.entries(variant.options).map(([k, v]) => `${k}: ${v}`).join(', ')}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setFormData((prev) => {
                  const updated = [...(prev.variants || [])];
                  updated.splice(i, 1);
                  return { ...prev, variants: updated };
                });
              }}
              style={tw`bg-red-600 px-3 py-1 rounded-full ml-2`}
            >
              <Text style={tw`text-white text-xs`}>Eliminar</Text>
            </TouchableOpacity>
          </View>

          {/* SKU */}
          <Text style={tw`text-white mb-1`}>SKU</Text>
          <TextInput
            placeholder="SKU"
            value={variant.sku}
            onChangeText={(text) => {
              const cleanText = text.replace(/\s+/g, '-');
              setFormData((prev) => {
                const updated = [...(prev.variants || [])];
                updated[i].sku = cleanText;
                return { ...prev, variants: updated };
              });
            }}
            style={tw`bg-gray-700 text-white p-2 rounded mb-2`}
          />

          {/* Precio por variante (si aplica) */}
          {hasDifferentPrices === true && (
            <>
              <Text style={tw`text-white mb-1`}>¿Cuánto vale esta opción?</Text>
              <TextInput
                placeholder="Precio"
                keyboardType="numeric"
                value={variant.price?.toString() || ''}
                onChangeText={(text) =>
                  setFormData((prev) => {
                    const updated = [...(prev.variants || [])];
                    updated[i].price = Number(text) || 0;
                    return { ...prev, variants: updated };
                  })
                }
                style={tw`bg-gray-700 text-white p-2 rounded mb-2`}
              />
            </>
          )}

          {/* Stock por variante (si aplica) */}
          {stockByVariant === true && (
            <>
              <Text style={tw`text-white mb-1`}>¿Cuántas unidades tienes?</Text>
              <TextInput
                placeholder="Stock"
                keyboardType="numeric"
                value={variant.stock?.toString() || ''}
                onChangeText={(text) =>
                  setFormData((prev) => {
                    const updated = [...(prev.variants || [])];
                    updated[i].stock = parseInt(text) || 0;
                    return { ...prev, variants: updated };
                  })
                }
                style={tw`bg-gray-700 text-white p-2 rounded`}
              />
            </>
          )}
        </View>
      ))}
    </View>
  );
};
