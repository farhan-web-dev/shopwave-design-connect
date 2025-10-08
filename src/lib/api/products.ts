import { BASE_URL } from "@/lib/url";

export interface ProductApi {
  id?: string | number;
  _id?: string | number;
  title?: string;
  name?: string;
  price?: number | string;
  image?: string;
  imageUrl?: string;
  images?: string[];
  badge?: string;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  badge?: string;
}

export interface FetchProductsParams {
  page?: number;
  limit?: number;
  sort?: string; // e.g., 'price' | '-price' | '-createdAt'
  search?: string; // name/title match (backend must support)
  minPrice?: number;
  maxPrice?: number;
  categoryIds?: string[];
  freeShipping?: boolean;
  express?: boolean;
}

export interface ProductsListResponse {
  products: Product[];
  results?: number;
}

export async function fetchProducts(
  params: FetchProductsParams = {}
): Promise<ProductsListResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.sort) query.set("sort", params.sort);
  if (params.search) {
    // Try common field names; backend will ignore unknowns
    query.set("name", params.search);
  }
  if (params.minPrice !== undefined)
    query.set("price[gte]", String(params.minPrice));
  if (params.maxPrice !== undefined)
    query.set("price[lte]", String(params.maxPrice));
  if (params.categoryIds && params.categoryIds.length > 0) {
    // Repeat categoryId to pass array semantics: categoryId=1&categoryId=2
    params.categoryIds.forEach((id) => query.append("categoryId", id));
  }
  // Backend does not support 'express'; when express is chosen, send freeShipping=false
  if (params.express === true) {
    query.set("freeShipping", "false");
  } else if (params.freeShipping === true) {
    query.set("freeShipping", "true");
  }

  const url = `${BASE_URL}/api/v1/products${
    query.toString() ? `?${query.toString()}` : ""
  }`;
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to fetch products");
  const json = await response.json();
  console.log("products", json);
  const list: ProductApi[] =
    json?.data?.products ?? json?.products ?? json?.data ?? [];
  const withValidId = Array.isArray(list)
    ? list.filter(
        (p) =>
          p &&
          ((p.id !== undefined && p.id !== null) ||
            (p._id !== undefined && p._id !== null))
      )
    : [];
  return { products: withValidId.map(mapProduct), results: json?.results };
}

function mapProduct(api: ProductApi): Product {
  const rawId = api.id ?? api._id;
  const id = String(rawId);
  const title = api.title || api.name || "";
  const priceNum =
    typeof api.price === "string" ? parseFloat(api.price) : api.price ?? 0;
  const image =
    api.image || api.imageUrl || (api.images && api.images[0]) || "";
  return { id, title, price: priceNum, image, badge: api.badge };
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  const response = await fetch(`${BASE_URL}/api/v1/products/featured`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to fetch featured products");
  const json = await response.json();
  console.log("f", json);
  const list: ProductApi[] =
    json?.data?.products ?? json?.products ?? json?.data ?? json;
  if (Array.isArray(list)) {
    const withValidId = list.filter(
      (p) =>
        p &&
        ((p.id !== undefined && p.id !== null) ||
          (p._id !== undefined && p._id !== null))
    );
    return withValidId.map(mapProduct);
  }
  return [];
}

export async function fetchTrendingProducts(): Promise<Product[]> {
  const response = await fetch(`${BASE_URL}/api/v1/products/trending`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to fetch trending products");
  const json = await response.json();
  console.log("t", json);
  const list: ProductApi[] =
    json?.data?.products ?? json?.products ?? json?.data ?? json;
  if (Array.isArray(list)) {
    const withValidId = list.filter(
      (p) =>
        p &&
        ((p.id !== undefined && p.id !== null) ||
          (p._id !== undefined && p._id !== null))
    );
    return withValidId.map(mapProduct);
  }
  return [];
}

export interface RatingResponse {
  rating: number; // average rating
  reviews: number; // total reviews count
}

export async function fetchProductRating(
  productId: string
): Promise<RatingResponse> {
  if (!productId || productId === "undefined") {
    return { rating: 0, reviews: 0 };
  }
  const response = await fetch(
    `${BASE_URL}/api/v1/reviews/${productId}/ratings`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
  if (!response.ok) {
    // Fallback to zero rating with no reviews if endpoint not available
    return { rating: 0, reviews: 0 };
  }
  const json = await response.json();
  console.log("r", json);
  const rating =
    Number(json?.data?.averageRating ?? json?.averageRating ?? 0) || 0;
  const reviews =
    Number(json?.data?.totalReviews ?? json?.totalReviews ?? 0) || 0;
  return { rating, reviews };
}
