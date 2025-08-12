import axiosInstance from "../../api/auth/axiosInstance";


// Eliminar un item del carrito






export async function removeCartItem({
  store_id,
  sku,
  combo_instance_id,
}: {
  store_id: number;
  sku: string;
  combo_instance_id?: string;
}) {
  const payload: any = {
    store_id,
    sku,
  };

  if (combo_instance_id) {
    payload.combo_instance_id = combo_instance_id;
  }

  const res = await axiosInstance.post('/cart/delete-item/', payload);
  return res.data.cart;
}


export async function removeItemFromCart({
  sku,
  combo_instance_id,
  store_id,
  setUpdatingItems,
  setCartResponse,
  currentCart,
}) {
  setUpdatingItems((prev) => ({ ...prev, [sku]: true }));

  try {
    const updatedCart = await removeCartItem({
      store_id,
      sku,
      ...(combo_instance_id ? { combo_instance_id } : {}),
    });

    const newCart = updatedCart || {
      items: [],
      items_subtotal: 0,
      total: 0,
      store_name: currentCart.store_name,
      store: currentCart.store,
    };

    setCartResponse(newCart);
  } catch (err) {
    console.error("Error al eliminar item del carrito:", err);
  } finally {
    setUpdatingItems((prev) => ({ ...prev, [sku]: false }));
  }
}




export function groupCartItems(items) {
  const combos = {};
  const singles = [];

  for (const item of items || []) {
    if (item.combo_instance_id) {
      if (!combos[item.combo_instance_id]) {
        combos[item.combo_instance_id] = {
          combo: null,
          children: [],
        };
      }
      if (item.sku.startsWith("COMBO-")) {
        combos[item.combo_instance_id].combo = item;
      } else {
        combos[item.combo_instance_id].children.push(item);
      }
    } else {
      singles.push(item);
    }
  }

  return { singles, combos: Object.values(combos) };
}




// Actualizar cantidad de un item
export async function updateCartItemQuantity({
  store_id,
  product_id,
  sku,
  action,
  quantity,
  combo_instance_id,
}: {
  store_id: number;
  product_id: string;
  sku: string;
  action: 'increment' | 'decrement' | 'set_quantity';
  quantity?: number;
  combo_instance_id?: string;
}) {
  const payload: any = {
    store_id,
    product_id,
    sku,
    action,
  };

  if (combo_instance_id) {
    payload.combo_instance_id = combo_instance_id;
  }

  if (action === 'set_quantity' && typeof quantity === 'number') {
    payload.quantity = quantity;
  }

  const res = await axiosInstance.post('/cart/update-item-quantity/', payload);
  return res.data; // carrito actualizado
}




export async function updateCartItem({
  action,
  item,
  quantity,
  store_id,
  setUpdatingItems,
  setCartResponse,
  currentCart,
  setLocalQuantities,
}) {
  const stock = item.variant_details?.stock ?? 9999;
  const sku = item.sku;
  const isCombo = sku.startsWith("COMBO-");

  if (!isCombo && action === "set_quantity" && (!quantity || quantity < 1 || quantity > stock)) {
    return;
  }

  setUpdatingItems((prev) => ({ ...prev, [sku]: true }));

  try {
    const updatedCart = await updateCartItemQuantity({
      store_id,
      product_id: item.product_id,
      sku,
      action,
      ...(item.combo_instance_id ? { combo_instance_id: item.combo_instance_id } : {}),
      ...(action === "set_quantity" ? { quantity } : {}),
    });

    setCartResponse(updatedCart || currentCart);
  } catch (err) {
    console.error("Error actualizando cantidad:", err);
    setLocalQuantities((prev) => ({ ...prev, [sku]: item.quantity }));
  } finally {
    setUpdatingItems((prev) => ({ ...prev, [sku]: false }));
  }
}












/**
 * Elimina un carrito por su ID.
 * @param cartId - ID del carrito a eliminar.
 * @returns El mensaje del backend u objeto de confirmación.
 */
export async function deleteCart(cartId: number): Promise<string> {
  const res = await axiosInstance.delete(`/cart/user-carts/${cartId}/`);

  // Maneja 204 explícitamente
  if (res.status === 204) {
    return 'Canasta eliminada correctamente.';
  }

  // Si no es 204 y trae mensaje
  return res.data?.detail || 'Canasta eliminada correctamente.';
}



interface CheckoutPayload {
  cart_id: number;
  shipping_method_id: number;
  coupon_code?: string;
}

interface CheckoutResponse {
  id: number;
  store: number;
  store_name: string;
  cart: number;
  items_subtotal: string;
  shipping_cost: string;
  discount_total: string;
  total: string;
  coupon: string | null;
  created_at: string;
  warning?: string;
}

export async function createCheckout(payload: CheckoutPayload): Promise<CheckoutResponse> {
  try {
    const res = await axiosInstance.post("cart/checkout/", payload);

    if (res.status === 201 || res.status === 200) {
      return res.data as CheckoutResponse;
    }

    throw new Error(res.data?.detail || "No se pudo completar el checkout.");
  } catch (error: any) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error("Error inesperado al procesar el checkout.");
  }
}



