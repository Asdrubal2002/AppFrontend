import { Alert } from "react-native";
import { updateChecklistField } from "../../utils/cache/checklistStorage";
import axiosInstance from "../auth/axiosInstance";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';


/** 📦 Categorías por tienda */
export const useStoreCategories = (storeId, options = {}) => {
  return useQuery({
    queryKey: ['storeCategories', storeId],
    queryFn: async () => {
      const res = await axiosInstance.get(`store/${storeId}/categories/`);
      return res.data;
    },
    enabled: !!storeId && options.enabled, // se ejecuta solo si hay storeId y enabled=true
    ...options,
  });
};

/**  Filtraar produtos de las tiendas */
export const useStoreProducts = ({ storeId, page, search, priceMin, priceMax, categoryId, enabled }) => {
  return useQuery({
    queryKey: ['storeProducts', { storeId, page, search, priceMin, priceMax, categoryId }],
    queryFn: async () => {
      const params = {
        page,
        search: search || '',
        price_min: priceMin || '',
        price_max: priceMax || '',
        category: categoryId || '',
      };
      const res = await axiosInstance.get(`modules/store/${storeId}/`, { params });
      return res.data;
    },
    enabled,
    keepPreviousData: true,
  });
};


export const useProductDetail = (productId) => {
  return useQuery({
    queryKey: ['productDetail', productId],
    queryFn: async () => {
      const res = await axiosInstance.get(`modules/product/${productId}/`);
      return res.data;
    },
    enabled: !!productId, // se asegura de que solo se ejecute si hay ID
  });
};

//Crear categoría
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newCategory) => {
      const res = await axiosInstance.post('store/categories/creates/', newCategory);
      return res.data;
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['storeCategories', variables.store],
        exact: true // Solo invalida exactamente esta query
      });
      // ✅ Marcar como completado en el checklist
      await updateChecklistField('categoriesCreated', true);
    },
    onError: (error) => {
      const message =
        error.response?.data?.error ||
        'No se pudo crear la categoría. Intenta nuevamente.';

      Alert.alert('Error al crear categoría', message);
    },

  });
};


export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId, storeId }) => {
      try {
        const res = await axiosInstance.delete(`store/categories/delete/${categoryId}/`);
        return { ...res.data, storeId };
      } catch (error) {
        // Extraemos el mensaje específico de tu backend
        const backendMessage = error.response?.data?.error ||
          'No se pudo eliminar la categoría';
        throw new Error(backendMessage); // Lanzamos el error con el mensaje
      }
    },
    onSuccess: (data) => {
      queryClient.refetchQueries({
        queryKey: ['storeCategories', data.storeId],
        exact: true
      });

      queryClient.setQueryData(
        ['storeCategories', data.storeId],
        (oldCategories = []) => oldCategories.filter(cat => cat.id !== data.id)
      );
    },

  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId, updatedData }) => {
      const res = await axiosInstance.put(
        `store/categories/edit/${categoryId}/`,
        updatedData
      );
      return { ...res.data, storeId: updatedData.store };
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: ['storeCategories', variables.updatedData.store],
        exact: true
      });

      const previous = queryClient.getQueryData([
        'storeCategories',
        variables.updatedData.store
      ]);

      // Actualización optimista
      queryClient.setQueryData(
        ['storeCategories', variables.updatedData.store],
        (old = []) => old.map(cat =>
          cat.id === variables.categoryId
            ? { ...cat, ...variables.updatedData }
            : cat
        )
      );

      return { previous };
    },
    onSuccess: (data) => {
      // 1. Forzar recarga de las categorías del store
      queryClient.refetchQueries({
        queryKey: ['storeCategories', data.storeId],
        exact: true
      });

      // 2. Invalidación condicional para relaciones parent
      if (data.parent) {
        queryClient.invalidateQueries({
          queryKey: ['categoryDetails', data.parent],
          exact: true
        });
        queryClient.invalidateQueries({
          queryKey: ['categoryDetails', data.id],
          exact: true
        });
      }
    },
    onError: (error, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ['storeCategories', variables.updatedData.store],
          context.previous
        );
      }
      throw error;
    }
  });
};

const fetchProducts = async ({ pageParam = 1, queryKey }) => {
  const [, filters] = queryKey;

  const params = {
    page: pageParam,
    search: filters.search || '',
  };

  // Georreferencia 🧭
  if (filters.lat) params.lat = filters.lat;
  if (filters.lon) params.lon = filters.lon;

  if (filters.countryId) params.country_id = filters.countryId;
  if (filters.cityId) params.city_id = filters.cityId;
  if (filters.neighborhoodId) params.neighborhood_id = filters.neighborhoodId;
  if (filters.store_category) params.store_category = filters.store_category;
  if (filters.priceMin) params.price_min = filters.priceMin;
  if (filters.priceMax) params.price_max = filters.priceMax;

  const res = await axiosInstance.get('modules/all-products/', { params });
  return res.data;
};

export const useProducts = (filters) => {
  return useInfiniteQuery({
    queryKey: ['products', filters],
    queryFn: fetchProducts,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((acc, page) => acc + page.results.length, 0);
      const totalAvailable = lastPage.count;
      return totalFetched < totalAvailable ? allPages.length + 1 : undefined;
    }
    ,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};


interface ProductPayload {
  store_id: number;
  category?: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  is_active?: boolean;
  discount_percentage?: number;
  discount_start?: string;
  discount_end?: string;
  brand?: string;
  model?: string;
  specifications?: Record<string, string>;
  warranty?: string;
  condition?: 'Nuevo' | 'Usado';
  weight_kg?: number;
  dimensions_cm?: Record<string, number>;
  shipping_included?: boolean;
  sku?: string;
  barcode?: string;
  slug?: string;
  keywords?: string[];
  tags?: string[];
  media?: any[];
  is_featured?: boolean;
  is_recommended?: boolean;
  visibility?: 'publico' | 'privado' | 'tienda';
  options?: { name: string; values: string[] }[];
  variants?: {
    sku: string;
    price: number;
    stock: number;
    options: Record<string, string>;
  }[];
}

interface UseProductMutationProps {
  isEdit: boolean;
  productId?: string;
}

export const useProductMutation = ({ isEdit, productId }: UseProductMutationProps) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ProductPayload) => {
      if (isEdit && productId) {
        const res = await axiosInstance.put(`/modules/products/${productId}/`, payload);
        return res.data;
      } else {
        await updateChecklistField('firstProductCreated', true);
        const res = await axiosInstance.post('/modules/create-product/', payload);
        return res.data;
      }
    },
    onSuccess: (data) => {
      console.log('✅ Producto guardado:', data);
    },
    onError: (error: any) => {
      //console.error('❌ Error al guardar producto:', error.response?.data || error.message);
    },
  });
};


export const useUploadProductMedia = () => {
  return useMutation({
    mutationFn: async ({
      store_slug,
      product_slug,
      files,
    }: {
      store_slug: string;
      product_slug: string;
      files: any[]; // image/video picker assets
    }) => {
      const formData = new FormData();

      formData.append('store_slug', store_slug);
      formData.append('product_slug', product_slug);

      files.forEach((file, index) => {
        formData.append('files', {
          uri: file.uri,
          type: file.type,
          name: file.fileName ?? `media_${index}.${file.type?.split('/')[1] || 'bin'}`,
        });
      });

      const res = await axiosInstance.post('/modules/media-upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        validateStatus: (status) => [200, 201, 207].includes(status), // Acepta también 207
      });

      return res.data; // ✅ devuelve el JSON { files: [...] }
    },
  });
};



export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productSlug }) => {
      const res = await axiosInstance.delete('modules/delete-product/', {
        data: { product_slug: productSlug },
      });
      return res.data;
    },
    onSuccess: (_, variables) => {
      const { productSlug, onSuccess } = variables;

      queryClient.invalidateQueries({ queryKey: ['storeStats'] });
      queryClient.removeQueries({ queryKey: ['productDetail', productSlug] });

      Alert.alert('Éxito', 'Producto eliminado correctamente');

      if (onSuccess) onSuccess(); // <- callback opcional
    },
    onError: () => {
      Alert.alert('Error', 'No se pudo eliminar el producto.');
    },
  });
};


// Hook para borrar una imagen específica de un producto
export const useDeleteProductMedia = () => {
  return useMutation({
    mutationFn: async ({ product_slug, image_url }: { product_slug: string; image_url: string }) => {
      const response = await axiosInstance.post('modules/delete-media-product/', {
        product_slug,
        image_url,
      });
      return response.data;
    },
  });
};
