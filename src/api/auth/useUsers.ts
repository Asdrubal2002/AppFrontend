import { useEffect, useState } from "react";
import axiosInstance from "./axiosInstance";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAccessToken } from "../../utils/authStorage";
import { Alert } from "react-native";

export const useEditUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await axiosInstance.patch('auth/user/edit/', data);
      return response.data.user;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['userProfile'], data);
    },
    onError: (error) => {
      const errors = error.response?.data;
      if (errors) {
        const messages = Object.entries(errors)
          .map(([field, msgs]) => `• ${msgs.join('\n• ')}`)
          .join('\n\n');

        Alert.alert('Error al actualizar', messages);
      } else {
        Alert.alert('Error', error.message || 'Ocurrió un error inesperado');
      }
    },
  });
};

//Verificar si se esta autenticado.
export const useAuthStatus = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getAccessToken();
      setIsAuthenticated(!!token);
      setLoading(false);
    };

    checkAuth();
  }, []);

  return { isAuthenticated, loading };
};

const fetchFollowedStores = async ({ pageParam = 1, categoryId = null }) => {
  const params = new URLSearchParams();
  params.append('page', pageParam);
  if (categoryId) {
    params.append('category', categoryId);
  }
  const res = await axiosInstance.get(`auth/stores/followed/?${params.toString()}`);
  return res.data;
};


export const useFollowedStores = (categoryId) => {
  return useInfiniteQuery({
    queryKey: ['followed-stores', categoryId],
    queryFn: ({ pageParam = 1 }) => fetchFollowedStores({ pageParam, categoryId }),
    getNextPageParam: (lastPage) => {
      if (lastPage.next) {
        const url = new URL(lastPage.next);
        return url.searchParams.get('page');
      }
      return undefined;
    },
    select: (data) => {
      const allStores = data.pages.flatMap((page) => page.results);
      const categories = data.pages[0]?.categories || [];
      return { stores: allStores, categories };
    },
  });
};


export const useUserCarts = () => {
  return useQuery({
    queryKey: ['userCarts'],
    queryFn: async () => {
      try {
        const token = await getAccessToken();
        console.log("Token usado:", token); // Verifica que el token no sea null
        
        const res = await axiosInstance.get('cart/user-carts/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("Respuesta completa:", {
          status: res.status,
          headers: res.headers,
          data: res.data // ¿Llega el array aquí?
        });
        
        if (!Array.isArray(res.data)) {
          throw new Error("La respuesta no es un array");
        }
        
        return res.data;
      } catch (error) {
        console.error("Error en useUserCarts:", {
          message: error.message,
          code: error.code,
          response: error.response?.data
        });
        throw error;
      }
    },
  });
};

export const useUserCart = (id: number | string) => {
  return useQuery({
    queryKey: ['userCart', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/cart/user-carts/${id}/`);
      return response.data;
    },
    enabled: !!id, // solo ejecuta si hay un ID válido
  });
};