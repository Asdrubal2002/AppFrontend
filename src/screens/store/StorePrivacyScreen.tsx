import React from 'react';
import { ScrollView, Text } from 'react-native';
import tw from 'twrnc';

const StorePrivacyScreen = () => {
  return (
    <ScrollView style={tw`flex-1 bg-black px-5 py-6`}>
      <Text style={tw`text-white text-2xl font-bold mb-4`}>
        Política de Privacidad - Tiendas
      </Text>

      <Text style={tw`text-gray-300 mb-4`}>
        Nos comprometemos a proteger la privacidad de los datos que proporcionas al registrar tu tienda.
      </Text>

      <Text style={tw`text-blue-400 font-bold mb-2`}>1. Datos Recopilados</Text>
      <Text style={tw`text-gray-300 mb-4`}>
        Recopilamos información como nombre de tienda, NIT o número fiscal, dirección, horario, productos y ubicación. También se asocia 
        tu cuenta de usuario como propietario de la tienda.
      </Text>

      <Text style={tw`text-blue-400 font-bold mb-2`}>2. Uso de la Información</Text>
      <Text style={tw`text-gray-300 mb-4`}>
        Usamos los datos para mostrar tu tienda públicamente dentro de la app y permitir que compradores interactúen con tus productos. 
        También podremos usarlos para estadísticas internas y mejoras de servicio.
      </Text>

      <Text style={tw`text-blue-400 font-bold mb-2`}>3. Compartir Información</Text>
      <Text style={tw`text-gray-300 mb-4`}>
        No compartimos datos personales tuyos con terceros sin tu consentimiento. Solo mostraremos públicamente información de la tienda.
      </Text>

      <Text style={tw`text-blue-400 font-bold mb-2`}>4. Eliminación y Control</Text>
      <Text style={tw`text-gray-300 mb-4`}>
        Puedes solicitar en cualquier momento la eliminación de tu tienda y sus datos relacionados. Para ello, contáctanos desde el área 
        de soporte de la app.
      </Text>

      <Text style={tw`text-blue-400 font-bold mb-2`}>5. Seguridad</Text>
      <Text style={tw`text-gray-300 mb-8`}>
        Aplicamos medidas técnicas y organizativas para proteger tus datos contra accesos no autorizados, pérdidas o alteraciones.
      </Text>
    </ScrollView>
  );
};

export default StorePrivacyScreen;
