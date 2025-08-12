import { View, Text, Image, Pressable, TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';


export default function CartItemCard({
  item,
  itemQuantity,
  isUpdating,
  onChangeQty,
  onRemove,
  localQuantities,
  setLocalQuantities,
  tw,
  disabled = false,
}) {
  const stock = item.variant_details?.stock ?? 9999;

  return (
    <View style={tw`mb-4 p-4 bg-gray-800 rounded-xl border border-gray-700`}>
      <View style={tw`flex-row`}>
        {item.product_image && (
          <Image
            source={{ uri: item.product_image }}
            style={tw`w-20 h-20 rounded-lg mr-3`}
            resizeMode="cover"
          />
        )}
        <View style={tw`flex-1`}>
          <Text style={tw`text-white font-bold text-base mb-1`} numberOfLines={2}>
            {item.product_name}
          </Text>

          {item.selected_options && (
            <View style={tw`mt-1`}>
              {Object.entries(item.selected_options).map(([key, value]) => (
                <Text key={key} style={tw`text-gray-400 text-xs`}>
                  {key}: {value}
                </Text>
              ))}
            </View>
          )}

          <Text style={tw`text-green-400 text-sm mt-1`}>
            ${parseInt(item.price || 0).toLocaleString()} c/u
          </Text>
        </View>
      </View>

      <View style={tw`flex-row items-center justify-between mt-4`}>
        <View style={tw`flex-row items-center`}>
          <Pressable
            disabled={disabled || isUpdating || itemQuantity <= 1}
            onPress={() => {
              const newQty = Math.max(1, itemQuantity - 1);
              setLocalQuantities((prev) => ({ ...prev, [item.sku]: newQty }));
              onChangeQty?.('set_quantity', item, newQty);
            }}
            style={({ pressed }) => [
              tw`rounded-l bg-gray-700 px-3 py-2 items-center justify-center h-10`,
              pressed && tw`bg-gray-600`,
              (isUpdating || itemQuantity <= 1 || disabled) && tw`opacity-50`,
            ]}
          >
            <Text style={tw`text-white text-lg`}>−</Text>
          </Pressable>

          <TextInput
            editable={!isUpdating && !disabled}
            style={tw`px-3 py-2 bg-gray-800 text-white text-center text-base w-12 h-10 border-t border-b border-gray-700`}
            keyboardType="number-pad"
            value={itemQuantity.toString()}
            onChangeText={(text) => {
              if (text === '') {
                setLocalQuantities((prev) => ({ ...prev, [item.sku]: '' }));
              } else {
                const parsed = parseInt(text, 10);
                if (!isNaN(parsed)) {
                  setLocalQuantities((prev) => ({ ...prev, [item.sku]: parsed }));
                }
              }
            }}
            onBlur={() => {
              const parsed = parseInt(itemQuantity, 10);
              const clamped = Math.max(1, Math.min(isNaN(parsed) ? 1 : parsed, stock));
              if (clamped !== item.quantity) {
                setLocalQuantities((prev) => ({ ...prev, [item.sku]: clamped }));
                onChangeQty?.("set_quantity", item, clamped);
              }
            }}
          />

          <Pressable
            disabled={disabled || isUpdating}
            onPress={() => {
              const newQty = Math.min(stock, itemQuantity + 1);
              setLocalQuantities((prev) => ({ ...prev, [item.sku]: newQty }));
              onChangeQty?.('set_quantity', item, newQty);
            }}
            style={({ pressed }) => [
              tw`rounded-r bg-gray-700 px-3 py-2 items-center justify-center h-10`,
              pressed && tw`bg-gray-600`,
              (isUpdating || disabled) && tw`opacity-50`,
            ]}
          >
            <Text style={tw`text-white text-lg`}>＋</Text>
          </Pressable>
        </View>

        <View style={tw`items-end`}>
          <Pressable
            onPress={() => onRemove?.(item.sku, item.combo_instance_id)}
            style={tw`p-1 mb-1`}
            disabled={disabled || isUpdating}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color={isUpdating || disabled ? "#6B7280" : "#EF4444"}
            />
          </Pressable>

          <Text style={tw`text-white font-semibold`}>
            ${parseInt(item.total_price || 0).toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
}
