// UploadMediaModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Video from 'react-native-video';
import { launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';

const { width: screenWidth } = Dimensions.get('window');

const UploadMediaModal = ({
  visible,
  onClose,
  onSubmit, // ⬅️ función que recibirá los archivos al presionar subir
  isUploading, // ⬅️ estado de carga externo
  maxFiles = 5, // ⬅️ valor por defecto si no se pasa
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (files: any[]) => void;
  isUploading: boolean;
}) => {
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);

  const pickMedia = async () => {
    launchImageLibrary(
      {
        mediaType: 'mixed',
        selectionLimit: maxFiles,
        quality: 1,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Error al seleccionar archivos');
          return;
        }
        if (response.assets) {
          setSelectedFiles(response.assets);
        }
      }
    );
  };

  const handleRemove = (uri: string) => {
    setSelectedFiles((prev) => prev.filter((item) => item.uri !== uri));
  };

  const handleUpload = () => {
    if (!selectedFiles.length) {
      Alert.alert('Atención', 'Por favor selecciona al menos un archivo');
      return;
    }
    onSubmit(selectedFiles); // ⬅️ devolvemos al padre
  };

  const renderItem = ({ item }) => {
    const isImage = item.type?.startsWith('image/');
    const isVideo = item.type?.startsWith('video/');

    return (
      <View style={tw`relative items-center justify-center mx-2`}>
        <View style={[tw`rounded-2xl overflow-hidden bg-gray-800`, 
          { width: screenWidth - 40, height: screenWidth - 40 }]}>
          {isImage ? (
            <Image source={{ uri: item.uri }} style={tw`w-full h-full`} resizeMode="contain" />
          ) : isVideo ? (
            <Video
              source={{ uri: item.uri }}
              style={tw`w-full h-full`}
              resizeMode="contain"
              muted
              repeat
              controls
            />
          ) : (
            <View style={tw`flex-1 items-center justify-center bg-gray-800`}>
              <Text style={tw`text-white`}>Archivo no soportado</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={() => handleRemove(item.uri)}
          style={tw`absolute top-4 right-4 bg-red-500/90 p-2 rounded-full`}
        >
          <Ionicons name="trash-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="fade">
      <View style={tw`flex-1 bg-gray-100 dark:bg-gray-900`}>
        <View style={tw`flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700`}>
          <Text style={tw`text-xl font-bold text-gray-900 dark:text-white`}>Subir medios</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close-outline" size={24} color={tw.color('gray-500 dark:gray-300')} />
          </TouchableOpacity>
        </View>

        <View style={tw`flex-1 p-4`}>
          {selectedFiles.length > 0 ? (
            <>
              <FlatList
                data={selectedFiles}
                keyExtractor={(item) => item.uri}
                horizontal
                pagingEnabled
                renderItem={renderItem}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={tw`pb-4`}
              />

              <View style={tw`flex-row justify-between mt-4`}>
                <TouchableOpacity
                  onPress={pickMedia}
                  style={tw`flex-row items-center justify-center bg-blue-500 rounded-lg py-3 px-6 flex-1 mr-2`}
                >
                  <Ionicons name="image-outline" size={20} color="white" style={tw`mr-2`} />
                  <Text style={tw`text-white font-medium`}>Agregar más</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleUpload}
                  style={tw`flex-row items-center justify-center bg-green-600 rounded-lg py-3 px-6 flex-1 ml-2`}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={20} color="white" style={tw`mr-2`} />
                      <Text style={tw`text-white font-medium`}>
                        Subir {selectedFiles.length} archivo{selectedFiles.length !== 1 ? 's' : ''}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={tw`flex-1 items-center justify-center`}>
              <TouchableOpacity
                onPress={pickMedia}
                style={tw`items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl w-full`}
              >
                <View style={tw`bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full mb-4`}>
                  <Ionicons name="cloud-upload-outline" size={40} color={tw.color('blue-500 dark:blue-400')} />
                </View>
                <Text style={tw`text-lg font-medium text-gray-900 dark:text-white mb-1`}>
                  Selecciona imágenes o videos
                </Text>
                <Text style={tw`text-gray-500 dark:text-gray-400 text-center`}>
                  Comparte contenido con tus clientes
                </Text>
                <Text style={tw`text-sm text-gray-400 dark:text-gray-500 mt-2`}>
                  Máximo {maxFiles} archivos
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default UploadMediaModal;
