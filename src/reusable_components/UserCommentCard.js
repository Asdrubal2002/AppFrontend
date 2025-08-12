import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import moment from 'moment';


const getColorFromString = (str) => {
  const colors = ['#4C51BF', '#2C5282', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'];
  const index = str.charCodeAt(0) % colors.length;
  return colors[index];
};

const UserCommentCard = ({ initials, username, content, createdAt, rating }) => {
  const avatarColor = getColorFromString(username || initials || 'X');
  return (
    <View style={{ marginBottom: 10, flexDirection: 'row' }}>
      {/* Avatar con iniciales */}
      <View
        style={[
          tw`w-10 h-10 rounded-full items-center justify-center mr-3`,
          { backgroundColor: avatarColor },
        ]}
      >
        <Text style={tw`text-white font-bold text-base`}>
          {initials || '??'}
        </Text>
      </View>

      {/* Contenido */}
      <View style={tw`flex-1 my-2 mr-4`}>
        <View style={tw`flex-row justify-between`}>
          <Text style={tw`text-white font-bold`}>{username}</Text>
          {rating !== undefined && (
            <Text style={tw`text-yellow-400`}>⭐ {rating}</Text>
          )}
        </View>
        <Text style={tw`text-gray-400 mt-1`}>{content}</Text>
        <Text style={tw`text-gray-200 text-xs mt-1`}>
          {moment(createdAt).format('DD MMM YYYY · HH:mm')}
        </Text>
      </View>
    </View>
  );
};

export default UserCommentCard;
