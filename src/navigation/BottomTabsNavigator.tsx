import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PerfilStack from '../screens/auth/PerfilStack';
import StoreStack from '../screens/store/StoreStack';
import TestQuery from '../TestQuery';
import { COLORS } from '../../theme'; // asegúrate que esté correcto
import Feather from 'react-native-vector-icons/Feather';
import SidePanel from './SidePanel';
import { getAccessToken } from '../utils/authStorage';
import { Text, View } from 'react-native';

const Tab = createBottomTabNavigator();

export default function BottomTabsNavigator() {
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getAccessToken();
      setIsAuthenticated(!!token);
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return null; // o loading
  }

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName = '';
            let label = '';

            if (route.name === 'Tiendas') {
              iconName = 'home';
              label = 'Negocios';
            } else if (route.name === 'Publicaciones') {
              iconName = 'eye';
              label = 'Comercio';
            } else if (route.name === 'Perfil') {
              iconName = 'user';
              label = 'Cuenta';
            }

            return (
              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Feather name={iconName} size={size} color={color} />
                <Text
                  style={{
                    fontSize: 12,
                    lineHeight: 16,
                    color,
                    marginTop: 2,
                    textAlign: 'center',
                    minWidth: 60,
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {label}
                </Text>
              </View>
            );
          },
          tabBarActiveTintColor: COLORS.BlueWord,
          tabBarInactiveTintColor: '#ffffff',
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: '#040404',
            borderTopWidth: 0,
            elevation: 0,
            height: 55,
            paddingBottom: 6,
            paddingTop: 10,
          },
          tabBarIconStyle: {
            justifyContent: 'center',
            alignItems: 'center',
          },
        })}
      >
        <Tab.Screen name="Tiendas" component={StoreStack} />

        <Tab.Screen
          name="Perfil"
          component={PerfilStack}
          listeners={{
            tabPress: async e => {
              e.preventDefault();
              const token = await getAccessToken();
              setIsAuthenticated(!!token);
              setIsPanelVisible(true);
            },
          }}
        />
        <Tab.Screen name="Publicaciones" component={TestQuery} />
      </Tab.Navigator>


      <SidePanel
        visible={isPanelVisible}
        onClose={() => setIsPanelVisible(false)}
        isAuthenticated={isAuthenticated}
      />
    </>

  );
}
