import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import { COLORS } from '../../theme';

interface Category {
    id: number;
    name: string;
    icon_name?: string;
}

interface Props {
    visible: boolean;
    onClose: () => void;
    categories: Category[];
    onSelect: (category: Category) => void; // <-- en vez de solo el id
}

const CategorySelectorModal = ({ visible, onClose, categories = [], onSelect }: Props) => {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <View style={tw`flex-1 bg-gray-900 p-4`}>
                <Text style={tw`text-white text-xl font-bold mb-4 text-center`}>
                    Selecciona una categoría
                </Text>

                <View style={tw`flex-row flex-wrap justify-between flex-1`}>
                    {Array.isArray(categories) && categories.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => {
                                onSelect(item);
                            }}
                            style={tw`bg-gray-800 w-[47%] rounded-xl p-4 m-1 items-center`}
                        >
                            <Ionicons
                                name={item.icon_name || 'pricetag-outline'}
                                size={28}
                                color='#fff'
                                style={tw`mb-2`}
                            />
                            <Text style={tw`text-white text-sm text-center`}>{item.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    onPress={onClose}
                    style={tw`mt-4 self-center`}
                >
                    <Text style={tw`text-red-400 text-base`}>Cancelar</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

export default CategorySelectorModal;
