// components/SearchWithFiltersBar.js
import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';

const SearchWithFiltersBar = ({
  search,
  setSearch,
  placeholder = '¿Qué estás buscando?',
  onOpenFilters,
  iconSize = 24,
  marginBottom = 'mb-4',
}) => {
  return (
    <View style={tw`flex-row items-center bg-gray-700 rounded-2xl px-4 ${marginBottom}`}>
      <Ionicons name="search" size={20} color="#ffffff" style={tw`mr-2`} />

      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#ccc"
        value={search}
        onChangeText={setSearch}
        autoCorrect={false}
        autoCapitalize="none"
        style={tw`flex-1 text-white text-base py-2`}
        multiline
      />

      <TouchableOpacity onPress={onOpenFilters} style={tw`ml-2`}>
        <Ionicons name="options-outline" size={iconSize} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};

export default SearchWithFiltersBar;
