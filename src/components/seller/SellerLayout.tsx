import { ReactNode, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Plus,
  ShoppingCart,
  MessageSquare,
  Settings,
  Search,
  Bell,
  Mail,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "@/lib/url";

interface SellerLayoutProps {
  children: ReactNode;
}

const SellerLayout = ({ children }: SellerLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const currentUserId = user?.id;

  interface UnreadCountRow {
    conversationId: string;
    count: number;
  }
  type UnreadCountsResponse =
    | { counts?: UnreadCountRow[] }
    | { unreadCounts?: Record<string, number> }
    | Record<string, number>;

  const { data: unreadCountsData } = useQuery<UnreadCountsResponse>({
    queryKey: ["header-unread-counts", currentUserId],
    enabled: !!currentUserId,
    queryFn: async () => {
      const res = await fetch(
        `${BASE_URL}/api/v1/conversations/unread-counts?userId=${currentUserId}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      const json = await res.json();
      return (json.data || json) as UnreadCountsResponse;
    },
  });

  const totalUnread = useMemo(() => {
    const data = unreadCountsData;
    if (!data) return 0;
    if (Array.isArray((data as { counts?: UnreadCountRow[] }).counts)) {
      return ((data as { counts?: UnreadCountRow[] }).counts || []).reduce(
        (sum, r) => sum + Number(r?.count || 0),
        0
      );
    }
    const map =
      (data as { unreadCounts?: Record<string, number> }).unreadCounts ||
      (data as Record<string, number>);
    return Object.values(map || {}).reduce((s, n) => s + Number(n || 0), 0);
  }, [unreadCountsData]);

  const navigation = [
    {
      name: "Dashboard Overview",
      href: "/seller/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "My Products",
      href: "/seller/products",
      icon: Package,
    },
    {
      name: "Add Product",
      href: "/seller/products/add",
      icon: Plus,
    },
    {
      name: "Orders Received",
      href: "/seller/orders",
      icon: ShoppingCart,
    },
    {
      name: "Messages",
      href: "/seller/messages",
      icon: MessageSquare,
    },
    {
      name: "Profile Settings",
      href: "/seller/profile",
      icon: Settings,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src="/logo.jpg" alt="Logo" className="h-8 w-8" />
            <span className="text-lg lg:text-xl font-bold text-gray-800">
              SellerDashboard
            </span>
          </div>

          <div className="flex items-center space-x-2 lg:space-x-4">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Bell className="h-4 w-4" />
            </Button>
            <Link to="/seller/messages">
              <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                <Mail className="h-4 w-4" />
                {totalUnread > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] leading-4 text-center">
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </span>
                )}
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImage} alt={user?.name} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user?.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-56 lg:w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] flex-shrink-0">
          <div className="p-4 lg:p-6">
            <div className="space-y-1 lg:space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center space-x-2 lg:space-x-3 px-2 lg:px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors",
                      isActive
                        ? "bg-purple-100 text-purple-700"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <div className="relative">
                      <item.icon className="h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0" />
                      {item.name === "Messages" && totalUnread > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] leading-4 text-center">
                          {totalUnread > 99 ? "99+" : totalUnread}
                        </span>
                      )}
                    </div>
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 min-w-0 overflow-hidden">
          <div className="max-w-full">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default SellerLayout;
