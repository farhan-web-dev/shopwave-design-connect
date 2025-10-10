import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Heart,
  ShoppingCart,
  Share2,
  Store,
  MessageSquare,
  Star,
} from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import {
  fetchProductById,
  fetchProductRating,
  type Product,
} from "@/lib/api/products";
import { fetchProductReviews, type Review } from "@/lib/api/reviews";

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: product, isLoading: isProductLoading } =
    useQuery<Product | null>({
      queryKey: ["product", id],
      queryFn: () => fetchProductById(id || ""),
      enabled: !!id,
    });

  const { data: ratingData } = useQuery({
    queryKey: ["product-rating", id],
    queryFn: () => fetchProductRating(id || ""),
    enabled: !!id,
  });

  const { data: reviews } = useQuery<Review[]>({
    queryKey: ["product-reviews", id],
    queryFn: () => fetchProductReviews(id || ""),
    enabled: !!id,
  });

  const images = useMemo(() => {
    if (!product) return [] as string[];
    return product.image ? [product.image] : [];
  }, [product]);

  const relatedProducts = Array.from({ length: 4 }, (_, i) => ({
    id: `rel-${i}`,
    title: `Related Product ${i + 1}`,
    price: Math.floor(Math.random() * 300) + 50,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    rating: 4 + Math.random(),
    reviews: Math.floor(Math.random() * 200),
  }));

  const handleAddToCart = () => {
    toast.success("Added to cart!");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          {" / "}
          <Link to="/products" className="hover:text-primary">
            Products
          </Link>
          {" / "}
          <span className="text-foreground">{product?.title || "..."}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]}
                  alt={product?.title || ""}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImage === idx
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {product?.title || (isProductLoading ? "Loading…" : "Untitled")}
              </h1>
              {ratingData && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex text-yellow-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(ratingData.rating)
                            ? ""
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {ratingData.rating.toFixed(1)} ({ratingData.reviews}{" "}
                    reviews)
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-primary">
                ${(product?.price ?? 0).toFixed(2)}
              </span>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">
                {product?.description || "No description available."}
              </p>
            </div>

            <Separator />

            {/* Seller Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <Store className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="font-medium">Seller</span>
                      <p className="text-sm text-muted-foreground">
                        Verified seller
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="px-4 font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>

              <Button className="flex-1" size="lg" onClick={handleAddToCart}>
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>

              <Button variant="outline" size="lg">
                <Heart className="h-5 w-5" />
              </Button>

              <Button variant="outline" size="lg">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            <Button variant="secondary" size="lg" className="w-full">
              Buy Now
            </Button>
          </div>
        </div>

        {/* Reviews */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
          {!reviews || reviews.length === 0 ? (
            <p className="text-muted-foreground">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <Card key={rev.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={rev.userImage}
                        alt={rev.userName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{rev.userName}</span>
                          <div className="flex text-yellow-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < rev.rating ? "" : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm mt-1">{rev.comment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Related Products */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;
