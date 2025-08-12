import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useFetchStoreAdmins, useAddStoreAdmin, useRemoveStoreAdmin } from '../../api/store/useStores';
import { useRoute } from '@react-navigation/native';
import tw from 'twrnc';
import Ionicons from 'react-native-vector-icons/Ionicons'
import HeaderBar from '../../reusable_components/HeaderBar';
import AuthInput from '../../reusable_components/AuthInput';
import AuthButton from '../../reusable_components/AuthButton';
import BackgroundIcon from '../../reusable_components/BackgroundIcon';


const StoreAdminsManager = () => {
    const route = useRoute();
    const storeId = route.params?.storeId;

    const [username, setUsername] = useState('');
    const [documentNumber, setDocumentNumber] = useState('');
    const {
        data: admins,
        isLoading,
        isError,
        error,
        refetch,
    } = useFetchStoreAdmins({ storeId })
    const addAdmin = useAddStoreAdmin();
    const removeAdmin = useRemoveStoreAdmin();

    const handleAdd = async () => {
        try {
            await addAdmin.mutateAsync({ storeId, adminData: { username, document_number: documentNumber } });
            Alert.alert('Éxito', 'Administrador añadido');
            setUsername('');
            setDocumentNumber('');
            refetch();
        } catch (error) {
            Alert.alert('Error', error?.response?.data?.error || 'Error al añadir administrador');
        }
    };

    const handleRemove = (userToRemove) => {
        Alert.alert(
            'Confirmar eliminación',
            `¿Estás seguro de que quieres eliminar a ${userToRemove.name} (${userToRemove.username}) como administrador?`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await removeAdmin.mutateAsync({
                                storeId,
                                adminData: {
                                    username: userToRemove.username,
                                    document_number: userToRemove.document_number,
                                },
                            });
                            Alert.alert('Éxito', 'Administrador eliminado');
                            refetch();
                        } catch (error) {
                            Alert.alert('Error', error?.response?.data?.error || 'Error al eliminar administrador');
                        }
                    },
                },
            ]
        );
    };


    return (
        <View style={tw`flex-1`}>
            <HeaderBar title="Administración" />
           
            <BackgroundIcon name="people-circle-outline" />

            
            {isLoading ? (
                <Text style={tw`text-gray-500`}>Cargando...</Text>
            ) : isError ? (
                <View style={tw`m-5 bg-gray-800/50 rounded-xl p-8 items-center`}>
                    <Ionicons name="people-outline" size={48} color="#4B5563" />
                    <Text style={tw`text-gray-400 text-lg mt-4 font-medium`}>
                        {error?.response?.data?.error || 'Error al cargar administradores.'}
                    </Text>
                </View>



            ) : (
                <FlatList
                    ListHeaderComponent={
                        <View style={tw`px-5 pt-6 pb-6`}>
                            {/* Sección de información */}
                            <View style={tw`mb-4`}>
                                <Text style={tw`font-bold text-gray-200 text-xl`}>
                                    ¿Deseas añadir un nuevo colaborador?
                                </Text>
                                <Text style={tw`mt-2 text-gray-400 font-light`}>
                                    Pídele su nombre de usuario y número de identificación para poder agregarlo.
                                </Text>

                            </View>

                            {/* Formulario */}
                            <View style={tw`bg-gray-800/50 rounded-xl p-5 mb-4`}>
                                <AuthInput
                                    placeholder="Nombre de usuario"
                                    value={username}
                                    onChangeText={setUsername}
                                />

                                <AuthInput
                                    placeholder="Número de documento"
                                    value={documentNumber}
                                    onChangeText={setDocumentNumber}
                                />

                                <AuthButton
                                    title="Añadir colaborador"
                                    icon={<Ionicons name="person-add-outline" size={20} color="#fff" />}
                                    onPress={handleAdd}
                                />
                            </View>

                            {/* Título de la lista */}
                            <Text style={tw`text-lg font-bold text-gray-100 mt-2`}>
                                Administradores actuales
                            </Text>
                        </View>
                    }
                    data={admins}
                    keyExtractor={(item) => item.username}
                    renderItem={({ item }) => (
                        <View style={tw`bg-gray-800/80 mx-5 mb-3 rounded-xl p-5 shadow-lg`}>
                            <View style={tw`flex-row justify-between items-start`}>
                                <View>
                                    <Text style={tw`text-lg font-bold text-white`}>
                                        {item.name} {item.last_name}
                                    </Text>
                                    <Text style={tw`text-sm text-gray-400 mb-2`}>@{item.username}</Text>
                                </View>

                                <TouchableOpacity
                                    style={tw`p-2 rounded-full bg-red-500/10`}
                                    onPress={() => handleRemove(item)}
                                >
                                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                                </TouchableOpacity>
                            </View>

                            <View style={tw`flex-row items-center mt-3`}>
                                <Ionicons name="mail-outline" size={16} color="#9CA3AF" />
                                <Text style={tw`text-sm text-gray-300 ml-2`}>{item.email}</Text>
                            </View>

                            <View style={tw`flex-row items-center mt-2`}>
                                <Ionicons name="phone-portrait-outline" size={16} color="#9CA3AF" />
                                <Text style={tw`text-sm text-gray-300 ml-2`}>{item.cellphone}</Text>
                            </View>
                        </View>
                    )}
                    contentContainerStyle={tw`pb-10`}
                    ListEmptyComponent={
                        <View style={tw`mx-5 bg-gray-800/50 rounded-xl p-8 items-center`}>
                            <Ionicons name="people-outline" size={48} color="#4B5563" />
                            <Text style={tw`text-gray-400 text-lg mt-4 font-medium`}>
                                No hay administradores registrados
                            </Text>
                            <Text style={tw`text-gray-500 text-sm mt-1 text-center`}>
                                Utiliza el formulario superior para agregar nuevos colaboradores
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

export default StoreAdminsManager;
