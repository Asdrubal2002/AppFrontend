import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import AuthButton from '../../../../../reusable_components/AuthButton';
import { COLORS } from '../../../../../../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserProfile } from '../../../../../api/auth/authApi';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from "@react-navigation/native";
import UserProfileScreen from '../../../../auth/UserProfileScreen';

const STORAGE_KEY = 'ruvlo.preChecklist';

const defaultChecklist = [
    {
        key: 'name',
        label: 'Nombre del negocio (Obligatorio)',
        description: 'El nombre que verán tus clientes. No debe ser muy largo.',
        required: true,
    },
    {
        key: 'description',
        label: 'Descripción',
        description: 'Es recomendable. Cuenta en pocas palabras qué ofrece tu negocio.',
        required: false,
    },
    {
        key: 'nit',
        label: 'Número tributario (opcional)',
        description: 'NIT (Colombia), RFC (México), CUIT (Argentina), y otros.',
        required: false,
    },
    {
        key: 'legal_name',
        label: 'Razón social (opcional)',
        description: 'Nombre legal de tu negocio, si lo tienes registrado legalmente.',
        required: false,
    },
    {
        key: 'foundation_date',
        label: 'Fecha de fundación (opcional)',
        description: 'Cuándo empezaste tu negocio o emprendimiento.',
        required: false,
    },
    {
        key: 'country_city_neighborhood',
        label: 'Ubicación',
        description: 'Debes indicar el país, la ciudad y el barrio donde está tu negocio.',
        required: true,

    },
    {
        key: 'address',
        label: 'Dirección (opcional)',
        description: 'Calle, número, o punto de referencia donde te pueden encontrar.',
        required: false,
    },
    {
        key: 'schedule',
        label: 'Horarios de atención (opcional)',
        description: 'Días y horas en los que atiendes al público.',
        required: false,
    },
    {
        key: 'category',
        label: 'Categoría del negocio',
        description: 'El tipo de negocio que tienes, en la siguiente lista:',
        required: true,
    },
];

const PreChecklistStep = ({ onReadyToContinue, categories = [] }) => {
    const navigation = useNavigation();

    const [checks, setChecks] = useState({});

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['userProfile'],
        queryFn: getUserProfile,
        enabled: true,
    });


    const isProfileIncomplete = (user) => {
        if (!user) return true;

        const requiredFields = [
            'name',
            'last_name',
            'email',
            'country',
            'city',
            'neighborhood',
            'date_of_birth',
            'gender',
            'document_number',
            'address'
        ];

        return requiredFields.some((field) => !user[field]);
    };

    const getMissingProfileFields = (user) => {
        if (!user) return [];

        const requiredFields = [
            { key: 'name', label: 'Nombre' },
            { key: 'last_name', label: 'Apellido' },
            { key: 'email', label: 'Correo electrónico' },
            { key: 'country', label: 'País' },
            { key: 'city', label: 'Ciudad' },
            { key: 'neighborhood', label: 'Barrio' },
            { key: 'date_of_birth', label: 'Fecha de nacimiento' },
            { key: 'gender', label: 'Género' },
            { key: 'document_number', label: 'Número de documento' },
            { key: 'address', label: 'Dirección' },
        ];

        return requiredFields.filter(({ key }) => !user[key]);
    };


    useEffect(() => {
        const load = async () => {
            try {
                const saved = await AsyncStorage.getItem(STORAGE_KEY);
                if (saved) {
                    setChecks(JSON.parse(saved));
                }
            } catch (e) {
                console.error('Error cargando checklist:', e);
            }
        };
        load();
    }, []);

    useEffect(() => {
        const updateStorage = async () => {
            try {
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(checks));
            } catch (e) {
                console.error('Error actualizando checklist:', e);
            }
        };

        updateStorage();
    }, [checks]);


    const toggleCheck = (key) => {
        setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const allChecked = defaultChecklist
        .filter((item) => item.required)
        .every((item) => checks[item.key]);

    return (
        <ScrollView>
            <View >
                <Text style={tw`text-gray-300 text-sm mb-4 text-base font-light`}>
                    Antes de crear tu negocio, asegúrate de tener listos algunos datos clave. 📋
                    Puedes anotarlos en una hoja y marcar cada punto a medida que los vas preparando.
                    Cuando termines, estarás listo para continuar. ¡Vamos con todo! 🚀
                </Text>

                <View style={tw`mb-2`}>
                    {defaultChecklist.map((item) => (
                        <TouchableOpacity
                            key={item.key}
                            onPress={() => toggleCheck(item.key)}
                            style={tw`flex-row items-start mb-4`}
                        >
                            <Ionicons
                                name={checks[item.key] ? 'checkbox' : 'square-outline'}
                                size={20}
                                color={checks[item.key] ? COLORS.BlueSkyWord : '#999'}
                                style={tw`mr-3 mt-0.5`}
                            />
                            <View style={tw`flex-1`}>
                                <Text style={tw`text-white font-bold text-base`}>{item.label}</Text>
                                <Text style={tw`text-gray-400 text-sm `}>{item.description}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {categories.length > 0 && (
                    <View style={tw`mb-6`}>
                        <Text style={tw`text-white font-semibold mb-2`}>Categorías disponibles:</Text>
                        <View>
                            {categories.map((cat) => (
                                <Text key={cat.id} style={tw`text-gray-300 ml-2 text-base`}>• {cat.name}</Text>
                            ))}
                        </View>
                    </View>
                )}

            </View>


            {!isLoading && data && isProfileIncomplete(data) && (
                <View>
                    <View style={tw`bg-red-800/40 border border-red-900 rounded-xl p-5 `}>
                        <Text style={tw`text-white  font-light text-base`}>
                            Debes completar los siguientes datos de tu perfil para la creación de tu negocio:
                        </Text>
                        {getMissingProfileFields(data).map((field) => (
                            <Text key={field.key} style={tw`text-white my-4 font-semibold text-base`}>
                                • {field.label}
                            </Text>
                        ))}
                    </View>
                    <UserProfileScreen />
                </View>
            )}

            <AuthButton
                title={allChecked ? 'Comenzar a crear mi negocio' : 'Completa todos los puntos'}
                onPress={onReadyToContinue}
                disabled={!allChecked || isProfileIncomplete(data)}
            />

        </ScrollView>
    );
};

export default PreChecklistStep;
