import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchSellerProfileByUser,
  updateSellerProfile,
} from "@/lib/api/seller";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Upload,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const profileSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  email: z
    .string()
    .refine((val) => val === "" || z.string().email().safeParse(val).success, {
      message: "Invalid email address",
    })
    .optional(),
  phoneNumber: z.string().optional(),
  storeAddress: z.string().optional(),
  description: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const ProfileSettings = () => {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Fetch seller profile
  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sellerProfile", user?.id],
    queryFn: () => fetchSellerProfileByUser(user?.id || "", token),
    enabled: !!user?.id && !!token,
  });

  // console.log("Profile:", profile);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      storeName: "",
      email: "",
      phoneNumber: "",
      storeAddress: "",
      description: "",
    },
  });

  // Watch form values for debugging
  const formValues = watch();
  // console.log("Current form values:", formValues);

  // Update form when profile data is loaded
  React.useEffect(() => {
    if (profile) {
      // console.log("Resetting form with profile data:", profile);
      reset({
        storeName: profile.storeName || "",
        email: profile.email || "",
        phoneNumber: profile.phoneNumber || "",
        storeAddress: profile.storeAddress || "",
        description: profile.description || "",
      });
      if (profile.logo) {
        setLogoPreview(profile.logo);
      }
    }
  }, [profile, reset]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // console.log("Logo file selected:", {
      //   name: file.name,
      //   size: file.size,
      //   type: file.type,
      // });
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileForm) => {
      if (!profile) throw new Error("Profile not found");
      const updateData = { ...data, logo: logoFile || undefined };
      // console.log("Mutation function - Profile ID:", profile._id);
      // console.log("Mutation function - Update data:", updateData);
      // console.log("Mutation function - Token:", !!token);
      return updateSellerProfile(profile._id, updateData, token);
    },
    onSuccess: (response) => {
      // console.log("Update successful:", response);
      queryClient.invalidateQueries({ queryKey: ["sellerProfile"] });
      toast.success("Profile updated successfully!");
      setLogoFile(null);
    },
    onError: (error) => {
      console.error("Update mutation error:", error);
      toast.error("Failed to update profile. Please try again.");
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    if (!profile) {
      toast.error("Profile not found");
      return;
    }
    // console.log("Form data being submitted:", data);
    // console.log("Profile ID:", profile._id);
    updateProfileMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Error Loading Profile
            </h2>
            <p className="text-gray-600">
              {error instanceof Error
                ? error.message
                : "Failed to load profile"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your store information and contact details.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Store Name */}
            <div className="space-y-2">
              <Label
                htmlFor="storeName"
                className="flex items-center space-x-2"
              >
                <Building2 className="h-4 w-4 text-gray-500" />
                <span>Store Name</span>
              </Label>
              <Input
                id="storeName"
                {...register("storeName")}
                placeholder="Enter store name"
              />
              {errors.storeName && (
                <p className="text-sm text-red-600">
                  {errors.storeName.message}
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
              <Label
                htmlFor="phoneNumber"
                className="flex items-center space-x-2"
              >
                <Phone className="h-4 w-4 text-gray-500" />
                <span>Phone Number</span>
              </Label>
              <Input
                id="phoneNumber"
                {...register("phoneNumber")}
                placeholder="Enter phone number"
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-600">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            {/* Store Address */}
            <div className="space-y-2">
              <Label
                htmlFor="storeAddress"
                className="flex items-center space-x-2"
              >
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>Store Address</span>
              </Label>
              <Input
                id="storeAddress"
                {...register("storeAddress")}
                placeholder="Enter store address"
              />
              {errors.storeAddress && (
                <p className="text-sm text-red-600">
                  {errors.storeAddress.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="flex items-center space-x-2"
              >
                <FileText className="h-4 w-4 text-gray-500" />
                <span>Store Description</span>
              </Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Enter store description"
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Store Logo */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Store Logo</CardTitle>
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
            disabled={updateProfileMutation.isPending}
            className="bg-amber-700 hover:bg-amber-800 text-white px-8"
          >
            {updateProfileMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
