import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import moment from 'moment';
import { useNavigation } from "@react-navigation/native";
import { API_BASE_URL, DEFAULT_LOGO_BASE64 } from '../../../../constants';

const Header = ({ logo, name, createdAt, slug }) => {
  const navigation = useNavigation();

  const imageUrl = logo.startsWith('/')
    ? `${API_BASE_URL}${logo}`
    : logo;

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Tabs', {
        screen: 'Tiendas',
        params: {
          screen: 'StoreDetail',
          params: {
            slug: slug,
          },
        },
      })}
    >
      <View style={tw`flex-row items-center p-4`}>
        <Image
          source={{ uri: imageUrl ||
                DEFAULT_LOGO_BASE64 }}
          style={tw`w-10 h-10 rounded-full mr-3`}
        />
        <View>
          <Text style={tw`text-white font-semibold text-sm`}>{name}</Text>
          <Text style={tw`text-gray-400 text-xs`}>
            {moment(createdAt).format('DD MMM YYYY · HH:mm')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default Header;
