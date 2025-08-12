// src/screens/UserProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TextInput, Alert, Platform, TouchableOpacity } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import tw from 'twrnc';
import { getUserProfile } from '../../api/auth/authApi';
import { logoutUser } from '../../utils/logout';
import { getAccessToken, getIsSeller } from '../../utils/authStorage';
import AuthButton from '../../reusable_components/AuthButton';
import { useCountries, useCities, useNeighborhoods } from '../../api/store/useStores';
import { useEditUserProfile } from '../../api/auth/useUsers';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Feather'; // Feather o cualquier otra
import FullScreenLoader from '../../reusable_components/FullScreenLoader';
import AuthInput from '../../reusable_components/AuthInput';


const UserProfileScreen = () => {
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [editName, setEditName] = useState(false); // Controla visibilidad del input
  const [editLastName, setEditLastName] = useState(false);
  const [editMail, setEditMail] = useState(false);
  // Estados de edición
  const [editCountry, setEditCountry] = useState(false);
  const [editCity, setEditCity] = useState(false);
  const [editNeighborhood, setEditNeighborhood] = useState(false);
  const [editDOB, setEditDOB] = useState(false);

  const [editGender, setEditGender] = useState(false);
  const [editAddress, setEditAddress] = useState(false);
  const [editDocumentNumber, setEditDocumentNumber] = useState(false);

  const [isSeller, setIsSeller] = useState<boolean | null>(null);

  // Función auxiliar para encontrar nombre por ID
  const getNameById = (arr, id) => arr?.find(item => item.id === id)?.name || 'Sin seleccionar';

  // Forzamos la carga de países al montar el componente
  const {
    data: countries,
    refetch: fetchCountries
  } = useCountries();

  // Cargamos países al montar el componente
  useEffect(() => {
    if (isAuthenticated) {
      fetchCountries();
    }
  }, [isAuthenticated]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['userProfile'],
    queryFn: getUserProfile,
    enabled: isAuthenticated === true,
  });


  useEffect(() => {
    const checkSellerStatus = async () => {
      const sellerStatus = await getIsSeller();
      setIsSeller(sellerStatus);
    };

    checkSellerStatus();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getAccessToken();
      setIsAuthenticated(!!token);
    };
    checkAuth();
  }, []);

  // Estados del formulario
  const [form, setForm] = useState({
    name: '',
    last_name: '',
    username: '',
    cellphone: '',
    email: '',
    country: null,
    city: null,
    neighborhood: null,
    date_of_birth: '',
    gender: '',
    document_number: '',
    address: ''
  });

  // Actualiza el estado local al cargar datos
  useEffect(() => {
    if (data) {
      const dob = data.date_of_birth ? new Date(data.date_of_birth) : new Date();
      setSelectedDate(dob);

      setForm({
        name: data.name || '',
        last_name: data.last_name || '',
        username: data.username || '',
        cellphone: data.cellphone || '',
        email: data.email || '',
        country: data.country || null,
        city: data.city || null,
        neighborhood: data.neighborhood || null,
        date_of_birth: data.date_of_birth || '',
        gender: data.gender || '',
        document_number: data.document_number || '',
        address: data.address || '',
      });
    }
  }, [data]);

  // Hooks para selectores
  const { data: cities } = useCities(form.country);
  const { data: neighborhoods } = useNeighborhoods(form.city);

  // Configuración de la mutación
  const mutation = useEditUserProfile();

  // Manejo del DateTimePicker
  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toISOString().split('T')[0];
      setForm({ ...form, date_of_birth: formattedDate });
    }
  };

  // Función para limpiar datos
  const cleanData = (data: typeof form) => {
    const cleaned: Partial<typeof form> = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleaned[key as keyof typeof form] = value;
      }
    });
    return cleaned;
  };

  const handleSubmit = () => {
    const payload = cleanData(form);
    console.log('Datos que enviarás para editar perfil:', payload);

    mutation.mutate(payload, {
      onSuccess: () => {
        setEditName(false);
        setEditLastName(false);
        setEditMail(false);
        setEditCountry(false);
        setEditCity(false);
        setEditNeighborhood(false);
        setEditDOB(false);
        setEditGender(false);
        setEditDocumentNumber(false);
        setEditAddress(false);

        Alert.alert(
          'Perfil actualizado',
          'Tus cambios se guardaron correctamente',
          [{ text: 'OK' }]
        );
      },
      onError: (error) => {
        const errors = error.response?.data;

        if (errors && typeof errors === 'object') {
          const messages = Object.entries(errors)
            .map(([_, msgs]) => `• ${msgs.join('\n• ')}`)
            .join('\n\n');

          Alert.alert('Error al actualizar', messages, [{ text: 'OK' }]);
        } else {
          Alert.alert(
            'Error',
            error.response?.data?.message || 'Ocurrió un error al actualizar el perfil',
            [{ text: 'OK' }]
          );
        }
      }
    });
  };


  if (isAuthenticated === null) {
    return <FullScreenLoader />;
  }

  if (!isAuthenticated) {
    return (
      <View style={tw`flex-1 justify-center p-6`}>
        <Text style={tw`text-xl font-bold text-center mb-6`}>No has iniciado sesión</Text>
        <View style={tw`space-y-4`}>
          <AuthButton
            title="Iniciar sesión"
            onPress={() => navigation.navigate('Login')}
          />
          <AuthButton
            title="Registrarse"
            onPress={() => navigation.navigate('Register')}
            secondary
          />
        </View>
      </View>
    );
  }

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (isError) {
    return (
      <View style={tw`flex-1 justify-center items-center p-6`}>
        <Text style={tw`text-lg text-red-500 mb-4`}>Error cargando perfil</Text>
        <Text style={tw`text-gray-600 mb-4`}>{error.message}</Text>
        <AuthButton
          title="Reintentar"
          onPress={() => queryClient.refetchQueries(['userProfile'])}
        />
      </View>
    );
  }

  return (
    <ScrollView style={tw`flex-grow p-6`}>
      <Text style={tw`text-xl mb-6 text-white`}>Editar Perfil</Text>

      {/* Campos del formulario nombre */}
      <View style={tw`mb-4 py-3`}>
        <View style={tw`flex-row justify-between items-center mb-2`}>
          <Text style={tw`text-gray-200 font-semibold`}>
            Nombre <Text style={tw`text-gray-400 text-sm`}>(opcional)</Text>
          </Text>

          {!isSeller && (
            <TouchableOpacity
              onPress={() => setEditName(!editName)}
              style={tw`flex-row items-center`}
            >
              <Icon name={editName ? 'x' : 'edit'} size={16} color="#60A5FA" />
              <Text style={tw`text-blue-400 ml-1`}>
                {editName ? 'Cancelar' : 'Editar'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {!editName ? (
          <View style={tw`bg-gray-800 p-3 rounded-md`}>
            <Text style={tw`text-base text-gray-300`}>
              {form.name?.trim() || 'Sin nombre'}
            </Text>
          </View>
        ) : (
          <AuthInput
            editable={!isSeller}
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
            placeholder="Escribe tu nombre"
            autoFocus
          />
        )}
      </View>


      <View style={tw`mb-4 py-3`}>
        <View style={tw`flex-row justify-between items-center mb-2`}>
          <Text style={tw`text-gray-200 font-semibold`}>
            Apellido <Text style={tw`text-gray-400 text-sm`}>(opcional)</Text>
          </Text>

          {!isSeller && (
            <TouchableOpacity
              onPress={() => setEditLastName(!editLastName)}
              style={tw`flex-row items-center`}
            >
              <Icon name={editLastName ? 'x' : 'edit'} size={16} color="#60A5FA" />
              <Text style={tw`text-blue-400 ml-1`}>{editLastName ? 'Cancelar' : 'Editar'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {!editLastName ? (
          <View style={tw`bg-gray-800 p-3 rounded-md`}>
            <Text style={tw`text-base text-gray-300`}>{form.last_name?.trim() || 'Sin apellido'}</Text>
          </View>
        ) : (
          <AuthInput
            value={form.last_name}
            onChangeText={(text) => setForm({ ...form, last_name: text })}
            placeholder="Escribe tu apellido"
            autoFocus
          />
        )}
      </View>



      <View style={tw`mb-4 py-3`}>
        <View style={tw`flex-row justify-between items-center mb-2`}>
          <Text style={tw`text-gray-200 font-semibold`}>
            Correo electrónico <Text style={tw`text-gray-400 text-sm`}>(opcional)</Text>
          </Text>

          <TouchableOpacity
            onPress={() => setEditMail(!editMail)}
            style={tw`flex-row items-center`}
          >
            <Icon name={editMail ? 'x' : 'edit'} size={16} color="#60A5FA" />
            <Text style={tw`text-blue-400 ml-1`}>{editMail ? 'Cancelar' : 'Editar'}</Text>
          </TouchableOpacity>
        </View>

        {!editMail ? (
          <View style={tw`bg-gray-800 p-3 rounded-md`}>
            <Text style={tw`text-base text-gray-300`}>{form.email || 'Sin correo electrónico'}</Text>
          </View>
        ) : (



          <AuthInput
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
            placeholder="correo@ejemplo.com"
            autoFocus
          />
        )}
      </View>



      {/* Campos del formulario nombre */}
      <View style={tw`mb-4 py-3`}>
        <View style={tw`flex-row justify-between items-center mb-2`}>
          <Text style={tw`text-gray-200 font-semibold`}>
            Número de identificación <Text style={tw`text-gray-400 text-sm`}>(opcional)</Text>
          </Text>

          {!isSeller && (
            <TouchableOpacity
              onPress={() => setEditDocumentNumber(!editDocumentNumber)}
              style={tw`flex-row items-center`}
            >
              <Icon name={editDocumentNumber ? 'x' : 'edit'} size={16} color="#60A5FA" />
              <Text style={tw`text-blue-400 ml-1`}>{editDocumentNumber ? 'Cancelar' : 'Editar'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {!editDocumentNumber ? (
          <View style={tw`bg-gray-800 p-3 rounded-md`}>
            <Text style={tw`text-base text-gray-300`}>
              {form.document_number || 'Sin número de identificación'}
            </Text>
          </View>
        ) : (
          <AuthInput
            value={form.document_number}
            onChangeText={(text) => setForm({ ...form, document_number: text })}
            placeholder="123456789"
            autoFocus
          />
        )}
      </View>


      {/* Selector de País, PERO NO FUNCIONA PORQUE NO ESTA REGISTRADO EN EL BACKEND PARA CAMBIO, PRIMERO MIRA EL NEGICIO, SI LO CAMBIO O NO*/}
      {/* <View style={tw`mb-4`}>
        <View style={tw`flex-row justify-between items-center mb-2`}>
          <Text style={tw`text-gray-400 font-medium`}>País</Text>
          <TouchableOpacity onPress={() => setEditCountry(!editCountry)}>
            <Icon name={editCountry ? "x" : "edit"} size={20} color="#4B5563" />
          </TouchableOpacity>
        </View>

        {!editCountry ? (
          <View style={tw`p-3 rounded-lg `}>
            <Text style={tw`text-base text-gray-300`}>
              {getNameById(countries, form.country)}
            </Text>
          </View>
        ) : (
          <View style={tw`rounded-lg border border-gray-300 overflow-hidden`}>
            <Picker
              selectedValue={form.country}
              onValueChange={(value) => {
                setForm({ ...form, country: value, city: null, neighborhood: null });
              }}
            >
              <Picker.Item label="Seleccione país" value={null} />
              {countries?.map((country) => (
                <Picker.Item key={country.id} label={country.name} value={country.id} />
              ))}
            </Picker>
          </View>
        )}
      </View> */}

      {/* Selector de Ciudad */}
      <View style={tw`mb-4 py-3`}>
        <View style={tw`flex-row justify-between items-center mb-2`}>
          <Text style={tw`text-gray-200 font-semibold`}>
            Ciudad <Text style={tw`text-gray-400 text-sm`}>(opcional)</Text>
          </Text>

          <TouchableOpacity
            onPress={() => setEditCity(!editCity)}
            disabled={!form.country}
            style={tw`flex-row items-center`}
          >
            <Icon name={editCity ? 'x' : 'edit'} size={16} color={form.country ? "#60A5FA" : "#9CA3AF"} />
            <Text style={tw`text-blue-400 ml-1`}>
              {editCity ? 'Cancelar' : 'Editar'}
            </Text>
          </TouchableOpacity>
        </View>

        {!editCity ? (
          <View style={tw`bg-gray-800 p-3 rounded-md`}>
            <Text style={tw`text-base text-gray-300`}>
              {form.country ? getNameById(cities, form.city) : "Seleccione país primero"}
            </Text>
          </View>
        ) : (
          <View style={tw`rounded-lg border border-blue-400 overflow-hidden`}>
            <Picker
              selectedValue={form.city}
              onValueChange={(value) => {
                setForm({ ...form, city: value, neighborhood: null });
              }}
              enabled={!!form.country}
              style={tw`text-gray-300`}
            >
              <Picker.Item label="Seleccione ciudad" value={null} />
              {cities?.map((city) => (
                <Picker.Item key={city.id} label={city.name} value={city.id} />
              ))}
            </Picker>
          </View>
        )}
      </View>

      {/* Selector de Barrio */}
      <View style={tw`mb-4 py-3`}>
        <View style={tw`flex-row justify-between items-center mb-2`}>
          <Text style={tw`text-gray-200 font-semibold`}>
            Barrio <Text style={tw`text-gray-400 text-sm`}>(opcional)</Text>
          </Text>

          <TouchableOpacity
            onPress={() => setEditNeighborhood(!editNeighborhood)}
            disabled={!form.city}
            style={tw`flex-row items-center`}
          >
            <Icon name={editNeighborhood ? 'x' : 'edit'} size={16} color={form.city ? "#60A5FA" : "#9CA3AF"} />
            <Text style={tw`text-blue-400 ml-1`}>
              {editNeighborhood ? 'Cancelar' : 'Editar'}
            </Text>
          </TouchableOpacity>
        </View>

        {!editNeighborhood ? (
          <View style={tw`bg-gray-800 p-3 rounded-md`}>
            <Text style={tw`text-base text-gray-300`}>
              {form.city ? getNameById(neighborhoods, form.neighborhood) : "Seleccione ciudad primero"}
            </Text>
          </View>
        ) : (
          <View style={tw`rounded-lg border border-blue-400 overflow-hidden`}>
            <Picker
              selectedValue={form.neighborhood}
              onValueChange={(value) => setForm({ ...form, neighborhood: value })}
              enabled={!!form.city}
            >
              <Picker.Item label="Seleccione barrio" value={null} />
              {neighborhoods?.map((neighborhood) => (
                <Picker.Item key={neighborhood.id} label={neighborhood.name} value={neighborhood.id} />
              ))}
            </Picker>
          </View>
        )}
      </View>

      {/* Selector de Fecha de Nacimiento */}
      <View style={tw`mb-4 py-3`}>
        <View style={tw`flex-row justify-between items-center mb-2`}>
          <Text style={tw`text-gray-200 font-semibold`}>
            Fecha de nacimiento <Text style={tw`text-gray-400 text-sm`}>(opcional)</Text>
          </Text>

          <TouchableOpacity
            onPress={() => setEditDOB(!editDOB)}
            style={tw`flex-row items-center`}
          >
            <Icon name={editDOB ? 'x' : 'edit'} size={16} color="#60A5FA" />
            <Text style={tw`text-blue-400 ml-1`}>
              {editDOB ? 'Cancelar' : 'Editar'}
            </Text>
          </TouchableOpacity>
        </View>

        {!editDOB ? (
          <View style={tw`bg-gray-800 p-3 rounded-md`}>
            <Text style={tw`text-base text-gray-300`}>
              {form.date_of_birth || 'Sin seleccionar'}
            </Text>
          </View>
        ) : (
          <>
            <AuthInput
              value={form.date_of_birth}
              onFocus={() => setShowDatePicker(true)}
              placeholder="YYYY-MM-DD"
              autoFocus
            />
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}

            {Platform.OS === 'android' && !showDatePicker && (
              <AuthButton
                title="Seleccionar otra fecha"
                onPress={() => setShowDatePicker(true)}
                style={tw`mt-2`}
                secondary
              />
            )}
          </>
        )}
      </View>

      {/* Selector de Género */}
      <View style={tw`mb-4 py-3`}>
        <View style={tw`flex-row justify-between items-center mb-2`}>
          <Text style={tw`text-gray-200 font-semibold`}>
            Género <Text style={tw`text-gray-400 text-sm`}>(opcional)</Text>
          </Text>

          <TouchableOpacity
            onPress={() => setEditGender(!editGender)}
            style={tw`flex-row items-center`}
          >
            <Icon name={editGender ? 'x' : 'edit'} size={16} color="#60A5FA" />
            <Text style={tw`text-blue-400 ml-1`}>
              {editGender ? 'Cancelar' : 'Editar'}
            </Text>
          </TouchableOpacity>
        </View>

        {!editGender ? (
          <View style={tw`bg-gray-800 p-3 rounded-md`}>
            <Text style={tw`text-base text-gray-300`}>
              {{
                M: 'Masculino',
                F: 'Femenino',
                O: 'Otro',
                '': 'No seleccionado',
              }[form.gender]}
            </Text>
          </View>
        ) : (
          <View style={tw`rounded-lg border border-blue-400 overflow-hidden`}>
            <Picker
              selectedValue={form.gender}
              onValueChange={(value) => setForm({ ...form, gender: value })}
            >
              <Picker.Item label="Seleccione género" value="" />
              <Picker.Item label="Masculino" value="M" />
              <Picker.Item label="Femenino" value="F" />
              <Picker.Item label="Otro" value="O" />
            </Picker>
          </View>
        )}
      </View>


      <View style={tw`mb-4 py-3`}>
        <View style={tw`flex-row justify-between items-center mb-2`}>
          <Text style={tw`text-gray-200 font-semibold`}>
            Dirección <Text style={tw`text-gray-400 text-sm`}>(opcional)</Text>
          </Text>

          <TouchableOpacity
            onPress={() => setEditAddress(!editAddress)}
            style={tw`flex-row items-center`}
          >
            <Icon name={editAddress ? 'x' : 'edit'} size={16} color="#60A5FA" />
            <Text style={tw`text-blue-400 ml-1`}>
              {editAddress ? 'Cancelar' : 'Editar'}
            </Text>
          </TouchableOpacity>
        </View>

        {!editAddress ? (
          <View style={tw`bg-gray-800 p-3 rounded-md`}>
            <Text style={tw`text-base text-gray-300`}>
              {form.address || 'Sin dirección'}
            </Text>
          </View>
        ) : (
          <AuthInput
            value={form.address}
            onChangeText={(text) => setForm({ ...form, address: text })}
            placeholder="Escribe tu dirección"
            autoFocus
          />

        )}
      </View>


      <View style={tw`mb-6`}>
        <AuthButton
          title={mutation.isLoading ? 'Actualizando...' : 'Actualizar datos'}
          onPress={handleSubmit}
          disabled={mutation.isLoading}
          loading={mutation.isLoading}
        />
      </View>
      {/* Botón de Guardar */}



    </ScrollView>
  );
};

export default UserProfileScreen;