import { useState } from "react";
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
import { Calendar, Eye } from "lucide-react";

const OrdersReceived = () => {
  const [orders] = useState([
    {
      id: "ORD87654",
      products: "Wireless Headphones (x1), Protective Case (x1)",
      customer: "Alice Wonderland",
      amount: "$120.00",
      status: "Pending",
      date: "2024-07-20",
    },
    {
      id: "ORD87653",
      products: "Smartwatch (x1)",
      customer: "Bob The Builder",
      amount: "$299.99",
      status: "Shipped",
      date: "2024-07-19",
    },
    {
      id: "ORD87652",
      products: "Ergonomic Keyboard (x1), Gaming Mouse (x1), Mouse Pad (x1)",
      customer: "Charlie Chaplin",
      amount: "$185.50",
      status: "Delivered",
      date: "2024-07-18",
    },
    {
      id: "ORD87651",
      products: "Portable SSD 1TB (x1)",
      customer: "Diana Prince",
      amount: "$89.99",
      status: "Cancelled",
      date: "2024-07-17",
    },
    {
      id: "ORD87650",
      products: "4K Monitor (x1), HDMI Cable (x2)",
      customer: "Ethan Hunt",
      amount: "$450.00",
      status: "Pending",
      date: "2024-07-16",
    },
  ]);

  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [dateRange, setDateRange] = useState("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-blue-100 text-blue-800";
      case "Shipped":
        return "bg-purple-100 text-purple-800";
      case "Pending":
        return "bg-gray-100 text-gray-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    console.log(`Update order ${orderId} to ${newStatus}`);
    // Implement status update functionality
  };

  const filteredOrders = orders.filter((order) => {
    if (selectedStatus !== "All Statuses" && order.status !== selectedStatus) {
      return false;
    }
    // Add date range filtering logic here if needed
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders Received</h1>
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
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
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
                  <TableHead className="w-24">Date</TableHead>
                  <TableHead className="w-40">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-xs">
                      #{order.id}
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="truncate" title={order.products}>
                        {order.products}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="truncate" title={order.customer}>
                        {order.customer}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-sm">
                      {order.amount}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value) =>
                          handleStatusUpdate(order.id, value)
                        }
                      >
                        <SelectTrigger className="w-24 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Shipped">Shipped</SelectItem>
                          <SelectItem value="Delivered">Delivered</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm">{order.date}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <Eye className="h-3 w-3" />
                          <span className="hidden sm:inline ml-1 text-xs">
                            View
                          </span>
                        </Button>
                        {order.status === "Pending" && (
                          <Button
                            size="sm"
                            className="bg-amber-700 hover:bg-amber-800 text-white h-8 px-2 text-xs"
                            onClick={() =>
                              handleStatusUpdate(order.id, "Shipped")
                            }
                          >
                            <span className="hidden sm:inline">Ship</span>
                            <span className="sm:hidden">✓</span>
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
  );
};

export default OrdersReceived;
