// src/screens/TestQuery.js
import React from 'react';
import { View, Text, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { usePublicPosts, useRecommendedPosts } from './api/post/usePosts';
import PostList from './reusable_components/PostList';
import { useAuthStatus } from './api/auth/useUsers';
import { useNavigation } from '@react-navigation/native';
import tw from 'twrnc';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AuthPrompt from './reusable_components/AuthPrompt';


export default function TestQuery() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { isAuthenticated, loading } = useAuthStatus();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
    isLoading,
    isError,
    refetch,
  } = isAuthenticated ? useRecommendedPosts() : usePublicPosts();

  // 🔁 Limpia y refresca al montar/desmontar
  useFocusEffect(
    useCallback(() => {
      refetch(); // Recarga los datos al entrar

      return () => {
        const key = isAuthenticated ? ['recommendedPosts'] : ['publicPosts'];
        queryClient.removeQueries({ queryKey: key, exact: true });
      };
    }, [refetch, queryClient, isAuthenticated])
  );

  // 🧼 Elimina duplicados
  const posts = Array.from(
    new Map(
      (data?.pages.flatMap((page) => page.posts) || []).map(post => [post._id, post])
    ).values()
  );

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (loading || isLoading) {
    return (
      <View style={tw`py-4`}>
        <ActivityIndicator size="small" color="white" />
      </View>
    );
  }

  return (
    <View style={tw`flex-1`}>
      {/* Mostrar aviso si no está autenticado */}
      {!isAuthenticated && (
        <AuthPrompt
          title="¡Desbloquea experiencias personalizadas!"
          message="Inicia sesión para recibir recomendaciones exclusivas basadas en tus intereses"
        />
      )}

      <PostList
        posts={posts}
        onRefresh={refetch}
        isRefreshing={isRefetching}
        onEndReached={loadMore}
        isFetchingNextPage={isFetchingNextPage}
      />
    </View>
  );
}
