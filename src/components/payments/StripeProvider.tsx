import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    "pk_test_51SGzcvFMq9ByFvzvO4zoI4Tq7iXiGDIfqMNkjieRadhQpWrlE1gYfNt0cMKR27I43OiwjxnsPq9yT6kXxkYteXb0006h9nKduy"
);

interface StripeProviderProps {
  children: React.ReactNode;
  clientSecret?: string;
}

export const StripeProvider = ({
  children,
  clientSecret,
}: StripeProviderProps) => {
  const options = {
    clientSecret,
    appearance: {
      theme: "stripe" as const,
      variables: {
        colorPrimary: "#0f172a",
        colorBackground: "#ffffff",
        colorText: "#0f172a",
        colorDanger: "#ef4444",
        fontFamily: "Inter, system-ui, sans-serif",
        spacingUnit: "4px",
        borderRadius: "8px",
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
};
