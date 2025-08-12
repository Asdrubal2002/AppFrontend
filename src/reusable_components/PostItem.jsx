import React, { useState, useEffect, memo } from 'react';
import {
  Alert,
  Pressable,
  View,
} from 'react-native';

import Header from '../screens/store/componentes/posts/Header';
import PostReactions from '../screens/store/componentes/posts/PostReactions';
import { cleanCache } from '../utils/cache/cache';

import PostMediaCarousel from './components/PostMediaCarousel';
import PostContent from './components/PostContent';
import { getIsSeller, getStoreIds } from '../utils/authStorage';
import { useDeletePostMedia } from '../api/post/usePosts';
import tw from 'twrnc';
import { API_BASE_URL } from '../constants';
import { useNavigation } from '@react-navigation/native';


const PostItem = ({ item, postIndex, visiblePostIndex }) => {
  const [videoPaths, setVideoPaths] = useState({});
  const [likes, setLikes] = useState(item.likes);
  const [isLiked, setIsLiked] = useState(item.is_liked);
  const [canManagePost, setCanManagePost] = useState(false);

  const [postData, setPostData] = useState(item);

  const { mutate: deletePostMedia, isLoading: isDeletingMedia } = useDeletePostMedia();

  const navigation = useNavigation();

  useEffect(() => {
    setLikes(item.likes);
    setIsLiked(item.is_liked);
  }, [item.likes, item.is_liked]);

  useEffect(() => {
    cleanCache(videoPaths);
  }, [videoPaths]);

  // Verifica si es el dueño del post una sola vez aquí
  useEffect(() => {
    const checkOwnership = async () => {
      const isSeller = await getIsSeller();
      const storeIds = await getStoreIds();
      if (isSeller && storeIds.includes(item.store_id)) {
        setCanManagePost(true);
      }
    };
    checkOwnership();
  }, [item.store_id]);

  const getRelativeMediaPath = (mediaUrl: string): string => {
    // Si empieza con dominio (http:// o https://), remueve todo antes de "/media/"
    const match = mediaUrl.match(/(\/media\/.+)/);
    return match ? match[1] : mediaUrl; // si no coincide, devuelve tal cual
  };
  const makeAbsoluteMedia = (mediaArray) => {
    return mediaArray.map((m) => ({
      ...m,
      url: m.url.startsWith('http') ? m.url : `${API_BASE_URL}${m.url}`,
    }));
  };

  const handleNavigate = () => {
    navigation.navigate('PostDetails', {
      postId: item._id,
      storeSlug: item.store_slug,
    });
  };

  const handleDeleteMedia = (mediaUrl) => {
    const relativePath = getRelativeMediaPath(mediaUrl);

    Alert.alert('¿Eliminar archivo?', 'Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          deletePostMedia(
            {
              post_id: postData._id,
              media_url: relativePath,
            },
            {
              onSuccess: () => {
                console.log('Media eliminada correctamente');
                setPostData((prev) => ({
                  ...prev,
                  media: prev.media.filter(
                    (m) => getRelativeMediaPath(m.url) !== relativePath
                  ),
                }));
              },
              onError: (err) => {
                console.error('❌ Error al eliminar media:', err?.response?.data || err.message);
                Alert.alert('Error', 'No se pudo eliminar el archivo');
              },
            }
          );
        },
      },
    ]);
  };


  return (
    <View style={tw``}>
      <Header
        logo={item.store_logo}
        name={item.store_name}
        createdAt={item.created_at}
        slug={item.store_slug}
      />
      <PostMediaCarousel
        media={postData.media}
        visiblePostIndex={visiblePostIndex}
        postIndex={postIndex}
        videoPaths={videoPaths}
        setVideoPaths={setVideoPaths}
        canManagePost={canManagePost}
        onDeleteMedia={handleDeleteMedia}
      />
      {/* Solo esto lleva navegación */}
      <Pressable onPress={handleNavigate}>
        <PostContent title={postData.title} content={postData.content} />
      </Pressable>
      <PostReactions
        postId={postData._id}
        likes={likes}
        commentsCount={item.comments_count}
        isLiked={isLiked}
        storeId={item.store_id}
        canManagePost={canManagePost}
        onUpdateLike={(newLikes, newIsLiked) => {
          setLikes(newLikes);
          setIsLiked(newIsLiked);
        }}
        onPostUpdated={(updatedFields) =>
          setPostData((prev) => ({
            ...prev,
            ...updatedFields,
            media: updatedFields.media
              ? makeAbsoluteMedia(updatedFields.media)
              : prev.media,
          }))
        }
        title={postData.title}
        content={postData.content}
        storeSlug={item.store_slug}
      />
    </View>
  );
};

export default memo(PostItem);