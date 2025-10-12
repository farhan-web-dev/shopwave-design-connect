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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <CardTitle>All Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead className="min-w-[200px]">Name</TableHead>
                  <TableHead className="w-32">Category</TableHead>
                  <TableHead className="w-20">Price</TableHead>
                  <TableHead className="w-16">Stock</TableHead>
                  <TableHead className="w-28">Status</TableHead>
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
                      <TableCell className="font-medium">
                        <div
                          className="truncate max-w-[200px]"
                          title={product.title}
                        >
                          {product.title}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div
                          className="truncate"
                          title={product.category || "-"}
                        >
                          {product.category || "-"}
                        </div>
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
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete the product "
                                  {product.title}".
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
        <Button className="fixed bottom-6 right-6 bg-amber-700 hover:bg-amber-800 text-white shadow-lg">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </Link>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Make changes to your product here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={editFormData.title || ""}
                onChange={(e) => handleEditFormChange("title", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={editFormData.price || ""}
                onChange={(e) => handleEditFormChange("price", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">
                Stock
              </Label>
              <Input
                id="stock"
                type="number"
                value={editFormData.stock || ""}
                onChange={(e) => handleEditFormChange("stock", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select
                value={editFormData.categoryId || ""}
                onValueChange={(value) =>
                  handleEditFormChange("categoryId", value)
                }
              >
                <SelectTrigger className="col-span-3">
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">
                Image URL
              </Label>
              <Input
                id="image"
                value={editFormData.image || ""}
                onChange={(e) => handleEditFormChange("image", e.target.value)}
                className="col-span-3"
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
