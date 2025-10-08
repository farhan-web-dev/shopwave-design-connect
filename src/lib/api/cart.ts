import { BASE_URL } from "@/lib/url";

export interface CartProductApi {
  _id: string;
  title: string;
  price: number;
  images?: string[];
}

export interface CartItemApi {
  _id: string;
  productId: CartProductApi;
  quantity: number;
  price: number;
}

export interface CartApi {
  _id: string;
  userId: string;
  items: CartItemApi[];
  totalPrice: number;
  updatedAt: string;
}

export interface CartResponse {
  cart: CartApi | null;
}

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  productId: string;
}

export interface CartData {
  items: CartItem[];
  totalPrice: number;
}

function mapCart(api: CartApi | null): CartData {
  if (!api) return { items: [], totalPrice: 0 };
  const items: CartItem[] = (api.items || []).map((it) => ({
    id: it._id,
    productId: it.productId?._id,
    title: it.productId?.title ?? "",
    price: it.price ?? it.productId?.price ?? 0,
    quantity: it.quantity ?? 0,
    image: it.productId?.images?.[0] ?? "",
  }));
  return { items, totalPrice: api.totalPrice ?? 0 };
}

export async function fetchCart(token?: string): Promise<CartData> {
  const response = await fetch(`${BASE_URL}/api/v1/cart`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  });
  if (!response.ok) {
    // Return empty cart on 401/404 etc.
    return { items: [], totalPrice: 0 };
  }
  const json = await response.json();
  const apiCart: CartApi | null = json?.data?.cart ?? null;
  return mapCart(apiCart);
}

export async function removeCartItem(
  productId: string,
  token?: string
): Promise<void> {
  await fetch(`${BASE_URL}/api/v1/cart/item/${productId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  });
}

export async function updateCartItem(
  productId: string,
  quantity: number,
  token?: string
): Promise<void> {
  await fetch(`${BASE_URL}/api/v1/cart/item`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    body: JSON.stringify({ productId, quantity }),
  });
}

export async function addCartItem(
  productId: string,
  quantity: number = 1,
  token?: string
): Promise<void> {
  await fetch(`${BASE_URL}/api/v1/cart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    body: JSON.stringify({ productId, quantity }),
  });
}
