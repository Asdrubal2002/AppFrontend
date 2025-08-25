import React, { useCallback, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, Image, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigation } from "@react-navigation/native";

import tw from 'twrnc';
import { useStoreCombos } from '../../../api/store/useStores';
import { API_BASE_URL, DEFAULT_LOGO_BASE64 } from '../../../constants';

const CombosList = ({ storeId }) => {
  const queryClient = useQueryClient();
  const queryKey = ['storeCombos', storeId];
  const navigation = useNavigation();

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useStoreCombos(storeId); // ya está paginado

  useFocusEffect(
    useCallback(() => {
      refetch(); // al entrar
      return () => {
        queryClient.removeQueries({ queryKey, exact: true }); // al salir
      };
    }, [refetch, queryClient, storeId])
  );

  const combos = data?.pages?.flatMap(page => page.results) || [];

  const loadMore = () => {
    const lastPage = data?.pages[data.pages.length - 1];
    if (!isFetchingNextPage && lastPage?.next) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <View style={tw`flex-1 justify-center items-center mt-4`}>
        <ActivityIndicator color="white" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <Text style={tw`text-red-500`}>Error al cargar los combos.</Text>
      </View>
    );
  }

  if (combos.length === 0) {
    return (
      <View style={tw`items-center mt-10`}>
        <Text style={tw`text-white text-base`}>No hay combos disponibles en esta tienda.</Text>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 px-2 py-4`}>
      <FlatList
        data={combos}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshing={isRefetching}
        onRefresh={refetch}
        showsVerticalScrollIndicator={false}

        renderItem={({ item }) => (
          <TouchableOpacity
            style={tw`mb-4 mx-4 rounded-xl shadow-sm bg-gray-800/80`}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ComboDetail', { comboId: item.id })}
          >
            {item.image && (
              <Image
                source={{
                  uri: item.image ? `${item.image}` : DEFAULT_LOGO_BASE64,
                }}
                style={tw`w-full h-40 rounded-t-xl`}
                resizeMode="cover"
              />
            )}

            <View style={tw`p-4`}>
              <Text style={tw`text-lg font-bold text-white`}>{item.name}</Text>

              {item.description ? (
                <Text style={tw`text-sm text-gray-300 mb-1`}>{item.description}</Text>
              ) : null}

              <Text style={tw`text-green-400 font-semibold text-lg`}>
                ${parseFloat(item.price).toLocaleString()}
              </Text>
            </View>
          </TouchableOpacity>

        )}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={tw`py-4`}>
              <ActivityIndicator size="small" color="white" />
            </View>
          ) : null
        }
      />

    </View>


  );
};

export default CombosList;
