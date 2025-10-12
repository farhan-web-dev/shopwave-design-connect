import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { fetchCart, type CartData } from "@/lib/api/cart";
import { getFavourites, type Favourite } from "@/lib/api/favourites";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import HeaderSearchBar from "../HeaderSearchBar";

const Header = () => {
  const { isAuthenticated, user, token, logout } = useAuth();
  const navigate = useNavigate();

  const { data: cartData } = useQuery<CartData>({
    queryKey: ["cart", { token: !!token }],
    queryFn: () => fetchCart(token || undefined),
    enabled: !!token,
    staleTime: 5_000,
  });
  const cartCount =
    cartData?.items?.reduce((sum, it) => sum + it.quantity, 0) || 0;

  const { data: favourites } = useQuery<Favourite[]>({
    queryKey: ["favourites"],
    queryFn: () => getFavourites(token!),
    enabled: isAuthenticated && !!token,
    staleTime: 5_000,
  });
  const favouritesCount = favourites?.length || 0;

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const [openNotifications, setOpenNotifications] = useState(false);
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: () => fetchNotifications(token!),
    enabled: isAuthenticated && !!token,
    staleTime: 5000,
  });

  console.log("Notifications:", notifications);

  // Count unread
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Mark all as read when modal opens
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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/favicon.ico"
              alt="Invision"
              className="h-12 w-16 rounded-lg shadow-sm"
            />
            {/* <span className="font-bold text-2xl md:text-3xl leading-none">
              <span className="text-orange-500">E</span>
              nvision
            </span> */}
          </Link>

          {/* Search Bar
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for products..."
                className="pl-10 w-full"
              />
            </div>
          </div> */}
          <HeaderSearchBar />

          {/* Navigation Icons (desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/favourites" className="relative">
                    <Heart className="h-5 w-5" />
                    {favouritesCount > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-primary text-white text-[10px] h-4 min-w-[16px] px-1">
                        {favouritesCount}
                      </span>
                    )}
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/messages">
                    <MessageSquare className="h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleOpenNotifications}
                >
                  <div className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-4 -right-3 inline-flex items-center justify-center rounded-full bg-primary text-white text-[10px] h-4 min-w-[16px] px-1">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </Button>

                <Button variant="ghost" size="icon" asChild>
                  <Link to="/cart" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-primary text-white text-[10px] h-4 min-w-[16px] px-1">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-2">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/account">My Account</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/orders">My Orders</Link>
                    </DropdownMenuItem>
                    {user?.role === "seller" && (
                      <DropdownMenuItem asChild>
                        <Link to="/seller/dashboard">Seller Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu (authenticated and guest) */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 sm:w-80">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-4 grid gap-3">
                  {isAuthenticated ? (
                    <>
                      <Button
                        variant="ghost"
                        className="justify-between"
                        asChild
                      >
                        <Link to="/favourites">
                          <span className="flex items-center">
                            <Heart className="h-4 w-4 mr-2" /> Favourites
                          </span>
                          {favouritesCount > 0 && (
                            <span className="inline-flex items-center justify-center rounded-full bg-primary text-white text-[10px] h-4 min-w-[16px] px-1">
                              {favouritesCount}
                            </span>
                          )}
                        </Link>
                      </Button>
                      <Button variant="ghost" className="justify-start" asChild>
                        <Link to="/messages">
                          <MessageSquare className="h-4 w-4 mr-2" /> Messages
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleOpenNotifications}
                        className="flex items-center justify-between w-full px-4"
                      >
                        {/* Bell icon on left */}
                        <div className="flex items-center gap-2">
                          <Bell className="h-5 w-5" />
                          <span className="text-sm font-medium">Bell</span>
                        </div>

                        {/* Count badge on the right */}
                        {unreadCount > 0 && (
                          <span className="flex items-center justify-center rounded-full bg-primary text-white text-[10px] h-4 min-w-[16px] px-1">
                            {unreadCount}
                          </span>
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        className="justify-between"
                        asChild
                      >
                        <Link to="/cart">
                          <span className="flex items-center">
                            <ShoppingCart className="h-4 w-4 mr-2" /> Cart
                          </span>
                          {cartCount > 0 && (
                            <span className="inline-flex items-center justify-center rounded-full bg-primary text-white text-[10px] h-4 min-w-[16px] px-1">
                              {cartCount}
                            </span>
                          )}
                        </Link>
                      </Button>
                      {user?.role === "seller" && (
                        <Button
                          variant="ghost"
                          className="justify-start"
                          asChild
                        >
                          <Link to="/seller/dashboard">Seller Dashboard</Link>
                        </Button>
                      )}
                      <div className="h-px bg-border my-1" />
                      <Button variant="destructive" onClick={handleLogout}>
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" asChild>
                        <Link to="/login">Sign In</Link>
                      </Button>
                      <Button asChild>
                        <Link to="/signup">Sign Up</Link>
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      <Dialog open={openNotifications} onOpenChange={setOpenNotifications}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2 max-h-96 overflow-y-auto">
            {notifications.filter((n) => !n.read).length === 0 ? (
              <p className="text-center text-muted-foreground text-sm">
                No unread notifications 🎉
              </p>
            ) : (
              notifications
                .filter((n) => !n.read)
                .map((n) => (
                  <div
                    key={n._id}
                    className="rounded-lg border p-3 hover:bg-muted transition-colors"
                  >
                    <p className="font-medium text-sm">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
