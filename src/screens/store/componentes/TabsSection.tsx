import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import ProductsList from './ProductsList';
import StorePosts from './StorePosts';
import CombosList from './CombosList';

const TabsSection = ({ storeId }) => {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <View style={tw``}>
      {/* Tabs */}
      <View style={tw`flex-row border-b border-gray-300`}>


        <TouchableOpacity
          style={tw`flex-1 py-2 items-center ${activeTab === 'posts' ? 'border-b-2 border-blue-500' : ''}`}
          onPress={() => setActiveTab('posts')}
        >
          <Text style={tw`text-base ${activeTab === 'posts' ? 'text-blue-500 font-bold' : 'text-gray-400'}`}>
            Publicaciones
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={tw`flex-1 py-2 items-center ${activeTab === 'products' ? 'border-b-2 border-blue-500' : ''}`}
          onPress={() => setActiveTab('products')}
        >
          <Text style={tw`text-base ${activeTab === 'products' ? 'text-blue-500 font-bold' : 'text-gray-400'}`}>
            Productos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={tw`flex-1 py-2 items-center ${activeTab === 'extra' ? 'border-b-2 border-blue-500' : ''}`}
          onPress={() => setActiveTab('extra')}
        >
          <Text style={tw`text-base ${activeTab === 'extra' ? 'text-blue-500 font-bold' : 'text-gray-400'}`}>
            Ofertas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={tw``}>
        {activeTab === 'posts' && (
          <View style={tw`mt-4 `}>
            <StorePosts storeId={storeId} />
          </View>

        )}
        {activeTab === 'products' && (
          <View style={tw`mt-4 px-2`}>
            <ProductsList storeId={storeId} />
          </View>

        )}
        {activeTab === 'extra' && (
          <CombosList storeId={storeId} />
        )}
      </View>
    </View>
  );
};

export default TabsSection;
