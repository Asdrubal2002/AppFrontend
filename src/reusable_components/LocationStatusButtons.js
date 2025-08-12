import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import { COLORS } from '../../theme';

const LocationStatusButtons = ({
  location,
  isLocating,
  checkPermissionAndLocation,
  setLocation,
  setSelectedCountry,
  setSelectedCity,
  setSelectedNeighborhood,
  label = 'Buscar tiendas cercanas',
  searchingLabel = 'Buscando tiendas...'
}) => {
  const handleClear = () => {
    setLocation(null);
    setSelectedCountry('');
    setSelectedCity('');
    setSelectedNeighborhood('');
  };

  return (
    <View style={tw`items-center justify-center px-4 py-2`}>
      {location ? (
        <>
          <View style={tw`flex-row items-center mb-4`}>
            <Ionicons name="checkmark-circle" size={24} color="#4ADE80" />
            <Text style={tw`text-white font-semibold text-lg ml-2`}>
              Ubicación obtenida
            </Text>
          </View>

          <View style={tw`flex-row w-full max-w-md shadow-lg shadow-black/30`}>
            <TouchableOpacity
              onPress={handleClear}
              disabled={isLocating}
              activeOpacity={0.9}
              style={[
                tw`flex-1 flex-row items-center justify-center py-4`,
                {
                  backgroundColor: isLocating ? '#6B7280' : '#ee2c2cff',
                  borderTopLeftRadius: 12,
                  borderBottomLeftRadius: 12,
                  borderRightWidth: 0.5,
                  borderRightColor: 'rgba(255,255,255,0.2)'
                }
              ]}
            >
              <Ionicons name="close-circle-outline" size={22} color="white" style={tw`mr-2`} />
              <Text style={tw`text-white font-bold text-base`}>Limpiar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={checkPermissionAndLocation}
              disabled={isLocating}
              activeOpacity={0.9}
              style={[
                tw`flex-1 flex-row items-center justify-center py-4`,
                {
                  backgroundColor: isLocating ? '#6B7280' : COLORS.BlueWord,
                  borderTopRightRadius: 12,
                  borderBottomRightRadius: 12,
                  borderLeftWidth: 0.5,
                  borderLeftColor: 'rgba(255,255,255,0.2)'
                }
              ]}
            >
              {isLocating ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="refresh" size={22} color="white" style={tw`mr-2`} />
                  <Text style={tw`text-white font-bold text-base`}>Reubicar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <TouchableOpacity
          onPress={checkPermissionAndLocation}
          disabled={isLocating}
          activeOpacity={0.85}
          style={[
            tw`flex-row items-center rounded-2xl px-4 py-4 w-full my-4`,
            {
              backgroundColor: '#374151', // gris más claro para contraste (tailwind: bg-gray-600)
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
              opacity: isLocating ? 0.6 : 1,
            },
          ]}
        >
          <View style={[tw`rounded-full p-3 mr-4`, { backgroundColor: COLORS.BlueWord }]}>
            {isLocating ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="navigate" size={20} color="white" />
            )}
          </View>

          <View>
            <Text style={tw`text-white font-semibold text-base`}>
              {isLocating ? searchingLabel : label}
            </Text>
            <Text style={tw`text-gray-300 text-sm mt-1`}>
              {isLocating ? 'Buscando tu ubicación' : 'Descubre que hay cerca'}
            </Text>
          </View>
        </TouchableOpacity>


      )}
    </View>
  );
};

export default LocationStatusButtons;
