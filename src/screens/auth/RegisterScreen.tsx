import React, { useEffect, useMemo, useRef, useState } from 'react';

import { View, Text, TextInput, TouchableOpacity, StatusBar, Alert, ScrollView } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

import tw from 'twrnc';

import { useRegister, useValidateUsername } from '../../api/auth/useRegister';
import { useCountries } from '../../api/store/useStores';
import AuthInput from '../../reusable_components/AuthInput';
import AuthButton from '../../reusable_components/AuthButton';
import PinInput from './components/PinInput';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TermsCheckbox from '../../reusable_components/TermsCheckbox';
import { useRandomIcon } from '../../utils/hooks/useRandomIcon';

const RegisterScreen = () => {
  const randomIcon = useRandomIcon();

  const navigation = useNavigation();
  const [step, setStep] = useState(0);

  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState('1');
  const [cellphone, setCellphone] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const scrollRef = useRef(null);
  const [apiErrors, setApiErrors] = useState<Record<string, string>>({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const { mutate, isPending, isSuccess, error } = useRegister();
  const { data: countries, isLoading: loadingCountries, refetch } = useCountries();
  const { mutate: checkUsername, isPending: isCheckingUsername } = useValidateUsername();
  const [validatedUsername, setValidatedUsername] = useState<string | null>(null);


  const handleNext = () => {
    if (step === 0) {
      const trimmedUsername = username.trim();

      if (trimmedUsername === '' || trimmedUsername.includes(' ')) {
        Alert.alert('Error', 'El nombre de usuario no puede estar vacío ni contener espacios');
        return;
      }

      // Si ya fue validado previamente, no volvemos a llamar al API
      if (validatedUsername === trimmedUsername) {
        setStep(1);
        return;
      }

      // Validar con API
      checkUsername(trimmedUsername, {
        onSuccess: () => {
          setValidatedUsername(trimmedUsername);  // <-- Guardamos que fue validado
          setStep(1);
        },
        onError: (error: any) => {
          const message =
            error?.response?.data?.username?.[0] || 'Error al validar el usuario.';
          Alert.alert('Usuario inválido', message);
        },
      });

      return;
    }

    // Validaciones básicas para otros pasos si las necesitas
    if (step === 1) {
      if (name.trim() === '') {
        Alert.alert('Error', 'Por favor ingresa tu nombre');
        return;
      }
      if (name.length > 100) {
        Alert.alert('Error', 'El nombre no puede tener más de 100 caracteres');
        return;
      }
      if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(name.trim())) {
        Alert.alert('Error', 'El nombre solo debe contener letras y espacios');
        return;
      }
    }

    if (step === 2) {
      if (cellphone.trim() === '') {
        Alert.alert('Error', 'Por favor ingresa tu celular');
        return;
      }
      if (cellphone.length > 12) {
        Alert.alert('Error', 'El celular no puede tener más de 12 dígitos');
        return;
      }
      if (!/^\d+$/.test(cellphone)) {
        Alert.alert('Error', 'El celular solo debe contener números');
        return;
      }
    }

    // Avanzar al siguiente paso
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 0));
  };

  const handleRegister = () => {
    if (pin.some(d => d === '')) {
      Alert.alert('Falta la clave', 'Por favor ingresa los 4 números de la clave');
      return;
    }
    if (!acceptedTerms) {
      Alert.alert('Aviso', 'Debes aceptar los términos y condiciones para continuar');
      return;
    }
    const fullPin = pin.join('');

    mutate(
      { username, name, country: Number(country), cellphone, pin: fullPin },
      {
        onError: (error: any) => {
          if (error?.response?.data) {
            const errors = error.response.data;

            // Error específico de celular duplicado
            if ('cellphone' in errors) {
              Alert.alert('Error', 'El número de celular ya está registrado');
              return;
            }

            // Otros errores: los mostramos si existen
            const formatted: Record<string, string> = {};
            for (const key in errors) {
              if (Array.isArray(errors[key])) {
                formatted[key] = errors[key].join(', ');
              }
            }
            setApiErrors(formatted);
          } else {
            setApiErrors({ general: 'Ocurrió un error desconocido.' });
          }
        },
        onSuccess: () => {
          setApiErrors({});
          // continuar con la navegación u otros pasos
        },
      }
    );
  };

  useEffect(() => {
    if (step === 2) {
      refetch();
    }
  }, [step, refetch]);

  useEffect(() => {
    if (isSuccess) {
      console.log('Navigating with:', { registered: true, name, username });
      navigation.replace('Login', { registered: true, name, username });
    }
  }, [isSuccess]);

  return (
    <View style={tw`flex-1 justify-center px-8 `}>
      <Ionicons
        name={randomIcon}
        size={600}
        color="white"
        style={{
          position: 'absolute',
          top: 100,
          left: 60,
          opacity: 0.09, // Nivel de transparencia
          zIndex: 0,
        }}
      />

      <Text style={tw`text-3xl font-bold text-center text-white mb-2`}>Crear cuenta</Text>


      <Text style={tw`text-base text-center text-gray-300 mb-8`}>
        {step === 0 && 'Crea tu usuario'}
        {step === 1 && 'Escribe tu nombre'}
        {step === 2 && 'Ingresa tu teléfono y país'}
        {step === 3 && 'Crea una clave de 4 números'}
      </Text>

      {step === 0 && (

        <AuthInput
          placeholder="Crea un nombre de usuario único"
          value={username}
          onChangeText={setUsername}
        />
      )}

      {step === 1 && (
        <AuthInput
          placeholder="¿Cual es tu nombre?"
          value={name}
          onChangeText={setName}
        />
      )}

      {step === 2 && (
        <View style={tw``}>
          <View style={tw`mb-4`}>
            <View style={tw`bg-gray-800 rounded-xl`}>
              <Picker
                selectedValue={country}
                onValueChange={setCountry}
                style={tw`text-white px-2 py-2`}
              >
                {countries?.map(c => (
                  <Picker.Item key={c.id} label={`${c.name} (${c.code})`} value={String(c.id)} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={tw`mb-4`}>
            <AuthInput
              keyboardType="phone-pad"
              placeholder="¿Como es tu número de celular?"
              value={cellphone}
              onChangeText={setCellphone}
            />
          </View>
        </View>
      )}

      {step === 3 && (
        <>
          <PinInput pin={pin} setPin={setPin} />
          {/* Checkbox términos y condiciones */}
          <TermsCheckbox
            checked={acceptedTerms}
            setChecked={setAcceptedTerms}
          />
        </>
      )}
      <View>
        <AuthButton
          title={
            step < 3
              ? isCheckingUsername
                ? 'Validando...'
                : 'Siguiente paso'
              : isPending
                ? 'Registrando...'
                : 'Registrarme'
          }
          icon={<Ionicons name="arrow-forward" size={20} color="#fff" />}
          onPress={step < 3 ? handleNext : handleRegister}
          disabled={step < 3 ? isCheckingUsername : isPending}
        />

        {step > 0 ? (
          <TouchableOpacity onPress={handleBack}>
            <Text style={tw`text-center text-gray-400 text-sm`}>← Volver</Text>
          </TouchableOpacity>
        ) : <View />}
      </View>

      <View style={tw`flex-row justify-center mt-6 mb-4`}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={tw.style(
              'w-3 h-3 rounded-full mx-1',
              step === i ? 'bg-blue-400' : 'bg-gray-500 opacity-50'
            )}
          />
        ))}
      </View>

      {isSuccess && <Text style={tw`text-green-500 text-center mt-4`}>¡Registro exitoso!</Text>}
      {/* {error && <Text style={tw`text-red-500 text-center mt-4`}>Error: {JSON.stringify(error)}</Text>} */}

      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={tw`mt-6`}>
        <Text style={tw`text-center text-gray-200`}>
          ¿Ya tienes cuenta? <Text style={tw`text-blue-400 font-bold`}>Inicia sesión</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterScreen;