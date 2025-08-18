import React, { useEffect, useRef, useState } from 'react';

import { View, Text, Image, Linking, TouchableOpacity, Modal, FlatList, Pressable } from 'react-native';
import tw from 'twrnc';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useStoreDetail } from '../../api/store/useStores';
import { COLORS } from '../../../theme';
import DescripcionExpandible from '../../reusable_components/DescripcionExpandibleProps';
import TabsSection from './componentes/TabsSection';
import ReusableModal from '../../reusable_components/ReusableModal';
import ReviewsList from './componentes/ReviewsList';
import { formatTime12h } from '../../api/reusable_funciones';
import { useFollowStore } from '../../api/user/useFollowStore';
import { useNavigation } from '@react-navigation/native';
import FullScreenLoader from '../../reusable_components/FullScreenLoader';
import { generateLeafletHTML } from '../../reusable_components/generateLeafletHTML';
import StoreDetailsShippingAndPayment from './componentes/StoreDetailsShippingAndPayment';
import { useLocation } from '../../utils/contexts/LocationContext';
import { API_BASE_URL, DEFAULT_BANNER_BASE64, DEFAULT_LOGO_BASE64 } from '../../constants';
import StoreIntro from './componentes/Intro';
import MapModal from '../../reusable_components/MapModal';

const StoreDetailScreen = ({ route }) => {
    const { slug } = route.params;
    const { location } = useLocation();
    const { data: store, isLoading, error } = useStoreDetail(slug);

    const [showIntro, setShowIntro] = useState(true);
    const introRef = useRef<StoreIntroRef>(null);

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [showFullSchedule, setShowFullSchedule] = React.useState(false);

    const storeId = store?.id;
    const { isFollowed, toggleFollow, isAuthenticated, loading } = useFollowStore(storeId);
    const navigation = useNavigation();
    const [modalVisibleM, setModalVisibleM] = useState(false);

    const dayTranslation = {
        Monday: 'Lunes',
        Tuesday: 'Martes',
        Wednesday: 'Miércoles',
        Thursday: 'Jueves',
        Friday: 'Viernes',
        Saturday: 'Sábado',
        Sunday: 'Domingo',
    };
    const [followersCount, setFollowersCount] = useState(store?.followers_count ?? 0);


    useEffect(() => {
        if (showIntro) {
            const timeout = setTimeout(() => {
                // Iniciamos la animación de salida
                if (introRef.current) {
                    introRef.current.startExitAnimation();
                }
            }, 2500); // 2.5 segundos

            return () => clearTimeout(timeout);
        }
    }, [showIntro]);

    const handleAnimationComplete = () => {
        setShowIntro(false);
    };


    useEffect(() => {
        if (store?.followers_count != null) {
            setFollowersCount(store.followers_count);
        }
    }, [store?.followers_count]);


    const openModalMap = () => setModalVisibleM(true);
    const closeModalMap = () => setModalVisibleM(false);

    const openImage = (uri) => {
        const fullUri = `${API_BASE_URL}${uri}`;
        setSelectedImage(fullUri);
        setModalVisible(true);
    };

    if (isLoading) return <FullScreenLoader />;

    if (error || !store) return <Text style={tw`text-red-500`}>Error cargando la tienda</Text>;

    const handleOpenFilters = () => {
        setShowModal(true);
    };
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating - fullStars >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <Ionicons key={`full-${i}`} name="star" size={18} color="#FFD700" />
            );
        }
        if (hasHalfStar) {
            stars.push(
                <Ionicons key="half" name="star-half" size={18} color="#FFD700" />
            );
        }
        while (stars.length < 5) {
            stars.push(
                <Ionicons key={`empty-${stars.length}`} name="star-outline" size={18} color="#FFD700" />
            );
        }
        return stars;
    };

    if (loading) return null; // o un Spinner

    if (showIntro) {
        return (
            <StoreIntro
                ref={introRef}
                banner={store?.banner}
                logo={store?.logo}
                storeName={store?.name}
                onAnimationComplete={handleAnimationComplete}
            />
        );
    }

    const handlePress = () => {
        if (!isAuthenticated) {
            navigation.navigate('Perfil', { screen: 'Login' });
            return;
        }

        if (isFollowed) {
            setFollowersCount(prev => Math.max(prev - 1, 0));
        } else {
            setFollowersCount(prev => prev + 1);
        }

        toggleFollow();
    };

    const html = generateLeafletHTML({
        store: {
            name: store.name,
            latitude: store.latitude,
            longitude: store.longitude,
            logo: store.logo ? `${store.logo}` : undefined, // asegúrate de anteponer tu dominio
        },
        userLocation: location,
        showRoute: true,
    });

    const renderHeader = () => (
        <View style={tw``}>
            {/* Banner con botón en la esquina superior derecha */}
            <View style={[tw`relative`, { height: 200 }]}>
                <TouchableOpacity onPress={() => openImage(store.banner)} activeOpacity={0.85}>
                    <Image
                        source={{
                            uri: store.banner ? `${store.banner}` : DEFAULT_BANNER_BASE64
                        }}

                        style={{ width: '100%', height: '84%' }}
                        resizeMode="cover"
                    />
                </TouchableOpacity>

                {/* Aquí se mostrará el componente con íconos */}
                <StoreDetailsShippingAndPayment
                    storeId={store.id}
                    isAuthenticated={isAuthenticated}
                />
                {/* Botón movido al banner, esquina superior derecha */}
                <TouchableOpacity
                    onPress={handleOpenFilters}
                    style={[
                        tw`absolute top-3 right-3 p-2 rounded-full`,
                        {
                            backgroundColor: 'rgba(0,0,0,0.4)', // Fondo semitransparente negr
                        },
                    ]}
                    activeOpacity={0.85}
                >
                    <Ionicons name="ellipsis-vertical" size={23} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Logo + Nombre + Categoría flotantes */}
            <View style={tw`flex-row px-6 -mt-26 items-center justify-between`}>
                {/* Logo + categoría + nombre */}
                <View style={tw`flex-row items-center flex-1 mr-2`}>
                    {/* Logo circular con botón sobrepuesto */}
                    <View style={tw`relative w-20 h-20`}>
                        <TouchableOpacity onPress={() => openImage(store.logo)} activeOpacity={0.85}>
                            <Image
                                source={{
                                    uri: store.logo ? `${store.logo}` : DEFAULT_LOGO_BASE64
                                }}
                                style={tw`w-20 h-20 rounded-full border-2`}
                            />
                        </TouchableOpacity>

                    </View>

                    {/* Nombre y categoría */}
                    <View style={tw`ml-4 mt-10 flex-1`}>
                        <View style={tw`flex-row items-center mt-1 flex-wrap`}>
                            <Text
                                style={tw`text-white text-xl font-bold flex-shrink`}
                                numberOfLines={2}
                                ellipsizeMode="tail"
                            >
                                {store.name}
                            </Text>
                            {store.is_verified && (
                                <Ionicons
                                    name="checkmark-circle"
                                    size={16}
                                    color={COLORS.BlueSkyWord}
                                    style={tw`ml-1`}
                                />
                            )}
                        </View>
                    </View>
                </View>

                {/* Botón SEGUIR al lado derecho */}
                <TouchableOpacity
                    onPress={handlePress}
                    style={tw`bg-white px-4 py-1.5 rounded-full`}
                    activeOpacity={0.85}
                >
                    <Text style={tw`text-black font-semibold`}>
                        {!isAuthenticated ? 'Iniciar sesión' : isFollowed ? 'Dejar de Seguir' : 'Seguir'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Info debajo */}
            <View style={tw`px-4`}>
                {/* 🟢 Tarjeta de estado con botones */}
                <View style={tw`rounded-3xl px-5 py-6`}>
                    {/* 🧭 Sección de íconos en fila */}
                    <View style={tw``}>
                        {/* 🔘 Íconos principales en fila */}
                        <View style={tw`flex-row justify-around`}>
                            {/* 📍 Ubicación */}
                            {store?.latitude && (
                                <TouchableOpacity onPress={openModalMap} style={tw`items-center`}>
                                    <Ionicons name="compass" size={40} style={tw`text-white`} />
                                    <Text style={tw`text-white text-xs mt-1 font-medium`}>Ubicarme</Text>
                                </TouchableOpacity>
                            )}
                            {/* 👥 Seguidores */}
                            <View style={tw`items-center`}>
                                <Ionicons name="people" size={50} style={tw`text-white`} />
                                <Text style={tw`text-white text-xs font-semibold`}>{followersCount} Seguidores</Text>
                            </View>

                            {/* 🕒 Estado */}
                            <TouchableOpacity onPress={() => setShowFullSchedule(!showFullSchedule)} style={tw`items-center`}>
                                <Ionicons
                                    name="radio-button-on"
                                    size={40}
                                    style={tw`${store.is_open ? 'text-[#24eb00]' : 'text-red-500'}`}
                                />
                                <Text style={tw`text-white text-xs mt-1 font-medium`}>
                                    {store.is_open ? 'Abierto' : 'Cerrado'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={tw`mt-2`}>
                            {/* 🕑 Horario de hoy */}
                            {store.today_schedule && (
                                <Text style={tw`text-center text-gray-300 text-xs mt-3`}>
                                    Hoy: {formatTime12h(store.today_schedule.open_time)} - {formatTime12h(store.today_schedule.close_time)}
                                </Text>
                            )}

                            {/* 🗺️ Dirección completa */}
                            {(store?.neighborhood_name || store?.city_name || store?.address) && (
                                <Text style={tw`text-center text-gray-400 text-sm mt-1`}>
                                    {`${store?.neighborhood_name ?? ''}, ${store?.city_name ?? ''}, ${store?.address ?? ''}`}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* 🔽 Desplegable de horario semanal */}
                    {showFullSchedule && (
                        <View style={tw`mt-4 bg-gray-800/30 rounded-xl p-3`}>
                            <Text style={tw`text-white font-medium mb-2 text-center`}>Horario semanal</Text>
                            {store.schedules.map(({ id, day_display, open_time, close_time }) => (
                                <View
                                    key={id}
                                    style={tw`flex-row justify-between py-2 border-b border-gray-700/50 last:border-0`}
                                >
                                    <Text style={tw`text-gray-300 capitalize`}>
                                        {dayTranslation[day_display] || day_display}
                                    </Text>
                                    <Text style={tw`text-gray-300`}>
                                        {formatTime12h(open_time)} - {formatTime12h(close_time)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* 🔒 Modal con mapa */}
                <MapModal
                    visible={modalVisibleM}
                    html={html}
                    onClose={closeModalMap}
                />

                {/* ⭐ Modal con reviews */}
                <ReusableModal visible={showModal} onClose={() => setShowModal(false)} hasFlatList={true}>
                    <View style={tw`flex-row items-center flex-wrap mb-2`}>
                        <Text style={tw`text-white text-xl font-bold mr-2`} numberOfLines={1}>
                            {store.name}
                        </Text>
                        <View style={tw`flex-row items-center`}>
                            {renderStars(store.average_rating)}
                            <Text style={tw`ml-1 text-gray-300 text-sm`}>
                                {store.average_rating.toFixed(1)}
                            </Text>
                        </View>
                        <DescripcionExpandible description={store.description} />
                    </View>
                    <ReviewsList storeId={store?.id} />
                </ReusableModal>
            </View>

        </View>
    )

    return (
        <>
            <FlatList
                ListHeaderComponent={renderHeader}
                ListFooterComponent={<TabsSection storeId={store?.id} />}
                data={[]}
                keyExtractor={() => 'header'}
            />
            <Modal visible={modalVisible} transparent={true}>
                <View style={tw`flex-1 bg-black/90 justify-center items-center`}>
                    <TouchableOpacity style={tw`absolute top-5 right-5`} onPress={() => setModalVisible(false)}>
                        <Ionicons name="close" size={32} color="white" />
                    </TouchableOpacity>
                    <Image
                        source={{ uri: selectedImage }}
                        style={tw`w-full h-[80%]`}
                        resizeMode="contain"
                    />
                </View>
            </Modal>
        </>
    );
};
export default StoreDetailScreen;
