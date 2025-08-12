import { useNavigation } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import {
    Dimensions,
    Modal,
    Pressable,
    TouchableOpacity,
    Animated,
    Text,
    View,
    Image,
    ScrollView,
} from "react-native";
import tw from 'twrnc';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from "../../theme";
import { getIsSeller, getUsername } from "../utils/authStorage";

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function SidePanel({ visible, onClose, isAuthenticated }) {
    const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
    const navigation = useNavigation();

    const [username, setUsername] = useState<string | null>(null);
    const [isSeller, setIsSeller] = useState<boolean | null>(null);

    useEffect(() => {
        const loadUserInfo = async () => {
            const storedUsername = await getUsername();
            const sellerFlag = await getIsSeller();

            setUsername(storedUsername);
            setIsSeller(sellerFlag);
        };

        if (isAuthenticated && visible) {
            loadUserInfo();
        }
    }, [isAuthenticated, visible]);

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: visible ? 0 : -SCREEN_WIDTH,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [visible]);

    const MenuOption = ({ iconName, label, onPress }) => (
        <TouchableOpacity
            onPress={onPress}
            style={tw`flex-row items-center py-4 border-b border-gray-800`}
            activeOpacity={0.7}
        >
            <Ionicons name={iconName} size={24} color="white" style={tw`mr-4`} />
            <Text style={tw`text-base text-white`}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <Modal transparent visible={visible} animationType="none">
            <Pressable style={tw`absolute w-full h-full bg-black bg-opacity-30`} onPress={onClose} />

            <Animated.View
                style={[
                    tw`absolute top-0 bottom-0 w-3/4 p-6 shadow-lg`,
                    {
                        left: slideAnim,
                        shadowColor: '#000',
                        shadowOffset: { width: 2, height: 0 },
                        shadowOpacity: 0.8,

                    }, { backgroundColor: COLORS.Modals }
                ]}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={tw`pb-10`}
                >
                    {/* Header */}
                    <View style={tw`pb-4`}>
                        <View style={tw`flex-row justify-between items-center mb-2`}>
                            <Text style={tw`text-white text-xl font-semibold`}>
                                {isAuthenticated && username ? `Hola, ${username}` : 'Menú'}
                            </Text>
                            <Pressable
                                onPress={onClose}
                                style={tw`p-1 -mr-2`}
                            >
                                <Ionicons name="close" size={24} color="gray" />
                            </Pressable>
                        </View>

                        {isAuthenticated && username && (
                            <Text style={tw`text-gray-400 text-sm`}>
                                {isSeller === null ? '...' : isSeller ? 'Cuenta de vendedor' : 'Cuenta de cliente'}
                            </Text>
                        )}
                    </View>

                    {isAuthenticated === true && (
                        <>
                            {/* Grupo: Cuenta */}
                            <View style={tw`mb-5`}>
                                <Text style={tw`text-gray-400 text-xs mb-2`}>CUENTA</Text>
                                <MenuOption
                                    iconName="people-outline"
                                    label="Mi perfil"
                                    onPress={() => {
                                        onClose();
                                        navigation.navigate('Tabs', { screen: 'Perfil', params: { screen: 'UserProfile' } });
                                    }}
                                />
                                <MenuOption
                                    iconName="storefront-outline"
                                    label="Negocios seguidos"
                                    onPress={() => {
                                        onClose();
                                        navigation.navigate('Tabs', { screen: 'Perfil', params: { screen: 'FavoriteStoresScreen' } });
                                    }}
                                />

                                <MenuOption
                                    iconName="thumbs-up-outline"
                                    label="Publicaciones favoritas"
                                    onPress={() => {
                                        onClose();
                                        navigation.navigate('Tabs', { screen: 'Perfil', params: { screen: 'Favoritepost' } });
                                    }}
                                />
                                
                                 <MenuOption
                                    iconName="bag-handle-outline"
                                    label="Mis canastas"
                                    onPress={() => {
                                        onClose();
                                        navigation.navigate('Tabs', { screen: 'Perfil', params: { screen: 'MyCarts' } });
                                    }}
                                />
                            </View>

                            {/* Grupo: Negocio */}
                            <View style={tw`mb-5`}>
                                <Text style={tw`text-gray-400 text-xs mb-2`}>NEGOCIO</Text>
                                <MenuOption
                                    iconName="business-outline"
                                    label={isSeller ? 'Panel administrativo' : 'Crear mi negocio'}
                                    onPress={() => {
                                        onClose();
                                        navigation.navigate('Tabs', {
                                            screen: 'Tiendas',
                                            params: {
                                                screen: isSeller ? 'PanelStore' : 'CreateStore',
                                            },
                                        });
                                    }}
                                />

                            </View>

                            {/* Grupo: Actividad */}
                            <View style={tw`mb-5`}>
                                <Text style={tw`text-gray-400 text-xs mb-2`}>ACTIVIDAD</Text>
                                <MenuOption
                                    iconName="card-outline"
                                    label="Compras"
                                    onPress={() => {
                                        onClose();
                                        // navigation.navigate('Tabs', { screen: 'Tiendas', params: { screen: 'CreateStore' } });
                                    }}
                                />
                            </View>

                            {/* Grupo: Preferencias */}
                            <View style={tw`mb-5`}>
                                <Text style={tw`text-gray-400 text-xs mb-2`}>PREFERENCIAS</Text>
                                <MenuOption
                                    iconName="construct-outline"
                                    label="Configuración"
                                    onPress={() => {
                                        onClose();
                                        navigation.navigate('Tabs', { screen: 'Perfil', params: { screen: 'Config' } });
                                    }}
                                />
                            </View>
                        </>

                    )}
                    {isAuthenticated === false && (
                        <>
                            <MenuOption
                                iconName="log-in-outline"
                                label="Iniciar Sesión"
                                onPress={() => {
                                    onClose();
                                    navigation.navigate('Tabs', { screen: 'Perfil', params: { screen: 'Login' } });
                                }}
                            />
                            <MenuOption
                                iconName="person-add-outline"
                                label="Crear mi cuenta"
                                onPress={() => {
                                    onClose();
                                    navigation.navigate('Tabs', { screen: 'Perfil', params: { screen: 'Register' } });
                                }}
                            />
                        </>
                    )}

                    {isAuthenticated === null && (
                        <Text style={tw`text-white mb-4`}>Estado de autenticación desconocido</Text>
                    )}

                    {/* FOOTER CON LOGO Y VERSIÓN */}

                    <View style={tw`mt-auto flex-row items-center justify-center pt-10`}>
                        <Image
                            source={require('../utils/imgs/ruvlo.png')} // Ajusta el path
                            style={tw`w-10 h-10 mr-3`} // Tamaño pequeño con margen a la derecha
                            resizeMode="contain"
                        />
                        <View>
                            <Text style={tw`text-white text-sm font-semibold`}>Ruvlo - <Text style={tw`text-gray-300 text-xs`}>Versión 1.0.0</Text></Text>

                            {isAuthenticated && username && (
                                <Text style={tw`text-gray-300 text-xs`}>{username}</Text>
                            )}

                            <Text style={tw`text-gray-300 text-xs`}>Conectamos tiendas contigo</Text>

                        </View>
                    </View>


                    {/* <TouchableOpacity
                    onPress={onClose}
                    style={tw`mt-8 py-3 rounded-lg bg-gray-900 items-center`}
                    activeOpacity={0.7}
                >
                    <Text style={tw`text-white text-lg font-semibold`}>Cerrar Panel</Text>
                </TouchableOpacity> */}

                </ScrollView>
            </Animated.View>
        </Modal>
    );
}
