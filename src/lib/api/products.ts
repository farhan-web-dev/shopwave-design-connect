import { BASE_URL } from "@/lib/url";

export interface ProductApi {
  id?: string | number;
  _id?: string | number;
  title?: string;
  name?: string;
  description?: string;
  price?: number | string;
  image?: string;
  imageUrl?: string;
  images?: string[];
  stock?: number;
  quantity?: number;
  category?: string | { name?: string; id?: string | number };
  categoryId?: string | number | { _id?: string | number; name?: string };
  badge?: string;
  type?: string;
  preveiwVideo?: string;
  duration?: string;
  videos?: (string | File)[];
  sellerId?:
    | string
    | number
    | { _id?: string | number; id?: string | number; name?: string };
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  image: string;
  images?: string[];
  stock?: number;
  category?: string;
  categoryId?: string;
  badge?: string;
  sellerId?: string;
  type?: string;
  preveiwVideo?: string;
  duration?: string;
  videos?: (string | File)[];
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

export type MyProduct = Product;

export async function fetchMyProducts(token?: string): Promise<MyProduct[]> {
  const url = `${BASE_URL}/api/v1/products/my-products`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) throw new Error("Failed to fetch my products");
  const json = await response.json();
  console.log("my products", json);
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
  return withValidId.map(mapProduct);
}

export async function fetchSellerProducts(
  sellerId?: string
): Promise<MyProduct[]> {
  const url = `${BASE_URL}/api/v1/products/seller/${sellerId}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      // ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) throw new Error("Failed to fetch seller products");
  const json = await response.json();
  console.log("seller products", json);
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
  return withValidId.map(mapProduct);
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
  // console.log("products", json);
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
  const images = api.images || (api.image ? [api.image] : []);
  const description = api.description || "";
  const stock =
    typeof api.stock === "number"
      ? api.stock
      : typeof api.quantity === "number"
      ? api.quantity
      : undefined;
  const categoryName = (() => {
    if (typeof api.category === "string") return api.category;
    if (api.category && typeof api.category === "object") {
      const name = (api.category as { name?: string }).name;
      if (name) return String(name);
    }
    if (api.categoryId && typeof api.categoryId === "object") {
      const name = (api.categoryId as { name?: string }).name;
      if (name) return String(name);
    }
    return undefined;
  })();
  const mappedCategoryId = (() => {
    if (api.categoryId !== undefined && api.categoryId !== null) {
      if (typeof api.categoryId === "object") {
        const id = (api.categoryId as { _id?: string | number })._id;
        if (id !== undefined && id !== null) return String(id);
      } else if (
        typeof api.categoryId === "string" ||
        typeof api.categoryId === "number"
      ) {
        return String(api.categoryId);
      }
    }
    if (api.category && typeof api.category === "object") {
      const id = (api.category as { id?: string | number }).id;
      if (id !== undefined && id !== null) return String(id);
    }
    return undefined;
  })();
  const mappedSellerId = (() => {
    if (api.sellerId !== undefined && api.sellerId !== null) {
      if (typeof api.sellerId === "object") {
        const id =
          (api.sellerId as { _id?: string | number })._id ||
          (api.sellerId as { id?: string | number }).id;
        if (id !== undefined && id !== null) return String(id);
      } else if (
        typeof api.sellerId === "string" ||
        typeof api.sellerId === "number"
      ) {
        return String(api.sellerId);
      }
    }
    return undefined;
  })();

  return {
    id,
    title,
    description,
    price: priceNum,
    image,
    images,
    stock,
    category: categoryName,
    categoryId: mappedCategoryId,
    badge: api.badge,
    sellerId: mappedSellerId,
    type: api.type,
    previewVideo: api.previewVideo ?? api.preveiwVideo ?? "",
    duration: api.duration ?? "",
    videos: api.videos ?? [],
  };
}

export async function fetchProductById(
  productId: string
): Promise<Product | null> {
  if (!productId) return null;
  const response = await fetch(`${BASE_URL}/api/v1/products/${productId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) return null;
  const json = await response.json();
  console.log(json);
  const data: ProductApi =
    json?.data?.product ?? json?.product ?? json?.data ?? json;
  if (!data) return null;
  return mapProduct(data);
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  const response = await fetch(`${BASE_URL}/api/v1/products/featured`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to fetch featured products");
  const json = await response.json();
  // console.log("f", json);
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
  // console.log("t", json);
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

export async function fetchProductsByCategory(
  categoryId: string
): Promise<Product[]> {
  if (!categoryId) return [];

  const response = await fetch(
    `${BASE_URL}/api/v1/products/category/${categoryId}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      return [];
    }
    throw new Error("Failed to fetch products by category");
  }

  const json = await response.json();
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
  // console.log("r", json);
  const rating =
    Number(json?.data?.averageRating ?? json?.averageRating ?? 0) || 0;
  const reviews =
    Number(json?.data?.totalReviews ?? json?.totalReviews ?? 0) || 0;
  return { rating, reviews };
}

export interface UpdateProductData {
  title?: string;
  price?: number;
  stock?: number;
  categoryId?: string;
  image?: string;
}

export async function updateProduct(
  productId: string,
  data: UpdateProductData,
  token?: string
): Promise<Product> {
  const url = `${BASE_URL}/api/v1/products/${productId}`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update product: ${errorText}`);
  }

  const json = await response.json();
  const productData = json?.data ?? json;
  return mapProduct(productData);
}

export async function deleteProduct(
  productId: string,
  token?: string
): Promise<void> {
  const url = `${BASE_URL}/api/v1/products/${productId}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete product: ${errorText}`);
  }
}

export interface CreateProductData {
  sellerId: string;
  title: string;
  description: string;
  categoryId: string;
  price: number;
  stock: number;
  images?: (File | string)[]; // can handle File objects or URLs (optional)
  freeShipping?: boolean;
  condition?: "new" | "used";
  isAuction?: boolean;
  auctionEndDate?: string;
  type: string;
  duration?: string;
  previewVideo?: string;
  videos?: (File | string)[];
}

export async function createProduct(
  data: CreateProductData,
  token?: string
): Promise<Product> {
  const url = `${BASE_URL}/api/v1/products`;

  const formData = new FormData();
  formData.append("sellerId", data.sellerId);
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("categoryId", data.categoryId);
  formData.append("price", String(data.price));

  // optional fields
  if (data.stock !== undefined) formData.append("stock", String(data.stock));
  if (data.freeShipping !== undefined)
    formData.append("freeShipping", String(data.freeShipping));
  if (data.condition) formData.append("condition", data.condition);
  if (data.isAuction !== undefined)
    formData.append("isAuction", String(data.isAuction));
  if (data.auctionEndDate)
    formData.append("auctionEndDate", data.auctionEndDate);
  if (data.duration) formData.append("duration", data.duration);
  if (data.type) formData.append("type", data.type);
  // ✅ append images only if they exist
  if (Array.isArray(data.images)) {
    data.images.forEach((file) => {
      formData.append("images", file);
    });
  }

  // ✅ append preview video if exists
  if (data.previewVideo) {
    formData.append("previewVideo", data.previewVideo);
  }

  // ✅ append course videos if exists
  if (Array.isArray(data.videos)) {
    data.videos.forEach((video, index) => {
      formData.append(`videos[${index}][title]`, video.title);
      formData.append(`videos[${index}][url]`, video.url);
    });
  }

  const response = await fetch(url, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error Response:", errorText);
    throw new Error(
      `Failed to create product (${response.status}): ${errorText}`
    );
  }

  const json = await response.json();
  const productData = json?.data ?? json;
  return mapProduct(productData.product || productData);
}

// lib/api/products.ts
export const searchProducts = async (query: string) => {
  const res = await fetch(
    `${BASE_URL}/api/v1/products/search?q=${encodeURIComponent(query)}`
  );

  if (!res.ok) {
    throw new Error("Failed to search products");
  }

  const json = await res.json();

  // console.log("Search API response:", json);

  // Extract the products array correctly
  const rawProducts =
    json?.data?.products ||
    (Array.isArray(json.data) ? json.data : []) ||
    (Array.isArray(json.products) ? json.products : []) ||
    [];

  // Normalize each product to match expected Product type
  const normalizedProducts = rawProducts.map((p: any) => ({
    id: p.id || p._id || p.productId,
    title: p.title || p.name || "Untitled Product",
    price: p.price ?? 0,
    image:
      p.image ||
      p.imageUrl ||
      (Array.isArray(p.images) ? p.images[0] : undefined) ||
      "/placeholder.png",
  }));

  // console.log("Search results:", normalizedProducts);

  return { products: normalizedProducts, results: normalizedProducts.length };
};
