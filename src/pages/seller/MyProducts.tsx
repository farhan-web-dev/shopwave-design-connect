import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatsCard } from "@/components/ui/stats-card";
import {
  Package,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchMyProducts,
  updateProduct,
  deleteProduct,
  type MyProduct,
  type UpdateProductData,
} from "@/lib/api/products";
import { useAuth } from "@/contexts/AuthContext";
import { fetchCategories, type Category } from "@/lib/api/categories";
import { useToast } from "@/hooks/use-toast";

const MyProducts = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingProduct, setEditingProduct] = useState<MyProduct | null>(null);
  const [editFormData, setEditFormData] = useState<UpdateProductData>({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery<MyProduct[]>({
    queryKey: ["my-products"],
    queryFn: () => fetchMyProducts(token || undefined),
  });
  // console.log(products);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => fetchCategories(),
    staleTime: 300000,
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: (data: { productId: string; updateData: UpdateProductData }) =>
      updateProduct(data.productId, data.updateData, token || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-products"] });
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      setEditFormData({});
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: (productId: string) =>
      deleteProduct(productId, token || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-products"] });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const categoryIdToName = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => {
      if (c && c.id !== undefined && c.id !== null) {
        map.set(String(c.id), c.name);
      }
    });
    return map;
  }, [categories]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Low Stock":
        return "bg-yellow-100 text-yellow-800";
      case "Out of Stock":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleEditProduct = (product: MyProduct) => {
    setEditingProduct(product);
    setEditFormData({
      title: product.title,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
      image: product.image,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = () => {
    if (editingProduct) {
      updateProductMutation.mutate({
        productId: editingProduct.id,
        updateData: editFormData,
      });
    }
  };

  const handleDeleteProduct = (productId: string) => {
    deleteProductMutation.mutate(productId);
  };

  const handleEditFormChange = (
    field: keyof UpdateProductData,
    value: string | number
  ) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: field === "price" || field === "stock" ? Number(value) : value,
    }));
  };

  type ProductWithStatus = MyProduct & {
    status: "Active" | "Low Stock" | "Out of Stock";
  };

  const productsWithStatus: ProductWithStatus[] = useMemo(() => {
    return products.map((p): ProductWithStatus => {
      const stock = typeof p.stock === "number" ? p.stock : undefined;
      let status = "Active" as "Active" | "Low Stock" | "Out of Stock";
      if (typeof stock === "number") {
        if (stock === 0) status = "Out of Stock";
        else if (stock < 10) status = "Low Stock";
      }
      const resolvedCategory = p.categoryId
        ? categoryIdToName.get(String(p.categoryId)) || p.category || undefined
        : p.category;
      return { ...p, status, stock, category: resolvedCategory };
    });
  }, [products, categoryIdToName]);

  const stats = useMemo(() => {
    const totalActive = productsWithStatus.filter(
      (p) => p.status === "Active"
    ).length;
    const lowStock = productsWithStatus.filter(
      (p) => p.status === "Low Stock"
    ).length;
    const outOfStock = productsWithStatus.filter(
      (p) => p.status === "Out of Stock"
    ).length;
    return { totalActive, lowStock, outOfStock };
  }, [productsWithStatus]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          My Products
        </h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatsCard
          title="Total Active Products"
          value={isLoading ? "-" : String(stats.totalActive)}
          icon={Package}
          className="border-l-4 border-l-orange-500"
        />
        <StatsCard
          title="Products Low In Stock"
          value={isLoading ? "-" : String(stats.lowStock)}
          icon={AlertTriangle}
          className="border-l-4 border-l-orange-500"
        />
        <StatsCard
          title="Products Out of Stock"
          value={isLoading ? "-" : String(stats.outOfStock)}
          icon={CheckCircle}
          className="border-l-4 border-l-orange-500"
        />
      </div>

      {/* Products Table */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">All Products</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Make table scrollable horizontally on mobile */}
          <div className="overflow-x-auto">
            <Table className="min-w-full text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead className="min-w-[180px] sm:min-w-[200px]">
                    Name
                  </TableHead>
                  <TableHead className="w-28 sm:w-32">Category</TableHead>
                  <TableHead className="w-20">Price</TableHead>
                  <TableHead className="w-16">Stock</TableHead>
                  <TableHead className="w-24 sm:w-28">Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-sm text-gray-500"
                    >
                      Loading products...
                    </TableCell>
                  </TableRow>
                )}
                {isError && !isLoading && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-sm text-red-600"
                    >
                      Failed to load products
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && !isError && productsWithStatus.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-sm text-gray-500"
                    >
                      No products found
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading &&
                  !isError &&
                  productsWithStatus.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.title}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium max-w-[150px] sm:max-w-[200px] truncate">
                        {product.title}
                      </TableCell>
                      <TableCell className="text-sm truncate">
                        {product.category || "-"}
                      </TableCell>
                      <TableCell className="font-semibold text-sm">
                        {typeof product.price === "number"
                          ? `$${product.price.toFixed(2)}`
                          : String(product.price)}
                      </TableCell>
                      <TableCell className="font-semibold text-sm">
                        {typeof product.stock === "number"
                          ? product.stock
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(product.status)}>
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete "{product.title}
                                  ".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteProduct(product.id)
                                  }
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Floating Add Product Button */}
      <Link to="/seller/products/add">
        <Button className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 bg-amber-700 hover:bg-amber-800 text-white shadow-lg px-4 py-2 sm:px-5 sm:py-2">
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Add Product</span>
        </Button>
      </Link>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] w-[90vw]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Make changes to your product here.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {[
              { id: "title", label: "Title", type: "text" },
              { id: "price", label: "Price", type: "number" },
              { id: "stock", label: "Stock", type: "number" },
            ].map((field) => (
              <div
                key={field.id}
                className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4"
              >
                <Label htmlFor={field.id} className="sm:text-right">
                  {field.label}
                </Label>
                <Input
                  id={field.id}
                  type={field.type}
                  value={(editFormData as any)[field.id] || ""}
                  onChange={(e) =>
                    handleEditFormChange(field.id as any, e.target.value)
                  }
                  className="sm:col-span-3"
                />
              </div>
            ))}

            {/* Category */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="category" className="sm:text-right">
                Category
              </Label>
              <Select
                value={editFormData.categoryId || ""}
                onValueChange={(value) =>
                  handleEditFormChange("categoryId", value)
                }
              >
                <SelectTrigger className="sm:col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Image URL */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="image" className="sm:text-right">
                Image URL
              </Label>
              <Input
                id="image"
                value={editFormData.image || ""}
                onChange={(e) => handleEditFormChange("image", e.target.value)}
                className="sm:col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdateProduct}
              disabled={updateProductMutation.isPending}
            >
              {updateProductMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyProducts;
