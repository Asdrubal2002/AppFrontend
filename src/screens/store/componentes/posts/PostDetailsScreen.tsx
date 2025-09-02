import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { useRoute } from '@react-navigation/native';
import axiosInstance from '../../../../api/auth/axiosInstance';
import tw from 'twrnc';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PostItem from '../../../../reusable_components/PostItem';



const PostDetailsScreen = () => {
    const route = useRoute();
    const { postId } = route.params as { postId: string; };

    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [videoPaths, setVideoPaths] = useState({});

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axiosInstance.get(`modules/post/${postId}/`);
                setPost(response.data);
            } catch (error) {
                console.error('Error al obtener el post:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [postId]);

    if (loading) {
        return (
            <View style={tw`flex-1 justify-center items-center`}>
                <ActivityIndicator size="large" color="#000" />
                <Text style={tw`mt-2`}>Cargando post...</Text>
            </View>
        );
    }

    if (!post) {
        return (
            <View style={tw`flex-1 justify-center items-center`}>
                <Text>No se encontró el post.</Text>
            </View>
        );
    }

    return (
        <ScrollView
            contentContainerStyle={tw``}
            style={tw`flex-1`}
        >
            <PostItem
                item={post}
                postIndex={0}
                visiblePostIndex={0} // ya cumple visiblePostIndex === postIndex
                
            />
        </ScrollView>
    );

};

export default PostDetailsScreen;
