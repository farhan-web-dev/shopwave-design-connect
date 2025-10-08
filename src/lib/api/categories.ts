import { BASE_URL } from "@/lib/url";

export interface Category {
  id: string | number;
  name: string;
  icon?: string; // URL or icon key if provided by backend
  color?: string; // optional color from backend
  imageUrl?: string; // optional image url
  slug?: string;
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(`${BASE_URL}/api/v1/categories`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  const json = await response.json();

  // Try common response shapes gracefully
  const possibleData = json?.data?.categories;

  console.log(possibleData);
  if (Array.isArray(possibleData)) {
    return possibleData as Category[];
  }

  return [];
}
