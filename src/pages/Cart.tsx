import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCart,
  removeCartItem,
  updateCartItem,
  type CartData,
} from "@/lib/api/cart";
import { useAuth } from "@/contexts/AuthContext";
import { fetchProductById } from "@/lib/api/products"; // <-- add this API helper
import GuestCheckoutModal from "@/components/payments/CheckoutMethod";

const Cart = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    if (token) {
      // Logged in → go directly
      navigate("/checkout");
    } else {
      // Guest → open modal
      setShowModal(true);
    }
  };

  // 🟢 Case 1: Logged in → fetch from backend
  const { data, isLoading, isError } = useQuery<CartData>({
    queryKey: ["cart", { token: !!token }],
    queryFn: () => fetchCart(token!),
    enabled: !!token,
    retry: false,
  });

  // 🟠 Case 2: Guest → load from localStorage
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

  // sync backend cart when data changes
  useEffect(() => {
    if (token && data?.items) {
      setCartItems(data.items);
    }
  }, [data, token]);

  const updateMutation = useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => updateCartItem(productId, quantity, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (productId: string) => removeCartItem(productId, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Item removed from cart");
    },
  });

  const updateQuantity = (productId: string, delta: number) => {
    const item = cartItems.find((i) => i.productId === productId);
    if (!item) return;
    const nextQty = Math.max(1, item.quantity + delta);

    // frontend update
    setCartItems((items) =>
      items.map((i) =>
        i.productId === productId ? { ...i, quantity: nextQty } : i
      )
    );

    if (token) {
      updateMutation.mutate({ productId, quantity: nextQty });
    } else {
      // update localStorage for guests
      const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const updated = localCart.map((i: any) =>
        i.productId === productId ? { ...i, quantity: nextQty } : i
      );
      localStorage.setItem("cart", JSON.stringify(updated));
    }
  };

  const removeItem = (productId: string) => {
    setCartItems((items) =>
      items.filter((item) => item.productId !== productId)
    );

    if (token) {
      deleteMutation.mutate(productId);
    } else {
      // remove from localStorage
      const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const updated = localCart.filter((i: any) => i.productId !== productId);
      localStorage.setItem("cart", JSON.stringify(updated));
      toast.success("Item removed from cart");
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + shipping;

  // handle loading / empty states
  if ((token && isLoading) || (!token && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading cart...
      </div>
    );
  }

  if (
    (!token && cartItems.length === 0) ||
    (token && data?.items.length === 0)
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Button asChild>
            <Link to="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (token && isError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <h2 className="text-2xl font-bold mb-4">Unable to load cart</h2>
        <Button asChild>
          <Link to="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center sm:text-left">
          Shopping Cart
        </h1>

        {/* Responsive grid: stack on mobile, 3-col on large */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.productId}>
                <CardContent className="p-4">
                  {/* Stack image & content on small screens */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full sm:w-24 sm:h-24 h-48 object-cover rounded-lg"
                    />

                    <div className="flex-1">
                      <h3 className="font-medium mb-1 text-center sm:text-left">
                        {item.title}
                      </h3>
                      <p className="text-lg font-bold text-primary text-center sm:text-left">
                        ${item.price.toFixed(2)}
                      </p>

                      {/* Quantity & Remove Buttons */}
                      <div className="flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-start gap-3 mt-3">
                        <div className="flex items-center border rounded-lg">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.productId, -1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="px-4 font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.productId, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.productId)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>

                    {/* Total price right-aligned on desktop, centered on mobile */}
                    <div className="text-center sm:text-right mt-4 sm:mt-0">
                      <p className="font-bold text-lg">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="sticky top-4 self-start">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 text-center sm:text-left">
                  Order Summary
                </h2>
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

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCheckoutClick}
                >
                  Proceed to Checkout
                </Button>

                <GuestCheckoutModal
                  open={showModal}
                  onClose={() => setShowModal(false)}
                  onGuestCheckout={() => {
                    setShowModal(false);
                    navigate("/checkout");
                  }}
                  onSignIn={() => {
                    setShowModal(false);
                    navigate("/login?next=/checkout");
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
