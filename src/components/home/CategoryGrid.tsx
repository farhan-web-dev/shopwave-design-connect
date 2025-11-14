"use client";
import { useRef, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories, type Category } from "@/lib/api/categories";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CategoryGrid = () => {
  const {
    data: categories,
    isLoading,
    isError,
  } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const mainCategories = (categories ?? []).filter(
    (category) => category.parentCategoryId === null
  );

  // Duplicate list to simulate infinite loop
  const duplicatedCategories = [...mainCategories, ...mainCategories];

  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const cardWidth = 180; // Card width including gap

  const scrollToIndex = (
    index: number,
    behavior: ScrollBehavior = "smooth"
  ) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: index * cardWidth,
        behavior,
      });
    }
  };

  // Reset loop when reaching the midpoint
  useEffect(() => {
    if (currentIndex >= mainCategories.length) {
      const timeout = setTimeout(() => {
        setCurrentIndex(0);
        scrollToIndex(0, "auto");
      }, 350);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, mainCategories.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
    scrollToIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (currentIndex === 0) {
      const endIndex = mainCategories.length - 1;
      setCurrentIndex(endIndex);
      scrollToIndex(endIndex, "auto");
      return;
    }
    setCurrentIndex((prev) => prev - 1);
    scrollToIndex(currentIndex - 1);
  };

  return (
    <section className="container mx-auto px-4 py-12 relative">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Shop by Category</h2>
        <Link to="/products">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            View All
          </Button>
        </Link>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading categories...</p>
      )}
      {isError && (
        <p className="text-sm text-destructive">Failed to load categories.</p>
      )}

      {!isLoading && !isError && mainCategories.length > 0 && (
        <div className="relative">
          {/* Left Button */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow hover:bg-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Scrollable Slider */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-hidden no-scrollbar px-12"
            style={{ scrollBehavior: "smooth" }}
          >
            {duplicatedCategories.map((category, index) => (
              <Link
                key={`${category.id}-${index}`}
                to={`/products?category=${encodeURIComponent(
                  String(category.id ?? category.slug ?? "")
                )}`}
              >
                <Card className="min-w-[200px] p-4 hover:shadow-lg transition-shadow cursor-pointer text-center">
                  <div className="w-28 h-28 mx-auto mb-3 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img
                      src={`/${category.name}.jpg`}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      onError={(e) =>
                        ((e.target as HTMLImageElement).src = "/fallback.jpg")
                      }
                    />
                  </div>
                  <p className="font-medium text-sm">{category.name}</p>
                </Card>
              </Link>
            ))}
          </div>

          {/* Right Button */}
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow hover:bg-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </section>
  );
};

export default CategoryGrid;
