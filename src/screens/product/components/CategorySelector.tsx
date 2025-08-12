import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import { useStoreCategories } from '../../../api/product/useProducts';
import { COLORS } from '../../../../theme';
import { useNavigation } from '@react-navigation/native';
import { useMemo } from 'react';

export const CategorySelector = ({
  storeId,
  selectedCategoryId,
  onSelect,
}: {
  storeId: number;
  selectedCategoryId: number | null;
  onSelect: (id: number | null, name: string | null) => void;
}) => {
  const navigation = useNavigation(); // 👈 Hook de navegación

  const { data: categories = [], isLoading } = useStoreCategories(storeId, {
    enabled: !!storeId,
  });

  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

  const toggleExpand = (id: number) => {
    setExpandedCategories((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const renderItem = (category, level = 0) => {
    const isExpanded = expandedCategories.includes(category.id);
    const isSelected = selectedCategoryId === category.id;
    const hasChildren = category.subcategories?.length > 0;

    return (
      <View key={category.id} style={{ marginLeft: level * 16 }}>
        <TouchableOpacity
          onPress={() => onSelect(category.id, category.name)}
          style={[
            tw`flex-row justify-between items-center p-3 rounded-lg mb-1`,
            { backgroundColor: isSelected ? COLORS.Modals : '#1f2937' },
          ]}
        >
          <View style={tw`flex-row items-center`}>
            <Ionicons
              name={isSelected ? 'radio-button-on' : 'radio-button-off'}
              size={18}
              color={isSelected ? '#fff' : COLORS.BlueSkyWord}
              style={tw`mr-2`}
            />
            <Text style={tw`text-white`}>{category.name}</Text>
          </View>

          {hasChildren && (
            <TouchableOpacity onPress={() => toggleExpand(category.id)}>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={COLORS.BlueSkyWord}
              />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {isExpanded &&
          category.subcategories?.map((sub) => renderItem(sub, level + 1))}
      </View>
    );
  };

  return (
    <View style={tw`my-4`}>
      <Text style={tw`text-white mb-2`}>Selecciona la categoría a la que pertenece tu producto</Text>

      {isLoading ? (
        <Text style={tw`text-gray-400`}>Cargando categorías...</Text>
      ) : categories.length === 0 ? (
        <View style={tw`p-4 rounded-xl`}>
          <Text style={tw`text-white mb-3`}>
            Aún no has creado tus categorías para mayor organización de tu negocio.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('create-Category', { storeId })}
            style={tw`bg-blue-600 px-4 py-2 rounded-full self-start`}
          >
            <Text style={tw`text-white font-bold`}>Ir a crear categorías</Text>
          </TouchableOpacity>
        </View>
      ) : (
        categories.map((cat) => renderItem(cat))
      )}
    </View>
  );
};