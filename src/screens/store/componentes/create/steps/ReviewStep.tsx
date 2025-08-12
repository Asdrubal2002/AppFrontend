import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { formatTime12h } from '../../../../../api/reusable_funciones';
import { generateLeafletHTML } from '../../../../../reusable_components/generateLeafletHTML';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TermsCheckbox from '../../../../../reusable_components/TermsCheckbox';


interface Props {
  storeData: any;
  categories: { id: number; name: string }[] | undefined;
  countries: { id: number; name: string }[] | undefined;
  cities: { id: number; name: string }[] | undefined;
  neighborhoods: { id: number; name: string }[] | undefined;
  scheduleInputs: any[];
  acceptedStoreTerms: boolean;
  setAcceptedStoreTerms: React.Dispatch<React.SetStateAction<boolean>>;
}

const dayTranslation = {
  Monday: 'Lunes',
  Tuesday: 'Martes',
  Wednesday: 'Miércoles',
  Thursday: 'Jueves',
  Friday: 'Viernes',
  Saturday: 'Sábado',
  Sunday: 'Domingo',
};

const ReviewStep = ({
  storeData,
  categories,
  countries,
  cities,
  neighborhoods,
  scheduleInputs,
  acceptedStoreTerms,
  setAcceptedStoreTerms,
  setStep,
}: Props & { setStep: (step: number) => void }) => {
  const navigation = useNavigation();

  const html = generateLeafletHTML({
    store: {
      name: storeData.name,
      latitude: storeData.latitude,
      longitude: storeData.longitude,
    }
  });
  return (
    <View style={tw`p-4 rounded-2xl shadow-lg bg-gray-800 mb-4`}>
      <Text style={tw`text-white text-2xl mb-6 text-center font-bold`}>
        Verifica los datos de tu negocio
      </Text>
      {[
        { label: 'El nombre es:', value: storeData.name, stepIndex: 1 },
        { label: 'La descripción es:', value: storeData.description, stepIndex: 1 },
        {
          label: 'La categoría a la que pertenece es:',
          value: storeData.category?.name,
          stepIndex: 1,
        },
        {
          label: 'El país en el cual se ubica es:',
          value: countries?.find((c) => String(c.id) === storeData.country)?.name,
          stepIndex: 3,
        },
        {
          label: 'La ciudad en la cual se ubica es:',
          value: cities?.find((c) => String(c.id) === storeData.city)?.name,
          stepIndex: 3,
        },
        {
          label: 'El barrio en el cual se ubica es:',
          value: neighborhoods?.find((c) => String(c.id) === storeData.neighborhood)?.name,
          stepIndex: 3,
        },
        {
          label: 'Identificador Fiscal (NIT / RFC / CUIT)',
          value: storeData.nit || 'No registrado',
          stepIndex: 2,
        },
        {
          label: 'Razón Social',
          value: storeData.legal_name || 'No registrada',
          stepIndex: 2,
        },
        {
          label: 'Fundación',
          value: moment(storeData.foundation_date).format('DD MMM YYYY'),
          stepIndex: 2,
        },
        {
          label: 'Dirección',
          value: storeData.address,
          stepIndex: 3,
        },
      ].map((item, idx) => (
        <View key={idx} style={tw`mb-4`}>
          <View style={tw`flex-row justify-between items-start`}>
            <Text style={tw`text-gray-400 text-sm flex-1`}>{item.label}</Text>
            <TouchableOpacity onPress={() => setStep(item.stepIndex)}>
              <Ionicons name="pencil" size={16} color="#ccc" />
            </TouchableOpacity>
          </View>
          <Text style={tw`text-white text-base mt-1`}>{item.value || 'No registrado'}</Text>
        </View>
      ))}

      {storeData.latitude && storeData.longitude && (
        <View style={tw`h-64 rounded-xl overflow-hidden mb-6`}>
          <Text style={tw`text-gray-400 text-sm mb-2`}>Ubicación en el mapa:</Text>
          <WebView
            originWhitelist={['*']}
            source={{ html }}
            javaScriptEnabled
            domStorageEnabled
            style={{ flex: 1 }}
          />
        </View>
      )}

      <View style={tw`mb-4`}>
        <Text style={tw`text-gray-400 text-sm mb-2`}>Horarios:</Text>
        {scheduleInputs.filter(s => s?.open_time && s?.close_time).length > 0 ? (
          scheduleInputs.map((sch, idx) => {
            if (!sch?.open_time || !sch?.close_time) return null;
            return (
              <Text key={idx} style={tw`text-white text-base`}>
                {dayTranslation[sch.day_display] || sch.day_display}: {formatTime12h(sch.open_time)} - {formatTime12h(sch.close_time)}
              </Text>
            );
          })
        ) : (
          <Text style={tw`text-gray-300 text-base`}>No se han configurado horarios.</Text>
        )}
      </View>
      <TermsCheckbox
        checked={acceptedStoreTerms}
        setChecked={setAcceptedStoreTerms}
      />
    </View>
  );
};

export default ReviewStep;
