import { useRoute } from "@react-navigation/native";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import tw from 'twrnc';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useCoupons, useCreateCoupon, useDeleteCoupons } from "../../../../api/store/useStores";
import { useState } from "react";
import ReusableModal from "../../../../reusable_components/ReusableModal";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import AuthButton from "../../../../reusable_components/AuthButton";
import HeaderBar from "../../../../reusable_components/HeaderBar";
import AuthInput from "../../../../reusable_components/AuthInput";
import BackgroundIcon from "../../../../reusable_components/BackgroundIcon";

const MyCoupons = () => {
    const route = useRoute();
    const storeId = route.params?.storeId;

    const { data: coupons, isLoading } = useCoupons(storeId);
    const { mutate: deleteCoupon } = useDeleteCoupons(storeId);

    const { mutate } = useCreateCoupon(() => {
        // Solo se ejecuta si fue exitoso
        setCode('');
        setDiscountType('');
        setValue('');
        setUsageLimit('');
        setValidFrom(new Date());
        setValidTo(new Date());
        setIsActive(true);
        setModalVisible(false);
        Alert.alert('Éxito', 'El cupón fue creado correctamente');
    });


    const [isModalVisible, setModalVisible] = useState(false);


    const [code, setCode] = useState('');
    const [discountType, setDiscountType] = useState('percentage');
    const [value, setValue] = useState('');
    const [usageLimit, setUsageLimit] = useState('');
    const [validFrom, setValidFrom] = useState(new Date());
    const [validTo, setValidTo] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [isActive, setIsActive] = useState(true);

    const handleCreate = () => {
        if (code.length > 15) {
            Alert.alert('Código muy largo', 'El código no debe superar los 15 caracteres.');
            return;
        }
        if (!['percentage', 'fixed'].includes(discountType)) {
            Alert.alert('Tipo inválido', 'Debes seleccionar un tipo de descuento válido.');
            return;
        }
        if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
            Alert.alert('Valor inválido', 'El valor del descuento debe ser mayor que cero.');
            return;
        }
        if (usageLimit && (isNaN(parseInt(usageLimit)) || parseInt(usageLimit) <= 0)) {
            Alert.alert('Límite de uso inválido', 'El límite de uso debe ser un número positivo.');
            return;
        }
        if (!validFrom || !validTo) {
            Alert.alert('Fechas requeridas', 'Debes seleccionar las fechas de validez.');
            return;
        }
        if (validTo <= validFrom) {
            Alert.alert('Rango de fechas inválido', 'La fecha final debe ser posterior a la inicial.');
            return;
        }

        const payload = {
            store: storeId,
            code: code.toUpperCase().replace(/\s/g, ''), // 👈 Aquí sí lo modificas,
            discount_type: discountType,
            value: parseFloat(value),
            usage_limit: parseInt(usageLimit),
            valid_from: validFrom.toISOString(),
            valid_to: validTo.toISOString(),
            active: isActive,
        };

        console.log('CUPÓN A ENVIAR', payload);
        mutate(payload); // la limpieza ocurre en onSuccess
    };




    const openModal = () => {
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
    };

    return (
        <View style={tw`flex-1`}>
            <HeaderBar title="Mis Cupones" />
            <BackgroundIcon name="receipt" />

            <ScrollView style={tw`flex-1`} contentContainerStyle={tw`p-5`}>
                <TouchableOpacity
                    onPress={() => openModal()}
                    style={tw`p-5 mb-4 rounded-2xl items-center shadow-lg border border-gray-800`}
                >
                    <View style={tw`bg-gray-800 p-3 rounded-full mb-3`}>
                        <Ionicons name="wallet-outline" size={24} color="#FFFFFF" />
                    </View>
                    <Text style={tw`text-base text-gray-200 font-light text-center tracking-wide`}>
                        Agregar Cupón
                    </Text>
                </TouchableOpacity>

                <Text style={tw`text-xl text-gray-100 mt-6 mb-2`}>Cupones</Text>
                {isLoading ? (
                    <Text style={tw`text-gray-400`}>Cargando cupones...</Text>
                ) : coupons?.length === 0 ? (
                    <Text style={tw`text-gray-400`}>No hay cupones registrados aún.</Text>
                ) : (
                    coupons.map((coupon: any, index: number) => {

                        const handleDelete = () => {
                            Alert.alert(
                                'Eliminar zona',
                                `¿Estás seguro de eliminar el cupon "${coupon.code}"?`,
                                [
                                    {
                                        text: 'Cancelar',
                                        style: 'cancel',
                                    },
                                    {
                                        text: 'Eliminar',
                                        onPress: () => deleteCoupon(coupon.id),
                                        style: 'destructive',
                                    },
                                ]
                            );
                        };

                        return (
                            <View
                                key={index}
                                style={tw`bg-gray-900 p-4 rounded-2xl mb-4 border border-gray-700 shadow-md flex-row justify-between items-center`}
                            >
                                <View style={tw`flex-1`}>
                                    {/* Código del cupón */}
                                    <Text style={tw`text-white text-lg font-bold mb-1`}>
                                        código: <Text style={tw`text-yellow-400 text-lg font-bold mb-1`}>{coupon.code}</Text>
                                    </Text>

                                    {/* Tipo y valor del descuento */}
                                    <Text style={tw`text-green-400 text-sm mb-1`}>
                                        Descuento: {coupon.discount_type === 'percentage'
                                            ? `${coupon.value}%`
                                            : `$${parseFloat(coupon.value).toFixed(2)}`}
                                    </Text>

                                    {/* Límite de usos */}
                                    <Text style={tw`text-white text-sm mb-1`}>
                                        Usos disponibles: {coupon.usage_limit - coupon.used_count} / {coupon.usage_limit}
                                    </Text>
                                    <Text style={tw`text-blue-200 text-xs text-center mt-2`}>
                                        {(() => {
                                            const daysLeft = Math.ceil(
                                                (new Date(coupon.valid_to).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                                            );
                                            const startDate = new Date(coupon.valid_from).toLocaleDateString();
                                            const endDate = new Date(coupon.valid_to).toLocaleDateString();

                                            return daysLeft > 0
                                                ? `Cupón válido desde ${startDate} hasta ${endDate} (${daysLeft} día${daysLeft === 1 ? '' : 's'} restantes)`
                                                : `Cupón expiró el ${endDate} (empezó el ${startDate})`;
                                        })()}
                                    </Text>
                                </View>
                                {/* Botón de eliminar */}
                                <TouchableOpacity
                                    onPress={handleDelete}
                                    style={tw`p-2 ml-3 rounded-full bg-gray-800`}
                                >
                                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        );
                    })
                )}
            </ScrollView>

            <ReusableModal visible={isModalVisible} onClose={closeModal}>
                <AuthInput
                    label='¿Cuál será el código del cupón?'
                    placeholder="Ej: DESCUENTO15"
                    value={code}
                    onChangeText={(text) => setCode(text)}

                />
                <Text style={tw`text-white mb-1 font-light`}>Tipo de descuento:</Text>
                <View style={tw`bg-gray-800 rounded-xl mb-4`}>
                    <Picker
                        selectedValue={discountType}
                        onValueChange={(itemValue) => setDiscountType(itemValue)}
                        style={tw`text-white`}
                    >
                        <Picker.Item label="Porcentaje" value="percentage" />
                        <Picker.Item label="Fijo" value="fixed" />
                    </Picker>
                </View>

                <AuthInput
                    label='¿De cuánto será el descuento?'
                    placeholder="Ej: 15 o 25000"
                    value={value}
                    onChangeText={setValue}
                    keyboardType="numeric"
                />


                <AuthInput
                    label='¿Cuántas veces se podrá usar el cupón?'
                    placeholder="Ej: 100"
                    value={usageLimit}
                    onChangeText={setUsageLimit}
                    keyboardType="numeric"
                />


                <Text style={tw`text-white mb-1 font-light`}>Fecha de inicio</Text>


                <TouchableOpacity
                    onPress={() => setShowStartPicker(true)}
                    style={tw`bg-gray-800 rounded-xl px-4 py-3 mb-4`}
                >
                    <Text style={tw`text-gray-100`}>
                        {validFrom.toLocaleDateString()}
                    </Text>
                </TouchableOpacity>

                {showStartPicker && (
                    <DateTimePicker
                        value={validFrom}
                        mode="date"
                        display="default"
                        onChange={(event, date) => {
                            setShowStartPicker(false);
                            if (date) setValidFrom(date);
                        }}
                    />
                )}

                <Text style={tw`text-gray-400`}>Fecha de vencimiento</Text>
                <TouchableOpacity onPress={() => setShowEndPicker(true)} style={tw`bg-gray-800 rounded-xl px-4 py-3 mb-4`}>
                    <Text style={tw`text-white`}>
                        {validTo.toLocaleDateString()}
                    </Text>
                </TouchableOpacity>
                {showEndPicker && (
                    <DateTimePicker
                        value={validTo}
                        mode="date"
                        display="default"
                        onChange={(event, date) => {
                            setShowEndPicker(false);
                            if (date) setValidTo(date);
                        }}
                    />
                )}
                <AuthButton
                    title="Crear Cupón"
                    onPress={handleCreate}
                />

            </ReusableModal>
        </View>
    )

}

export default MyCoupons;