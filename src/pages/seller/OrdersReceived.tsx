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

  const {
    data: ordersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sellerOrders", selectedStatus, dateRange],
    queryFn: () =>
      fetchSellerOrders(token, {
        status: selectedStatus !== "All Statuses" ? selectedStatus : undefined,
      }),
    enabled: !!token,
  });

  const orders = Array.isArray(ordersData) ? ordersData : [];

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

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const filteredOrders = (orders || []).filter((order) => {
    if (
      selectedStatus !== "All Statuses" &&
      order.orderStatus !== selectedStatus
    )
      return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
        <span className="mt-2 text-gray-600">Loading orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <h2 className="text-lg font-semibold text-red-600 mb-2">
            Error Loading Orders
          </h2>
          <p className="text-gray-600">
            {error instanceof Error ? error.message : "Failed to load orders"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Orders Received
        </h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          Manage and track your order status
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-52">
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

            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Select Date Range"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button className="bg-amber-700 hover:bg-amber-800 text-white w-full sm:w-auto">
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders */}
      {filteredOrders.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="h-10 w-10 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No orders found</p>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Card>
              <CardHeader>
                <CardTitle>All Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Product(s)</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order._id}>
                          <TableCell className="text-xs font-medium">
                            #{order._id.slice(-8).toUpperCase()}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 text-xs">
                              {order.items.slice(0, 2).map((item) => (
                                <div key={item._id}>
                                  {item.title} (x{item.quantity})
                                </div>
                              ))}
                              {order.items.length > 2 && (
                                <div className="text-gray-500">
                                  +{order.items.length - 2} more
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">
                                {order?.buyerId?.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {order?.buyerId?.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm font-semibold">
                            ${(order?.total || 0).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={order?.orderStatus}
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
                                <SelectItem value="delivered">
                                  Delivered
                                </SelectItem>
                                <SelectItem value="cancelled">
                                  Cancelled
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`capitalize ${
                                order.paymentStatus === "paid"
                                  ? "bg-green-100 text-green-800"
                                  : order.paymentStatus === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {order.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                              >
                                <Eye className="h-4 w-4" />
                                <span className="ml-1 hidden sm:inline">
                                  View
                                </span>
                              </Button>
                              {order.orderStatus === "pending" && (
                                <Button
                                  size="sm"
                                  className="bg-amber-700 hover:bg-amber-800 text-white h-8 px-2"
                                  onClick={() =>
                                    handleStatusUpdate(order._id, "processing")
                                  }
                                >
                                  {updateStatusMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    "Process"
                                  )}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order._id} className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500">
                    #{order._id.slice(-8).toUpperCase()}
                  </span>
                  <Badge className="capitalize">{order.orderStatus}</Badge>
                </div>
                <div className="text-sm font-semibold mb-1">
                  ${(order.total || 0).toFixed(2)}
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  {order?.buyerId?.name} •{" "}
                  {new Date(order?.createdAt).toLocaleDateString()}
                </div>
                <div className="space-y-1 text-xs text-gray-700 mb-3">
                  {order?.items?.slice(0, 2).map((item) => (
                    <div key={item._id}>
                      {item.title} (x{item.quantity})
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <div className="text-gray-500">
                      +{order.items.length - 2} more
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <Select
                    value={order.orderStatus}
                    onValueChange={(value) =>
                      handleStatusUpdate(order._id, value)
                    }
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    className="bg-amber-700 hover:bg-amber-800 text-white h-8 px-2"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default OrdersReceived;
