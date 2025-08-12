import React, { useState } from 'react';
import {
    View,
    Text,
    ActivityIndicator,
    Alert,
} from 'react-native';
import tw from 'twrnc';
import { useCreatePost, useDeletePost, useEditPost, useUploadPostMedia } from '../../../../../api/post/usePosts';
import { StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AuthInput from '../../../../../reusable_components/AuthInput';
import AuthButton from '../../../../../reusable_components/AuthButton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../../../../../theme';
import UploadMediaModal from '../../../../../reusable_components/UploadMediaModal';
import HeaderBar from '../../../../../reusable_components/HeaderBar';

interface PostCreatorProps {
    onDone?: () => void;
}

const PostCreator = ({ onDone }: PostCreatorProps) => {

    const navigation = useNavigation();
    const route = useRoute();
    const { storeId } = route.params as { storeId: string };
    const [submitting, setSubmitting] = useState(false);

    // Estados simplificados
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
    const [createdPostId, setCreatedPostId] = useState<string | null>(null);
    const [createdPostSlug, setCreatedPostSlug] = useState<string | null>(null);
    const [showUploadModal, setShowUploadModal] = useState(false);

    // Hooks de mutación
    const { mutate: createPost } = useCreatePost();
    const { mutate: uploadMedia, isPending: uploadingMedia } = useUploadPostMedia();
    const { mutate: deletePost } = useDeletePost();



    const handleSubmit = async () => {
        if (!title) {
            Alert.alert('Título', 'Debes ingresar un título a tu publicación');
            return;
        }

        if (title.length > 100) {
            Alert.alert('Título', 'El título no puede tener más de 100 caracteres');
            return;
        }

        if (content.length > 500) {
            Alert.alert('Contenido', 'El contenido no puede tener más de 500 caracteres');
            return;
        }

        setSubmitting(true);
        const payload = { title, content };

        const onSuccess = (data) => {
            setCreatedPostId(data._id);
            setCreatedPostSlug(data.store_slug);
            setShowUploadModal(true); // Mostrar modal de medios
            setSubmitting(false);
        };

        const onError = (err) => {
            console.log('Error al guardar el post:', err?.response?.data || err.message);
            Alert.alert('Error', 'No se pudo guardar el post');
            setSubmitting(false);
        };

        createPost({ store_id: storeId, ...payload }, { onSuccess, onError });
    };



    const handleUploadComplete = async (files: any[]) => {
        if (!createdPostId || !createdPostSlug) {
            Alert.alert('Error', 'Falta información del post');
            return;
        }

        setSubmitting(true);

        try {
            // Preparar archivos con nombres únicos
            const preparedFiles = files.map(file => ({
                uri: file.uri,
                type: file.type || 'image/jpeg',
                name: file.fileName || `post_media_${Date.now()}.${file.type?.split('/')[1] || 'jpg'}`
            }));

            await uploadMedia({
                post_id: createdPostId,
                store_slug: createdPostSlug,
                files: preparedFiles
            }, {
                onSuccess: (response) => {
                    console.log('Media subida:', response);
                    Alert.alert('Éxito', 'Medios subidos correctamente');
                    navigation.replace('PostList', { storeId });
                    onDone?.();
                },
                onError: (error) => {
                    console.error('Error subiendo media:', {
                        status: error.response?.status,
                        data: error.response?.data,
                        message: error.message
                    });
                    Alert.alert('Error', 'No se pudieron subir los medios');
                }
            });
        } catch (error) {
            console.error('Error inesperado:', error);
            Alert.alert('Error', 'Ocurrió un error inesperado');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <HeaderBar title="Agregar mi publicidad" />
            <View style={tw`flex-1 p-6 justify-center `}>

                <Ionicons
                    name="aperture"
                    size={550}
                    color="white"
                    style={{
                        position: 'absolute',
                        top: 100,
                        left: 60,
                        opacity: 0.07, // Nivel de transparencia
                        zIndex: 0,
                    }}
                />
                <View style={tw``}>
                    {/* Formulario de título y contenido */}
                    <View style={tw`flex-row items-center mb-4`}>
                        <Text style={tw`text-white text-lg`}>Comparte tu contenido</Text>
                    </View>
                    <AuthInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Ej: ¡Nueva colección Otoño 2023! 🍂"
                    />
                    <Text style={tw`text-gray-100 text-lg mb-3`}>Contenido de tu post</Text>
                    <AuthInput
                        value={content}
                        onChangeText={setContent}
                        placeholder="Describe el contenido de tu publicación. Puedes compartir novedades, promociones o mensajes para tus clientes."
                        multiline
                        numberOfLines={5}
                    />
                </View>

                {/* Botón de creación */}
                <View style={[tw`absolute bottom-6 left-6 right-6`]}>
                    <AuthButton
                        title={submitting ? 'Creando post...' : 'Crear publicación'}
                        icon={<Ionicons name="arrow-forward" size={20} color="#fff" />}
                        onPress={handleSubmit}
                        disabled={submitting}
                    />
                </View>


                {/* Modal de subida de medios */}
                <UploadMediaModal
                    visible={showUploadModal}
                    onClose={() => {
                        setShowUploadModal(false);
                        navigation.replace('PostList', { storeId });
                    }}
                    onSubmit={handleUploadComplete}
                    isUploading={uploadingMedia}
                />

                {submitting && (
                    <View style={[StyleSheet.absoluteFill, tw`bg-black bg-opacity-40 justify-center items-center`]}>
                        <View style={tw`bg-white rounded-xl p-6 items-center shadow-lg`}>
                            <ActivityIndicator size="large" color={COLORS.BlueWord} />
                            <Text style={tw`text-gray-700 mt-4 text-lg`}>
                                {showUploadModal ? 'Subiendo medios...' : 'Creando post...'}
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        </>

    );
};

export default PostCreator;