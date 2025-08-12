import React from 'react';
import { View, Text } from 'react-native';
import CartItemCard from './CartItemCard';


export default function CartItemsList({
  singles,
  combos,
  updatingItems,
  localQuantities,
  handleQuantityChange,
  handleRemove,
  setLocalQuantities,
  tw,
}) {
  return (
    <View>
      {/* Productos individuales */}
      {singles && singles.length > 0 && (
        <>
          <Text style={tw`text-white text-base mb-2 p-2`}>Productos individuales</Text>
          {singles.map((item, index) => {
            if (!item) return null; // Saltar elementos nulos
            const isUpdating = updatingItems[item.sku] === true;
            const itemQuantity = localQuantities[item.sku] ?? item.quantity;
            return (
              <CartItemCard
                key={`${item.sku}-${index}`}
                item={item}
                itemQuantity={itemQuantity}
                isUpdating={isUpdating}
                onChangeQty={handleQuantityChange}
                onRemove={handleRemove}
                localQuantities={localQuantities}
                setLocalQuantities={setLocalQuantities}
                tw={tw}
              />
            );
          })}
        </>
      )}

      {/* Combos o promociones */}
      {combos && combos.length > 0 && (
        <>
          <Text style={tw`text-white text-base mt-4 mb-2 p-2`}>Promociones</Text>
          {combos.map((comboItem, index) => {
            if (!comboItem || !comboItem.combo) return null; // Saltar elementos nulos o sin combo
            const { combo, children = [] } = comboItem;
            return (
              <View key={`combo-${combo.sku}-${index}`} style={tw`mb-6`}>
                <CartItemCard
                  item={combo}
                  itemQuantity={localQuantities[combo.sku] ?? combo.quantity}
                  isUpdating={updatingItems[combo.sku] === true}
                  onChangeQty={handleQuantityChange}
                  onRemove={handleRemove}
                  localQuantities={localQuantities}
                  setLocalQuantities={setLocalQuantities}
                  tw={tw}
                />
                {children.map((child, idx) => {
                  if (!child) return null; // Saltar hijos nulos
                  return (
                    <CartItemCard
                      key={`${child.sku}-${idx}`}
                      item={child}
                      itemQuantity={child.quantity}
                      isUpdating={true}
                      onChangeQty={() => {}}
                      onRemove={() => {}}
                      localQuantities={{}}
                      setLocalQuantities={() => {}}
                      tw={tw}
                      disabled
                    />
                  );
                })}
              </View>
            );
          })}
        </>
      )}
    </View>
  );
}
