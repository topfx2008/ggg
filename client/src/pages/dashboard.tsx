import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DollarSign, 
  Package, 
  Star, 
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import Header from "@/components/header";
import DashboardStats from "@/components/dashboard-stats";
import OrderManagement from "@/components/order-management";
import type { Order } from "@shared/schema";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

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

  const { data: sellerStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/seller"],
    staleTime: 5 * 60 * 1000,
    enabled: isAuthenticated,
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders", { role: "seller", limit: 10 }],
    staleTime: 2 * 60 * 1000,
    enabled: isAuthenticated,
  });

  const { data: myServices } = useQuery({
    queryKey: ["/api/my-services"],
    staleTime: 5 * 60 * 1000,
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-16 mb-4" />
                  <Skeleton className="h-6 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  const stats = sellerStats || {
    totalOrders: 0,
    completedOrders: 0,
    totalEarnings: 0,
    averageRating: 0,
    activeServices: 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Seller Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.first_name || "Seller"}! Here's your business overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${(stats as any).totalEarnings?.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-sm text-green-600">+12% from last month</p>
                </div>
                <div className="h-12 w-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Orders</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {recentOrders?.filter(order => order.status === 'in_progress').length || 0}
                  </p>
                  <p className="text-sm text-blue-600">
                    {(stats as any).totalOrders || 0} total orders
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {((stats as any).averageRating?.toFixed(1) || '0.0')}
                  </p>
                  <p className="text-sm text-yellow-600">
                    Based on customer reviews
                  </p>
                </div>
                <div className="h-12 w-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Services</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(stats as any).activeServices || 0}
                  </p>
                  <p className="text-sm text-purple-600">
                    {(myServices as any)?.length || 0} total services
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderManagement orders={recentOrders || []} />
              </CardContent>
            </Card>
          </div>

          {/* Performance Analytics */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <DashboardStats stats={stats} />
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">Completed Orders</span>
                  </div>
                  <span className="font-medium">{stats.completedOrders}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm">In Progress</span>
                  </div>
                  <span className="font-medium">
                    {recentOrders?.filter(order => order.status === 'in_progress').length || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                    <span className="text-sm">Pending</span>
                  </div>
                  <span className="font-medium">
                    {recentOrders?.filter(order => order.status === 'pending').length || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Earnings Chart */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Earnings Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Earnings chart will be displayed here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
