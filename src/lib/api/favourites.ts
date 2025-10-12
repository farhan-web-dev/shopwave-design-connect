import { BASE_URL } from "@/lib/url";

export interface Favourite {
  _id: string;
  userId: string;
  productId: {
    _id: string;
    title: string;
    price: number;
    image?: string;
    images?: string[];
    description?: string;
    categoryId?: string;
    sellerId?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface FavouriteResponse {
  favourites: Favourite[];
}

// Add product to favourites
export async function addToFavourites(
  productId: string,
  token: string
): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/v1/favourites`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to add to favourites: ${errorText}`);
  }
}

// Remove product from favourites
export async function removeFromFavourites(
  productId: string,
  token: string
): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/v1/favourites/${productId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to remove from favourites: ${errorText}`);
  }
}

// Get all user's favourites
export async function getFavourites(token: string): Promise<Favourite[]> {
  const response = await fetch(`${BASE_URL}/api/v1/favourites`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch favourites");
  }

  const data = await response.json();
  return data.data?.favourites || data.favourites || data.data || [];
}

// Clear all favourites
export async function clearAllFavourites(token: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/v1/favourites`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to clear favourites: ${errorText}`);
  }
}

// Check if product is in favourites
export async function isProductFavourite(
  productId: string,
  token: string
): Promise<boolean> {
  try {
    const favourites = await getFavourites(token);
    return favourites.some((fav) => fav.productId._id === productId);
  } catch (error) {
    return false;
  }
}
