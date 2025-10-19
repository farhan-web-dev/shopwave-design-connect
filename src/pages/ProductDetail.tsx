import { useState, useMemo } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchProductById,
  fetchProductRating,
  fetchProductsByCategory,
  type Product,
} from "@/lib/api/products";
import { fetchProductReviews, type Review } from "@/lib/api/reviews";
import { fetchSellerById, type SellerInfo } from "@/lib/api/sellers";
import { addCartItem } from "@/lib/api/cart";
import {
  addToFavourites,
  removeFromFavourites,
  getFavourites,
  type Favourite,
} from "@/lib/api/favourites";
import { useAuth } from "@/contexts/AuthContext";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, token } = useAuth();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: product, isLoading: isProductLoading } =
    useQuery<Product | null>({
      queryKey: ["product", id],
      queryFn: () => fetchProductById(id || ""),
      enabled: !!id,
    });
  console.log(product);

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

  const { data: sellerInfo } = useQuery<SellerInfo | null>({
    queryKey: ["seller", product?.sellerId],
    queryFn: () => fetchSellerById(product?.sellerId || ""),
    enabled: !!product?.sellerId,
  });
  console.log(sellerInfo);

  const { data: categoryProducts, isLoading: isCategoryProductsLoading } =
    useQuery<Product[]>({
      queryKey: ["products-by-category", product?.categoryId],
      queryFn: () => fetchProductsByCategory(product?.categoryId || ""),
      enabled: !!product?.categoryId,
    });

  const { data: favourites } = useQuery<Favourite[]>({
    queryKey: ["favourites"],
    queryFn: () => getFavourites(token!),
    enabled: isAuthenticated && !!token,
  });

  const isFavourite =
    favourites?.some((fav) => fav.productId._id === id) || false;

  const images = useMemo(() => {
    if (!product) return [] as string[];
    // Use images array if available, otherwise fallback to single image
    return product.images && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];
  }, [product]);

  // Filter out the current product from category products and limit to 4
  const relatedProducts = useMemo(() => {
    if (!categoryProducts) return [];
    return categoryProducts
      .filter((p) => p.id !== id) // Exclude current product
      .slice(0, 4); // Limit to 4 products
  }, [categoryProducts, id]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();

    // 🟠 Case 1: User is NOT logged in — use localStorage
    if (!isAuthenticated) {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");

      const existingItem = cart.find((item: any) => item.productId === id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ productId: id, quantity: 1 });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      toast.success("Added to cart");
      return;
    }

    // 🟢 Case 2: User is logged in — send to backend
    try {
      await addCartItem(id, 1, token);
      toast.success("Added to cart");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  const handleMessageSeller = () => {
    if (product?.sellerId) {
      navigate(`/messages?sellerId=${product.sellerId}`);
    } else {
      toast.error("Seller information not available");
    }
  };

  const handleToggleFavourite = async () => {
    if (!isAuthenticated) {
      const next = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?next=${next}`);
      return;
    }

    if (!token) return;

    try {
      if (isFavourite) {
        await removeFromFavourites(id!, token);
        toast.success("Removed from favourites");
      } else {
        await addToFavourites(id!, token);
        toast.success("Added to favourites");
      }
      queryClient.invalidateQueries({ queryKey: ["favourites"] });
    } catch (err) {
      toast.error(
        isFavourite
          ? "Failed to remove from favourites"
          : "Failed to add to favourites"
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* ✅ Breadcrumb */}
        <div className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
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

        {/* ✅ Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-10 sm:mb-12">
          {/* ✅ Images Section */}
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
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {images.slice(0, 4).map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                      selectedImage === idx
                        ? "border-primary"
                        : "border-transparent hover:border-muted-foreground"
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

          {/* ✅ Product Info */}
          <div className="space-y-5 sm:space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
                {product?.title || (isProductLoading ? "Loading…" : "Untitled")}
              </h1>
              {ratingData && (
                <div className="flex items-center gap-2 mb-3">
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
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {ratingData.rating.toFixed(1)} ({ratingData.reviews}{" "}
                    reviews)
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-baseline gap-2 sm:gap-3">
              <span className="text-3xl sm:text-4xl font-bold text-primary">
                ${(product?.price ?? 0).toFixed(2)}
              </span>
            </div>

            <Separator />

            {/* ✅ Description */}
            <div>
              <h3 className="font-semibold mb-2 text-base sm:text-lg">
                Description
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                {product?.description || "No description available."}
              </p>
            </div>

            <Separator />

            {/* ✅ Seller Info */}
            <Card
              onClick={() => {
                if (sellerInfo?._id) {
                  navigate(`/seller/${sellerInfo?.userId?.id}`);
                }
              }}
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {sellerInfo?.logo ? (
                        <img
                          src={sellerInfo.logo}
                          alt={sellerInfo.storeName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Store className="h-5 w-5 sm:h-6 sm:w-6" />
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-sm sm:text-base">
                        {sellerInfo?.storeName || "Seller"}
                      </span>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {sellerInfo?.verficationStatus}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation(); // prevent navigation
                      handleMessageSeller();
                    }}
                    className="w-full sm:w-auto"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* ✅ Actions */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="px-3 sm:px-4 font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>

              <Button
                className="flex-1 min-w-[140px]"
                size="lg"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={handleToggleFavourite}
              >
                <Heart
                  className={`h-5 w-5 ${
                    isFavourite ? "fill-red-500 text-red-500" : ""
                  }`}
                />
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

        {/* ✅ Reviews Section */}
        <section className="mb-10 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
            Customer Reviews
          </h2>
          {!reviews || reviews.length === 0 ? (
            <p className="text-muted-foreground text-sm sm:text-base">
              No reviews yet.
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <Card key={rev.id}>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <img
                        src={rev.userImage}
                        alt={rev.userName}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm sm:text-base">
                            {rev.userName}
                          </span>
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
                        <p className="text-xs sm:text-sm mt-1">{rev.comment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* ✅ Related Products */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
            Related Products
          </h2>
          {isCategoryProductsLoading ? (
            <div className="text-center py-6 sm:py-8">
              <p className="text-muted-foreground text-sm sm:text-base">
                Loading related products...
              </p>
            </div>
          ) : relatedProducts.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <p className="text-muted-foreground text-sm sm:text-base">
                No related products found.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;
