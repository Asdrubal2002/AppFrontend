// components/CategoryFilterBar.jsx
import React, { useMemo, useRef, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import tw from "twrnc";

const colorPalette = [
    '#D6336C', // Rosa fuerte
    '#005DCC', // Azul marca
    '#364FC7', // Azul más profundo
    '#2F9E44', // Verde oscuro
    '#F08C00', // Naranja fuerte
    '#1C7ED6', // Azul celeste más profundo
    '#AE3EC9', // Púrpura oscuro
    '#0CA678', // Verde aqua oscuro
    '#C92A2A', // Rojo oscuro
    '#862E9C', // Púrpura intenso
];


const CategoryFilterBar = ({
    categories = [],
    selectedCategory = null,
    onSelectCategory,
    categoryColors = null,
    textHelp
}) => {
    const scrollRef = useRef(null);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const computedColors = useMemo(() => {
        if (categoryColors) return categoryColors;

        return categories.reduce((acc, cat, index) => {
            acc[cat.id] = colorPalette[index % colorPalette.length];
            return acc;
        }, {});
    }, [categories, categoryColors]);

    const handleScroll = (event) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const isEnd = contentOffset.x + layoutMeasurement.width >= contentSize.width - 20;
        setShowRightArrow(!isEnd);
    };

    return (
        <View style={tw`mb-4 relative`}>

            {/* Scroll horizontal */}
            <ScrollView
                horizontal
                ref={scrollRef}
                onScroll={handleScroll}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={tw`px-4`}
                scrollEventThrottle={16}
                decelerationRate="fast"
                snapToAlignment="start"
            >
                {selectedCategory !== null && (
                    <TouchableOpacity
                        key="all"
                        style={[
                            tw`flex-row items-center rounded-lg px-2 py-2 mr-3`,
                            { backgroundColor: '#a10081' },
                        ]}
                        onPress={() => onSelectCategory(null)}
                    >
                        <View style={tw`bg-white/20 p-1 rounded-full`}>
                            <Ionicons name="trash-bin" size={16} color="#fff" />
                        </View>
                    </TouchableOpacity>
                )}

                {categories.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        style={[
                            tw`flex-row items-center rounded-lg px-4 py-2 mr-3`,
                            {
                                backgroundColor:
                                    selectedCategory === category.id
                                        ? '#2563eb'
                                        : computedColors[category.id],
                            },
                        ]}
                        onPress={() => onSelectCategory(category.id)}
                    >
                        <View style={tw`bg-white/20 p-1 rounded-full mr-2`}>
                            <Ionicons
                                name={category.icon_name || 'pricetag-outline'}
                                size={16}
                                color="#fff"
                            />
                        </View>
                        <Text style={tw`text-white font-bold`}>{category.name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            {selectedCategory !== null && (
                <View style={tw`px-4 mt-4`}>
                    <Text style={tw`text-gray-300 text-xs`}>
                        {textHelp}: <Text style={tw`text-white font-semibold`}>
                            {categories.find((cat) => cat.id === selectedCategory)?.name || 'Todas la categorías'}
                        </Text>
                    </Text>
                </View>
            )}
            {/* Flecha indicadora */}
            {showRightArrow && (
                <View
                    style={tw`absolute right-0 top-0 bottom-0 justify-center`}
                    pointerEvents="none" // Para que no bloquee el scroll
                >
                    <View
                        style={[
                            tw`h-full w-6 justify-center items-center`,
                            {
                                backgroundColor: 'rgba(17, 24, 39, 0.7)', // Gris oscuro translúcido
                            },
                        ]}
                    >
                        <Ionicons name="chevron-forward" size={20} color="#fff" />
                    </View>
                </View>
            )}

        </View>
    );
};

export default CategoryFilterBar;
