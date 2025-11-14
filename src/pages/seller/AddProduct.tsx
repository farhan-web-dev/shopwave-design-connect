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
import { BASE_URL } from "@/lib/url";

const addProductSchema = z.object({
  title: z.string().min(1, "Product title is required"),
  description: z.string().min(1, "Product description is required"),
  categoryId: z.string().min(1, "Category is required"), // Backend expects categoryId
  price: z.number().min(0, "Price must be positive"),
  stock: z.number().min(0, "Stock must be non-negative"),
  images: z.any().refine((val) => val && val.length > 0, {
    message: "At least one image is required",
  }),
  freeShipping: z.boolean().optional(),
  condition: z.enum(["new", "used"]).optional(),
  isAuction: z.boolean().optional(),
  auctionEndDate: z.string().optional(),
  duration: z.string().optional(),
  previewVideo: z.string().optional(),
  videos: z.array(z.any()).optional(),
});

type AddProductForm = z.infer<typeof addProductSchema>;

const AddProduct = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { toast } = useToast();
  // const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadingPreview, setUploadingPreview] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(false);
  const [previewVideoUrl, setPreviewVideoUrl] = useState("");
  const [uploadedVideos, setUploadedVideos] = useState<any[]>([]);

  const handleMuxUpload = async (file: File, type: "preview" | "video") => {
    if (!file) return;
    try {
      type === "preview" ? setUploadingPreview(true) : setUploadingVideos(true);

      // Step 1: Create upload
      const res = await fetch(`${BASE_URL}/api/v1/mux/create-upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      // Step 2: Upload directly to Mux
      await fetch(data.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      // Step 3: Wait a bit for Mux to process (2-3 seconds)
      await new Promise((r) => setTimeout(r, 3000));

      // Step 4: Get the playback ID
      const playbackRes = await fetch(
        `${BASE_URL}/api/v1/mux/get-playback/${data.uploadId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const playbackData = await playbackRes.json();

      if (!playbackData.playbackId) throw new Error("Playback not ready");

      if (type === "preview") {
        setPreviewVideoUrl(playbackData.playbackId);
      } else {
        setUploadedVideos((prev) => [
          ...prev,
          {
            title: file.name,
            url: playbackData.playbackId,
          },
        ]);
      }

      toast({
        title: "Upload complete",
        description: "Video is ready to play",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to upload video",
        variant: "destructive",
      });
    } finally {
      type === "preview"
        ? setUploadingPreview(false)
        : setUploadingVideos(false);
    }
  };

  const handleMuxMultipleUpload = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      await handleMuxUpload(file, "video");
    }
  };

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
      duration: "",
      previewVideo: "",
      videos: [],
    },
  });
  console.log(errors);

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

  const selectedCategoryId = watch("categoryId");
  const selectedCategory = displayCategories.find(
    (c) => String(c.id) === selectedCategoryId
  );
  const isCourseCategory = selectedCategory?.name
    ?.toLowerCase()
    .includes("course");

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
    console.log("submit");
    if (!user?.id) return;

    const baseProduct = {
      sellerId: user.id,
      title: data.title,
      description: data.description,
      categoryId: data.categoryId,
      price: data.price,
      type: isCourseCategory ? "course" : "physical",
      images: imageFiles,
    };

    let productData;

    if (isCourseCategory) {
      productData = {
        ...baseProduct,
        courseThumbnail: imageFiles?.[0], // like normal image upload
        duration: data.duration,
        type: "course",
        previewVideo: previewVideoUrl,
        videos: uploadedVideos,
      };
    } else {
      productData = {
        ...baseProduct,
        stock: data.stock,
        freeShipping: data.freeShipping,
        condition: data.condition,
        isAuction: data.isAuction,
        auctionEndDate: data.auctionEndDate,
      };
    }
    console.log("p", productData);
    createProductMutation.mutate(productData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Add New Product
        </h1>
        <p className="text-gray-600 mt-2 text-sm md:text-base">
          Fill out the details to list your new product on your store.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-10">
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
                <SelectContent className="max-h-60 overflow-y-auto">
                  {displayCategories.map((category) => (
                    <SelectItem
                      key={String(category.id)}
                      value={String(category.id)}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-red-600">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Product Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Enter full product description"
                rows={5}
              />
              {errors.description && (
                <p className="text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
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
            </div>

            {/* Product Type Conditional Fields */}
            {isCourseCategory ? (
              <>
                {/* 🔹 Thumbnail (ImageUpload like before) */}
                <div className="space-y-2">
                  <Label>Course Thumbnail</Label>
                  <ImageUpload
                    maxImages={1}
                    onImagesChange={(files) => {
                      setImageFiles(files);
                      setValue("images", files, { shouldValidate: true });
                    }}
                  />
                </div>

                {/* 🔹 Course Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration">Course Duration</Label>
                  <Input
                    id="duration"
                    placeholder="e.g. 5 hours"
                    {...register("duration")}
                  />
                </div>

                {/* 🔹 Preview Video Upload (to Mux) */}
                <div className="space-y-2">
                  <Label htmlFor="previewVideo">Preview Video</Label>
                  <Input
                    id="previewVideo"
                    type="file"
                    accept="video/*"
                    onChange={(e) =>
                      handleMuxUpload(e.target.files?.[0], "preview")
                    }
                  />
                  {uploadingPreview && (
                    <p className="text-sm text-muted-foreground">
                      Uploading preview video...
                    </p>
                  )}
                </div>

                {/* 🔹 Course Videos Upload */}
                <div className="space-y-2">
                  <Label htmlFor="videos">Course Videos</Label>
                  <Input
                    id="videos"
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={(e) => handleMuxMultipleUpload(e.target.files)}
                  />
                  {uploadingVideos && (
                    <p className="text-sm text-muted-foreground">
                      Uploading course videos...
                    </p>
                  )}
                  {uploadedVideos.length > 0 && (
                    <ul className="text-sm list-disc pl-4">
                      {uploadedVideos.map((v, i) => (
                        <li key={i}>{v.title}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Normal Product Fields (same as before) */}
                {/* Price & Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input
                      id="stock"
                      {...register("stock", { valueAsNumber: true })}
                      placeholder="0"
                      type="number"
                    />
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-2">
                  <Label>Product Images</Label>
                  <ImageUpload
                    maxImages={5}
                    onImagesChange={(files) => {
                      setImageFiles(files);
                      setValue("images", files, { shouldValidate: true });
                    }}
                  />
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  </div>

                  <div className="flex items-center space-x-2 mt-4 sm:mt-8">
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

                {/* Auction */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isAuction"
                      checked={watch("isAuction")}
                      onCheckedChange={(checked) => {
                        setValue("isAuction", !!checked);
                        if (!checked) setValue("auctionEndDate", "");
                      }}
                    />
                    <Label htmlFor="isAuction">
                      This is an auction product
                    </Label>
                  </div>

                  {watch("isAuction") && (
                    <div className="space-y-2">
                      <Label htmlFor="auctionEndDate">Auction End Date</Label>
                      <Input
                        id="auctionEndDate"
                        {...register("auctionEndDate")}
                        type="datetime-local"
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={createProductMutation.isPending}
            className="w-full sm:w-auto bg-amber-700 hover:bg-amber-800 text-white px-6 py-2"
          >
            {createProductMutation.isPending ? "Creating..." : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
