

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../auth/axiosInstance';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';



// 🔍 Tiendas
export const useInfiniteStores = (params, options = {}) => {
  const hasSearch = typeof params?.search === 'string' && params.search.trim().length > 0;

  return useInfiniteQuery({
    queryKey: ['storesSearch', params],
    enabled: hasSearch && options.enabled !== false,
    queryFn: async ({ pageParam = 1 }) => {
      if (!hasSearch) return { results: [], next: null };
      const res = await axiosInstance.get('/store/search/', {
        params: {
          ...params,
          store_page: pageParam,
        },
      });
      return res.data.stores;
    },
    getNextPageParam: (lastPage) => {
      const nextUrl = lastPage?.next;
      if (typeof nextUrl !== 'string') return undefined;

      const match = nextUrl.match(/[\?&]page=(\d+)/);
      return match ? Number(match[1]) : undefined;
    },
  });
};

// 🔍 Productos
export const useInfiniteProducts = (params, options = {}) => {
  const hasSearch = typeof params?.search === 'string' && params.search.trim().length > 0;

  return useInfiniteQuery({
    queryKey: ['productsSearch', params],
    enabled: hasSearch && options.enabled !== false,
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axiosInstance.get('/store/search/', {
        params: {
          ...params,
          product_page: pageParam,
        },
      });
      return res.data.products;
    },
    getNextPageParam: (lastPage) => {
      const nextUrl = lastPage?.next;
      if (typeof nextUrl !== 'string') return undefined;
      const match = nextUrl.match(/[\?&]page=(\d+)/);
      return match ? Number(match[1]) : undefined;
    },
  });
};
