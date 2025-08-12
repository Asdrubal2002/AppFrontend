import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, ActivityIndicator, Pressable, Image, TextInput, Button, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDebounce } from 'use-debounce';
import tw from 'twrnc';
import { useStoreCategories, useStoreProducts } from '../../../../api/product/useProducts';
import SearchWithFiltersBar from '../../../../reusable_components/SearchWithFiltersBar';
import PriceFilter from '../../../../reusable_components/PriceFilter';
import CategorySelector from '../../../product/CategorySelector';
import ReusableModal from '../../../../reusable_components/ReusableModal';
import { COLORS } from '../../../../../theme';

import Ionicons from 'react-native-vector-icons/Ionicons';
import HeaderBar from '../../../../reusable_components/HeaderBar';
import { API_BASE_URL, DEFAULT_BANNER_BASE64 } from '../../../../constants';
import { useCreateCombo, useUploadComboImage } from '../../../../api/store/useStores';
import AuthButton from '../../../../reusable_components/AuthButton';
import UploadMediaModal from '../../../../reusable_components/UploadMediaModal';
import AuthInput from '../../../../reusable_components/AuthInput';
import BackgroundIcon from '../../../../reusable_components/BackgroundIcon';



const CreateOfert = () => {
    const route = useRoute();
    const { storeId } = route.params;

    const [page, setPage] = useState(1);
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [priceMin, setPriceMin] = useState("");
    const [priceMax, setPriceMax] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [loadCategories, setLoadCategories] = useState(false);
    const [debouncedSearch] = useDebounce(search, 500);
    const [debouncedPriceMin] = useDebounce(priceMin, 500);
    const [debouncedPriceMax] = useDebounce(priceMax, 500);
    const [showModal, setShowModal] = useState(false);
    const [showComboModal, setShowComboModal] = useState(false);
    const [comboName, setComboName] = useState('');
    const [comboDescription, setComboDescription] = useState('');
    const [comboPrice, setComboPrice] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [inputQuantities, setInputQuantities] = useState({});
    const [createdComboId, setCreatedComboId] = useState<number | null>(null);

    const navigation = useNavigation();


    const { data: categories, refetch: refetchCategories } = useStoreCategories(storeId, {
        enabled: loadCategories,
    });

    const { data, isLoading, isFetching } = useStoreProducts({
        storeId,
        page,
        search: debouncedSearch,
        priceMin: debouncedPriceMin,
        priceMax: debouncedPriceMax,
        categoryId,
        enabled: !!storeId,
    });

    const { mutate: createCombo, isPending } = useCreateCombo();
    const { mutateAsync: uploadComboImage, isPending: isUploading } = useUploadComboImage();

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, debouncedPriceMin, debouncedPriceMax, categoryId]);

    useEffect(() => {
        if (data?.results) {
            if (page === 1) {
                setProducts(data.results);
            } else {
                setProducts(prev => [...prev, ...data.results]);
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
        setLoadCategories(true);
        refetchCategories();
    };

    const toggleProductSelection = (product) => {
        const alreadySelected = selectedProducts.find(p => p._id === product._id);
        if (alreadySelected) {
            setSelectedProducts(prev => prev.filter(p => p._id !== product._id));
        } else {
            setSelectedProducts(prev => [
                ...prev,
                { ...product, quantity: "1" }, // Por defecto 1 unidad al seleccionar
            ]);
        }
    };

    const updateProductQuantity = (productId, quantity) => {
        setSelectedProducts(prev =>
            prev.map(p =>
                p._id === productId ? { ...p, quantity } : p
            )
        );
    };

    const handleQuantityChange = (text, product) => {
        const numeric = text.replace(/[^0-9]/g, '');
        setInputQuantities(prev => ({ ...prev, [product._id]: numeric }));

        const value = parseInt(numeric);
        if (!isNaN(value) && value <= product.stock) {
            updateProductQuantity(product._id, numeric);
        }
    };


    const renderItem = ({ item }) => {
        const isSelected = selectedProducts.some(p => p._id === item._id);

        return (
            <Pressable
                onPress={() => toggleProductSelection(item)}
                style={tw`w-[48%] mb-4 p-2 bg-gray-800 rounded-xl`}
            >
                <Image
                    source={{ uri: item.preview_image ? `${API_BASE_URL}${item.preview_image}` : DEFAULT_BANNER_BASE64 }}
                    style={tw`w-full h-28 rounded-lg mb-2`}
                    resizeMode="cover"
                />

                <Text style={tw`text-white text-sm font-semibold mb-1`} numberOfLines={2}>
                    {item.name}
                </Text>

                <Text style={tw`text-green-400 font-bold text-base`}>
                    ${Math.round(item.discounted_price).toLocaleString()}
                </Text>

                {item.discount_percentage > 0 && (
                    <Text style={tw`text-red-400 text-xs`}>
                        -{item.discount_percentage}% OFF
                    </Text>
                )}
                <Text style={tw`text-gray-300 text-xs`}>
                    Cantidad disponible: {item.stock}
                </Text>


                <TextInput
                    style={tw`bg-gray-700 rounded-md px-2 py-1 mt-2 text-white`}
                    placeholder="Cantidad"
                    placeholderTextColor="#ccc"
                    keyboardType="numeric"
                    value={inputQuantities[item._id]?.toString() ?? ''}
                    onChangeText={(text) => handleQuantityChange(text, item)}
                />


                <View style={tw`absolute top-2 right-2`}>
                    <Ionicons
                        name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                        color={isSelected ? 'lime' : 'gray'}
                        size={24}
                    />
                </View>
            </Pressable>
        );
    };


    const handleCreateCombo = () => {
        // Validación de nombre
        if (!comboName.trim()) {
            Alert.alert("Validación", "El nombre del combo es obligatorio.");
            return;
        }
        if (comboName.length > 255) {
            Alert.alert("Validación", "El nombre no puede superar los 255 caracteres.");
            return;
        }

        // Validación de descripción
        if (!comboDescription.trim()) {
            Alert.alert("Validación", "La descripción es obligatoria.");
            return;
        }
        if (comboDescription.length > 1000) {
            Alert.alert("Validación", "La descripción no puede superar los 1000 caracteres.");
            return;
        }

        // Validación del precio
        const priceValue = parseFloat(comboPrice);
        if (isNaN(priceValue) || priceValue <= 0) {
            Alert.alert("Validación", "El precio debe ser un número válido mayor que cero.");
            return;
        }
        if (!Number.isInteger(priceValue)) {
            Alert.alert("Validación", "El precio debe ser un número entero (sin decimales).");
            return;
        }

        // Validación de productos seleccionados
        if (selectedProducts.length < 2) {
            Alert.alert("Validación", "Debes seleccionar al menos 2 productos para la oferta.");
            return;
        }

        const comboData = {
            name: comboName.trim(),
            description: comboDescription.trim(),
            price: priceValue, // siempre será entero validado arriba
            items: selectedProducts.map(p => ({
                product_id: p._id,
                sku: p.sku,
                quantity: parseInt(p.quantity),
            })),
        };


        createCombo(comboData, {
            onSuccess: (data) => {
                const comboId = data.id;
                console.log("Combo creado con ID:", comboId);

                setCreatedComboId(comboId); // ✅ GUARDAMOS EL ID
                setShowComboModal(false);
                setShowUploadModal(true);
            },
            onError: (error) => {
                Alert.alert("Error", "No se pudo crear el combo");
                console.error("Error al crear combo:", error);
            },
        });



    };

    const handleUploadComplete = async (files: any[], comboId: number) => {
        if (!files?.[0]?.uri || !comboId) {
            Alert.alert("Error", "No se seleccionó ninguna imagen o falta el ID del combo");
            return;
        }

        try {
            await uploadComboImage({
                comboId,
                imageFile: {
                    uri: files[0].uri,
                    type: files[0].type,
                    fileName: files[0].fileName
                }
            });
            Alert.alert("Éxito", "Imagen subida correctamente");
            setShowUploadModal(false);
            navigation.replace("PromotionsAdmin", { storeId });
        } catch (error) {
            console.error("Error completo:", error);
            Alert.alert("Error", "No se pudo subir la imagen. Verifica la conexión o intenta con otra imagen.");
        }
    };

    return (
        <>
            <UploadMediaModal
                visible={showUploadModal}
                onClose={() => {
                    setShowUploadModal(false);
                    navigation.replace('PromotionsAdmin', { storeId });
                }}
                onSubmit={(files) => handleUploadComplete(files, createdComboId)} // ✅ PASAMOS EL ID GUARDADO
                isUploading={isUploading}
                maxFiles={1}
            />

            <HeaderBar title="Crear mi oferta de productos" />

            <BackgroundIcon name="pricetags-outline" />

            <View style={tw`flex-1 px-2 py-4 mx-2`}>
                <SearchWithFiltersBar
                    search={search}
                    setSearch={setSearch}
                    placeholder={`¿Qué se te ofrece? Hay ${data?.count || 0} productos`}
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
                        color="#fff"
                    />
                    <CategorySelector
                        categories={categories}
                        selectedCategory={categoryId}
                        setSelectedCategory={setCategoryId}
                        showTitle={true}
                    />
                </ReusableModal>

                <FlatList
                    data={products}
                    keyExtractor={(item) => item._id?.toString()}
                    numColumns={2}
                    columnWrapperStyle={tw`justify-between`}
                    renderItem={renderItem}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={
                        isFetching ? <ActivityIndicator color="white" /> : null
                    }
                    ListEmptyComponent={
                        !isLoading && !isFetching ? (
                            <View style={tw`items-center mt-10`}>
                                <Text style={tw`text-white`}>No hay productos</Text>
                            </View>
                        ) : null
                    }
                />

                {selectedProducts.length > 0 && (
                    <>
                        <View style={tw`p-4 bg-gray-800 mt-4 rounded-xl shadow-md`}>
                            <Text style={tw`text-white text-base font-semibold mb-2`}>
                                {selectedProducts.length} producto(s) seleccionado(s)
                            </Text>

                            {selectedProducts.map((p) => (
                                <View key={p._id} style={tw`mb-1`}>
                                    <Text style={tw`text-white text-sm`}>
                                        • {p.name}
                                    </Text>
                                    <Text style={tw`text-gray-300 text-xs ml-2`}>
                                        Cantidad: {p.quantity}
                                    </Text>
                                </View>
                            ))}
                        </View>
                        <AuthButton
                            title="Crear Combo"
                            onPress={() => setShowComboModal(true)}
                        />


                    </>

                )}
            </View>
            <ReusableModal visible={showComboModal} onClose={() => setShowComboModal(false)}>
                <Text style={tw`text-lg font-medium mb-2 text-white`}>Crear Combo u oferta</Text>
                <AuthInput
                    label='¿Qué nombre le pondrás a tu combo u oferta?'
                    placeholder="Ej: Combo Almuerzo Ejecutivo"
                    value={comboName}
                    onChangeText={setComboName}
                />

                <AuthInput
                    label='Describe tu combo u oferta'
                    placeholder="Ej: Incluye arroz, carne y bebida"
                    value={comboDescription}
                    onChangeText={setComboDescription}
                    multiline
                />

                <AuthInput
                    label='¿Qué precio le pondrás?'
                    placeholder="Ej: 12000"
                    value={comboPrice}
                    onChangeText={setComboPrice}
                    keyboardType="numeric"
                />

                <AuthButton
                    title="Crear Combo"
                    onPress={handleCreateCombo}
                />

            </ReusableModal>

        </>
    );
};

export default CreateOfert;