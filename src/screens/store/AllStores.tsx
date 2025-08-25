import { useEffect, useRef, useState } from "react";
import { useCategories, useCities, useCountries, useNeighborhoods, useStores } from "../../api/store/useStores";
import { useDebounce } from "use-debounce";
import { useLocation } from "../../utils/contexts/LocationContext";
import { useGetCurrentLocation } from "../../utils/useGetCurrentLocation";
import Ionicons from 'react-native-vector-icons/Ionicons';

import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Animated,
  Easing,
  Pressable
} from 'react-native';
import { useNavigation, useRoute } from "@react-navigation/native";
import tw from 'twrnc';
import ReusableModal from "../../reusable_components/ReusableModal";
import LocationPicker from "../../reusable_components/LocationPicker";
import CategoryFilterBar from "../../reusable_components/CategoryFilterBar";
import StoreCard from "../../reusable_components/StoreCard";
import LocationStatusButtons from "../../reusable_components/LocationStatusButtons";
import MapWithMarkers from "../../reusable_components/MapWithMarkers";
import { API_BASE_URL, DEFAULT_LOGO_BASE64 } from "../../constants";


const AllStores = () => {

  const route = useRoute();
  const {
    search: initialSearch = '',
    lat: initialLat,
    lon: initialLon,
    country_id,
    city_id,
    neighborhood_id,
  } = route.params || {};

  const [search, setSearch] = useState(initialSearch);
  const [showModal, setShowModal] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState(country_id || '');
  const [selectedCity, setSelectedCity] = useState(city_id || '');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(neighborhood_id || '');

  const [selectedCategory, setSelectedCategory] = useState('');

  const { data: countriesData, isLoading: isCountriesLoading, refetch: refetchCountries, } = useCountries();
  const countries = Array.isArray(countriesData) ? countriesData : [];

  const { data: rawCities } = useCities(selectedCountry);
  const cities = Array.isArray(rawCities) ? rawCities : [];

  const { data: rawNeighborhoods } = useNeighborhoods(selectedCity);
  const neighborhoods = Array.isArray(rawNeighborhoods) ? rawNeighborhoods : [];
  const [debouncedSearch] = useDebounce(search, 500);
  const { location, setLocation } = useLocation(); //Guardo la location en el contexto
  const { requestLocation, isLocating } = useGetCurrentLocation();
  const [showMap, setShowMap] = useState(false);
  const rotation = useRef(new Animated.Value(0)).current;

  const {
    data: categories = [],
    refetch: refetchCategories,
    isFetching: isFetchingCategories,
  } = useCategories();

  const navigation = useNavigation();

  const handleOpenFilters = () => {
    setShowModal(true);
    if (!location) {
      refetchCountries();
    }
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isFetching,
    isLoading,
    error,
  } = useStores({
    search: debouncedSearch,
    countryId: selectedCountry,
    cityId: selectedCity,
    neighborhoodId: selectedNeighborhood,
    categoryId: selectedCategory,
    lat: initialLat ?? location?.latitude,
    lon: initialLon ?? location?.longitude,
  });

  const stores = data?.pages.flatMap((page) => page.results) || [];
  const totalStores = data?.pages[0]?.count || 0;

  useEffect(() => {
    if (location) {
      refetch(); // Vuelve a cargar tiendas cuando ya tienes ubicación
    }
  }, [location]);

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

  if (error) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-[#121212]`}>
        <Text style={tw`text-white`}>
          Error al cargar tiendas
        </Text>
      </View>
    );
  }

  return (
    <View style={tw`flex-1`}>
      {/* Input: busca en cada letra */}
      <View style={tw`px-4 pt-5 pb-4 flex-row items-center`}>
        <View style={tw`flex-row items-center bg-gray-700 rounded-2xl px-4 mb-2`}>
          <Ionicons name="search" size={20} color="#ffffff" style={tw`mr-2`} />

          <TextInput
            placeholder="¿Que negocios necesitas?"
            placeholderTextColor="#ccc"
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            autoCapitalize="none"
            style={tw`flex-1 text-white text-base`}
          />

          <TouchableOpacity onPress={handleOpenFilters} style={tw`ml-2`}>
             <Ionicons name='locate' size={26} color="#ffffff" />
          </TouchableOpacity>

        </View>
        {/* Modal de filtros de ubicación*/}
        <ReusableModal visible={showModal} onClose={() => setShowModal(false)}>
          
          <LocationStatusButtons
            location={location}
            isLocating={isLocating}
            checkPermissionAndLocation={checkPermissionAndLocation}
            setLocation={setLocation}
            setSelectedCountry={setSelectedCountry}
            setSelectedCity={setSelectedCity}
            setSelectedNeighborhood={setSelectedNeighborhood}
            label="Buscar negocios cercanos"
            searchingLabel="Buscando negocios..."
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
      <View style={tw``}>
        <CategoryFilterBar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          textHelp="Negocios de"
        />
      </View>
      <FlatList
        data={stores}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={tw`px-6 `}
        scrollEnabled={!showMap} // Opcional, mas adelante se sabra si lo elimino o no.
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isFetchingNextPage}
            onRefresh={refetch}
            tintColor="#ffffff"
          />
        }
        renderItem={({ item }) => (
          <StoreCard
            item={item}
            onPress={() => navigation.navigate('StoreDetail', {
              slug: item.slug
            })}
          />
        )}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? <ActivityIndicator color="white" /> : null
        }
        ListEmptyComponent={
          !isLoading && !isFetching ? (
            <View style={tw`pt-30 items-center justify-center`}>
              <View style={tw`bg-gray-800 p-6 rounded-full mb-4`}>
                <Ionicons name="cube-outline" size={48} color="#4B5563" />
              </View>
              <Text style={tw`text-gray-300 text-xl font-medium mb-2`}>
                No hay negocios
              </Text>
              <Text style={tw`text-gray-500 text-center mb-6`}>
                Busca otras categorías
              </Text>
            </View>
          ) : null
        }
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            {location && (
              <View style={tw`bg-blue-900 rounded-xl mb-4 px-4 py-4`}>
                {/* Encabezado con ícono y texto */}
                <View style={tw`flex-row items-start`}>
                  <Ionicons name="storefront" size={18} color="#93C5FD" style={tw`mr-2 mt-0.5`} />
                  <Text style={tw`text-blue-100 text-sm flex-1`}>
                    Hay {totalStores} negocios cerca de tu ubicación actual.
                  </Text>
                </View>

                {/* Botón con ícono y texto visible */}
                <TouchableOpacity
                  onPress={() => setShowMap((prev) => !prev)}
                  style={tw`mt-3 mb-1 self-start flex-row items-center`}
                >
                  <Ionicons
                    name={showMap ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color="#f4f9ffff" // azul claro
                    style={tw`mr-1`}
                  />
                  <Text style={tw`text-gray-200 text-sm font-semibold my-2`}>
                    {showMap ? 'Ocultar mapa' : 'Ver en el mapa'}
                  </Text>
                </TouchableOpacity>

                {/* Mapa visible solo si está activado */}
                {showMap && location && stores.length > 0 && (
                  <View style={{ height: 450, marginHorizontal: -16, marginBottom: -16 }}>
                    <MapWithMarkers
                      userLocation={location}
                      markers={stores.map((store) => ({
                        name: store.name,
                        slug: store.slug,
                        latitude: store.latitude,
                        longitude: store.longitude,
                        type: 'store',
                        logo: store.logo ? `${store.logo}` : DEFAULT_LOGO_BASE64
                      }))}
                    />
                  </View>
                )}
              </View>
            )}
          </>
        }
      />
    </View>
  )
};

export default AllStores;