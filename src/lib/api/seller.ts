import { BASE_URL } from "@/lib/url";

export interface SellerStats {
  totalProducts: number;
  ordersReceived: number;
  monthlyEarnings: number;
  newMessages: number;
  ordersBreakdown: {
    pending: number;
    shipped: number;
    delivered: number;
  };
}

export interface SellerOrder {
  id: string;
  customerName: string;
  products: Array<{
    name: string;
    quantity: number;
  }>;
  totalAmount: number;
  status: "pending" | "shipped" | "delivered" | "cancelled";
  date: string;
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
  id: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  monthlyCapacity: number;
  logo?: string;
}

// Dashboard Stats
export const fetchSellerStats = async (
  token?: string
): Promise<SellerStats> => {
  const response = await fetch(`${BASE_URL}/api/v1/seller/stats`, {
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

  const response = await fetch(`${BASE_URL}/api/v1/seller/orders?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch seller orders");
  }

  const data = await response.json();
  return data.data || data;
};

export const updateOrderStatus = async (
  orderId: string,
  status: string,
  token?: string
): Promise<void> => {
  const response = await fetch(
    `${BASE_URL}/api/v1/seller/orders/${orderId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    }
  );

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
export const fetchSellerProfile = async (
  token?: string
): Promise<SellerProfile> => {
  const response = await fetch(`${BASE_URL}/api/v1/seller/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch seller profile");
  }

  const data = await response.json();
  return data.data || data;
};

export const updateSellerProfile = async (
  profileData: Partial<SellerProfile> & { logo?: File },
  token?: string
): Promise<SellerProfile> => {
  const formData = new FormData();

  Object.entries(profileData).forEach(([key, value]) => {
    if (value !== undefined && key !== "logo") {
      formData.append(key, String(value));
    }
  });

  if (profileData.logo) {
    formData.append("logo", profileData.logo);
  }

  const response = await fetch(`${BASE_URL}/api/v1/seller/profile`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to update seller profile");
  }

  const data = await response.json();
  return data.data || data;
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
