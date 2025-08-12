import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import tw from 'twrnc';

const TermsCheckbox = ({
  checked,
  setChecked,
  warning = true,
  message = 'para continuar.',
}: {
  checked: boolean;
  setChecked: (val: boolean) => void;
  warning?: boolean;
  message?: string;
}) => {
  const navigation = useNavigation();

  return (
    <View style={tw`mt-4 mb-6`}>
      <TouchableOpacity
        style={tw`flex-row items-start`}
        onPress={() => setChecked(!checked)}
        activeOpacity={0.8}
      >
        <View
          style={tw.style(
            'w-5 h-5 mt-1 mr-3 border rounded items-center justify-center',
            checked ? 'bg-blue-400 border-blue-500' : 'border-gray-400'
          )}
        >
          {checked && (
            <Ionicons name="checkmark" size={14} color="#fff" />
          )}
        </View>

        <Text style={tw`text-gray-300 flex-1`}>
          Debes aceptar los{' '}
          <Text
            style={tw`text-blue-400 underline`}
            onPress={() => navigation.navigate('TermsScreen')}
          >
            términos y condiciones
          </Text>{' '}
          y la{' '}
          <Text
            style={tw`text-blue-400 underline`}
            onPress={() => navigation.navigate('PrivacyScreen')}
          >
            política de privacidad
          </Text>{' '}
          {message}
        </Text>
      </TouchableOpacity>

      {!checked && warning && (
        <Text style={tw`text-red-500 text-sm mt-2`}>
          ⚠️ Acepta los términos para poder continuar.
        </Text>
      )}
    </View>
  );
};

export default TermsCheckbox;
