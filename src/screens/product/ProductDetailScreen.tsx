import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, TextInput, Modal, Pressable, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import tw from 'twrnc';
import { COLORS } from '../../../theme';
import { useDeleteProduct, useDeleteProductMedia, useProductDetail } from '../../api/product/useProducts';
import PostMediaCarousel from '../../reusable_components/components/PostMediaCarousel';
import Header from '../store/componentes/posts/Header';
import { cleanCache } from '../../utils/cache/cache';
import AuthButton from '../../reusable_components/AuthButton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FullScreenLoader from '../../reusable_components/FullScreenLoader';
import { useAddToCart } from '../../api/cart/useAddToCart';
import CartSidePanel from './cart/CartSidePanel';
import { generateLeafletHTML } from '../../reusable_components/generateLeafletHTML';
import { useLocation } from '../../utils/contexts/LocationContext';
import WebView from 'react-native-webview';
import { useAuthStatus } from '../../api/auth/useUsers';
import { useNavigation } from '@react-navigation/native';
import AuthPrompt from '../../reusable_components/AuthPrompt';
import { getIsSeller, getStoreIds } from '../../utils/authStorage';
import DescripcionExpandible from '../../reusable_components/DescripcionExpandibleProps';
import MapModal from '../../reusable_components/MapModal';
import { API_BASE_URL } from '../../constants';
import BackgroundIcon from '../../reusable_components/BackgroundIcon';

export default function ProductDetailScreen() {
    const { params } = useRoute();
    const { productId } = params;

    const { location } = useLocation();

    const { isAuthenticated, loading } = useAuthStatus();
    const navigation = useNavigation();


    const [videoPaths, setVideoPaths] = useState({});
    const [selectedOptions, setSelectedOptions] = useState({});
    const [selectedVariant, setSelectedVariant] = useState(null);

    const [variantMessage, setVariantMessage] = useState('');
    const [quantity, setQuantity] = useState(1);
    const { data: product, isLoading, error } = useProductDetail(productId);
    const { mutate: addToCart, isPending } = useAddToCart();

    const [showCartPanel, setShowCartPanel] = useState(false);
    const [cartResponse, setCartResponse] = useState(null);
    const [modalVisibleM, setModalVisibleM] = useState(false);
    const [showAllSpecs, setShowAllSpecs] = useState(false);
    const [canManageProduct, setCanManageProduct] = useState(false);

    const [productData, setProductData] = useState(null);

    const { mutate: deleteProduct, isPending: deleting } = useDeleteProduct();

    const { mutate: deleteProductMedia, isLoading: isDeletingProductMedia } = useDeleteProductMedia();

    useEffect(() => {
        const checkOwnership = async () => {
            const isSeller = await getIsSeller();
            const storeIds = await getStoreIds(); // lista de IDs del vendedor
            if (isSeller && storeIds.includes(product.store_id)) {
                setCanManageProduct(true);
            }
        };

        if (product?.store_id) {
            checkOwnership();
        }
    }, [product?.store_id]);

    useEffect(() => {
        if (product) {
            setProductData(product);
        }
    }, [product]);

    useEffect(() => {
        cleanCache(videoPaths); // Limpia cuando cambian
    }, [videoPaths]);

    if (isLoading) return <FullScreenLoader />;
    if (error || !product) return <Text style={tw`p-4 text-red-500`}>Error al cargar producto</Text>;

    const availableStock = selectedVariant?.stock ?? product.stock ?? 1;

    const handleOptionSelect = (optionName, value) => {
        const updatedSelection = {
            ...selectedOptions,
            [optionName]: value,
        };
        console.log('Opción seleccionada:', optionName, value); // <-- Aquí el log
        setSelectedOptions(updatedSelection);
        handleVariantSelection(updatedSelection);
    };

    const handleVariantSelection = (selection) => {
        const match = product.variants.find((variant) => {
            return Object.entries(selection).every(
                ([key, val]) => variant.options[key] === val
            );
        });

        if (match) {
            console.log('Variante encontrada:', match); // <-- Aquí también loguea
            setSelectedVariant(match);
            setVariantMessage('');
        } else {
            console.log('No hay variante disponible para:', selection); // <-- Mensaje si no hay
            setSelectedVariant(null);
            setVariantMessage('Esta combinación no la tenemos aún.');
        }
    };

    const handleAddToCart = () => {
        if (!product) return;

        const hasVariants = product.variants && product.variants.length > 0;
        const payload = {
            store_id: product.store_id,
            product_id: product._id,
            sku: hasVariants ? selectedVariant?.sku : product.sku,
            quantity,
            ...(hasVariants && selectedVariant?.options ? { selected_options: selectedVariant.options } : {}),
        };

        console.log("🧾 Payload al carrito:", payload);

        addToCart(payload, {
            onSuccess: (data) => {
                console.log('🛒 Carrito actualizado:', data);
                setCartResponse(data);
                setShowCartPanel(true);
            },
        });
    };
    const image = product.media?.find(m => m.type === 'image')?.url;

    const html = generateLeafletHTML({
        store: {
            name: product.name,
            latitude: product.store_latitude,
            longitude: product.store_longitude,
            logo: image ? `${image}` : undefined,
        },
        userLocation: location,
        showRoute: true,
    });

    const openModalMap = () => setModalVisibleM(true);
    const closeModalMap = () => setModalVisibleM(false);


    const handleDeleteMedia = (mediaUrl) => {
        Alert.alert("¿Eliminar imagen?", "Esta acción no se puede deshacer.", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Eliminar",
                style: "destructive",
                onPress: () => {
                    deleteProductMedia(
                        {
                            product_slug: product.slug,
                            image_url: mediaUrl,
                        },
                        {
                            onSuccess: () => {
                                console.log("✅ Imagen eliminada correctamente");
                                // Solo si product.media no es undefined:
                                if (product?.media) {
                                    product.media = product.media.filter((m) => m.url !== mediaUrl);
                                }
                            },
                            onError: (err) => {
                                console.error("❌ Error al eliminar imagen:", err?.response?.data || err.message);
                                Alert.alert("Error", "No se pudo eliminar la imagen");
                            },
                        }
                    );
                },
            },
        ]);
    };


    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endDate = new Date(product.discount_end);
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    const daysLeft = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isExpired = daysLeft < 0;


    return (
        <>
            <BackgroundIcon name="receipt" />


            {/* 🔒 Modal con mapa */}
            <MapModal
                visible={modalVisibleM}
                html={html}
                onClose={closeModalMap}
            />
            <ScrollView style={tw`flex-1`}>
                {canManageProduct && (
                    <View style={tw`mt-4 flex-row justify-between mx-4`}>
                        {/* Botón Editar */}
                        <TouchableOpacity
                            onPress={() =>
                                navigation.navigate('FormProduct', {
                                    productId: product._id,
                                    initialData: product,
                                    isEdit: true,
                                })
                            }
                            style={tw`flex-1 mr-2 flex-row items-center justify-center border border-blue-500/30 bg-blue-500/20 py-3 rounded-xl`}
                        >
                            <Ionicons name="create-outline" size={18} color="#3B82F6" style={tw`mr-2`} />
                            <Text style={tw`text-blue-600 font-medium`}>Editar</Text>
                        </TouchableOpacity>

                        {/* Botón Eliminar */}
                        <TouchableOpacity
                            onPress={() => {
                                Alert.alert('Confirmar', '¿Estás seguro de eliminar este producto?', [
                                    { text: 'Cancelar', style: 'cancel' },
                                    {
                                        text: 'Eliminar',
                                        style: 'destructive',
                                        onPress: () => {
                                            deleteProduct({
                                                productSlug: product.slug,
                                                onSuccess: () => {
                                                    navigation.replace('ProductsAdmin', { storeId: product.store_id });
                                                },
                                            });
                                        },
                                    },
                                ]);
                            }}
                            style={tw`flex-1 ml-2 flex-row items-center justify-center border border-red-500/30 bg-red-500/20 py-3 rounded-xl`}
                        >
                            <Ionicons name="trash-outline" size={18} color="#EF4444" style={tw`mr-2`} />
                            <Text style={tw`text-red-600 font-medium`}>
                                {deleting ? 'Eliminando...' : 'Eliminar'}
                            </Text>
                        </TouchableOpacity>

                    </View>
                )}


                <Header
                    logo={product.store_logo}
                    name={product.store_name}
                    slug={product.store_slug}
                    createdAt={product.created_at}
                />
                {/* PostMediaCarousel es un componente de presentación (visual). Si le metes lógica de estado como videoPaths, se vuelve demasiado inteligente y mezcla funciones que no le corresponden:
                Mostrar medios (esto sí).
                Manejar caché y estado global/local (eso es responsabilidad del componente padre). */}
                <PostMediaCarousel
                    media={product.media}
                    visiblePostIndex={0}
                    postIndex={0}
                    videoPaths={videoPaths}
                    setVideoPaths={setVideoPaths}
                    canManagePost={canManageProduct}
                    onDeleteMedia={handleDeleteMedia}
                />
                <View style={tw`rounded-3xl p-5    shadow-xl shadow-purple-900/20`}>
                    {/* Header con nombre y ubicación */}
                    <View style={tw`flex-row items-center justify-between mb-3`}>
                        <Text style={tw`text-2xl font-bold text-white flex-1 pr-4`}>
                            {product.name}
                        </Text>

                        {product?.store_latitude && (
                            <TouchableOpacity
                                onPress={openModalMap}
                                style={tw`justify-center p-3 rounded-full shadow-lg`}
                            >
                                <Ionicons name="location-sharp" size={24} color="#ffffff" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Categoría */}
                    <View style={tw`flex-row items-center self-start bg-blue-500/30 px-3 py-1 rounded-full mb-5 border border-blue-400`}>
                        <Ionicons name="pricetag" size={14} color={COLORS.BlueSkyWord} style={tw`mr-2`} />
                        <Text style={tw`text-blue-300 text-sm font-semibold`}>
                            {product.category_name}
                        </Text>
                    </View>

                    {/* Marca y modelo */}
                    <View style={tw`flex-row items-center flex-wrap mb-4`}>
                        {product.brand && (
                            <View style={tw`flex-row items-center bg-gray-800 rounded-full px-3 py-1 mr-2 mb-2`}>
                                <Ionicons name="ribbon" size={14} color="#ffdc15ff" style={tw`mr-1`} />
                                <Text style={tw`text-yellow-300 text-xs font-medium`}>
                                    {product.brand}
                                </Text>
                            </View>
                        )}
                        {product.model && (
                            <View style={tw`flex-row items-center bg-gray-800 rounded-full px-3 py-1 mr-2 mb-2`}>
                                <Ionicons name="construct" size={14} color="#a87402ff" style={tw`mr-1`} />
                                <Text style={tw`text-yellow-600 text-xs font-medium`}>
                                    {product.model}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Descripción */}
                    <DescripcionExpandible description={product.description} />

                    {/* Tarjeta de detalles principales */}
                    <View style={tw`rounded-2xl p-5 mb-6 bg-gray-800`}>
                        <View style={tw`flex-row items-center mb-4`}>
                            <Text style={tw`text-white text-lg font-bold`}>
                                Detalles principales
                            </Text>
                        </View>

                        {/* Precio con descuento */}
                        {product.discount_percentage && product.discounted_price && (
                            <>
                                <View style={tw`flex-row items-center justify-between mb-2`}>
                                    <Text style={tw`text-gray-400 text-sm`}>Precio con descuento:</Text>
                                    <Text style={tw`text-green-400 text-lg font-bold`}>
                                        ${product.discounted_price.toLocaleString()}
                                    </Text>
                                </View>

                                <View style={tw`flex-row items-center justify-between mb-3`}>
                                    <Text style={tw`text-gray-300 text-xs`}>Descuento {product.discount_percentage}%</Text>
                                    <Text style={tw`text-red-400 text-xs line-through`}>
                                        ${product.price.toLocaleString()}
                                    </Text>
                                </View>


                                <View style={tw`${isExpired ? 'bg-red-500/30 border-red-500' : 'bg-blue-500/30 border-blue-500'} rounded-lg p-2 mb-3 border`}>
                                    <Text style={tw`${isExpired ? 'text-red-200' : 'text-blue-200'} text-xs text-center`}>
                                        {isExpired
                                            ? `Oferta expiró el ${end.toLocaleDateString()}`
                                            : `Oferta válida por ${daysLeft} días más (hasta ${end.toLocaleDateString()})`}
                                    </Text>
                                </View>

                            </>
                        )}

                        {/* Precio normal */}
                        {(!product.discount_percentage || !product.discounted_price) && (
                            <View style={tw`flex-row items-center justify-between mb-4`}>
                                <Text style={tw`text-gray-300 text-sm`}>Precio:</Text>
                                <Text style={tw`text-yellow-400 text-lg font-bold`}>
                                    ${product.price.toLocaleString()} COP
                                </Text>
                            </View>
                        )}

                        {/* Otras características */}
                        <View style={tw` gap-3`}>
                            {product.stock !== undefined && (
                                <View style={tw`bg-gray-900/50 rounded-lg p-2`}>
                                    <Text style={tw`text-gray-400 text-xs`}>Disponibles</Text>
                                    <Text style={tw`text-white font-semibold`}>{product.stock} unidades</Text>
                                </View>
                            )}

                            {product.warranty && (
                                <View style={tw`bg-gray-900/50 rounded-lg p-2`}>
                                    <Text style={tw`text-gray-400 text-xs`}>Garantía</Text>
                                    <Text style={tw`text-white font-semibold`}>{product.warranty}</Text>
                                </View>
                            )}

                            {product.shipping_included !== undefined && (
                                <View style={tw`bg-gray-900/50 rounded-lg p-2`}>
                                    <Text style={tw`text-gray-400 text-xs`}>Envío</Text>
                                    <Text style={tw`text-white font-semibold`}>
                                        {product.shipping_included ? 'Incluido ✓' : 'No incluido'}
                                    </Text>
                                </View>
                            )}

                            {product.condition && (
                                <View style={tw`bg-gray-900/50 rounded-lg p-2`}>
                                    <Text style={tw`text-gray-400 text-xs`}>Condición</Text>
                                    <Text style={tw`text-white font-semibold`}>{product.condition}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Dimensiones y peso */}
                    {(() => {
                        const { weight_kg, dimensions_cm } = product;
                        const { ancho = 0, alto = 0, largo = 0 } = dimensions_cm || {};
                        const hasWeight = !!weight_kg;
                        const hasValidDimensions = ancho > 0 || alto > 0 || largo > 0;

                        if (!hasWeight && !hasValidDimensions) return null;

                        return (
                            <View style={tw`bg-gray-800/50 rounded-xl p-4 mb-6`}>
                                {/* Peso centrado arriba */}
                                {hasWeight && (
                                    <View style={tw`flex-row justify-center mb-3 bg-gray-800/50 rounded-lg`}>
                                        <View style={tw`flex-row items-center px-4 py-2`}>
                                            <Ionicons name="barbell" size={16} color="#10B981" style={tw`mr-2`} />
                                            <Text style={tw`text-white text-sm font-medium`}>{weight_kg} kg</Text>
                                        </View>
                                    </View>
                                )}

                                {/* Dimensiones en fila abajo */}
                                {hasValidDimensions && (
                                    <View style={tw`flex-row justify-between gap-2`}>
                                        {largo > 0 && (
                                            <View style={tw`flex-1 items-center px-2 py-2`}>
                                                <Text style={tw`text-gray-400 text-xs mb-1`}>Largo</Text>
                                                <Text style={tw`text-white text-sm font-medium`}>{largo} cm</Text>
                                            </View>
                                        )}
                                        {ancho > 0 && (
                                            <View style={tw`flex-1 items-center px-2 py-2 border-l border-r border-gray-700`}>
                                                <Text style={tw`text-gray-400 text-xs mb-1`}>Ancho</Text>
                                                <Text style={tw`text-white text-sm font-medium`}>{ancho} cm</Text>
                                            </View>
                                        )}
                                        {alto > 0 && (
                                            <View style={tw`flex-1 items-center px-2 py-2`}>
                                                <Text style={tw`text-gray-400 text-xs mb-1`}>Alto</Text>
                                                <Text style={tw`text-white text-sm font-medium`}>{alto} cm</Text>
                                            </View>
                                        )}
                                    </View>
                                )}
                            </View>
                        );
                    })()}
                    {/* Especificaciones técnicas */}
                    {product.specifications && Object.keys(product.specifications).length > 0 && (
                        <View style={tw`mb-6`}>
                            <View style={tw`flex-row items-center mb-3`}>
                                <Ionicons name="document-attach" size={18} color='#fff' style={tw`mr-1`} />
                                <Text style={tw`text-white text-base font-bold`}>
                                    Especificaciones técnicas
                                </Text>
                            </View>

                            <View style={tw`bg-gray-800/50 rounded-xl p-4 `}>
                                {(showAllSpecs
                                    ? Object.entries(product.specifications)
                                    : Object.entries(product.specifications).slice(0, 3)
                                ).map(([key, value]) => (
                                    <View key={key} style={tw`flex-row py-2 border-b border-gray-700 last:border-b-0`}>
                                        <Text style={tw`text-gray-300 text-sm flex-1 mr-2`}>
                                            {key.charAt(0).toUpperCase() + key.slice(1)}
                                        </Text>
                                        <Text style={tw`text-white text-sm font-medium flex-1`}>
                                            {value}
                                        </Text>
                                    </View>
                                ))}

                                {Object.keys(product.specifications).length > 3 && (
                                    <TouchableOpacity
                                        onPress={() => setShowAllSpecs(!showAllSpecs)}
                                        style={tw`mt-3 flex-row items-center justify-center`}
                                    >
                                        <Text style={tw`text-blue-400 text-sm font-medium mr-1`}>
                                            {showAllSpecs ? 'Mostrar menos' : 'Mostrar más'}
                                        </Text>
                                        <Ionicons
                                            name={showAllSpecs ? "chevron-up" : "chevron-down"}
                                            size={16}
                                            color={COLORS.BlueSkyWord}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    )}

                    {/* Opciones de variantes */}
                    {product.options?.map((option) => (
                        <View key={option.name} style={tw`mb-6`}>
                            <View style={tw`flex-row items-center mb-3`}>
                                {/* <Ionicons name="options" size={18} color="#A855F7" style={tw`mr-2`} /> */}
                                <Text style={tw`text-white text-lg font-bold`}>{option.name}</Text>
                            </View>

                            <View style={tw`flex-row flex-wrap gap-2`}>
                                {option.values.map((value) => {
                                    const isSelected = selectedOptions[option.name] === value;
                                    return (
                                        <TouchableOpacity
                                            key={value}
                                            onPress={() => handleOptionSelect(option.name, value)}
                                            style={[
                                                tw`px-4 py-2 rounded-lg mb-2 flex-row items-center`,
                                                {
                                                    backgroundColor: isSelected ? COLORS.BlueWord : '#1F2937',
                                                },
                                            ]}
                                        >
                                            {isSelected && (
                                                <Ionicons name="checkmark-circle" size={16} color="#fff" style={tw`mr-2`} />
                                            )}
                                            <Text style={tw`text-white text-sm font-medium`}>
                                                {value}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    ))}

                    {/* Mensajes de estado */}
                    {variantMessage !== '' && (
                        <View style={tw`bg-red-900/30 border border-red-700 rounded-xl p-3 mb-4 flex-row items-start`}>
                            <Ionicons name="warning" size={18} color="#F87171" style={tw`mr-2 mt-0.5`} />
                            <Text style={tw`text-red-100 text-sm font-medium flex-1`}>
                                {variantMessage}
                            </Text>
                        </View>
                    )}

                    {product.options?.length > 0 && !selectedVariant && (
                        <View style={tw`bg-blue-900/30 border border-[${COLORS.BlueSkyWord}] rounded-xl p-3 mb-4 flex-row items-start`}>
                            <Ionicons name="information-circle" size={18} color="#1ba1eeff" style={tw`mr-2 mt-0.5`} />
                            <Text
                                style={tw`text-blue-100 text-sm font-medium flex-1 flex-wrap`}
                                numberOfLines={0}
                            >
                                Por favor selecciona:{' '}
                                <Text style={tw`font-bold text-[${COLORS.BlueSkyWord}]`}>
                                    {product.options.map((opt) => opt.name).join(', ')}
                                </Text>{' '}
                                antes de continuar.
                            </Text>
                        </View>

                    )}

                    {/* Detalles de la variante seleccionada */}
                    {selectedVariant && (
                        <View style={tw`rounded-2xl p-5 mb-6 border border-[${COLORS.BlueSkyWord}] bg-gray-900`}>
                            <View style={tw`flex-row items-center justify-between mb-3`}>
                                <Text style={tw`text-[${COLORS.BlueSkyWord}] font-semibold text-sm`}>
                                    Selección elegida
                                </Text>

                            </View>

                            <Text style={tw`text-white text-lg font-extrabold mb-3`}>
                                {product.name}
                            </Text>

                            <View style={tw`mb-3`}>
                                {Object.entries(selectedVariant.options).map(([key, val]) => (
                                    <View key={key} style={tw`flex-row items-center mb-2`}>
                                        <View style={tw`w-24`}>
                                            <Text style={tw`text-gray-200 text-sm`}>{key}:</Text>
                                        </View>
                                        <Text style={tw`text-white text-sm font-medium bg-[${COLORS.BlueWord}] px-3 py-1 rounded-full`}>
                                            {val}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            <View style={tw`border-t border-gray-700/50 my-3`} />

                            <View style={tw`flex-row justify-between items-center mb-1`}>
                                <Text style={tw`text-gray-300 text-sm`}>Stock disponible:</Text>
                                <Text style={tw`text-white font-semibold`}>
                                    {selectedVariant.stock} unidades
                                </Text>
                            </View>

                            <View style={tw`flex-row justify-between items-center mb-1`}>
                                <Text style={tw`text-gray-300 text-sm`}>Precio unitario:</Text>
                                <Text style={tw`text-yellow-400 font-bold text-base`}>
                                    ${selectedVariant.discounted_price.toLocaleString()}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Selector de cantidad */}
                    <View style={tw`bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700`}>
                        <View style={tw`flex-row items-center justify-between mb-3`}>
                            <Text style={tw`text-white text-base font-medium`}>Cantidad:</Text>

                            <View style={tw`flex-row items-center bg-gray-900 rounded-lg overflow-hidden`}>
                                <TouchableOpacity
                                    onPress={() => setQuantity((prev) => Math.max(1, prev - 1))}
                                    style={tw`px-4 py-3 bg-gray-800`}
                                >
                                    <Text style={tw`text-white text-lg font-bold`}>−</Text>
                                </TouchableOpacity>

                                <TextInput
                                    style={tw`bg-gray-900 px-4 py-2 text-white text-center text-base w-12`}
                                    keyboardType="number-pad"
                                    value={quantity.toString()}
                                    onChangeText={(text) => {
                                        const parsed = parseInt(text, 10);
                                        if (text === '') {
                                            setQuantity('');
                                        } else if (!isNaN(parsed)) {
                                            const maxStock = selectedVariant?.stock || product.stock;
                                            const clamped = Math.max(1, Math.min(maxStock, parsed));
                                            setQuantity(clamped);
                                        }
                                    }}
                                    onBlur={() => {
                                        if (quantity === '') setQuantity(1);
                                    }}
                                />

                                <TouchableOpacity
                                    onPress={() => {
                                        const maxStock = selectedVariant?.stock || product.stock;
                                        setQuantity((prev) => Math.min(maxStock, prev + 1))
                                    }}
                                    style={tw`px-4 py-3 bg-gray-800`}
                                >
                                    <Text style={tw`text-white text-lg font-bold`}>＋</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Total */}
                        <View style={tw`flex-row justify-between items-center pt-3 border-t border-gray-700`}>
                            <Text style={tw`text-white text-base font-medium`}>Total a pagar:</Text>
                            <Text style={tw`text-green-400 font-bold text-lg`}>
                                ${((selectedVariant?.discounted_price || product.discounted_price) * quantity).toLocaleString()} COP
                            </Text>
                        </View>
                    </View>

                    {/* Botón de acción */}
                    {!isAuthenticated ? (
                        <AuthPrompt
                            title="¡Ingresa para llenar tu bolsa!"
                            message="Inicia sesión o regístrate para guardar productos y realizar compras."
                        />
                    ) : (
                        <TouchableOpacity
                            onPress={handleAddToCart}
                            disabled={isPending || (product.variants?.length > 0 && !selectedVariant)}
                            style={[
                                tw`flex-row items-center justify-center rounded-xl py-4 px-6 shadow-lg mt-2 mb-4`,
                                {
                                    backgroundColor:
                                        selectedVariant || product.variants?.length === 0
                                            ? COLORS.BlueWord
                                            : '#4B5563',
                                    opacity:
                                        isPending || (product.variants?.length > 0 && !selectedVariant)
                                            ? 0.7
                                            : 1,
                                }
                            ]}
                        >
                            <Ionicons
                                name={isPending ? "bag-add-outline" : "bag-handle-outline"}
                                size={22}
                                color="#fff"
                                style={tw`mr-3`}
                            />
                            <Text style={tw`text-white text-lg `}>
                                {isPending ? 'Agregando...' : 'Agregar a mi bolsa'}
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* Palabras clave */}
                    {product.keywords?.length > 0 && (
                        <View style={tw`flex-row flex-wrap mt-4`}>
                            {product.keywords.map((kw) => (
                                <View
                                    key={kw}
                                    style={tw`px-3 py-1 rounded-full mr-2 mb-2 border border-blue-700/50`}
                                >
                                    <Text style={tw`text-blue-300 text-xs font-medium`}>
                                        #{kw}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                <CartSidePanel
                    visible={showCartPanel}
                    onClose={() => setShowCartPanel(false)}
                    cartData={cartResponse}
                />


            </ScrollView>
        </>
    );
}
