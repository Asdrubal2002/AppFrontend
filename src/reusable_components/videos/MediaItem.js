import React, { useEffect, useState } from "react";
import CachedVideo from "./CachedVideo";
import { Image, TouchableOpacity, View } from "react-native";
import { Dimensions } from 'react-native';
import tw from 'twrnc';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { API_BASE_URL } from "../../constants";


const { width: screenWidth } = Dimensions.get('window');
const PORTRAIT_ASPECT_RATIO = 9 / 16; // Aspect ratio vertical para videos

const MediaItem = ({
  mediaItem,
  isVisible,
  isMediaVisible,
  videoPaths,
  setVideoPaths,
  canManagePost,
  onDeleteMedia,
}) => {
  const [imageAspectRatio, setImageAspectRatio] = useState(1);
  console.log(`${API_BASE_URL}${mediaItem.url}`)

  const getFullMediaUrl = (url) => {
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
  };


  useEffect(() => {
    if (mediaItem.type === 'image') {
      Image.getSize(mediaItem.url, (width, height) => {
        setImageAspectRatio(width / height);
      }, () => setImageAspectRatio(1));
    }
  }, [mediaItem.url]);

  // Contenedor padre para CENTRAR el contenido
  const containerStyle = {
    width: screenWidth,
    justifyContent: 'center', // Centra verticalmente
    alignItems: 'center', // Centra horizontalmente
    backgroundColor: 'black', // Fondo negro para videos (opcional)
  };

  const renderDeleteButton = () =>
    canManagePost && (
      <TouchableOpacity
        onPress={() => onDeleteMedia(mediaItem.url)}
        style={tw`absolute top-3 right-3 bg-black bg-opacity-50 p-1 rounded-full z-50`}
      >
        <Ionicons name="close-circle" size={26} color="white" />
      </TouchableOpacity>
    );

  if (mediaItem.type === 'video') {
    return (
      <View style={containerStyle}>
        {renderDeleteButton()}
        <CachedVideo
          uri={getFullMediaUrl(mediaItem.url)}
          paused={!isVisible || !isMediaVisible}
          style={{
            width: screenWidth,
            height: screenWidth / PORTRAIT_ASPECT_RATIO,
          }}
          resizeMode="cover"
        />
      </View>
    );
  }

  // Para imágenes (altura automática)
  return (
    <View style={containerStyle}>
      {renderDeleteButton()}
      <Image
        source={{ uri: getFullMediaUrl(mediaItem.url)  }}
        style={{
          width: screenWidth,
          height: screenWidth / imageAspectRatio,
        }}
        resizeMode="contain"
      />
    </View>
  );
};

export default React.memo(MediaItem);
