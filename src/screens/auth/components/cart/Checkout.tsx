// components/CartCard.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Alert,
  Button,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native';
import { useUserCart } from '../../../../api/auth/useUsers';
import { createCheckout, deleteCart, groupCartItems, removeCartItem, removeItemFromCart, updateCartItem, updateCartItemQuantity } from '../../../../utils/cart/cartActions';
import FullScreenLoader from '../../../../reusable_components/FullScreenLoader';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import { COLORS } from '../../../../../theme';
import { useShippingMethodsFromUserLocation } from '../../../../api/store/useStores';
import CartItemsList from '../../../../reusable_components/cart/CartItemsList';


export default function Checkout({ route }) {
  const { cartId } = route.params;
  const navigation = useNavigation();
  const { data: cartData, isLoading, error } = useUserCart(cartId);

  const [cartResponse, setCartResponse] = useState({
    items: [],
    items_subtotal: 0,
    total: 0,
    store_name: '',
    store: '',
  });

  const [localQuantities, setLocalQuantities] = useState({});
  const [updatingItems, setUpdatingItems] = useState({});
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (cartData) {
      setCartResponse(cartData);
    }
  }, [cartData]);

  const currentCart = cartResponse || {};
  const isCartEmpty = !currentCart?.items || currentCart.items.length === 0;

  const {
    data: shippingMethods,
    isLoading: shippingLoading,
  } = useShippingMethodsFromUserLocation(currentCart.store);


  const subtotal = parseInt(currentCart.total || 0);
  const descuento = subtotal - parseInt(currentCart.items_subtotal || 0);

  const envio = shippingMethods?.[0]?.cost || 0; // o la opción seleccionada
  const totalFinal = subtotal + envio - descuento;

  const [couponCode, setCouponCode] = useState('');
  const shipping_method_id = shippingMethods?.[0]?.id || null;


  const handleDeleteCart = async () => {
    try {
      setDeleting(true);
      await deleteCart(cartId);

      // Navegar directamente sin mostrar Alert
      navigation.navigate('Tabs', {
        screen: 'Perfil',
        params: { screen: 'MyCarts' },
      });
    } catch (error) {
      console.error("❌ Error al eliminar el carrito:", error);
      Alert.alert("Error", "No se pudo eliminar el carrito. Intenta de nuevo.");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCartWithConfirm = () => {
    Alert.alert(
      "¿Eliminar canasta?",
      "Esta acción eliminará todos tus productos.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, eliminar",
          style: "destructive",
          onPress: handleDeleteCart,
        },
      ]
    );
  };


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

  const handleContinueCheckout = async () => {
    const payload = {
      cart_id: cartId,
      shipping_method_id,
      coupon_code: couponCode?.trim() || undefined,
    };

    try {
      const response = await createCheckout(payload);

      // Mostrar resultados con alertas
      if (response.warning) {
        Alert.alert("⚠️ Advertencia", response.warning);
      } else {
        Alert.alert("✅ Compra completada", `Total pagado: $${parseInt(response.total).toLocaleString()}`);
      }

      // Navegar o mostrar resumen
      console.log("✅ Checkout exitoso:", response);
      // navigation.navigate("ResumenOrden", { orderId: response.id }); // opcional

    } catch (error: any) {
      console.error("❌ Error en checkout:", error.message);
      Alert.alert("❌ Error", error.message || "Ocurrió un error al finalizar la compra.");
    }
  };

  if (isLoading) return <FullScreenLoader />;

  if (error) return <Text style={tw`text-white p-4`}>Error al cargar el carrito</Text>;

  return (
    <ScrollView contentContainerStyle={tw`px-4 pt-4`}>
      {!isCartEmpty ? (
        <>
          <TouchableOpacity
            onPress={() => navigation.navigate("Tabs", {
              screen: "Tiendas",
              params: {
                screen: "StoreDetail",
                params: {
                  slug: currentCart.store_slug,
                },
              },
            })}
          >
            <View style={tw`flex-row items-center p-4 bg-gray-800 rounded-lg mb-4`}>
              {currentCart.store_logo ? (
                <Image
                  source={{ uri: currentCart.store_logo }}
                  style={tw`w-6 h-6 rounded-full`}
                  resizeMode="contain"
                />
              ) : (
                // Fallback en caso de que no haya logo
                <View style={tw`w-6 h-6 bg-blue-500 rounded-full`} />
              )}
              <Text style={tw`text-blue-300 ml-2 font-medium`}>
                Productos en {currentCart.store_name || "Tienda"}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Métodos de envio */}
          <View style={tw`p-4`}>
            {shippingLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : shippingMethods?.length > 0 ? (
              shippingMethods.map((method) => (
                <View
                  key={method.id}
                  style={tw`mb-5 bg-gray-900 rounded-2xl p-4 border border-gray-700`}
                >
                  {/* Zona de envío */}
                  <View style={tw`flex-row items-center mb-3`}>
                    <Ionicons
                      name="train-outline"
                      size={20}
                      color={COLORS.BlueSkyWord}
                      style={tw`mr-2`}
                    />
                    <Text style={tw`text-white font-semibold text-base`}>
                      {method.zone_name}
                    </Text>
                  </View>

                  {/* Descripción del método */}
                  {method.description && (
                    <View style={tw`flex-row items-start mb-4`}>
                      <Ionicons
                        name="document-text-outline"
                        size={16}
                        color="#9CA3AF"
                        style={tw`mr-2 mt-0.5`}
                      />
                      <Text style={tw`text-gray-300 text-sm leading-5`}>
                        {method.description}
                      </Text>
                    </View>
                  )}

                  {/* Línea divisoria */}
                  <View style={tw`h-px bg-gray-700 mb-3`} />

                  {/* Costo y tiempo estimado */}
                  <View style={tw`flex-row justify-between`}>
                    <View style={tw`flex-row items-center`}>
                      <Ionicons
                        name="cash-outline"
                        size={18}
                        color="#34D399"
                        style={tw`mr-1`}
                      />
                      <Text style={tw`text-green-400 font-semibold text-sm`}>
                        ${method.cost.toLocaleString()}
                      </Text>
                    </View>

                    <View style={tw`flex-row items-center`}>
                      <Ionicons
                        name="time-outline"
                        size={18}
                        color="#F87171"
                        style={tw`mr-1`}
                      />
                      <Text style={tw`text-red-300 font-semibold text-sm`}>
                        {method.days} días
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <Text style={tw`text-gray-400 text-center text-sm py-4`}>
                No hay métodos de envío disponibles para tu entrega.
              </Text>
            )}
          </View>

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

          <View style={tw`bg-gray-800 rounded-xl p-4 mt-4 mb-6`}>
            {/* Subtotal */}
            <View style={tw`flex-row justify-between mb-2`}>
              <Text style={tw`text-gray-300`}>Subtotal de productos:</Text>
              <Text style={tw`text-gray-300`}>
                ${subtotal.toLocaleString()}
              </Text>
            </View>

            {/* Envío */}
            <View style={tw`flex-row justify-between mb-2`}>
              <Text style={tw`text-gray-300`}>Costo de envío:</Text>
              <Text style={tw`text-blue-400`}>
                ${envio.toLocaleString()}
              </Text>
            </View>

            {/* Descuento */}
            <View style={tw`flex-row justify-between mb-2`}>
              <Text style={tw`text-gray-300`}>Descuento aplicado:</Text>
              <Text style={tw`text-green-400`}>
                -${descuento.toLocaleString()}
              </Text>
            </View>

            {/* Línea divisoria */}
            <View style={tw`border-t border-gray-700 my-3`} />

            {/* Total final */}
            <View style={tw`flex-row justify-between`}>
              <Text style={tw`text-yellow-300 font-bold text-lg`}>Total a pagar:</Text>
              <Text style={tw`text-yellow-300  font-bold text-lg`}>
                ${totalFinal.toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={tw`bg-gray-800 rounded-xl p-4 mb-4`}>
            <Text style={tw`text-white text-base font-semibold mb-2`}>
              ¿Tienes un cupón?
            </Text>
            <View style={tw`flex-row items-center`}>
              <TextInput
                style={tw`flex-1 bg-gray-700 text-white px-4 py-2 rounded-l-lg`}
                placeholder="Ingresa tu cupón"
                placeholderTextColor="#9CA3AF"
                value={couponCode}
                onChangeText={setCouponCode}
              />
              <Pressable
                onPress={() => Alert.alert("Cupón aplicado", `Usaste el cupón: ${couponCode}`)}
                style={[
                  tw`px-4 py-2 rounded-r-lg`, { backgroundColor: COLORS.BlueWord }
                ]}
              >
                <Text style={tw`text-white font-semibold`}>Aplicar cupon</Text>
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={() => {
              if (shippingMethods?.length === 0) return;
              Alert.alert("Aviso", "En contrucción la siguiente parte, pasarela de pagos y demas checkout.");
            }}
            style={({ pressed }) => [
              tw`px-4 py-3 rounded-xl items-center mt-4`,
              shippingMethods?.length > 0
                ? [tw`bg-green-600`, pressed && tw`opacity-80`] // Estilo normal
                : [tw`bg-red-500`, tw`opacity-90`], // Estilo cuando no hay envío
            ]}
            disabled={shippingMethods?.length === 0}
          >
            {shippingMethods?.length > 0 ? (
              <Text style={tw`text-white font-bold text-base`}>
                Continuar con la compra
              </Text>
            ) : (
              <View style={tw`flex-row items-center`}>
                <Ionicons name="close-circle" size={20} color="white" style={tw`mr-2`} />
                <Text style={tw`text-white font-bold text-base`}>
                  No hay envío disponible
                </Text>
              </View>
            )}
          </Pressable>

        </>
      ) : (
        <View style={tw`items-center justify-center pt-30`}>
          <View style={tw`bg-gray-800 p-6 rounded-full mb-4`}>
            <Ionicons name="storefront-outline" size={48} color="#4B5563" />
          </View>
          <Text style={tw`text-gray-300 text-xl font-medium mb-2`}>
            No tienes productos
          </Text>
          <Text style={tw`text-gray-500 text-center mb-6`}>
            No tienes productos seleccionado de {currentCart.store_name}
          </Text>
          {currentCart.store_slug && currentCart.store_name && (
            <Pressable
              onPress={() => navigation.navigate("Tabs", {
                screen: "Tiendas",
                params: {
                  screen: "StoreDetail",
                  params: {
                    slug: currentCart.store_slug,
                  },
                },
              })}
              style={[
                tw`py-3 px-6 rounded-full `, { backgroundColor: COLORS.BlueWord }
              ]}
            >
              <Text style={tw`text-white`}>Explorar productos de {currentCart.store_name}</Text>
            </Pressable>
          )}
        </View>
      )}
      <View style={tw`mt-6 mb-12`}>
        <Pressable
          onPress={handleDeleteCartWithConfirm}
          disabled={deleting}
          style={({ pressed }) => [
            tw`bg-gray-900 px-4 py-3 rounded-xl items-center`,
            pressed && tw`opacity-80`,
            deleting && tw`bg-red-400`,
          ]}
        >
          <Text style={tw`text-white text-base`}>
            {deleting ? "Eliminando..." : "Eliminar mi canasta de productos"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
