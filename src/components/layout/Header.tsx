import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotifications,
  markAllNotificationsRead,
  type Notification,
} from "@/lib/api/notification";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Bell,
  MessageSquare,
  Menu,
  Grid,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { fetchCart, type CartData } from "@/lib/api/cart";
import { getFavourites, type Favourite } from "@/lib/api/favourites";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import HeaderSearchBar from "../HeaderSearchBar";
import { fetchCategories, type Category } from "@/lib/api/categories";
import ShopByCategoryMenu from "../ShopByCategory";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

const Header = () => {
  const [guestCartCount, setGuestCartCount] = useState(0);
  const { isAuthenticated, user, token, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Cart and Favourites
  const { data: cartData } = useQuery<CartData>({
    queryKey: ["cart", { token: !!token }],
    queryFn: () => fetchCart(token || undefined),
    enabled: !!token,
    staleTime: 5000,
  });
  useEffect(() => {
    if (!isAuthenticated) {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const total = cart.reduce(
        (sum: number, item: any) => sum + (item.quantity || 1),
        0
      );
      setGuestCartCount(total);
    }
  }, [isAuthenticated]);

  // 🟢 Decide which count to show
  const cartCount =
    isAuthenticated && cartData
      ? cartData.items?.reduce((sum, it) => sum + it.quantity, 0) || 0
      : guestCartCount;

  const { data: favourites } = useQuery<Favourite[]>({
    queryKey: ["favourites"],
    queryFn: () => getFavourites(token!),
    enabled: isAuthenticated && !!token,
    staleTime: 5000,
  });
  // console.log("Favourites in Header:", favourites);
  const favouritesCount = favourites?.length || 0;

  // Notifications
  const [openNotifications, setOpenNotifications] = useState(false);
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: () => fetchNotifications(token!),
    enabled: isAuthenticated && !!token,
    staleTime: 5000,
  });
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markReadMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleOpenNotifications = () => {
    setOpenNotifications(true);
    markReadMutation.mutate();
  };

  // Categories
  const { data: categoriesData = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  // const mainCategories = categoriesData.filter(
  //   (cat) => !cat.parentCategoryId || cat.parentCategoryId === null
  // );

  // const subCategories = (parentId: string) =>
  //   categoriesData.filter(
  //     (cat) =>
  //       cat.parentCategoryId !== null && cat.parentCategoryId === parentId
  //   );

  // console.log("mainCategories header", mainCategories);
  // console.log("subCategories header", subCategories);

  // Shop by Category modal

  const [openCategories, setOpenCategories] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between text-gray-100">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold flex items-center">
              <span className="text-amber-500">e</span>
              <span className="text-gray-100">nvision</span>
            </span>
          </Link>
          {/* Shop by Category Button */}
          <div className="relative ">
            <Button
              variant="outline"
              className="flex  items-center border-none  hover:bg-amber-500/20 hover:text-amber-400 transition-colors bg-transparent text-white font-semibold transition"
              onClick={() => setOpenCategories(!openCategories)}
            >
              <ChevronDown className="h-5 w-5" />
              Shop by category
            </Button>
          </div>
          <HeaderSearchBar />
          {/* Navigation Icons (desktop) */}
          <div className="hidden md:flex items-center space-x-4 text-gray-100">
            {/* Favourites */}
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-amber-500/20 hover:text-amber-400 transition-colors"
              onClick={() => navigate("/favourites")}
            >
              <div className="relative">
                <Heart className="h-5 w-5 text-gray-100" />
                {isAuthenticated && favouritesCount > 0 && (
                  <span className="absolute -top-4 -right-3 rounded-full bg-amber-500 text-white text-[10px] h-4 min-w-[16px] px-1 flex items-center justify-center">
                    {favouritesCount}
                  </span>
                )}
              </div>
            </Button>

            {/* Messages */}
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-amber-500/20 hover:text-amber-400 transition-colors"
              onClick={() => navigate("/messages")}
            >
              <MessageSquare className="h-5 w-5 text-gray-100" />
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-amber-500/20 hover:text-amber-400 transition-colors"
              onClick={() => handleOpenNotifications()}
            >
              <div className="relative">
                <Bell className="h-5 w-5 text-gray-100" />
                {unreadCount > 0 && (
                  <span className="absolute -top-4 -right-3 rounded-full bg-amber-500 text-white text-[10px] h-4 min-w-[16px] px-1 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-amber-500/20 hover:text-amber-400 transition-colors"
              onClick={() => navigate("/cart")}
            >
              <div className="relative">
                <ShoppingCart className="h-5 w-5 text-gray-100" />
                {cartCount > 0 && (
                  <span className="absolute -top-4 -right-3 rounded-full bg-amber-500 text-white text-[10px] h-4 min-w-[16px] px-1 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
            </Button>
            {/* <Button
              variant="ghost"
              size="icon"
              className="hover:bg-amber-500/20 hover:text-amber-400 transition-colors"
            >
              <User className="h-5 w-5" />
            </Button> */}
            {/* User Icon (always visible) */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-amber-500/20 hover:text-amber-400 transition-colors"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white text-gray-700 shadow-lg rounded-md border border-gray-200"
                >
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>

                  <div className="py-1 flex flex-col px-4 gap-2">
                    <DropdownMenuItem asChild className="hover:bg-gray-100">
                      <Link to="/account" className="w-full">
                        My Account
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="hover:bg-gray-100">
                      <Link to="/orders" className="w-full">
                        My Orders
                      </Link>
                    </DropdownMenuItem>

                    {user?.role === "seller" && (
                      <DropdownMenuItem asChild className="hover:bg-gray-100">
                        <Link to="/seller/dashboard" className="w-full">
                          Seller Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </div>

                  <DropdownMenuSeparator className="border-gray-200" />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-white bg-orange-500 hover:bg-orange-600 rounded-md mx-2 my-1 text-center"
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-amber-500/20 hover:text-amber-400 transition-colors"
                onClick={() => navigate("/login")}
              >
                <User className="h-5 w-5" />
              </Button>
            )}
          </div>
          {/* Mobile menu */}
          {/* Mobile menu (authenticated and guest) */}{" "}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5 text-gray-100" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-72 sm:w-80 bg-gray-900 text-gray-100"
              >
                <SheetHeader>
                  <SheetTitle className="text-white">Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-4 grid gap-3">
                  <div className="flex flex-col gap-1 w-full">
                    {/* Favourites */}
                    <Button
                      variant="ghost"
                      className="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-800 transition text-white"
                      onClick={() => {
                        navigate("/favourites");
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-amber-400" />
                        <span className="text-sm font-medium">Favourites</span>
                      </div>
                      {isAuthenticated && favouritesCount > 0 && (
                        <span className="flex items-center justify-center rounded-full bg-amber-500 text-white text-[10px] h-4 min-w-[16px] px-1">
                          {favouritesCount}
                        </span>
                      )}
                    </Button>
                    {/* Messages */}
                    <Button
                      variant="ghost"
                      className="flex items-center justify-start px-4 py-2 rounded-lg hover:bg-gray-800 transition text-white"
                      onClick={() => {
                        navigate("/messages");
                      }}
                    >
                      <MessageSquare className="h-5 w-5 text-amber-400 mr-2" />
                      <span className="text-sm font-medium">Messages</span>
                    </Button>
                    {/* Notifications */}
                    <Button
                      variant="ghost"
                      className="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-800 transition text-white"
                      onClick={() => {
                        handleOpenNotifications();
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-amber-400" />
                        <span className="text-sm font-medium">
                          Notifications
                        </span>
                      </div>
                      {unreadCount > 0 && (
                        <span className="flex items-center justify-center rounded-full bg-amber-500 text-white text-[10px] h-4 min-w-[16px] px-1">
                          {unreadCount}
                        </span>
                      )}
                    </Button>
                    {/* Cart */}
                    <Button
                      variant="ghost"
                      className="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-800 transition text-white"
                      onClick={() => {
                        navigate("/cart");
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-amber-400" />
                        <span className="text-sm font-medium">Cart</span>
                      </div>
                      {cartCount > 0 && (
                        <span className="flex items-center justify-center rounded-full bg-amber-500 text-white text-[10px] h-4 min-w-[16px] px-1">
                          {cartCount}
                        </span>
                      )}
                    </Button>
                    {/* Seller Dashboard */}
                    {isAuthenticated && user?.role === "seller" && (
                      <Button
                        variant="ghost"
                        className="flex items-center justify-start px-4 py-2 rounded-lg hover:bg-gray-800 transition text-white"
                        asChild
                      >
                        <Link
                          to="/seller/dashboard"
                          className="flex items-center gap-2"
                        >
                          <User className="h-5 w-5 text-amber-400" />
                          <span className="text-sm font-medium">
                            Seller Dashboard
                          </span>
                        </Link>
                      </Button>
                    )}
                    {/* Divider */}
                    {isAuthenticated && (
                      <div className="h-px bg-gray-700 my-2" />
                    )}
                    {/* Logout */}
                    {isAuthenticated && (
                      <Button
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700 text-white mt-1"
                        onClick={handleLogout}
                      >
                        Sign Out
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Notifications Modal */}
      <Dialog open={openNotifications} onOpenChange={setOpenNotifications}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Notifications</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2 max-h-96 overflow-y-auto">
            {notifications.filter((n) => !n.read).length === 0 ? (
              <p className="text-center text-gray-400 text-sm">
                No unread notifications 🎉
              </p>
            ) : (
              notifications
                .filter((n) => !n.read)
                .map((n) => (
                  <div
                    key={n._id}
                    className="rounded-lg border p-3 hover:bg-gray-100 transition-colors"
                  >
                    <p className="font-medium text-sm text-gray-900">
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-600">{n.message}</p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Categories Modal */}
      <ShopByCategoryMenu
        categories={categoriesData || []}
        open={openCategories}
        onClose={() => setOpenCategories(false)}
      />
    </header>
  );
};

export default Header;
