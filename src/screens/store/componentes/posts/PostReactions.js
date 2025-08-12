import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Animated, Pressable, Alert, TextInput } from 'react-native';
import tw from 'twrnc';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ReusableModal from '../../../../reusable_components/ReusableModal';
import { useCreateComment, useDeletePost, useEditPost, usePostComments, useToggleLike, useUploadPostMedia } from '../../../../api/post/usePosts';
import UserCommentCard from '../../../../reusable_components/UserCommentCard';
import { COLORS } from '../../../../../theme';
import { getIsSeller, getStoreIds } from '../../../../utils/authStorage';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStatus } from '../../../../api/auth/useUsers';
import AuthButton from '../../../../reusable_components/AuthButton';
import { launchImageLibrary } from 'react-native-image-picker';
import { StyleSheet } from 'react-native';
import AuthInput from '../../../../reusable_components/AuthInput';



const ReactionButton = ({ icon, label, onPress, color = '#fff', loading = false, disabled = false }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!disabled) {
      Animated.spring(scale, {
        toValue: 0.93,
        useNativeDriver: true,
        speed: 40,
        bounciness: 10,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 6,
      }).start();
    }
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={!disabled && !loading ? onPress : null}
      disabled={disabled || loading}
    >
      <Animated.View
        style={[
          tw`flex-row items-center px-3`,
          {
            gap: 6,
            opacity: disabled ? 0.4 : 1,
            transform: [{ scale }],
          },
        ]}
      >
        <Ionicons name={icon} size={24} color={color} />
        {label ? (
          <Text style={tw`text-xs text-gray-300 font-medium`}>
            {label}
          </Text>
        ) : null}
      </Animated.View>
    </Pressable>
  );
};

const PostReactions = ({
  postId,
  likes,
  commentsCount,
  isLiked,
  onUpdateLike,
  storeId,
  canManagePost,
  onPostUpdated,
  title,
  content,
  storeSlug,
  media,
}) => {

  const [modalVisible, setModalVisible] = useState(false);
  const [shouldFetchComments, setShouldFetchComments] = useState(false);
  const [localCommentsCount, setLocalCommentsCount] = useState(commentsCount);
  const [commentText, setCommentText] = useState('');

  const queryClient = useQueryClient();
  const { isAuthenticated, loading: authLoading } = useAuthStatus();

  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);

  const { mutate: editPost, isLoading: isEditing } = useEditPost();
  const { mutate: uploadMedia, isLoading: uploadingMedia } = useUploadPostMedia();

  const { mutate: deletePost, isLoading: deleting } = useDeletePost();
  const { mutate: createComment, isLoading: isCreating } = useCreateComment();
  const { toggleLike, loading } = useToggleLike();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isLoading,
  } = usePostComments(postId, shouldFetchComments);

  const comments = data?.pages?.flatMap(page => page.results) || [];

  useEffect(() => {
    setLocalCommentsCount(commentsCount);
  }, [commentsCount]);

  const openModal = () => {
    setModalVisible(true);
    setShouldFetchComments(true);
    refetch();
  };

  const closeModal = () => {
    setModalVisible(false);
    setShouldFetchComments(false);
  };

  const handleLike = async () => {
    const optimisticLikes = isLiked ? likes - 1 : likes + 1;
    const optimisticIsLiked = !isLiked;

    onUpdateLike(optimisticLikes, optimisticIsLiked);

    const result = await toggleLike(postId);

    if (!result || result.likes === undefined || result.is_liked === undefined) {
      onUpdateLike(likes, isLiked); // Revertir en caso de error
    } else {
      onUpdateLike(result.likes, result.is_liked); // Confirmar con datos reales
    }
  };

  const handleDelete = () => {
    Alert.alert('¿Eliminar publicación?', 'Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          deletePost(postId, {
            onSuccess: () => {
              queryClient.invalidateQueries({
                queryKey: ['storePosts', storeId],
                exact: true,
              });
            },
            onError: (err) => console.error('Error al eliminar post', err),
          });
        },
      },
    ]);
  };

  const handleSendComment = () => {
    const trimmedText = commentText.trim();

    if (trimmedText.length < 5) {
      Alert.alert('Comentario muy corto', 'Debe tener al menos 5 caracteres.');
      return;
    }

    if (trimmedText.length > 300) {
      Alert.alert('Comentario muy largo', 'No debe superar los 300 caracteres.');
      return;
    }

    createComment(
      { post_id: postId, content: trimmedText },
      {
        onSuccess: (newComment) => {
          setCommentText('');
          setLocalCommentsCount((prev) => prev + 1);

          queryClient.setQueryData(['postComments', postId], (oldData) => {
            if (!oldData) return oldData;
            const updatedFirstPage = {
              ...oldData.pages[0],
              results: [newComment, ...oldData.pages[0].results],
            };
            return {
              ...oldData,
              pages: [updatedFirstPage, ...oldData.pages.slice(1)],
            };
          });
        },
      }
    );
  };

  const renderItem = ({ item }) => (
    <UserCommentCard
      initials={item.initials}
      username={item.username}
      content={item.content}
      createdAt={item.created_at}
    />
  );

  const handleSelectMedia = async () => {
    const result = await launchImageLibrary({ mediaType: 'mixed', selectionLimit: 5 });
    if (result.assets) {
      const files = result.assets
        .filter(asset => asset.uri && asset.type)
        .map(asset => ({
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName || 'media',
        }));
      setSelectedFiles(files);
    }

  };

  return (
    <>
      <View style={tw`flex-row justify-evenly items-center py-4 border-b border-white/20`}>
        <ReactionButton
          icon="chatbox-ellipses-outline"
          label={`${localCommentsCount}`}
          color="#d1d5db"
          onPress={openModal}
        />

        <ReactionButton
          icon={isLiked ? 'sparkles' : 'star-outline'}
          label={`${likes}`}
          color={isLiked ? COLORS.BlueSkyWord : '#d1d5db'}
          onPress={handleLike}
          loading={loading}
          disabled={!isAuthenticated}
        />

        {canManagePost && (
          <>
            <ReactionButton
              icon="create-outline"
              color="#60a5fa"
              onPress={() => {
                setEditTitle(title || '');
                setEditContent(content || '');
                setEditModalVisible(true);
              }}
            />

            <ReactionButton
              icon="trash-outline"
              color="#f87171"
              onPress={handleDelete}
              loading={deleting}
            />
          </>
        )}
      </View>

      <ReusableModal visible={modalVisible} onClose={closeModal} hasFlatList={true}>
        <Text style={tw`text-white text-lg`}>Comentarios de la publicación</Text>

        {isAuthenticated && (
          <View style={tw`flex-row items-center my-4 px-3 py-2 border-b border-gray-500`}>
            <TextInput
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Escribe un comentario..."
              placeholderTextColor="#aaa"
              style={tw`flex-1 text-white pr-2`}
              multiline
              underlineColorAndroid="transparent"
            />
            <TouchableOpacity
              onPress={handleSendComment}
              disabled={isCreating || !commentText.trim()}
              style={tw`p-2`}
            >
              <Ionicons
                name={isCreating ? 'hourglass-outline' : 'send'}
                size={24}
                color={isCreating || !commentText.trim() ? '#666' : COLORS.BlueSkyWord}
              />
            </TouchableOpacity>
          </View>
        )}

        {!authLoading && !isAuthenticated && (
          <Text style={tw`text-white mt-4`}>
            Debes iniciar sesión para comentar.
          </Text>
        )}

        {isLoading && <ActivityIndicator color="#fff" size="large" />}
        {!isLoading && (
          <FlatList
            data={comments}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={isFetchingNextPage ? <ActivityIndicator color="#fff" /> : null}
            style={{ maxHeight: 400 }}
          />
        )}
      </ReusableModal>

      <ReusableModal visible={editModalVisible} onClose={() => setEditModalVisible(false)}>
        <Text style={tw`text-white text-xl font-bold mb-4`}>Editar publicación</Text>

        {/* Título de la publicación */}
        <Text style={tw`text-gray-400 mb-1`}>Título</Text>
        <AuthInput
          label="Nuevo título"
          placeholder="Link de la pasarela"
          value={editTitle}
          onChangeText={setEditTitle}
        />
        <AuthInput
          label="Nuevo contenido"
          placeholder="Contenido de tu publicación"
          value={editContent}
          onChangeText={setEditContent}
          multiline
        />

       
        {/* Adjuntar archivos */}
        <Text style={tw`text-gray-300 mb-2`}>Adjuntar archivos multimedia:</Text>
        <TouchableOpacity
          onPress={handleSelectMedia}
          style={tw`bg-gray-800 px-4 py-2 rounded-md items-center justify-center`}
          activeOpacity={0.7}
        >
          <Ionicons name="image-outline" size={22} color="#E5E7EB" />
        </TouchableOpacity>

        {/* Número de archivos seleccionados */}
        <Text style={tw`text-gray-400 mt-2`}>
          Archivos nuevos seleccionados: {selectedFiles.length}
        </Text>


        {/* guardar los cambios */}
        <AuthButton
          onPress={() => {
            setEditModalVisible(false);
            const title = editTitle.trim();
            const content = editContent.trim();

            if (!title) {
              Alert.alert('Error', 'Debes ingresar un título a tu publicación');
              return;
            }

            if (title.length > 100) {
              Alert.alert('Error', 'El título no puede tener más de 100 caracteres');
              return;
            }

            if (content.length > 500) {
              Alert.alert('Error', 'El contenido no puede tener más de 500 caracteres');
              return;
            }

            setShowLoadingOverlay(true); // Mostramos el overlay

            editPost(
              { post_id: postId, title, content },
              {
                onSuccess: () => {
                  if (selectedFiles.length > 0) {
                    uploadMedia(
                      {
                        post_id: postId,
                        store_slug: storeSlug,
                        files: selectedFiles,
                      },
                      {
                        onSuccess: (res) => {
                          Alert.alert('Éxito', 'Post actualizado con media');
                          setEditModalVisible(false);
                          setSelectedFiles([]);
                          setShowLoadingOverlay(false);

                          onPostUpdated?.({
                            title,
                            content,
                            media: [...(media || []), ...(res?.media || [])], // ✅ protegido y correcto
                          });
                        },
                        onError: (err) => {
                          console.error('Error al subir media', err);
                          Alert.alert('Error', 'No se pudo subir la media');
                          setShowLoadingOverlay(false);
                        },
                      }
                    );
                  } else {
                    Alert.alert('Éxito', 'Post actualizado');
                    setEditModalVisible(false);
                    setShowLoadingOverlay(false);
                    onPostUpdated?.({ title, content });
                  }
                },
                onError: (err) => {
                  console.error('Error actualizando post', err);
                  Alert.alert('Error', 'No se pudo actualizar la publicación');
                  setShowLoadingOverlay(false);
                },
              }
            );
          }}
          disabled={isEditing || uploadingMedia}
          style={tw`bg-blue-500 px-4 py-2 rounded-lg mt-2`}
          title="Actualizar mi publicación"
        >

        </AuthButton>
      </ReusableModal >
      {showLoadingOverlay && (
        <View style={[StyleSheet.absoluteFill, tw`bg-black bg-opacity-40 justify-center items-center`]}>
          <View style={tw`bg-white rounded-xl p-6 items-center shadow-lg`}>
            <ActivityIndicator size="large" color={COLORS.BlueWord} />
            <Text style={tw`text-gray-700 mt-4 text-lg`}>Validando, por favor espera...</Text>
          </View>
        </View>
      )
      }

    </>
  );
};

export default React.memo(PostReactions);