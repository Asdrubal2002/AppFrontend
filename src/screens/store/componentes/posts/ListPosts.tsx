import React from 'react';
import { View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import StorePosts from '../StorePosts';
import tw from 'twrnc';

const ListPosts = () => {
  const route = useRoute();
  const { storeId } = route.params;

  return (
    <View style={tw`flex-1`}>
      {/* Botón de Agregar Post */}
    
      {/* Lista de publicaciones */}
      <StorePosts storeId={storeId} />
    </View>
  );
};

export default ListPosts;