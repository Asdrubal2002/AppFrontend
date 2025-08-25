// src/screens/TestQuery.js
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import tw from 'twrnc';

import { useDebounce } from 'use-debounce';

import ReusableModal from '../../reusable_components/ReusableModal';
import PriceFilter from '../../reusable_components/PriceFilter';
import SearchWithFiltersBar from '../../reusable_components/SearchWithFiltersBar';
import LocationPicker from '../../reusable_components/LocationPicker';
import { useProducts } from '../../api/product/useProducts';
import { useCategories, useCities, useCountries, useNeighborhoods } from '../../api/store/useStores';
import { useLocation } from '../../utils/contexts/LocationContext';
import { useGetCurrentLocation } from '../../utils/useGetCurrentLocation';
import ProductCard from './ProductCard';
import { COLORS } from '../../../theme';
import { useRoute } from '@react-navigation/native';
import LocationStatusButtons from '../../reusable_components/LocationStatusButtons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MapWithMarkers from '../../reusable_components/MapWithMarkers';
import CategoryFilterBar from '../../reusable_components/CategoryFilterBar';
import { API_BASE_URL } from '../../constants';

export default function AllProduct() {

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
  const [selectedCountry, setSelectedCountry] = useState(country_id || '');
  const [selectedCity, setSelectedCity] = useState(city_id || '');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(neighborhood_id || '');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showMap, setShowMap] = useState(false);


  const { location, setLocation } = useLocation();
  const { requestLocation, isLocating } = useGetCurrentLocation();


  const { data: countriesData, isLoading: isCountriesLoading, refetch: refetchCountries, } = useCountries();
  const countries = Array.isArray(countriesData) ? countriesData : [];

  const { data: rawCities } = useCities(selectedCountry);
  const cities = Array.isArray(rawCities) ? rawCities : [];

  const { data: rawNeighborhoods } = useNeighborhoods(selectedCity);
  const neighborhoods = Array.isArray(rawNeighborhoods) ? rawNeighborhoods : [];

  const [debouncedSearch] = useDebounce(search, 500);
  const [debouncedPriceMin] = useDebounce(priceMin, 500);
  const [debouncedPriceMax] = useDebounce(priceMax, 500);

  const {
    data: categories = [],
    refetch: refetchCategories,
    isFetching: isFetchingCategories,
  } = useCategories();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    refetch,
  } = useProducts({
    search: debouncedSearch,
    lat: initialLat ?? location?.latitude,
    lon: initialLon ?? location?.longitude,
    countryId: selectedCountry,
    cityId: selectedCity,
    neighborhoodId: selectedNeighborhood,
    store_category: selectedCategory,
    priceMin: debouncedPriceMin,
    priceMax: debouncedPriceMax
  });

  const products = data?.pages.flatMap(page => page.results) || [];
  const totalProducts = data?.pages[0]?.count || 0;

  const handleOpenFilters = () => {
    setShowModal(true);
    refetchCountries();
  };

  useEffect(() => {
    if (location) {
      refetch();
    }
  }, [location]);

  const checkPermissionAndLocation = () => {
    requestLocation({
      permissionMessage: 'Ruvlo necesita acceder a tu ubicación para mostrar productos cercanos.',
      onSuccess: (coords) => {
        setLocation(coords);
        setSelectedCountry('');
        setSelectedCity('');
        setSelectedNeighborhood('');
      },
    });
  };

  return (
    <View style={tw`flex-1`}>
      <View style={tw`px-4 pt-5 pb-4 flex-row items-center`}>
        {/* Campo de búsqueda */}

        <SearchWithFiltersBar
          search={search}
          setSearch={setSearch}
          placeholder="¿Qué producto necesitas?"
          onOpenFilters={handleOpenFilters}
          iconSize={26}
          marginBottom="mb-2"
        />
        {/* Modal de filtros de ubicación*/}
        <ReusableModal visible={showModal} onClose={() => setShowModal(false)}>
          <PriceFilter
            priceMin={priceMin}
            setPriceMin={setPriceMin}
            priceMax={priceMax}
            setPriceMax={setPriceMax}
            color={COLORS.Textmodals}
          />

          <LocationStatusButtons
            location={location}
            isLocating={isLocating}
            checkPermissionAndLocation={checkPermissionAndLocation}
            setLocation={setLocation}
            setSelectedCountry={setSelectedCountry}
            setSelectedCity={setSelectedCity}
            setSelectedNeighborhood={setSelectedNeighborhood}
            label="Buscar productos cercanos"
            searchingLabel="Buscando productos..."
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
      <CategoryFilterBar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        textHelp="Productos de"
      />
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={tw`justify-between`}
        contentContainerStyle={tw`px-4 pt-4`}
        scrollEnabled={!showMap} // Opcional, mas adelante se sabra si lo elimino o no.
        renderItem={({ item }) => <ProductCard item={item} />}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator color="white" /> : null}
        ListEmptyComponent={
          !isLoading && !isFetching ? (
            <View style={tw`items-center mt-10`}>
              <Text style={tw`text-white text-base`}>No se encontraron productos</Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isFetchingNextPage}
            onRefresh={refetch}
            tintColor="#ffffff"
          />
        }
        ListHeaderComponent={
          <>
            {location && (
              <View style={tw`bg-blue-900 rounded-xl mb-4 px-4 py-4`}>
                {/* Encabezado con ícono y texto */}
                <View style={tw`flex-row items-start`}>
                  <Ionicons name="color-wand-outline" size={18} color="#93C5FD" style={tw`mr-2 mt-0.5`} />
                  <Text style={tw`text-blue-100 text-sm flex-1`}>
                    Hay {totalProducts} productos cerca de tu ubicación actual.
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
                    color="#60A5FA" // azul claro
                    style={tw`mr-1`}
                  />
                  <Text style={tw`text-blue-300 text-sm font-semibold my-2`}>
                    {showMap ? 'Ocultar mapa' : 'Observarlos en el mapa'}
                  </Text>
                </TouchableOpacity>

                {/* Mapa visible solo si está activado */}
                {showMap && location && products.length > 0 && (
                  <View style={{ height: 550, marginHorizontal: -16, marginBottom: -16 }}>
                    <MapWithMarkers
                      userLocation={location}
                      markers={products.map(p => ({
                        name: p.name,
                        slug: p.slug,
                        id: p._id,
                        latitude: p.store.location?.coordinates[1], // lat
                        longitude: p.store.location?.coordinates[0], // lon
                        type: 'product',
                        logo: p.preview_image ? `${p.preview_image}` : undefined, // Usa el dominio correcto
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
  );
}
