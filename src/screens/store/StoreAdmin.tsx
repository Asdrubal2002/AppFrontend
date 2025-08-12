import {
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Linking
} from 'react-native';
import { useMyStore, useUploadStoreMedia } from '../../api/store/useStores';
import tw from 'twrnc';
import { useEffect, useState } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../../theme';
import { formatTime12h } from '../../api/reusable_funciones';
import { WebView } from 'react-native-webview';
import FullScreenLoader from '../../reusable_components/FullScreenLoader';
import { generateLeafletHTML } from '../../reusable_components/generateLeafletHTML';
import { useNavigation } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { updateChecklistField } from '../../utils/cache/checklistStorage';
import { API_BASE_URL, DEFAULT_BANNER_BASE64, DEFAULT_LOGO_BASE64 } from '../../constants';
import HeaderBar from '../../reusable_components/HeaderBar';



const dayNames = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
};

const dayTranslation = {
  Monday: 'Lunes',
  Tuesday: 'Martes',
  Wednesday: 'Miércoles',
  Thursday: 'Jueves',
  Friday: 'Viernes',
  Saturday: 'Sábado',
  Sunday: 'Domingo',
};

const StoreAdmin = () => {
  const { data: store, isLoading, error } = useMyStore();
  const [logo, setLogo] = useState(null);
  const [banner, setBanner] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigation = useNavigation();

  const uploadMutation = useUploadStoreMedia(store?.slug);

  const displayImage = banner?.uri || logo?.uri || store?.banner || store?.logo;

  // Permisos de galería
  const requestGalleryPermission = async () => {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    }
    return true;
  };

  const pickImage = async (type) => {
    const hasPermission = await requestGalleryPermission();

    if (!hasPermission) {
      Alert.alert('Permiso denegado', 'No se puede acceder a la galería');
      return;
    }

    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) => {
      if (response.didCancel || response.errorCode) {
        console.log('Cancelado o error:', response.errorMessage);
        return;
      }

      const asset = response.assets?.[0];
      if (!asset) {
        console.log('No asset seleccionado');
        return;
      }

      const file = {
        uri: asset.uri,
        type: asset.type,
        name: asset.fileName || `${type}.jpg`,
      };

      console.log('Imagen seleccionada:', file);

      type === 'logo' ? setLogo(file) : setBanner(file);
    });
  };

  const upload = () => {
    if (!logo && !banner) {
      Alert.alert('Nada para subir', 'Selecciona un logo o banner primero.');
      return;
    }

    uploadMutation.mutate({ logo, banner }, {
      onSuccess: async () => {
        if (logo) await updateChecklistField('logoUploaded', true);
        if (banner) await updateChecklistField('bannerUploaded', true);
      },
      onError: () => {
        Alert.alert('Error', 'No se pudo subir la imagen. Intenta de nuevo.');
      }
    });
  };


  useEffect(() => {
    if (uploadMutation.isSuccess) {
      setShowSuccess(true);
      const timeout = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [uploadMutation.isSuccess]);


  const downloadAndSaveQR = async (imageUrl) => {
    try {
      // 1. Verificar si la URL existe
      if (!imageUrl) {
        Alert.alert('Error', 'No hay código QR disponible para guardar');
        return;
      }

      // 2. Manejo de permisos para Android
      if (Platform.OS === 'android') {
        const apiLevel = Platform.constants.Version;
        let permission;

        if (apiLevel >= 33) {
          permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
        } else {
          permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
        }

        const granted = await PermissionsAndroid.request(permission);
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Permiso requerido',
            'Necesitas conceder permisos para guardar imágenes',
            [
              { text: 'Abrir configuración', onPress: () => Linking.openSettings() },
              { text: 'Cancelar', style: 'cancel' }
            ]
          );
          return;
        }
      }

      // 3. Descargar la imagen primero
      const fileName = `QR_${store?.name || 'Tienda'}_${Date.now()}.jpg`;
      const downloadPath = `${RNFS.PicturesDirectoryPath}/${fileName}`;

      const download = RNFS.downloadFile({
        fromUrl: imageUrl,
        toFile: downloadPath,
      });

      const result = await download.promise;

      // 4. Guardar en galería (método alternativo si CameraRoll falla)
      if (result.statusCode === 200) {
        if (result.statusCode === 200) {
          try {
            // Guardamos en galería con CameraRoll en cualquier plataforma
            await CameraRoll.save(downloadPath, { type: 'photo' });
            Alert.alert('✅ QR guardado', 'Se guardó en tu galería de fotos');
          } catch (saveError) {
            console.log('Error al guardar en CameraRoll:', saveError);
            Alert.alert(
              '⚠️ Guardado parcial',
              `Se descargó en: ${downloadPath}, pero no se agregó a la galería automáticamente.`
            );
          }
        } else {
          throw new Error(`Error al descargar: código ${result.statusCode}`);
        }

      } else {
        throw new Error(`Error al descargar: código ${result.statusCode}`);
      }
    } catch (error) {
      console.error('Error completo:', error);
      Alert.alert(
        '❌ Error',
        error.message || 'No se pudo guardar el QR. Intenta nuevamente.'
      );
    }
  };


  const onCancelUpload = () => {
    setLogo(null);
    setBanner(null);
  };



  if (isLoading) return <FullScreenLoader />;
  if (error) return <Text>Error al cargar la tienda.</Text>;
  if (!store) return <Text>No tienes una tienda registrada.</Text>;

  const html = generateLeafletHTML({
    store: {
      name: store.name,
      latitude: store.latitude,
      longitude: store.longitude,
    }
  });

  return (
    <>
      <HeaderBar title="Mi Negocio" />
      <ScrollView contentContainerStyle={tw`p-4 flex-grow`}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Tiendas', {
              screen: 'CreateStore',
              params: {
                mode: 'edit',
                storeId: store.id,
                initialData: store,
              },
            });
          }}
          style={tw`absolute top-4 right-4 flex-row items-center px-3 py-2 bg-gray-800 rounded-xl z-10`}
        >
          <Ionicons name="create-outline" size={18} color="#fff" style={tw`mr-2`} />
          <Text style={tw`text-white font-semibold`}>Actualizar datos de mi negocio</Text>
        </TouchableOpacity>
        {/* Banner */}

        <TouchableOpacity onPress={() => pickImage('banner')} activeOpacity={0.8}>
          <View style={tw`h-48 rounded-xl overflow-hidden mb-4 relative`}>
            <Image
              source={{
                uri: banner?.uri
                  ? banner.uri
                  : store?.banner
                    ? `${API_BASE_URL}${store.banner}`
                    : DEFAULT_BANNER_BASE64,
              }}
              style={tw`w-full h-full`}
              resizeMode="cover"
            />

            {/* Mostrar solo si NO hay preview ni imagen existente */}
            {!banner?.uri && !store?.banner && (
              <View
                style={tw`absolute inset-0 bg-black bg-opacity-30 justify-center items-center`}
              >
                <View style={tw`items-center`}>
                  <Text style={tw`text-white text-base text-center`}>
                    Agrega una foto de la entrada de tu negocio.
                  </Text>
                </View>

              </View>
            )}
          </View>
        </TouchableOpacity>


        {/* Logo | Estado | QR (alineados en fila) */}
        <View style={tw`flex-row items-center justify-between px-4 -mt-14 mb-5`}>

          {/* Logo circular */}
          <TouchableOpacity
            onPress={() => pickImage('logo')}
            activeOpacity={0.8}
            style={tw`w-20 h-20 rounded-full border-2 bg-gray-200 overflow-hidden relative`}
          >
            <Image
              source={{
                uri: logo?.uri
                  ? logo.uri
                  : store?.logo
                    ? `${API_BASE_URL}${store.logo}`
                    : DEFAULT_LOGO_BASE64,
              }}
              style={tw`w-full h-full`}
              resizeMode="cover"
            />
            {/* Mostrar solo si NO hay preview ni imagen existente */}
            {!logo?.uri && !store?.logo && (
              <View
                style={tw`absolute inset-0 bg-black bg-opacity-30 justify-center items-center rounded-full`}
              >
                <Text style={tw`text-white text-xs text-center leading-4`}>
                  Agrega{'\n'}tu logo
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Estado */}
          <View style={tw`flex-row items-center bg-black px-3 py-2 rounded-lg`}>
            <Text style={tw`font-semibold text-gray-100 mr-2`}>Estado:</Text>
            <Text style={tw.style('font-semibold', store.is_active ? 'text-green-400' : 'text-red-600')}>
              {store.is_active ? 'Activo' : 'Inactivo'}
            </Text>
          </View>

          {/* Botón QR */}
          <TouchableOpacity
            onPress={() => downloadAndSaveQR(store?.qr_code)}
            style={tw`flex-row items-center px-3 py-2 bg-black rounded-lg`}
            activeOpacity={0.8}
          >
            <Text style={tw`text-white font-semibold text-sm`}>Descargar </Text>
            <Ionicons name="qr-code" size={18} color="white" style={tw`mr-1`} />
          </TouchableOpacity>
        </View>

        {(logo || banner) && !uploadMutation.isSuccess && (
          <View style={tw`flex-row justify-between items-center`}>

            {/* Botón subir imágenes */}
            <TouchableOpacity
              onPress={upload}
              activeOpacity={0.85}
              style={[
                tw`flex-row items-center justify-center px-4 py-3 rounded-xl shadow-lg flex-1 mr-2`,
                {
                  backgroundColor: COLORS.BlueWord,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 5,
                },
              ]}
              disabled={uploadMutation.isLoading}
            >
              {uploadMutation.isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="cloud-upload" size={20} color="#fff" style={tw`mr-2`} />
                  <Text style={tw`text-white text-base`}>
                    Guardar presentación
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Botón cancelar */}
            <TouchableOpacity
              onPress={onCancelUpload} // Debes definir esta función para limpiar el estado de logo y banner
              activeOpacity={0.85}
              style={tw`px-4 py-3 bg-gray-200 rounded-xl items-center justify-center`}
            >
              <Text style={tw`text-red-600 `}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Mensaje de éxito */}
        {uploadMutation.isSuccess && (
          <TouchableOpacity
            onPress={() => navigation.navigate('PanelStore')}
            activeOpacity={0.9}
            style={tw`mt-4 bg-green-600 px-4 py-3 rounded-xl`}
          >
            <View style={tw`flex-row items-center mb-2`}>
              <Ionicons name="checkmark-circle-outline" size={22} color="#fff" style={tw`mr-2`} />
              <Text style={tw`text-white font-semibold`}>
                ¡Tus imágenes se subieron correctamente!
              </Text>
            </View>

            <View style={tw`items-center`}>
              <Text style={tw`text-white font-medium`}>Volver al panel principal</Text>
            </View>
          </TouchableOpacity>

        )}

        {/* Mensaje de error */}
        {uploadMutation.isError && (
          <View style={tw`flex-row items-center mt-4 bg-red-100 px-4 py-2 rounded-lg`}>
            <Ionicons name="alert-circle-outline" size={22} color="red" style={tw`mr-2`} />
            <Text style={tw`text-red-800 font-medium`}>Hubo un error al subir las imágenes.</Text>
          </View>
        )}

        {/* Contenedor principal */}
        <View style={tw`rounded-2xl p-5 shadow-lg `}>

          {/* Cabecera: Nombre y verificación */}
          <View style={tw`flex-row justify-between items-center mb-4 `}>
            <Text style={tw`text-2xl font-bold text-gray-100`}>{store.name}</Text>
            <View
              style={tw.style(
                'px-3 py-1 rounded-full',
                store.is_verified ? 'bg-green-100' : 'bg-red-100'
              )}
            >
              <Text style={tw.style(
                'text-xs font-semibold',
                store.is_verified ? 'text-green-700' : 'text-red-700'
              )}>
                {store.is_verified ? 'Verificada' : 'No verificada'}
              </Text>
            </View>
          </View>

          {/* Descripción corta */}
          {store.description && (
            <Text style={tw`text-sm mb-4 leading-relaxed text-gray-300`}>
              {store.description}
            </Text>
          )}

          {/* Sección: Información empresarial */}
          <View style={tw`border-t border-gray-200 pt-4 mt-2`}>
            <Text style={tw`text-lg font-semibold  mb-3 text-gray-100`}>
              Información de empresa
            </Text>

            <View style={tw`mb-2`}>
              <Text style={tw`text-xs text-white `}>NIT</Text>
              <Text style={tw`text-sm text-gray-300`}>{store.nit}</Text>
            </View>

            <View style={tw`mb-2`}>
              <Text style={tw`text-xs text-white `}>Razón social</Text>
              <Text style={tw`text-sm text-gray-300`}>{store.legal_name}</Text>
            </View>
          </View>

          {/* Sección: Ubicación */}
          <View style={tw`border-t border-gray-200 pt-4 mt-2`}>
            <Text style={tw`text-lg font-semibold  mb-3 text-gray-100`}>
              Ubicación
            </Text>

            <View style={tw`mb-2`}>
              <Text style={tw`text-xs text-white `}>Dirección</Text>
              <Text style={tw`text-sm text-gray-300`}>{store.address}</Text>
            </View>

            <View style={tw`mb-2`}>
              <Text style={tw`text-xs text-white `}>Localidad</Text>
              <Text style={tw`text-sm text-gray-300`}>
                {store.country_name} - {store.city_name} - {store.neighborhood_name}
              </Text>
            </View>
          </View>

          {/* Sección: Mapa */}
          {store?.latitude && (
            <View style={tw`border-t border-gray-200 pt-4 mt-4`}>
              <Text style={tw`text-lg font-semibold  mb-2 text-gray-100`}>
                Ubicación geográfica
              </Text>
              <View style={tw`h-64 rounded-xl overflow-hidden shadow-md`}>
                <WebView
                  originWhitelist={['*']}
                  source={{ html }}
                  javaScriptEnabled
                  domStorageEnabled
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          )}

          {/* Sección: Horarios */}
          <View style={tw`border-t border-gray-200 pt-4 mt-4`}>
            <Text style={tw`text-lg font-semibold  mb-2 text-gray-100`}>
              Horarios de atención
            </Text>

            {store.schedules?.length ? (
              store.schedules.map(({ day, open_time, close_time }, i) => {
                const englishDay = dayNames[day] || day;
                const translatedDay = dayTranslation[englishDay] || englishDay;
                return (
                  <View key={i} style={tw`flex-row justify-between mb-1`}>
                    <Text style={tw`capitalize text-sm w-28`}>
                      {translatedDay}
                    </Text>
                    <Text style={tw`text-sm text-gray-300`}>
                      {formatTime12h(open_time)} - {formatTime12h(close_time)}
                    </Text>
                  </View>
                );
              })
            ) : (
              <Text style={tw`text-sm text-gray-400`}>
                No hay horarios disponibles
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default StoreAdmin;
