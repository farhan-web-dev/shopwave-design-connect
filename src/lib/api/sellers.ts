import { BASE_URL } from "@/lib/url";

export interface CreateSellerPayload {
  storeName: string;
  storeAddress?: string;
  description?: string;
  logo?: File;
}

export interface SellerInfo {
  _id: string;
  storeName: string;
  storeAddress?: string;
  description?: string;
  logo?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export async function fetchSellerById(
  sellerId: string
): Promise<SellerInfo | null> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/sellers/user/${sellerId}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error("Failed to fetch seller information");
    }
    const data = await response.json();
    return data?.data?.profile || data;
  } catch (error) {
    console.error("Error fetching seller:", error);
    return null;
  }
}

export async function createSellerProfile(
  payload: CreateSellerPayload,
  token: string
): Promise<void> {
  const formData = new FormData();
  formData.append("storeName", payload.storeName);
  if (payload.storeAddress)
    formData.append("storeAddress", payload.storeAddress);
  if (payload.description) formData.append("description", payload.description);
  if (payload.logo) formData.append("logo", payload.logo);

  const res = await fetch(`${BASE_URL}/api/v1/sellers`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!res.ok) {
    const text = await res
      .text()
      .catch(() => "Failed to create seller profile");
    throw new Error(text || "Failed to create seller profile");
  }
}
