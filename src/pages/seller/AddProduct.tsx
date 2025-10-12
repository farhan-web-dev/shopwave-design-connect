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
import { ImageUpload } from "@/components/ui/image-upload";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createProduct, type CreateProductData } from "@/lib/api/products";
import { useAuth } from "@/contexts/AuthContext";
import { fetchCategories, type Category } from "@/lib/api/categories";
import { useToast } from "@/hooks/use-toast";

const addProductSchema = z.object({
  title: z.string().min(1, "Product title is required"),
  description: z.string().min(1, "Product description is required"),
  categoryId: z.string().min(1, "Category is required"), // Backend expects categoryId
  price: z.number().min(0, "Price must be positive"),
  stock: z.number().min(0, "Stock must be non-negative"),
  images: z.array(z.string()).min(1, "At least one image is required"),
  freeShipping: z.boolean().optional(),
  condition: z.enum(["new", "used"]).optional(),
  isAuction: z.boolean().optional(),
  auctionEndDate: z.string().optional(),
});

type AddProductForm = z.infer<typeof addProductSchema>;

const AddProduct = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddProductForm>({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: "", // Backend expects categoryId
      price: 0,
      stock: 0,
      images: [],
      freeShipping: false,
      condition: "new",
      isAuction: false,
      auctionEndDate: "",
    },
  });

  // Fetch categories
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  // // Debug logging
  // console.log("Categories state:", {
  //   categories,
  //   categoriesLoading,
  //   categoriesError,
  //   categoriesLength: categories.length,
  // });

  // If categories are not loading and there's an error, show some test categories
  const displayCategories =
    categories.length > 0
      ? categories
      : !categoriesLoading && categoriesError
      ? [
          { id: "1", name: "Electronics" },
          { id: "2", name: "Clothing" },
          { id: "3", name: "Home & Garden" },
          { id: "4", name: "Sports" },
          { id: "5", name: "Books" },
        ]
      : categories;

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: (data: CreateProductData) =>
      createProduct(data, token || undefined),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      navigate("/seller/products");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: AddProductForm) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (
      !data.title ||
      !data.description ||
      !data.categoryId ||
      data.price <= 0
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (imageUrls.length === 0) {
      toast({
        title: "Error",
        description: "Please upload at least one image",
        variant: "destructive",
      });
      return;
    }

    const productData: CreateProductData = {
      sellerId: user.id,
      title: data.title,
      description: data.description,
      categoryId: data.categoryId, // Backend expects categoryId (the actual ID)
      price: data.price,
      stock: data.stock,
      images: imageUrls,
      freeShipping: data.freeShipping,
      condition: data.condition,
      isAuction: data.isAuction,
      auctionEndDate: data.auctionEndDate,
    };

    // console.log("Submitting product data:", productData);
    createProductMutation.mutate(productData);
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
            {/* Product Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Product Title</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Enter product title"
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select onValueChange={(value) => setValue("categoryId", value)}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      categoriesLoading
                        ? "Loading categories..."
                        : categoriesError
                        ? "Error loading categories"
                        : displayCategories.length === 0
                        ? "No categories available"
                        : "Select a category"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {categoriesLoading ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500">
                      Loading categories...
                    </div>
                  ) : displayCategories.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500">
                      No categories available
                    </div>
                  ) : (
                    displayCategories
                      .filter(
                        (category) =>
                          category &&
                          category.name &&
                          (category.id !== undefined ||
                            category._id !== undefined)
                      )
                      .map((category) => (
                        <SelectItem
                          key={String(category.id)}
                          value={String(category.id)} // Use category ID as value
                        >
                          {category.name}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-red-600">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            {/* Price and Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <Input
                    id="price"
                    {...register("price", { valueAsNumber: true })}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    className="pl-8"
                  />
                </div>
                {errors.price && (
                  <p className="text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  {...register("stock", { valueAsNumber: true })}
                  placeholder="0"
                  type="number"
                />
                {errors.stock && (
                  <p className="text-sm text-red-600">{errors.stock.message}</p>
                )}
              </div>
            </div>

            {/* Product Images */}
            <div className="space-y-2">
              <Label>Product Images</Label>
              <ImageUpload
                maxImages={5}
                onImagesChange={(files) => {
                  // Convert files to URLs (you might want to upload to a service first)
                  const urls = files.map((file) => URL.createObjectURL(file));
                  setImageUrls(urls);
                  setValue("images", urls);
                }}
              />
              {errors.images && (
                <p className="text-sm text-red-600">{errors.images.message}</p>
              )}
            </div>

            {/* Product Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Product Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Provide a comprehensive description of your product, including features, benefits, and specifications"
                rows={6}
              />
              {errors.description && (
                <p className="text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Product Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("condition", value as "new" | "used")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                  </SelectContent>
                </Select>
                {errors.condition && (
                  <p className="text-sm text-red-600">
                    {errors.condition.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="freeShipping"
                    checked={watch("freeShipping")}
                    onCheckedChange={(checked) =>
                      setValue("freeShipping", !!checked)
                    }
                  />
                  <Label htmlFor="freeShipping">Free Shipping</Label>
                </div>
              </div>
            </div>

            {/* Auction Options */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isAuction"
                  checked={watch("isAuction")}
                  onCheckedChange={(checked) => {
                    setValue("isAuction", !!checked);
                    if (!checked) {
                      setValue("auctionEndDate", "");
                    }
                  }}
                />
                <Label htmlFor="isAuction">This is an auction product</Label>
              </div>

              {watch("isAuction") && (
                <div className="space-y-2">
                  <Label htmlFor="auctionEndDate">Auction End Date</Label>
                  <Input
                    id="auctionEndDate"
                    {...register("auctionEndDate")}
                    type="datetime-local"
                    placeholder="Select auction end date"
                  />
                  {errors.auctionEndDate && (
                    <p className="text-sm text-red-600">
                      {errors.auctionEndDate.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={createProductMutation.isPending}
            className="bg-amber-700 hover:bg-amber-800 text-white px-8"
          >
            {createProductMutation.isPending ? "Creating..." : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
