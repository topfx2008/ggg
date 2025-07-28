import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Package, 
  Clock, 
  DollarSign, 
  MessageSquare, 
  Download,
  Star,
  Calendar,
  User,
  AlertCircle
} from "lucide-react";
import Header from "@/components/header";
import type { Order } from "@shared/schema";

export default function Orders() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: buyerOrders, isLoading: buyerOrdersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders", { role: "buyer" }],
    staleTime: 2 * 60 * 1000,
    enabled: isAuthenticated,
  });

  const { data: sellerOrders, isLoading: sellerOrdersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders", { role: "seller" }],
    staleTime: 2 * 60 * 1000,
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <Skeleton className="h-10 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'revision':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filterOrders = (orders: Order[] = []) => {
    if (statusFilter === "all") return orders;
    return orders.filter(order => order.status === statusFilter);
  };

  const OrderCard = ({ order, role }: { order: Order; role: 'buyer' | 'seller' }) => (
    <Card key={order.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{order.title}</h4>
              <p className="text-sm text-gray-500">#{order.orderNumber}</p>
            </div>
          </div>
          <Badge className={getStatusColor(order.status || 'pending')}>
            {(order.status || 'pending').replace('_', ' ')}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <DollarSign className="h-4 w-4 mr-2" />
            ${order.price}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            {new Date(order.createdAt || 0).toLocaleDateString()}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <User className="h-4 w-4 mr-2" />
            {role === 'buyer' ? 'Seller' : 'Customer'}
          </div>
        </div>

        {order.dueDate && (
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <Clock className="h-4 w-4 mr-2" />
            Due: {new Date(order.dueDate || 0).toLocaleDateString()}
          </div>
        )}

        {order.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {order.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {order.status === 'completed' && order.rating && (
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                <span className="text-sm font-medium">{order.rating}/5</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
            {order.status === 'completed' && (
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
            <Button size="sm">
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = ({ role }: { role: 'buyer' | 'seller' }) => (
    <div className="text-center py-12">
      <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No orders yet
      </h3>
      <p className="text-gray-500 mb-6">
        {role === 'buyer' 
          ? "You haven't placed any orders yet. Browse our services to get started!"
          : "You haven't received any orders yet. Make sure your services are active and visible."}
      </p>
      <Button asChild>
        <a href={role === 'buyer' ? '/services' : '/dashboard'}>
          {role === 'buyer' ? 'Browse Services' : 'Go to Dashboard'}
        </a>
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
            <p className="text-gray-600">Manage your orders and track progress</p>
          </div>

          <div className="flex items-center space-x-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="revision">Revision</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="buying">
              Buying ({buyerOrders?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="selling">
              Selling ({sellerOrders?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Orders I'm Buying
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {buyerOrdersLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                      ))}
                    </div>
                  ) : !buyerOrders || buyerOrders.length === 0 ? (
                    <EmptyState role="buyer" />
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {filterOrders(buyerOrders).slice(0, 5).map((order) => (
                        <div key={order.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{order.title}</h4>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">#{order.orderNumber} • ${order.price}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Orders I'm Selling
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sellerOrdersLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                      ))}
                    </div>
                  ) : !sellerOrders || sellerOrders.length === 0 ? (
                    <EmptyState role="seller" />
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {filterOrders(sellerOrders).slice(0, 5).map((order) => (
                        <div key={order.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{order.title}</h4>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">#{order.orderNumber} • ${order.price}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="buying" className="space-y-6">
            {buyerOrdersLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-24 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : !buyerOrders || filterOrders(buyerOrders).length === 0 ? (
              <EmptyState role="buyer" />
            ) : (
              <div className="space-y-6">
                {filterOrders(buyerOrders).map((order) => (
                  <OrderCard key={order.id} order={order} role="buyer" />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="selling" className="space-y-6">
            {sellerOrdersLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-24 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : !sellerOrders || filterOrders(sellerOrders).length === 0 ? (
              <EmptyState role="seller" />
            ) : (
              <div className="space-y-6">
                {filterOrders(sellerOrders).map((order) => (
                  <OrderCard key={order.id} order={order} role="seller" />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
