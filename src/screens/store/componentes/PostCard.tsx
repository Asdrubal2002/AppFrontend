import React from 'react';
import { View, Text, Image, FlatList } from 'react-native';
import tw from 'twrnc';

const PostCard = ({ title, content, media, storeName, storeLogo }) => {
  // Filtra solo imágenes
  const imageMedia = media?.filter((m) => m.media_type === 'image') || [];

  return (
    <View style={tw`bg-white rounded-xl shadow-md p-4 mb-4`}>
      {/* Header con logo y nombre */}
      <View style={tw`flex-row items-center mb-2`}>
        <Text>{storeLogo}</Text>
        {storeLogo ? (
          <Image
            source={{ uri: storeLogo }}
            style={tw`w-10 h-10 rounded-full mr-2`}
          />
        ) : (
          <View style={tw`w-10 h-10 rounded-full bg-gray-300 mr-2`} />
        )}
        <Text style={tw`text-lg font-semibold`}>{storeName}</Text>
      </View>

      {/* Título */}
      <Text style={tw`text-base font-bold mb-1`}>{title}</Text>

      {/* Contenido */}
      {content ? (
        <Text style={tw`text-gray-700 mb-2`}>{content}</Text>
      ) : null}
      
      {/* Galería de imágenes */}
      {imageMedia.length > 0 && (
        <FlatList
          horizontal
          data={imageMedia}
          keyExtractor={(item, index) => item.url + index}
          showsHorizontalScrollIndicator={false}
          style={tw`-mx-1`}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item.url }}
              style={tw`w-40 h-40 rounded-lg mx-1`}
              resizeMode="cover"
            />
            
          )}
        />
      )}
    </View>
  );
};

export default PostCard;
