// hooks/useAddToCart.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../auth/axiosInstance';

type AddToCartPayload = {
  store_id: number;
  product_id: string;
  sku: string;
  quantity: number;
  selected_options: Record<string, string>;
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AddToCartPayload) => {
      const res = await axiosInstance.post('/cart/cart/', payload);
      return res.data; // Cart actualizado
    },
    onSuccess: (data) => {
      console.log('🛒 Carrito actualizado:', data);
      // Si estás usando react-query para el cart, puedes hacer un refetch:
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      console.error('❌ Error al agregar al carrito:', error.response?.data || error.message);
    },
  });
};


type AddComboPayload = {
  combo_id: number;
  quantity: number;
  skus: {
    [productId: string]: string; // product_id: sku
  };
};

export const useAddComboToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const res = await axiosInstance.post('/cart/add-combo/', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

