import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { addCartItem } from "@/lib/api/cart";
import {
  addToFavourites,
  removeFromFavourites,
  getFavourites,
  type Favourite,
} from "@/lib/api/favourites";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  image: string;
  rating?: number;
  reviews?: number;
  badge?: string;
}

const ProductCard = ({
  id,
  title,
  price,
  image,
  rating = 4.5,
  reviews = 0,
  badge,
}: ProductCardProps) => {
  const { isAuthenticated, token } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [isFavouriteLoading, setIsFavouriteLoading] = useState(false);

  const { data: favourites } = useQuery<Favourite[]>({
    queryKey: ["favourites"],
    queryFn: () => getFavourites(token!),
    enabled: isAuthenticated && !!token,
  });

  const isFavourite =
    favourites?.some((fav) => fav.productId._id === id) || false;

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
      await addCartItem(id, 1, token || undefined);
      toast.success("Added to cart");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  const handleToggleFavourite = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      const next = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?next=${next}`);
      return;
    }

    if (!token) return;

    setIsFavouriteLoading(true);
    try {
      if (isFavourite) {
        await removeFromFavourites(id, token);
        toast.success("Removed from favourites");
      } else {
        await addToFavourites(id, token);
        toast.success("Added to favourites");
      }
      queryClient.invalidateQueries({ queryKey: ["favourites"] });
    } catch (err) {
      toast.error(
        isFavourite
          ? "Failed to remove from favourites"
          : "Failed to add to favourites"
      );
    } finally {
      setIsFavouriteLoading(false);
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <Link to={`/products/${id}`}>
          <div className="relative aspect-square overflow-hidden rounded-t-lg">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            {badge && (
              <Badge className="absolute top-2 left-2 bg-orange-500 text-white">
                {badge}
              </Badge>
            )}
            <Button
              size="icon"
              variant="secondary"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 hover:bg-black/70 text-white"
              onClick={handleToggleFavourite}
              disabled={isFavouriteLoading}
            >
              {isFavouriteLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
              ) : (
                <Heart
                  className={`h-4 w-4 ${
                    isFavourite ? "fill-orange-500 text-orange-500" : ""
                  }`}
                />
              )}
            </Button>
          </div>
        </Link>

        <div className="p-4">
          <Link to={`/products/${id}`}>
            <h3 className="font-medium text-md mb-1 line-clamp-2 hover:text-orange-500 transition-colors">
              {title}
            </h3>
          </Link>

          <div className="flex items-center gap-1 mb-2">
            <div className="flex text-yellow-500">
              {"★".repeat(Math.floor(rating))}
              {"☆".repeat(5 - Math.floor(rating))}
            </div>
            <span className="text-xs text-muted-foreground">({reviews})</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-orange-500">
              ${price.toFixed(2)}
            </span>
            <Button
              size="sm"
              onClick={handleAddToCart}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />+
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
