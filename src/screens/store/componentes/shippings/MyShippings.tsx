import { FlatList, Text, RefreshControl, View, Pressable, ScrollView, TouchableOpacity, TextInput, Button, Switch } from "react-native";
import tw from 'twrnc';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRoute } from "@react-navigation/native";
import { COLORS } from "../../../../../theme";
import { useCities, useCountries, useCreateShippingMethod, useCreateShippingMethodZone, useCreateShippingZone, useDeleteShippingMethodZone, useDeleteShippingZone, useNeighborhoods, useShippingMethods, useShippingMethodZones, useShippingZones } from "../../../../api/store/useStores";
import { useState } from "react";
import ReusableModal from "../../../../reusable_components/ReusableModal";
import LocationPicker from "../../../../reusable_components/LocationPicker";
import AuthButton from "../../../../reusable_components/AuthButton";
import { Alert } from 'react-native';
import { Picker } from "@react-native-picker/picker";
import HeaderBar from "../../../../reusable_components/HeaderBar";
import AuthInput from "../../../../reusable_components/AuthInput";
import BackgroundIcon from "../../../../reusable_components/BackgroundIcon";

const MyShippings = () => {
    const route = useRoute();
    const storeId = route.params?.storeId;

    const [isModalVisible, setModalVisible] = useState(false);
    const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);

    const { data: zones, isLoading } = useShippingZones(storeId);
    const { mutate: createZone, isPending } = useCreateShippingZone();
    const { mutate: deleteZone } = useDeleteShippingZone(storeId);
    const { mutate: createMethod, isPending: isCreating } = useCreateShippingMethod(storeId);

    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
    const { data: countriesData, isLoading: isCountriesLoading, refetch: refetchCountries } = useCountries();
    const countries = Array.isArray(countriesData) ? countriesData : [];

    const { data: rawCities } = useCities(selectedCountry);
    const cities = Array.isArray(rawCities) ? rawCities : [];

    const { data: rawNeighborhoods } = useNeighborhoods(selectedCity);
    const neighborhoods = Array.isArray(rawNeighborhoods) ? rawNeighborhoods : [];

    const [selectedZone, setSelectedZone] = useState<number | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<number | null>(null);
    const [customCost, setCustomCost] = useState('');
    const [customDays, setCustomDays] = useState('');

    const {
        methods,
        isLoadingMethods,
        fetchError,
        deleteMethod,
        isDeleting,
    } = useShippingMethods(storeId);

    const openModal = (index: number) => {
        setActiveModalIndex(index);
        setModalVisible(true);

        // Solo cargar países cuando se abre el modal del botón 0
        if (index === 0) {
            refetchCountries();
        }
    };

    const closeModal = () => {
        setModalVisible(false);
        setActiveModalIndex(null);
    };

    const handleCreateZone = () => {
        createZone(
            {
                store: storeId,
                country: selectedCountry,
                city: selectedCity,
                neighborhood: selectedNeighborhood,
            },
            {
                onSuccess: () => {
                    setModalVisible(false);
                    setSelectedCountry('');
                    setSelectedCity('');
                    setSelectedNeighborhood('');
                },
            }
        );
    };

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        base_cost: '',
        estimated_days: '',
        is_active: true
    });

    const handleCreate = () => {
        if (!formData.name) {
            Alert.alert('Error', 'Método es requeridos');
            return;
        }

        if (formData.name.length > 100) {
            Alert.alert('Nombre muy largo', 'El nombre no debe superar los 100 caracteres.');
            return;
        }

        if (formData.description && formData.description.length > 200) {
            Alert.alert('Descripción muy larga', 'La descripción no debe superar los 200 caracteres.');
            return;
        }

        // Eliminar puntos y comas de base_cost
        const cleanBaseCost = formData.base_cost.replace(/[.,]/g, '');

        createMethod(
            {
                ...formData,
                base_cost: parseFloat(cleanBaseCost),
                estimated_days: parseInt(formData.estimated_days),
            },
            {
                onSuccess: () => {
                    setModalVisible(false); // Cerrar modal solo en éxito
                    setFormData({
                        name: '',
                        description: '',
                        base_cost: '',
                        estimated_days: '3',
                        is_active: true,
                    });
                },
            }
        );
    };

    // Nombres específicos para cada hook
    const {
        data: methodZones,
        isLoading: isLoadingMethodZones,
        error: methodZonesError
    } = useShippingMethodZones(storeId);

    const {
        mutate: createMethodZone,
        isPending: isCreatingMethodZone
    } = useCreateShippingMethodZone(storeId);

    const {
        mutate: deleteMethodZone,
        isPending: isDeletingMethodZone
    } = useDeleteShippingMethodZone(storeId);

    const handleDelete = (relationId: number) => {
        Alert.alert(
            'Confirmar',
            '¿Eliminar esta relación?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    onPress: () => deleteMethodZone(relationId),
                    style: 'destructive'
                }
            ]
        );
    };

    if (methodZonesError) return <Text>Error al cargar relaciones</Text>;

    return (
        <View style={tw`flex-1`}>
            <HeaderBar title="Mis métodos de entrega o servicio" />

            <BackgroundIcon name="location" />

            <ScrollView style={tw`flex-1`} contentContainerStyle={tw`p-5`}>
                <Text style={tw`text-gray-200 mb-4 font-light text-base`}>
                    Define cómo entregarás tus productos o servicios: A domicilio, en puntos de recogida, virtual, presencial entre otros. Esto te dará más control y claridad en tus ventas.
                </Text>
                <View style={tw`flex-row flex-wrap justify-between`}>
                    <View
                        style={tw.style(
                            methods?.length === 0 ? 'w-full items-center' : 'w-[48%]',
                            'p-5 mb-4 rounded-2xl shadow-lg border border-gray-800'
                        )}
                    >
                        <TouchableOpacity style={tw`items-center`} onPress={() => openModal(1)}>
                            <View style={tw`bg-gray-800 p-3 rounded-full mb-3`}>
                                <Ionicons name="man-outline" size={24} color="#FFFFFF" />
                            </View>
                            <Text style={tw`text-base text-gray-200 font-light text-center tracking-wide`}>
                                Añadir opciones de entrega, para mis productos y para mis servicios.
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {methods?.length > 0 && (
                        <View style={tw.style('w-[48%] p-5 mb-4 rounded-2xl shadow-lg border border-gray-800')}>
                            <TouchableOpacity style={tw`items-center`} onPress={() => openModal(2)}>
                                <View style={tw`bg-gray-800 p-3 rounded-full mb-3`}>
                                    <Ionicons name="git-merge-outline" size={24} color="#FFFFFF" />
                                </View>
                                <Text style={tw`text-base text-gray-200 font-light text-center tracking-wide`}>
                                    Asignar método de envío a una zona
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <Text style={tw`text-base text-gray-100 mt-6 mb-2`}>Realizas la entrega de tu producto o servicio:</Text>

                {isLoadingMethodZones ? (
                    <Text style={tw`text-gray-400`}>Cargando relaciones...</Text>
                ) : methodZones?.length === 0 ? (
                    <Text style={tw`text-gray-400`}>No hay relaciones registradas aún.</Text>
                ) : (
                    methodZones?.map((relation: any) => {
                        const zone = zones?.find((z) => z.id === relation.zone);

                        let coverageText = 'Cobertura no especificada';
                        if (zone?.neighborhood_name) {
                            coverageText = zone.neighborhood_name;
                        } else if (zone?.city_name) {
                            coverageText = zone.city_name;
                        } else if (zone?.country_name) {
                            coverageText = zone.country_name;
                        }

                        return (
                            <View
                                key={relation.id}
                                style={tw`bg-gray-800 p-4 rounded-xl mb-3 border border-gray-700 flex-row justify-between items-center`}
                            >
                                <View style={tw`flex-1`}>
                                    <Text style={tw`text-white text-lg font-semibold mb-1`}>
                                        {relation.shipping_method_name} → {coverageText}
                                    </Text>

                                    <View style={tw`flex-row gap-4`}>
                                        {relation.custom_cost != null && (
                                            <Text style={tw`text-white text-sm font-semibold`}>
                                                <Text style={tw`text-gray-300`}>Costo:</Text> ${relation.custom_cost}
                                            </Text>
                                        )}

                                        {relation.custom_days != null && (
                                            <Text style={tw`text-white text-sm font-semibold`}>
                                                <Text style={tw`text-gray-300`}>Tiempo:</Text> {relation.custom_days} días
                                            </Text>
                                        )}
                                    </View>
                                </View>


                                <TouchableOpacity
                                    onPress={() => handleDelete(relation.id)}
                                    style={tw`p-2 ml-3`}
                                    disabled={isDeletingMethodZone}
                                >
                                    <Ionicons
                                        name="trash-outline"
                                        size={20}
                                        color={isDeletingMethodZone ? "#6b7280" : "#ef4444"}
                                    />
                                </TouchableOpacity>
                            </View>
                        );
                    })
                )}

                <Text style={tw`text-base text-gray-100 mt-6 mb-2`}>Tienes los siguientes métodos de entrega de productos o servicios:</Text>
                {isLoadingMethods ? (
                    <Text style={tw`text-gray-400`}>Cargando métodos...</Text>
                ) : methods?.length === 0 ? (
                    <Text style={tw`text-gray-400`}>No hay métodos registrados aún.</Text>
                ) : (
                    methods.map((method: any, index: number) => {
                        const handleDelete = () => {
                            Alert.alert(
                                'Eliminar método',
                                `¿Estás seguro de eliminar "${method.name_display}"?`,
                                [
                                    { text: 'Cancelar', style: 'cancel' },
                                    {
                                        text: 'Eliminar',
                                        onPress: () => deleteMethod(method.id),
                                        style: 'destructive'
                                    }
                                ]
                            );
                        };

                        return (
                            <View
                                key={method.id || index}
                                style={tw`bg-gray-800 p-4 rounded-xl mb-3 border border-gray-700 flex-row justify-between items-center`}
                            >
                                <View style={tw`flex-1`}>
                                    <Text style={tw`text-white text-lg font-semibold mb-1`}>
                                        {method.name_display}
                                    </Text>
                                    <Text style={tw`text-green-400 text-sm font-semibold mb-1`}>
                                        Precio: ${Number(method.base_cost).toLocaleString()}

                                    </Text>
                                    <Text style={tw`text-white text-sm`}>
                                        Tiempo de entrega: {method.estimated_days} dias
                                    </Text>
                                    <Text style={tw`text-white text-sm`}>
                                        Descripción: {method.description}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={handleDelete}
                                    style={tw`p-2 ml-3`}
                                    disabled={isDeleting}
                                >
                                    <Ionicons
                                        name="trash-outline"
                                        size={20}
                                        color={isDeleting ? "#6b7280" : "#ef4444"}
                                    />
                                </TouchableOpacity>
                            </View>
                        );
                    })
                )}

                <Text style={tw`text-base text-gray-100 mt-6 mb-2`}>Haces envios/entregas en:</Text>
                {isLoading ? (
                    <Text style={tw`text-gray-400`}>Cargando zonas...</Text>
                ) : zones?.length === 0 ? (
                    <Text style={tw`text-gray-400`}>No hay zonas registradas aún.</Text>
                ) : (
                    zones.map((zone: any, index: number) => {
                        const { country_name, city_name, neighborhood_name, id } = zone;

                        let coverageText = 'Cobertura no especificada';
                        if (neighborhood_name) {
                            coverageText = neighborhood_name;
                        } else if (city_name) {
                            coverageText = city_name;
                        } else if (country_name) {
                            coverageText = country_name;
                        }

                        const handleDelete = () => {
                            Alert.alert(
                                'Eliminar zona',
                                `¿Estás seguro de eliminar la zona "${zone.name}"?`,
                                [
                                    {
                                        text: 'Cancelar',
                                        style: 'cancel',
                                    },
                                    {
                                        text: 'Eliminar',
                                        onPress: () => deleteZone(id),
                                        style: 'destructive',
                                    },
                                ]
                            );
                        };

                        return (
                            <View
                                key={id || index}
                                style={tw`bg-gray-800 p-4 rounded-xl mb-3 border border-gray-700 flex-row justify-between items-center`}
                            >
                                <View style={tw`flex-1`}>
                                    <Text style={tw`text-yellow-400 text-lg font-semibold mb-1`}>
                                        {coverageText}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={handleDelete}
                                    style={tw`p-2 ml-3`}
                                >
                                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        );
                    })
                )}

                <View style={tw`w-full items-center`}>
                    <TouchableOpacity
                        style={tw`p-5 mb-4 rounded-2xl shadow-lg border border-gray-800 items-center w-full`}
                        onPress={() => openModal(0)}
                    >
                        <View style={tw`bg-gray-800 p-3 rounded-full mb-3`}>
                            <Ionicons name="locate-outline" size={24} color="#FFFFFF" />
                        </View>
                        <Text style={tw`text-base text-gray-200 font-light text-center tracking-wide`}>
                            ¿Quieres aumentar tu cobertura de servicios o productos?
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <ReusableModal visible={isModalVisible} onClose={closeModal}>
                {activeModalIndex === 0 && (
                    <View>
                        <LocationPicker
                            selectedCountry={selectedCountry}
                            setSelectedCountry={setSelectedCountry}
                            selectedCity={selectedCity}
                            setSelectedCity={setSelectedCity}
                            selectedNeighborhood={selectedNeighborhood}
                            setSelectedNeighborhood={setSelectedNeighborhood}
                            countries={countries}
                            cities={cities}
                            neighborhoods={neighborhoods}
                            isCountriesLoading={isCountriesLoading}
                            labelCountry="Elige el país donde estarás presente"
                            labelCity="Selecciona la ciudad que deseas cubrir o donde se encuentra tu negocio"
                            labelNeighborhood="Indica el barrio, pueblo o vereda que deseas cubrir completamente"
                        />

                        <AuthButton
                            title={isPending ? 'Guardando...' : 'Guardar zona'}
                            onPress={handleCreateZone}
                            disabled={isPending}
                        />
                    </View>
                )}
                {activeModalIndex === 1 && (
                    <>
                        <View>
                            <Text style={tw`text-white text-xl font-bold mb-4`}>Agrega un Método de entrega </Text>

                            <Text style={tw`text-gray-300 text-sm mb-1`}>Selecciona el método de entrega</Text>
                            <View style={tw`bg-gray-800 rounded-lg mb-4 `}>
                                <Picker
                                    selectedValue={formData.name}
                                    onValueChange={(itemValue) =>
                                        setFormData({ ...formData, name: itemValue })
                                    }
                                    style={tw`text-white`}
                                    dropdownIconColor="#fff"
                                >
                                    <Picker.Item label="Selecciona una opción..." value="" enabled={false} />
                                    <Picker.Item label="Envío estándar" value="standard" />
                                    <Picker.Item label="Entrega express" value="express" />
                                    <Picker.Item label="Entrega el mismo día" value="same_day" />
                                    <Picker.Item label="Recogida en tienda" value="pickup" />
                                    <Picker.Item label="Entrega por repartidor" value="rider_delivery" />
                                    <Picker.Item label="Servicio a domicilio" value="home_service" />
                                    <Picker.Item label="Servicio en la sede" value="in_store" />
                                    <Picker.Item label="Servicio en línea" value="in_line" />
                                    <Picker.Item label="Servicio telefónico" value="by_phone" />
                                </Picker>
                            </View>
                            <AuthInput
                                label="Descripción del método (opcional)"
                                placeholder="Ej: Entrega por moto en el área urbana entre 3 y 5 p.m."
                                value={formData.description}
                                onChangeText={(text) => setFormData({ ...formData, description: text })}
                                multiline
                            />
                            <AuthInput
                                label="¿Cuál es el costo base de este método?"
                                placeholder="Costo base (ej: 12000)"
                                value={formData.base_cost}
                                onChangeText={(text) => setFormData({ ...formData, base_cost: text })}
                                keyboardType="numeric"

                            />
                            <AuthInput
                                label="¿En cuántos días se entrega, en promedio?"
                                placeholder="Días estimados (ej: 5)"
                                value={formData.estimated_days}
                                onChangeText={(text) => setFormData({ ...formData, estimated_days: text })}
                                keyboardType="numeric"

                            />
                            <AuthButton
                                title={isCreating ? 'Creando...' : 'Crear método de entrega'}
                                onPress={handleCreate}
                                disabled={isCreating}
                            />

                        </View>
                    </>
                )}
                {activeModalIndex === 2 && (
                    <View style={tw``}>
                        <Text style={tw`text-white text-xl font-bold mb-4`}>Relaciona tu localidad y tu método de entrega</Text>

                        {/* Selector de zona */}
                        <Text style={tw`text-gray-200 mb-4 font-light text-base`}>
                            Relaciona tus métodos de entrega con las zonas donde prestas servicio.                        </Text>
                        <Text style={tw`text-white mb-1 font-light`}>Selecciona una zona:</Text>
                        <View style={tw`bg-gray-800 rounded-xl mb-4`}>
                            <Picker
                                selectedValue={selectedZone}
                                onValueChange={(itemValue) => setSelectedZone(itemValue)}
                            >
                                <Picker.Item label="Selecciona una zona..." value={null} />
                                {zones?.map((zone) => {
                                    let label = 'Cobertura no especificada';
                                    if (zone.neighborhood_name) {
                                        label = zone.neighborhood_name;
                                    } else if (zone.city_name) {
                                        label = zone.city_name;
                                    } else if (zone.country_name) {
                                        label = zone.country_name;
                                    }

                                    return (
                                        <Picker.Item key={zone.id} label={label} value={zone.id} />
                                    );
                                })}
                            </Picker>
                        </View>

                        <Text style={tw`text-white mb-1 font-light`}>Selecciona un método de entrega:</Text>
                        <View style={tw`bg-gray-800 rounded-xl mb-4`}>
                            <Picker
                                selectedValue={selectedMethod}
                                onValueChange={(itemValue) => setSelectedMethod(itemValue)}
                            >
                                <Picker.Item label="Selecciona un método..." value={null} />
                                {methods?.map((method) => {
                                    return (
                                        <Picker.Item key={method.id} label={method.name} value={method.id} />
                                    );
                                })}
                            </Picker>

                        </View>

                        <AuthInput
                            label='¿Cuánto cuesta este método en esta zona?'
                            placeholder="Ej: 12000"
                            value={customCost}
                            onChangeText={(text) => setCustomCost(text.replace(/[.,]/g, ''))}
                            keyboardType="numeric"

                        />
                        <AuthInput
                            label='¿En cuentos días podria ser entregado?'
                            placeholder="Días estimados (ej: 3)"
                            value={customDays}
                            onChangeText={(text) => setCustomDays(text.replace(/\D/g, ''))}
                            keyboardType="numeric"

                        />

                        {/* Botón para crear relación */}
                        <AuthButton
                            title={isCreatingMethodZone ? 'Creando...' : 'Crear enlace de entrega'}
                            onPress={() => {
                                if (!selectedZone || !selectedMethod || !customCost || !customDays) {
                                    Alert.alert("Campos incompletos", "Todos los campos son obligatorios");
                                    return;
                                }
                                createMethodZone({
                                    shipping_method: selectedMethod,
                                    zone: selectedZone,
                                    custom_cost: parseFloat(customCost),
                                    custom_days: parseInt(customDays)
                                }, {
                                    onSuccess: () => {
                                        setModalVisible(false);
                                        setSelectedZone(null);
                                        setSelectedMethod(null);
                                        setCustomCost('');
                                        setCustomDays('');
                                    }
                                });
                            }}
                            disabled={isCreatingMethodZone}
                        />
                    </View>
                )}

            </ReusableModal>
        </View>
    )
}

export default MyShippings;
