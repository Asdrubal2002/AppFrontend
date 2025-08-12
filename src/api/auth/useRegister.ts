import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import axiosInstance from './axiosInstance';



const registerUser = async (userData: {
  username: string;
  name: string;
  country: number;
  cellphone: string;
  pin: string;
}) => {
  const response = await axiosInstance.post('auth/register/', userData);
  return response.data;
};

export const useRegister = () => {
  return useMutation({
    mutationFn: registerUser,
  });
};

const validateUsername = async (username: string) => {
  const response = await axiosInstance.post('auth/validate-username/', { username });
  return response.data;
};

export const useValidateUsername = () => {
  return useMutation({
    mutationFn: validateUsername,
  });
};