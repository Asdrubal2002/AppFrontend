import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loginUser } from '../../api/auth/authApi';
import { saveTokens } from '../../utils/authStorage';
import { useNavigation, useRoute } from '@react-navigation/native';
import tw from 'twrnc';
import PinInput from './components/PinInput';
import AuthInput from '../../reusable_components/AuthInput';
import AuthButton from '../../reusable_components/AuthButton';
import * as Keychain from 'react-native-keychain';
import ReactNativeBiometrics from 'react-native-biometrics';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRandomIcon } from '../../utils/hooks/useRandomIcon';


const rnBiometrics = new ReactNativeBiometrics();

const LoginScreen = () => {
  const randomIcon = useRandomIcon();

  const [username, setUsername] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [hasStoredCredentials, setHasStoredCredentials] = useState(false);
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const [step, setStep] = useState(1);
  const inputs = useRef([]);
  const route = useRoute();
  const { registered, name, username: registeredUsername } = route.params || {};



  useEffect(() => {
    if (registeredUsername) {
      setUsername(registeredUsername);
    }
  }, [registeredUsername]);


  // Verificar soporte biométrico y credenciales al cargar
  useEffect(() => {
    const checkBiometrics = async () => {
      try {
        const { available } = await rnBiometrics.isSensorAvailable();
        setIsBiometricAvailable(available);

        if (available) {
          const credentials = await Keychain.getAllGenericPasswordServices();
          setHasStoredCredentials(credentials.length > 0);
        }
      } catch (error) {
        console.error('Error checking biometric support:', error);
      }
    };

    checkBiometrics();
  }, []);

  // Login con huella digital (solo por botón)
  const handleBiometricLogin = async () => {
    try {
      const credentialsList = await Keychain.getAllGenericPasswordServices();
      if (credentialsList.length === 0) return;

      const lastUser = credentialsList[0];
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Inicia sesión con tu huella'
      });

      if (success) {
        const credentials = await Keychain.getGenericPassword({ service: lastUser });
        if (credentials) {
          setUsername(lastUser);
          mutation.mutate({ username: lastUser, password: credentials.password });
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Autenticación fallida');
    }
  };


  // Registrar huella después de login exitoso
  const registerBiometrics = async () => {
    try {
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Registra tu huella para próximos accesos'
      });

      if (success) {
        await Keychain.setGenericPassword(username, pin.join(''), {
          service: username,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
          authenticationType: Keychain.AUTHENTICATION_TYPE.BIOMETRICS
        });
        setHasStoredCredentials(true);
      }
    } catch (error) {
      console.log('Registro de huella cancelado');
    }
  };

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: async (data) => {
      await saveTokens(data.access, data.refresh);
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });

      // Ofrecer registro de huella solo si no existe
      if (isBiometricAvailable && !hasStoredCredentials) {
        Alert.alert(
          'Login exitoso',
          '¿Deseas registrar tu huella para próximos accesos?',
          [
            { text: 'No', style: 'cancel' },
            { text: 'Sí', onPress: registerBiometrics }
          ]
        );
      }

      navigation.reset({
        index: 0,
        routes: [{ name: 'Tiendas' }],
      });
    },
    onError: (error: any) => {
      Alert.alert('Error de login', error?.response?.data?.detail || 'Algo salió mal');
    },
  });

  const handleLogin = () => {
    if (pin.some(d => d === '')) {
      Alert.alert('Falta la clave', 'Por favor ingresa los 4 números de la contraseña');
      return;
    }
    const password = pin.join('');
    mutation.mutate({ username, password });
  };

  return (
    <View style={tw`flex-1 justify-center px-8`}>
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
      {registered && (
        <View style={tw`bg-blue-800/40 border border-blue-900 rounded-xl p-5 mb-10 mx-4 shadow-md`}>
          <Text style={tw`text-white text-center font-semibold text-lg`}>
            ¡Registro exitoso!
          </Text>
          <Text style={tw`text-green-200 text-center mt-2`}>
            <Text style={tw`font-bold text-white`}>{name}</Text>
          </Text>
          <Text style={tw`text-blue-300 text-center mt-1`}>
            Inicia sesión y descubre todo lo que tenemos para ti. 🌟
          </Text>
        </View>
      )}
      <Text style={tw`text-3xl font-semibold text-center text-white mb-2`}>Iniciar sesión</Text>

      <Text style={tw`text-base text-center text-gray-400 mb-8 `}>
        {step === 1 ? 'Ingresa tu usuario' : 'Ingresa tu clave de 4 números'}
      </Text>

      {step === 1 && (
        <>
          <AuthInput
            placeholder="Escribe tu usuario"
            value={username}
            onChangeText={setUsername}
          />
          <AuthButton
            title="Siguiente: Ingresar clave"
            icon={<Ionicons name="arrow-forward" size={20} color="#fff" />}
            onPress={() => {
              if (username.trim() === '') {
                Alert.alert('Error', 'Por favor ingresa tu nombre de usuario');
                return;
              }
              setStep(2);
              setTimeout(() => inputs.current[0]?.focus(), 200);
            }}
          />
        </>
      )}

      {step === 2 && (
        <>
          <PinInput pin={pin} setPin={setPin} />
          <AuthButton
            title="Ingresar a mi cuenta"
            icon={<Ionicons name="enter-outline" size={20} color="#fff" />}
            onPress={handleLogin}
          />
          <TouchableOpacity onPress={() => setStep(1)}>
            <Text style={tw`text-center text-gray-400 text-sm`}>← Volver</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={tw`mt-6`}>
        {isBiometricAvailable && hasStoredCredentials && (
          <TouchableOpacity
            onPress={handleBiometricLogin}
            style={tw`mb-6 items-center justify-center pb-1 self-center`}
          >
            <Ionicons
              name="finger-print"
              size={40}
            />
            <Text style={tw`text-xs mt-1`}>Usar huella</Text>
          </TouchableOpacity>
        )}

        <Text style={tw`text-center text-gray-200`}>
          ¿No tienes una cuenta? <Text style={tw`text-blue-400 font-bold`}>Regístrate aquí</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;