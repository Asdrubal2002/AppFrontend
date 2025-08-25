import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import { COLORS } from '../../theme';
import { API_BASE_URL, DEFAULT_LOGO_BASE64 } from '../constants';


const StoreCard = ({ item, onPress, compact = false }) => {

  if (compact) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={tw`w-48 mr-4 bg-gray-800 rounded-xl overflow-hidden`}
      >
        {/* Imagen o logo */}
        <Image
          source={{
            uri: item.logo || DEFAULT_LOGO_BASE64
          }}
          style={tw`w-full h-24`}
          resizeMode="cover"
          defaultSource={{ uri: DEFAULT_LOGO_BASE64 }}
        />

        {/* Info textual */}
        <View style={tw`p-3`}>
          {/* Nombre + Verificado */}
          <View style={tw`flex-row items-center`}>
            <Text style={tw`text-white font-bold flex-1`} numberOfLines={1}>
              {item.name}
            </Text>
            {item.is_verified && (
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={COLORS.BlueSkyWord}
                style={tw`ml-1`}
              />
            )}
          </View>

          {/* Rating y Categoría */}
          <View style={tw`mt-1`}>
            <View style={tw`flex-row items-center mb-1`}>
              {item.average_rating > 0 ? (
                <>
                  <Ionicons name="star" size={12} color="#FBBF24" />
                  <Text style={tw`text-yellow-300 text-xs ml-1`}>
                    {item.average_rating.toFixed(1)}
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="sparkles" size={12} color="#10B981" />
                  <Text style={tw`text-gray-400 text-xs ml-1`}>¡Nuevo!</Text>
                </>
              )}
            </View>

            <View style={tw`flex-row items-center`}>
              <Ionicons name="pricetag" size={12} color="#A855F7" />
              <Text style={tw`text-purple-300 text-xs ml-1`} numberOfLines={1}>
                {item.category_name || 'Sin categoría'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }


  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={tw`mb-4`}
    >
      <View style={tw`bg-gray-800 rounded-xl overflow-hidden`}>
        {/* Contenedor principal */}
        <View style={tw`flex-row p-4`}>
          {/* Imagen con efecto hover (para web) */}
          <View style={tw`relative w-20 h-20 rounded-full overflow-hidden bg-gray-700 `}>
            <Image
              source={{
                uri: item.logo ? `${item.logo}` : DEFAULT_LOGO_BASE64
              }}
              style={tw`w-full h-full`}
              resizeMode="cover"
            />
            {/* Overlay sutil */}
            <View style={tw`absolute inset-0 bg-black/10`} />
          </View>

          {/* Contenido textual */}
          <View style={tw`flex-1 ml-4 justify-between`}>
            {/* Línea superior: Nombre + Badge */}
            <View style={tw`flex-row justify-between items-start`}>
              <View style={tw`flex-1 pr-2`}>
                <View style={tw`flex-row items-center`}>
                  <Text
                    style={tw`text-white font-bold text-lg leading-5`}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  {item.is_verified && (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={COLORS.BlueSkyWord}
                      style={tw`ml-1.5`}
                    />
                  )}
                </View>

                {/* Rating y categoría (nueva línea) */}
                <View style={tw`flex-row flex-wrap items-center mt-1 gap-2 max-w-full`}>
                  {/* Si tiene rating > 0, aunque sea 0.1 */}
                  {item.average_rating > 0 ? (
                    <View style={tw`flex-row items-center px-2 py-0.5 rounded-full`}>
                      <Ionicons name="star" size={12} color="#FBBF24" />
                      <Text style={tw`text-yellow-300 text-xs ml-1 font-medium`}>
                        {item.average_rating.toFixed(1)}
                      </Text>
                    </View>
                  ) : (
                    /* Si rating es 0, mostramos estado */
                    <View style={tw`flex-row items-center px-2 py-0.5 rounded-full`}>
                      <Ionicons name="sparkles" size={12} color="#10B981" style={tw`mr-1`} />
                      <Text style={tw`text-gray-400 text-xs font-medium`}>
                        {item.average_rating === 0 ? "¡Nuevo!" : "Sin calificaciones"}
                      </Text>
                    </View>
                  )}

                  {/* 3. Categoría (siempre visible) */}
                  <View style={tw`flex-row items-center bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-400/30`}>
                    <Ionicons name="pricetag" size={12} color="#A855F7" style={tw`mr-1`} />
                    <Text style={tw`text-purple-300 text-xs font-medium`}>{item.category_name}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Descripción */}
            <Text
              style={tw`text-gray-300 text-sm mt-2 leading-4`}
              numberOfLines={2}
            >
              {item.description || "Tienda especializada en productos locales de alta calidad."}
            </Text>
            {/* Ubicación y CTA */}
            <View style={tw`flex-row justify-between items-center mt-3`}>
              <View style={tw`flex-row items-center`}>
                <Ionicons name="location-outline" size={14} color="#9CA3AF" />
                <Text style={tw`text-gray-400 text-xs ml-1`}>
                  {[item.city_name, item.neighborhood_name].filter(Boolean).join(' • ')}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default StoreCard;
