// components/cart/CartSidePanel.tsx
import { Modal, Animated, Dimensions, Pressable, ScrollView, View, Text, Image, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import tw from 'twrnc';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TextInput } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { groupCartItems, removeCartItem, removeItemFromCart, updateCartItem, updateCartItemQuantity } from '../../../utils/cart/cartActions';
import CartItemCard from '../../../reusable_components/cart/CartItemCard';
import CartItemsList from '../../../reusable_components/cart/CartItemsList';


export default function CartSidePanel({ visible, onClose, cartData }) {
  const SCREEN_WIDTH = useRef(Dimensions.get('window').width).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const navigation = useNavigation();

  // Estado inicial seguro
  const [cartResponse, setCartResponse] = useState({
    items: [],
    items_subtotal: 0,
    total: 0,
    store_name: '',
    store: '',
    ...cartData
  });

  const [localQuantities, setLocalQuantities] = useState({});
  const [updatingItems, setUpdatingItems] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const currentCart = cartResponse || {};
  const isCartEmpty = !currentCart?.items || currentCart.items.length === 0;

  // Efecto para animación y carga de datos
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : SCREEN_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start();

    if (visible && cartData) {
      setIsLoading(true);
      setCartResponse(prev => ({
        ...prev,
        ...cartData
      }));
      setIsLoading(false);
    }
  }, [visible, cartData]);

  const handleRemove = async (sku, combo_instance_id = null) => {
    removeItemFromCart({
      sku,
      combo_instance_id,
      store_id: currentCart.store,
      setUpdatingItems,
      setCartResponse,
      currentCart,
    });
  };

  const handleQuantityChange = async (action, item, quantity) => {
    updateCartItem({
      action,
      item,
      quantity,
      store_id: currentCart.store,
      setUpdatingItems,
      setCartResponse,
      currentCart,
      setLocalQuantities,
    });
  };

  const { singles, combos } = groupCartItems(currentCart.items);


  if (isLoading) {
    return (
      <Modal transparent visible={visible}>
        <View style={tw`flex-1 bg-black bg-opacity-50 items-center justify-center`}>
          <ActivityIndicator size="large" color="ffffff" />
        </View>
      </Modal>
    );
  }

  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable
        style={tw`absolute w-full h-full bg-black bg-opacity-50`}
        onPress={onClose}
      />

      <Animated.View
        style={[
          tw`absolute top-0 bottom-0 right-0 w-4/5 max-w-md bg-gray-900`,
          {
            transform: [{ translateX: slideAnim }],
            shadowColor: "#000",
            shadowOffset: { width: -5, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 20,
          },
        ]}
      >
        {/* Encabezado fijo */}
        <View style={tw`p-4 border-b border-gray-800`}>
          <View style={tw`flex-row justify-between items-center`}>
            <View style={tw`flex-row`}>
              <Ionicons name="bag-handle-outline" size={24} color="white" />
              <Text style={tw`text-white font-bold text-xl`}> Tus productos</Text>
            </View>
            <Pressable onPress={onClose} style={tw`p-2 -mr-2`}>
              <Ionicons name="close" size={24} color="white" />
            </Pressable>
          </View>

          {!isCartEmpty && (
            <View style={tw`flex-row justify-between items-center mt-2`}>
              <Text style={tw`text-gray-400 text-sm`}>
                {currentCart.items?.length || 0} {currentCart.items?.length === 1 ? "producto" : "productos"}
              </Text>
              <Text style={tw`text-green-400 font-bold text-lg`}>
                ${parseInt(currentCart.items_subtotal || 0).toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {/* Contenido principal */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tw`pb-28`}
          style={tw`flex-1`}
        >
          {isCartEmpty ? (
            <View style={tw`p-8 items-center justify-center`}>
              <View style={tw`bg-gray-800 p-6 rounded-full mb-4`}>
                <Ionicons name="cart-outline" size={48} color="#4B5563" />
              </View>
              <Text style={tw`text-gray-300 text-xl font-medium mb-2`}>
                Carrito vacío
              </Text>
              <Text style={tw`text-gray-500 text-center mb-6`}>
                Añade productos para comenzar tu compra
              </Text>
              <Pressable
                onPress={onClose}
                style={tw`py-3 px-6 rounded-full`}
              >
                <Text style={tw`text-white font-bold`}>Explorar productos</Text>
              </Pressable>
            </View>
          ) : (
            <>
              {/* Info de la tienda */}
              <TouchableOpacity
                onPress={() => navigation.navigate('Tabs', {
                  screen: 'Tiendas',
                  params: {
                    screen: 'StoreDetail',
                    params: {
                      slug: currentCart.store_slug,
                    },
                  },
                })}
              >
                <View style={tw`flex-row items-center p-4 bg-gray-800 mx-4 mt-4 rounded-lg`}>
                  <Ionicons name="storefront-outline" size={20} color="#3B82F6" />
                  <Text style={tw`text-blue-400 ml-2 font-medium`}>
                    {currentCart.store_name || 'Tienda'}
                  </Text>
                </View>
              </TouchableOpacity>


              {/* Lista de productos */}
              <View style={tw`px-4 mt-2`}>
                <CartItemsList
                  singles={singles}
                  combos={combos}
                  updatingItems={updatingItems}
                  localQuantities={localQuantities}
                  handleQuantityChange={handleQuantityChange}
                  handleRemove={handleRemove}
                  setLocalQuantities={setLocalQuantities}
                  tw={tw}
                />
              </View>

              {/* Resumen del pedido */}
              <View style={tw`bg-gray-800 rounded-xl p-4 mx-4 mt-4 mb-6`}>
                <View style={tw`flex-row justify-between mb-2`}>
                  <Text style={tw`text-gray-300`}>Subtotal:</Text>
                  <Text style={tw`text-gray-300`}>
                    ${parseInt(currentCart.total || 0).toLocaleString()}
                  </Text>
                </View>

                <View style={tw`flex-row justify-between mb-2`}>
                  <Text style={tw`text-gray-300`}>Descuentos:</Text>
                  <Text style={tw`text-green-400`}>
                    -${(
                      parseInt(currentCart.total || 0) -
                      parseInt(currentCart.items_subtotal || 0)
                    ).toLocaleString()}
                  </Text>
                </View>

                <View style={tw`border-t border-gray-700 pt-3 mt-2 flex-row justify-between`}>
                  <Text style={tw`text-yellow-400 font-bold text-lg`}>Total:</Text>
                  <Text style={tw`text-yellow-400 font-bold text-lg`}>
                    ${parseInt(currentCart.items_subtotal || 0).toLocaleString()}
                  </Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {/* Botón de compra fijo (solo si hay productos) */}
        {!isCartEmpty && (
          <View style={tw`absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 bg-gray-900`}>
            <Pressable
              onPress={() =>
                navigation.navigate('Tabs', {
                  screen: 'Perfil',
                  params: {
                    screen: 'Checkout',
                    params: {
                      cartId: currentCart.id,
                    },
                  },
                })
              }
              style={tw`py-2 items-center justify-center`}
            >
              <View style={tw`flex-row items-center`}>
                <Ionicons name="cart-outline" size={22} color="white" style={tw`mr-2`} />
                <Text style={tw`text-white font-bold text-lg`}>Continuar con la compra</Text>
              </View>
            </Pressable>
          </View>

        )}
      </Animated.View>
    </Modal>
  );
}