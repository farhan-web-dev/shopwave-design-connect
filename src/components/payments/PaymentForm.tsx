import { useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { confirmPayment } from "@/lib/api/payments";
import { useAuth } from "@/contexts/AuthContext";

interface PaymentFormProps {
  paymentIntentId: string;
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
}

export const PaymentForm = ({
  paymentIntentId,
  onSuccess,
  onError,
}: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { token } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Submit the payment form
      const { error: submitError } = await elements.submit();
      if (submitError) {
        onError(submitError.message || "Payment form submission failed");
        return;
      }

      // Confirm the payment
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: "if_required",
      });

      if (result.error) {
        onError(result.error.message || "Payment failed");
      } else {
        // Payment succeeded, confirm with backend
        try {
          const paymentResult = await confirmPayment(paymentIntentId, token);
          if (paymentResult.success) {
            toast.success("Payment successful!");
            onSuccess(paymentResult.paymentIntentId || "");
          } else {
            onError(paymentResult.error || "Payment confirmation failed");
          }
        } catch (confirmError) {
          console.error("Payment confirmation error:", confirmError);
          onError("Payment confirmation failed");
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      onError("An unexpected error occurred during payment");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border rounded-lg p-4">
        <PaymentElement />
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? "Processing..." : "Complete Payment"}
      </Button>
    </form>
  );
};
