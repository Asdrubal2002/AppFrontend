import React, { useState, useRef, useCallback, memo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import tw from 'twrnc';
import PostItem from './PostItem';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../theme';
import { useNavigation } from '@react-navigation/native';


const PostList = ({ posts, onRefresh, isRefreshing, onEndReached, isFetchingNextPage }) => {
  const [visiblePostIndex, setVisiblePostIndex] = useState(null);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    setVisiblePostIndex(viewableItems?.[0]?.index ?? null);
  }).current;

  const viewabilityConfig = { itemVisiblePercentThreshold: 60 };

  const renderItem = useCallback(
    ({ item, index }) => (
      <PostItem
        item={item}
        postIndex={index}
        visiblePostIndex={visiblePostIndex}
      />
    ),
    [visiblePostIndex]
  );

  // Aquí creamos el footer con spinner para paginación
  const renderFooter = () => {
    if (!isFetchingNextPage) return null;

    return (
      <View style={tw`py-4`}>
        <ActivityIndicator size="small" color="white" />
      </View>
    );
  };

  const navigation = useNavigation();
  

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item._id.toString()}
      renderItem={renderItem}
      contentContainerStyle={tw`flex-grow`}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.8}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      initialNumToRender={3}
      maxToRenderPerBatch={5}
      windowSize={5}
      removeClippedSubviews={false} // Evitar errores de altura dinámica
      ListFooterComponent={renderFooter}
      ListEmptyComponent={
        <View style={tw`flex-1 items-center justify-center px-6 py-6`}>
          <View style={tw`bg-gray-800 p-6 rounded-full mb-4`}>
            <Ionicons name="aperture-outline" size={48} color="#4B5563" />
          </View>
          <Text style={tw`text-gray-300 text-xl font-medium mb-2`}>
           Tu espacio está vacío por ahora ✨
          </Text>
          <Text style={tw`text-gray-500 text-center mb-6`}>
            Sigue tus negocios favoritos o interactúa con publicaciones para descubrir contenido hecho para ti.
          </Text>
          <Pressable
            onPress={() =>
              navigation.navigate('Tabs', {
                screen: 'Tiendas',
                params: { screen: 'ListStores' }
              })
            }
            style={({ pressed }) => [
              tw`py-3 px-6 rounded-full`,
              {
                backgroundColor: COLORS.BlueWord,
                opacity: pressed ? 0.7 : 1
              }
            ]}
          >
            <Text style={tw`text-white`}>Explorar Comercio</Text>
          </Pressable>

        </View>
      }
    />

  );
};

export default memo(PostList);