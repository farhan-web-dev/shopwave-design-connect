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

const Home = () => {
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

  // Fetch ratings for featured and trending in parallel
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

  console.log(featured);
  console.log(trending);

  return (
    <div className="min-h-screen">
      <HeroSection />
      <CategoryGrid />

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Featured Products</h2>
          <Button variant="outline" asChild>
            <Link to="/products">View All</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loadingFeatured && (
            <div className="text-sm text-muted-foreground">
              Loading featured...
            </div>
          )}
          {errorFeatured && (
            <div className="text-sm text-destructive">
              Failed to load featured products.
            </div>
          )}
          {!loadingFeatured &&
            !errorFeatured &&
            (featured ?? []).map((product, idx) => {
              const ratingData = featuredRatings[idx]?.data;
              return (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  price={product.price}
                  image={product.image}
                  rating={ratingData?.rating ?? 0}
                  reviews={ratingData?.reviews ?? 0}
                  badge={product.badge}
                />
              );
            })}
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="bg-primary text-white py-16 my-12">
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

      {/* Latest Products */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">Trending Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loadingTrending && (
            <div className="text-sm text-muted-foreground">
              Loading trending...
            </div>
          )}
          {errorTrending && (
            <div className="text-sm text-destructive">
              Failed to load trending products.
            </div>
          )}
          {!loadingTrending &&
            !errorTrending &&
            (trending ?? []).map((product, idx) => {
              const ratingData = trendingRatings[idx]?.data;
              return (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  price={product.price}
                  image={product.image}
                  rating={ratingData?.rating ?? 0}
                  reviews={ratingData?.reviews ?? 0}
                  badge={product.badge}
                />
              );
            })}
        </div>
      </section>
    </div>
  );
};

export default Home;
