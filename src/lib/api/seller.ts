import { BASE_URL } from "@/lib/url";

export interface SellerStats {
  totalProducts: number;
  orders: {
    pending: number;
    shipped: number;
    delivered: number;
    total: number;
  };
  monthlyEarnings: number;
  newMessages: number;
  salesOverview: {
    labels: string[];
    data: number[];
  };
}

export interface SellerOrder {
  _id: string;
  buyerId: {
    _id: string;
    name: string;
    email: string;
    id: string;
  };
  sellerId: {
    _id: string;
    id: string;
  };
  items: Array<{
    _id: string;
    productId: string;
    title: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  subtotal: number;
  total: number;
  shipping: number;
  currency: string;
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  paymentIntentId: string;
  createdAt: string;
  updatedAt: string;
  shippingAddress?: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface SellerMessage {
  id: string;
  senderName: string;
  senderId: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

export interface SellerProfile {
  _id: string;
  userId: string;
  storeName: string;
  email?: string;
  phoneNumber?: string;
  storeAddress?: string;
  description?: string;
  logo?: string;
  verificationStatus: "pending" | "approved" | "rejected";
  earnings: number;
  createdAt: string;
  updatedAt: string;
}

// Dashboard Stats
export const fetchSellerStats = async (
  token?: string
): Promise<SellerStats> => {
  const response = await fetch(`${BASE_URL}/api/v1/analytics/seller`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch seller stats");
  }

  const data = await response.json();
  return data.data || data;
};

// Orders
export const fetchSellerOrders = async (
  token?: string,
  filters?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<SellerOrder[]> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom);
  if (filters?.dateTo) params.append("dateTo", filters.dateTo);

  const response = await fetch(`${BASE_URL}/api/v1/orders?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch seller orders");
  }

  const data = await response.json();
  // console.log("API Response:", data); // Debug log

  // Handle different possible response structures
  if (Array.isArray(data)) {
    return data;
  }

  // Handle the actual API structure: {status: 'success', results: 1, data: {orders: [...]}}
  if (data.data && data.data.orders && Array.isArray(data.data.orders)) {
    return data.data.orders;
  }

  if (data.orders && Array.isArray(data.orders)) {
    return data.orders;
  }

  if (data.data && Array.isArray(data.data)) {
    return data.data;
  }

  // If none of the above, return empty array
  console.warn("Unexpected API response structure:", data);
  return [];
};

export const updateOrderStatus = async (
  orderId: string,
  orderStatus: string,
  token?: string
): Promise<void> => {
  const response = await fetch(`${BASE_URL}/api/v1/orders/${orderId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ orderStatus }),
  });

  if (!response.ok) {
    throw new Error("Failed to update order status");
  }
};

// Messages
export const fetchSellerMessages = async (
  token?: string
): Promise<SellerMessage[]> => {
  const response = await fetch(`${BASE_URL}/api/v1/seller/messages`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch messages");
  }

  const data = await response.json();
  return data.data || data;
};

export const sendMessage = async (
  recipientId: string,
  message: string,
  token?: string,
  attachments?: File[]
): Promise<void> => {
  const formData = new FormData();
  formData.append("recipientId", recipientId);
  formData.append("message", message);

  if (attachments) {
    attachments.forEach((file, index) => {
      formData.append(`attachments[${index}]`, file);
    });
  }

  const response = await fetch(`${BASE_URL}/api/v1/seller/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to send message");
  }
};

export const markMessageAsRead = async (
  messageId: string,
  token?: string
): Promise<void> => {
  const response = await fetch(
    `${BASE_URL}/api/v1/seller/messages/${messageId}/read`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to mark message as read");
  }
};

// Seller Profile
export const fetchSellerProfileByUser = async (
  userId: string,
  token?: string
): Promise<SellerProfile> => {
  const response = await fetch(`${BASE_URL}/api/v1/sellers/by-user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch seller profile");
  }

  const data = await response.json();
  // console.log("API Response:", data);
  return data?.data?.profile || data?.profile || data;
};

export const fetchSellerProfile = async (
  id: string
): Promise<SellerProfile> => {
  const response = await fetch(`${BASE_URL}/api/v1/sellers/${id}`, {
    // headers: {
    //   Authorization: `Bearer ${token}`,
    // },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch seller profile");
  }

  const data = await response.json();
  // console.log("API Response:", data);
  return data?.data?.profile || data?.profile || data;
};

export const updateSellerProfile = async (
  sellerId: string,
  profileData: Partial<Omit<SellerProfile, "logo">> & { logo?: File },
  token?: string
): Promise<SellerProfile> => {
  // Try a different approach - send JSON with base64 logo
  if (profileData.logo) {
    const { logo, ...otherData } = profileData;

    // Convert logo to base64
    const base64Logo = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result); // Keep the full data URL
      };
      reader.onerror = reject;
      reader.readAsDataURL(logo);
    });

    const dataWithLogo = {
      ...otherData,
      logo: base64Logo,
    };

    // console.log("Sending JSON with base64 logo:", {
    //   ...dataWithLogo,
    //   logo: `[base64 data - ${base64Logo.length} chars]`,
    // });

    const response = await fetch(`${BASE_URL}/api/v1/sellers/${sellerId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dataWithLogo),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Update with logo failed:", errorData);
      throw new Error(
        errorData.message || "Failed to update seller profile with logo"
      );
    }

    const data = await response.json();
    // console.log("Update with logo response:", data);
    return data.data || data;
  } else {
    // Send as JSON for regular updates
    const { logo, ...jsonData } = profileData;

    // console.log("Sending JSON data:", jsonData);

    const response = await fetch(`${BASE_URL}/api/v1/sellers/${sellerId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(jsonData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Update failed:", errorData);
      throw new Error(errorData.message || "Failed to update seller profile");
    }

    const data = await response.json();
    // console.log("Update response:", data);
    return data.data || data;
  }
};

// Sales Chart Data
export const fetchSalesChartData = async (
  token?: string,
  months: number = 6
): Promise<Array<{ month: string; sales: number }>> => {
  const response = await fetch(
    `${BASE_URL}/api/v1/seller/sales-chart?months=${months}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch sales chart data");
  }

  const data = await response.json();
  return data.data || data;
};
