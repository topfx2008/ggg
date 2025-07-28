import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MessageSquare } from "lucide-react";
import Header from "@/components/header";
import MessagingInterface from "@/components/messaging-interface";
import type { Order } from "@shared/schema";

export default function Messages() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    staleTime: 2 * 60 * 1000,
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex h-96">
            <div className="w-1/3 border-r">
              <Skeleton className="h-full w-full" />
            </div>
            <div className="flex-1">
              <Skeleton className="h-full w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredOrders = orders?.filter(order => {
    if (!searchQuery) return true;
    return order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];

  const selectedOrder = selectedOrderId ? 
    orders?.find(order => order.id === selectedOrderId) : 
    null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Communicate with your clients and sellers</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex h-96">
            {/* Conversations Sidebar */}
            <div className="w-1/3 bg-gray-50 border-r flex flex-col">
              <div className="p-4 border-b bg-white">
                <h3 className="font-semibold text-gray-900 mb-3">Conversations</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {ordersLoading ? (
                  <div className="p-4 space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="mb-2">No conversations yet</p>
                    <p className="text-sm">Start communicating with your orders</p>
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`p-4 border-b hover:bg-gray-100 cursor-pointer transition-colors ${
                        selectedOrderId === order.id ? 'bg-blue-50 border-l-4 border-l-primary' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {order.buyerId === user?.id ? 'S' : 'C'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {order.buyerId === user?.id ? 'Seller' : 'Customer'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(order.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 truncate mb-1">
                            {order.title}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant={order.status === 'completed' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {order.status.replace('_', ' ')}
                            </Badge>
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedOrderId ? (
                <MessagingInterface 
                  orderId={selectedOrderId} 
                  order={selectedOrder}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center bg-white">
                  <div className="text-center text-gray-500">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-sm">
                      Choose a conversation from the sidebar to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
