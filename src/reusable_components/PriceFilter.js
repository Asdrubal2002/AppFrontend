import { Text, TextInput, View } from "react-native";
import tw from 'twrnc';
import { inputBase } from "../screens/store/componentes/styles/tailwindStyles";

const PriceFilter = ({ priceMin, setPriceMin, priceMax, setPriceMax }) => {
  return (
    <View style={tw`bg-gray-800 p-4 rounded-2xl`}>
      <Text style={[tw`text-lg mb-3 font-bold text-white`]}>Define tu presupuesto</Text>

      <View style={tw`mb-4`}>
        <Text style={[tw`mb-1 text-base font-semibold text-gray-300`]}>Presupuesto mínimo</Text>
        <TextInput
          style={[
            tw`bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700`,
            { fontSize: 16 },
          ]}
          placeholder="0"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          value={priceMin}
          onChangeText={setPriceMin}
        />
      </View>

      <View>
        <Text style={[tw`mb-1 text-base font-semibold text-gray-300`]}>Presupuesto máximo</Text>
        <TextInput
          style={[
            tw`bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700`,
            { fontSize: 16 },
          ]}
          placeholder="100000"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          value={priceMax}
          onChangeText={setPriceMax}
        />
      </View>
    </View>

  );
};

export default PriceFilter;
