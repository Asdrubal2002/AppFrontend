import React, { memo, useCallback, useState } from "react";
import MediaItem from "../videos/MediaItem";
import PaginationDots from "../../screens/store/componentes/posts/PaginationDots";
import { FlatList, Dimensions } from "react-native";

const screenWidth = Dimensions.get('window').width;

const PostMediaCarousel = ({
  media,
  visiblePostIndex,
  postIndex,
  videoPaths,
  setVideoPaths,
  canManagePost,
  onDeleteMedia,
}) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const handleScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
    setCurrentMediaIndex(index);
  };

  const renderMedia = useCallback(
    ({ item, index }) => (
      <MediaItem
        mediaItem={item}
        isVisible={visiblePostIndex === postIndex}
        isMediaVisible={index === currentMediaIndex}
        videoPaths={videoPaths}
        setVideoPaths={setVideoPaths}
        canManagePost={canManagePost}
        onDeleteMedia={onDeleteMedia}
      />
    ),
    [visiblePostIndex, postIndex, currentMediaIndex, videoPaths, canManagePost, onDeleteMedia]
  );

  return (
    <>
      <FlatList
        data={media}
        horizontal
        pagingEnabled
        snapToInterval={screenWidth}
        decelerationRate="fast"
        keyExtractor={(item, index) => `${item.url}-${index}`}
        getItemLayout={(_, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        renderItem={renderMedia}
      />
      {media.length > 1 && (
        <PaginationDots total={media.length} currentIndex={currentMediaIndex} />
      )}
    </>
  );
};

export default React.memo(PostMediaCarousel);