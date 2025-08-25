import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import tw from 'twrnc';
import { COLORS } from '../../../../theme';
import { useComboDetail, useDeleteCombo } from '../../../api/store/useStores';
import FullScreenLoader from '../../../reusable_components/FullScreenLoader';
import { useAddComboToCart } from '../../../api/cart/useAddToCart';
import { API_BASE_URL, DEFAULT_LOGO_BASE64 } from '../../../constants';
import { getIsSeller, getStoreIds } from '../../../utils/authStorage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import CartSidePanel from '../../product/cart/CartSidePanel';
import { useAuthStatus } from '../../../api/auth/useUsers';
import AuthPrompt from '../../../reusable_components/AuthPrompt';

const ComboDetailScreen = () => {
    const route = useRoute();
    const { comboId } = route.params;
    const { data: combo, isLoading } = useComboDetail(comboId);

    const { isAuthenticated, loading } = useAuthStatus();


    const [selectedVariants, setSelectedVariants] = useState({});
    const [quantity, setQuantity] = useState(1);
    const [showCartPanel, setShowCartPanel] = useState(false);
    const [cartResponse, setCartResponse] = useState(null);

    const navigation = useNavigation();


    const [canManageProduct, setCanManageProduct] = useState(false);
    const { mutate: addComboToCart, isPending, error } = useAddComboToCart();
    const { mutate: deleteCombo, isLoading: deleting } = useDeleteCombo();

    useEffect(() => {
        const checkOwnership = async () => {
            const isSeller = await getIsSeller();
            const storeIds = await getStoreIds(); // lista de IDs del vendedor
            if (isSeller && storeIds.includes(combo.store)) {
                setCanManageProduct(true);
            }
        };

        if (combo?.store) {
            checkOwnership();
        }
    }, [combo?.store]);

    const handleSelectSku = (productId, sku) => {
        setSelectedVariants((prev) => ({
            ...prev,
            [productId]: sku,
        }));
    };

    const handleAddToBag = () => {
        const maxQty = getMaxQuantity();

        if (quantity > maxQty) {
            Alert.alert(
                'Cantidad no disponible',
                `Solo puedes agregar hasta ${maxQty} combos según el stock disponible.`
            );
            return;
        }

        const payload = {
            combo_id: combo.id,
            quantity,
            skus: selectedVariants,
        };

        addComboToCart(payload, {
            onSuccess: (data) => {
                setCartResponse(data);
                setShowCartPanel(true);
            },
            onError: (err) => {
                Alert.alert('Error', 'No se pudo agregar el combo al carrito');
                console.error(err);
            },
        });
    };

    // Calcula el máximo permitido según el stock de las variantes seleccionadas
    const getMaxQuantity = () => {
        if (!combo?.items || combo.items.length === 0) return 1;

        const stocks = combo.items.map((item) => {
            if (item.available_variants?.length > 0) {
                const selectedSku = selectedVariants[item.product_id];
                const selectedVariant = item.available_variants.find(v => v.sku === selectedSku);
                return selectedVariant?.stock ?? 0;
            } else {
                return item.stock ?? 0;
            }
        });

        return Math.max(Math.min(...stocks), 1);
    };


    // Verifica que todos los productos con variantes tengan algo seleccionado
    const allVariantsSelected = combo?.items?.every(
        (item) =>
            item.available_variants?.length === 0 ||
            selectedVariants[item.product_id] !== undefined
    ) ?? false;


    if (isLoading) return <FullScreenLoader />;


    if (!combo) {
        return (
            <View style={tw`flex-1 justify-center items-center`}>
                <Text style={tw`text-white`}>Combo no encontrado</Text>
            </View>
        );
    }

    return (
        <ScrollView style={tw`flex-1`}>
            {canManageProduct && (
                <TouchableOpacity
                    onPress={() => {
                        Alert.alert(
                            'Confirmar',
                            '¿Estás seguro de eliminar este combo?',
                            [
                                { text: 'Cancelar', style: 'cancel' },
                                {
                                    text: 'Eliminar',
                                    style: 'destructive',
                                    onPress: () => {
                                        deleteCombo(combo.id, {
                                            onSuccess: () => {
                                                navigation.replace('PromotionsAdmin', { storeId: combo.store });
                                            },
                                            onError: (err) => {
                                                Alert.alert('Error', 'No se pudo eliminar el combo.');
                                                console.error(err);
                                            },
                                        });
                                    },
                                },
                            ]
                        );
                    }}
                    style={tw`flex-1 ml-2 flex-row items-center justify-center border border-red-500/30 bg-red-500/20 py-3 rounded-xl mb-4`}
                >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" style={tw`mr-2`} />
                    <Text style={tw`text-red-600 font-medium`}>
                        {deleting ? 'Eliminando...' : 'Eliminar oferta'}
                    </Text>
                </TouchableOpacity>

            )}
            {combo.image && (
                <Image
                    source={{ uri: combo.image ? `${combo.image}` : DEFAULT_LOGO_BASE64, }}
                    style={tw`w-full h-100`}
                    resizeMode="cover"
                />
            )}

            <View style={tw`p-4`}>
                <Text style={tw`text-white text-2xl font-bold mb-2`}>
                    {combo.name}
                </Text>

                {combo.description && (
                    <Text style={tw`text-gray-300 mb-4`}>
                        {combo.description}
                    </Text>
                )}

                <Text style={tw`text-green-400 text-xl font-semibold mb-6`}>
                    ${parseFloat(combo.price).toLocaleString()}
                </Text>

                {/* Mensaje introductorio llamativo */}
                <View style={tw`bg-blue-600/20 border border-blue-400 rounded-2xl px-4 py-3 mb-5`}>
                    <Text style={tw`text-blue-300 text-sm font-semibold text-center`}>
                        Elige tus preferencias o combinaciones disponibles
                    </Text>
                </View>

                {/* 🧩 Lista de productos del combo */}
                {combo?.items?.map((item) => (
                    <View
                        key={item.id}
                        style={tw`mb-5 p-4 rounded-xl bg-gray-800/60 border border-gray-700`}
                    >
                        <Text style={tw`text-white font-semibold mb-3 text-base`}>
                            {item.product_name}
                        </Text>

                        {/* 🎛️ Variantes disponibles */}
                        {item.available_variants.map((variant, idx) => {
                            const selected = selectedVariants[item.product_id] === variant.sku;
                            return (
                                <TouchableOpacity
                                    key={idx}
                                    onPress={() => handleSelectSku(item.product_id, variant.sku)}
                                    style={tw`mb-2 px-4 py-2 rounded-lg border ${selected
                                        ? 'border-blue-400 bg-blue-400/20'
                                        : 'border-gray-600 bg-gray-700/30'
                                        }`}
                                    activeOpacity={0.8}
                                >
                                    <Text
                                        style={tw`text-sm ${selected ? 'text-blue-300 font-semibold' : 'text-white'
                                            }`}
                                    >
                                        {Object.entries(variant.options)
                                            .map(([key, value]) => `${key}: ${value}`)
                                            .join(' / ')}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ))}
                <View style={tw`flex-row items-center justify-center mb-5`}>
                    <TouchableOpacity
                        onPress={() => setQuantity((q) => Math.max(q - 1, 1))}
                        style={tw`px-4 py-2 bg-gray-700 rounded-l-xl border border-gray-600`}
                    >
                        <Text style={tw`text-white text-lg`}>−</Text>
                    </TouchableOpacity>

                    <View style={tw`px-6 py-2 bg-gray-800 border border-gray-600`}>
                        <Text style={tw`text-white text-base`}>{quantity}</Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => setQuantity((q) => Math.min(q + 1, getMaxQuantity()))}
                        style={tw`px-4 py-2 bg-gray-700 rounded-r-xl border border-gray-600`}
                    >
                        <Text style={tw`text-white text-lg`}>＋</Text>
                    </TouchableOpacity>
                </View>

                {/* 🛒 Botón agregar a bolsa */}
                {!isAuthenticated ? (
                    <AuthPrompt
                        title="¡Ingresa para llenar tu bolsa!"
                        message="Inicia sesión o regístrate para guardar combos y realizar compras."
                    />
                ) : (
                    <TouchableOpacity
                        onPress={() => {
                            if (!allVariantsSelected) {
                                Alert.alert(
                                    'Selecciona tus opciones',
                                    'Debes elegir todas las variantes disponibles antes de continuar.'
                                );
                                return;
                            }
                            handleAddToBag();
                        }}
                        disabled={!allVariantsSelected || isPending}
                        style={tw`mt-6 py-3 rounded-xl shadow-md ${!allVariantsSelected || isPending
                            ? 'bg-gray-600'
                            : 'bg-blue-600'
                            }`}
                    >
                        <Text style={tw`text-white text-center text-lg`}>
                            {isPending
                                ? 'Agregando...'
                                : !allVariantsSelected
                                    ? 'Selecciona tus opciones'
                                    : 'Agregar a mi bolsa'}
                        </Text>
                    </TouchableOpacity>
                )}

            </View>

            <CartSidePanel
                visible={showCartPanel}
                onClose={() => setShowCartPanel(false)}
                cartData={cartResponse}
            />

        </ScrollView>
    );
};

export default ComboDetailScreen;
