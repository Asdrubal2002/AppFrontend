import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import tw from 'twrnc';

const TermScreen = () => {
  return (
    <ScrollView style={tw`flex-1 p-6`}>
      <Text style={tw`text-white text-2xl font-bold mb-4`}>
        Términos y Condiciones
      </Text>

      <Text style={tw`text-gray-300 mb-4`}>
        Bienvenido a Ruvlo. Al usar esta aplicación, aceptas cumplir los siguientes términos y condiciones.
      </Text>

      <Text style={tw`text-blue-400 font-bold mb-2`}>1. Uso de la app</Text>
      <Text style={tw`text-gray-300 mb-4`}>
        Debes usar la app de forma legal y respetuosa. Queda prohibido utilizarla para actividades ilegales, ofensivas o dañinas.
      </Text>

      <Text style={tw`text-blue-400 font-bold mb-2`}>2. Registro y seguridad</Text>
      <Text style={tw`text-gray-300 mb-4`}>
        Para usar ciertas funciones debes registrarte y proporcionar información veraz. Eres responsable de mantener tu cuenta segura.
      </Text>

      <Text style={tw`text-blue-400 font-bold mb-2`}>3. Contenido prohibido</Text>
      <Text style={tw`text-gray-300 mb-4`}>
        No está permitido subir, publicar o compartir contenido que incluya desnudos, violencia explícita, incitación al odio, muerte, abuso o cualquier material ilegal o inapropiado.
      </Text>

      <Text style={tw`text-blue-400 font-bold mb-2`}>4. Responsabilidad del usuario</Text>
      <Text style={tw`text-gray-300 mb-4`}>
        Eres responsable del contenido que generes o compartas. La app puede eliminar contenido que viole estos términos sin previo aviso.
      </Text>

      <Text style={tw`text-blue-400 font-bold mb-2`}>5. Suspensión y terminación</Text>
      <Text style={tw`text-gray-300 mb-4`}>
        Podemos suspender o eliminar tu cuenta si incumples estos términos o compartes contenido inapropiado, sin responsabilidad para nosotros.
      </Text>

      <Text style={tw`text-blue-400 font-bold mb-2`}>6. Propiedad intelectual</Text>
      <Text style={tw`text-gray-300 mb-4`}>
        Todos los derechos sobre el contenido, marcas y software pertenecen a [NombreEmpresa]. No puedes usarlo sin permiso.
      </Text>

      <Text style={tw`text-blue-400 font-bold mb-2`}>7. Limitación de responsabilidad</Text>
      <Text style={tw`text-gray-300 mb-4`}>
        No garantizamos que la app estará siempre disponible o libre de errores. No somos responsables por daños directos o indirectos derivados del uso.
      </Text>

      <Text style={tw`text-blue-400 font-bold mb-2`}>8. Cambios en los términos</Text>
      <Text style={tw`text-gray-300 mb-4`}>
        Podemos modificar estos términos y notificaremos mediante la app o correo.
      </Text>

      <Text style={tw`text-blue-400 font-bold mb-2`}>9. Ley aplicable</Text>
      <Text style={tw`text-gray-300 mb-10`}>
        Estos términos se rigen por las leyes de [país/estado].
      </Text>
    </ScrollView>
  );
};

export default TermScreen;
