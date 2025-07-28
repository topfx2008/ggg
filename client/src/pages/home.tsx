import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  ShoppingCart, 
  MessageSquare, 
  Star,
  DollarSign,
  Users,
  Package,
  Activity
} from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/header";
import ServiceCard from "@/components/service-card";
import DashboardStats from "@/components/dashboard-stats";
import type { Service, Order } from "@shared/schema";

export default function Home() {
  const { user } = useAuth();
  
  const { data: recentServices, isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
    staleTime: 5 * 60 * 1000,
  });

  const { data: myOrders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    staleTime: 2 * 60 * 1000,
  });

  const { data: sellerStats } = useQuery({
    queryKey: ["/api/analytics/seller"],
    staleTime: 5 * 60 * 1000,
  });

  const { data: unreadCount } = useQuery<number>({
    queryKey: ["/api/messages/unread"],
    staleTime: 30 * 1000,
  });

  const featuredServices = recentServices?.slice(0, 6) || [];
  const recentOrders = myOrders?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.first_name || "User"}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your account today.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Orders</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {myOrders?.filter(order => order.status === 'in_progress' || order.status === 'pending').length || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                  <p className="text-2xl font-bold text-gray-900">{unreadCount || 0}</p>
                </div>
                <div className="h-12 w-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${myOrders?.reduce((sum, order) => sum + Number(order.price), 0).toFixed(2) || "0.00"}
                  </p>
                </div>
                <div className="h-12 w-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {myOrders?.filter(order => order.status === 'completed').length || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Orders</CardTitle>
                <Link href="/orders">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="mb-4">No orders yet</p>
                    <Link href="/services">
                      <Button>Browse Services</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{order.title}</p>
                            <p className="text-sm text-gray-500">Order #{order.orderNumber}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={
                              order.status === 'completed' ? 'default' :
                              order.status === 'in_progress' ? 'secondary' :
                              order.status === 'pending' ? 'outline' : 'destructive'
                            }
                          >
                            {order.status.replace('_', ' ')}
                          </Badge>
                          <p className="text-sm text-gray-500 mt-1">${order.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/services">
                  <Button className="w-full justify-start" variant="outline">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Browse Services
                  </Button>
                </Link>
                <Link href="/messages">
                  <Button className="w-full justify-start" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Messages {unreadCount ? `(${unreadCount})` : ''}
                  </Button>
                </Link>
                <Link href="/orders">
                  <Button className="w-full justify-start" variant="outline">
                    <Package className="h-4 w-4 mr-2" />
                    My Orders
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button className="w-full justify-start" variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Seller Stats (if user is a seller) */}
            {sellerStats && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Seller Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <DashboardStats stats={sellerStats || { totalOrders: 0, completedOrders: 0, totalEarnings: 0, averageRating: 0, activeServices: 0 }} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Recommended Services */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
            <Link href="/services">
              <Button variant="ghost">View All</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicesLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              featuredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
