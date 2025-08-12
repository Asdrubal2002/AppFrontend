import React, { useCallback, useRef } from 'react';
import { View, Text, ActivityIndicator, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import tw from 'twrnc';
import { useLikedPosts } from '../../api/post/usePosts';
import PostList from '../../reusable_components/PostList';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from "@react-navigation/native";
import { COLORS } from '../../../theme';


const LikedPosts = () => {
  const navigation = useNavigation();

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useLikedPosts();

  const hasFetchedOnce = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (hasFetchedOnce.current) {
        refetch();
      } else {
        hasFetchedOnce.current = true;
      }
    }, [refetch])
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
        <Text style={tw`text-red-500`}>Error al cargar tus posts favoritos.</Text>
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View style={tw`flex-1 items-center justify-center`}>
        <View style={tw`bg-gray-800 p-6 rounded-full mb-4`}>
          <Ionicons name="magnet-outline" size={48} color="#4B5563" />
        </View>
        <Text style={tw`text-gray-300 text-xl font-light mb-6`}>
          No tienes publicaciones favoritas
        </Text>

        <Pressable
          onPress={() =>
            navigation.navigate('Tabs', {
              screen: 'Publicaciones'
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
          <Text style={tw`text-white`}>Explorar negocios</Text>
        </Pressable>
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

export default LikedPosts;
