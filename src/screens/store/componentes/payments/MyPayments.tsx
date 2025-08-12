import { useRoute } from "@react-navigation/native";
import { Alert, FlatList, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useCreatePaymentMethod, useDeletePaymentMethod, useGetPaymentMethods } from "../../../../api/store/useStores";
import tw from 'twrnc';
import HeaderBar from "../../../../reusable_components/HeaderBar";
import { API_BASE_URL } from "../../../../constants";
import ReusableModal from "../../../../reusable_components/ReusableModal";
import { useState } from "react";
import BackgroundIcon from "../../../../reusable_components/BackgroundIcon";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import AuthInput from "../../../../reusable_components/AuthInput";
import AuthButton from "../../../../reusable_components/AuthButton";
import FullScreenLoader from "../../../../reusable_components/FullScreenLoader";


const MyPayments = () => {

    const route = useRoute();
    const storeId = route.params?.storeId;

    const { data, isLoading, error } = useGetPaymentMethods(storeId);
    const [isModalVisible, setModalVisible] = useState(false);
    const deletePaymentMethod = useDeletePaymentMethod(storeId);

    const closeModal = () => {
        setModalVisible(false);
    };

    const [name, setName] = useState('');
    const [accountName, setAccountName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [paymentLink, setPaymentLink] = useState('');
    const [qrCode, setQrCode] = useState<any>(null);

    const createPaymentMethod = useCreatePaymentMethod();

    const handleSelectQR = () => {
        launchImageLibrary({ mediaType: 'photo' }, (response) => {
            if (response.assets && response.assets.length > 0) {
                const image = response.assets[0];
                setQrCode({
                    uri: image.uri,
                    type: image.type,
                    name: image.fileName,
                });
            }
        });
    };

    const handleSubmit = () => {
        // Validaciones
        if (!name.trim()) {
            Alert.alert('Error', 'El nombre del método de pago es obligatorio');
            return;
        }
        if (name.trim().length < 3) {
            Alert.alert('Error', 'El nombre debe tener al menos 3 caracteres');
            return;
        }
        if (name.trim().length > 50) {
            Alert.alert('Error', 'El nombre no puede superar los 50 caracteres');
            return;
        }

        if (!accountName.trim()) {
            Alert.alert('Error', 'El nombre del titular es obligatorio');
            return;
        }
        if (accountName.trim().length < 3) {
            Alert.alert('Error', 'El nombre del titular debe tener al menos 3 caracteres');
            return;
        }
        if (accountName.trim().length > 50) {
            Alert.alert('Error', 'El nombre del titular no puede superar los 50 caracteres');
            return;
        }

        if (!accountNumber.trim()) {
            Alert.alert('Error', 'El número o código de cuenta es obligatorio');
            return;
        }
        if (accountNumber.trim().length < 5) {
            Alert.alert('Error', 'El número o código debe tener al menos 5 caracteres');
            return;
        }
        if (accountNumber.trim().length > 30) {
            Alert.alert('Error', 'El número o código no puede superar los 30 caracteres');
            return;
        }

        // Validar formato de URL si se envía un link de pago
        if (paymentLink) {
            if (!/^https?:\/\/[^\s$.?#].[^\s]*$/.test(paymentLink)) {
                Alert.alert('Error', 'El link de pago no es válido');
                return;
            }
            if (paymentLink.length > 200) {
                Alert.alert('Error', 'El link de pago no puede superar los 200 caracteres');
                return;
            }
        }

        // Si todo pasa, enviar
        createPaymentMethod.mutate(
            {
                store: storeId,
                name,
                account_name: accountName,
                account_number: accountNumber,
                payment_link: paymentLink,
                qr_code: qrCode,
            },
            {
                onSuccess: () => {
                    closeModal();
                    // Limpiar formulario
                    setName('');
                    setAccountName('');
                    setAccountNumber('');
                    setPaymentLink('');
                    setQrCode(null);
                },
            }
        );
    };



    if (isLoading) return <FullScreenLoader />;
    if (error) return <Text>Error al cargar</Text>;
    return (
        <View style={tw`flex-1`}>
            <HeaderBar title="Mis métodos de pago" />

            <BackgroundIcon name="cash" />
            <View style={tw`p-5`} >
                <View style={tw.style('w-full p-5 rounded-2xl shadow-lg border border-gray-800')}>
                    <TouchableOpacity style={tw`items-center`} onPress={() => setModalVisible(true)}>
                        <View style={tw`bg-gray-800 p-3 rounded-full mb-3`}>
                            <Ionicons name="wallet-outline" size={24} color="#FFFFFF" />
                        </View>
                        <Text style={tw`text-base text-gray-200 font-light text-center tracking-wide`}>
                            Añadir mis métodos de pago
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text style={tw`text-xl text-gray-100 mt-6 mb-2`}>Métodos de pago</Text>

                <FlatList
                    data={data}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={tw`p-4`}
                    renderItem={({ item }) => (
                        <View style={tw`mb-4 p-4 bg-gray-800 rounded-lg shadow relative`}>
                            {/* Ícono de eliminar */}
                            <TouchableOpacity
                                onPress={() =>
                                    Alert.alert(
                                        'Eliminar',
                                        '¿Estás seguro de eliminar este método de pago?',
                                        [
                                            { text: 'Cancelar', style: 'cancel' },
                                            {
                                                text: 'Eliminar',
                                                onPress: () => deletePaymentMethod.mutate(item.id),
                                                style: 'destructive',
                                            },
                                        ]
                                    )
                                }
                                style={tw`absolute top-6 right-6`}
                            >
                                <Ionicons name="trash-outline" size={22} color="#ef4444" />
                            </TouchableOpacity>

                            <Text style={tw`text-lg font-bold mb-1 text-white`}>{item.name}</Text>
                            <Text style={tw`text-sm text-white`}>Titular: {item.account_name || 'No especificado'}</Text>
                            <Text style={tw`text-sm text-white`}>Número/Código: {item.account_number || 'No especificado'}</Text>
                            <Text style={tw`text-sm text-white`}>Link de pago: {item.payment_link || 'N/A'}</Text>
                            <Text style={tw`text-sm text-white`}>Activo: {item.is_active ? 'Sí' : 'No'}</Text>
                            <Text style={tw`text-sm text-white`}>Creado: {new Date(item.created_at).toLocaleString()}</Text>

                            {item.qr_code && (
                                <Image
                                    source={{ uri: `${API_BASE_URL}${item.qr_code}` }}
                                    style={tw`w-24 h-24 mt-2 rounded`}
                                    resizeMode="contain"
                                />
                            )}
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={tw``}>
                            <Text style={tw`text-gray-400 text-base`}>
                                No hay métodos de pago registrados.
                            </Text>
                        </View>
                    }
                />
            </View>

            <ReusableModal visible={isModalVisible} onClose={closeModal}>
                <View>
                    <Text style={tw`text-white text-xl font-bold mb-4`}>Nuevo método de pago</Text>

                    <AuthInput
                        label="Nombre del método"
                        placeholder="Ej: Nequi, Bancolombia, Oxxo"
                        value={name}
                        onChangeText={setName}
                    />

                    <AuthInput
                        label="Titular de la cuenta"
                        placeholder="Nombre de la persona"
                        value={accountName}
                        onChangeText={setAccountName}
                    />

                    <AuthInput
                        label="Número/Código de cuenta"
                        placeholder="Numero de la cuenta"
                        value={accountNumber}
                        onChangeText={setAccountNumber}
                        keyboardType="numeric"
                    />

                    <AuthInput
                        label="Link de pago (opcional)"
                        placeholder="Link de la pasarela"
                        value={paymentLink}
                        onChangeText={setPaymentLink}
                    />

                    <TouchableOpacity onPress={handleSelectQR} style={tw`bg-gray-800 px-4 py-2 mb-4 rounded-md items-center justify-center`}>
                        <Text style={tw`text-white text-center`}>
                            {qrCode ? 'QR seleccionado ✅' : 'Seleccionar código QR'}
                        </Text>
                    </TouchableOpacity>

                    <AuthButton
                        title="Crear Método"
                        onPress={handleSubmit}
                    />
                </View>

            </ReusableModal>

        </View>
    )
}
export default MyPayments;
