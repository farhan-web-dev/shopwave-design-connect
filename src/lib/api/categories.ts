import { BASE_URL } from "@/lib/url";

export interface Category {
  id: string | number;
  _id?: string; // MongoDB _id field
  name: string;
  icon?: string; // URL or icon key if provided by backend
  color?: string; // optional color from backend
  imageUrl?: string; // optional image url
  slug?: string;
}

export async function fetchCategories(): Promise<Category[]> {
  const url = `${BASE_URL}/api/v1/categories`;
  console.log("Fetching categories from:", url);

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  console.log("Categories API response status:", response.status);

  if (!response.ok) {
    console.error(
      "Categories API failed:",
      response.status,
      response.statusText
    );
    throw new Error("Failed to fetch categories");
  }

  const json = await response.json();
  console.log("Categories API response:", json);

  // Try different possible response formats
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

  console.log("Extracted categories:", categories);

  // Filter out invalid categories and ensure they have required fields
  const validCategories = categories.filter((category) => {
    if (!category || typeof category !== "object") return false;
    const cat = category as Record<string, unknown>;
    // Check for both id and _id fields, and ensure name exists
    return cat.name && (cat.id !== undefined || cat._id !== undefined);
  }) as Category[];

  console.log("Valid categories:", validCategories);

  // Map backend categories to our interface format
  const mappedCategories = validCategories.map((category) => {
    const cat = category as unknown as Record<string, unknown>;
    return {
      id: cat.id || cat._id || String(cat._id), // Use id if available, otherwise _id
      _id: cat._id as string,
      name: cat.name as string,
      icon: cat.icon as string,
      color: cat.color as string,
      imageUrl: cat.imageUrl as string,
      slug: cat.slug as string,
    } as Category;
  });

  console.log("Mapped categories:", mappedCategories);
  return mappedCategories;
}
