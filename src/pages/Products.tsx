import { useMemo, useState } from "react";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal } from "lucide-react";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  fetchProducts,
  fetchProductRating,
  type Product,
  type ProductsListResponse,
} from "@/lib/api/products";
import { fetchCategories, type Category } from "@/lib/api/categories";
import { useLocation } from "react-router-dom";
import { searchProducts } from "@/lib/api/products";

const categories = [
  "Electronics",
  "Computers",
  "Accessories",
  "Home & Living",
  "Fashion",
  "Cameras",
];

const Products = () => {
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [priceRangePending, setPriceRangePending] = useState<[number, number]>([
    0, 1000,
  ]);
  // Search removed; handled by header
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [sort, setSort] = useState<string>("");
  const [selectedCategoryIdsPending, setSelectedCategoryIdsPending] = useState<
    string[]
  >([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [freeShippingPending, setFreeShippingPending] = useState(false);
  const [expressPending, setExpressPending] = useState(false);
  const [freeShipping, setFreeShipping] = useState(false);
  const [express, setExpress] = useState(false);

  // inside Products component
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search") || "";

  const { data: categoriesData } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { data, isLoading, isError } = useQuery<ProductsListResponse>({
    queryKey: [
      "products",
      {
        page,
        limit,
        sort,
        priceRange,
        selectedCategoryIds,
        freeShipping,
        express,
        searchQuery,
      },
    ],
    queryFn: () => {
      if (searchQuery) {
        // If searching, use searchProducts()
        return searchProducts(searchQuery);
      } else {
        // Otherwise, fetch normally
        return fetchProducts({
          page,
          limit,
          sort,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          categoryIds: selectedCategoryIds,
          freeShipping,
          express,
        });
      }
    },
  });

  console.log(data);
  const items: Product[] = data?.products ?? [];
  const total = data?.results ?? items.length;

  const ratingsQueries = useQueries({
    queries: items.map((p) => ({
      queryKey: ["product", p.id, "rating"],
      queryFn: () => fetchProductRating(p.id),
      enabled: !!p.id,
    })),
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5" />
                Filters
              </h3>

              {/* Search removed: handled by header */}

              {/* Categories */}
              <div className="mb-6">
                <Label className="mb-3 block font-medium">Categories</Label>
                <div className="space-y-2">
                  {(categoriesData ?? []).map((c: Category) => {
                    const id = String(
                      (
                        c as unknown as {
                          _id?: string | number;
                          id?: string | number;
                        }
                      )._id ?? c.id
                    );
                    const checked = selectedCategoryIdsPending.includes(id);
                    return (
                      <div key={id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cat-${id}`}
                          checked={checked}
                          onCheckedChange={(val) => {
                            setSelectedCategoryIdsPending((prev) => {
                              const next = new Set(prev);
                              if (val) next.add(id);
                              else next.delete(id);
                              return Array.from(next);
                            });
                          }}
                        />
                        <Label
                          htmlFor={`cat-${id}`}
                          className="font-normal cursor-pointer"
                        >
                          {c.name}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <Label className="mb-3 block font-medium">Price Range</Label>
                <Slider
                  value={priceRangePending}
                  onValueChange={(vals) =>
                    setPriceRangePending(vals as [number, number])
                  }
                  max={1000}
                  step={10}
                  className="mb-2"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${priceRangePending[0]}</span>
                  <span>${priceRangePending[1]}</span>
                </div>
              </div>

              {/* Shipping Options */}
              <div className="mb-6">
                <Label className="mb-3 block font-medium">
                  Shipping Options
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="free-shipping"
                      checked={freeShippingPending}
                      onCheckedChange={(v) => setFreeShippingPending(!!v)}
                    />
                    <Label
                      htmlFor="free-shipping"
                      className="font-normal cursor-pointer"
                    >
                      Free Shipping
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="express"
                      checked={expressPending}
                      onCheckedChange={(v) => setExpressPending(!!v)}
                    />
                    <Label
                      htmlFor="express"
                      className="font-normal cursor-pointer"
                    >
                      Express Delivery
                    </Label>
                  </div>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => {
                  setSelectedCategoryIds(selectedCategoryIdsPending);
                  setFreeShipping(freeShippingPending);
                  setExpress(expressPending);
                  setPriceRange(priceRangePending);
                  setPage(1);
                }}
              >
                Apply Filters
              </Button>
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => {
                  setSelectedCategoryIdsPending([]);
                  setSelectedCategoryIds([]);
                  setFreeShippingPending(false);
                  setExpressPending(false);
                  setFreeShipping(false);
                  setExpress(false);
                  setPriceRangePending([0, 1000]);
                  setPriceRange([0, 1000]);
                  setSort("");
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">
                All Products
                <span className="text-muted-foreground text-base ml-2">
                  ({total} items)
                </span>
              </h1>

              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-createdAt">Newest First</SelectItem>
                  <SelectItem value="price">Price: Low to High</SelectItem>
                  <SelectItem value="-price">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isLoading && (
                <div className="text-sm text-muted-foreground">
                  Loading products...
                </div>
              )}
              {isError && (
                <div className="text-sm text-destructive">
                  Failed to load products.
                </div>
              )}
              {!isLoading &&
                !isError &&
                items.map((product, idx) => {
                  const ratingData = ratingsQueries[idx]?.data;
                  return (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      title={product.title}
                      price={product.price}
                      image={product.image}
                      rating={ratingData?.rating ?? 0}
                      reviews={ratingData?.reviews ?? 0}
                    />
                  );
                })}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-12 gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button variant="outline" disabled>
                Page {page}
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={items.length < limit}
              >
                Next
              </Button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
