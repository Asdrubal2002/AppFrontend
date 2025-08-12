// ReusableModal.jsx
import React from 'react';
import { Modal, View, TouchableWithoutFeedback, Keyboard, Pressable, ScrollView, SafeAreaView } from 'react-native';
import tw from 'twrnc';
import { COLORS } from '../../theme';

const ReusableModal = ({ visible, onClose, children, hasFlatList = false }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={tw`flex-1 justify-end bg-black bg-opacity-60`}>
        <Pressable style={tw`flex-1`} onPress={onClose} />
        <SafeAreaView style={[tw`rounded-t-2xl`, { backgroundColor: COLORS.Modals, maxHeight: '70%' }]}>
          {hasFlatList ? (
            <View style={tw`p-4`}>{children}</View> // Sin ScrollView
          ) : (
            <ScrollView 
              contentContainerStyle={tw`p-4`}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {children}
            </ScrollView>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default ReusableModal;
