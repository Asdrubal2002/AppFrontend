import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, Animated,
  Easing, ActivityIndicator, RefreshControl, Image
} from 'react-native';

import tw from 'twrnc';
import { useCities, useNeighborhoods, useCategories, useCountries } from '../../api/store/useStores';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import ReusableModal from '../../reusable_components/ReusableModal';
import { useDebounce } from 'use-debounce';
import { useLocation } from '../../utils/contexts/LocationContext';
import { useGetCurrentLocation } from '../../utils/useGetCurrentLocation';
import LocationPicker from '../../reusable_components/LocationPicker';
import { useInfiniteProducts, useInfiniteStores } from '../../api/storeAndProducts/hooks';
import { ScrollView } from 'react-native-gesture-handler';
import { COLORS } from '../../../theme';
import ProductCard from '../product/ProductCard';
import StoreCard from '../../reusable_components/StoreCard';
import RuvloLogo from '../../utils/imgs/ruvlo.png';
import { useAuthStatus } from '../../api/auth/useUsers';
import LocationStatusButtons from '../../reusable_components/LocationStatusButtons';



const Home = () => {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');

  const [debouncedSearch] = useDebounce(search, 500);
  const { location, setLocation } = useLocation();
  const { requestLocation, isLocating } = useGetCurrentLocation();
  const rotation = useRef(new Animated.Value(0)).current;

  const { data: countriesData, isLoading: isCountriesLoading, refetch: refetchCountries } = useCountries();
  const countries = Array.isArray(countriesData) ? countriesData : [];

  const { data: rawCities } = useCities(selectedCountry);
  const cities = Array.isArray(rawCities) ? rawCities : [];

  const { data: rawNeighborhoods } = useNeighborhoods(selectedCity);
  const neighborhoods = Array.isArray(rawNeighborhoods) ? rawNeighborhoods : [];

  const navigation = useNavigation();

  const { isAuthenticated, loading } = useAuthStatus();

  const handleOpenFilters = () => {
    setShowModal(true);
    if (!location) refetchCountries();
  };

  // Productos paginados
  const {
    data: productData,
    fetchNextPage: fetchNextProductPage,
    hasNextPage: hasNextProductPage,
    isFetchingNextPage: isFetchingNextProductPage,
    refetch: refetchProducts,
  } = useInfiniteProducts({
    search: debouncedSearch,
    lat: location?.latitude,
    lon: location?.longitude,
    country_id: selectedCountry,
    city_id: selectedCity,
    neighborhood_id: selectedNeighborhood,
  }, {
    enabled: !!debouncedSearch,
  });

  // Tiendas paginadas
  const {
    data: storeData,
    fetchNextPage: fetchNextStorePage,
    hasNextPage: hasNextStorePage,
    isFetchingNextPage: isFetchingNextStorePage,
    refetch: refetchStores,
  } = useInfiniteStores({
    search: debouncedSearch,
    lat: location?.latitude,
    lon: location?.longitude,
    country_id: selectedCountry,
    city_id: selectedCity,
    neighborhood_id: selectedNeighborhood,
  }, {
    enabled: !!debouncedSearch,
  });

  const products = productData?.pages.flatMap(p => p.results) || [];
  const stores = storeData?.pages.flatMap(p => p.results) || [];

  const totalProducts = productData?.pages?.[0]?.count || 0;
  const totalStores = storeData?.pages?.[0]?.count || 0;

  // useEffect(() => {
  //   const timeout = setTimeout(() => {
  //     checkPermissionAndLocation();
  //   }, 1000);
  //   return () => clearTimeout(timeout);
  // }, []);

  const checkPermissionAndLocation = () => {
    requestLocation({
      permissionMessage: 'Ruvlo necesita acceder a tu ubicación para mostrar tiendas cercanas.',
      onSuccess: (coords) => {
        setLocation(coords);
        setSelectedCountry('');
        setSelectedCity('');
        setSelectedNeighborhood('');
      },
    });
  };

  useEffect(() => {
    if (isLocating) {
      Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotation.stopAnimation();
      rotation.setValue(0);
    }
  }, [isLocating]);

  const rotateStyle = {
    transform: [
      {
        rotate: rotation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  };

  return (
    <View style={tw`flex-1`}>
       <Ionicons
              name="cube"
              size={700}
              color="white"
              style={{
                position: 'absolute',
                top: 10,
                left: 0,
                opacity: 0.09, // Nivel de transparencia
                zIndex: 0,
              }}
            />
      <ScrollView>
        {/* Conteo de resultados */}
        {(isLocating || totalStores > 0 || totalProducts > 0) && (
          <View style={tw`px-4 mb-4`}>
            <View style={tw`bg-gray-700/60 p-4 rounded-xl shadow-md`}>
              {isLocating ? (
                <>
                </>
              ) : (
                <View>
                  <Text style={tw`text-gray-200 text-base text-center`}>
                    Hemos encontrado{' '}
                    <Text style={tw`text-white font-bold`}>
                      {totalStores} negocio{totalStores !== 1 ? 's' : ''}
                    </Text>{' '}
                    y{' '}
                    <Text style={tw`text-white font-bold`}>
                      {totalProducts} producto{totalProducts !== 1 ? 's' : ''}
                    </Text>{' '}
                    {/* Condición para mostrar “cerca de ti” */}
                    {(location ||
                      (selectedCountry !== '' &&
                        selectedCity !== '' &&
                        selectedNeighborhood !== ''))
                      ? 'cerca de ti 🛍️'
                      : 'en total'}

                  </Text>

                  {/* Mostrar sugerencia y botones solo si NO hay ubicación NI localidad */}
                  {!location &&
                    !selectedCountry &&
                    !selectedCity &&
                    !selectedNeighborhood && (
                      <View style={tw`mt-4 items-center`}>
                        <Text style={tw`text-gray-300 text-center mb-3`}>
                          Proporciona tu localidad o activa la ubicación para mejores resultados.
                        </Text>

                        <View style={tw`flex-row gap-6 mt-4`}>
                          {/* Elegir ubicación */}
                          <View style={tw`items-center`}>
                            <TouchableOpacity
                              onPress={handleOpenFilters}
                              style={tw`bg-gray-700/80 p-4 rounded-full`}
                            >
                              <Ionicons name="location-outline" size={24} color="#ffffff" />
                            </TouchableOpacity>
                            <Text style={tw`text-xs text-gray-300 mt-2 text-center`}>
                              Elegir ubicación
                            </Text>
                          </View>

                          {/* Usar mi ubicación */}
                          <View style={tw`items-center`}>
                            <TouchableOpacity
                              onPress={checkPermissionAndLocation}
                              disabled={isLocating}
                              style={[
                                tw`p-4 rounded-full`,
                                {
                                  backgroundColor: isLocating
                                    ? '#4B5563'
                                    : location
                                      ? COLORS.BlueWord
                                      : 'rgba(77, 79, 80, 0.7)',
                                },
                              ]}
                            >
                              {isLocating ? (
                                <ActivityIndicator color="#ffffff" size="small" />
                              ) : (
                                <Ionicons name="locate" size={24} color="#ffffff" />
                              )}
                            </TouchableOpacity>
                            <Text
                              style={[
                                tw`text-xs mt-2 px-2 py-1 rounded-full`,
                                location
                                  ? [tw`text-white font-semibold`, { backgroundColor: COLORS.BlueWord }]
                                  : tw`text-gray-300`,
                              ]}
                            >
                              {location ? 'Ubicación obtenida' : 'Usar mi ubicación'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}
                </View>
              )}
            </View>
          </View>
        )}

        {products.length > 0 && (
          <View style={tw`mb-6`}>
            {/* Título y botón alineados horizontalmente */}
            <View style={tw`flex-row justify-between items-center px-4 mb-2`}>
              <Text style={tw`text-white text-lg font-bold`}>Productos</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('ListProducts', {
                    search,
                    lat: location?.latitude,
                    lon: location?.longitude,
                    country_id: selectedCountry,
                    city_id: selectedCity,
                    neighborhood_id: selectedNeighborhood,
                  })
                }
              >
                <Text style={tw`text-blue-400 text-sm`}>Ver todos</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={products}
              horizontal
              keyExtractor={(item) => item._id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={tw`px-4`}
              onEndReached={() => {
                if (hasNextProductPage && !isFetchingNextProductPage) {
                  fetchNextProductPage();
                }
              }}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                isFetchingNextProductPage ? (
                  <View style={tw`justify-center items-center py-4`}>
                    <ActivityIndicator color="#9CA3AF" size="small" />
                  </View>
                ) : null
              }
              renderItem={({ item }) => (
                <ProductCard item={item} compact />
              )}
            />
          </View>
        )}

        {/* Tiendas */}
        {stores.length > 0 && (
          <View style={tw`mb-6`}>
            <View style={tw`flex-row justify-between items-center px-4 mb-2`}>
              <Text style={tw`text-white text-lg font-bold`}>Negocios</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('ListStores', {
                    search,
                    lat: location?.latitude,
                    lon: location?.longitude,
                    country_id: selectedCountry,
                    city_id: selectedCity,
                    neighborhood_id: selectedNeighborhood,
                  })
                }
              >
                <Text style={tw`text-blue-400 text-sm`}>Ver todos</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={stores}
              horizontal
              keyExtractor={(item) => item.id.toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={tw`px-4`}
              onEndReached={() => {
                if (hasNextStorePage && !isFetchingNextStorePage) {
                  fetchNextStorePage();
                }
              }}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                isFetchingNextStorePage ? (
                  <View style={tw`justify-center items-center py-4`}>
                    <ActivityIndicator color="#9CA3AF" size="small" />
                  </View>
                ) : null
              }
              renderItem={({ item }) => (
                <StoreCard
                  item={item}
                  compact
                  onPress={() => navigation.navigate('StoreDetail', { slug: item.slug })}
                />
              )}
            />
          </View>
        )}

        {products.length === 0 && stores.length === 0 && (
          search?.trim().length > 0 ? (
            // Sin resultados para una búsqueda activa
            <View style={tw`items-center justify-center px-6 pt-25`}>
              <View style={tw`bg-gray-800 p-6 rounded-full mb-4`}>
                <Ionicons name="build-outline" size={48} color="#4B5563" />
              </View>
              <Text style={tw`text-gray-300 text-xl font-bold text-center mb-2`}>
                No se encontraron resultados
              </Text>
              <Text style={tw`text-gray-400 text-base text-center`}>
                Intenta usar otros términos o ajusta tu ubicación.
              </Text>
            </View>
          ) : (
            // Vista inicial sin búsqueda
            <>
            
            
             <View style={tw`items-center justify-center px-6 pt-25`}>
              <Image
                source={RuvloLogo}
                style={tw`w-20 h-20 mb-2`}
                resizeMode="contain"
              />
              <Text style={tw`text-gray-300 text-xl font-bold text-center mb-2`}>
                Ruvlo
              </Text>
              <Text style={tw`text-gray-400 text-base text-center mb-6 `}>
                Elige tu ubicación o usa tu GPS para encontrar los negocios y productos más cercanos a ti.
              </Text>

              {/* Botones de acción */}
              <View style={tw`flex-col justify-center items-center mt-6`}>
                {/* Fila superior */}
                <View style={tw`flex-row justify-center items-center gap-6`}>
                  {/* Elegir ubicación */}
                  <View style={tw`items-center`}>
                    <TouchableOpacity
                      onPress={handleOpenFilters}
                      style={tw`bg-gray-700/80 p-4 rounded-full`}
                    >
                      <Ionicons name="location-outline" size={24} color="#ffffff" />
                    </TouchableOpacity>
                    <Text style={tw`text-xs text-gray-300 mt-2 text-center`}>Elegir ubicación</Text>
                  </View>

                  {/* Ubicación automática */}
                  <View style={tw`items-center`}>
                    <TouchableOpacity
                      onPress={checkPermissionAndLocation}
                      disabled={isLocating}
                      style={[
                        tw`p-4 rounded-full`,
                        {
                          backgroundColor: isLocating
                            ? '#4B5563'
                            : location
                              ? COLORS.BlueWord
                              : 'rgba(77, 79, 80, 0.7)',
                        },
                      ]}
                    >
                      {isLocating ? (
                        <ActivityIndicator color="#ffffff" size="small" />
                      ) : (
                        <Ionicons name="locate" size={24} color="#ffffff" />
                      )}
                    </TouchableOpacity>
                    <Text
                      style={[
                        tw`text-xs mt-2 px-2 py-1 rounded-full`,
                        location
                          ? [tw`text-white font-semibold`, { backgroundColor: COLORS.BlueWord }]
                          : tw`text-gray-300`,
                      ]}
                    >
                      {location ? 'Ubicación obtenida' : 'Usar mi ubicación'}
                    </Text>
                  </View>

                  {/* Escanear QR */}
                  <View style={tw`items-center`}>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('QRScanner')}
                      style={tw`bg-gray-700/80 p-4 rounded-full`}
                    >
                      <Ionicons name="scan-outline" size={24} color="#ffffff" />
                    </TouchableOpacity>
                    <Text style={tw`text-xs text-gray-300 mt-2 text-center`}>Escanear QR</Text>
                  </View>
                </View>

                {/* Fila inferior */}
                <View style={tw`flex-row justify-center items-center gap-6 mt-6`}>
                  {/* Ver productos */}
                  <View style={tw`items-center`}>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('ListProducts')}
                      style={tw`bg-gray-700/80 p-4 rounded-full`}
                    >
                      <Ionicons name="pricetags-outline" size={24} color="#ffffff" />
                    </TouchableOpacity>
                    <Text style={tw`text-xs text-gray-300 mt-2 text-center`}>Ver productos</Text>
                  </View>

                  {/* Ver negocios */}
                  <View style={tw`items-center`}>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('ListStores')}
                      style={tw`bg-gray-700/80 p-4 rounded-full`}
                    >
                      <Ionicons name="storefront-outline" size={24} color="#ffffff" />
                    </TouchableOpacity>
                    <Text style={tw`text-xs text-gray-300 mt-2 text-center`}>Ver negocios</Text>
                  </View>
                </View>

                {!isAuthenticated ? (
                  <View style={tw`flex-row justify-center items-center gap-6 mt-8`}>
                    {/* Ver productos */}
                    <View style={tw`items-center`}>
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate('Tabs', {
                            screen: 'Perfil',
                            params: { screen: 'Login' },
                          })
                        }
                        style={tw`bg-gray-700/80 p-4 rounded-full`}
                      >
                        <Ionicons name="enter-outline" size={24} color="#ffffff" />
                      </TouchableOpacity>
                      <Text style={tw`text-xs text-gray-300 mt-2 text-center`}>Ingresar a mi cuenta</Text>
                    </View>
                  </View>
                ) : (
                  <></>
                )}
              </View>
            </View>
            
            </>
           
          )
        )}

      </ScrollView>

      <View style={tw`px-4 flex-row items-center mt-2`}>
        <View
          style={tw.style(
            'flex-row items-center bg-gray-700 px-4 mb-2 rounded-2xl'
          )}
        >
          <Ionicons name="search" size={20} color="#ffffff" style={tw`mr-2`} />
          <TextInput
            placeholder="Busca lo que necesitas"
            placeholderTextColor="#ccc"
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            autoCapitalize="none"
            style={tw`flex-1 text-white text-base`}
          />
          <TouchableOpacity onPress={handleOpenFilters} style={tw`ml-2`}>
            <Animated.View style={isLocating ? rotateStyle : undefined}>
              <Ionicons name={isLocating ? 'locate' : 'location'} size={26} color="#ffffff" />
            </Animated.View>
          </TouchableOpacity>
        </View>
        {/* Modal ubicación */}
        <ReusableModal visible={showModal} onClose={() => setShowModal(false)}>
          
          <LocationStatusButtons
            location={location}
            isLocating={isLocating}
            checkPermissionAndLocation={checkPermissionAndLocation}
            setLocation={setLocation}
            setSelectedCountry={setSelectedCountry}
            setSelectedCity={setSelectedCity}
            setSelectedNeighborhood={setSelectedNeighborhood}
            label="Obtener mi ubicación"
            searchingLabel="Ubicando..."
          />

          <LocationPicker
            location={location}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            selectedNeighborhood={selectedNeighborhood}
            setSelectedNeighborhood={setSelectedNeighborhood}
            countries={countries}
            cities={cities}
            neighborhoods={neighborhoods}
            showTitle={true}
            isCountriesLoading={isCountriesLoading}
          />

          
        </ReusableModal>
      </View>
    </View>
  );
};

export default Home;
