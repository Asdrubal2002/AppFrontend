import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import tw from 'twrnc';
import { API_BASE_URL, DEFAULT_BANNER_BASE64 } from '../../constants';

const ProductCard = ({ item, compact = false }) => {
    const navigation = useNavigation();

    const hasDiscount =
        item.discount_percentage &&
        item.discounted_price &&
        item.discounted_price < item.price;

    return (
        <TouchableOpacity
            style={tw.style(
                'bg-gray-800/80 rounded-sm mb-4 shadow-lg overflow-hidden',
                compact ? 'w-48 mr-4' : 'w-[48%]'
            )}
            onPress={() => navigation.navigate('Tabs', {
                screen: 'Tiendas',
                params: {
                    screen: 'ProductDetail',
                    params: {
                        productId: item._id,
                    },
                },
            })}
            activeOpacity={0.85}
        >
            <View>
                <Image
                    source={{
                        uri: item.preview_image ? `${API_BASE_URL}${item.preview_image}` : DEFAULT_BANNER_BASE64
                        }}
                    style={tw.style('w-full', compact ? 'h-24' : 'h-36', 'rounded-b')}
                    resizeMode="cover"
                />

                {hasDiscount && (
                    <View style={tw`absolute top-2 left-2 bg-red-600 px-2 py-1 rounded`}>
                        <Text style={tw`text-white text-xs font-bold`}>
                            -{item.discount_percentage}%
                        </Text>
                    </View>
                )}
            </View>

            <View style={tw`p-3`}>
                <Text style={tw`text-white text-sm font-semibold mb-1`} >
                    {item.name}
                </Text>

                {compact ? (
                    <Text style={tw`text-yellow-400 text-lg font-semibold`}>
                        ${item.discounted_price?.toLocaleString() || item.price?.toLocaleString()}
                    </Text>
                ) : (
                    <>
                        <Text style={tw`text-white text-xs mb-1`} numberOfLines={2}>
                            {item.description}
                        </Text>
                        {hasDiscount ? (
                            <>
                                <Text style={tw`text-gray-400 line-through text-sm`}>
                                    ${item.price.toLocaleString()}
                                </Text>
                                <Text style={tw`text-green-400 font-bold text-lg`}>
                                    ${item.discounted_price.toLocaleString()}
                                </Text>
                            </>
                        ) : (
                            <Text style={tw`text-gray-300 font-semibold text-base`}>
                                ${item.price.toLocaleString()}
                            </Text>
                        )}
                    </>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default ProductCard;
