import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories, type Category } from "@/lib/api/categories";

const CategoryGrid = () => {
  const {
    data: categories,
    isLoading,
    isError,
  } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  // console.log("Categories:", categories);
  // ✅ Only main categories
  const mainCategories = (categories ?? []).filter(
    (category) => category.parentCategoryId === null
  );

  return (
    <section className="container mx-auto px-4 py-12 ">
      <h2 className="text-3xl font-bold mb-8">Shop by Category</h2>

      {isLoading && (
        <div className="text-sm text-muted-foreground">
          Loading categories...
        </div>
      )}

      {isError && (
        <div className="text-sm text-destructive">
          Failed to load categories.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {mainCategories.map((category, index) => {
            const displayName = category.name;
            const imageName = (category.slug || category.name || "")
              .toLowerCase()
              .replace(/\s+/g, "-");
            const imagePath = `/${displayName}.jpg`; // ✅ image from /public
            const keyValue = String(
              category.id ?? category.slug ?? category.name ?? index
            );

            return (
              <Link
                key={keyValue}
                to={`/products?category=${encodeURIComponent(
                  String(category.id ?? category.slug ?? "")
                )}`}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer text-center">
                  <div className="w-28 h-28 mx-auto mb-3 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img
                      src={imagePath}
                      alt={displayName}
                      className="w-full h-full object-cover"
                      onError={(e) =>
                        ((e.target as HTMLImageElement).src = "/fallback.jpg")
                      }
                    />
                  </div>
                  <p className="font-medium text-sm">{displayName}</p>
                </Card>
              </Link>
            );
          })}

          {/* ✅ "View All" button as last grid item */}
          <div className="flex items-center justify-center">
            <Link to="/products" className="w-full">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2  rounded-md w-24 h-12">
                View All
              </Button>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
};

export default CategoryGrid;
