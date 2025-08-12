import React from 'react';
import { ScrollView, Text } from 'react-native';
import tw from 'twrnc';

const PrivacyScreen = () => {
  return (
    <ScrollView style={tw`flex-1 p-6`}>
      <Text style={tw`text-white text-2xl font-bold mb-4`}>
        Politica de privacidad
      </Text>

      <Text style={tw`text-gray-300 mb-4`}>
        En Ruvlo nos comprometemos a proteger tu privacidad. Esta política explica cómo recolectamos y usamos tus datos.
      </Text>

      <Text style={tw`text-blue-400 font-bold mb-2`}>1. Datos que recolectamos</Text>
      <Text style={tw`text-gray-300 mb-4`}>
        Recopilamos datos personales que nos proporcionas al registrarte, como nombre, usuario, teléfono y PIN. También recolectamos datos técnicos para mejorar la app.
      </Text>

      <Text style={tw`text-blue-400 font-bold mb-2`}>2. Uso de los datos</Text>
      <Text style={tw`text-gray-300 mb-4`}>
        Usamos tus datos para crear y administrar tu cuenta, comunicarnos contigo y mejorar nuestros servicios.
      </Text>

      <Text style={tw`text-blue-400 font-bold mb-2`}>3. Base legal para el tratamiento</Text>
      <Text style={tw`text-gray-300 mb-4`}>
        Tratamos tus datos con tu consentimiento explícito al aceptar esta política y para cumplir el contrato de servicio.
      </Text>

      <Text style={tw`text-blue-400 font-bold mb-2`}>4. Compartir datos</Text>
      <Text style={tw`text-gray-300 mb-4`}>
        No vendemos tus datos. Podemos compartirlos con proveedores que ayudan a operar la app bajo acuerdos de confidencialidad.
      </Text>

      <Text style={tw`text-blue-400 font-bold mb-2`}>5. Seguridad</Text>
      <Text style={tw`text-gray-300 mb-4`}>
        Implementamos medidas para proteger tus datos contra accesos no autorizados.
      </Text>

      <Text style={tw`text-blue-400 font-bold mb-2`}>6. Derechos del usuario</Text>
      <Text style={tw`text-gray-300 mb-4`}>
        Puedes solicitar acceso, corrección o eliminación de tus datos contactándonos en [email@ejemplo.com].
      </Text>

      <Text style={tw`text-blue-400 font-bold mb-2`}>7. Conservación de datos</Text>
      <Text style={tw`text-gray-300 mb-4`}>
        Guardamos tus datos mientras tu cuenta esté activa o según obligaciones legales.
      </Text>

      <Text style={tw`text-blue-400 font-bold mb-2`}>8. Cambios en la política</Text>
      <Text style={tw`text-gray-300 mb-4`}>
        Actualizaremos esta política cuando sea necesario y te notificaremos.
      </Text>

      <Text style={tw`text-blue-400 font-bold mb-2`}>9. Contacto</Text>
      <Text style={tw`text-gray-300 mb-10`}>
        Si tienes preguntas sobre privacidad, contáctanos en [email@ejemplo.com].
      </Text>
    </ScrollView>
  );
};

export default PrivacyScreen;
