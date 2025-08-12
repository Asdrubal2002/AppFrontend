import React, { useState } from 'react';
import { Switch, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import { ProductPayload } from '../types';
import { CategorySelector } from '../CategorySelector';
import { COLORS } from '../../../../../theme';

interface Props {
  formData: ProductPayload;
  input: (label: string, field: keyof ProductPayload, placeholder?: string, keyboardType?: any) => JSX.Element;
  handleValueChange: (field: keyof ProductPayload, value: any) => void;
  getSmartOptions: (categoryName: string) => string[];
  setSmartSuggestedOptions: (options: string[]) => void;
  setSelectedOptionTypes: (opts: string[]) => void;
  hasDifferentPrices: boolean | null;
  setHasDifferentPrices: (value: boolean) => void;
  stockByVariant: boolean | null;
  setStockByVariant: (value: boolean) => void;
}

export const ProductBasicInfo = ({

  formData,
  input,
  handleValueChange,
  getSmartOptions,
  setSmartSuggestedOptions,
  setSelectedOptionTypes,
  hasDifferentPrices,
  setHasDifferentPrices,
  stockByVariant,
  setStockByVariant,
}: Props) => {

  return (
    <View style={tw`p-4`}>
      {input('Nombre del producto o servicio *', 'name', 'Ejemplo: Camiseta negra')}
      {input('Descripción corta', 'description', '¿Que Materiales?, ¿para que sirve?, etc')}
      <View style={tw`pb-4`}>
        <Text style={tw`text-yellow-400 font-semibold mb-2`}>
          ¿Tu producto tiene diferentes precios según alguna característica?
        </Text>
        <Text style={tw`text-gray-400 mb-2 text-sm`}>
          Por ejemplo, si el precio cambia según el tamaño, presentación, diseño u otra característica del producto.
        </Text>

        <View style={tw`flex-row flex-wrap gap-2`}>
          <TouchableOpacity
            onPress={() => setHasDifferentPrices(true)}
            style={tw`px-4 py-2 rounded-xl w-full sm:w-auto ${hasDifferentPrices === true ? 'bg-blue-500' : 'bg-gray-700'}`}
          >
            <Text style={tw`text-white font-bold text-center`}>
              Sí, tiene diferentes precios
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setHasDifferentPrices(false)}
            style={tw`px-4 py-2 rounded-xl w-full sm:w-auto ${hasDifferentPrices === false ? 'bg-blue-500' : 'bg-gray-700'}`}
          >
            <Text style={tw`text-white font-bold text-center`}>
              No, tiene un solo precio
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={tw`pb-4`}>
        <Text style={tw`text-yellow-400 font-semibold mb-2`}>
          ¿La cantidad disponible cambia según alguna característica?
        </Text>
        <Text style={tw`text-gray-400 mb-2 text-sm`}>
          Por ejemplo, si tienes diferentes colores, tallas, o tipos y cada uno tiene su propia cantidad.
        </Text>

        <View style={tw`flex-row flex-wrap gap-2`}>
          <TouchableOpacity
            onPress={() => setStockByVariant(true)}
            style={tw`px-4 py-2 rounded-xl w-full sm:w-auto ${stockByVariant === true ? 'bg-blue-500' : 'bg-gray-700'}`}
          >
            <Text style={tw`text-white font-bold text-center`}>
              Sí, el stock cambia según la variante
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setStockByVariant(false)}
            style={tw`px-4 py-2 rounded-xl w-full sm:w-auto ${stockByVariant === false ? 'bg-blue-500' : 'bg-gray-700'}`}
          >
            <Text style={tw`text-white font-bold text-center`}>
              No, manejo un stock total
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Solo un precio, sin variantes de stock → mostrar precio y stock general */}
      {hasDifferentPrices === false && stockByVariant === false && (
        <>
          {input('¿Cuál es el precio de venta?', 'price', 'Ejemplo: 3.500', 'numeric')}
          {input('¿Cuántas unidades tienes disponibles?', 'stock', 'Ejemplo: 15 unidades', 'numeric')}
        </>
      )}

      {/* Solo un precio, pero stock por variante */}
      {hasDifferentPrices === false && stockByVariant === true && (
        <>
          {input('¿Cuál es el precio de venta?', 'price', 'Ejemplo: 3.500', 'numeric')}
          <View style={tw`bg-yellow-800 p-3 rounded-xl mt-4`}>
            <Text style={tw`text-white text-sm`}>
              Has indicado que el precio es único, pero el stock depende de variantes.
              Más adelante podrás agregar las variantes y definir la cantidad disponible por cada una.
            </Text>
          </View>
        </>
      )}

      {/* Precio y stock dependen de variantes */}
      {hasDifferentPrices === true && stockByVariant === true && (
        <View style={tw`bg-yellow-800 p-3 rounded-xl mt-4`}>
          <Text style={tw`text-white text-sm`}>
            Muy bien, tu producto tiene diferentes precios y cantidades según sus características.
            Más adelante podrás agregar cada variante con su precio y stock respectivo.
          </Text>
        </View>
      )}

      {/* Precio por variante, pero stock general */}
      {hasDifferentPrices === true && stockByVariant === false && (
        <>
          {input('¿Cuántas unidades tienes disponibles?', 'stock', 'Ejemplo: 15 unidades', 'numeric')}
          <View style={tw`bg-yellow-800 p-3 rounded-xl mt-4`}>
            <Text style={tw`text-white text-sm`}>
              Has indicado que el precio depende de variantes como tamaño o presentación,
              pero manejas un stock total. Más adelante agregarás los precios por variante.
            </Text>
          </View>
        </>
      )}

      <CategorySelector
        storeId={formData.store_id}
        selectedCategoryId={formData.category || null}
        onSelect={(id, name) => {
          handleValueChange('category', id);
          const dynamicOptions = getSmartOptions((name || '').toLowerCase());
          setSmartSuggestedOptions(dynamicOptions);
          setSelectedOptionTypes([]);
        }}
      />
    </View>
  );
};
