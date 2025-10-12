import { BASE_URL } from "@/lib/url";

export interface PaymentIntentRequest {
  amount: number; // Amount in cents
  currency: string;
  items: Array<{
    id: string;
    title: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  shippingAddress: {
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

export interface PaymentIntentResponse {
  success: boolean;
  clientSecret: string;
  paymentIntentId: string;
  orderId?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  error?: string;
}

export interface OrderData {
  id: string;
  status: string;
  total: number;
  items: Array<{
    _id: string;
    productId: string;
    title: string;
    price: number;
    quantity: number;
    image: string;
  }>;
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
  createdAt: string;
  paymentStatus: string;
}

/**
 * Create a payment intent for Stripe
 */
export async function createPaymentIntent(
  paymentData: PaymentIntentRequest,
  token?: string
): Promise<PaymentIntentResponse> {
  const response = await fetch(`${BASE_URL}/api/v1/payments/create-intent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to create payment intent");
  }

  return response.json();
}

/**
 * Confirm a payment intent
 */
export async function confirmPayment(
  paymentIntentId: string,
  token?: string
): Promise<PaymentResult> {
  const response = await fetch(`${BASE_URL}/api/v1/payments/confirm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ paymentIntentId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to confirm payment");
  }

  return response.json();
}

/**
 * Get payment status
 */
export async function getPaymentStatus(
  paymentIntentId: string,
  token?: string
): Promise<PaymentResult> {
  const response = await fetch(
    `${BASE_URL}/api/v1/payments/status/${paymentIntentId}`,
    {
      method: "GET",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to get payment status");
  }

  return response.json();
}

/**
 * Get order details after successful payment
 */
export async function getOrderDetails(
  orderId: string,
  token?: string
): Promise<OrderData> {
  const response = await fetch(
    `${BASE_URL}/api/v1/payments/orders/${orderId}`,
    {
      method: "GET",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to get order details");
  }

  const data = await response.json();
  return data.order;
}

/**
 * Get user's order history
 */
export async function getUserOrders(token?: string): Promise<OrderData[]> {
  const response = await fetch(`${BASE_URL}/api/v1/payments/orders`, {
    method: "GET",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to get orders");
  }

  const data = await response.json();
  return data.orders || [];
}
