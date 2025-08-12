import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import tw from 'twrnc';
import AuthInput from '../../../../../reusable_components/AuthInput';

interface Props {
  storeData: any;
  setStoreData: React.Dispatch<React.SetStateAction<any>>;
  showDatePicker: boolean;
  setShowDatePicker: React.Dispatch<React.SetStateAction<boolean>>;
}

const SocialDataStep = ({ storeData, setStoreData, showDatePicker, setShowDatePicker }: Props) => {
  return (
    <View style={tw`p-4 rounded-2xl shadow-lg`}>
      <Text style={tw`text-white text-2xl font-bold`}>Datos Sociales</Text>

      <View style={tw`p-2 m-2`}>
        <Text style={tw`text-gray-300 text-sm`}>
          Si ya tienes un negocio formal, puedes ingresar tu NIT (Colombia), RFC (México), CUIT (Argentina) o NIF (España), junto con el nombre legal de tu empresa y la fecha de fundación.
          {"\n\n"}
          <Text style={tw`text-white font-bold text-sm mb-4`}>
            ¿Estás empezando o aún no estás registrado? ¡No te preocupes! Este paso es opcional y puedes continuar sin llenar estos campos.
            {"\n\n"}
            Estamos aquí para apoyarte, sin importar en qué etapa de tu negocio estés.
          </Text>
        </Text>
      </View>

      <AuthInput
        placeholder="NIT / RFC (MX) / CUIT (AR) / CIF/NIF (ES)"
        value={storeData.nit}
        onChangeText={(val) => setStoreData((prev) => ({ ...prev, nit: val }))}
      />

      <AuthInput
        placeholder="Razón Social (nombre legal de tu empresa)"
        value={storeData.legal_name}
        onChangeText={(val) => setStoreData((prev) => ({ ...prev, legal_name: val }))}
      />

      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        style={tw`bg-gray-800 rounded-xl px-4 py-3 mb-4`}
      >
        <Text style={tw`text-gray-100`}>
          Fundación: {storeData.foundation_date.toLocaleDateString('es-ES')}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={storeData.foundation_date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) {
              setStoreData((prev) => ({ ...prev, foundation_date: date }));
            }
          }}
        />
      )}
    </View>
  );
};

export default SocialDataStep;
