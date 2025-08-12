import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Image, ScrollView, Pressable } from "react-native";
import { useFollowedStores } from "../../api/auth/useUsers";
import tw from "twrnc";
import StoreCard from "../../reusable_components/StoreCard";
import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from "react";
import CategoryFilterBar from "../../reusable_components/CategoryFilterBar";
import FullScreenLoader from "../../reusable_components/FullScreenLoader";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from "../../../theme";

const FavoriteStores = ({ location }) => {
    const [selectedCategory, setSelectedCategory] = useState(null);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isFetching,
        isLoading,
        refetch,
        error,
    } = useFollowedStores(selectedCategory);

    const stores = data?.stores || [];
    const categories = data?.categories || [];

    const navigation = useNavigation();

    if (isLoading) {
        return <FullScreenLoader />;
    }

    if (error) {
        return (
            <View style={tw`flex-1 justify-center items-center`}>
                <Text style={tw`text-red-500`}>Error al cargar tiendas</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={stores}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={tw`px-6 py-6 flex-1`}
            refreshControl={
                <RefreshControl
                    refreshing={isFetching && !isFetchingNextPage}
                    onRefresh={refetch}
                    tintColor="#ffffff"
                />
            }
            renderItem={({ item }) => (
                <StoreCard
                    item={item}
                    location={location}
                    onPress={() => navigation.navigate('Tabs', {
                        screen: 'Tiendas',
                        params: {
                            screen: 'StoreDetail',
                            params: {
                                slug: item.slug,
                                userLocation: location,
                            },
                        },
                    })}
                />
            )}
            onEndReached={() => hasNextPage && fetchNextPage()}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
                isFetchingNextPage ? <ActivityIndicator color="white" /> : null
            }
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={() => (
                <>
                    <Text style={tw`text-white text-xl mb-4`}>
                        Negocios seguidos
                    </Text>
                    <CategoryFilterBar
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                        textHelp="Buscar por"
                    />
                </>

            )}
            ListEmptyComponent={
                !isLoading && !isFetching ? (
                    <View style={tw`flex-1 items-center justify-center`}>
                        <View style={tw`bg-gray-800 p-6 rounded-full mb-4`}>
                            <Ionicons name="storefront-outline" size={48} color="#4B5563" />
                        </View>
                        <Text style={tw`text-gray-300 text-xl font-medium mb-2`}>
                            No sigues ningun negocio
                        </Text>
                        <Text style={tw`text-gray-500 text-center mb-6`}>
                            Sigue negocios para comenzar aprovechar sus productos
                        </Text>
                        <Pressable
                            onPress={() =>
                                navigation.navigate('Tabs', {
                                    screen: 'Tiendas',
                                    params: { screen: 'ListStores' }
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
                            <Text style={tw`text-white`}>Explorar Comercio</Text>
                        </Pressable>

                    </View>
                ) : null
            }
        />
    );
};

export default FavoriteStores;
