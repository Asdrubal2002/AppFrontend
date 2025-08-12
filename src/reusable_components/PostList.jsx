import React, { useState, useRef, useCallback, memo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import tw from 'twrnc';
import PostItem from './PostItem';

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

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item._id.toString()}
      renderItem={renderItem}
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
    />
  );
};

export default memo(PostList);