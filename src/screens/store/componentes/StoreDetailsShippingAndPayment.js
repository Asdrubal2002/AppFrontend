import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import { useShippingMethodsFromUserLocation, useStorePaymentMethods } from '../../../api/store/useStores';
import { COLORS } from '../../../../theme';
import ReusableModal from '../../../reusable_components/ReusableModal';

const StoreDetailsShippingAndPayment = ({ storeId, isAuthenticated }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState(null);

    const { data: shippingMethods, isLoading: loadingShipping } = useShippingMethodsFromUserLocation(storeId);
    const {
        data: paymentMethods,
        isLoading: loadingPayment,
        isFetched: paymentFetched,
        refetch: refetchPayments,
    } = useStorePaymentMethods(storeId, modalType === 'payment');

    const hasShipping = !loadingShipping && shippingMethods?.length > 0;

    const openModal = (type) => {
        setModalType(type);
        setModalVisible(true);
        if (type === 'payment' && !paymentFetched) {
            refetchPayments();
        }
    };

    const closeModal = () => {
        setModalVisible(false);
        setModalType(null);
    };

    return (
        <>
            <View style={tw`absolute top-3 right-14 flex-row gap-3`}>
                <TouchableOpacity
                    onPress={() => openModal('shipping')}
                    style={[
                        tw`p-2 rounded-full`,
                        { backgroundColor: 'rgba(0,0,0,0.4)' },
                    ]}
                    activeOpacity={0.85}
                >
                    <Ionicons
                        name="paper-plane"
                        size={23}
                        color={hasShipping ? '#fff' : '#777'} // más oscuro cuando inactivo
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => openModal('payment')}
                    style={[
                        tw`p-2 rounded-full`,
                        { backgroundColor: 'rgba(0,0,0,0.4)' },
                    ]}
                    activeOpacity={0.85}
                >
                    <Ionicons
                        name="card-outline"
                        size={23}
                        color={'#FFF'}
                    />
                </TouchableOpacity>

            </View>

            <ReusableModal visible={modalVisible} onClose={closeModal}>
                <Text style={tw`text-lg font-bold mb-4 text-white`}>
                    {modalType === 'shipping' ? 'Métodos de Envío' : 'Métodos de Pago'}
                </Text>

                {isAuthenticated ? (
                    <>
                        {modalType === 'shipping' && (
                            loadingShipping ? (
                                <ActivityIndicator color="#FFF" />
                            ) : shippingMethods?.length > 0 ? (
                                shippingMethods.map((method, idx) => (
                                    <View key={idx} style={tw`mb-5 p-4 rounded-2xl bg-gray-800/60 shadow-md`}>
                                        <Text style={tw`text-white text-lg font-semibold mb-2`}>
                                            {method.zone_name}
                                        </Text>

                                        {method.description && (
                                            <View style={tw`flex-row items-start mb-3`}>
                                                <Ionicons
                                                    name="document-text-outline"
                                                    size={18}
                                                    color="#D1D5DB"
                                                    style={tw`mr-2 mt-0.5`}
                                                />
                                                <Text style={tw`text-gray-300 text-sm leading-5`}>
                                                    {method.description}
                                                </Text>
                                            </View>
                                        )}

                                        <View style={tw`flex-row justify-between`}>
                                            {/* Zona */}


                                            {/* Costo */}
                                            <View style={tw`flex-row items-center mx-10`}>
                                                <Ionicons
                                                    name="cash-outline"
                                                    size={17}
                                                    color="#34D399"
                                                    style={tw`mr-1`}
                                                />
                                                <Text style={tw`text-gray-300 text-sm`}>
                                                    ${method.cost?.toLocaleString()}
                                                </Text>
                                            </View>

                                            {/* Tiempo */}
                                            <View style={tw`flex-row items-center mx-10`}>
                                                <Ionicons
                                                    name="time-outline"
                                                    size={17}
                                                    color="#F87171"
                                                    style={tw`mr-1`}
                                                />
                                                <Text style={tw`text-gray-300 text-sm`}>
                                                    {method.days} días
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                ))
                            ) : (
                                <Text style={tw`text-gray-400 text-sm`}>
                                    No hay métodos de envío disponibles.
                                </Text>
                            )
                        )}

                        {modalType === 'payment' && (
                            loadingPayment ? (
                                <ActivityIndicator color="#FFF" />
                            ) : paymentMethods?.length > 0 ? (
                                paymentMethods.map((method, idx) => (
                                    <View key={idx} style={tw`mb-5 p-4 rounded-2xl bg-gray-800/60 shadow-md`}>
                                        {/* Título del método */}
                                        <View style={tw`flex-row items-center mb-2`}>
                                            <Ionicons
                                                name="card-outline"
                                                size={20}
                                                color="#FCD34D"
                                                style={tw`mr-2`}
                                            />
                                            <Text style={tw`text-white text-lg font-semibold`}>
                                                {method.name}
                                            </Text>
                                        </View>

                                        {/* Descripción del método */}
                                        {method.description && (
                                            <View style={tw`flex-row items-start`}>
                                                <Ionicons
                                                    name="document-text-outline"
                                                    size={18}
                                                    color="#D1D5DB"
                                                    style={tw`mr-2 mt-0.5`}
                                                />
                                                <Text style={tw`text-gray-300 text-sm leading-5`}>
                                                    {method.description}
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                ))
                            ) : (
                                <Text style={tw`text-gray-400 text-sm`}>
                                    No hay métodos de pago disponibles.
                                </Text>
                            )
                        )}

                    </>
                ) : (
                    <Text style={tw`text-red-400 text-sm mt-2`}>
                        Debes estar autenticado para ver esta información.
                    </Text>
                )}
            </ReusableModal>
        </>
    );
};

export default StoreDetailsShippingAndPayment;
