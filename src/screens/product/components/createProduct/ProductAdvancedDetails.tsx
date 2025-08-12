import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import tw from 'twrnc';
import { ProductPayload } from './types';

interface Props {
  formData: ProductPayload;
  input: (label: string, field: keyof ProductPayload, placeholder?: string, keyboardType?: any) => JSX.Element;
  handleValueChange: (field: keyof ProductPayload, value: any) => void;
  showDatePicker: (field: 'discount_start' | 'discount_end') => void;
  setFormData: React.Dispatch<React.SetStateAction<ProductPayload>>;
  specifications: Record<string, string>;
  newSpecKey: string;
  newSpecValue: string;
  setNewSpecKey: (key: string) => void;
  setNewSpecValue: (value: string) => void;
  addSpecification: () => void;
  removeSpecification: (key: string) => void;
}

export const ProductAdvancedDetails = ({
  formData,
  input,
  handleValueChange,
  showDatePicker,
  setFormData,
  specifications,
  newSpecKey,
  newSpecValue,
  setNewSpecKey,
  setNewSpecValue,
  addSpecification,
  removeSpecification,
}: Props) => {
  return (
    <View style={tw`p-4 rounded-2xl shadow-lg bg-gray-900 mt-4`}>
      {input('Marca', 'brand', '¿De qué marca es tu producto?')}
      {input('Modelo', 'model', '¿Qué modelo es tu producto?')}
      {input('Código de barras', 'barcode', '¿Tienes código de barras?')}
      {input('Garantía', 'warranty', '¿Qué tiempo tiene garantía?')}
      {input('Peso (kg)', 'weight_kg', '¿Qué peso tiene tu producto?', 'numeric')}
      {input('Código Sku', 'sku', 'Unidad de Mantenimiento de Existencias', 'default', true)}
      <Text style={tw`text-white font-semibold mb-1`}>Condición del producto</Text>
      <View style={tw`bg-gray-800 rounded-lg px-3 mb-2`}>
        <Picker
          selectedValue={formData.condition}
          onValueChange={(value) => handleValueChange('condition', value)}
          dropdownIconColor="#fff"
          style={tw`text-white`}
        >
          <Picker.Item label="Nuevo" value="Nuevo" />
          <Picker.Item label="Usado" value="Usado" />
        </Picker>
      </View>
      {input('Descuento (%)', 'discount_percentage', '¿Qué porcentaje de descuento tiene?', 'numeric')}

      <TouchableOpacity onPress={() => showDatePicker('discount_start')} style={tw`mb-3`}>
        <Text style={tw`text-white mb-1`}>Inicio descuento</Text>
        <View style={tw`bg-gray-800 p-3 rounded-xl`}>
          <Text style={tw`text-white`}>{formData.discount_start || 'Selecciona una fecha'}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => showDatePicker('discount_end')} style={tw`mb-3`}>
        <Text style={tw`text-white mb-1`}>Fin descuento</Text>
        <View style={tw`bg-gray-800 p-3 rounded-xl`}>
          <Text style={tw`text-white`}>{formData.discount_end || 'Selecciona una fecha'}</Text>
        </View>
      </TouchableOpacity>

      <Text style={tw`text-white font-semibold my-2`}>Dimensiones (cm):</Text>
      {['ancho', 'alto', 'largo'].map((dim) => (
        <View key={dim} style={tw`mb-2`}>
          <Text style={tw`text-white mb-1 capitalize`}>
            {dim.charAt(0).toUpperCase() + dim.slice(1)} (cm)
          </Text>
          <TextInput
            placeholder={`Ej: 25`}
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={formData.dimensions_cm?.[dim]?.toString() ?? ''}
            onChangeText={(text) =>
              setFormData((prev) => ({
                ...prev,
                dimensions_cm: {
                  ...prev.dimensions_cm,
                  [dim]: isNaN(Number(text)) ? undefined : Number(text),
                },
              }))
            }
            style={tw`bg-gray-800 text-white p-3 rounded-xl`}
          />
        </View>
      ))}
      <View style={tw`my-4`}>
        <Text style={tw`text-white font-semibold mb-2`}>Especificaciones</Text>

        <View style={tw`flex-row mb-2`}>
          <TextInput
            placeholder="Especificación"
            placeholderTextColor="#aaa"
            style={tw`flex-1 bg-gray-800 text-white p-3 mr-2 rounded-xl`}
            value={newSpecKey}
            onChangeText={setNewSpecKey}
          />
          <TextInput
            placeholder="Valor"
            placeholderTextColor="#aaa"
            style={tw`flex-1 bg-gray-800 text-white p-3 rounded-xl`}
            value={newSpecValue}
            onChangeText={setNewSpecValue}
          />
        </View>

        {newSpecKey.trim() !== '' && newSpecValue.trim() !== '' && (
          <TouchableOpacity onPress={addSpecification} style={tw`bg-yellow-800 p-3 rounded-xl mb-3`}>
            <Text style={tw`text-white text-center font-semibold`}>Agregar otra especificación</Text>
          </TouchableOpacity>
        )}
        {Object.entries(specifications).map(([key, value]) => (
          <View key={key} style={tw`flex-row justify-between items-center bg-gray-800 p-3 rounded-xl mb-2`}>
            <Text style={tw`text-white flex-1`}>{key}: {value}</Text>
            <TouchableOpacity onPress={() => removeSpecification(key)}>
              <Text style={tw`text-red-500`}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

    </View>
  );
};
