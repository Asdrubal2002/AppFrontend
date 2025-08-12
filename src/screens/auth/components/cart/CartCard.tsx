import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import { useNavigation } from "@react-navigation/native";
import { DEFAULT_LOGO_BASE64 } from '../../../../constants';


if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export const CartCard = ({ cart }) => {
    const [expanded, setExpanded] = useState(false);
    const navigation = useNavigation();

    const toggleExpanded = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded((prev) => !prev);
    };

    return (
        <View style={tw`bg-gray-900 p-4 rounded-2xl shadow my-4`}>
            {/* Cabecera */}
            <TouchableOpacity
                onPress={toggleExpanded}
                activeOpacity={0.9}
                style={tw`flex-row items-center justify-between mb-3`}
            >
                <View style={tw`flex-row items-center`}>
                    <Image
                        source={{ uri: cart.store_logo ||DEFAULT_LOGO_BASE64}}
                        style={tw`w-10 h-10 rounded-full mr-3`}
                    />
                    <View>
                        <Text style={tw`text-lg font-bold text-white`}>{cart.store_name}</Text>
                    </View>
                </View>

                <Ionicons
                    name={expanded ? 'chevron-up-outline' : 'chevron-down-outline'}
                    size={20}
                    color="#4B5563"
                />
            </TouchableOpacity>

            <View style={tw`bg-gray-800 rounded-xl p-4 mt-4`}>
                <View style={tw`flex-row justify-between mb-2`}>
                    <Text style={tw`text-gray-300`}>Subtotal:</Text>
                    <Text style={tw`text-gray-300`}>
                        ${parseFloat(cart.total || 0).toLocaleString()}
                    </Text>
                </View>

                <View style={tw`flex-row justify-between mb-2`}>
                    <Text style={tw`text-gray-300`}>Descuentos:</Text>
                    <Text style={tw`text-green-400`}>
                        {(
                            parseFloat(cart.items_subtotal || 0) -
                            parseFloat(cart.total || 0)
                        ).toLocaleString()}
                    </Text>
                </View>

                <View style={tw`border-t border-gray-700 pt-3 mt-2 flex-row justify-between`}>
                    <Text style={tw`text-white font-bold text-lg`}>Total a pagar:</Text>
                    <Text style={tw`text-white font-bold text-lg`}>
                        ${parseFloat(cart.items_subtotal || 0).toLocaleString()}
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                onPress={() => navigation.navigate('Tabs', {
                    screen: 'Perfil',
                    params: {
                        screen: 'Checkout',
                        params: {
                            cartId: cart.id,
                        },
                    },
                })}
            >
                
                <View style={tw`bg-gray-800 rounded-xl p-4 mt-2 flex-row  items-center`}>
                    <Text style={tw`mr-2`}>Gestionar mis productos</Text>
                     <Ionicons name="chevron-forward-outline" size={17} color="white" />
                </View>

            </TouchableOpacity>


            {/* Items (expandibles) */}
            {expanded && (
                <View style={tw`mt-4`}>
                    {cart.items.map((item, idx) => (
                        <View
                            key={idx}
                            style={tw`flex-row items-start mt-4 border-t border-gray-700 pt-4`}
                        >
                            {/* Imagen del producto (si hay) */}
                            {item.product_image ? (
                                <Image
                                    source={{ uri: item.product_image || 'https://www.shutterstock.com/image-vector/default-image-icon-vector-missing-600nw-2079504220.jpg' }}
                                    style={tw`w-16 h-16 rounded-lg`}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={tw`w-16 h-16 rounded-lg bg-gray-800`} />
                            )}

                            {/* Info del producto */}
                            <View style={tw`flex-1 ml-4`}>
                                <Text style={tw`text-base font-bold text-white`}>
                                    {item.product_name}
                                </Text>

                                <Text style={tw`text-sm text-gray-400`}>
                                    Cantidad: {item.quantity}
                                </Text>

                                {/* Opciones */}
                                <Text style={tw`text-xs text-gray-400 mt-1`}>
                                    {Object.entries(item.selected_options)
                                        .map(([k, v]) => `• ${k}: ${v}`)
                                        .join('\n')}
                                </Text>

                                <Text style={tw`text-sm text-yellow-400 mt-2`}>
                                    Precio: ${parseFloat(item.price).toLocaleString()}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}

        </View>
    );
};
