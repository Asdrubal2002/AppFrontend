import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import tw from 'twrnc';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useStoreStats } from '../../api/store/useStores';
import FullScreenLoader from '../../reusable_components/FullScreenLoader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { COLORS } from '../../../theme';
import BackgroundIcon from '../../reusable_components/BackgroundIcon';
import StoreOnboardingCreatedStore from './componentes/create/StoreOnboardingCreatedStore';


const PanelStore = () => {
    const { data: stats, isLoading, isError } = useStoreStats();
    const navigation = useNavigation();
    const [showTutorial, setShowTutorial] = useState(false);
    const [loading, setLoading] = useState(true);

    const defaultChecklist = {
        logoUploaded: false,
        bannerUploaded: false,
        locationShipping: false,
        payMethods: false,
        categoriesCreated: false,
        firstPostCreated: false,
        firstProductCreated: false,
    };

    const [checklist, setChecklist] = useState(defaultChecklist);
    const [loadingChecklist, setLoadingChecklist] = useState(true);
    const [completedAlertShown, setCompletedAlertShown] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const loadChecklist = async () => {
                const saved = await AsyncStorage.getItem('storeSetupChecklist');
                if (saved) {
                    setChecklist(JSON.parse(saved));
                } else {
                    setChecklist(defaultChecklist);
                }

                setLoadingChecklist(false);
            };

            loadChecklist();
        }, [navigation])
    );

    useEffect(() => {
        const checkCompletion = async () => {
            const allDone = Object.values(checklist).every((v) => v);
            const alreadyShown = await AsyncStorage.getItem('completedChecklistShown');

            if (allDone && !alreadyShown) {
                Alert.alert(
                    '🎉 ¡Felicidades!',
                    'Has completado todos los pasos iniciales. Tu tienda ya está lista para recibir clientes.'
                );

                await AsyncStorage.setItem('completedChecklistShown', 'true');
                setCompletedAlertShown(true);
            }
        };

        checkCompletion();
    }, [checklist]);


    useEffect(() => {
        const checkTutorial = async () => {
            const flag = await AsyncStorage.getItem('shouldShowStoreTutorial');
            setShowTutorial(flag === 'true');
            setLoading(false);
        };
        checkTutorial();
    }, []);

    const handleFinishTutorial = async () => {
        await AsyncStorage.setItem('shouldShowStoreTutorial', 'false');
        setShowTutorial(false);
    };

    const handleReplayTutorial = async () => {
        setShowTutorial(true);
    };

    if (showTutorial) {
        return <StoreOnboardingCreatedStore onFinish={handleFinishTutorial} />;
    }

    const storeId = stats?.id;

    if (isLoading) return <FullScreenLoader />;
    if (isError) return <Text>Error al cargar estadísticas</Text>;

    const buttons = [
        { title: 'Ver o actualizar mi negocio', screen: 'StoreAdmin', icon: 'storefront-outline' },
        { title: 'Ver o agregar mis Categorías', screen: 'create-Category', icon: 'bag-add-outline' },
        { title: 'Agregar envios y cobertura', screen: 'ShippingsAdmin', icon: 'paper-plane-outline' },
        { title: 'Agregar Método de pago', screen: 'StorePaymentsAdmin', icon: 'card-outline' },

        { title: 'Agregar Publicaciónes', screen: 'create-post', icon: 'videocam-outline' },
        { title: 'Ver o agregar Cupones', screen: 'CouponsAdmin', icon: 'receipt-outline' },
        { title: 'Agregar producto o servicio', screen: 'FormProduct', icon: 'pricetag-outline' },
        { title: 'Ver mis Publicaciones', screen: 'PostList', icon: 'phone-portrait-outline' },
        { title: 'Ver mis productos o servicios', screen: 'ProductsAdmin', icon: 'pricetags-outline' },
        { title: 'Crear promoción de productos', screen: 'Create-promotion', icon: 'color-filter-outline' },
        { title: 'Ver promociones', screen: 'PromotionsAdmin', icon: 'golf-outline' },
        { title: 'Agregar nuevo miembro', screen: 'Admins', icon: 'person-add-outline' },
    ];

    const handlePress = (screen) => {
        if (['PostList', 'create-post', 'create-Category', 'FormProduct', 'ProductsAdmin', 'ShippingsAdmin', 'CouponsAdmin', 'PromotionsAdmin', 'Create-promotion', 'StorePaymentsAdmin', 'Admins'].includes(screen)) {
            console.log('storeId en botones:', storeId);
            navigation.navigate(screen, { storeId });
        } else {
            navigation.navigate(screen);
        }
    };

    return (
        <View style={tw`flex-1`}>

            <BackgroundIcon name="settings" />


            <ScrollView style={tw`flex-1`} contentContainerStyle={tw`p-5`}>
                <View style={tw`flex-row justify-between items-center mb-6`}>
                    <Text style={tw`text-2xl text-gray-100`}>Panel Administrativo</Text>

                    <TouchableOpacity
                        onPress={handleReplayTutorial}
                        style={tw`items-center px-3 py-1.5`}
                    >
                        <Ionicons name="help-circle-outline" size={25} color="#fff" style={tw`mr-1`} />

                    </TouchableOpacity>
                </View>

                {!loadingChecklist && Object.values(checklist).some((v) => !v) && (
                    <View style={tw`p-5 rounded-3xl mb-6 bg-blue-900/30 border border-blue-500/50`}>
                        <View style={tw`flex-row items-center mb-4`}>
                            <Text style={tw`text-xl font-bold text-white`}>Configuración Inicial</Text>
                        </View>

                        {Object.entries(checklist)
                            .filter(([_, value]) => !value)
                            .map(([key, _]) => {
                                const taskConfig = {
                                    logoUploaded: {
                                        label: 'Sube el logo de tu negocio',
                                        icon: 'image-outline',
                                        action: () => navigation.navigate('StoreAdmin', { open: 'logo' })
                                    },
                                    bannerUploaded: {
                                        label: 'Sube el banner de tu negocio',
                                        icon: 'images-outline',
                                        action: () => navigation.navigate('StoreAdmin', { open: 'banner' })
                                    },
                                    locationShipping: {
                                        label: 'Configura método de entrega',
                                        icon: 'car-outline',
                                        action: () => navigation.navigate('ShippingsAdmin', { storeId })
                                    },
                                    payMethods: {
                                        label: 'Establece métodos de pago',
                                        icon: 'card-outline',
                                        action: () => navigation.navigate('StorePaymentsAdmin', { storeId })
                                    },
                                    categoriesCreated: {
                                        label: 'Crea tus categorías',
                                        icon: 'pricetags-outline',
                                        action: () => navigation.navigate('create-Category', { storeId })
                                    },
                                    firstPostCreated: {
                                        label: 'Publica tu primer contenido',
                                        icon: 'newspaper-outline',
                                        action: () => navigation.navigate('create-post', { storeId })
                                    },
                                    firstProductCreated: {
                                        label: 'Agrega tu primer producto',
                                        icon: 'cube-outline',
                                        action: () => navigation.navigate('FormProduct', { storeId })
                                    }
                                }[key];

                                return (
                                    <TouchableOpacity
                                        key={key}
                                        onPress={taskConfig.action}
                                        style={tw`flex-row items-center justify-between mb-3 p-3 bg-blue-800/20 rounded-xl border border-blue-500/30`}
                                        activeOpacity={0.7}
                                    >
                                        <View style={tw`flex-row items-center flex-1`}>
                                            <Ionicons
                                                name={taskConfig.icon}
                                                size={20}
                                                style={tw`mr-3 text-blue-300`}
                                            />
                                            <Text style={tw`text-white text-base flex-1`}>{taskConfig.label}</Text>
                                        </View>

                                        <View style={tw`bg-yellow-400/90 px-3 py-1.5 rounded-lg flex-row items-center`}>
                                            <Text style={tw`text-blue-900 text-sm font-bold`}>Completar</Text>
                                            <Ionicons name="arrow-forward" size={14} style={tw`ml-1 text-blue-900`} />
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                    </View>
                )}


                <View style={tw`flex-row flex-wrap justify-between`}>
                    {buttons.map((btn, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => handlePress(btn.screen)}
                            style={tw`w-[48%] p-5 mb-4 rounded-2xl items-center shadow-lg border border-gray-800`}
                        >
                            <View style={tw`bg-gray-800 p-3 rounded-full mb-3`}>
                                <Ionicons name={btn.icon} size={24} color="#FFFFFF" />
                            </View>
                            <Text style={tw`text-base text-gray-200 font-light text-center tracking-wide`}>
                                {btn.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={tw`flex flex-row justify-between mb-6`}>
                    <View style={tw`w-28 p-4 bg-white rounded-xl border border-gray-50 items-center`}>
                        <Ionicons name="eye-outline" size={24} style={tw`text-blue-500 mb-2`} />
                        <Text style={tw`text-gray-500 text-xs font-medium`}>Visitas</Text>
                        <Text style={tw`text-xl font-bold text-gray-800 mt-1`}>{stats.total_visits}</Text>
                    </View>

                    <View style={tw`w-28 p-4 bg-white rounded-xl border border-gray-50 items-center`}>
                        <Ionicons name="star-outline" size={24} style={tw`text-yellow-500 mb-2`} />
                        <Text style={tw`text-gray-500 text-xs font-medium`}>Rating</Text>
                        <Text style={tw`text-xl font-bold text-gray-800 mt-1`}>{stats.average_rating}</Text>
                    </View>

                    <View style={tw`w-28 p-4 bg-white rounded-xl border border-gray-50 items-center`}>
                        <Ionicons name="people-outline" size={24} style={tw`text-purple-500 mb-2`} />
                        <Text style={tw`text-gray-500 text-xs font-medium`}>Seguidores</Text>
                        <Text style={tw`text-xl font-bold text-gray-800 mt-1`}>{stats.followers_count}</Text>
                    </View>
                </View>

                {/* <TouchableOpacity
                    onPress={async () => {
                        await AsyncStorage.removeItem('storeSetupChecklist');
                        Alert.alert('Checklist reiniciado');
                    }}
                    style={tw`bg-red-600 px-4 py-2 rounded-lg mt-4`}
                >
                    <Text style={tw`text-white font-semibold`}>🗑 Reiniciar Checklist</Text>
                </TouchableOpacity> */}
            </ScrollView>
        </View>

    );
};

export default PanelStore;