import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Heart, ShoppingCart, Trash2, Trash, Star, Store } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  getFavourites,
  removeFromFavourites,
  clearAllFavourites,
  type Favourite,
} from "@/lib/api/favourites";
import { addCartItem } from "@/lib/api/cart";
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

const Favourites = () => {
  const { isAuthenticated, token } = useAuth();
  const queryClient = useQueryClient();
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const {
    data: favourites,
    isLoading,
    error,
  } = useQuery<Favourite[]>({
    queryKey: ["favourites"],
    queryFn: () => getFavourites(token!),
    enabled: isAuthenticated && !!token,
  });

  const handleRemoveFromFavourites = async (productId: string) => {
    if (!token) return;

    setIsRemoving(productId);
    try {
      await removeFromFavourites(productId, token);
      toast.success("Removed from favourites");
      queryClient.invalidateQueries({ queryKey: ["favourites"] });
    } catch (error) {
      toast.error("Failed to remove from favourites");
    } finally {
      setIsRemoving(null);
    }
  };

  const handleClearAll = async () => {
    if (!token) return;

    setIsClearing(true);
    try {
      await clearAllFavourites(token);
      toast.success("All favourites cleared");
      queryClient.invalidateQueries({ queryKey: ["favourites"] });
    } catch (error) {
      toast.error("Failed to clear favourites");
    } finally {
      setIsClearing(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    if (!token) return;

    try {
      await addCartItem(productId, 1, token);
      toast.success("Added to cart");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">
              Sign in to view favourites
            </h1>
            <p className="text-muted-foreground mb-6">
              You need to be signed in to view your favourite products.
            </p>
            <Button asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your favourites...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-destructive mb-4">Failed to load favourites</p>
            <Button
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ["favourites"] })
              }
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Favourites</h1>
            <p className="text-muted-foreground mt-1">
              {favourites?.length || 0}{" "}
              {favourites?.length === 1 ? "item" : "items"}
            </p>
          </div>

          {favourites && favourites.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all favourites?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will remove all products
                    from your favourites.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearAll}
                    disabled={isClearing}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isClearing ? "Clearing..." : "Clear All"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Favourites List */}
        {!favourites || favourites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No favourites yet</h2>
            <p className="text-muted-foreground mb-6">
              Start adding products to your favourites by clicking the heart
              icon.
            </p>
            <Button asChild>
              <Link to="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favourites.map((favourite) => (
              <Card
                key={favourite._id}
                className="group hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-0">
                  <Link to={`/products/${favourite.productId._id}`}>
                    <div className="relative aspect-square overflow-hidden rounded-t-lg">
                      <img
                        src={
                          favourite.productId.image ||
                          favourite.productId.images?.[0] ||
                          "/placeholder.svg"
                        }
                        alt={favourite.productId.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveFromFavourites(favourite.productId._id);
                        }}
                        disabled={isRemoving === favourite.productId._id}
                      >
                        {isRemoving === favourite.productId._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        ) : (
                          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                        )}
                      </Button>
                    </div>
                  </Link>

                  <div className="p-4">
                    <Link to={`/products/${favourite.productId._id}`}>
                      <h3 className="font-medium text-sm mb-1 line-clamp-2 hover:text-primary">
                        {favourite.productId.title}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex text-yellow-500">
                        {"★".repeat(4)}
                        {"☆".repeat(1)}
                      </div>
                      <span className="text-xs text-muted-foreground">(0)</span>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-primary">
                        ${favourite.productId.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleAddToCart(favourite.productId._id)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Add to Cart
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleRemoveFromFavourites(favourite.productId._id)
                        }
                        disabled={isRemoving === favourite.productId._id}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favourites;
