import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import AuthInput from '../../../../../reusable_components/AuthInput';
import { COLORS } from '../../../../../../theme';
import CategorySelectorModal from '../../../../../reusable_components/CategorySelectorModal';


interface Props {
  storeData: any;
  setStoreData: React.Dispatch<React.SetStateAction<any>>;
  categories: { id: number; name: string }[] | undefined;
}

const BasicInfoStep = ({ storeData, setStoreData, categories }: Props) => {

  const [modalVisible, setModalVisible] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  return (
    <View style={tw`p-4 rounded-2xl shadow-lg`}>
      <Text style={tw`text-white text-2xl mb-2 font-bold`}>Datos básicos</Text>

      <View style={tw`p-4 m-2`}>
        <View style={tw`flex-row items-start mb-2`}>
          <Ionicons name="checkmark-circle" size={18} color={COLORS.BlueSkyWord} style={tw`mt-1 mr-2`} />
          <Text style={tw`text-gray-300 text-sm flex-1`}>
            <Text style={tw`font-bold`}>Nombre. </Text>
            Usa un nombre claro y reconocible.
          </Text>
        </View>
        <View style={tw`flex-row items-start mb-2`}>
          <Ionicons name="checkmark-circle" size={18} color={COLORS.BlueSkyWord} style={tw`mt-1 mr-2`} />
          <Text style={tw`text-gray-300 text-sm flex-1`}>
            <Text style={tw`font-bold`}>Descripción. </Text>
            Resume lo que ofreces.
          </Text>
        </View>
        <View style={tw`flex-row items-start`}>
          <Ionicons name="checkmark-circle" size={18} color={COLORS.BlueSkyWord} style={tw`mt-1 mr-2`} />
          <Text style={tw`text-gray-300 text-sm flex-1`}>
            <Text style={tw`font-bold`}>Categoría. </Text>
            Escoge la opción que mejor describe tu tienda.
          </Text>
        </View>
      </View>

      <AuthInput
        placeholder="¿Cómo se llamará tu negocio?"
        value={storeData.name}
        onChangeText={(val) =>
          setStoreData((prev) => ({ ...prev, name: val }))
        }
      />

      <AuthInput
        placeholder="Cuentanos qué ofrece tu negocio en menos de 500 letras."
        value={storeData.description}
        onChangeText={(val) =>
          setStoreData((prev) => ({ ...prev, description: val }))
        }
        multiline
      />

      {/* Selector de categoría como botón */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={tw`bg-gray-800 rounded-xl p-4 mt-2`}
      >
        <Text style={tw`text-gray-300`}>
          {selectedCategory?.name || 'Selecciona una categoría'}
        </Text>
      </TouchableOpacity>

      <CategorySelectorModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        categories={categories}
        onSelect={(category) => {
          console.log('Categoría seleccionada:', category); // 👈 Aquí
          setSelectedCategory(category); // ← esto es solo visual
          setStoreData(prev => ({ ...prev, category })); // ← esto es para enviar
          setModalVisible(false);
        }}
      />
    </View>


  );
};

export default BasicInfoStep;
