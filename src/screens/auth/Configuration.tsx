import React from 'react';
import { ScrollView, Text, Alert, Button, View, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { clearVideoCache, logCachedVideos } from '../../utils/cache/clearVideoCache';
import { clearBiometricData, logoutUser } from '../../utils/logout';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useQueryClient } from '@tanstack/react-query';

import { useNavigation } from "@react-navigation/native";

const ConfigurarionApp = () => {
    const queryClient = useQueryClient();
    const navigation = useNavigation();



    const handleClearCache = async () => {
        const { success, deletedCount } = await clearVideoCache();

        if (success) {
            Alert.alert(
                'Caché eliminada',
                `${deletedCount} archivo${deletedCount === 1 ? '' : 's'} eliminado${deletedCount === 1 ? '' : 's'}.`
            );
        } else {
            Alert.alert('Error', 'No se pudo eliminar la caché.');
        }
    };

    const handleClearBiometric = async () => {
        const { success, keysDeleted } = await clearBiometricData();

        if (success) {
            const title = 'Limpieza completada';
            const message = keysDeleted
                ? 'Se han eliminado tus datos de inicio de sesión y el acceso por huella. Puedes volver a activarlo en los ajustes.'
                : 'Se han eliminado tus datos de inicio de sesión. El acceso por huella ya no estará disponible hasta que lo vuelvas a configurar.';

            Alert.alert(title, message);
        } else {
            Alert.alert(
                'Error',
                'No se pudo eliminar la información guardada. Por favor, intenta nuevamente.'
            );
        }
    };

    return (
        <ScrollView style={tw`flex-1 bg-black`}>
            <View style={tw`p-5`}>
                <Text style={tw`text-white text-xl mb-8`}>Configuración de mi cuenta</Text>

                {/* Limpiar caché */}
                <TouchableOpacity
                    onPress={handleClearCache}
                    style={tw`flex-row items-center py-4 border-t border-white/10`}>
                    <Ionicons name="trash-outline" size={22} color="#a5b4fc" />
                    <Text style={tw`text-white/90 ml-4 text-base font-medium`}>Vaciar caché de videos</Text>
                </TouchableOpacity>

                {/* Ver archivos */}
                <TouchableOpacity
                    onPress={async () => {
                        const count = await logCachedVideos();
                        Alert.alert(`Archivos en caché: ${count}`);
                    }}
                    style={tw`flex-row items-center py-4 border-t border-white/10`}>
                    <Ionicons name="document-text-outline" size={22} color="#fca5a5" />
                    <Text style={tw`text-white/90 ml-4 text-base font-medium`}>Explorar archivos temporales</Text>
                </TouchableOpacity>

                {/* Biometría */}
                <TouchableOpacity
                    onPress={handleClearBiometric}
                    style={tw`flex-row items-center py-4 border-t border-white/10`}>
                    <Ionicons name="finger-print-outline" size={22} color="#86efac" />
                    <Text style={tw`text-white/90 ml-4 text-base font-medium`}>Resetear datos biométricos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        logoutUser(queryClient, navigation);
                        
                    }}
                    style={tw`mt-8 py-3 rounded-lg items-center`}
                    activeOpacity={0.7}
                >
                    <Text style={tw`text-white text-lg font-semibold`}>Cerrar sesión</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
    );
};

export default ConfigurarionApp;
