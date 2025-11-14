import HeroSection from "@/components/home/HeroSection";
import CategoryGrid from "@/components/home/CategoryGrid";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  fetchFeaturedProducts,
  fetchTrendingProducts,
  fetchProductRating,
  type Product,
} from "@/lib/api/products";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

const Home = () => {
  // Queries
  const {
    data: featured,
    isLoading: loadingFeatured,
    isError: errorFeatured,
  } = useQuery<Product[]>({
    queryKey: ["products", "featured"],
    queryFn: fetchFeaturedProducts,
  });

  const {
    data: trending,
    isLoading: loadingTrending,
    isError: errorTrending,
  } = useQuery<Product[]>({
    queryKey: ["products", "trending"],
    queryFn: fetchTrendingProducts,
  });

  // 🔹 Separate scroll refs
  const featuredScrollRef = useRef<HTMLDivElement | null>(null);
  const trendingScrollRef = useRef<HTMLDivElement | null>(null);

  // 🔹 Scroll functions
  const scrollFeatured = (direction: "left" | "right") => {
    const container = featuredScrollRef.current;
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.9;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const scrollTrending = (direction: "left" | "right") => {
    const container = trendingScrollRef.current;
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.9;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Fetch ratings in parallel
  const featuredRatings = useQueries({
    queries: (featured ?? []).map((p) => ({
      queryKey: ["product", p.id, "rating"],
      queryFn: () => fetchProductRating(p.id),
      enabled: !!featured,
    })),
  });

  const trendingRatings = useQueries({
    queries: (trending ?? []).map((p) => ({
      queryKey: ["product", p.id, "rating"],
      queryFn: () => fetchProductRating(p.id),
      enabled: !!trending,
    })),
  });

  return (
    <div className="min-h-screen">
      <HeroSection />
      <CategoryGrid />

      {/* ===================== FEATURED PRODUCTS ===================== */}
      <section className="container mx-auto px-4 py-12 relative">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Featured Products</h2>
          <Button
            className="bg-white hover:bg-orange-600 text-black px-6 py-2 rounded-md w-24 h-12"
            variant="outline"
            asChild
          >
            <Link to="/products">View All</Link>
          </Button>
        </div>

        {/* Arrows */}
        <button
          onClick={() => scrollFeatured("left")}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border rounded-full shadow-md w-10 h-10 items-center justify-center hover:bg-gray-100"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => scrollFeatured("right")}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border rounded-full shadow-md w-10 h-10 items-center justify-center hover:bg-gray-100"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Scroll container */}
        <div
          ref={featuredScrollRef}
          className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory hide-scrollbar"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {loadingFeatured && <div>Loading featured...</div>}
          {errorFeatured && <div>Failed to load featured.</div>}
          {!loadingFeatured &&
            !errorFeatured &&
            (featured ?? []).map((product, idx) => {
              const ratingData = featuredRatings[idx]?.data;
              return (
                <div
                  key={product.id}
                  className="flex-none snap-start w-[80%] sm:w-[45%] md:w-[calc(25%-1rem)] min-w-[250px]"
                >
                  <ProductCard
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    image={product.image}
                    rating={ratingData?.rating ?? 0}
                    reviews={ratingData?.reviews ?? 0}
                    badge={product.badge}
                    parentCategory={product.parentCategoryId}
                  />
                </div>
              );
            })}
        </div>
      </section>

      {/* ===================== PROMO BANNER ===================== */}
      <section className="bg-orange-400 text-white py-16 my-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Limited Time Offer!</h2>
          <p className="text-xl mb-6 text-white/90">
            Get up to 50% off on selected electronics
          </p>
          <Button size="lg" variant="secondary">
            Shop Deals
          </Button>
        </div>
      </section>

      {/* ===================== TRENDING PRODUCTS ===================== */}
      <section className="container mx-auto px-4 py-12 relative">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Trending Products</h2>
          <Button
            className="bg-white hover:bg-orange-600 text-black px-6 py-2 rounded-md w-24 h-12"
            variant="outline"
            asChild
          >
            <Link to="/products">View All</Link>
          </Button>
        </div>

        <button
          onClick={() => scrollTrending("left")}
          className="hidden md:flex absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border rounded-full shadow-md w-10 h-10 items-center justify-center hover:bg-gray-100"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={() => scrollTrending("right")}
          className="hidden md:flex absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border rounded-full shadow-md w-10 h-10 items-center justify-center hover:bg-gray-100"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div
          ref={trendingScrollRef}
          className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory hide-scrollbar"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {loadingTrending && <div>Loading trending...</div>}
          {errorTrending && <div>Failed to load trending.</div>}
          {!loadingTrending &&
            !errorTrending &&
            (trending ?? []).map((product, idx) => {
              const ratingData = trendingRatings[idx]?.data;
              return (
                <div
                  key={product.id}
                  className="flex-none snap-start w-[80%] sm:w-[45%] md:w-[calc(25%-1rem)] min-w-[250px]"
                >
                  <ProductCard
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    image={product.image}
                    rating={ratingData?.rating ?? 0}
                    reviews={ratingData?.reviews ?? 0}
                    badge={product.badge}
                  />
                </div>
              );
            })}
        </div>
      </section>
    </div>
  );
};

export default Home;
