import { useState } from "react";
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

const Checkout = () => {
  const { token } = useAuth();
  const { data, isLoading } = useQuery<CartData>({
    queryKey: ["cart", { token: !!token }],
    queryFn: () => fetchCart(token || undefined),
    enabled: !!token,
    retry: false,
  });

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

  const items = data?.items ?? [];
  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const shipping = subtotal > 100 ? 0 : items.length > 0 ? 10 : 0;
  const total = subtotal + shipping;

  const isFormValid =
    form.fullName.trim() &&
    form.email.trim() &&
    form.phone.trim() &&
    form.address.trim() &&
    form.city.trim() &&
    form.state.trim() &&
    form.postalCode.trim() &&
    form.country.trim();

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

      const paymentIntent = await createPaymentIntent(paymentData, token);

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
    // Redirect to success page or clear cart
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={form.fullName}
                      onChange={onChange}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={onChange}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={form.phone}
                      onChange={onChange}
                      placeholder="+1 555 000 1234"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={form.address}
                      onChange={onChange}
                      placeholder="123 Main St"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={form.city}
                      onChange={onChange}
                      placeholder="San Francisco"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      name="state"
                      value={form.state}
                      onChange={onChange}
                      placeholder="CA"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={form.postalCode}
                      onChange={onChange}
                      placeholder="94103"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      value={form.country}
                      onChange={onChange}
                      placeholder="United States"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Order Items</h2>
                {isLoading ? (
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
                      <div key={item.id} className="flex items-center gap-4">
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
