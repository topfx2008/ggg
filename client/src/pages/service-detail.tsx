import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { 
  Star, 
  Clock, 
  RefreshCw, 
  Shield, 
  Heart,
  Share2,
  ShoppingCart,
  MessageSquare,
  Award,
  CheckCircle,
  Calendar
} from "lucide-react";
import Header from "@/components/header";
import type { Service, Review, User } from "@shared/schema";

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState("");

  const { data: service, isLoading } = useQuery<Service>({
    queryKey: ["/api/services", slug],
    enabled: !!slug,
  });

  const { data: seller } = useQuery<User>({
    queryKey: ["/api/users", service?.sellerId],
    enabled: !!service?.sellerId,
  });

  const { data: reviews } = useQuery<Review[]>({
    queryKey: ["/api/services", service?.id, "reviews"],
    enabled: !!service?.id,
  });

  const { data: serviceRating } = useQuery({
    queryKey: ["/api/services", service?.id, "rating"],
    enabled: !!service?.id,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Order Created",
        description: "Your order has been created successfully!",
      });
      setIsOrderDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateOrder = () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }

    if (!service) return;

    createOrderMutation.mutate({
      serviceId: service.id,
      sellerId: service.sellerId,
      title: service.title,
      description: orderDetails,
      price: service.price,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full mb-6" />
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div>
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-24 mb-4" />
                  <Skeleton className="h-12 w-full mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h1>
              <p className="text-gray-600">The service you're looking for doesn't exist.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const averageRating = serviceRating?.averageRating || 0;
  const totalReviews = serviceRating?.totalReviews || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Service Gallery */}
            <div className="mb-8">
              <img
                src={service.featuredImage || "https://images.unsplash.com/photo-1626785774573-4b799315345d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"}
                alt={service.title}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
              
              {service.gallery && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {(service.gallery as string[]).slice(0, 4).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Service Info */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary" className="mb-2">
                  {service.category}
                </Badge>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{service.title}</h1>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={seller?.profileImageUrl} />
                    <AvatarFallback>
                      {seller?.firstName?.[0]}{seller?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">
                      {seller?.firstName} {seller?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">Seller</p>
                  </div>
                </div>
                
                {totalReviews > 0 && (
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    <span className="font-medium">{averageRating.toFixed(1)}</span>
                    <span className="text-gray-500 ml-1">({totalReviews} reviews)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="description" className="mb-8">
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({totalReviews})</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="prose max-w-none">
                      {service.description.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-6">
                  {reviews?.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                        <p className="text-gray-500">Be the first to review this service</p>
                      </CardContent>
                    </Card>
                  ) : (
                    reviews?.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarFallback>
                                  {review.reviewerId[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-gray-900">Customer</p>
                                <div className="flex items-center">
                                  <div className="flex text-yellow-400 mr-2">
                                    {Array.from({ length: review.rating }).map((_, i) => (
                                      <Star key={i} className="h-4 w-4 fill-current" />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-500">
                                    {new Date(review.createdAt || 0).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="faq" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">How long does delivery take?</h4>
                        <p className="text-gray-700">{service.deliveryTime} days</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">How many revisions are included?</h4>
                        <p className="text-gray-700">{service.revisions} revisions</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Do you provide source files?</h4>
                        <p className="text-gray-700">Yes, all source files are included in the delivery.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div>
            {/* Order Card */}
            <Card className="sticky top-4 mb-6">
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    ${service.price}
                  </div>
                  <p className="text-gray-600">{service.shortDescription}</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {service.deliveryTime} days delivery
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {service.revisions} revisions
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Shield className="h-4 w-4 mr-2" />
                    Money-back guarantee
                  </div>
                </div>

                <div className="space-y-3">
                  <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" size="lg">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Continue (${service.price})
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Place Your Order</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="requirements">Project Requirements</Label>
                          <Textarea
                            id="requirements"
                            placeholder="Describe your project requirements..."
                            value={orderDetails}
                            onChange={(e) => setOrderDetails(e.target.value)}
                            rows={4}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Total:</span>
                          <span className="text-2xl font-bold">${service.price}</span>
                        </div>
                        <Button 
                          onClick={handleCreateOrder}
                          disabled={createOrderMutation.isPending}
                          className="w-full"
                        >
                          {createOrderMutation.isPending ? "Creating Order..." : "Place Order"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Seller
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle>About the Seller</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  <Avatar className="h-16 w-16 mr-4">
                    <AvatarImage src={seller?.profileImageUrl} />
                    <AvatarFallback className="text-lg">
                      {seller?.firstName?.[0]}{seller?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {seller?.firstName} {seller?.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">Professional Seller</p>
                    {totalReviews > 0 && (
                      <div className="flex items-center mt-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
                        <span className="text-sm text-gray-500 ml-1">({totalReviews})</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center text-gray-600">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Verified seller
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Award className="h-4 w-4 mr-2 text-yellow-500" />
                    Top rated seller
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Member since {new Date(seller?.createdAt || '').getFullYear()}
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-4">
                  View Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
