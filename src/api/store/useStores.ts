import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAccessToken, saveIsSeller } from '../../utils/authStorage';
import { navigate } from '../../utils/navigation';
import axiosInstance from '../auth/axiosInstance';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { updateChecklistField } from '../../utils/cache/checklistStorage';


const fetchStores = async ({ pageParam = 1, queryKey }) => {
  const [, filters] = queryKey;

  const params = {
    page: pageParam,
    search: filters.search || '',
  };

  // Filtros comunes
  if (filters.countryId) params.country = filters.countryId;
  if (filters.cityId) params.city = filters.cityId;
  if (filters.neighborhoodId) params.neighborhood = filters.neighborhoodId;
  if (filters.categoryId) params.category = filters.categoryId;

  // Si hay coordenadas, usar endpoint geolocalizado
  const endpoint = filters.lat && filters.lon ? 'store/stores/geo/' : 'store/minimal/';

  if (filters.lat && filters.lon) {
    params.lat = filters.lat;
    params.lon = filters.lon;
  }

  const res = await axiosInstance.get(endpoint, { params });
  return res.data;
};

export const useStores = (filters) => {
  return useInfiniteQuery({
    queryKey: ['stores', filters],
    queryFn: fetchStores,
    getNextPageParam: (lastPage) => {
      if (lastPage.next) {
        const match = lastPage.next.match(/page=(\d+)/);
        return match ? match[1] : undefined;
      }
      return undefined;
    }
    ,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};

/** 🌍 PAISES */
export const useCountries = () => {
  return useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const res = await axiosInstance.get('location/countries/');
      return res.data;
    },
    enabled: false, // No se ejecuta automáticamente
  });
};

/** 🏙️ CIUDADES */
export const useCities = (countryId) => {
  return useQuery({
    queryKey: ['cities', countryId],
    queryFn: async () => {
      if (!countryId) return [];
      const res = await axiosInstance.get(`location/cities/?country=${countryId}`);
      return res.data || []; // <-- importante
    },
    enabled: !!countryId, // solo se ejecuta si hay país
  });
};

/** 🏘️ BARRIOS */
export const useNeighborhoods = (cityId) => {
  return useQuery({
    queryKey: ['neighborhoods', cityId],
    queryFn: async () => {
      if (!cityId) return [];
      const res = await axiosInstance.get(`location/neighborhoods/?city=${cityId}`);
      return res.data || []; // <-- importante
    },
    enabled: !!cityId, // solo si hay ciudad
  });
};

//Obtener las categorias de las tiendas.
export const useCategories = (options = {}) => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await axiosInstance.get('store/categories/');
      return res.data;
    },
    enabled: options.enabled ?? true, // default true para que no cambie comportamiento
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};

/** 🏪 Detalle de tienda */
export const useStoreDetail = (slug) => {
  return useQuery({
    queryKey: ['storeDetail', slug],
    queryFn: async () => {
      const res = await axiosInstance.get(`store/store/${slug}/`);
      return res.data;
    },
    enabled: !!slug, // evita correr sin slug
  });
};

/** ⭐ Obtener reviews paginados de una tienda con paginación infinita */
export const useStoreReviews = (storeId) => {
  return useInfiniteQuery({
    queryKey: ['storeReviews', storeId],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axiosInstance.get(`store/${storeId}/reviews/`, {
        params: { page: pageParam },
      });
      return res.data;
    },
    enabled: !!storeId,
    getNextPageParam: (lastPage) => {
      if (lastPage.next && typeof lastPage.next === 'string') {
        const url = new URL(lastPage.next);
        const nextPage = url.searchParams.get('page');
        return nextPage ? Number(nextPage) : undefined;
      }
      return undefined;
    },
  });
};

//Crear una tienda
export const useCreateStore = () => {
  return useMutation({
    mutationFn: async (storeData) => {
      const res = await axiosInstance.post('store/create/', storeData);
      return res.data;
    },
    onSuccess: async (data) => {
      try {
        // Actualizar directamente is_seller en el storage
        await saveIsSeller(true);

        // Guardar bandera para mostrar tutorial
        await AsyncStorage.setItem('shouldShowStoreTutorial', 'true');

        // Navegar al panel de administración de tienda
        navigate('Tiendas', {
          screen: 'PanelStore',
          params: {},
        });
      } catch (error) {
        console.error('Error al actualizar is_seller:', error);
      }
    },

    onError: (error) => {
      console.error("Error creando la tienda", error);
      // Mostrar mensaje de error
    }
  });
};

/** 🏪 Hook para obtener la tienda del usuario autenticado */
export const useMyStore = () => {
  return useQuery({
    queryKey: ['myStore'],
    queryFn: async () => {
      const res = await axiosInstance.get('store/my-store/');
      return res.data;
    },
    // enabled: true by default, porque no depende de ningún parámetro
  });
};

/** 📊 Hook para obtener las estadísticas de la tienda del usuario autenticado */
export const useStoreStats = (enabled = true) => {
  return useQuery({
    queryKey: ['storeStats'],
    queryFn: async () => {
      const res = await axiosInstance.get('store/stats/');
      return res.data;
    },
    enabled // Permite controlar cuándo se ejecuta
  });
};


/** 📤 Hook para subir logo y/o banner de una tienda */
export const useUploadStoreMedia = (slug: string) => {
  return useMutation({
    mutationFn: async (files: { logo?: any; banner?: any }) => {
      const formData = new FormData();

      if (files.logo) {
        formData.append('logo', {
          uri: files.logo.uri,
          type: files.logo.type,
          name: files.logo.name,
        });
      }

      if (files.banner) {
        formData.append('banner', {
          uri: files.banner.uri,
          type: files.banner.type,
          name: files.banner.name,
        });
      }

      const response = await axiosInstance.patch(
        `store/${slug}/upload-media/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    },
  });
};

export const useUpdateStore = (storeId: number) => {
  return useMutation({
    mutationFn: async (storeData: any) => {
      const res = await axiosInstance.patch(`store/${storeId}/edit/`, storeData);
      return res.data;
    },
    onSuccess: (data) => {
      navigate('Tiendas', {
        screen: 'PanelStore',
        params: {},
      });
    },
    onError: (error) => {
      console.error('Error actualizando la tienda:', error);
    },
  });
};

/** Obtener métodos de envío según la ubicación del usuario y el store */
export const useShippingMethodsFromUserLocation = (storeId) => {
  return useQuery({
    queryKey: ['shippingMethodsFromUserLocation', storeId],
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) {
        console.log('🔒 Usuario no autenticado. No se consulta métodos de envío.');
        return []; // o puedes lanzar un error si prefieres
      }

      const res = await axiosInstance.get('/store/user-location/', {
        params: { store_id: storeId },
        headers: { Authorization: `Bearer ${token}` },
      });

      return res.data.shipping_methods;
    },
    enabled: !!storeId, // Solo se ejecuta si hay storeId
    staleTime: 5 * 60 * 1000, // evita que se vuelva a ejecutar durante 5 minutos
  });
};

/** Obtener métodos de pago de la tienda */
export const useStorePaymentMethods = (storeId, enabled = true) => {
  return useQuery({
    queryKey: ['storePaymentMethods', storeId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/store/payment-methods/?store_id=${storeId}`);
      return res.data.payment_methods;
    },
    enabled: !!storeId && enabled,
  });
};

export const useStoreCombos = (storeId: number | string) => {
  return useInfiniteQuery({
    queryKey: ['storeCombos', storeId],
    queryFn: async ({ pageParam = 1 }) => {
      const token = await getAccessToken();

      const res = await axiosInstance.get(`store/stores/${storeId}/combos/`, {
        params: { page: pageParam },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      return res.data;
    },
    enabled: !!storeId,
    getNextPageParam: (lastPage) => {
      if (lastPage.next) return lastPage.page + 1;
      return undefined;
    },
  });
};

export const useCreateCombo = () => {
  return useMutation({
    mutationFn: async (comboData) => {
      const res = await axiosInstance.post('store/create-combo/', comboData);
      return res.data;
    },
  });
};

export const useUploadComboImage = () => {
  return useMutation({
    mutationFn: async ({ comboId, imageFile }) => {
      const formData = new FormData();

      // Estructura correcta para React Native
      formData.append('image', {
        uri: imageFile.uri,       // URI local del archivo
        name: imageFile.fileName || `combo_${comboId}.jpg`,  // Nombre del archivo
        type: imageFile.type || 'image/jpeg'  // Tipo MIME
      });

      const res = await axiosInstance.post(
        `store/combos/${comboId}/upload-media/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return res.data;
    },
  });
};

export const useDeleteCombo = () => {
  return useMutation({
    mutationFn: async (comboId) => {
      const res = await axiosInstance.delete(`store/combos/${comboId}/delete/`);
      return res.data;
    },
  });
};


export const useComboDetail = (comboId) => {
  return useQuery({
    queryKey: ['comboDetail', comboId],
    queryFn: async () => {
      const res = await axiosInstance.get(`store/combo/${comboId}/`);
      return res.data;
    },
    enabled: !!comboId, // solo si hay comboId
  });
};


export const useShippingZones = (storeId: number | string) => {
  return useQuery({
    queryKey: ['shippingZones', storeId],
    queryFn: async () => {
      const response = await axiosInstance.get(`store/shipping-zones/?store=${storeId}`);
      return response.data;
    },
    enabled: !!storeId,
  });
};

export const useCreateShippingZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      store: number;
      country: string | null;
      city: string | null;
      neighborhood?: string | null;
    }) => {
      const response = await axiosInstance.post('/store/shipping-zones/', data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        ['shippingZones', variables.store],
        (oldData: any) => [...(oldData || []), data]
      );
    },
    onError: (error: any) => {
      if (error.response && error.response.data) {
        const data = error.response.data;

        if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
          Alert.alert('Error al guardar', data.non_field_errors.join('\n'));
          return;
        }

        const message = Object.entries(data)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join('\n');

        Alert.alert('Error al guardar', message);
      } else {
        Alert.alert('Error inesperado', 'No se pudo guardar la zona.');
      }
    },
  });
};

export const useDeleteShippingZone = (storeId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shippingZoneId: number) => {
      await axiosInstance.delete(`/store/shipping-zones/${shippingZoneId}/`);
    },
    onSuccess: (_, shippingZoneId) => {
      // Actualización optimista + invalidación de la query
      queryClient.setQueryData(['shippingZones', storeId], (oldData: any) =>
        oldData?.filter((zone: any) => zone.id !== shippingZoneId) || []
      );

      Alert.alert('Éxito', 'Zona eliminada correctamente');
    },
    onError: (error: any) => {
    },
  });
};

export const useShippingMethods = (storeId?: number) => {
  const queryClient = useQueryClient();

  // GET: Obtener métodos de envío
  const {
    data: methods,
    isLoading: isLoadingMethods,
    error: fetchError,
    refetch,
  } = useQuery({
    queryKey: ['shippingMethods', storeId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/store/shipping-methods/?store=${storeId}`);
      return response.data;
    },
    enabled: !!storeId,
  });

  // DELETE: Versión optimizada que SI actualiza la lista
  const deleteMethod = useMutation({
    mutationFn: async (methodId: number) => {
      await axiosInstance.delete(`/store/shipping-methods/${methodId}/`);
    },
    onMutate: async (methodId) => {
      // 1. Cancelar cualquier query en progreso
      await queryClient.cancelQueries(['shippingMethods', storeId]);

      // 2. Obtener snapshot actual
      const previousMethods = queryClient.getQueryData(['shippingMethods', storeId]);

      // 3. Actualización optimista
      queryClient.setQueryData(['shippingMethods', storeId], (old: any) =>
        old?.filter((method: any) => method.id !== methodId) || []
      );

      return { previousMethods };
    },
    onError: (error: any, _, context) => {
      queryClient.setQueryData(['shippingMethods', storeId], context?.previousMethods);

      let message = 'Error desconocido al eliminar';

      if (error?.response?.data?.detail) {
        message = error.response.data.detail;
      } else if (error?.message) {
        message = error.message;
      }

      // Solo mostrar si el mensaje tiene sentido
      if (message && message.toLowerCase() !== 'network error') {
        Alert.alert('Error', message);
      }
    },

    onSuccess: () => {
      Alert.alert('Éxito', 'Método eliminado correctamente');
    },
    // IMPORTANTE: Esto evita llamadas adicionales
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['shippingMethods', storeId],
        exact: true // Solo invalida esta query exacta
      });
    }
  });

  return {
    methods,
    isLoadingMethods,
    fetchError,
    refetchMethods: refetch,
    deleteMethod: deleteMethod.mutate,
    isDeleting: deleteMethod.isLoading,
  };
};

export const useCreateShippingMethod = (storeId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      base_cost?: string | number;
      estimated_days?: number;
      is_active?: boolean;
    }) => {
      const payload: any = {
        store: storeId,
        name: data.name,
        description: data.description,
        is_active: data.is_active,
      };

      // Solo agrega base_cost si es un número válido
      if (!isNaN(Number(data.base_cost))) {
        payload.base_cost = Number(data.base_cost);
      }

      // Solo agrega estimated_days si es un número válido
      if (!isNaN(Number(data.estimated_days))) {
        payload.estimated_days = Number(data.estimated_days);
      }

      console.log(payload);

      const response = await axiosInstance.post('/store/shipping-methods/', payload);
      return response.data;
    }
    ,
    onSuccess: async (data) => {
      queryClient.setQueryData(['shippingMethods', storeId], (oldData: any) => [
        ...(oldData || []),
        data
      ]);
      await updateChecklistField('locationShipping', true);

    },
    onError: (error: any) => {
      // ... (mantener el mismo manejo de errores que ya tenías)
    },
  });
};

export const useShippingMethodZones = (storeId: number) => {
  return useQuery({
    queryKey: ['shippingMethodZones', storeId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/store/shipping-method-zones/?store=${storeId}`);
      console.log(response.data)
      return response.data;

    },
    enabled: !!storeId,
  });
};

export const useCreateShippingMethodZone = (storeId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      shipping_method: number;
      zone: number;
      custom_cost?: string | number;
      custom_days?: number;
    }) => {
      const response = await axiosInstance.post('/store/shipping-method-zones/', {
        ...data,
        custom_cost: data.custom_cost ? String(data.custom_cost) : "0.00",
        custom_days: data.custom_days || 0
      });
      return response.data; // El JSON ya incluye los nombres
    },
    onSuccess: async (newRelation) => {
      // Actualización DIRECTA con los datos que ya vienen del backend
      queryClient.setQueryData(['shippingMethodZones', storeId], (oldData: any) => [
        ...(oldData || []),
        newRelation // Usamos el objeto completo que devuelve el API
      ]);
    },
    onError: (error: any) => {
      if (error.response?.data) {
        const errorData = error.response.data;
        const message = Object.entries(errorData)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join('\n');
        Alert.alert('Error al crear', message);
      } else {
        Alert.alert('Error', 'No se pudo conectar al servidor');
      }
    }
  });
};

export const useDeleteShippingMethodZone = (storeId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (relationId: number) => {
      await axiosInstance.delete(`/store/shipping-method-zones/${relationId}/`);
    },
    onSuccess: (_, relationId) => {
      // ACTUALIZACIÓN OPTIMISTA PURA (sin invalidar queries)
      queryClient.setQueryData(['shippingMethodZones', storeId], (oldData: any) =>
        oldData?.filter((rel: any) => rel.id !== relationId) || []
      );

      Alert.alert('Éxito', 'Relación eliminada correctamente');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.detail || 'Error al eliminar');
    }
  });
};

export const useCoupons = (storeId: number | string) => {
  return useQuery({
    queryKey: ['coupons', storeId],
    queryFn: async () => {
      const response = await axiosInstance.get(`store/coupons/?store=${storeId}`);
      return response.data;
    },
    enabled: !!storeId,
  });
};

export const useDeleteCoupons = (storeId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (couponId: number) => {
      await axiosInstance.delete(`/store/coupons/${couponId}/`);
    },
    onSuccess: (_, couponId) => {
      // Actualización optimista + invalidación de la query
      queryClient.setQueryData(['coupons', storeId], (oldData: any) =>
        oldData?.filter((coupon: any) => coupon.id !== couponId) || []
      );

      Alert.alert('Éxito', 'Cupon eliminado correctamente');
    },
    onError: (error: any) => {
    },
  });
};

export const useCreateCoupon = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      store: number;
      code: string;
      discount_type: 'percentage' | 'fixed';
      value: number;
      usage_limit: number;
      valid_from: string;
      valid_to: string;
      active: boolean;
    }) => {
      const response = await axiosInstance.post('/store/create-coupon/', data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        ['coupons', variables.store],
        (oldData: any) => [...(oldData || []), data]
      );
      Alert.alert('Cupón creado', 'El cupón fue guardado correctamente');
      if (onSuccessCallback) onSuccessCallback(); // <- aquí cierra el modal
    },
    onError: (error: any) => {
      if (error.response && error.response.data) {
        const data = error.response.data;

        if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
          Alert.alert('Error al guardar', data.non_field_errors.join('\n'));
          return;
        }

        const message = Object.entries(data)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join('\n');

        Alert.alert('Error al guardar', message);
      } else {
        Alert.alert('Error inesperado', 'No se pudo guardar el cupón.');
      }
    },
  });
};

export const useFetchStoreAdmins = ({ storeId }) => {
  return useQuery({
    queryKey: ['storeAdmins', storeId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/store/${storeId}/admins/`);
      return res.data.administrators;
    },
    enabled: !!storeId,
    retry: false, // para que no reintente en errores 403, 404, etc.
    onError: (error) => {
      console.error('Error al obtener administradores:', error?.response?.data?.error || error.message);
    },
  });
};



export const useAddStoreAdmin = () => {
  return useMutation({
    mutationFn: async ({ storeId, adminData }) => {
      const res = await axiosInstance.post(`/store/${storeId}/add-admin/`, adminData);
      return res.data;
    },
  });
};

export const useRemoveStoreAdmin = () => {
  return useMutation({
    mutationFn: async ({ storeId, adminData }) => {
      const res = await axiosInstance.post(`/store/${storeId}/remove-admin/`, adminData);
      return res.data;
    },
  });
};

export const useGetPaymentMethods = (storeId: number) => {
  return useQuery({
    queryKey: ['paymentMethods', storeId],
    queryFn: async () => {
      const response = await axiosInstance.get('/store/payment-methods-admin/', {
        params: { store: storeId },
      });
      return response.data;
    },
    enabled: !!storeId, // solo ejecuta si hay storeId
  });
};

interface CreatePaymentMethodData {
  store: number;
  name: string;
  account_name?: string | null;
  account_number?: string | null;
  payment_link?: string | null;
  qr_code?: any; // FormData compatible (ej. archivo de imagen)
}

export const useCreatePaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePaymentMethodData) => {
      const formData = new FormData();

      formData.append('store', data.store.toString());
      formData.append('name', data.name);

      if (data.account_name) formData.append('account_name', data.account_name);
      if (data.account_number) formData.append('account_number', data.account_number);
      if (data.payment_link) formData.append('payment_link', data.payment_link);
      if (data.qr_code) formData.append('qr_code', data.qr_code);

      const response = await axiosInstance.post(
        '/store/payment-methods-admin/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    },

    onSuccess: async (data, variables) => {
      queryClient.setQueryData(
        ['paymentMethods', variables.store],
        (oldData: any) => [...(oldData || []), data]
      );
      await updateChecklistField('payMethods', true);

    },

    onError: (error: any) => {
      if (error.response && error.response.data) {
        const data = error.response.data;

        if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
          Alert.alert('Error al guardar', data.non_field_errors.join('\n'));
          return;
        }

        const message = Object.entries(data)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join('\n');

        Alert.alert('Error al guardar', message);
      } else {
        Alert.alert('Error inesperado', 'No se pudo guardar el método de pago.');
      }
    },
  });
};

export const useDeletePaymentMethod = (storeId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (methodId: number) => {
      await axiosInstance.delete('/store/payment-methods-admin/', {
        params: { id: methodId },
      });
    },
    onSuccess: (_, methodId) => {
      queryClient.setQueryData(['paymentMethods', storeId], (oldData: any) =>
        oldData?.filter((method: any) => method.id !== methodId) || []
      );

      Alert.alert('Éxito', 'Método de pago eliminado correctamente');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.detail || 'Error al eliminar método de pago');
    },
  });
};
