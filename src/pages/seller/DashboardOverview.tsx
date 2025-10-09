import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/ui/stats-card";
import { Package, ShoppingCart, DollarSign, MessageSquare } from "lucide-react";
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
  const [salesData] = useState([
    { month: "Jan", sales: 12000 },
    { month: "Feb", sales: 15000 },
    { month: "Mar", sales: 11000 },
    { month: "Apr", sales: 16000 },
    { month: "May", sales: 17500 },
    { month: "Jun", sales: 18450 },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Products"
          value="1,250"
          icon={Package}
          trend={{ value: "2.5% from last month", type: "increase" }}
        />
        <StatsCard
          title="Orders Received"
          value="85"
          icon={ShoppingCart}
          subtitle="Pending: 12, Shipped: 43, Delivered: 30"
        />
        <StatsCard
          title="Monthly Earnings"
          value="$18,450"
          icon={DollarSign}
          trend={{ value: "5.8% from last month", type: "increase" }}
        />
        <StatsCard
          title="New Messages"
          value="7"
          icon={MessageSquare}
          trend={{ value: "10% from last month", type: "decrease" }}
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
