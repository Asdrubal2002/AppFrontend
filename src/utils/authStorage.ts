import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USERNAME_KEY = 'username';
const IS_SELLER_KEY = 'isSeller';
const STORE_IDS_KEY = 'storeIds';

// Guarda tokens de forma segura
export const saveTokens = async (access: string, refresh: string) => {
  await Keychain.setGenericPassword(access, refresh, {
    service: 'ruvlo-auth',
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
};

// Obtiene access token
export const getAccessToken = async (): Promise<string | null> => {
  const credentials = await Keychain.getGenericPassword({ service: 'ruvlo-auth' });
  return credentials?.username ?? null; // username contiene el accessToken
};

// Obtiene refresh token
export const getRefreshToken = async (): Promise<string | null> => {
  const credentials = await Keychain.getGenericPassword({ service: 'ruvlo-auth' });
  return credentials?.password ?? null; // password contiene el refreshToken
};

// Limpia todo (tokens + datos en AsyncStorage)
export const clearTokens = async () => {
  await Keychain.resetGenericPassword({ service: 'ruvlo-auth' });
  await AsyncStorage.multiRemove([USERNAME_KEY, IS_SELLER_KEY, STORE_IDS_KEY]);
};
// Guarda el username
export const saveUsername = async (username: string) => {
  await AsyncStorage.setItem(USERNAME_KEY, username);
};

// Obtiene el username
export const getUsername = async () => {
  return await AsyncStorage.getItem(USERNAME_KEY);
};

// Guarda is_seller (booleano convertido a string)
export const saveIsSeller = async (isSeller: boolean) => {
  await AsyncStorage.setItem(IS_SELLER_KEY, JSON.stringify(isSeller));
};

// Obtiene is_seller (retorna boolean)
export const getIsSeller = async (): Promise<boolean | null> => {
  const value = await AsyncStorage.getItem(IS_SELLER_KEY);
  return value !== null ? JSON.parse(value) : null;
};

// Guardar store_ids
export const saveStoreIds = async (storeIds: number[]) => {
  await AsyncStorage.setItem(STORE_IDS_KEY, JSON.stringify(storeIds));
};

// Obtener store_ids
export const getStoreIds = async (): Promise<number[] | null> => {
  const value = await AsyncStorage.getItem(STORE_IDS_KEY);
  return value ? JSON.parse(value) : null;
};



