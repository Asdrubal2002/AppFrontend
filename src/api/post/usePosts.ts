import { useState } from "react";
import { getAccessToken } from "../../utils/authStorage";
import axiosInstance from "../auth/axiosInstance";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { updateChecklistField } from "../../utils/cache/checklistStorage";

/** 📝 Posts de una store */
export const useStorePosts = (storeId) => {
  return useInfiniteQuery({
    queryKey: ['storePosts', storeId],
    queryFn: async ({ pageParam = 1 }) => {
      const token = await getAccessToken();

      const res = await axiosInstance.get(`/modules/store/${storeId}/posts/`, {
        params: { page: pageParam },
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {}, // Si no hay token, hace la petición igual
      });

      return res.data;
    },
    enabled: !!storeId,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    
  });
};

export const useToggleLike = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleLike = async (postId) => {
    setLoading(true);
    setError(null);

    try {
      const token = await getAccessToken();

      if (!token) {
        console.log('Usuario no autenticado. No se puede dar like.');
        return null;
      }

      const res = await axiosInstance.post(`/modules/toggle-like/${postId}/`);
      return res.data; // { is_liked: true, likes: 5 }
    } catch (err) {
      setError(err);
      console.error('Error toggling like:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { toggleLike, loading, error };
};

export const usePostComments = (postId, enabled = true) => {
  return useInfiniteQuery({
    queryKey: ['postComments', postId],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axiosInstance.get(
        `/modules/comments/posts/${postId}/`,
        { params: { page: pageParam } }
      );
      return { ...res.data, currentPage: pageParam };
    },
    enabled: !!postId && enabled, // ahora depende también de `enabled`
    getNextPageParam: (lastPage) =>
      lastPage.next ? lastPage.currentPage + 1 : undefined,
    getPreviousPageParam: (firstPage) =>
      firstPage.previous ? firstPage.currentPage - 1 : undefined,
  });
};

export const useCreatePost = () => {
  return useMutation({
    mutationFn: async (data: {
      store_id: string;
      title?: string;
      content?: string;
    }) => {
      const response = await axiosInstance.post('modules/create/post/', data);
      return response.data;
    },
    onSuccess: async () => {
      // ✅ Marca como completado el paso de publicar por primera vez
      await updateChecklistField('firstPostCreated', true);
    },

    onError: (error) => {
      console.error('Error al crear el post:', error.response?.data || error.message);
    },
  });
};

export const useUploadPostMedia = () => {
  return useMutation({
    mutationFn: async (data: {
      post_id: string;
      store_slug: string;
      files: Array<{ uri: string; type: string; name: string }>;
    }) => {
      const formData = new FormData();
      
      // Agregar campos simples
      formData.append('post_id', data.post_id);
      formData.append('store_slug', data.store_slug);

      // Procesar cada archivo
      await Promise.all(
        data.files.map(async (file) => {
          // Para Android/iOS necesitamos convertir la URI a un formato especial
          const fileInfo = {
            uri: file.uri,
            type: file.type,
            name: file.name,
          };

          // Agregar como parte del FormData
          formData.append('files', JSON.parse(JSON.stringify(fileInfo)));
        })
      );

      const response = await axiosInstance.post('modules/posts/media-upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
        transformRequest: () => formData, // Importante para RN
      });

      return response.data;
    },
  });
};

export const useEditPost = () => {
  return useMutation({
    mutationFn: async (data: {
      post_id: string;
      title?: string;
      content?: string;
    }) => {
      const { post_id, ...payload } = data;
      const response = await axiosInstance.patch(
        `modules/post/${post_id}/edit/`,
        payload
      );
      return response.data;
    },
  });
};

export const useDeletePost = () => {
  return useMutation({
    mutationFn: async (post_id: string) => {
      const response = await axiosInstance.delete(
        `modules/posts/delete/${post_id}/`
      );
      return response.data;
    },
  });
};

// Hook para borrar media
export const useDeletePostMedia = () => {
  return useMutation({
    mutationFn: async ({ post_id, media_url }: { post_id: string; media_url: string }) => {
      const response = await axiosInstance.delete('modules/delete-media/post/', {
        params: { post_id, media_url },
      });
      return response.data;
    },
  });
};

//Validar para reutilizar el codigo y teener menos lineas
export const useCreateComment = (postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { post_id: string; content: string }) => {
      const response = await axiosInstance.post('modules/create/comment/', data);
      return response.data.comment; // <- sólo regresamos el comentario
    },
    onSuccess: (newComment) => {
      queryClient.setQueryData(['postComments', postId], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: [
            {
              ...oldData.pages[0],
              results: [newComment, ...oldData.pages[0].results],
            },
            ...oldData.pages.slice(1),
          ],
        };
      });
    },
  });
};

export const useLikedPosts = () => {
  return useInfiniteQuery({
    queryKey: ['likedPosts'],
    queryFn: async ({ pageParam = 1 }) => {
      const token = await getAccessToken();

      const res = await axiosInstance.get('/modules/posts/liked/', {
        params: { page: pageParam },
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
      });

      return res.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });
};

/** 🧠 Posts recomendados */
export const useRecommendedPosts = () => {
  return useInfiniteQuery({
    queryKey: ['recommendedPosts'],
    queryFn: async ({ pageParam = 1 }) => {
      const token = await getAccessToken();

      const res = await axiosInstance.get('/modules/posts/recommended/', {
        params: { page: pageParam },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      return res.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });
};

export const usePublicPosts = () => {
  return useInfiniteQuery({
    queryKey: ['publicPosts'],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axiosInstance.get('/modules/posts/public/', {
        params: { page: pageParam },
      });

      return res.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });
};
