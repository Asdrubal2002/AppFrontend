
import { Text, View } from "react-native";
import DescripcionExpandible from "../DescripcionExpandibleProps";
import { memo } from "react";
import tw from 'twrnc';

const PostContent = ({ title, content }) => (
  <View style={tw`px-3 pt-2 pb-4`}>
    <Text style={tw`text-white text-base font-bold`}>{title}</Text>
    <DescripcionExpandible description={content} />
  </View>
);
export default memo(PostContent);
