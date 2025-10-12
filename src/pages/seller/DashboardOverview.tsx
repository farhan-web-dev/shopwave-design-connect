import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { fetchSellerStats } from "@/lib/api/seller";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/ui/stats-card";
import { Package, ShoppingCart, DollarSign, Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DashboardOverview = () => {
  const { token } = useAuth();

  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sellerStats"],
    queryFn: () => fetchSellerStats(token),
    enabled: !!token,
  });

  // Transform sales data for the chart
  const salesData = stats?.salesOverview
    ? stats.salesOverview.labels.map((label, index) => ({
        month: label,
        sales: stats.salesOverview.data[index] || 0,
      }))
    : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Error Loading Dashboard
            </h2>
            <p className="text-gray-600">
              {error instanceof Error
                ? error.message
                : "Failed to load dashboard data"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">
          Your business performance at a glance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Total Products"
          value={stats?.totalProducts?.toString() || "0"}
          icon={Package}
        />
        <StatsCard
          title="Orders Received"
          value={stats?.orders?.total?.toString() || "0"}
          icon={ShoppingCart}
          subtitle={`Pending: ${stats?.orders?.pending || 0}, Shipped: ${
            stats?.orders?.shipped || 0
          }, Delivered: ${stats?.orders?.delivered || 0}`}
        />
        <StatsCard
          title="Monthly Earnings"
          value={`$${(stats?.monthlyEarnings || 0).toFixed(2)}`}
          icon={DollarSign}
        />
      </div>

      {/* Monthly Sales Chart */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Monthly Sales Overview</CardTitle>
          <p className="text-sm text-gray-600">
            Sales performance over the last 6 months.
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, "Sales"]} />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
