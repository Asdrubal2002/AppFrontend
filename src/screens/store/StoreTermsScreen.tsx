import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import tw from 'twrnc';

const StoreTermsScreen = () => {
  return (
    <ScrollView style={tw`flex-1 bg-black px-5 py-6`}>
      <Text style={tw`text-white text-2xl font-bold mb-4`}>
        Términos y Condiciones para Creación de Tiendas
      </Text>

      <Text style={tw`text-gray-300 mb-4`}>
        Al crear una tienda en nuestra plataforma, aceptas los siguientes términos y condiciones:
      </Text>

      <Text style={tw`text-blue-400 font-bold mb-2`}>1. Responsabilidad del Propietario</Text>
      <Text style={tw`text-gray-300 mb-4`}>
        Eres completamente responsable del contenido, productos, servicios y datos ingresados en tu tienda. 
        Aseguras que toda la información proporcionada es verídica, actualizada y no infringe leyes locales o internacionales.
      </Text>

      <Text style={tw`text-blue-400 font-bold mb-2`}>2. Veracidad de la Información Comercial</Text>
      <Text style={tw`text-gray-300 mb-4`}>
        Debes registrar una tienda real, con datos verificables como nombre, NIT/RUT, ubicación y horario. El uso de datos falsos podrá 
        generar la suspensión o eliminación de tu cuenta y tienda.
      </Text>

      <Text style={tw`text-blue-400 font-bold mb-2`}>3. Contenido Permitido</Text>
      <Text style={tw`text-gray-300 mb-4`}>
        Está prohibido publicar contenido que promueva:
        {"\n"}• Desnudos o contenido sexual explícito.
        {"\n"}• Violencia, maltrato, armas o sustancias ilegales.
        {"\n"}• Discriminación por raza, género, religión u orientación sexual.
        {"\n"}• Muerte o contenido gráfico perturbador.
      </Text>

      <Text style={tw`text-blue-400 font-bold mb-2`}>4. Moderación y Penalizaciones</Text>
      <Text style={tw`text-gray-300 mb-4`}>
        Nos reservamos el derecho de revisar, moderar o eliminar contenido publicado. Si se detecta mal uso o publicaciones indebidas, 
        podremos suspender o eliminar tu tienda y/o cuenta sin previo aviso.
      </Text>

      <Text style={tw`text-blue-400 font-bold mb-2`}>5. Privacidad y Datos</Text>
      <Text style={tw`text-gray-300 mb-4`}>
        Los datos de tu tienda podrán ser visibles públicamente (nombre, ubicación, productos), pero tus datos personales serán tratados 
        conforme a nuestra Política de Privacidad.
      </Text>

      <Text style={tw`text-blue-400 font-bold mb-2`}>6. Aceptación</Text>
      <Text style={tw`text-gray-300 mb-8`}>
        Al continuar con la creación de tu tienda, declaras haber leído y aceptado estos términos. Si no estás de acuerdo, 
        no deberías continuar con el proceso.
      </Text>
    </ScrollView>
  );
};

export default StoreTermsScreen;
