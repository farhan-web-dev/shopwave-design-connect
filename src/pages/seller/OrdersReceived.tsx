import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { fetchSellerOrders, updateOrderStatus } from "@/lib/api/seller";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, Package, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const OrdersReceived = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [dateRange, setDateRange] = useState("");

  // Fetch orders from API
  const {
    data: ordersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sellerOrders", selectedStatus, dateRange],
    queryFn: () =>
      fetchSellerOrders(token, {
        status: selectedStatus !== "All Statuses" ? selectedStatus : undefined,
        // Add date range filtering if needed
      }),
    enabled: !!token,
  });

  // Ensure orders is always an array
  const orders = Array.isArray(ordersData) ? ordersData : [];

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      updateOrderStatus(orderId, status, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellerOrders"] });
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    // console.log("handleStatusUpdate called:", { orderId, newStatus });
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const filteredOrders = (orders || []).filter((order) => {
    if (
      selectedStatus !== "All Statuses" &&
      order.orderStatus !== selectedStatus
    ) {
      return false;
    }
    // Add date range filtering logic here if needed
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders Received</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading orders...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders Received</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Error Loading Orders
            </h2>
            <p className="text-gray-600">
              {error instanceof Error ? error.message : "Failed to load orders"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders Received</h1>
        <p className="text-gray-600 mt-1">Manage and track your order status</p>
      </div>

      {/* Filters */}
      <Card className="bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Statuses">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Select Date Range"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button className="bg-amber-700 hover:bg-amber-800 text-white px-6">
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Order ID</TableHead>
                  <TableHead className="min-w-[200px]">Product(s)</TableHead>
                  <TableHead className="w-32">Customer</TableHead>
                  <TableHead className="w-24">Amount</TableHead>
                  <TableHead className="w-28">Status</TableHead>
                  <TableHead className="w-24">Payment</TableHead>
                  <TableHead className="w-24">Date</TableHead>
                  <TableHead className="w-40">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <Package className="h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-gray-500">No orders found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium text-xs">
                        #{order._id.slice(-8).toUpperCase()}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="space-y-1">
                          {order.items.slice(0, 2).map((item) => (
                            <div key={item._id} className="text-xs">
                              {item.title} (x{item.quantity})
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{order.items.length - 2} more
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>
                          <div className="font-medium">
                            {order.buyerId.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.buyerId.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-sm">
                        ${(order.total || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.orderStatus}
                          onValueChange={(value) =>
                            handleStatusUpdate(order._id, value)
                          }
                          disabled={updateStatusMutation.isPending}
                        >
                          <SelectTrigger className="w-24 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">
                              Processing
                            </SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getPaymentStatusColor(order.paymentStatus)}
                        >
                          {order.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                          >
                            <Eye className="h-3 w-3" />
                            <span className="hidden sm:inline ml-1 text-xs">
                              View
                            </span>
                          </Button>
                          {order.orderStatus === "pending" && (
                            <Button
                              size="sm"
                              className="bg-amber-700 hover:bg-amber-800 text-white h-8 px-2 text-xs"
                              onClick={() =>
                                handleStatusUpdate(order._id, "processing")
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              {updateStatusMutation.isPending ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  <span className="hidden sm:inline">
                                    Process
                                  </span>
                                  <span className="sm:hidden">✓</span>
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersReceived;
