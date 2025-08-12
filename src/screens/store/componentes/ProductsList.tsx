import React, { useState, useEffect } from 'react';
import { FlatList, View, Text, Image, ActivityIndicator, ScrollView, TouchableWithoutFeedback, TextInput, TouchableOpacity, Modal, } from 'react-native';
import tw from 'twrnc';
import { useStoreCategories, useStoreProducts } from '../../../api/product/useProducts';
import { useDebounce } from 'use-debounce';
import { COLORS } from '../../../../theme';
import ReusableModal from '../../../reusable_components/ReusableModal';
import ProductCard from '../../product/ProductCard';
import PriceFilter from '../../../reusable_components/PriceFilter';
import SearchWithFiltersBar from '../../../reusable_components/SearchWithFiltersBar';
import CategorySelector from '../../product/CategorySelector';

const ProductsList = ({ storeId }) => {
    const [page, setPage] = useState(1);
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [loadCategories, setLoadCategories] = useState(false);
    const [debouncedSearch] = useDebounce(search, 500); // 500 ms
    const [debouncedPriceMin] = useDebounce(priceMin, 500);
    const [debouncedPriceMax] = useDebounce(priceMax, 500);

    const {
        data: categories,
        isLoading: isLoadingCategories,
        refetch: refetchCategories,
    } = useStoreCategories(storeId, { enabled: loadCategories });

    const [showModal, setShowModal] = useState(false);

    const {
        data,
        isLoading,
        isFetching,
        refetch,
    } = useStoreProducts({
        storeId,
        page,
        search: debouncedSearch,
        priceMin: debouncedPriceMin,
        priceMax: debouncedPriceMax,
        categoryId,
        enabled: !!storeId,
    });

    //Este useEffect reinicia la paginación cada vez que el usuario busca o cambia un filtro.
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, debouncedPriceMin, debouncedPriceMax, categoryId]);


    useEffect(() => {
        if (data?.results) {
            if (page === 1) {
                setProducts(data.results); // reemplaza los productos anteriores
            } else {
                setProducts(prev => [...prev, ...data.results]); // agrega más productos
            }
        }
    }, [data, page]);


    const loadMore = () => {
        if (!isFetching && data?.next) {
            setPage(prev => prev + 1);
        }
    };

    const handleOpenFilters = () => {
        setShowModal(true);
        setLoadCategories(true);  // activa la carga de categorías
        refetchCategories();      // por si ya se usó antes
    };

    return (
        <View style={tw`flex-1 px-2`}>
            <SearchWithFiltersBar
                search={search}
                setSearch={setSearch}
                placeholder={`¿Qué se te ofrece? Hay ${data?.count} productos disponibles`}
                onOpenFilters={handleOpenFilters}
                iconSize={22}
                marginBottom="mb-4"
            />
            <ReusableModal visible={showModal} onClose={() => setShowModal(false)}>
                <PriceFilter
                    priceMin={priceMin}
                    setPriceMin={setPriceMin}
                    priceMax={priceMax}
                    setPriceMax={setPriceMax}
                    color={COLORS.Textmodals}
                />
                {/* Filtro de categoría */}

                <CategorySelector
                    categories={categories}
                    selectedCategory={categoryId}
                    setSelectedCategory={setCategoryId}
                    showTitle={true}
                />

            </ReusableModal>
            <FlatList
                data={products}
                keyExtractor={(item) => item._id?.toString() || item.id.toString()}
                numColumns={2}
                columnWrapperStyle={tw`justify-between`}
                contentContainerStyle={tw``}
                renderItem={({ item }) => <ProductCard item={item} />}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={
                    isFetching ? <ActivityIndicator color="white" /> : null
                }
                ListEmptyComponent={
                    !isLoading && !isFetching ? (
                        <View style={tw`items-center mt-10`}>
                            <Text style={tw`text-white text-base`}>No hay productos</Text>
                        </View>
                    ) : null
                }
                keyboardShouldPersistTaps="handled"
            />
        </View>
    );
};

export default ProductsList;
