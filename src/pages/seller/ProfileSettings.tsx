import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Upload,
  Building2,
  Mail,
  Phone,
  MapPin,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

const profileSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  monthlyCapacity: z.string().min(1, "Monthly capacity is required"),
});

type ProfileForm = z.infer<typeof profileSchema>;

const ProfileSettings = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      companyName: "Acme Innovations Ltd.",
      email: "contact@acmeinnovations.com",
      phone: "+1 (555) 123-4567",
      address: "123 Industrial Way, Tech City, TX 78701",
      monthlyCapacity: "10000",
    },
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileForm) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Append form fields
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Append logo if uploaded
      if (logoFile) {
        formData.append("logo", logoFile);
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
      console.error("Error updating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your company information, contact details, and monthly
          capacity.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Company Name */}
            <div className="space-y-2">
              <Label
                htmlFor="companyName"
                className="flex items-center space-x-2"
              >
                <Building2 className="h-4 w-4 text-gray-500" />
                <span>Company Name</span>
              </Label>
              <Input
                id="companyName"
                {...register("companyName")}
                placeholder="Enter company name"
              />
              {errors.companyName && (
                <p className="text-sm text-red-600">
                  {errors.companyName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>Email</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>Phone Number</span>
              </Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="Enter phone number"
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>Address</span>
              </Label>
              <Input
                id="address"
                {...register("address")}
                placeholder="Enter address"
              />
              {errors.address && (
                <p className="text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            {/* Monthly Capacity */}
            <div className="space-y-2">
              <Label
                htmlFor="monthlyCapacity"
                className="flex items-center space-x-2"
              >
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span>Monthly Capacity (Units)</span>
              </Label>
              <Input
                id="monthlyCapacity"
                {...register("monthlyCapacity")}
                placeholder="Enter monthly capacity"
                type="number"
              />
              {errors.monthlyCapacity && (
                <p className="text-sm text-red-600">
                  {errors.monthlyCapacity.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Company Logo */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Company Logo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="space-y-4">
                {/* Current Logo */}
                <div className="flex justify-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={logoPreview || "/placeholder-logo.png"} />
                    <AvatarFallback className="bg-gray-200">
                      <Building2 className="h-8 w-8 text-gray-400" />
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Current Logo</p>

                  {/* Upload Button */}
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("logo-upload")?.click()
                      }
                      className="flex items-center space-x-2"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Upload New Logo</span>
                    </Button>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    JPG, PNG, SVG up to 5MB. Recommended dimensions: 200x200px.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-amber-700 hover:bg-amber-800 text-white px-8"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
