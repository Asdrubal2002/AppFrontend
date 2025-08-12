import { FlatList, Text, RefreshControl, View, Pressable } from "react-native";
import { useUserCarts } from "../../api/auth/useUsers";
import FullScreenLoader from "../../reusable_components/FullScreenLoader";
import { CartCard } from "./components/cart/CartCard";
import tw from 'twrnc';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../../../theme";

const MyCarts = () => {
    const navigation = useNavigation();

    const { data: carts, isLoading, isFetching, error, refetch } = useUserCarts();

    if (isLoading) return <FullScreenLoader />;
    if (error) return <Text>Error al cargar las canastas</Text>

    return (
        <FlatList
            data={carts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <CartCard cart={item} />}
            contentContainerStyle={tw`px-6 py-6 flex-grow`} // <- esto permite que use todo el espacio vertical
            refreshControl={
                <RefreshControl
                    refreshing={isFetching}
                    onRefresh={refetch}
                    colors={['#4f46e5']}
                    tintColor="#4f46e5"
                />
            }
            ListHeaderComponent={() =>
                carts.length > 0 && (
                    <Text style={tw`text-white text-xl mb-4`}>
                        Mis Canastas
                    </Text>
                )
            }
            ListEmptyComponent={() => (
                <View style={tw`flex-1 justify-center items-center`}>
                    <View style={tw`bg-gray-800 p-6 rounded-full mb-4`}>
                        <Ionicons name="bag-outline" size={48} color="#4B5563" />
                    </View>
                    <Text style={tw`text-gray-300 text-xl font-medium mb-2`}>
                        No tienes canastas
                    </Text>
                    <Text style={tw`text-gray-500 text-center mb-6`}>
                        Añade productos para comenzar tus compra
                    </Text>
                    <Pressable
                        onPress={() =>
                            navigation.navigate('Tabs', {
                                screen: 'Tiendas',
                                params: { screen: 'ListProducts' },
                            })
                        }
                        style={({ pressed }) => [
                            tw`py-3 px-6 rounded-full`,
                            {
                                backgroundColor: COLORS.BlueWord,
                                opacity: pressed ? 0.7 : 1
                            }
                        ]}
                    >
                        <Text style={tw`text-white`}>Explorar productos</Text>
                    </Pressable>
                </View>
            )}
        />

    )
}

export default MyCarts;
