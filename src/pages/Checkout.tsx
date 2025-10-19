import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { fetchCart, type CartData } from "@/lib/api/cart";
import {
  createPaymentIntent,
  type PaymentIntentRequest,
} from "@/lib/api/payments";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StripeProvider } from "@/components/payments/StripeProvider";
import { PaymentForm } from "@/components/payments/PaymentForm";
import { toast } from "sonner";
import { fetchProductById } from "@/lib/api/products";

const Checkout = () => {
  const { token, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);

  // --- 1️⃣ Fetch user cart if logged in
  const { data, isLoading } = useQuery<CartData>({
    queryKey: ["cart", { token: !!token }],
    queryFn: () => fetchCart(token || undefined),
    enabled: !!token,
    retry: false,
  });
  const [cartItems, setCartItems] = useState<any[]>([]);
  // --- 2️⃣ Local cart (for guests)
  const [guestCart, setGuestCart] = useState<
    {
      productId: string;
      title: string;
      price: number;
      quantity: number;
      image: string;
    }[]
  >([]);

  // useEffect(() => {
  //   const loadGuestCart = async () => {
  //     if (token) return; // skip if logged in

  //     const localCart = JSON.parse(localStorage.getItem("cart") || "[]");

  //     if (localCart.length === 0) {
  //       setCartItems([]);
  // >([]);

  useEffect(() => {
    const loadGuestCart = async () => {
      if (token) return; // skip if logged in

      const localCart = JSON.parse(localStorage.getItem("cart") || "[]");

      if (localCart.length === 0) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      // fetch each product detail
      try {
        const products = await Promise.all(
          localCart.map(async (item: any) => {
            const product = await fetchProductById(item.productId);
            return {
              ...product,
              productId: item.productId,
              quantity: item.quantity,
              price: product.price,
              title: product.title,
              image: product.image,
            };
          })
        );
        setCartItems(products);
      } catch (error) {
        console.error("Failed to fetch local cart products", error);
      } finally {
        setLoading(false);
      }
    };

    loadGuestCart();
  }, [token]);

  // Use either logged-in cart or guest cart
  const items = token ? data?.items ?? [] : cartItems;

  // --- Calculations ---
  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const shipping = subtotal > 100 ? 0 : items.length > 0 ? 10 : 0;
  const total = subtotal + shipping;

  // --- 4️⃣ Form state
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  const [paymentState, setPaymentState] = useState<{
    clientSecret: string | null;
    paymentIntentId: string | null;
    isProcessing: boolean;
  }>({
    clientSecret: null,
    paymentIntentId: null,
    isProcessing: false,
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const isFormValid =
    form.fullName.trim() &&
    form.email.trim() &&
    form.phone.trim() &&
    form.address.trim() &&
    form.city.trim() &&
    form.state.trim() &&
    form.postalCode.trim() &&
    form.country.trim();

  // --- 5️⃣ Handle payment
  const handlePay = async () => {
    if (!isFormValid || items.length === 0) return;

    setPaymentState((prev) => ({ ...prev, isProcessing: true }));

    try {
      const paymentData: PaymentIntentRequest = {
        amount: Math.round(total * 100), // Convert to cents
        currency: "usd",
        items: items.map((item) => ({
          id: item.productId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        shippingAddress: {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
          country: form.country,
        },
      };

      // Only pass token if logged in
      const paymentIntent = await createPaymentIntent(
        paymentData,
        token || undefined
      );

      setPaymentState({
        clientSecret: paymentIntent.clientSecret,
        paymentIntentId: paymentIntent.paymentIntentId,
        isProcessing: false,
      });

      toast.success("Payment form loaded successfully");
    } catch (error) {
      console.error("Payment intent creation failed:", error);
      toast.error("Failed to initialize payment. Please try again.");
      setPaymentState((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  const handlePaymentSuccess = (orderId: string) => {
    toast.success("Payment completed successfully!");
    localStorage.removeItem("cart"); // clear guest cart after success
    window.location.href = `/checkout/success?order=${orderId}`;
  };

  const handlePaymentError = (error: string) => {
    toast.error(error);
    setPaymentState({
      clientSecret: null,
      paymentIntentId: null,
      isProcessing: false,
    });
  };

  // --- 6️⃣ Render
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Section - Form + Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Form */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(form).map(([key, value]) => (
                    <div key={key}>
                      <Label htmlFor={key}>
                        {key.replace(/([A-Z])/g, " $1")}
                      </Label>
                      <Input
                        id={key}
                        name={key}
                        value={value}
                        onChange={onChange}
                        placeholder={key}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Order Items</h2>
                {isLoading && isAuthenticated ? (
                  <div className="text-sm text-muted-foreground">
                    Loading cart...
                  </div>
                ) : items.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    Your cart is empty.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center gap-4"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Section - Summary */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Summary</h2>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>

                {paymentState.clientSecret ? (
                  <StripeProvider clientSecret={paymentState.clientSecret}>
                    <PaymentForm
                      paymentIntentId={paymentState.paymentIntentId!}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </StripeProvider>
                ) : (
                  <>
                    <Button
                      className="w-full"
                      size="lg"
                      disabled={
                        !isFormValid ||
                        items.length === 0 ||
                        paymentState.isProcessing
                      }
                      onClick={handlePay}
                    >
                      {paymentState.isProcessing
                        ? "Initializing Payment..."
                        : "Pay with Card"}
                    </Button>
                    {items.length === 0 && (
                      <p className="text-xs text-center text-muted-foreground mt-3">
                        Add items to proceed to payment.
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
