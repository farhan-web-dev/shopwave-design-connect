import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories, type Category } from "@/lib/api/categories";
import {
  Smartphone,
  Laptop,
  Watch,
  Home as HomeIcon,
  Shirt,
  Camera,
  Tag,
  Factory, // 👈 Added this for Manufacturers
} from "lucide-react";

const CategoryGrid = () => {
  const {
    data: categories,
    isLoading,
    isError,
  } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  return (
    <section className="container mx-auto px-4 py-12">
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {(categories ?? []).map((category, index) => {
            const displayName = category.name;
            const keyName = (category.slug || displayName || "").toLowerCase();

            type IconType = React.ComponentType<{ className?: string }>;
            const iconColorMap: Record<
              string,
              { Icon: IconType; color: string }
            > = {
              electronics: { Icon: Smartphone, color: "bg-blue-100" },
              phones: { Icon: Smartphone, color: "bg-blue-100" },
              mobiles: { Icon: Smartphone, color: "bg-blue-100" },
              computers: { Icon: Laptop, color: "bg-purple-100" },
              laptops: { Icon: Laptop, color: "bg-purple-100" },
              accessories: { Icon: Watch, color: "bg-green-100" },
              watches: { Icon: Watch, color: "bg-green-100" },
              home: { Icon: HomeIcon, color: "bg-orange-100" },
              "home & living": { Icon: HomeIcon, color: "bg-orange-100" },
              fashion: { Icon: Shirt, color: "bg-pink-100" },
              apparel: { Icon: Shirt, color: "bg-pink-100" },
              cameras: { Icon: Camera, color: "bg-yellow-100" },
              photography: { Icon: Camera, color: "bg-yellow-100" },
              manufacturers: { Icon: Factory, color: "bg-slate-100" }, // 👈 Added Manufacturers
            };

            const defaultColors = [
              "bg-blue-100",
              "bg-purple-100",
              "bg-green-100",
              "bg-orange-100",
              "bg-pink-100",
              "bg-yellow-100",
            ];

            const mapped = iconColorMap[keyName];
            const IconComp = mapped?.Icon || Tag;
            const colorClass =
              category.color ||
              mapped?.color ||
              defaultColors[index % defaultColors.length] ||
              "bg-muted";

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
                <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div
                    className={`${colorClass} w-16 h-16 rounded-full flex items-center justify-center mb-3 mx-auto`}
                  >
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={displayName}
                        className="h-8 w-8 object-contain"
                      />
                    ) : (
                      <IconComp className="h-8 w-8 text-foreground" />
                    )}
                  </div>
                  <p className="text-center font-medium text-sm">
                    {displayName}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default CategoryGrid;
