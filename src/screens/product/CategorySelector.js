import { useState } from "react";
import { TouchableOpacity, View, Text } from "react-native";
import tw from 'twrnc';
import { COLORS } from "../../../theme";

const CategorySelector = ({
    categories = [],
    selectedCategory,
    setSelectedCategory,
    showTitle = true,
}) => {
    const [path, setPath] = useState([]);

    const getCurrentCategories = () => {
        let current = categories;
        for (const selectedId of path) {
            const found = current.find(cat => cat.id === selectedId);
            current = found?.subcategories || [];
        }
        return current;
    };

    const getSelectedPathObjects = () => {
        let current = categories;
        let result = [];
        for (const id of path) {
            const found = current.find(cat => cat.id === id);
            if (found) {
                result.push(found);
                current = found.subcategories || [];
            } else {
                break;
            }
        }
        return result;
    };

    const currentLevel = getCurrentCategories();
    const pathObjects = getSelectedPathObjects();

    const handleSelect = (catId) => {
        if (selectedCategory === catId) {
            const index = path.indexOf(catId);
            if (index !== -1) {
                const newPath = path.slice(0, index);
                setPath(newPath);
            } else {
                setPath([]);
            }
            setSelectedCategory(null);
            return;
        }

        const selectedCat = currentLevel.find(cat => cat.id === catId);
        setSelectedCategory(catId);

        if (selectedCat?.subcategories?.length > 0) {
            setPath([...path, catId]);
        }
    };

    const handleBackTo = (index) => {
        const newPath = path.slice(0, index + 1);
        setPath(newPath);
        setSelectedCategory(null);
    };

    return (
        <View style={tw`px-2`}>
            {showTitle && (
                <Text style={[tw`text-lg font-bold mb-5 text-gray-100`, { color: COLORS.Textmodals }]}>
                    ¿Qué categoría estás buscando?
                </Text>
            )}

            {/* Breadcrumbs navigation - Ahora con wrap */}
            {pathObjects.length > 0 && (
                <View style={tw`mb-4 p-3 bg-gray-800 rounded-lg`}>
                    <View style={tw`flex-row flex-wrap items-center`}>
                        <TouchableOpacity 
                            onPress={() => {
                                setPath([]);
                                setSelectedCategory(null);
                            }}
                            style={tw`mr-2 mb-1`}
                        >
                            <Text style={tw`text-blue-400`}>Todas</Text>
                        </TouchableOpacity>
                        
                        {pathObjects.map((cat, index) => (
                            <View key={cat.id} style={tw`flex-row items-center mb-1`}>
                                <Text style={tw`text-gray-400 mx-1`}>/</Text>
                                <TouchableOpacity
                                    onPress={() => handleBackTo(index)}
                                    style={tw.style(
                                        'px-3 py-1 rounded-lg',
                                        index === pathObjects.length - 1 
                                            ? 'bg-blue-900' 
                                            : 'bg-transparent'
                                    )}
                                >
                                    <Text style={tw.style(
                                        'text-white',
                                        index === pathObjects.length - 1 && 'font-semibold'
                                    )}>
                                        {cat.name}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity
                        onPress={() => {
                            setPath([]);
                            setSelectedCategory(null);
                        }}
                        style={tw`flex-row items-center px-3 py-1 bg-gray-700 rounded-lg mt-2 self-start`}
                    >
                        <Text style={tw`text-gray-300`}>Limpiar</Text>
                    </TouchableOpacity>
                </View>
            )}
            
            {/* Current level categories - Diseño responsivo */}
            <View style={tw`flex-row flex-wrap gap-3 mb-2`}>
                {currentLevel.map(cat => (
                    <View key={cat.id} style={tw`min-w-[48%] flex-1`}>
                        <TouchableOpacity
                            onPress={() => handleSelect(cat.id)}
                            style={tw.style(
                                'px-5 py-3 rounded-xl border',
                                selectedCategory === cat.id
                                    ? 'bg-blue-600 border-blue-400 shadow-md'
                                    : 'bg-gray-800 border-gray-700'
                            )}
                        >
                            <Text 
                                style={tw.style(
                                    'text-white text-center',
                                    selectedCategory === cat.id ? 'font-semibold' : 'font-medium'
                                )}
                                numberOfLines={2}
                                ellipsizeMode="tail"
                            >
                                {cat.name}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </View>
    );
};

export default CategorySelector;