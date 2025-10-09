import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ImageUpload } from "@/components/ui/image-upload";
import { ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

const addProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  category: z.string().min(1, "Category is required"),
  price: z.string().min(1, "Price is required"),
  quantity: z.string().min(1, "Quantity is required"),
  shortDescription: z
    .string()
    .max(160, "Short description must be less than 160 characters"),
  detailedDescription: z.string().min(1, "Detailed description is required"),
  weight: z.string().optional(),
  dimensions: z.string().optional(),
  freeShipping: z.boolean().optional(),
  sku: z.string().optional(),
  eanUpc: z.string().optional(),
});

type AddProductForm = z.infer<typeof addProductSchema>;

const AddProduct = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<File[]>([]);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddProductForm>({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      name: "Vintage Leather Satchel",
      price: "99.99",
      quantity: "200",
      freeShipping: false,
      weight: "0.5",
      dimensions: "20x15x5",
      sku: "SKU-PROD-001",
      eanUpc: "1234567890123",
    },
  });

  const categories = [
    "Electronics",
    "Clothing & Accessories",
    "Home & Garden",
    "Sports & Outdoors",
    "Books & Media",
    "Health & Beauty",
    "Toys & Games",
    "Automotive",
    "Food & Beverage",
    "Office Supplies",
  ];

  const onSubmit = async (data: AddProductForm) => {
    try {
      const formData = new FormData();

      // Append form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // Append images
      images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Product added successfully!");
      navigate("/seller/products");
    } catch (error) {
      toast.error("Failed to add product. Please try again.");
      console.error("Error adding product:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-gray-600 mt-2">
          Fill out the details to list your new product on your store.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter product name"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(value) => setValue("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Price and Quantity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <Input
                    id="price"
                    {...register("price")}
                    placeholder="0.00"
                    className="pl-8"
                  />
                </div>
                {errors.price && (
                  <p className="text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity in Stock</Label>
                <Input
                  id="quantity"
                  {...register("quantity")}
                  placeholder="0"
                  type="number"
                />
                {errors.quantity && (
                  <p className="text-sm text-red-600">
                    {errors.quantity.message}
                  </p>
                )}
              </div>
            </div>

            {/* Product Images */}
            <div className="space-y-2">
              <Label>Product Images (Max 5)</Label>
              <ImageUpload maxImages={5} onImagesChange={setImages} />
            </div>

            {/* Short Description */}
            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <Textarea
                id="shortDescription"
                {...register("shortDescription")}
                placeholder="A concise summary of your product (max 160 characters)"
                rows={3}
              />
              {errors.shortDescription && (
                <p className="text-sm text-red-600">
                  {errors.shortDescription.message}
                </p>
              )}
            </div>

            {/* Detailed Description */}
            <div className="space-y-2">
              <Label htmlFor="detailedDescription">
                Detailed Product Description
              </Label>
              <Textarea
                id="detailedDescription"
                {...register("detailedDescription")}
                placeholder="Provide a comprehensive description of your product, including features, benefits, and specifications"
                rows={6}
              />
              {errors.detailedDescription && (
                <p className="text-sm text-red-600">
                  {errors.detailedDescription.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Shipping Details */}
        <Card className="bg-white shadow-sm">
          <Collapsible open={shippingOpen} onOpenChange={setShippingOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer">
                <div className="flex items-center justify-between">
                  <CardTitle>Shipping Details</CardTitle>
                  {shippingOpen ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      {...register("weight")}
                      placeholder="0.0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dimensions">Parcel (L x W x H)</Label>
                    <Input
                      id="dimensions"
                      {...register("dimensions")}
                      placeholder="0x0x0"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="freeShipping"
                    checked={watch("freeShipping")}
                    onCheckedChange={(checked) =>
                      setValue("freeShipping", !!checked)
                    }
                  />
                  <Label htmlFor="freeShipping">Offer free shipping</Label>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Advanced Options */}
        <Card className="bg-white shadow-sm">
          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer">
                <div className="flex items-center justify-between">
                  <CardTitle>Advanced Options</CardTitle>
                  {advancedOpen ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                    <Input
                      id="sku"
                      {...register("sku")}
                      placeholder="Enter SKU"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eanUpc">EAN/UPC</Label>
                    <Input
                      id="eanUpc"
                      {...register("eanUpc")}
                      placeholder="Enter EAN/UPC"
                    />
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-amber-700 hover:bg-amber-800 text-white px-8"
          >
            {isSubmitting ? "Saving..." : "Save Product"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
