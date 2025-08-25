import React, { useState } from 'react';
import { View, Text, Alert, Platform, PermissionsAndroid, Linking } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Geolocation from '@react-native-community/geolocation';
import tw from 'twrnc';
import AuthInput from '../../../../../reusable_components/AuthInput';
import AuthButton from '../../../../../reusable_components/AuthButton';
import { useGetCurrentLocation } from '../../../../../utils/useGetCurrentLocation';

interface Props {
  storeData: any;
  setStoreData: React.Dispatch<React.SetStateAction<any>>;
  countries: { id: number; name: string }[] | undefined;
  cities: { id: number; name: string }[] | undefined;
  neighborhoods: { id: number; name: string }[] | undefined;
}

const LocationStep = ({
  storeData,
  setStoreData,
  countries,
  cities,
  neighborhoods,
}: Props) => {
  const { requestLocation, isLocating } = useGetCurrentLocation();

  const getCurrentLocation = () => {
    requestLocation({
      permissionMessage: 'Necesitamos acceder a tu ubicación para registrar la tienda.',
      onSuccess: ({ latitude, longitude }) =>
        setStoreData((prev) => ({ ...prev, latitude, longitude })),
    });
  };

  return (
    <View style={tw`p-4 rounded-2xl shadow-lg`}>
      <Text style={tw`text-white text-2xl font-bold`}>Datos geográficos</Text>

      <View style={tw`p-2 m-2`}>
        <Text style={tw`text-gray-300 text-sm mb-4`}>
          Selecciona el país, ciudad y barrio donde se encuentra tu negocio. Luego, ingresa la dirección manualmente.{"\n\n"}
          También puedes usar el botón para obtener tu ubicación actual mediante GPS.
        </Text>
      </View>

      <View style={tw`bg-gray-800 rounded-xl`}>
        <Picker
          selectedValue={storeData.country}
          onValueChange={(val) =>
            setStoreData((prev) => ({
              ...prev,
              country: val,
              city: '',
              neighborhood: '',
            }))
          }
        >
          <Picker.Item label="Selecciona el país" value="" />
          {countries?.map((c) => (
            <Picker.Item key={c.id} label={c.name} value={String(c.id)} />
          ))}
        </Picker>
      </View>

      <View style={tw`bg-gray-800  rounded-xl mt-4`}>
        <Picker
          selectedValue={storeData.city}
          onValueChange={(val) =>
            setStoreData((prev) => ({
              ...prev,
              city: val,
              neighborhood: '',
            }))
          }
        >
          <Picker.Item label="Selecciona la ciudad" value="" />
          {cities?.map((c) => (
            <Picker.Item key={c.id} label={c.name} value={String(c.id)} />
          ))}
        </Picker>
      </View>

      <View style={tw`bg-gray-800  rounded-xl my-4`}>
        <Picker
          selectedValue={storeData.neighborhood}
          onValueChange={(val) =>
            setStoreData((prev) => ({
              ...prev,
              neighborhood: val,
            }))
          }
        >
          <Picker.Item label="Selecciona el barrio" value="" />
          {neighborhoods?.map((n) => (
            <Picker.Item key={n.id} label={n.name} value={String(n.id)} />
          ))}
        </Picker>
      </View>

      <AuthInput
        placeholder="Dirección, para saber dónde encontrarte."
        value={storeData.address}
        onChangeText={(val) =>
          setStoreData((prev) => ({ ...prev, address: val }))
        }
      />

      <View style={tw``}>
        <AuthButton
          title={
            isLocating
              ? 'Espera estamos obteniendo ubicación...'
              : storeData.latitude && storeData.longitude
                ? 'Ubicación obtenida'
                : 'Obtener ubicación actual'
          }
          onPress={getCurrentLocation}
          disabled={isLocating}
          buttonStyle={
            storeData.latitude && storeData.longitude
              ? tw`bg-green-600`
              : undefined
          }
        />
      </View>
    </View>
  );
};

export default LocationStep;
