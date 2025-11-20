import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { createSellerProfile } from "@/lib/api/sellers";

const SellerOnboarding = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [form, setForm] = useState({
    storeName: "",
    storeAddress: "",
    description: "",
    logo: null as File | null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.storeName) {
      toast.error("Store name is required");
      return;
    }

    if (!token) {
      toast.error("You must be logged in");
      return;
    }

    setIsLoading(true);
    try {
      const response = await createSellerProfile(
        {
          storeName: form.storeName,
          storeAddress: form.storeAddress || undefined,
          description: form.description || undefined,
          logo: form.logo || undefined,
          userId: user._id || user.id,
        },
        token
      );

      const onboardingUrl = response?.data?.stripeOnboardingUrl;

      if (onboardingUrl) {
        // ✅ Redirect user to Stripe onboarding
        window.location.href = onboardingUrl;
        return;
      }

      toast.success("Seller profile created");
      navigate("/"); // fallback
    } catch (err) {
      toast.error("Failed to create seller profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Create Seller Profile</CardTitle>
          <CardDescription>
            Provide details to finish setting up your seller account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                value={form.storeName}
                onChange={(e) =>
                  setForm({ ...form, storeName: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeAddress">Store Address</Label>
              <Input
                id="storeAddress"
                value={form.storeAddress}
                onChange={(e) =>
                  setForm({ ...form, storeAddress: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo">Banner (optional)</Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setForm({ ...form, logo: e.target.files?.[0] || null })
                }
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Create Seller Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerOnboarding;
