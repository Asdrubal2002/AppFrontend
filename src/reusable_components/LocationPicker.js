// components/LocationPicker.js
import React from 'react';
import { Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import { COLORS } from '../../theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

const LocationPicker = ({
  location,
  selectedCountry,
  setSelectedCountry,
  selectedCity,
  setSelectedCity,
  selectedNeighborhood,
  setSelectedNeighborhood,
  countries = [],
  cities = [],
  neighborhoods = [],
  isCountriesLoading,
  labelCountry = "Elige el país",
  labelCity = "Selecciona la ciudad",
  labelNeighborhood = "Indica el barrio/pueblo/Vereda",
}) => {
  if (isCountriesLoading) {
    return (
      <View style={tw`py-10 items-center justify-center`}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }
  return (
    <View style={tw`px-2`}>
      {/* === País === */}
      {!location && selectedCountry ? (
        <View style={tw`flex-row items-center justify-between bg-gray-800 rounded-lg px-4 py-3 mb-4 shadow`}>
          <View style={tw`flex-row items-center`}>
            <Ionicons name="earth-outline" size={20} color="#60a5fa" style={tw`mr-2`} />
            <Text style={tw`text-white font-medium`}>
              País: <Text style={tw`font-semibold text-blue-300`}>{countries.find(c => c.id === selectedCountry)?.name}</Text>
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setSelectedCountry('');
              setSelectedCity('');
              setSelectedNeighborhood('');
            }}
            style={tw`flex-row items-center`}
          >
            <Text style={tw`text-blue-400 mr-1`}>Cambiar</Text>
            <Ionicons name="pencil-outline" size={16} color="#60a5fa" />
          </TouchableOpacity>
        </View>
      ) : (
        !location && (
          <>
            <Text style={tw`text-gray-300 mb-3 text-base font-semibold`}>{labelCountry}</Text>
            <View style={tw`flex-row flex-wrap gap-3 mb-4`}>
              {countries.map((country) => (
                <View key={country.id} style={tw`min-w-[48%] flex-1`}>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedCountry(country.id);
                      setSelectedCity('');
                      setSelectedNeighborhood('');
                    }}
                    style={tw.style(
                      'px-5 py-3 rounded-xl border',
                      selectedCountry === country.id
                        ? 'bg-blue-600 border-blue-400 shadow-md'
                        : 'bg-gray-800 border-gray-700'
                    )}
                  >
                    <Text
                      style={tw.style(
                        'text-white text-center',
                        selectedCountry === country.id ? 'font-semibold' : 'font-medium'
                      )}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {country.name}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )
      )}

      {/* === Ciudad === */}
      {!location && selectedCity ? (
        <View style={tw`flex-row items-center justify-between bg-gray-800 rounded-lg px-4 py-3 mb-4 shadow`}>
          <View style={tw`flex-row items-center`}>
            <Ionicons name="business-outline" size={20} color="#60a5fa" style={tw`mr-2`} />
            <Text style={tw`text-white font-medium`}>
              Ciudad: <Text style={tw`font-semibold text-blue-300`}>{cities.find(c => c.id === selectedCity)?.name}</Text>
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setSelectedCity('');
              setSelectedNeighborhood('');
            }}
            style={tw`flex-row items-center`}
          >
            <Text style={tw`text-blue-400 mr-1`}>Cambiar</Text>
            <Ionicons name="pencil-outline" size={16} color="#60a5fa" />
          </TouchableOpacity>
        </View>
      ) : (
        !location && selectedCountry && (
          <>
            <Text style={tw`text-gray-300 mb-3 text-base font-semibold`}>{labelCity}</Text>
            <View style={tw`flex-row flex-wrap gap-3 mb-4`}>
              {cities.map((city) => (
                <View key={city.id} style={tw`min-w-[48%] flex-1`}>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedCity(city.id);
                      setSelectedNeighborhood('');
                    }}
                    style={tw.style(
                      'px-5 py-3 rounded-xl border',
                      selectedCity === city.id
                        ? 'bg-blue-600 border-blue-400 shadow-md'
                        : 'bg-gray-800 border-gray-700'
                    )}
                  >
                    <Text
                      style={tw.style(
                        'text-white text-center',
                        selectedCity === city.id ? 'font-semibold' : 'font-medium'
                      )}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {city.name}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )
      )}

      {/* === Barrio === */}
      {!location && selectedNeighborhood ? (
        <View style={tw`flex-row items-center justify-between bg-gray-800 rounded-lg px-4 py-3 mb-4 shadow`}>
          <View style={tw`flex-row items-center`}>
            <Ionicons name="location-outline" size={20} color="#60a5fa" style={tw`mr-2`} />
            <Text style={tw`text-white font-medium`}>
              Barrio: <Text style={tw`font-semibold text-blue-300`}>{neighborhoods.find(n => n.id === selectedNeighborhood)?.name}</Text>
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setSelectedNeighborhood('')}
            style={tw`flex-row items-center`}
          >
            <Text style={tw`text-blue-400 mr-1`}>Cambiar</Text>
            <Ionicons name="pencil-outline" size={16} color="#60a5fa" />
          </TouchableOpacity>
        </View>
      ) : (
        !location && selectedCity && (
          <>
            <Text style={tw`text-gray-300 mb-3 text-base font-semibold`}>{labelNeighborhood}</Text>
            <View style={tw`flex-row flex-wrap gap-3 mb-4`}>
              {neighborhoods.map((neigh) => (
                <View key={neigh.id} style={tw`min-w-[48%] flex-1`}>
                  <TouchableOpacity
                    onPress={() => setSelectedNeighborhood(neigh.id)}
                    style={tw.style(
                      'px-5 py-3 rounded-xl border',
                      selectedNeighborhood === neigh.id
                        ? 'bg-blue-600 border-blue-400 shadow-md'
                        : 'bg-gray-800 border-gray-700'
                    )}
                  >
                    <Text
                      style={tw.style(
                        'text-white text-center',
                        selectedNeighborhood === neigh.id ? 'font-semibold' : 'font-medium'
                      )}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {neigh.name}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )
      )}
      {!location && selectedCountry && (
        <View style={tw`mb-4 p-4 rounded-xl bg-gray-900 border border-gray-700`}>
          <Text style={tw`text-white font-semibold text-base mb-2 text-center`}>
            Zona seleccionada:
          </Text>

          {selectedNeighborhood ? (
            <Text style={tw`text-gray-300 text-sm text-center`}>
              Estás cubriendo <Text style={tw`text-white font-medium`}>{neighborhoods.find(n => n.id === selectedNeighborhood)?.name}</Text> en la ciudad de <Text style={tw`text-white font-medium`}>{cities.find(c => c.id === selectedCity)?.name}</Text>, <Text style={tw`text-white font-medium`}>{countries.find(c => c.id === selectedCountry)?.name}</Text>.
            </Text>
          ) : selectedCity ? (
            <Text style={tw`text-gray-300 text-sm text-center`}>
              Estás cubriendo la <Text style={tw`text-white font-medium`}>ciudad de {cities.find(c => c.id === selectedCity)?.name}</Text>, <Text style={tw`text-white font-medium`}>{countries.find(c => c.id === selectedCountry)?.name}</Text>.
            </Text>
          ) : (
            <Text style={tw`text-gray-300 text-sm text-center`}>
              Estás cubriendo todo el país: <Text style={tw`text-white font-medium`}>{countries.find(c => c.id === selectedCountry)?.name}</Text>.
            </Text>
          )}
        </View>
      )}

    </View>
  );
};

export default LocationPicker;
