import { BASE_URL } from "@/lib/url";

export interface Category {
  id: string | number;
  _id?: string; // MongoDB _id field
  name: string;
  icon?: string; // URL or icon key if provided by backend
  color?: string; // optional color from backend
  imageUrl?: string; // optional image url
  slug?: string;
  parentCategoryId?: string | null; // ✅ Added for category hierarchy
}

export async function fetchCategories(): Promise<Category[]> {
  const url = `${BASE_URL}/api/v1/categories`;

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    console.error(
      "Categories API failed:",
      response.status,
      response.statusText
    );
    throw new Error("Failed to fetch categories");
  }

  const json = await response.json();

  let categories: unknown[] = [];

  if (Array.isArray(json)) {
    categories = json;
  } else if (Array.isArray(json?.data)) {
    categories = json.data;
  } else if (Array.isArray(json?.data?.categories)) {
    categories = json.data.categories;
  } else if (Array.isArray(json?.categories)) {
    categories = json.categories;
  }

  const validCategories = categories.filter((category) => {
    if (!category || typeof category !== "object") return false;
    const cat = category as Record<string, unknown>;
    return cat.name && (cat.id !== undefined || cat._id !== undefined);
  }) as Category[];

  const mappedCategories = validCategories.map((category) => {
    const cat = category as unknown as Record<string, unknown>;
    return {
      id: cat.id || cat._id || String(cat._id),
      _id: cat._id as string,
      name: cat.name as string,
      icon: cat.icon as string,
      color: cat.color as string,
      imageUrl: cat.imageUrl as string,
      slug: cat.slug as string,
      parentCategoryId:
        (cat.parentCategoryId as string) ??
        (cat.parent_category_id as string) ??
        null, // ✅ handle both camelCase or snake_case
    } as Category;
  });

  return mappedCategories;
}
