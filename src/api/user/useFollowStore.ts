// src/hooks/useFollowStore.ts
import { useEffect, useState } from 'react';
import axiosInstance from '../auth/axiosInstance';
import { getAccessToken } from '../../utils/authStorage';

export const useFollowStore = (storeId?: number) => {
  const [isFollowed, setIsFollowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      const token = await getAccessToken();
      const isAuth = !!token;
      setIsAuthenticated(isAuth);

      if (!isAuth || !storeId) {
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get(`/auth/is-following-store/${storeId}/`);
        setIsFollowed(response.data.is_followed);
      } catch (err) {
        console.error('Error getting follow status:', err?.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [storeId]);

  const toggleFollow = async () => {
    if (!isAuthenticated || !storeId) return;

    const method = isFollowed ? 'delete' : 'post';

    try {
      await axiosInstance[method](`/auth/follow-store/${storeId}/`);
      setIsFollowed((prev) => !prev);
    } catch (err) {
      console.error('Error toggling follow:', err?.response?.data || err.message);
    }
  };

  return { isFollowed, toggleFollow, isAuthenticated, loading };
};