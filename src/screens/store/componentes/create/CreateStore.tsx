import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, Platform, PermissionsAndroid, Linking } from 'react-native';
import tw from 'twrnc';
import { useCountries, useCities, useNeighborhoods, useCategories, useCreateStore, useUpdateStore } from '../../../../api/store/useStores';
import AuthButton from '../../../../reusable_components/AuthButton';
import LottieView from 'lottie-react-native';
import BasicInfoStep from './steps/BasicInfoStep';
import SocialDataStep from './steps/SocialDataStep';
import LocationStep from './steps/LocationStep';
import ScheduleStep from './steps/ScheduleStep';
import ReviewStep from './steps/ReviewStep';
import { useRoute } from '@react-navigation/native';
import { daysOfWeek } from '../../../../utils/constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PreChecklistStep from './steps/PreChecklistStep';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StoreOnboarding from './StoreOnboarding';


const CreateStore = () => {
  const route = useRoute();
  const mode = route.params?.mode || 'create';

  const storeId = route.params?.storeId;
  const initialData = route.params?.initialData;

  const [step, setStep] = useState(mode === 'edit' ? 1 : 0);
  const [storeData, setStoreData] = useState(() =>
    initialData
      ? {
        name: initialData.name || '',
        description: initialData.description || '',
        category: String(initialData.category || ''),
        nit: initialData.nit || '',
        legal_name: initialData.legal_name || '',
        foundation_date: new Date(initialData.foundation_date || new Date()),
        address: initialData.address || '',
        country: String(initialData.country || ''),
        city: String(initialData.city || ''),
        neighborhood: String(initialData.neighborhood || ''),
        latitude: initialData.latitude ?? null,
        longitude: initialData.longitude ?? null,
        schedules: initialData.schedules || [],
      }
      : {
        name: '',
        description: '',
        category: '',
        nit: '',
        legal_name: '',
        foundation_date: new Date(),
        address: '',
        country: '',
        city: '',
        neighborhood: '',
        latitude: null,
        longitude: null,
        schedules: [],
      }
  );

  const [isLocating, setIsLocating] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [scheduleInputs, setScheduleInputs] = useState(() =>
    daysOfWeek.map(({ day, day_display }) => {
      const existing = initialData?.schedules?.find(s => s.day === day);
      return {
        id: existing?.id,
        day,
        day_display,
        open_time: existing?.open_time || '',
        close_time: existing?.close_time || '',
      };
    })
  );

  const { data: countries, refetch: refetchCountries } = useCountries();
  const { data: cities } = useCities(storeData.country);
  const { data: neighborhoods } = useNeighborhoods(storeData.city);
  const { data: categories } = useCategories();
  const [acceptedStoreTerms, setAcceptedStoreTerms] = useState(false);
  const [maxStepReached, setMaxStepReached] = useState(0);

  const { mutate: createStore, isPending: creating } = useCreateStore();
  const { mutate: updateStore, isPending: updating } = useUpdateStore(storeId);

  const [showTutorial, setShowTutorial] = useState(true);


  const scrollRef = useRef(null);


  const isPending = creating || updating;

  const cleanedSchedules = scheduleInputs.filter(sch =>
    sch && sch.open_time && sch.close_time
  );

  const buildDiffPayload = (newData, oldData) => {
    const result = {};
    const changesLog = {};

    for (const key in newData) {
      const newValue = newData[key];
      const oldValue = oldData?.[key];

      if (key === 'schedules') {
        const normalize = (arr) =>
          (arr || []).map(({ id, day, open_time, close_time }) => ({
            id, day, open_time, close_time
          }));
        const newJson = JSON.stringify(normalize(newValue));
        const oldJson = JSON.stringify(normalize(oldValue));

        if (newJson !== oldJson) {
          result[key] = newValue;
          changesLog[key] = { before: oldValue, after: newValue };
        }
      } else if (newValue !== oldValue && newValue !== null && newValue !== '') {
        result[key] = newValue;
        changesLog[key] = { before: oldValue, after: newValue };
      }
    }

    console.log('📦 Cambios detectados:', changesLog);
    return result;
  };

  const handleSubmit = () => {
    if (!acceptedStoreTerms) {
      Alert.alert('Aviso', 'Debes aceptar los Términos y Condiciones.');
      return;
    }

    const fullPayload = {
      ...storeData,
      country: Number(storeData.country),
      city: Number(storeData.city),
      neighborhood: Number(storeData.neighborhood),
      category: storeData.category?.id, // 👈 Esta línea cambia
      foundation_date: storeData.foundation_date.toISOString().split('T')[0],
      schedules: cleanedSchedules.map((s) => ({
        id: s.id,
        day: s.day,
        open_time: s.open_time,
        close_time: s.close_time,
      })),
      latitude: storeData.latitude,
      longitude: storeData.longitude,
    };

    if (fullPayload.latitude == null || fullPayload.longitude == null) {
      delete fullPayload.latitude;
      delete fullPayload.longitude;
    }

    if (mode === 'edit' && initialData) {
      const diff = buildDiffPayload(fullPayload, initialData);

      if (Object.keys(diff).length === 0) {
        console.log('🟡 No hay cambios detectados.');
        Alert.alert('Sin cambios', 'No realizaste ninguna modificación.');
        return;
      }

      updateStore(diff, {
        onSuccess: () => Alert.alert('Éxito', 'Negocio actualizado con éxito'),
        onError: (error) => {
          console.log('❌ Error actualizando negocio:', error.response?.data || error.message);
          Alert.alert('Error', 'No se pudo actualizar el ngocio');
        },
      });
    } else {
      createStore(fullPayload, {
        onSuccess: async () => {
          try {
            await AsyncStorage.removeItem('ruvlo.preChecklist');
            console.log('✅ Checklist limpiado después de crear el negocio.');
          } catch (error) {
            console.error('❌ Error limpiando checklist:', error);
          }
        },
        onError: (error) => {
          console.log('❌ Error creando negocio:', error.response?.data || error.message);
          Alert.alert('Error', 'No se pudo crear el negocio');
        },
      });
    }
  };

  useEffect(() => {
    if (step === 3) refetchCountries();
  }, [step]);

  const handleNext = () => {
    if (step === 1) {
      if (!storeData.name) {
        return Alert.alert('Campos incompletos', 'Por favor escribe el nombre.');
      }
      if (!storeData.category) {
        return Alert.alert('Campos incompletos', 'Por favor escoge una categoría.');
      }
      if (storeData.name.length > 50) {
        return Alert.alert('Nombre muy largo', 'El nombre no debe superar los 50 caracteres/letras.');
      }
      if (storeData.description.length > 500) {
        return Alert.alert('Descripción muy larga', 'La descripción no debe superar los 500 caracteres/letras.');
      }
    }

    if (step === 2) {
      if (storeData.nit && storeData.nit.length > 20) {
        return Alert.alert('Aviso', 'El identificador legal no puedo contener más de 20 letras o numeros.');
      }
      if (storeData.legal_name && storeData.legal_name.length > 50) {
        return Alert.alert('Aviso', 'La razoón social no debe superar los 50 letras.');
      }
    }

    if (
      step === 3 &&
      (storeData.address.length > 100 ||
        !storeData.country ||
        !storeData.city ||
        !storeData.neighborhood)
    ) {
      return Alert.alert('Campos incompletos', 'Por favor selecciona tu país, ciudad y barrio.');
    }

    setStep((prev) => {
      const next = prev + 1;

      setMaxStepReached((currentMax) => Math.max(currentMax, next)); // actualiza el mayor paso alcanzado

      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }, 100);

      return next;
    });
  };

  const handleBack = () => {
    setStep((prev) => {
      const back = Math.max(prev - 1, 0);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }, 100);
      return back;
    });
  };

  const handleFinishTutorial = async () => {
    setShowTutorial(false);
  };

  if (showTutorial) {
    return <StoreOnboarding onFinish={handleFinishTutorial} />;
  }

  return (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={tw`flex-grow px-6 py-6`}>
      <Text style={tw`text-white text-xl mb-4`}>
        {mode === 'edit' ? 'Editar Negocio' : 'Crear Negocio'}
      </Text>

      {step === 0 && (
        <PreChecklistStep
          onReadyToContinue={() => setStep(1)}
          categories={categories}
        />
      )}

      {step === 1 && (
        <BasicInfoStep
          storeData={storeData}
          setStoreData={setStoreData}
          categories={categories}
        />
      )}
      {step === 2 && (
        <SocialDataStep
          storeData={storeData}
          setStoreData={setStoreData}
          showDatePicker={showDatePicker}
          setShowDatePicker={setShowDatePicker}
        />
      )}
      {step === 3 && (
        <LocationStep
          storeData={storeData}
          setStoreData={setStoreData}
          countries={countries}
          cities={cities}
          neighborhoods={neighborhoods}
        />
      )}
      {step === 4 && (
        <ScheduleStep
          scheduleInputs={scheduleInputs}
          setScheduleInputs={setScheduleInputs}
        />
      )}
      {step === 5 && (
        <ReviewStep
          storeData={storeData}
          categories={categories}
          countries={countries}
          cities={cities}
          neighborhoods={neighborhoods}
          scheduleInputs={scheduleInputs}
          acceptedStoreTerms={acceptedStoreTerms}
          setAcceptedStoreTerms={setAcceptedStoreTerms}
          setStep={setStep}
        />
      )}

      <View>
        {step > 1 && (
          <TouchableOpacity onPress={handleBack} style={tw`mb-2`}>
            <Text style={tw`text-center text-gray-400`}>← Volver</Text>
          </TouchableOpacity>
        )}


        {step > 0 && (
          <View style={tw`pt-6`} >
            <AuthButton
              title={
                step === 5
                  ? isPending
                    ? mode === 'edit'
                      ? 'Guardando...'
                      : 'Creando tu negocio...'
                    : mode === 'edit'
                      ? 'Guardar cambios'
                      : 'Crear negocio'
                  : 'Siguiente paso'
              }
              icon={
                step === 5
                  ? <Ionicons name="brush-outline" size={20} color="#fff" />
                  : <Ionicons name="arrow-forward" size={20} color="#fff" />
              }
              onPress={
                step === 5
                  ? handleSubmit
                  : () => {
                    if (maxStepReached === 5) {
                      setStep(5);
                      setTimeout(() => {
                        scrollRef.current?.scrollTo({ y: 0, animated: true });
                      }, 100);
                    } else {
                      handleNext();
                    }
                  }
              }
              disabled={isPending}
            />

          </View>
        )}

        <View style={tw`flex-row justify-center mt-4`}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View
              key={i}
              style={tw.style(
                'w-3 h-3 rounded-full mx-1',
                step === i ? 'bg-blue-400' : 'bg-gray-500 opacity-50'
              )}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default CreateStore;
