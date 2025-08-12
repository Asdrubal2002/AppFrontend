import React, { useCallback, useRef, useState } from 'react';
import { useStorePosts } from '../../../api/post/usePosts';
import { Text, View, ActivityIndicator } from 'react-native';
import tw from 'twrnc';

import PostList from '../../../reusable_components/PostList';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';


const StorePosts = ({ storeId }) => {
  const queryClient = useQueryClient();
  const queryKey = ['storePosts', storeId];

  const [forceReload, setForceReload] = useState(false);

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useStorePosts(storeId); // Quita el enabled: forceReload

  useFocusEffect(
    useCallback(() => {
      refetch(); // Recarga los datos al entrar

      return () => {
        queryClient.removeQueries({ queryKey, exact: true });
      };
    }, [refetch, queryClient, storeId]) // Añade refetch y queryClient a dependencias
  );

  const posts = data?.pages?.flatMap(page => page.posts) || [];
  const loadMore = () => {
    const lastPage = data?.pages[data.pages.length - 1];
    if (!isFetchingNextPage && lastPage?.page < lastPage?.total_pages) {
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
        <Text style={tw`text-red-500`}>Error al cargar los posts.</Text>
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View style={tw`items-center mt-10`}>
        <Text style={tw`text-white text-base`}>No hay post de este negocio</Text>
      </View>
    );
  }

  return (
    <PostList
      posts={posts}
      onRefresh={refetch}
      isRefreshing={isRefetching}
      onEndReached={loadMore}
      isFetchingNextPage={isFetchingNextPage}
    />
  );
};

export default StorePosts;
